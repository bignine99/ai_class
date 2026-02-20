"""
Embedding REST API 상세 진단
"""
import json, sys, os
import urllib.request, urllib.error

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# API 키 로드
api_key = None
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("GEMINI_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                break

if not api_key:
    print("API 키를 찾을 수 없습니다!")
    sys.exit(1)

print(f"API Key: {api_key[:8]}...{api_key[-4:]}")
print(f"API Key length: {len(api_key)}")
print()

# 테스트 1: 모델 정보 조회
print("=" * 50)
print("[TEST 1] gemini-embedding-001 모델 정보")
print("=" * 50)
try:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001?key={api_key}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print(f"  Name: {data.get('name')}")
        print(f"  Methods: {data.get('supportedGenerationMethods')}")
        print(f"  Input limit: {data.get('inputTokenLimit')}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  ERROR {e.code}: {body[:300]}")
except Exception as e:
    print(f"  ERROR: {e}")

# 테스트 2: embedContent 호출
print()
print("=" * 50)
print("[TEST 2] embedContent (gemini-embedding-001)")
print("=" * 50)
try:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
    payload = json.dumps({
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": "Hello world"}]},
        "taskType": "RETRIEVAL_DOCUMENT"
    }).encode("utf-8")
    
    print(f"  URL: {url[:80]}...")
    print(f"  Payload: {payload.decode()[:200]}")
    
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        values = data.get("embedding", {}).get("values", [])
        print(f"  SUCCESS! Dimension: {len(values)}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  HTTP ERROR {e.code}: {body[:500]}")
except Exception as e:
    print(f"  ERROR: {e}")

# 테스트 3: v1 대신 v1beta 시도
print()
print("=" * 50)
print("[TEST 3] embedContent (v1 API)")
print("=" * 50)
try:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key={api_key}"
    payload = json.dumps({
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": "Hello world"}]},
        "taskType": "RETRIEVAL_DOCUMENT"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        values = data.get("embedding", {}).get("values", [])
        print(f"  SUCCESS! Dimension: {len(values)}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  HTTP ERROR {e.code}: {body[:500]}")
except Exception as e:
    print(f"  ERROR: {e}")

# 테스트 4: text-embedding-004 시도 (v1)
print()
print("=" * 50)
print("[TEST 4] embedContent (text-embedding-004, v1)")
print("=" * 50)
try:
    url = f"https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key={api_key}"
    payload = json.dumps({
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": "Hello world"}]},
        "taskType": "RETRIEVAL_DOCUMENT"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        values = data.get("embedding", {}).get("values", [])
        print(f"  SUCCESS! Dimension: {len(values)}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  HTTP ERROR {e.code}: {body[:500]}")
except Exception as e:
    print(f"  ERROR: {e}")

# 테스트 5: 최소한의 payload
print()
print("=" * 50)
print("[TEST 5] 최소 embedContent payload")
print("=" * 50)
try:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={api_key}"
    payload = json.dumps({
        "content": {"parts": [{"text": "test"}]}
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        values = data.get("embedding", {}).get("values", [])
        print(f"  SUCCESS! Dimension: {len(values)}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  HTTP ERROR {e.code}: {body[:500]}")
except Exception as e:
    print(f"  ERROR: {e}")

# 테스트 6: google.genai (새 라이브러리) 시도
print()
print("=" * 50)
print("[TEST 6] google.genai (새 라이브러리) 확인")
print("=" * 50)
try:
    from google import genai
    client = genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents="Hello world"
    )
    print(f"  SUCCESS! google.genai 임베딩 성공")
    print(f"  Dimension: {len(result.embeddings[0].values)}")
except ImportError:
    print("  google-genai 패키지 미설치")
    print("  설치: pip install google-genai")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 50)
print("진단 완료")
