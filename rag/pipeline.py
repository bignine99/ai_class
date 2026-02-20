"""
맨큐의 경제학 - RAG 파이프라인
===============================
PDF 추출 → 텍스트 청킹 → Gemini 임베딩 → ChromaDB 저장

사용법:
  python rag/pipeline.py                          # 전체 파이프라인 실행
  python rag/pipeline.py --step extract           # PDF 텍스트 추출만
  python rag/pipeline.py --step chunk             # 텍스트 청킹만
  python rag/pipeline.py --step embed             # 임베딩 + DB 저장만
  python rag/pipeline.py --api-key YOUR_KEY       # API 키 직접 지정
"""

import os
import sys
import json
import re
import time
import argparse
import hashlib
from pathlib import Path

# Windows에서 UTF-8 출력 설정
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# ── 경로 설정 ──
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DB_DIR = BASE_DIR / ".raw_db"
RAG_DIR = BASE_DIR / "rag"
DATA_DIR = RAG_DIR / "data"
CHROMA_DIR = RAG_DIR / "chroma_db"

# ── 청킹 설정 ──
CHUNK_SIZE = 800       # 청크 크기 (문자)
CHUNK_OVERLAP = 150    # 오버랩 (문자)
MIN_CHUNK_SIZE = 100   # 최소 청크 크기

# ── 임베딩 설정 ──
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_BATCH_SIZE = 50   # Gemini API 배치 크기
EMBEDDING_RATE_LIMIT = 0.5  # API 호출 간 대기시간 (초)


def step1_extract_pdfs():
    """Step 1: PDF 파일에서 텍스트 추출"""
    print("\n" + "=" * 60)
    print("📄 Step 1: PDF 텍스트 추출")
    print("=" * 60)

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    pdf_files = sorted(RAW_DB_DIR.glob("*.pdf"))
    if not pdf_files:
        print("❌ PDF 파일을 찾을 수 없습니다:", RAW_DB_DIR)
        return False

    print(f"📁 발견된 PDF: {len(pdf_files)}개")

    # pdfplumber로 텍스트 추출
    try:
        import pdfplumber
    except ImportError:
        print("❌ pdfplumber 설치 필요: pip install pdfplumber")
        return False

    all_pages = []
    total_chars = 0

    for pdf_path in pdf_files:
        print(f"\n📖 처리 중: {pdf_path.name}")
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if not text or len(text.strip()) < 20:
                        continue

                    # 텍스트 정제
                    text = clean_text(text)
                    
                    # 페이지 번호 추정 (파일명에서)
                    # 예: 001-100.pdf → 1~100
                    page_range = pdf_path.stem.split("-")
                    if len(page_range) == 2:
                        start_page = int(page_range[0])
                        estimated_page = start_page + page_idx
                    else:
                        estimated_page = page_idx + 1

                    page_data = {
                        "source_file": pdf_path.name,
                        "page_index": page_idx,
                        "estimated_page": estimated_page,
                        "text": text,
                        "char_count": len(text)
                    }
                    all_pages.append(page_data)
                    total_chars += len(text)

                print(f"   ✅ {len(pdf.pages)}페이지 처리 완료")
        except Exception as e:
            print(f"   ❌ 오류: {e}")
            continue

    # 결과 저장
    output_path = DATA_DIR / "extracted_pages.jsonl"
    with open(output_path, "w", encoding="utf-8") as f:
        for page in all_pages:
            f.write(json.dumps(page, ensure_ascii=False) + "\n")

    print(f"\n{'─' * 40}")
    print(f"📊 추출 결과:")
    print(f"   총 페이지: {len(all_pages)}개")
    print(f"   총 문자 수: {total_chars:,}자")
    print(f"   저장 위치: {output_path}")
    return True


def clean_text(text):
    """텍스트 정제"""
    # 불필요한 공백 정리
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 페이지 헤더/푸터 패턴 제거 (숫자만 있는 줄)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
    # 연속 공백 정리
    text = re.sub(r' {3,}', '  ', text)
    # 앞뒤 공백 제거
    text = text.strip()
    return text


def step2_chunk_text():
    """Step 2: 텍스트 청킹"""
    print("\n" + "=" * 60)
    print("✂️  Step 2: 텍스트 청킹")
    print("=" * 60)

    pages_path = DATA_DIR / "extracted_pages.jsonl"
    if not pages_path.exists():
        print("❌ 추출된 페이지 파일이 없습니다. Step 1을 먼저 실행하세요.")
        return False

    # 페이지 로드
    pages = []
    with open(pages_path, "r", encoding="utf-8") as f:
        for line in f:
            pages.append(json.loads(line.strip()))

    print(f"📄 로드된 페이지: {len(pages)}개")

    # 챕터 감지를 위한 패턴
    chapter_patterns = [
        re.compile(r'(?:제?\s*)?(\d{1,2})\s*[장편]\s*[.:]?\s*(.+)', re.MULTILINE),
        re.compile(r'CHAPTER\s*(\d{1,2})\s*[.:]?\s*(.+)', re.IGNORECASE | re.MULTILINE),
        re.compile(r'(?:Part|파트)\s*(\d{1,2})\s*[.:]?\s*(.+)', re.IGNORECASE | re.MULTILINE),
    ]

    chunks = []
    current_chapter = "Unknown"
    current_part = "Unknown"
    chunk_id = 0

    for page in pages:
        text = page["text"]
        
        # 챕터/파트 감지
        for pattern in chapter_patterns:
            match = pattern.search(text[:200])  # 페이지 상단에서만 검색
            if match:
                num = match.group(1)
                title = match.group(2).strip()
                if '장' in pattern.pattern or 'CHAPTER' in pattern.pattern.upper():
                    current_chapter = f"Chapter {num}: {title}"
                else:
                    current_part = f"Part {num}: {title}"
                break

        # 텍스트를 청크로 분할
        page_chunks = create_chunks(
            text,
            chunk_size=CHUNK_SIZE,
            overlap=CHUNK_OVERLAP,
            min_size=MIN_CHUNK_SIZE
        )

        for chunk_text in page_chunks:
            chunk_id += 1
            chunk_data = {
                "id": f"chunk_{chunk_id:05d}",
                "text": chunk_text,
                "metadata": {
                    "source_file": page["source_file"],
                    "estimated_page": page["estimated_page"],
                    "chapter": current_chapter,
                    "part": current_part,
                    "char_count": len(chunk_text),
                    "chunk_index": chunk_id
                }
            }
            chunks.append(chunk_data)

    # 결과 저장
    output_path = DATA_DIR / "chunks.jsonl"
    with open(output_path, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    # 통계
    avg_size = sum(c["metadata"]["char_count"] for c in chunks) / len(chunks) if chunks else 0
    
    print(f"\n{'─' * 40}")
    print(f"📊 청킹 결과:")
    print(f"   총 청크 수: {len(chunks):,}개")
    print(f"   평균 크기: {avg_size:.0f}자")
    print(f"   청크 크기: {CHUNK_SIZE}자 / 오버랩: {CHUNK_OVERLAP}자")
    print(f"   저장 위치: {output_path}")
    return True


def create_chunks(text, chunk_size=800, overlap=150, min_size=100):
    """텍스트를 청크로 분할 (문장 경계 고려)"""
    if len(text) <= chunk_size:
        return [text] if len(text) >= min_size else []

    chunks = []
    
    # 문장 분리 (한국어 + 영어)
    sentences = re.split(r'(?<=[.!?。]\s)|(?<=\n\n)', text)
    
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += " " + sentence if current_chunk else sentence
        else:
            if len(current_chunk) >= min_size:
                chunks.append(current_chunk.strip())
            
            # 오버랩 처리: 이전 청크의 마지막 부분을 다음 청크 시작에 포함
            if overlap > 0 and current_chunk:
                overlap_text = current_chunk[-overlap:]
                current_chunk = overlap_text + " " + sentence
            else:
                current_chunk = sentence

    # 마지막 청크
    if current_chunk and len(current_chunk) >= min_size:
        chunks.append(current_chunk.strip())

    return chunks


def step3_build_vectordb(api_key=None):
    """Step 3: 임베딩 생성 + ChromaDB 저장 (재시작 가능)"""
    print("\n" + "=" * 60)
    print("Step 3: 임베딩 생성 + ChromaDB 저장")
    print("=" * 60)

    # API 키 확인 (.env 우선 → 환경변수 → 인자)
    if not api_key:
        # 1순위: .env 파일
        env_path = BASE_DIR / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY=") or line.strip().startswith("GOOGLE_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        print(f"   .env에서 API 키 로드됨")
                        break
    
    if not api_key:
        # 2순위: 환경변수
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        print("[ERROR] Gemini API 키가 필요합니다.")
        print("   다음 중 하나의 방법으로 설정하세요:")
        print("   1) python rag/pipeline.py --api-key YOUR_KEY")
        print("   2) 환경변수: set GEMINI_API_KEY=YOUR_KEY")
        print("   3) .env 파일: GEMINI_API_KEY=YOUR_KEY")
        return False

    # 청크 로드
    chunks_path = DATA_DIR / "chunks.jsonl"
    if not chunks_path.exists():
        print("[ERROR] 청크 파일이 없습니다. Step 2를 먼저 실행하세요.")
        return False

    chunks = []
    with open(chunks_path, "r", encoding="utf-8") as f:
        for line in f:
            chunks.append(json.loads(line.strip()))

    print(f"   로드된 청크: {len(chunks):,}개")

    # Gemini API 연결 확인 (직접 HTTP 호출 사용 — deprecated 라이브러리 우회)
    import urllib.request
    import urllib.error

    def embed_texts(texts_list, api_key_val):
        """Gemini REST API로 직접 임베딩 생성 (배치)"""
        model_name = EMBEDDING_MODEL.replace("models/", "")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:batchEmbedContents?key={api_key_val}"
        
        requests_body = []
        for text in texts_list:
            requests_body.append({
                "model": EMBEDDING_MODEL,
                "content": {"parts": [{"text": text}]},
                "taskType": "RETRIEVAL_DOCUMENT"
            })
        
        payload = json.dumps({"requests": requests_body}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, method="POST")
        req.add_header("Content-Type", "application/json")
        
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode())
            return [item["values"] for item in data["embeddings"]]
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            raise Exception(f"HTTP {e.code}: {body[:300]}")

    def embed_single(text, api_key_val):
        """Gemini REST API로 단일 텍스트 임베딩"""
        model_name = EMBEDDING_MODEL.replace("models/", "")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:embedContent?key={api_key_val}"
        
        payload = json.dumps({
            "model": EMBEDDING_MODEL,
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_DOCUMENT"
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, method="POST")
        req.add_header("Content-Type", "application/json")
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            return data["embedding"]["values"]
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            raise Exception(f"HTTP {e.code}: {body[:300]}")

    # 연결 테스트
    print(f"   [DEBUG] API key: {repr(api_key[:8])}...{repr(api_key[-4:])}, len={len(api_key)}")
    try:
        test_emb = embed_single("test", api_key)
        print(f"   Gemini Embedding API 연결 성공 (차원: {len(test_emb)}, 모델: {EMBEDDING_MODEL})")
    except Exception as e:
        print(f"[ERROR] Gemini Embedding API 연결 실패: {e}")
        return False

    # ChromaDB 설정
    try:
        import chromadb
        from chromadb.config import Settings
    except ImportError:
        print("[ERROR] chromadb 설치 필요: pip install chromadb")
        return False

    # ChromaDB 클라이언트 생성
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    
    # 컬렉션 가져오기 (있으면 재사용, 없으면 생성) — 재시작 지원
    collection_name = "mankiw_economics"
    try:
        collection = client.get_collection(collection_name)
        existing_count = collection.count()
        print(f"   기존 컬렉션 발견: {existing_count:,}개 문서")
    except Exception:
        collection = client.create_collection(
            name=collection_name,
            metadata={"description": "맨큐의 경제학 제9판 교과서 벡터 DB"}
        )
        existing_count = 0
        print(f"   새 컬렉션 생성됨: {collection_name}")

    # 이미 임베딩된 청크 ID 확인 (재시작 지원)
    existing_ids = set()
    if existing_count > 0:
        try:
            stored = collection.get(include=[])
            existing_ids = set(stored['ids'])
            print(f"   이미 임베딩된 청크: {len(existing_ids):,}개 (건너뜁니다)")
        except Exception as e:
            print(f"   기존 ID 조회 실패: {e}")

    # 임베딩할 청크 필터링
    remaining_chunks = [c for c in chunks if c['id'] not in existing_ids]
    
    if not remaining_chunks:
        print("\n   모든 청크가 이미 임베딩되어 있습니다!")
        print(f"   DB 크기: {collection.count():,}개 문서")
        return True

    print(f"   임베딩할 청크: {len(remaining_chunks):,}개 (전체 {len(chunks):,}개 중)")

    # 배치 임베딩 생성 + DB 저장
    batch_size = 20
    rate_limit = 1.2
    total_batches = (len(remaining_chunks) + batch_size - 1) // batch_size
    embedded_count = 0
    error_count = 0
    consecutive_errors = 0

    for batch_idx in range(0, len(remaining_chunks), batch_size):
        batch = remaining_chunks[batch_idx:batch_idx + batch_size]
        batch_num = batch_idx // batch_size + 1
        
        texts = [c["text"] for c in batch]
        ids = [c["id"] for c in batch]
        metadatas = [c["metadata"] for c in batch]

        try:
            # REST API로 임베딩 생성
            embeddings = embed_texts(texts, api_key)

            # ChromaDB에 저장
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas
            )
            embedded_count += len(batch)
            consecutive_errors = 0
            
            # 진행률 표시
            total_done = len(existing_ids) + embedded_count
            pct = (batch_num / total_batches) * 100
            bar = ">" * int(pct // 2.5) + "-" * (40 - int(pct // 2.5))
            print(f"\r   [{bar}] {pct:.1f}% ({total_done:,}/{len(chunks):,})", end="", flush=True)

            # Rate limit 대기
            if batch_idx + batch_size < len(remaining_chunks):
                time.sleep(rate_limit)

        except Exception as e:
            error_count += 1
            consecutive_errors += 1
            error_msg = str(e)
            print(f"\n   [WARN] 배치 {batch_num} 오류: {error_msg[:100]}")
            
            if consecutive_errors >= 5:
                print(f"\n   [ERROR] 연속 {consecutive_errors}번 오류 발생. 중단합니다.")
                print(f"   현재까지 {len(existing_ids) + embedded_count:,}개 임베딩 완료 (재시작 가능)")
                break
            
            wait_time = min(2 ** consecutive_errors, 60)
            print(f"   {wait_time}초 대기 후 개별 재시도...")
            time.sleep(wait_time)
            
            # 개별 처리로 재시도
            for i, chunk in enumerate(batch):
                try:
                    emb = embed_single(chunk["text"], api_key)
                    collection.add(
                        ids=[chunk["id"]],
                        embeddings=[emb],
                        documents=[chunk["text"]],
                        metadatas=[chunk["metadata"]]
                    )
                    embedded_count += 1
                    consecutive_errors = 0
                    time.sleep(0.5)
                except Exception as e2:
                    print(f"\n   [FAIL] 청크 {chunk['id']}: {str(e2)[:80]}")

    final_count = collection.count()
    print(f"\n\n{'─' * 40}")
    print(f"   임베딩 결과:")
    print(f"   이번 세션 성공: {embedded_count:,}개")
    print(f"   이전 세션 포함: {final_count:,}개")
    print(f"   오류 배치: {error_count}개")
    print(f"   DB 위치: {CHROMA_DIR}")
    print(f"   컬렉션: {collection_name}")
    
    # 메타데이터 저장
    meta = {
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_chunks": final_count,
        "target_chunks": len(chunks),
        "embedding_model": EMBEDDING_MODEL,
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "source_files": [f.name for f in sorted(RAW_DB_DIR.glob("*.pdf"))],
        "complete": final_count >= len(chunks)
    }
    meta_path = CHROMA_DIR / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    if final_count < len(chunks):
        print(f"\n   [INFO] {len(chunks) - final_count:,}개 청크가 남았습니다.")
        print(f"   다시 실행하면 이어서 처리됩니다: python rag/pipeline.py --step embed")

    return True


def test_query(query="수요와 공급의 균형", api_key=None):
    """벡터 DB 테스트 쿼리"""
    print(f"\n🔍 테스트 쿼리: \"{query}\"")
    print("─" * 40)

    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        env_path = BASE_DIR / ".env"
        if env_path.exists():
            with open(env_path, "r") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY=") or line.strip().startswith("GOOGLE_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break

    if not api_key:
        print("❌ API 키가 없습니다.")
        return

    import google.generativeai as genai
    import chromadb

    genai.configure(api_key=api_key)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = client.get_collection("mankiw_economics")

    # 쿼리 임베딩 생성
    query_result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=query,
        task_type="retrieval_query"
    )

    # 유사 문서 검색
    results = collection.query(
        query_embeddings=[query_result['embedding']],
        n_results=5
    )

    print(f"\n📋 상위 5개 결과:")
    for i, (doc, meta, dist) in enumerate(zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0]
    )):
        print(f"\n  [{i+1}] (유사도: {1-dist:.4f})")
        print(f"      📍 {meta.get('source_file', 'N/A')} · p.{meta.get('estimated_page', 'N/A')}")
        print(f"      📖 {meta.get('chapter', 'N/A')}")
        print(f"      📝 {doc[:150]}...")


def main():
    parser = argparse.ArgumentParser(description="맨큐의 경제학 RAG 파이프라인")
    parser.add_argument("--step", choices=["extract", "chunk", "embed", "test", "all"],
                       default="all", help="실행할 단계")
    parser.add_argument("--api-key", type=str, help="Gemini API 키")
    parser.add_argument("--query", type=str, default="수요와 공급의 균형",
                       help="테스트 쿼리 (--step test 사용 시)")
    args = parser.parse_args()

    print("╔════════════════════════════════════════╗")
    print("║  맨큐의 경제학 RAG 파이프라인           ║")
    print("║  PDF → 청킹 → 임베딩 → ChromaDB       ║")
    print("╚════════════════════════════════════════╝")
    print(f"\n📁 프로젝트: {BASE_DIR}")
    print(f"📁 PDF 원본: {RAW_DB_DIR}")
    print(f"📁 데이터: {DATA_DIR}")
    print(f"📁 벡터DB: {CHROMA_DIR}")

    start_time = time.time()
    success = True

    if args.step in ("extract", "all"):
        success = step1_extract_pdfs()
        if not success and args.step == "all":
            print("❌ PDF 추출 실패. 파이프라인을 중단합니다.")
            return

    if args.step in ("chunk", "all"):
        success = step2_chunk_text()
        if not success and args.step == "all":
            print("❌ 청킹 실패. 파이프라인을 중단합니다.")
            return

    if args.step in ("embed", "all"):
        success = step3_build_vectordb(api_key=args.api_key)

    if args.step == "test":
        test_query(query=args.query, api_key=args.api_key)

    elapsed = time.time() - start_time
    print(f"\n⏱️  총 소요 시간: {elapsed:.1f}초")
    print("✅ 파이프라인 완료!" if success else "❌ 파이프라인에 오류가 있었습니다.")


if __name__ == "__main__":
    main()
