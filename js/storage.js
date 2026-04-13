/**
 * Basileia - Storage Abstraction Layer
 * Handles data persistence with versioning and validation.
 */

class StorageManager {
    constructor() {
        this.key = "BASILEIA_SAVE_DATA";
        this.version = "1.1"; // Current data version
    }

    /**
     * Save game state with metadata
     * @param {Object} state - The game state object to save
     */
    save(state) {
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                payload: state
            };
            const data = JSON.stringify(saveData);
            localStorage.setItem(this.key, data);
            console.log(`💾 Game Saved (v${this.version})`);
            return true;
        } catch (e) {
            console.error("❌ Failed to save game:", e);
            return false;
        }
    }

    /**
     * Load game state with validation
     * @returns {Object|null} The saved state payload or null
     */
    load() {
        try {
            const data = localStorage.getItem(this.key);
            if (!data) return null;

            const parsed = JSON.parse(data);
            
            // Version Check & Migration (placeholder for future)
            if (parsed.version !== this.version) {
                console.warn(`⚠️ Save version mismatch: ${parsed.version} vs ${this.version}`);
                // Migration logic could go here
            }

            console.log("📂 Game Loaded Successfully");
            return parsed.payload;
        } catch (e) {
            console.error("❌ Failed to load game (Corrupted?):", e);
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
     * Check if a valid save exists
     */
    exists() {
        return localStorage.getItem(this.key) !== null;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.StorageManager = new StorageManager();
}
