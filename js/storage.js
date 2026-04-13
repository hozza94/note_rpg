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
        
        users[username] = { password, createdAt: Date.now() };
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
}

class StorageManager {
    constructor(authManager) {
        this.auth = authManager;
        this.version = "1.2";
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
}

// Global instance
if (typeof window !== 'undefined') {
    window.AuthManager = new AuthManager();
    window.StorageManager = new StorageManager(window.AuthManager);
}
