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
        // Explore Actions
        document.getElementById('btn-explore').addEventListener('click', () => this.explore());
        document.getElementById('btn-worship').addEventListener('click', () => this.worship());
        document.getElementById('btn-rest').addEventListener('click', () => this.rest());

        // Battle Actions
        document.getElementById('btn-attack').addEventListener('click', () => this.playerAttack());
        document.getElementById('btn-skill').addEventListener('click', () => this.showSkillMenu());
        document.getElementById('btn-run').addEventListener('click', () => this.tryEscape());

        // UI Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        this.renderTabContent(tabId);
    }

    renderTabContent(tabId) {
        const container = document.getElementById('inventory-list');
        container.innerHTML = '';
        
        if (tabId === 'inventory') {
            if (this.state.player.inventory.length === 0) {
                container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
            } else {
                // Render inventory items
            }
        } else if (tabId === 'skills') {
            this.state.player.skills.forEach(skill => {
                const item = document.createElement('div');
                item.className = 'list-item skill-item';
                item.innerHTML = `<span>${skill.name}</span> <span class="cost">PP ${skill.cost}</span>`;
                container.appendChild(item);
            });
        }
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

        // Player Stats
        document.getElementById('hp-bar').style.width = `${(p.hp / p.maxHp) * 100}%`;
        document.getElementById('hp-text').innerText = `${p.hp} / ${p.maxHp}`;
        document.getElementById('pp-bar').style.width = `${(p.pp / p.maxPp) * 100}%`;
        document.getElementById('pp-text').innerText = `${p.pp} / ${p.maxPp}`;
        
        document.getElementById('atk-value').innerText = p.atk;
        document.getElementById('def-value').innerText = p.def;
        document.getElementById('faith-value').innerText = p.faith;

        // Monster Stats (during battle)
        if (this.state.battle) {
            const m = this.state.battle.monster;
            document.getElementById('monster-hp-bar').style.width = `${(m.hp / m.maxHp) * 100}%`;
            document.getElementById('monster-hp-text').innerText = `${Math.floor(m.hp)} / ${m.maxHp}`;
        }

        // World
        document.getElementById('saturation-fill').style.width = `${w.saturation}%`;
        document.getElementById('saturation-value').innerText = `${w.saturation}%`;
        document.body.style.setProperty('--world-saturation', w.saturation);
    }

    toggleBattleUI(isBattle) {
        document.getElementById('explore-actions').classList.toggle('hidden', isBattle);
        document.getElementById('battle-actions').classList.toggle('hidden', !isBattle);
        document.getElementById('battle-scene').classList.toggle('hidden', !isBattle);
    }

    // --- Explore Functions ---
    explore() {
        if (this.state.world.isNavigating) return;
        this.state.world.isNavigating = true;
        this.log("주변을 탐험합니다...", "info");

        setTimeout(() => {
            const roll = Math.random();
            if (roll > 0.4) { // 60% 확률로 전투 발생
                const monsterList = window.GAME_DATA.monsters.filter(m => m.level <= (this.state.player.faith * 5 + 5));
                const randomMonster = JSON.parse(JSON.stringify(monsterList[Math.floor(Math.random() * monsterList.length)]));
                this.startBattle(randomMonster);
            } else {
                this.log("고요한 길을 따라 걷습니다. 아무 일도 일어나지 않았습니다.", "info");
            }
            this.state.world.isNavigating = false;
        }, 800);
    }

    worship() {
        if (this.state.player.pp >= this.state.player.maxPp) return this.log("이미 영적으로 충만한 상태입니다.", "system");
        this.log("조용히 눈을 감고 예배를 드립니다...", "info");
        setTimeout(() => {
            this.state.player.pp = this.state.player.maxPp;
            const verses = [
                "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라 (빌 4:13)",
                "여호와는 나의 목자시니 내게 부족함이 없으리로다 (시 23:1)"
            ];
            this.log(`[묵상] ${verses[Math.floor(Math.random() * verses.length)]}`, "system");
            this.updateUI();
        }, 1000);
    }

    rest() {
        this.log("잠시 휴식을 취하며 체력을 회복합니다.", "info");
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 20);
        this.updateUI();
    }

    // --- Battle Functions ---
    startBattle(monster) {
        monster.maxHp = monster.stats.hp; // Store max HP
        monster.hp = monster.stats.hp;
        this.state.battle = { monster, isPlayerTurn: true };
        
        // Update Monster Card UI
        document.getElementById('monster-name').innerText = monster.name;
        document.getElementById('monster-grade').innerText = monster.grade;
        document.getElementById('monster-level').innerText = `Lv.${monster.level}`;
        
        this.toggleBattleUI(true);
        this.log(`${monster.name}(이)가 나타났습니다!`, "battle");
        this.updateUI();

        // Check if monster is faster
        if (monster.stats.spd > this.state.player.spd) {
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }

    playerAttack() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        
        const p = this.state.player;
        const m = this.state.battle.monster;
        
        const dmg = this.calculateDamage(p.atk, m.stats.def);
        m.hp -= dmg;
        
        document.getElementById('battle-scene').classList.add('shake');
        setTimeout(() => document.getElementById('battle-scene').classList.remove('shake'), 400);

        this.log(`${m.name}에게 ${Math.floor(dmg)}의 피해를 입혔습니다!`, "info");
        this.updateUI();

        if (m.hp <= 0) return this.winBattle();
        
        this.state.battle.isPlayerTurn = false;
        setTimeout(() => this.monsterTurn(), 1000);
    }

    monsterTurn() {
        if (!this.state.battle) return;
        
        const m = this.state.battle.monster;
        const p = this.state.player;

        const dmg = this.calculateDamage(m.stats.atk, p.def);
        p.hp -= dmg;

        document.getElementById('app').classList.add('hit-flash');
        setTimeout(() => document.getElementById('app').classList.remove('hit-flash'), 200);

        this.log(`${m.name}의 공격! ${Math.floor(dmg)}의 피해를 입었습니다.`, "battle");
        this.updateUI();

        if (p.hp <= 0) return this.loseBattle();
        
        this.state.battle.isPlayerTurn = true;
    }

    calculateDamage(atk, def) {
        const base = atk * (100 / (100 + def));
        const random = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1
        return base * random;
    }

    winBattle() {
        const m = this.state.battle.monster;
        this.log(`${m.name}을(를) 물리쳤습니다!`, "info");
        this.log(`경험치 ${m.reward.exp}, 골드 ${m.reward.gold}를 획득했습니다.`, "system");
        
        this.state.player.exp += m.reward.exp;
        this.state.player.gold += m.reward.gold;
        
        // World Saturation update
        this.state.world.saturation = Math.min(100, this.state.world.saturation + 0.5);
        
        this.state.battle = null;
        setTimeout(() => {
            this.toggleBattleUI(false);
            this.updateUI();
            this.checkLevelUp();
        }, 1500);
    }

    checkLevelUp() {
        if (this.state.player.exp >= this.state.player.nextExp) {
            this.state.player.exp -= this.state.player.nextExp;
            this.state.player.nextExp = Math.floor(this.state.player.nextExp * 1.5);
            this.state.player.atk += 2;
            this.state.player.def += 1;
            this.state.player.maxHp += 20;
            this.state.player.hp = this.state.player.maxHp;
            this.log("축하합니다! 레벨이 올랐습니다.", "system");
            this.updateUI();
        }
    }

    showSkillMenu() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        this.log("사용할 기술을 선택하세요 (로그 창에서 기술 이름을 클릭하거나, 다음 업데이트에서 메뉴가 추가됩니다)", "system");
        // 간단한 기술 실행 (프로토타입용)
        this.useSkill(this.state.player.skills[0]);
    }

    useSkill(skill) {
        const p = this.state.player;
        if (p.pp < skill.cost) return this.log("PP가 부족합니다!", "system");

        p.pp -= skill.cost;
        this.log(`${p.name}의 기술: [${skill.name}]!`, "info");

        if (skill.id === 'meditation') {
            p.hp = Math.min(p.maxHp, p.hp + 30);
            this.log("HP를 30 회복했습니다.", "info");
        } else {
            const m = this.state.battle.monster;
            const dmg = this.calculateDamage(p.atk * 1.5, m.stats.def);
            m.hp -= dmg;
            this.log(`${m.name}에게 ${Math.floor(dmg)}의 강력한 피해를 입혔습니다!`, "info");
        }

        this.updateUI();
        if (this.state.battle.monster.hp <= 0) return this.winBattle();

        this.state.battle.isPlayerTurn = false;
        setTimeout(() => this.monsterTurn(), 1000);
    }

    tryEscape() {
        if (Math.random() > 0.4) {
            this.log("무사히 도망쳤습니다!", "info");
            this.state.battle = null;
            this.toggleBattleUI(false);
            this.updateUI();
        } else {
            this.log("도망치는 데 실패했습니다!", "battle");
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
