"""
Gemini API 키 진단 스크립트
"""
import sys
import os

# UTF-8 설정
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print("=" * 50)
print("Gemini API Key Diagnostic")
print("=" * 50)

# 1. API 키 확인
api_key = os.environ.get("GEMINI_API_KEY", "")
print(f"\n[1] 환경변수 GEMINI_API_KEY: {'SET' if api_key else 'NOT SET'}")

if not api_key:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    print(f"    .env 경로: {env_path}")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    print(f"    .env에서 키 로드됨")
                    break

if not api_key:
    print("    [ERROR] API 키를 찾을 수 없습니다!")
    sys.exit(1)

print(f"    키 길이: {len(api_key)}")
print(f"    키 시작: {api_key[:8]}...")
print(f"    키 끝: ...{api_key[-4:]}")
print(f"    키 repr: {repr(api_key)}")

# 숨겨진 문자 확인
hidden = [c for c in api_key if not c.isalnum() and c not in '-_']
if hidden:
    print(f"    [WARN] 숨겨진 문자 발견: {[hex(ord(c)) for c in hidden]}")

# 2. google-generativeai 패키지 확인
print(f"\n[2] google-generativeai 패키지 확인")
try:
    import google.generativeai as genai
    print(f"    버전: {genai.__version__ if hasattr(genai, '__version__') else 'unknown'}")
except ImportError:
    print("    [ERROR] google-generativeai가 설치되지 않았습니다!")
    print("    설치: pip install google-generativeai")
    sys.exit(1)

# 3. API 키 설정 + 모델 목록 조회
print(f"\n[3] API 설정 및 모델 목록 조회")
try:
    genai.configure(api_key=api_key)
    models = genai.list_models()
    embed_models = [m.name for m in models if 'embed' in m.name.lower()]
    print(f"    모델 조회 성공!")
    print(f"    임베딩 모델: {embed_models}")
except Exception as e:
    print(f"    [ERROR] 모델 조회 실패: {e}")

# 4. 간단한 임베딩 테스트
print(f"\n[4] 임베딩 테스트 (text-embedding-004)")
try:
    result = genai.embed_content(
        model="models/text-embedding-004",
        content="경제학 테스트",
        task_type="retrieval_document"
    )
    emb = result['embedding']
    print(f"    임베딩 성공! 차원: {len(emb)}")
    print(f"    샘플: [{emb[0]:.6f}, {emb[1]:.6f}, ...]")
except Exception as e:
    print(f"    [ERROR] 임베딩 실패: {e}")
    
    # 대체 모델 시도
    print(f"\n[4b] 대체 모델 시도 (embedding-001)")
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content="경제학 테스트",
            task_type="retrieval_document"
        )
        emb = result['embedding']
        print(f"    embedding-001 성공! 차원: {len(emb)}")
    except Exception as e2:
        print(f"    [ERROR] embedding-001도 실패: {e2}")

# 5. 간단한 생성 테스트
print(f"\n[5] 텍스트 생성 테스트 (gemini-2.0-flash)")
try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Say hello in Korean, one word only.")
    print(f"    생성 성공: {response.text.strip()}")
except Exception as e:
    print(f"    [ERROR] 생성 실패: {e}")

# 6. urllib로 직접 API 호출 테스트
print(f"\n[6] 직접 HTTP 요청 테스트")
try:
    import urllib.request
    import json
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        model_names = [m['name'] for m in data.get('models', [])[:5]]
        print(f"    HTTP 직접 호출 성공!")
        print(f"    모델 수: {len(data.get('models', []))}")
        print(f"    샘플: {model_names}")
except Exception as e:
    print(f"    [ERROR] HTTP 호출 실패: {e}")

print(f"\n{'=' * 50}")
print("진단 완료")
