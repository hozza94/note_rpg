/**
 * Basileia - Storage Abstraction Layer
 * Handles data persistence. Currently uses localStorage.
 * Designed to be easily swappable with Firebase/Supabase.
 */

class StorageManager {
    constructor() {
        this.key = "BASILEIA_SAVE_DATA";
    }

    /**
     * Save game state
     * @param {Object} state - The game state object to save
     */
    save(state) {
        try {
            const data = JSON.stringify(state);
            localStorage.setItem(this.key, data);
            console.log("💾 Game Saved Successfully");
            return true;
        } catch (e) {
            console.error("❌ Failed to save game:", e);
            return false;
        }
    }

    /**
     * Load game state
     * @returns {Object|null} The saved game state or null
     */
    load() {
        try {
            const data = localStorage.getItem(this.key);
            if (!data) return null;
            console.log("📂 Game Loaded Successfully");
            return JSON.parse(data);
        } catch (e) {
            console.error("❌ Failed to load game:", e);
            return null;
        }
    }

    /**
     * Clear saved data
     */
    clear() {
        localStorage.removeItem(this.key);
        console.log("🧹 Save Data Cleared");
    }

    /**
     * Check if a save exists
     */
    exists() {
        return localStorage.getItem(this.key) !== null;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.StorageManager = new StorageManager();
}
