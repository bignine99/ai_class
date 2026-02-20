# 개발 수정 프로세스 및 오류 해결 로그 (Development & Modification Processes)
**Date:** 2026-02-19
**Project:** ClassAI - Mankiw's Principles of Economics Platform
**Author:** Antigravity (AI Agent)

---

## 1. 개요 (Overview)
본 문서는 `ClassAI` 플랫폼의 사용자 경험(UX) 및 인터페이스(UI)를 대폭 개선하고, 새로운 기능을 추가하며 발생한 오류를 해결하는 과정을 상세히 기록합니다. 주요 작업은 랜딩 페이지의 심미적 업그레이드, AI 튜터 위젯 구현, 그리고 각 기능 페이지의 초기 로딩 상태 개선에 초점을 맞추었습니다.

---

## 2. 주요 개발 내역 (Key Developments)

### 2.1. Hero Section 리디자인 (Landing & Index)
*   **목표:** 기존의 정적인 Hero 섹션을 역동적이고 프리미엄한 디자인으로 변경.
*   **수정 사항:**
    *   **레이아웃:** Flexbox를 활용하여 텍스트와 이미지의 균형을 맞춘 중앙 정렬(Centered Split) 레이아웃 적용.
    *   **3D Book Cover:** `perspective`와 `rotateY`를 사용하여 마우스 호버 시 책이 입체적으로 회전하는 효과 구현.
    *   **Clickable Interaction:** 책 표지를 클릭하면 교보문고 구매 페이지로 이동하도록 `<a>` 태그 래핑 및 호버 시 `Cursor: pointer` 적용.
    *   **Ref:** `index.html`, `css/style.css`

### 2.2. 아이콘 시스템 업그레이드
*   **목표:** "지루한" 이모지(Emoji)를 전문적인 FontAwesome 아이콘으로 교체.
*   **수정 사항:**
    *   **Syllabus Cards:** 강의 계획서의 책, 목표, 일정 아이콘을 `fa-book`, `fa-bullseye`, `fa-calendar` 등으로 교체.
    *   **Styling:** 아이콘에 테마 컬러(`var(--primary-500)`)를 적용하여 브랜드 일관성 확보.
    *   **Ref:** `index.html`, `css/style.css`

### 2.3. 무한 로고 마키 (Infinite Logo Marquee)
*   **목표:** 파트너 대학 및 기업 로고를 지속적으로 흐르게 하여 플랫폼의 신뢰도 증대.
*   **구현:**
    *   **HTML:** 로고 트랙을 두 번 복제하여 끊김 없는(Seamless) 루프 구조 생성.
    *   **CSS Animation:** `@keyframes marquee-scroll`을 정의하여 X축으로 -50%까지 무한 이동(`infinite linear`).
    *   **Overlay:** 양쪽 끝에 `mask-image` 또는 그라디언트 오버레이를 추가하여 자연스럽게 사라지는 효과 연출.
    *   **Ref:** `landing.html`, `css/landing.css`

### 2.4. 플로팅 AI 튜터 (Floating AI Tutor)
*   **목표:** 사용자가 언제든 AI에게 질문할 수 있는 접근성 높은 챗봇 위젯 구현.
*   **구현 (단계별):**
    1.  **V1 (Basic):** 단순한 로봇 아이콘 버튼과 토글 기능 구현.
    2.  **V2 (Interactive Logic):** 채팅창 UI(Header, Body, Input) 구현 및 `JS`로 간단한 대화 로직(키워드 감지) 추가.
    3.  **V3 (Enhanced Visuals):** 
        *   버튼 크기 확대 (64px → 72px)
        *   **Pulse Effect:** `::after` 가상 요소를 활용한 파동 애니메이션 추가.
        *   **Floating Animation:** 위젯 전체가 둥둥 떠다니는 `float-widget` 애니메이션 적용.
        *   **Tooltip:** "AI에게 질문해보세요! 👋" 말풍선 힌트 추가.
    *   **Ref:** `landing.html`, `css/landing.css`

---

## 3. 오류 수정 및 트러블슈팅 (Troubleshooting)

### 3.1. 페이지 진입 시 빈 화면 문제 (Empty State Fix)
*   **문제 상황:** `Search`, `Practice`, `Lecture`, `Report` 페이지 진입 시, 챕터를 선택하기 전까지 우측 콘텐츠 영역이 비어있어 사용자 경험이 저해됨.
*   **원인:** URL 파라미터(`?chapter=X`)가 없을 경우 초기화 로직이 실행되지 않도록 설계되어 있었음.
*   **해결책:** `DOMContentLoaded` 이벤트 리스너에서 파라미터가 없을 경우, 강제로 **Chapter 1**을 로드하도록 `else` 분기 추가.
    *   **대상 파일:** `search.html`, `practice.html`, `lecture.html`, `report.html`

### 3.2. `exam.html` 스크립트 오류
*   **문제 상황:** `Practice` 페이지의 수정 패턴을 `exam.html`에 일괄 적용하는 과정에서, `generateExam()` 함수 내부에 부적절한 코드(`chParam` 참조 오류)가 삽입됨.
*   **원인:** `exam.html`은 다른 페이지와 달리 2단 뷰어가 아닌 '설정 -> 생성' 구조였으나, 뷰어용 로직을 잘못 적용함.
*   **해결:** 잘못 삽입된 코드를 즉시 제거(Revert)하고, 원래의 로직 복구.

### 3.3. CSS 적용 실패 (Targeting Issue)
*   **문제 상황:** AI Tutor의 CSS를 전면 교체하려 했으나, AI 에이전트가 `TargetContent`를 정확히 찾지 못해 수정 실패.
*   **원인:** 공백, 줄바꿈 등의 미세한 차이로 인한 매칭 실패.
*   **해결:** `view_file`로 정확한 라인 컨텍스트를 파악한 후, 더 넓은 범위(주석부터 끝까지)를 타겟으로 지정하여 덮어쓰기 성공.

---

## 4. 최종 결과 (Result) — 2026-02-19
*   **디자인:** Glassmorphism과 Gradient가 조화된 현대적인 UI 완성.
*   **기능:** 정적 페이지에서 동적 상호작용(AI 채팅, 로고 스크롤)이 가능한 플랫폼으로 진화.
*   **안정성:** 모든 서브 페이지에서 초기 콘텐츠가 로드되도록 보장하여 UX 개선.

---

## 5. 2026-02-20 개발 내역

### 5.1. 버그 수정 (Bug Fixes)

#### 5.1.1. 교과서 판수 불일치 수정
*   **문제:** `lecture.html`과 `rag/server.py`의 시스템 프롬프트에서 "제9판"으로 참조되고 있었으나, 나머지 프로젝트는 "제10판"을 사용.
*   **해결:** 전체 7개소의 "제9판"을 "제10판"으로 일괄 수정.
*   **대상 파일:** `lecture.html` (1개소), `rag/server.py` (6개소)

#### 5.1.2. `common.js` 함수 덮어쓰기 버그
*   **문제:** `common.js`에 중복 정의된 `getAllChapters()`와 `getChapter()` 함수가 `data.js`의 enriched 버전을 덮어써서 `partId`, `partTitle`이 `undefined`로 표시됨.
*   **증상:** Search, Practice, Lecture 등 페이지에서 "Part undefined" 표시.
*   **해결:** `common.js`에서 중복 함수 정의 제거. `data.js`의 원본 함수가 `partId`, `partTitle`을 올바르게 주입하도록 보장.
*   **대상 파일:** `js/common.js` (30줄 제거)

#### 5.1.3. RAG 서버 Windows 인코딩 오류
*   **문제:** `rag/server.py` 실행 시 유니코드 박스 문자(╔═╗)와 이모지(🚀📡🛑)가 Windows cp949 콘솔에서 `UnicodeEncodeError` 발생.
*   **해결:** 모든 비ASCII 문자를 ASCII 호환 문자로 교체.
    *   `╔═╗` → `+---+`, `🚀` → `[START]`, `📡` → `[API]`, `🛑` → `[STOP]`
*   **대상 파일:** `rag/server.py` (print문 9개소)

### 5.2. 신규 기능 추가 (New Features)

#### 5.2.1. 보고서·과제 관리 통합 (report.html 전면 개편)
*   **목표:** 교수 관점에서 과제 생성 및 채점 기능 추가.
*   **구현:**
    *   기존 `report.html`을 **3개 탭 시스템**으로 재구성.
    *   **탭 1 — 보고서 작성:** 기존 기능 유지.
    *   **탭 2 — 과제 생성하기 (NEW):**
        *   6가지 과제 유형: 에세이, 사례분석, 비교분석, 토론문, 데이터분석, 정책제안서
        *   3단계 난이도 (기본/중급/심화)
        *   복수 챕터 선택, 제출기한 설정
        *   채점 기준표 자동 생성 (100점: 이론 30 + 분석 25 + 사례 20 + 논리 15 + 참고문헌 10)
        *   AI 사용 경고 문구 자동 포함
    *   **탭 3 — 과제 채점하기 (NEW):**
        *   PDF/TXT 파일 업로드 (드래그 앤 드롭)
        *   4가지 평가 항목: AI 작성 여부 탐지, 내용 충실도, 논리 구조, 참고문헌 적절성
        *   종합 성적 (A+~D) 및 상세 피드백 자동 생성
        *   현재는 시뮬레이션 모드 (향후 Gemini API 연동 예정)
*   **대상 파일:** `report.html` (전면 재작성), `js/report_app.js` (신규 생성, 420+ lines)

#### 5.2.2. 강의계획서 생성기 (syllabus.html 신규)
*   **목표:** PDF 강의자료를 업로드하면 16주 강의계획서를 자동 생성.
*   **구현 (3단계 UX):**
    *   **Step 1:** PDF 파일 업로드 (최대 10개 동시, 드래그 앤 드롭) 또는 기본 교과서 데이터 사용
    *   **Step 2:** 강좌 기본 정보 입력 (과목명, 교수, 학기, 학점, 시간, 성적 평가 기준)
    *   **Step 3:** 16주 강의계획서 인라인 편집
        *   주차별 주제, 수업 방법(8가지), 비고 직접 수정
        *   주차 순서 변경 (위/아래 이동), 주차 추가, 초기화
        *   인쇄 및 텍스트 파일 다운로드
*   **현재 상태:** 기존 교과서 데이터(`data.js`)를 기반으로 **템플릿 자동 생성**. 업로드된 PDF 분석 기능은 미구현 (→ 섹션 6 참조).
*   **대상 파일:** `syllabus.html` (신규), `js/syllabus_app.js` (신규, 350+ lines)

#### 5.2.3. 네비게이션 업데이트
*   **내용:** 전체 내비게이션에 `Syllabus` 링크를 `Dashboard` 바로 옆에 추가.
*   **대상 파일:** `js/common.js`

---

## 6. 향후 개발 로드맵: Syllabus RAG 파이프라인

> **현재 상태:** 시범 적용 단계. 기본 교과서 데이터 기반 템플릿 생성만 가능.
> **목표:** 사용자가 업로드한 PDF를 AI가 분석하여 맞춤형 16주 강의계획서를 자동 생성.

### 6.1. 전체 아키텍처

```
[사용자 PDF 업로드] → [텍스트 추출] → [청킹 & 임베딩] → [벡터 DB 저장]
                                                              ↓
[16주 강의계획서] ← [AI 주차 배분] ← [구조 분석] ← [RAG 검색/분석]
```

### 6.2. 구현 단계별 상세

#### Phase 1: PDF 텍스트 추출 엔진
*   **목표:** 업로드된 PDF에서 정확한 텍스트를 추출.
*   **기술:**
    *   `PyPDF2` 또는 `pdfplumber` (Python) — 기본 텍스트 추출
    *   `pdf2image` + `pytesseract` — 이미지 기반 PDF(스캔본)용 OCR 처리
*   **과제:**
    *   표, 수식, 그래프 등 비정형 컨텐츠 처리
    *   목차(TOC) 자동 인식 및 챕터 경계 판별
    *   다국어(한/영 혼용) 텍스트 정확도 확보
*   **출력:** `{ filename, pages: [{ page_num, text, estimated_chapter }] }`
*   **예상 소요:** 1~2일

#### Phase 2: 텍스트 청킹 및 벡터 임베딩
*   **목표:** 추출된 텍스트를 의미 단위로 분할하고 벡터화.
*   **기술:**
    *   청킹 전략: 500~1000 토큰 단위, 100 토큰 오버랩
    *   임베딩 모델: `Gemini text-embedding-004`
    *   메타데이터: `{ source_file, page_num, chunk_index, estimated_topic }`
*   **과제:**
    *   챕터/섹션 경계에서의 청킹 최적화
    *   10개 PDF 동시 처리 시 API Rate Limit 관리
    *   임베딩 생성 비용 및 시간 최적화 (배치 처리)
*   **예상 소요:** 1일

#### Phase 3: ChromaDB 벡터 저장소 구축
*   **목표:** 사용자별 임시 컬렉션에 벡터 데이터를 저장.
*   **기술:**
    *   ChromaDB `PersistentClient` (기존 `rag/pipeline.py` 확장)
    *   사용자별 세션 ID로 컬렉션 분리
*   **과제:**
    *   기존 교과서 DB와의 분리/병합 전략
    *   세션 만료 시 임시 컬렉션 자동 정리
    *   대용량 PDF(수백 페이지) 처리 시 메모리 관리
*   **예상 소요:** 0.5일

#### Phase 4: AI 구조 분석 및 주제 추출
*   **목표:** Gemini API를 활용하여 전체 문서의 구조를 파악하고 주제를 추출.
*   **기술:**
    *   Gemini `gemini-2.0-flash` 모델
    *   RAG 검색으로 관련 청크 수집 → 요약 프롬프트 전달
*   **프롬프트 전략:**
    ```
    당신은 대학 교수의 강의 설계를 돕는 AI입니다.
    아래 교재/강의자료의 내용을 분석하여:
    1. 주요 챕터/주제 목록을 추출하세요
    2. 각 주제의 난이도(기초/중급/심화)를 판별하세요
    3. 주제 간 선후관계(prerequisite)를 파악하세요
    4. 각 주제의 예상 수업 시간(45분 기준)을 추정하세요
    ```
*   **출력:** `[{ topic, subtopics, difficulty, prerequisites, estimated_hours }]`
*   **예상 소요:** 1일

#### Phase 5: 16주 자동 배분 알고리즘
*   **목표:** 추출된 주제를 16주 학기에 최적으로 배분.
*   **고려 요소:**
    *   주제 간 선후관계 (prerequisite가 있는 주제는 후순위)
    *   난이도 분산 (어려운 주제가 연속되지 않도록)
    *   주당 적정 분량 (3학점 기준: 주 3시간)
    *   중간고사(8주차), 기말고사(16주차) 고정 배치
    *   수업 방법 다양화 (강의 → 토론 → 발표 циклick)
*   **기술:**
    *   Gemini API에 구조화된 프롬프트 전달
    *   또는 Rule-based 알고리즘 + AI 미세 조정 하이브리드
*   **예상 소요:** 1일

#### Phase 6: 서버 API 및 프런트엔드 연동
*   **목표:** 위 파이프라인을 REST API로 제공하고 프런트엔드와 연동.
*   **API 엔드포인트:**
    *   `POST /api/syllabus/upload` — PDF 파일 업로드 및 텍스트 추출
    *   `POST /api/syllabus/analyze` — 구조 분석 및 주제 추출
    *   `POST /api/syllabus/generate` — 16주 강의계획서 생성
    *   `GET /api/syllabus/status` — 처리 진행 상태 조회 (비동기 처리)
*   **프런트엔드:**
    *   `syllabus_app.js`에서 기존 템플릿 생성 로직을 API 기반으로 전환
    *   업로드 → 분석 중(로딩) → 결과 표시 → 편집의 UX 플로우 유지
    *   진행률 표시 (프로그레스 바)
*   **예상 소요:** 1일

### 6.3. 필요 기술 스택 요약

| 구분 | 기술 | 용도 |
|------|------|------|
| PDF 파싱 | `pdfplumber`, `PyPDF2` | 텍스트 추출 |
| OCR | `pytesseract`, `pdf2image` | 스캔본 PDF 처리 |
| 임베딩 | `Gemini text-embedding-004` | 벡터 생성 |
| 벡터 DB | `ChromaDB` | 벡터 저장 및 유사도 검색 |
| LLM | `Gemini 2.0 Flash` | 구조 분석, 주제 추출, 주차 배분 |
| 서버 | `Python HTTPServer` (기존) | API 엔드포인트 |
| 프런트엔드 | `JavaScript` (기존) | UI 연동 |

### 6.4. 예상 총 소요 시간

| 단계 | 소요 시간 | 누적 |
|------|-----------|------|
| Phase 1: PDF 추출 | 1~2일 | 1~2일 |
| Phase 2: 청킹 & 임베딩 | 1일 | 2~3일 |
| Phase 3: 벡터 DB | 0.5일 | 2.5~3.5일 |
| Phase 4: AI 구조 분석 | 1일 | 3.5~4.5일 |
| Phase 5: 16주 배분 | 1일 | 4.5~5.5일 |
| Phase 6: API & 프런트엔드 | 1일 | 5.5~6.5일 |
| **테스트 & 디버깅** | **1~2일** | **6.5~8.5일** |

> **총 예상: 약 1~2주 (집중 개발 기준)**

### 6.5. 우선순위 및 트리거 조건

*   **현재 단계:** 시범 적용 — 기본 교과서 데이터 기반 템플릿 생성으로 운영.
*   **본격 개발 트리거:** 실제 사용자 수요가 확인되었을 때.
*   **MVP 전략:** Phase 1~3을 먼저 구현하여 "PDF → 주제 추출" 까지만 제공한 뒤 피드백 수집.

---

## 7. 배포 (Deployment)

### 7.1. GitHub 리포지토리
*   **URL:** https://github.com/bignine99/ai_class.git
*   **브랜치:** `main`
*   **커밋 메시지:** `Initial commit: ClassAI - Mankiw Economics Platform (Dashboard, Syllabus, Search, Practice, Exam, Lecture, Report with Assignment/Grading)`
*   **커밋 파일 수:** 25개
*   **.gitignore 제외 항목:**
    *   `.raw_db/` — 원본 PDF 파일 (용량 큼, 저작권)
    *   `rag/chroma_db/` — ChromaDB 벡터 데이터
    *   `rag/data/` — 텍스트 추출 데이터 (재생성 가능)
    *   `.env` — API 키 등 민감 정보

### 7.2. Vercel 프로덕션 배포
*   **프로젝트명:** `260219_ai_class`
*   **프로덕션 URL:** https://260219aiclass-n7bf1omy6-danny-chos-projects.vercel.app
*   **배포 방식:** 정적 사이트 호스팅 (빌드 불필요)
*   **라우팅 설정 (`vercel.json`):**
    *   루트 URL(`/`) → `landing.html`로 리다이렉트
    *   캐시 정책: `must-revalidate` (항상 최신 콘텐츠 제공)
*   **자동 배포:** GitHub `main` 브랜치와 연결됨 — `git push`만으로 자동 배포

---

## 8. RAG 아키텍처 제약사항 및 기능별 영향 분석

### 8.1. 현재 구조적 한계

```
[Vercel 프런트엔드]  ──→  localhost:5000  ──→  ❌ RAG 서버 없음
     (클라우드)              (사용자 로컬)
```

*   `rag_client.js`가 `localhost:5000`으로 API를 호출하는 구조.
*   Vercel은 **정적 호스팅** 전용이므로 Python 백엔드 서버를 실행할 수 없음.
*   따라서 RAG 서버가 필요한 AI 기능은 **Vercel 배포 환경에서 작동하지 않음**.
*   단, 로컬 환경에서 `python rag/server.py`를 실행하면 모든 기능 사용 가능.

### 8.2. 기능별 Vercel 배포 환경 영향

| 기능 | RAG 의존 | Vercel 작동 | 비고 |
|------|----------|-------------|------|
| 랜딩 페이지 | ❌ | ✅ 정상 | 완전한 정적 페이지 |
| 대시보드 (index) | ❌ | ✅ 정상 | `data.js` 기반 |
| 강의계획서 (syllabus) | ❌ | ✅ 정상 | 템플릿 기반 생성 |
| 챕터 검색 (search) | ❌ | ✅ 정상 | `data.js` 기반 |
| 연습문제 (practice) | ❌ | ✅ 정상 | `data.js` 기반 |
| 시험 생성 (exam) | 🔶 선택 | ⚠️ 기본만 | AI 생성 시 RAG 필요 |
| 강의자료 (lecture) | ✅ 필요 | ❌ 불가 | AI 생성 기능 |
| 보고서/과제 (report) | ✅ 필요 | ❌ 불가 | AI 생성/채점 기능 |
| AI 채팅 | ✅ 필요 | ❌ 불가 | Gemini API 연동 |

### 8.3. 향후 RAG 클라우드 운영 방안

| 방법 | 난이도 | 비용 | 적합 시나리오 |
|------|--------|------|--------------|
| **Vercel Serverless Functions** (Python) | 중 | 무료~저가 | 단순 API 프록시 |
| **Railway / Render** (Python 서버) | 중 | 월 $5~10 | 소규모 운영 |
| **Google Cloud Run** | 중상 | 종량제 | 대규모/안정적 운영 |
| **Gemini API 직접 호출** (서버 없이) | 하 | API 비용만 | 가장 현실적 (현재 API Key 입력 구조 활용) |

---

## 9. 최종 프로젝트 산출물

### 9.1. 파일 구조

```
260219_ai_class/
├── landing.html            # 랜딩 페이지 (진입점)
├── index.html              # 대시보드
├── syllabus.html           # 강의계획서 생성기 ★ NEW
├── search.html             # 챕터 검색
├── practice.html           # 연습문제
├── exam.html               # 시험 생성
├── lecture.html             # 강의자료 생성
├── report.html             # 보고서·과제 관리 (3탭) ★ REDESIGN
├── vercel.json             # Vercel 배포 설정
├── .gitignore              # Git 제외 규칙
├── development_modification_processes.md  # 본 문서
├── program_instruction.md  # 프로그램 기획 문서
│
├── css/
│   ├── style.css           # 메인 스타일시트 (다크/라이트 테마)
│   └── landing.css         # 랜딩 페이지 전용 스타일
│
├── js/
│   ├── data.js             # 교과서 데이터 (36챕터, 10파트)
│   ├── common.js           # 공통 유틸리티, 네비게이션, 테마
│   ├── key_manager.js      # Gemini API 키 관리
│   ├── rag_client.js       # RAG 서버 통신 클라이언트
│   ├── report_app.js       # 보고서·과제 관리 로직 ★ NEW
│   └── syllabus_app.js     # 강의계획서 생성 로직 ★ NEW
│
├── img/
│   └── textbook_cover.jpg  # 교과서 표지 이미지
│
├── rag/                    # RAG 백엔드 (로컬 전용)
│   ├── server.py           # API 서버 (HTTP, localhost:5000)
│   └── pipeline.py         # PDF 추출 → ChromaDB 파이프라인
│
└── .raw_db/                # 원본 PDF 10권 (Git 제외)
```

### 9.2. 페이지별 기능 요약

| 페이지 | 주요 기능 | 기술 |
|--------|-----------|------|
| **Landing** | 히어로 섹션, 3D 책 표지, 로고 마키, AI 튜터 챗봇 | CSS Animation, JS |
| **Dashboard** | 강좌 개요, 챕터 네비게이션, 학습 진도 | data.js |
| **Syllabus** | PDF 업로드(최대 10개), 16주 계획서 자동 생성, 인라인 편집, 인쇄/다운로드 | JS Template |
| **Search** | 챕터별 검색, 키워드 하이라이팅 | data.js |
| **Practice** | 객관식/주관식 연습문제, 정답 확인 | data.js |
| **Exam** | 시험지 자동 생성, 난이도·범위 설정 | data.js + RAG |
| **Lecture** | 강의자료 AI 생성 | RAG + Gemini |
| **Report** | 보고서 작성 / 과제 생성(6유형) / 과제 채점(4항목) | JS + RAG |

### 9.3. 기술 스택

| 분류 | 기술 |
|------|------|
| **프런트엔드** | HTML5, CSS3 (Glassmorphism, Dark/Light Theme), Vanilla JavaScript |
| **아이콘** | FontAwesome 6.4.0 |
| **백엔드 (로컬)** | Python 3.x, HTTPServer |
| **AI/LLM** | Google Gemini 2.0 Flash, text-embedding-004 |
| **벡터 DB** | ChromaDB (Persistent) |
| **배포** | GitHub + Vercel (정적 사이트) |

---

## 10. 프로젝트 종료

### 10.1. 프로젝트 상태: ✅ 시범 적용 완료

*   **개발 기간:** 2026-02-19 ~ 2026-02-20 (2일)
*   **프로젝트 성격:** 시범 적용 (Pilot)
*   **배포 환경:** Vercel (정적 호스팅) + GitHub (소스 관리)
*   **운영 방침:**
    *   현재 단계에서는 RAG 서버 없이 정적 기능만으로 운영.
    *   실제 사용자 수요가 확인되면 클라우드 RAG 서버 배포 및 Syllabus PDF 분석 기능 본격 개발.

### 10.2. 향후 작업 트리거

| 트리거 | 작업 내용 | 예상 소요 |
|--------|-----------|-----------|
| 사용자 수요 확인 | Syllabus RAG 파이프라인 개발 (섹션 6) | 1~2주 |
| 클라우드 운영 결정 | RAG 서버 클라우드 배포 (섹션 8.3) | 2~3일 |
| 과제 채점 실사용 요청 | Gemini API 연동 실제 채점 엔진 구현 | 3~5일 |
| AI 채팅 고도화 | RAG 컨텍스트 기반 대화 시스템 | 3~5일 |

---

*Final Update: 2026-02-20 13:51 KST*
*Author: Antigravity (AI Agent)*
*Project: ClassAI - Mankiw's Principles of Economics Platform*
*Status: PILOT COMPLETE*
