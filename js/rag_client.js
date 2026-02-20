/**
 * 맨큐의 경제학 - RAG API 클라이언트
 * ===================================
 * ChromaDB + Gemini 기반 RAG 서버와 통신
 */

const RAG_API = (() => {
    // 기본 설정
    let BASE_URL = 'http://localhost:5000';
    let API_KEY = (typeof KeyManager !== 'undefined') ? KeyManager.getKey() : '';
    let isConnected = false;
    let dbDocCount = 0;

    /**
     * API 서버 URL 설정
     */
    function setBaseUrl(url) {
        BASE_URL = url.replace(/\/+$/, '');
    }

    /**
     * API 키 설정
     */
    async function setApiKey(key) {
        API_KEY = key;
        // 암호화하여 저장 (KeyManager 사용)
        if (typeof KeyManager !== 'undefined') {
            KeyManager.setKey(key);
        } else {
            localStorage.setItem('mankiw_api_key', key);
        }

        try {
            const result = await post('/api/set-key', { api_key: key });
            if (result.status === 'ok') {
                isConnected = true;
                dbDocCount = result.db_count || 0;
                return { success: true, message: result.message, docCount: dbDocCount };
            }
            return { success: false, message: result.error || '연결 실패' };
        } catch (e) {
            return { success: false, message: '서버에 연결할 수 없습니다: ' + e.message };
        }
    }

    /**
     * 서버 상태 확인
     */
    async function checkStatus() {
        try {
            const result = await get('/api/status');
            isConnected = result.status === 'ok' && result.chromadb === 'connected';
            dbDocCount = result.document_count || 0;
            return {
                connected: isConnected,
                gemini: result.gemini_api === 'connected',
                chromadb: result.chromadb === 'connected',
                docCount: dbDocCount,
                apiKeySet: result.api_key_set,
                metadata: result.metadata
            };
        } catch (e) {
            isConnected = false;
            return { connected: false, error: e.message };
        }
    }

    /**
     * 교과서 검색 (RAG)
     */
    async function search(query, nResults = 8) {
        return post('/api/search', { query, n_results: nResults });
    }

    /**
     * 퀴즈/연습문제 생성 (RAG)
     */
    async function generateQuiz(topic, options = {}) {
        return post('/api/quiz', {
            topic,
            chapter: options.chapter || '',
            count: options.count || 5,
            types: options.types || ['multiple', 'tf', 'short']
        });
    }

    /**
     * 시험문제 생성 (RAG)
     */
    async function generateExam(options = {}) {
        return post('/api/exam', {
            chapters: options.chapters || [],
            count: options.count || 10,
            difficulty: options.difficulty || 'medium',
            types: options.types || ['multiple', 'tf', 'short']
        });
    }

    /**
     * 강의자료 생성 (RAG)
     */
    async function generateLecture(options = {}) {
        return post('/api/lecture', {
            chapter: options.chapter || '',
            topic: options.topic || '',
            format: options.format || 'notes'
        });
    }

    /**
     * 보고서 생성 (RAG)
     */
    async function generateReport(options = {}) {
        return post('/api/report', {
            topic: options.topic || '',
            chapter: options.chapter || '',
            type: options.type || 'analysis',
            length: options.length || 'medium'
        });
    }

    /**
     * 일반 질의응답 (RAG)
     */
    async function chat(query) {
        return post('/api/chat', { query });
    }

    // ── HTTP 헬퍼 ──

    async function get(path) {
        const response = await fetch(BASE_URL + path, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async function post(path, body) {
        const response = await fetch(BASE_URL + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    // ── UI 컴포넌트 ──

    /**
     * RAG 연결 상태 배지 생성
     */
    function createStatusBadge(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const badge = document.createElement('div');
        badge.id = 'rag-status-badge';
        badge.style.cssText = `
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 20px; font-size: 0.72rem;
      background: var(--bg-surface); border: 1px solid var(--border-subtle);
      cursor: pointer; transition: all 0.2s; font-weight: 500;
    `;
        badge.title = 'RAG 서버 상태 확인';
        badge.innerHTML = '<span class="status-dot">⚪</span> RAG: 확인 중...';
        badge.onclick = () => showApiKeyModal();
        container.appendChild(badge);

        // 상태 확인
        updateStatusBadge();
    }

    async function updateStatusBadge() {
        const badge = document.getElementById('rag-status-badge');
        if (!badge) return;

        try {
            const status = await checkStatus();
            if (status.connected && status.gemini) {
                badge.innerHTML = `<span style="color: #10b981;">●</span> RAG: 연결됨 (${status.docCount.toLocaleString()}개 문서)`;
                badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            } else if (status.connected) {
                badge.innerHTML = `<span style="color: #f59e0b;">●</span> RAG: API 키 필요`;
                badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            } else {
                badge.innerHTML = `<span style="color: #ef4444;">●</span> RAG: 미연결`;
                badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }
        } catch (e) {
            badge.innerHTML = `<span style="color: #ef4444;">●</span> RAG: 서버 오프라인`;
            badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
    }

    /**
     * API 키 설정 모달
     */
    function showApiKeyModal() {
        // 기존 모달 제거
        const existing = document.getElementById('api-key-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'api-key-modal';
        modal.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-overlay); backdrop-filter: blur(8px);
    `;
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        modal.innerHTML = `
      <div style="
        background: var(--bg-surface); border: 1px solid var(--border-default);
        border-radius: var(--radius-lg); padding: 2rem; width: 90%; max-width: 480px;
        box-shadow: var(--shadow-xl);
      ">
        <h3 style="margin-bottom: 0.5rem;">RAG 서버 설정</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Gemini API 키를 입력하면 교과서 내용을 기반으로 한 AI 답변을 받을 수 있습니다.
        </p>
        
        <div class="form-group">
          <label class="form-label">서버 URL</label>
          <input type="text" class="form-input" id="modal-server-url" 
            value="${BASE_URL}" placeholder="http://localhost:5000">
        </div>

        <div class="form-group">
          <label class="form-label">Gemini API Key</label>
          <input type="password" class="form-input" id="modal-api-key" 
            value="${API_KEY}" placeholder="AIzaSy...">
          <div class="form-hint">Google AI Studio에서 발급받은 API 키를 입력하세요. (암호화 저장)</div>
        </div>

        <div id="modal-status" style="margin-bottom: 1rem; font-size: 0.85rem;"></div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="this.closest('#api-key-modal').remove()">닫기</button>
          <button class="btn btn-primary" onclick="RAG_API._modalConnect()">연결</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);
    }

    async function _modalConnect() {
        const urlInput = document.getElementById('modal-server-url');
        const keyInput = document.getElementById('modal-api-key');
        const statusDiv = document.getElementById('modal-status');

        if (urlInput) setBaseUrl(urlInput.value);

        statusDiv.innerHTML = '<span style="color: var(--accent-primary);">연결 중...</span>';

        if (keyInput && keyInput.value) {
            const result = await setApiKey(keyInput.value);
            if (result.success) {
                statusDiv.innerHTML = `<span style="color: #10b981;">Connected — ${result.message} (${result.docCount.toLocaleString()}개 문서)</span>`;
                updateStatusBadge();
            } else {
                statusDiv.innerHTML = `<span style="color: #ef4444;">Error — ${result.message}</span>`;
            }
        } else {
            const status = await checkStatus();
            if (status.connected) {
                statusDiv.innerHTML = `<span style="color: #10b981;">Connected — 서버 연결됨 (${status.docCount.toLocaleString()}개 문서)</span>`;
            } else {
                statusDiv.innerHTML = `<span style="color: #ef4444;">Error — ${status.error || '연결 실패'}</span>`;
            }
        }
    }

    /**
     * 출처(Sources) 표시 컴포넌트
     */
    function renderSources(sources) {
        if (!sources || sources.length === 0) return '';

        return `
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
          참고 출처 (${sources.length}개)
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${sources.map(s => `
            <span class="tag tag-blue" style="font-size: 0.7rem;" title="${s.preview || ''}">
              ${s.file} p.${s.page} (${(s.similarity * 100).toFixed(0)}%)
            </span>
          `).join('')}
        </div>
      </div>
    `;
    }

    /**
     * Markdown → HTML 간단 변환
     */
    function renderMarkdown(text) {
        if (!text) return '';

        return text
            // 코드 블록
            .replace(/```json\n?([\s\S]*?)```/g, '<pre style="background:var(--bg-tertiary);padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.85rem;"><code>$1</code></pre>')
            .replace(/```\n?([\s\S]*?)```/g, '<pre style="background:var(--bg-tertiary);padding:1rem;border-radius:8px;overflow-x:auto;font-size:0.85rem;"><code>$1</code></pre>')
            // 헤딩
            .replace(/^### (.+)$/gm, '<h3 style="color:var(--primary-400);margin-top:1.5rem;">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 style="color:var(--primary-400);border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // 볼드, 이탤릭
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // 리스트
            .replace(/^- (.+)$/gm, '<li style="margin-bottom:4px;">$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-bottom:4px;">$2</li>')
            // 줄바꿈
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
    }

    // ── Public API ──
    return {
        setBaseUrl,
        setApiKey,
        checkStatus,
        search,
        generateQuiz,
        generateExam,
        generateLecture,
        generateReport,
        chat,
        createStatusBadge,
        updateStatusBadge,
        showApiKeyModal,
        renderSources,
        renderMarkdown,
        _modalConnect,
        get isConnected() { return isConnected; },
        get docCount() { return dbDocCount; }
    };
})();
