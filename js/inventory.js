/**
 * Basileia - Inventory & Equipment Manager
 */

class InventoryManager {
    constructor(initialData = {}) {
        this.items = initialData.items || []; // Array of { id, count }
        this.equipment = initialData.equipment || {
            weapon: null,
            armor: null,
            helmet: null,
            accessory: null,
            boots: null,
            offhand: null
        };
    }

    /**
     * Add item to inventory
     */
    addItem(itemId, count = 1) {
        const itemData = window.GAME_DATA.items[itemId];
        if (!itemData) return console.error(`Item ${itemId} not found in database`);

        const existing = this.items.find(i => i.id === itemId);
        if (existing) {
            existing.count += count;
        } else {
            this.items.push({ id: itemId, count: count });
        }
        return true;
    }

    /**
     * Remove item from inventory
     */
    removeItem(itemId, count = 1) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index === -1) return false;

        this.items[index].count -= count;
        if (this.items[index].count <= 0) {
            this.items.splice(index, 1);
        }
        return true;
    }

    /**
     * Equip an item
     */
    equip(itemId) {
        const itemData = window.GAME_DATA.items[itemId];
        if (!itemData || !itemData.slot) return false;

        // Unequip current item in slot if exists
        this.unequip(itemData.slot);

        // Equip new item
        this.equipment[itemData.slot] = itemId;
        this.removeItem(itemId, 1);
        return true;
    }

    /**
     * Unequip an item
     */
    unequip(slot) {
        const itemId = this.equipment[slot];
        if (!itemId) return false;

        this.addItem(itemId, 1);
        this.equipment[slot] = null;
        return true;
    }

    /**
     * Calculate total stat bonuses from equipment
     */
    getBonuses(statResolver = null) {
        const bonuses = { atk: 0, def: 0, hp: 0, pp: 0, spd: 0, faith: 0, hpRegen: 0, lifeSteal: 0 };
        
        Object.values(this.equipment).forEach(itemId => {
            if (!itemId) return;
            const item = window.GAME_DATA.items[itemId];
            const stats = statResolver ? statResolver(itemId, item) : item?.stats;
            if (stats) {
                for (const [stat, val] of Object.entries(stats)) {
                    if (bonuses[stat] !== undefined) {
                        bonuses[stat] += val;
                    }
                }
            }
        });
        
        return bonuses;
    }

    /**
     * Get data for saving
     */
    serialize() {
        return {
            items: this.items,
            equipment: this.equipment
        };
    }
}

if (typeof window !== 'undefined') {
    window.InventoryManager = InventoryManager;
}
