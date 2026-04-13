/**
 * Basileia - Game Engine Core
 */

class GameEngine {
    constructor() {
        this.state = {
            player: {
                name: "순례자",
                title: "Pilgrim",
                hp: 100,
                maxHp: 100,
                pp: 50,
                maxPp: 50,
                atk: 10,
                def: 5,
                faith: 1,
                exp: 0,
                nextExp: 100,
                gold: 0,
                inventory: [],
                skills: [
                    { id: 'meditation', name: '묵상', cost: 10 },
                    { id: 'praise', name: '찬양', cost: 15 }
                ]
            },
            world: {
                saturation: 0,
                currentRegion: "비손 유역",
                isNavigating: false
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.log("세상이 회색빛으로 물들었습니다. 당신의 순례는 여기서부터 시작됩니다.", "system");
    }

    bindEvents() {
        document.getElementById('btn-explore').addEventListener('click', () => this.explore());
        document.getElementById('btn-worship').addEventListener('click', () => this.worship());
        document.getElementById('btn-rest').addEventListener('click', () => this.rest());
    }

    log(message, type = 'info') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = message;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    updateUI() {
        const p = this.state.player;
        const w = this.state.world;

        // Stats
        document.getElementById('hp-bar').style.width = `${(p.hp / p.maxHp) * 100}%`;
        document.getElementById('hp-text').innerText = `${p.hp} / ${p.maxHp}`;
        document.getElementById('pp-bar').style.width = `${(p.pp / p.maxPp) * 100}%`;
        document.getElementById('pp-text').innerText = `${p.pp} / ${p.maxPp}`;
        
        document.getElementById('atk-value').innerText = p.atk;
        document.getElementById('def-value').innerText = p.def;
        document.getElementById('faith-value').innerText = p.faith;

        // World
        document.getElementById('saturation-fill').style.width = `${w.saturation}%`;
        document.getElementById('saturation-value').innerText = `${w.saturation}%`;
        document.body.style.setProperty('--world-saturation', w.saturation);
    }

    explore() {
        if (this.state.world.isNavigating) return;
        
        this.state.world.isNavigating = true;
        this.log("주변을 탐험합니다...", "info");

        // Simulate random encounter
        setTimeout(() => {
            const roll = Math.random();
            if (roll > 0.7) {
                this.log("몬스터를 발견했습니다! (전투 시스템 준비 중)", "battle");
            } else {
                this.log("고요한 길을 따라 걷습니다. 아무 일도 일어나지 않았습니다.", "info");
            }
            this.state.world.isNavigating = false;
        }, 1000);
    }

    worship() {
        if (this.state.player.pp >= this.state.player.maxPp) {
            this.log("이미 영적으로 충만한 상태입니다.", "system");
            return;
        }

        this.log("조용히 눈을 감고 예배를 드립니다...", "info");
        
        // Worship effect logic
        setTimeout(() => {
            this.state.player.pp = this.state.player.maxPp;
            const verses = [
                "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라 (빌 4:13)",
                "여호와는 나의 목자시니 내게 부족함이 없으리로다 (시 23:1)",
                "너희는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 (잠 3:5)"
            ];
            const randomVerse = verses[Math.floor(Math.random() * verses.length)];
            
            this.log(`[묵상] ${randomVerse}`, "system");
            this.log("PP가 완전히 회복되었습니다.", "info");
            this.updateUI();
        }, 1500);
    }

    rest() {
        this.log("잠시 휴식을 취하며 체력을 회복합니다.", "info");
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 20);
        this.updateUI();
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
