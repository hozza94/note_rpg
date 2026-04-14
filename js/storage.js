/**
 * Basileia - Storage Abstraction Layer
 * Handles data persistence with versioning and validation.
 */

class AuthManager {
    constructor() {
        this.usersKey = "BASILEIA_USERS";
        this.sessionKey = "BASILEIA_SESSION";
    }

    getUsers() {
        try {
            const data = localStorage.getItem(this.usersKey);
            return data ? JSON.parse(data) : {};
        } catch { return {}; }
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    register(username, password) {
        if (!username || !password) return { success: false, msg: "아이디와 비밀번호를 입력해주세요." };
        const users = this.getUsers();
        if (users[username]) return { success: false, msg: "이미 존재하는 아이디입니다." };
        
        users[username] = { password, nickname: "순례자", createdAt: Date.now() };
        this.saveUsers(users);
        return { success: true, msg: "회원가입이 완료되었습니다! 로그인해주세요." };
    }

    login(username, password) {
        const users = this.getUsers();
        if (!users[username]) return { success: false, msg: "존재하지 않는 아이디입니다." };
        if (users[username].password !== password) return { success: false, msg: "비밀번호가 일치하지 않습니다." };
        
        localStorage.setItem(this.sessionKey, username);
        return { success: true, username };
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
    }

    getCurrentUser() {
        return localStorage.getItem(this.sessionKey);
    }

    getNickname() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return "순례자";
        return this.getUsers()[currentUser]?.nickname || "순례자";
    }

    updateNickname(newNickname) {
        if (!newNickname || newNickname.trim() === '') return { success: false, msg: "닉네임을 입력해주세요." };
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, msg: "로그인이 필요합니다." };
        
        const users = this.getUsers();
        if (users[currentUser]) {
            users[currentUser].nickname = newNickname.trim();
            this.saveUsers(users);
            return { success: true, msg: "닉네임이 변경되었습니다." };
        }
        return { success: false, msg: "사용자 정보를 찾을 수 없습니다." };
    }
}

class StorageManager {
    constructor(authManager) {
        this.auth = authManager;
        this.version = "1.2";
        this.cloudPrefix = "BASILEIA_CLOUD_";
    }

    getSaveKey() {
        const user = this.auth.getCurrentUser();
        return user ? `BASILEIA_SAVE_${user}` : null;
    }

    save(state) {
        const key = this.getSaveKey();
        if (!key) return false;
        
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                payload: state
            };
            localStorage.setItem(key, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error("Save Error:", e);
            return false;
        }
    }

    load() {
        const key = this.getSaveKey();
        if (!key) return null;

        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            const parsed = JSON.parse(data);
            return parsed.payload;
        } catch (e) {
            console.error("Load Error:", e);
            return null;
        }
    }

    clear() {
        const key = this.getSaveKey();
        if (key) {
            localStorage.removeItem(key);
        }
    }

    exists() {
        const key = this.getSaveKey();
        return key ? localStorage.getItem(key) !== null : false;
    }

    getCloudKey() {
        const user = this.auth.getCurrentUser();
        return user ? `${this.cloudPrefix}${user}` : null;
    }

    /**
     * Phase 4 준비: 현재는 로컬스토리지 미러 기반 백업.
     * 이후 Firebase/Supabase 어댑터로 쉽게 교체할 수 있도록 메서드 형태를 분리했다.
     */
    syncToCloud(state) {
        const key = this.getCloudKey();
        if (!key || !state) return { success: false, msg: "로그인 후 백업을 사용할 수 있습니다." };

        try {
            const payload = {
                version: this.version,
                timestamp: Date.now(),
                payload: state
            };
            localStorage.setItem(key, JSON.stringify(payload));
            return { success: true, msg: "클라우드 백업 업로드가 완료되었습니다." };
        } catch (e) {
            console.error("Cloud Sync Upload Error:", e);
            return { success: false, msg: "백업 업로드에 실패했습니다." };
        }
    }

    restoreFromCloud() {
        const key = this.getCloudKey();
        if (!key) return { success: false, msg: "로그인 후 복원을 사용할 수 있습니다." };

        try {
            const data = localStorage.getItem(key);
            if (!data) return { success: false, msg: "복원할 백업 데이터가 없습니다." };

            const parsed = JSON.parse(data);
            if (!parsed.payload) return { success: false, msg: "백업 데이터 형식이 올바르지 않습니다." };
            return { success: true, payload: parsed.payload, msg: "클라우드 백업 복원이 완료되었습니다." };
        } catch (e) {
            console.error("Cloud Sync Restore Error:", e);
            return { success: false, msg: "백업 복원에 실패했습니다." };
        }
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.AuthManager = new AuthManager();
    window.StorageManager = new StorageManager(window.AuthManager);
}
