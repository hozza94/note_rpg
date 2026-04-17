/**
 * 아바타 이미지 URL 조합 — 기본 폴더 assets/avatars/ 기준.
 * 카탈로그에는 파일명만 두고(basePath + file), 외부 URL·레거시 image는 예외 처리.
 */
(function (global) {
    const w = global.window || global;
    const DEFAULT_BASE = 'assets/avatars/';

    function normalizeBasePath(base) {
        const b = String(base || DEFAULT_BASE).replace(/\\/g, '/');
        return b.endsWith('/') ? b : `${b}/`;
    }

    /** 레거시 full path에서 avatars/ 이하 파일명만 추출 */
    function basenameFromLegacyImage(image) {
        if (!image || typeof image !== 'string') return '';
        const s = image.replace(/\\/g, '/');
        if (/^https?:\/\//i.test(s) || s.startsWith('data:') || s.startsWith('//')) return '';
        const lower = s.toLowerCase();
        const marker = 'assets/avatars/';
        const idx = lower.indexOf(marker);
        if (idx >= 0) return s.slice(idx + marker.length);
        const last = s.lastIndexOf('/');
        return last >= 0 ? s.slice(last + 1) : s;
    }

    /**
     * @param {object} [entry] - { id?, file?, imageFile?, image? }
     * @param {{ basePath?: string }} [opts]
     * @returns {string}
     */
    function resolveAvatarImageUrl(entry, opts) {
        const base = normalizeBasePath(
            opts && opts.basePath !== undefined
                ? opts.basePath
                : (w.GAME_DATA && w.GAME_DATA.avatars && w.GAME_DATA.avatars.basePath) || DEFAULT_BASE
        );

        if (!entry || typeof entry !== 'object') {
            return `${base}Avatar_M.png`;
        }

        const fileOnly = entry.file || entry.imageFile;
        if (typeof fileOnly === 'string' && fileOnly.length > 0) {
            const trimmed = fileOnly.trim();
            if (trimmed.includes('://') || trimmed.startsWith('data:')) return trimmed;
            if (trimmed.includes('/')) return trimmed.startsWith('assets/') ? trimmed : `${base}${trimmed.replace(/^\//, '')}`;
            return `${base}${trimmed}`;
        }

        const img = entry.image;
        if (typeof img === 'string' && img.length > 0) {
            const t = img.trim();
            if (/^https?:\/\//i.test(t) || t.startsWith('data:') || t.startsWith('//')) return t;
            const legacy = basenameFromLegacyImage(t);
            if (legacy) return `${base}${legacy}`;
            if (t.startsWith('/')) return t;
            return t.startsWith('assets/') ? t : `${base}${t.replace(/^\//, '')}`;
        }

        const id = entry.id;
        if (id) {
            const safe = String(id).replace(/[^a-zA-Z0-9._-]/g, '_');
            return `${base}${safe}.png`;
        }
        return `${base}Avatar_M.png`;
    }

    /**
     * 성별 기본 파일 (카탈로그에 항목이 없을 때)
     * @param {'male'|'female'} gender
     */
    function resolveDefaultAvatarFileByGender(gender) {
        const av = w.GAME_DATA && w.GAME_DATA.avatars;
        const df = (av && av.defaultFiles) || { male: 'Avatar_M.png', female: 'Avatar_F_AA.png' };
        const g = gender === 'female' ? 'female' : 'male';
        return df[g] || (g === 'female' ? 'Avatar_F_AA.png' : 'Avatar_M.png');
    }

    w.AvatarAssets = {
        DEFAULT_BASE,
        normalizeBasePath,
        basenameFromLegacyImage,
        resolveAvatarImageUrl,
        resolveDefaultAvatarFileByGender
    };
})(typeof globalThis !== 'undefined' ? globalThis : this);
