"""
맨큐의 경제학 - RAG API 서버
==============================
ChromaDB + Gemini API 기반 RAG 서버

사용법:
  python rag/server.py                          # 기본 실행 (port 5000)
  python rag/server.py --port 8080              # 포트 지정
  python rag/server.py --api-key YOUR_KEY       # API 키 지정

API 엔드포인트:
  POST /api/search    - 교과서 검색
  POST /api/quiz      - 퀴즈 문제 생성
  POST /api/exam      - 시험문제 생성
  POST /api/lecture    - 강의자료 생성
  POST /api/report    - 보고서 초안 생성
  POST /api/chat      - 일반 질의응답
  GET  /api/status    - 서버 상태 확인
  POST /api/set-key   - API 키 설정
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import traceback

# ── 경로 설정 ──
BASE_DIR = Path(__file__).resolve().parent.parent
CHROMA_DIR = BASE_DIR / "rag" / "chroma_db"
EMBEDDING_MODEL = "models/gemini-embedding-001"
GENERATION_MODEL = "gemini-2.0-flash"

# ── 전역 상태 ──
api_key = None
genai = None
chroma_client = None
collection = None


def embed_query_rest(query_text, key):
    """Gemini REST API로 쿼리 임베딩 생성 (deprecated 라이브러리 우회)"""
    import urllib.request
    model_name = EMBEDDING_MODEL.replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:embedContent?key={key}"
    
    payload = json.dumps({
        "model": EMBEDDING_MODEL,
        "content": {"parts": [{"text": query_text}]},
        "taskType": "RETRIEVAL_QUERY"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
    
    return data["embedding"]["values"]


def init_services(key=None):
    """서비스 초기화"""
    global api_key, genai, chroma_client, collection

    # API 키 설정 (.env 우선 → 환경변수)
    if key:
        api_key = key
    elif not api_key:
        # 1순위: .env 파일
        env_path = BASE_DIR / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                        api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        print(f"   .env에서 API 키 로드됨")
                        break
        # 2순위: 환경변수
        if not api_key:
            api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    # Gemini API 초기화 (텍스트 생성용 — 임베딩은 REST API 직접 호출)
    if api_key:
        try:
            import google.generativeai as _genai
            genai = _genai
            genai.configure(api_key=api_key)
            print(f"   Gemini API 연결됨 (생성: {GENERATION_MODEL})")
        except Exception as e:
            print(f"   [WARN] Gemini API 초기화 오류: {e}")
            genai = None

    # ChromaDB 초기화
    if CHROMA_DIR.exists():
        try:
            import chromadb
            chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
            collection = chroma_client.get_collection("mankiw_economics")
            print(f"   ChromaDB 연결됨 ({collection.count():,}개 문서)")
        except Exception as e:
            print(f"   [WARN] ChromaDB 초기화 오류: {e}")
            collection = None
    else:
        print(f"   [WARN] ChromaDB 디렉토리 없음: {CHROMA_DIR}")
        print(f"   먼저 python rag/pipeline.py 를 실행하세요.")


def search_vectordb(query, n_results=5, where_filter=None):
    """벡터 DB에서 관련 청크 검색 (REST API 임베딩 사용)"""
    if not collection or not api_key:
        return []

    try:
        # REST API로 쿼리 임베딩 생성
        query_embedding = embed_query_rest(query, api_key)

        # 검색 파라미터
        search_params = {
            "query_embeddings": [query_embedding],
            "n_results": n_results,
        }
        if where_filter:
            search_params["where"] = where_filter

        results = collection.query(**search_params)

        # 결과 정리
        docs = []
        for i in range(len(results['documents'][0])):
            docs.append({
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i],
                "similarity": round(1 - results['distances'][0][i], 4)
            })
        return docs

    except Exception as e:
        print(f"검색 오류: {e}")
        return []


def generate_with_context(query, context_docs, system_prompt, temperature=0.7):
    """Gemini API로 컨텍스트 기반 응답 생성"""
    if not genai:
        return {"error": "Gemini API가 설정되지 않았습니다. API 키를 확인해주세요."}

    try:
        # 컨텍스트 구성
        context_parts = []
        for i, doc in enumerate(context_docs):
            meta = doc["metadata"]
            context_parts.append(
                f"[출처 {i+1}: {meta.get('source_file', 'N/A')} p.{meta.get('estimated_page', 'N/A')} "
                f"({meta.get('chapter', 'N/A')})]\n{doc['text']}"
            )
        context_text = "\n\n---\n\n".join(context_parts)

        # 프롬프트 구성
        full_prompt = f"""{system_prompt}

## 교과서 참고 자료 (맨큐의 경제학 제10판)
{context_text}

## 사용자 요청
{query}
"""

        model = genai.GenerativeModel(
            GENERATION_MODEL,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 4096,
            }
        )
        response = model.generate_content(full_prompt)
        
        return {
            "response": response.text,
            "sources": [
                {
                    "file": doc["metadata"].get("source_file", ""),
                    "page": doc["metadata"].get("estimated_page", ""),
                    "chapter": doc["metadata"].get("chapter", ""),
                    "similarity": doc.get("similarity", 0),
                    "preview": doc["text"][:200] + "..."
                }
                for doc in context_docs
            ]
        }

    except Exception as e:
        return {"error": f"생성 오류: {str(e)}"}


# ── API 핸들러들 ──

def handle_search(body):
    """교과서 자료 검색"""
    query = body.get("query", "")
    n_results = body.get("n_results", 8)

    if not query:
        return {"error": "검색어를 입력해주세요."}

    docs = search_vectordb(query, n_results=n_results)
    
    if not docs:
        return {"results": [], "message": "검색 결과가 없습니다."}

    # Gemini로 요약 생성
    result = generate_with_context(
        query=f"'{query}'에 대해 교과서 내용을 기반으로 정리해주세요.",
        context_docs=docs,
        system_prompt="""당신은 맨큐의 경제학 제10판의 교과서 도우미입니다.
제공된 교과서 참고 자료만을 기반으로 답변하세요.
교과서에 없는 내용은 추측하지 마세요.
핵심 개념, 정의, 예시를 포함하여 학생이 이해하기 쉽게 설명해주세요.
한국어로 답변하세요.""",
        temperature=0.3
    )

    result["query"] = query
    result["raw_results"] = [
        {
            "text": doc["text"][:300],
            "page": doc["metadata"].get("estimated_page"),
            "chapter": doc["metadata"].get("chapter"),
            "similarity": doc.get("similarity", 0)
        }
        for doc in docs
    ]
    return result


def handle_quiz(body):
    """연습 문제 생성"""
    topic = body.get("topic", "")
    chapter = body.get("chapter", "")
    count = body.get("count", 5)
    question_types = body.get("types", ["multiple", "tf", "short"])

    query = topic if topic else f"{chapter} 관련 핵심 개념"
    docs = search_vectordb(query, n_results=6)

    if not docs:
        return {"error": "관련 내용을 찾을 수 없습니다."}

    type_str = ", ".join({
        "multiple": "객관식(4지선다)", 
        "tf": "참/거짓",
        "short": "단답형"
    }.get(t, t) for t in question_types)

    result = generate_with_context(
        query=f"'{query}'에 대한 연습문제 {count}개를 만들어주세요. 문제 유형: {type_str}",
        context_docs=docs,
        system_prompt=f"""당신은 경제학 교수로서 맨큐의 경제학 제10판을 기반으로 연습문제를 출제합니다.

규칙:
1. 반드시 제공된 교과서 내용에 기반한 문제만 출제하세요.
2. 각 문제에는 정답과 상세한 해설을 포함하세요.
3. 요청된 문제 유형({type_str})을 사용하세요.
4. 난이도를 다양하게 구성하세요.
5. JSON 형식으로 출력하세요.

출력 형식:
```json
{{
  "questions": [
    {{
      "id": 1,
      "type": "multiple",
      "question": "문제 내용",
      "options": ["①선택지1", "②선택지2", "③선택지3", "④선택지4"],
      "answer": 0,
      "explanation": "상세 해설"
    }}
  ]
}}
```

참/거짓 문제는 answer를 true/false로, 단답형은 answer를 문자열로 작성하세요.
한국어로 작성하세요.""",
        temperature=0.5
    )

    return result


def handle_exam(body):
    """시험문제 생성"""
    chapters = body.get("chapters", [])
    count = body.get("count", 10)
    difficulty = body.get("difficulty", "medium")
    question_types = body.get("types", ["multiple", "tf", "short"])

    # 챕터별 검색
    all_docs = []
    for ch in chapters[:5]:  # 최대 5개 챕터
        docs = search_vectordb(f"Chapter {ch} 핵심 개념과 이론", n_results=3)
        all_docs.extend(docs)

    if not all_docs:
        # 일반 검색
        all_docs = search_vectordb("경제학 핵심 개념 이론 분석", n_results=10)

    if not all_docs:
        return {"error": "관련 내용을 찾을 수 없습니다."}

    diff_label = {"easy": "쉬움(기본 개념)", "medium": "보통(응용)", "hard": "어려움(심화)", "mixed": "혼합"}.get(difficulty, "보통")
    type_str = ", ".join({
        "multiple": "객관식(4지선다)", "tf": "참/거짓", "short": "단답형", "essay": "서술형"
    }.get(t, t) for t in question_types)

    result = generate_with_context(
        query=f"맨큐의 경제학 시험문제 {count}개 출제. 난이도: {diff_label}, 유형: {type_str}",
        context_docs=all_docs[:10],
        system_prompt=f"""당신은 대학교 경제학 교수입니다. 맨큐의 경제학 제10판을 기반으로 시험문제를 출제합니다.

규칙:
1. 반드시 제공된 교과서 내용에 기반한 문제만 출제하세요.
2. 난이도: {diff_label}
3. 문제 유형: {type_str}
4. 총 {count}문제를 출제하세요.
5. 각 문제에 정답과 상세한 해설을 포함하세요.
6. 다양한 주제와 챕터를 커버하세요.

반드시 아래 JSON 형식으로 출력하세요:
```json
{{
  "exam_title": "시험 제목",
  "total_questions": {count},
  "questions": [
    {{
      "id": 1,
      "type": "multiple",
      "difficulty": "medium",
      "chapter": "관련 챕터",
      "question": "문제 내용",
      "options": ["①선택지1", "②선택지2", "③선택지3", "④선택지4"],
      "answer": 0,
      "explanation": "상세 해설"
    }}
  ]
}}
```
한국어로 작성하세요.""",
        temperature=0.6
    )

    return result


def handle_lecture(body):
    """강의자료 생성"""
    chapter = body.get("chapter", "")
    topic = body.get("topic", "")
    format_type = body.get("format", "notes")  # notes, slides, discussion

    query = topic if topic else f"Chapter {chapter}"
    docs = search_vectordb(query, n_results=8)

    if not docs:
        return {"error": "관련 내용을 찾을 수 없습니다."}

    format_instructions = {
        "notes": "강의 노트 형식으로 작성하세요. 핵심 개념 정의, 상세 설명, 예시, 그래프 설명을 포함하세요.",
        "slides": "프레젠테이션 슬라이드 구성안을 작성하세요. 각 슬라이드의 제목과 핵심 내용을 포함하세요.",
        "discussion": "토론 주제와 진행 방법을 제시하세요. 찬반 토론, 사례 분석, 시사 연결 주제를 포함하세요.",
        "overview": "수업 개요를 작성하세요. 학습 목표, 수업 진행표(시간대별 활동), 준비물을 포함하세요."
    }.get(format_type, "강의 노트 형식으로 작성하세요.")

    result = generate_with_context(
        query=f"'{query}'에 대한 강의자료를 만들어주세요.",
        context_docs=docs,
        system_prompt=f"""당신은 대학교 경제학 교수로서 맨큐의 경제학 제10판을 기반으로 강의자료를 작성합니다.

{format_instructions}

규칙:
1. 반드시 제공된 교과서 내용에 기반하여 작성하세요.
2. 학생들이 이해하기 쉽도록 명확하게 설명하세요.
3. 실생활 예시와 한국 경제 관련 사례를 포함하세요.
4. Markdown 형식으로 구조화하여 작성하세요.
5. 한국어로 작성하세요.""",
        temperature=0.5
    )

    return result


def handle_report(body):
    """보고서 초안 생성"""
    topic = body.get("topic", "")
    chapter = body.get("chapter", "")
    report_type = body.get("type", "analysis")
    length = body.get("length", "medium")

    query = topic if topic else f"Chapter {chapter} 관련 경제학 분석"
    docs = search_vectordb(query, n_results=10)

    if not docs:
        return {"error": "관련 내용을 찾을 수 없습니다."}

    type_label = {
        "analysis": "분석 보고서", "comparison": "비교 분석 보고서",
        "case": "사례 연구 보고서", "policy": "정책 제언 보고서",
        "literature": "문헌 조사 보고서"
    }.get(report_type, "분석 보고서")

    length_guide = {
        "short": "A4 2-3매 분량 (약 2000-3000자)",
        "medium": "A4 5-7매 분량 (약 5000-7000자)",
        "long": "A4 10매 이상 분량 (약 10000자 이상)"
    }.get(length, "A4 5-7매 분량")

    result = generate_with_context(
        query=f"'{topic}'에 대한 {type_label} 작성",
        context_docs=docs,
        system_prompt=f"""당신은 경제학 교수로서 학생의 보고서 작성을 도와줍니다.
맨큐의 경제학 제10판의 내용을 기반으로 학술 보고서를 작성하세요.

보고서 유형: {type_label}
분량: {length_guide}

보고서 구성:
1. 제목
2. 목차
3. I. 서론 (연구 배경 및 목적, 연구 범위 및 방법)
4. II. 이론적 배경 (핵심 이론 정리, 관련 개념 분석)
5. III. 본론 (현황 분석, 경제학적 분석, 사례 및 데이터)
6. IV. 결론 (요약 및 시사점, 한계 및 후속 연구 방향)
7. 참고문헌

규칙:
1. 반드시 교과서 내용에 기반하여 이론적 배경을 작성하세요.
2. 교과서에서 직접 인용할 때는 출처를 명시하세요.
3. 학술적이고 객관적인 톤으로 작성하세요.
4. 한국 경제 관련 사례와 데이터를 포함하세요.
5. Markdown 형식으로 작성하세요.
6. 한국어로 작성하세요.""",
        temperature=0.6
    )

    return result


def handle_chat(body):
    """일반 질의응답"""
    query = body.get("query", "")
    if not query:
        return {"error": "질문을 입력해주세요."}

    docs = search_vectordb(query, n_results=5)

    if not docs:
        return {"error": "관련 내용을 찾을 수 없습니다. 다른 질문을 해보세요."}

    result = generate_with_context(
        query=query,
        context_docs=docs,
        system_prompt="""당신은 맨큐의 경제학 제10판 전문 교과서 도우미입니다.

규칙:
1. 반드시 제공된 교과서 참고 자료에 기반하여 답변하세요.
2. 교과서에 없는 내용은 "교과서에서 직접 다루지 않는 내용입니다"라고 명시하세요.
3. 학생이 이해하기 쉽게 설명하세요.
4. 관련 개념, 정의, 예시를 포함하세요.
5. 관련 챕터와 페이지를 안내하세요.
6. 한국어로 답변하세요.""",
        temperature=0.4
    )

    return result


def handle_set_key(body):
    """API 키 설정"""
    new_key = body.get("api_key", "")
    if not new_key:
        return {"error": "API 키를 입력해주세요."}

    init_services(key=new_key)
    
    if genai and collection:
        return {"status": "ok", "message": "API 키가 설정되었습니다.", "db_count": collection.count()}
    elif genai:
        return {"status": "partial", "message": "API 키가 설정되었으나 ChromaDB가 초기화되지 않았습니다."}
    else:
        return {"error": "API 키 설정에 실패했습니다."}


def handle_status():
    """서버 상태 확인"""
    db_count = collection.count() if collection else 0
    meta_path = CHROMA_DIR / "metadata.json"
    meta = {}
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

    return {
        "status": "ok",
        "gemini_api": "connected" if genai and api_key else "not_configured",
        "chromadb": "connected" if collection else "not_available",
        "document_count": db_count,
        "embedding_model": EMBEDDING_MODEL,
        "generation_model": GENERATION_MODEL,
        "metadata": meta,
        "api_key_set": bool(api_key)
    }


# ── HTTP 서버 ──

class RAGHandler(SimpleHTTPRequestHandler):
    """RAG API 요청 핸들러"""

    def __init__(self, *args, **kwargs):
        # 정적 파일 서빙을 위한 디렉토리 설정
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        """GET 요청 처리"""
        parsed = urlparse(self.path)
        
        if parsed.path == "/api/status":
            self.send_json(handle_status())
        else:
            # 정적 파일 서빙
            super().do_GET()

    def do_POST(self):
        """POST 요청 처리"""
        parsed = urlparse(self.path)
        
        # 요청 본문 읽기
        content_length = int(self.headers.get('Content-Length', 0))
        body = {}
        if content_length > 0:
            try:
                body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            except json.JSONDecodeError:
                self.send_json({"error": "잘못된 JSON 형식입니다."}, 400)
                return

        # 라우팅
        routes = {
            "/api/search": handle_search,
            "/api/quiz": handle_quiz,
            "/api/exam": handle_exam,
            "/api/lecture": handle_lecture,
            "/api/report": handle_report,
            "/api/chat": handle_chat,
            "/api/set-key": handle_set_key,
        }

        handler = routes.get(parsed.path)
        if handler:
            try:
                result = handler(body)
                self.send_json(result)
            except Exception as e:
                traceback.print_exc()
                self.send_json({"error": f"서버 오류: {str(e)}"}, 500)
        else:
            self.send_json({"error": f"알 수 없는 경로: {parsed.path}"}, 404)

    def send_json(self, data, status=200):
        """JSON 응답 전송"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))

    def send_cors_headers(self):
        """CORS 헤더"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def log_message(self, format, *args):
        """로그 형식 커스텀"""
        method = args[0].split()[0] if args else ""
        path = args[0].split()[1] if args and len(args[0].split()) > 1 else ""
        status = args[1] if len(args) > 1 else ""
        
        if path.startswith("/api/"):
            print(f"  [API] {method} {path} -> {status}")
        # 정적 파일 요청은 로그 생략


def main():
    parser = argparse.ArgumentParser(description="맨큐의 경제학 RAG API 서버")
    parser.add_argument("--port", type=int, default=5000, help="서버 포트")
    parser.add_argument("--api-key", type=str, help="Gemini API 키")
    args = parser.parse_args()

    print("+--------------------------------------------+")
    print("|  Mankiw Economics - RAG API Server         |")
    print("|  ChromaDB + Gemini API                     |")
    print("+--------------------------------------------+")

    # 서비스 초기화
    init_services(key=args.api_key)

    # 서버 시작
    server = HTTPServer(('localhost', args.port), RAGHandler)
    
    print(f"\n[START] Server: http://localhost:{args.port}")
    print(f"[FILES] Static: {BASE_DIR}")
    print(f"[API]   Status: http://localhost:{args.port}/api/status")
    print(f"\n[INFO]  Press Ctrl+C to stop.\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n[STOP] Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
