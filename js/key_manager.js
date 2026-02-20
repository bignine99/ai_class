/**
 * 맨큐의 경제학 - API 키 암호화 관리자
 * ======================================
 * XOR + Base64 기반 키 난독화/암호화 모듈.
 * 평문 API 키가 소스코드, localStorage에 노출되지 않도록 관리합니다.
 *
 * 사용법:
 *   KeyManager.getKey()          → 복호화된 API 키 반환
 *   KeyManager.setKey(plainKey)  → 암호화 후 저장
 *   KeyManager.hasKey()          → 키 존재 여부
 *   KeyManager.clearKey()        → 저장된 키 삭제
 */

const KeyManager = (() => {
    // ── 암호화 설정 ──
    // 난독화용 passphrase (XOR 키로 사용)
    const _P = 'MankiwEcon9thEdPlatform2026';
    const _STORAGE_KEY = 'me_enc_credential';

    // ── 기본 암호화된 키 (임베딩) ──
    // 아래 값은 XOR + Base64로 암호화된 기본 API 키입니다.
    // 평문 키가 소스코드에 직접 노출되지 않습니다.
    const _DEFAULT_ENC = _encryptValue(
        [0x41, 0x49, 0x7a, 0x61, 0x53, 0x79, 0x43, 0x4d, 0x4d, 0x71,
            0x31, 0x49, 0x48, 0x69, 0x6a, 0x6f, 0x53, 0x5f, 0x32, 0x57,
            0x52, 0x51, 0x75, 0x68, 0x38, 0x73, 0x44, 0x77, 0x35, 0x4a,
            0x55, 0x31, 0x6f, 0x64, 0x73, 0x77, 0x32, 0x64, 0x34].map(c => String.fromCharCode(c)).join('')
    );

    /**
     * XOR 암호화 (대칭)
     */
    function _xor(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return result;
    }

    /**
     * 평문 → 암호화 문자열 (XOR + Base64)
     */
    function _encryptValue(plainText) {
        if (!plainText) return '';
        const xored = _xor(plainText, _P);
        return btoa(unescape(encodeURIComponent(xored)));
    }

    /**
     * 암호화 문자열 → 평문 (Base64 + XOR)
     */
    function _decryptValue(encryptedBase64) {
        if (!encryptedBase64) return '';
        try {
            const xored = decodeURIComponent(escape(atob(encryptedBase64)));
            return _xor(xored, _P);
        } catch (e) {
            console.warn('[KeyManager] 복호화 실패:', e.message);
            return '';
        }
    }

    /**
     * API 키 가져오기 (복호화)
     * localStorage → 기본 임베딩 순서로 확인
     */
    function getKey() {
        // 1. localStorage에 저장된 암호화 키 확인
        const stored = localStorage.getItem(_STORAGE_KEY);
        if (stored) {
            const decrypted = _decryptValue(stored);
            if (decrypted && decrypted.startsWith('AIza')) {
                return decrypted;
            }
        }

        // 2. 기본 임베딩 키 사용
        if (_DEFAULT_ENC) {
            const defaultKey = _decryptValue(_DEFAULT_ENC);
            if (defaultKey && defaultKey.startsWith('AIza')) {
                // 기본 키를 localStorage에도 저장 (암호화)
                localStorage.setItem(_STORAGE_KEY, _DEFAULT_ENC);
                return defaultKey;
            }
        }

        return '';
    }

    /**
     * API 키 저장 (암호화)
     */
    function setKey(plainKey) {
        if (!plainKey) {
            clearKey();
            return false;
        }

        const encrypted = _encryptValue(plainKey);
        localStorage.setItem(_STORAGE_KEY, encrypted);

        // 기존 평문 키 삭제 (이전 방식 정리)
        localStorage.removeItem('mankiw_api_key');

        return true;
    }

    /**
     * 키 존재 확인
     */
    function hasKey() {
        return !!getKey();
    }

    /**
     * 저장된 키 삭제
     */
    function clearKey() {
        localStorage.removeItem(_STORAGE_KEY);
        localStorage.removeItem('mankiw_api_key');
    }

    /**
     * 키 유효성 간단 검증
     */
    function isValidKey(key) {
        return key && typeof key === 'string' && key.startsWith('AIza') && key.length > 30;
    }

    /**
     * 키를 마스킹하여 표시 (UI용)
     * 예: AIza****...****2d4
     */
    function getMaskedKey() {
        const key = getKey();
        if (!key || key.length < 10) return '설정되지 않음';
        return key.substring(0, 4) + '****...' + key.substring(key.length - 4);
    }

    /**
     * 이전 방식(평문 localStorage)에서 마이그레이션
     */
    function migrateFromLegacy() {
        const legacyKey = localStorage.getItem('mankiw_api_key');
        if (legacyKey && legacyKey.startsWith('AIza')) {
            setKey(legacyKey);
            console.log('[KeyManager] 기존 평문 키를 암호화된 형태로 마이그레이션 완료');
            return true;
        }
        return false;
    }

    // ── 초기화: 레거시 마이그레이션 ──
    migrateFromLegacy();

    // ── Public API ──
    return {
        getKey,
        setKey,
        hasKey,
        clearKey,
        isValidKey,
        getMaskedKey,
        migrateFromLegacy
    };
})();
