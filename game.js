/**
 * Basileia - Game Engine Core
 */

class GameEngine {
    constructor() {
        this.state = {
            player: {
                name: "순례자",
                title: "Pilgrim",
                level: 1,
                hp: 80,
                maxHp: 80,
                pp: 30,
                maxPp: 30,
                atk: 8,
                def: 4,
                spd: 95,
                faith: 1,
                exp: 0,
                nextExp: 80,
                gold: 0,
                bonusPoints: 0,
                skills: [
                    { id: 'meditation', name: '묵상', cost: 10 },
                    { id: 'praise', name: '찬양', cost: 15 }
                ]
            },
            world: {
                currentRegionId: "pishon",
                saturation: 0,
                isNavigating: false,
                explorationProgress: 0,
                bossDefeated: false
            }
        };

        this.inventory = new window.InventoryManager();
        this.init();
    }

    init() {
        if (typeof window !== 'undefined' && window.AuthManager) {
            const user = window.AuthManager.getCurrentUser();
            if (!user) {
                document.getElementById('auth-overlay').classList.remove('hidden');
                this.bindAuthEvents();
                return; // Stop initialization until logged in
            }
        }

        const savedData = window.StorageManager.load();
        if (savedData) {
            this.state = savedData;
            // Backward compatibility
            if (!this.state.world.currentRegionId) this.state.world.currentRegionId = "pishon";
            if (this.state.world.explorationProgress === undefined) this.state.world.explorationProgress = 0;
            if (this.state.world.bossDefeated === undefined) this.state.world.bossDefeated = false;
            
            // 세션 관련 휘발성 상태는 로드 시 초기화
            this.state.world.isNavigating = false;
            this.state.battle = null;
            
            if (this.state.inventoryData) {
                this.inventory = new window.InventoryManager(this.state.inventoryData);
            }
            this.log("이전의 여정을 이어갑니다...", "system");
        } else {
            // 새 게임인 경우 닉네임 로드
            if (typeof window !== 'undefined' && window.AuthManager) {
                this.state.player.name = window.AuthManager.getNickname();
            }
        }

        this.bindEvents();
        this.toggleBattleUI(false);
        this.hideVerseOverlay();
        this.updateUI();
        this.renderTabContent('inventory'); // 추가: 게임 시작 시 인벤토리 목록 렌더링
        this.log("세상이 회색빛으로 물들었습니다. 당신의 순례는 여기서부터 시작됩니다.", "system");
    }

    saveGame() {
        this.state.inventoryData = this.inventory.serialize();
        window.StorageManager.save(this.state);
    }

    bindEvents() {
        // Explore Actions
        document.getElementById('btn-explore').addEventListener('click', () => this.explore());
        document.getElementById('btn-worship').addEventListener('click', () => this.worship());
        document.getElementById('btn-rest').addEventListener('click', () => this.rest());
        const bossBtn = document.getElementById('btn-boss-challenge');
        if (bossBtn) bossBtn.addEventListener('click', () => this.bossChallenge());

        // Region Transition
        const nextRegionBtn = document.createElement('button');
        nextRegionBtn.id = 'btn-next-region';
        nextRegionBtn.className = 'action-btn primary small hidden';
        nextRegionBtn.style.marginTop = '10px';
        nextRegionBtn.style.width = '100%';
        nextRegionBtn.innerText = '➡️ 다음 지역으로 이동';
        document.querySelector('.quest-section').appendChild(nextRegionBtn);
        nextRegionBtn.addEventListener('click', () => this.handleRegionTransition());

        // Battle Actions
        document.getElementById('btn-attack').addEventListener('click', () => this.playerAttack());
        document.getElementById('btn-skill').addEventListener('click', () => this.showSkillMenu());
        document.getElementById('btn-run').addEventListener('click', () => this.tryEscape());

        // UI Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Stat Point Buttons
        document.querySelectorAll('.point-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.spendPoint(e.target.dataset.stat));
        });

        // Verse Card Actions (Phase 3)
        document.getElementById('btn-close-verse').addEventListener('click', () => this.hideVerseOverlay());
        document.getElementById('btn-download-verse').addEventListener('click', () => this.downloadVerseCard());
        document.getElementById('verse-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'verse-overlay') this.hideVerseOverlay();
        });

        // Phase 6: Settings Actions
        const settingsOverlay = document.getElementById('settings-overlay');
        document.getElementById('btn-settings').addEventListener('click', () => {
            if (window.AuthManager) {
                document.getElementById('settings-nickname').value = window.AuthManager.getNickname();
                document.getElementById('settings-msg').innerText = '';
            }
            settingsOverlay.classList.remove('hidden');
        });
        
        document.getElementById('btn-update-nickname').addEventListener('click', () => {
            const newVal = document.getElementById('settings-nickname').value;
            const msgEl = document.getElementById('settings-msg');
            const res = window.AuthManager.updateNickname(newVal);
            if (res.success) {
                this.state.player.name = newVal;
                this.updateUI();
                msgEl.style.color = '#4caf50';
                msgEl.innerText = res.msg;
                this.saveGame();
            } else {
                msgEl.style.color = '#ff4b2b';
                msgEl.innerText = res.msg;
            }
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
        });
        document.getElementById('btn-logout').addEventListener('click', () => {
            window.AuthManager.logout();
            window.location.reload();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("경고: 모든 플레이 데이터가 삭제됩니다.\n정말 처음부터 다시 시작하시겠습니까?")) {
                window.StorageManager.clear();
                window.location.reload();
            }
        });
    }

    bindAuthEvents() {
        const authOverlay = document.getElementById('auth-overlay');
        const authId = document.getElementById('auth-id');
        const authPw = document.getElementById('auth-pw');
        const authMsg = document.getElementById('auth-msg');

        document.getElementById('btn-login').addEventListener('click', () => {
            const res = window.AuthManager.login(authId.value, authPw.value);
            if (res.success) {
                authOverlay.classList.add('hidden');
                window.location.reload();
            } else {
                authMsg.innerText = res.msg;
                authMsg.style.color = '#ff4b2b';
            }
        });

        document.getElementById('btn-register').addEventListener('click', () => {
            const res = window.AuthManager.register(authId.value, authPw.value);
            authMsg.innerText = res.msg;
            authMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
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
            if (this.inventory.items.length === 0) {
                container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
            } else {
                this.inventory.items.forEach(itemInfo => {
                    const itemData = window.GAME_DATA.items[itemInfo.id];
                    const div = document.createElement('div');
                    div.className = `list-item inventory-item ${itemData.grade.toLowerCase()}`;
                    div.innerHTML = `
                        <div class="item-info">
                            <span class="name">${itemData.name}</span>
                            <span class="count">x${itemInfo.count}</span>
                        </div>
                        ${itemData.slot ? '<button class="equip-btn">장착</button>' : ''}
                    `;
                    if (itemData.slot) {
                        div.querySelector('.equip-btn').onclick = () => this.equipItem(itemInfo.id);
                    }
                    container.appendChild(div);
                });
            }
        } else if (tabId === 'equipment') {
            const slots = ['weapon', 'armor', 'helmet', 'accessory', 'boots', 'offhand'];
            slots.forEach(slot => {
                const itemId = this.inventory.equipment[slot];
                const div = document.createElement('div');
                div.className = 'equipment-item';
                
                let content = `<span class="slot-name">${slot}</span>`;
                if (itemId) {
                    const item = window.GAME_DATA.items[itemId];
                    content += `
                        <span class="name ${item.grade.toLowerCase()}">${item.name}</span>
                        <button class="unequip-btn">해제</button>
                    `;
                } else {
                    content += `<span class="empty-slot">비어있음</span>`;
                }
                
                div.innerHTML = content;
                if (itemId) {
                    div.querySelector('.unequip-btn').onclick = () => this.unequipItem(slot);
                }
                container.appendChild(div);
            });
        } else if (tabId === 'skills') {
            this.state.player.skills.forEach(skill => {
                const item = document.createElement('div');
                item.className = 'list-item skill-item';
                item.innerHTML = `<span>${skill.name}</span> <span class="cost">PP ${skill.cost}</span>`;
                container.appendChild(item);
            });
        }
    }

    equipItem(itemId) {
        if (this.inventory.equip(itemId)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`[장비] ${item.name}을(를) 장착했습니다.`, "system");
            this.updateUI();
            this.renderTabContent('inventory');
            this.saveGame();
        }
    }

    unequipItem(slot) {
        if (this.inventory.unequip(slot)) {
            this.log(`[장비] 장비를 해제했습니다.`, "system");
            this.updateUI();
            this.renderTabContent('equipment');
            this.saveGame();
        }
    }

    spendPoint(stat) {
        if (this.state.player.bonusPoints <= 0) return;
        
        this.state.player.bonusPoints--;
        if (stat === 'atk') this.state.player.atk += 2;
        else if (stat === 'def') this.state.player.def += 1;
        else if (stat === 'faith') this.state.player.faith += 1;
        
        this.log(`[성장] ${stat.toUpperCase()} 스탯에 포인트를 투자했습니다.`, "system");
        this.updateUI();
        this.saveGame();
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
        const b = this.inventory.getBonuses();

        const totalAtk = p.atk + b.atk;
        const totalDef = p.def + b.def;
        const totalMaxHp = p.maxHp + b.hp;
        const totalMaxPp = p.maxPp + b.pp;
        const totalSpd = p.spd + b.spd;

        const charNameEl = document.getElementById('char-name');
        if (charNameEl) charNameEl.innerText = p.name;

        document.getElementById('hp-bar').style.width = `${(p.hp / totalMaxHp) * 100}%`;
        document.getElementById('hp-text').innerText = `${Math.round(p.hp)} / ${totalMaxHp}`;
        document.getElementById('pp-bar').style.width = `${(p.pp / totalMaxPp) * 100}%`;
        document.getElementById('pp-text').innerText = `${Math.round(p.pp)} / ${totalMaxPp}`;
        
        document.getElementById('atk-value').innerText = totalAtk;
        document.getElementById('def-value').innerText = totalDef;
        document.getElementById('faith-value').innerText = p.faith;

        if (this.state.battle) {
            const m = this.state.battle.monster;
            document.getElementById('monster-hp-bar').style.width = `${(m.hp / m.maxHp) * 100}%`;
            document.getElementById('monster-hp-text').innerText = `${Math.round(m.hp)} / ${m.maxHp}`;
        }

        const questBar = document.getElementById('quest-bar');
        if (questBar) {
            const regionData = window.GAME_DATA.regions[w.currentRegionId];
            questBar.style.width = `${w.explorationProgress}%`;
            document.getElementById('quest-text').innerText = `${Math.round(w.explorationProgress)}%`;
            document.getElementById('quest-title').innerText = `${regionData.name} 탐사`;
            
            const bossBtn = document.getElementById('btn-boss-challenge');
            bossBtn.classList.toggle('hidden', w.bossDefeated);

            const nextRegionBtn = document.getElementById('btn-next-region');
            const hasNextRegion = w.currentRegionId === 'pishon'; // Currently only pishon -> gihon
            nextRegionBtn.classList.toggle('hidden', !w.bossDefeated || !hasNextRegion);

            // Update Theme Color
            document.documentElement.style.setProperty('--accent-color', regionData.themeColor);
            const r = parseInt(regionData.themeColor.slice(1, 3), 16);
            const g = parseInt(regionData.themeColor.slice(3, 5), 16);
            const b_val = parseInt(regionData.themeColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b_val}, 0.3)`);
        }

        const saturationFill = document.getElementById('saturation-fill');
        if (saturationFill) saturationFill.style.width = `${w.saturation}%`;
        const saturationVal = document.getElementById('saturation-value');
        if (saturationVal) saturationVal.innerText = `${w.saturation.toFixed(1)}%`;
        document.body.style.setProperty('--world-saturation', w.saturation);

        const pointEl = document.getElementById('bonus-points');
        if (pointEl) pointEl.innerText = p.bonusPoints;

        document.querySelectorAll('.point-btn').forEach(btn => {
            btn.classList.toggle('hidden', p.bonusPoints <= 0);
        });
    }

    toggleBattleUI(isBattle) {
        document.getElementById('explore-actions').classList.toggle('hidden', isBattle);
        document.getElementById('battle-actions').classList.toggle('hidden', !isBattle);
        document.getElementById('battle-scene').classList.toggle('hidden', !isBattle);
    }

    // --- FX Functions (Phase 3) ---
    spawnDamagePopup(targetEl, value, isCrit, isMonsterDamage) {
        const rect = targetEl.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = `damage-popup ${isCrit ? 'critical' : ''} ${isMonsterDamage ? 'monster-dmg' : ''}`;
        popup.innerText = (isCrit ? 'CRITICAL! ' : '') + Math.round(value);
        
        // Randomize spawn position slightly
        const randomX = (Math.random() - 0.5) * 40;
        popup.style.left = `${rect.left + rect.width / 2 + randomX}px`;
        popup.style.top = `${rect.top}px`;
        
        document.body.appendChild(popup);
        
        // Auto-remove
        setTimeout(() => popup.remove(), 1000);
    }

    showVerseOverlay(verseText, reference) {
        const overlay = document.getElementById('verse-overlay');
        const content = document.getElementById('verse-content');
        const ref = document.getElementById('verse-ref');
        
        content.innerText = verseText;
        ref.innerText = reference;
        
        overlay.classList.remove('hidden');
        
        // Auto-hide after 5 seconds if not closed
        this.verseTimer = setTimeout(() => this.hideVerseOverlay(), 5000);
    }

    hideVerseOverlay() {
        document.getElementById('verse-overlay').classList.add('hidden');
        if (this.verseTimer) clearTimeout(this.verseTimer);
    }

    async downloadVerseCard() {
        const card = document.getElementById('verse-card');
        const canvas = await html2canvas(card, {
            backgroundColor: '#111',
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `Basileia_Verse_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    // --- Explore Functions ---
    explore() {
        if (this.state.world.isNavigating || this.state.battle) return;
        this.state.world.isNavigating = true;
        this.log("주변을 탐험합니다...", "info");

        setTimeout(() => {
            try {
                if (this.state.world.explorationProgress >= 100 && !this.state.world.bossDefeated) {
                    this.state.world.isNavigating = false; // 보스 챌린지 전 상태 해제 필수
                    this.bossChallenge();
                    return;
                }

                const playerLv = this.state.player.level || 1;
                const roll = Math.random();
                const regionId = this.state.world.currentRegionId || 'pishon';
                const regionData = window.GAME_DATA.regions[regionId];

                // 조우 확률 75%
                if (roll < 0.75) {
                    const normalGrades = ['F', 'E', 'D', 'C'];
                    const monsterList = window.GAME_DATA.monsters.filter(m =>
                        m.regionId === regionId &&
                        normalGrades.includes(m.grade) &&
                        m.minPlayerLv <= playerLv &&
                        m.maxPlayerLv >= playerLv &&
                        (!regionData || m.id !== regionData.bossId)
                    );

                    if (monsterList.length === 0) {
                        const fallback = window.GAME_DATA.monsters.filter(m => m.grade === 'F');
                        const randomMonster = JSON.parse(JSON.stringify(fallback[Math.floor(Math.random() * fallback.length)]));
                        this.startBattle(randomMonster);
                    } else {
                        const randomMonster = JSON.parse(JSON.stringify(monsterList[Math.floor(Math.random() * monsterList.length)]));
                        this.startBattle(randomMonster);
                    }
                } else {
                    this.log("고요한 길을 따라 걷습니다. 아무 일도 일어나지 않았습니다.", "info");
                }
            } catch (err) {
                console.error("Explore Error:", err);
                this.log("탐험 중 알 수 없는 문제가 발생했습니다.", "system");
            } finally {
                this.state.world.isNavigating = false;
                this.updateUI(); // 상태 반영을 위해 UI 업데이트 호출
            }
        }, 800);
    }

    bossChallenge() {
        if (this.state.world.isNavigating || this.state.battle) return;
        
        const regionData = window.GAME_DATA.regions[this.state.world.currentRegionId];
        const bossId = regionData.bossId; 
        const bossData = window.GAME_DATA.monsters.find(m => m.id === bossId);
        
        if (!bossData) return;
        
        this.log(`${regionData.name}의 강력한 기운이 확산됩니다... ${bossData.name}와(과) 조우했습니다!`, "battle");
        
        const bossMonster = JSON.parse(JSON.stringify(bossData));
        bossMonster.isBoss = true;
        
        this.startBattle(bossMonster);
    }

    handleRegionTransition() {
        // Find next region logic (currently sequential pishon -> gihon)
        const nextRegionId = this.state.world.currentRegionId === 'pishon' ? 'gihon' : null;
        if (!nextRegionId) return;

        const nextRegion = window.GAME_DATA.regions[nextRegionId];
        const playerLevel = this.state.player.level;

        if (playerLevel < nextRegion.minLevel) {
            const proceed = confirm(`⚠️ 경고: [${nextRegion.name}]의 권장 진입 레벨은 ${nextRegion.minLevel}입니다.\n현재 레벨(${playerLevel})로는 매우 위험할 수 있습니다. 그래도 이동하시겠습니까?`);
            if (!proceed) return;
        }

        this.moveToRegion(nextRegionId);
    }

    moveToRegion(regionId) {
        const region = window.GAME_DATA.regions[regionId];
        this.state.world.currentRegionId = regionId;
        this.state.world.explorationProgress = 0;
        this.state.world.bossDefeated = false;

        this.log(`✨ 새로운 지역: [${region.name}]에 도착했습니다.`, "system");
        this.log(`📜 ${region.description}`, "info");

        this.updateUI();
        this.saveGame();
    }

    worship() {
        const bonus = this.inventory.getBonuses();
        const totalMaxPp = this.state.player.maxPp + bonus.pp;

        if (this.state.player.pp >= totalMaxPp) return this.log("이미 영적으로 충만한 상태입니다.", "system");
        this.log("조용히 눈을 감고 예배를 드립니다...", "info");
        setTimeout(() => {
            this.state.player.pp = totalMaxPp;
            const verses = [
                { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
                { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" },
                { text: "강하고 담대하라 두려워하지 말며 놀라지 말라", ref: "여호수아 1:9" },
                { text: "너는 내게 부르짖으라 내가 네게 응답하겠고 네가 알지 못하는 크고 은밀한 일을 네게 보이리라", ref: "예레미야 33:3" }
            ];
            const verse = verses[Math.floor(Math.random() * verses.length)];
            this.log(`[묵상] ${verse.text} (${verse.ref})`, "system");
            this.showVerseOverlay(verse.text, verse.ref);
            this.updateUI();
            this.saveGame();
        }, 1000);
    }

    rest() {
        const bonus = this.inventory.getBonuses();
        const totalMaxHp = this.state.player.maxHp + bonus.hp;

        this.log("잠시 휴식을 취하며 체력을 회복합니다.", "info");
        this.state.player.hp = Math.min(totalMaxHp, this.state.player.hp + 20);
        this.updateUI();
        this.saveGame();
    }

    // --- Battle Functions ---
    startBattle(monster) {
        monster.maxHp = monster.stats.hp;
        monster.hp = monster.stats.hp;
        this.state.battle = { monster, isPlayerTurn: true };
        
        document.getElementById('monster-name').innerText = monster.name;
        document.getElementById('monster-grade').innerText = monster.grade;
        document.getElementById('monster-level').innerText = `Lv.${monster.level}`;
        
        this.toggleBattleUI(true);
        this.log(`${monster.name}(이)가 나타났습니다!`, "battle");
        this.updateUI();

        const bonus = this.inventory.getBonuses();
        const totalSpd = this.state.player.spd + bonus.spd;

        if (monster.stats.spd > totalSpd) {
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }

    playerAttack() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        
        const p = this.state.player;
        const b = this.inventory.getBonuses();
        const m = this.state.battle.monster;
        
        const isCrit = Math.random() < 0.1; // 10% base crit chance
        const totalAtk = p.atk + b.atk;
        let dmg = this.calculateDamage(totalAtk, m.stats.def);
        if (isCrit) dmg *= 1.5;
        dmg = Math.round(dmg);
        
        m.hp -= dmg;
        
        const targetEl = document.querySelector('.monster-card');
        const sceneEl = document.getElementById('battle-scene');
        
        if (isCrit) {
            sceneEl.classList.add('shake-heavy');
            document.getElementById('app').classList.add('crit-flash');
            setTimeout(() => {
                sceneEl.classList.remove('shake-heavy');
                document.getElementById('app').classList.remove('crit-flash');
            }, 500);
        } else {
            sceneEl.classList.add('shake');
            setTimeout(() => sceneEl.classList.remove('shake'), 400);
        }

        this.spawnDamagePopup(targetEl, dmg, isCrit, false);
        this.log(`${m.name}에게 ${dmg}${isCrit ? '!!! (강력한 일격)' : ''}의 피해를 입혔습니다!`, "info");
        this.updateUI();

        if (m.hp <= 0) return this.winBattle();
        
        this.state.battle.isPlayerTurn = false;
        setTimeout(() => this.monsterTurn(), 1000);
    }

    monsterTurn() {
        if (!this.state.battle) return;
        
        const m = this.state.battle.monster;
        const p = this.state.player;
        const b = this.inventory.getBonuses();

        const totalDef = p.def + b.def;
        const dmg = Math.round(this.calculateDamage(m.stats.atk, totalDef));
        p.hp -= dmg;

        const targetEl = document.querySelector('.character-pane');
        this.spawnDamagePopup(targetEl, dmg, false, true);

        document.getElementById('app').classList.add('hit-flash');
        setTimeout(() => document.getElementById('app').classList.remove('hit-flash'), 200);

        this.log(`${m.name}의 공격! ${dmg}의 피해를 입었습니다.`, "battle");
        this.updateUI();

        if (p.hp <= 0) return this.loseBattle();
        
        this.state.battle.isPlayerTurn = true;
        this.log("▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.", "system");
    }

    calculateDamage(atk, def) {
        const base = atk * (100 / (100 + def));
        const random = 0.9 + Math.random() * 0.2;
        return base * random;
    }

    winBattle() {
        const m = this.state.battle.monster;
        this.log(`${m.name}을(를) 물리쳤습니다!`, "info");
        
        this.log(`경험치 ${m.reward.exp}, 골드 ${m.reward.gold}를 획득했습니다.`, "system");
        this.state.player.exp += m.reward.exp;
        this.state.player.gold += m.reward.gold;
        
        this.calculateDrops(m.dropTableId);

        if (m.isBoss) {
            const regionName = window.GAME_DATA.regions[this.state.world.currentRegionId].name;
            this.log(`[시나리오 달성] ${regionName}의 주인을 물리쳤습니다! 다음 지역으로 나아갈 수 있습니다.`, "system");
            this.state.world.bossDefeated = true;
            this.state.world.explorationProgress = 100;
            this.state.world.saturation = Math.min(100, this.state.world.saturation + 10);
        } else {
            if (!this.state.world.bossDefeated) {
                this.state.world.explorationProgress = Math.min(100, this.state.world.explorationProgress + 10);
            }
            this.state.world.saturation = Math.min(100, this.state.world.saturation + 0.1);
        }
        
        this.state.battle = null;
        setTimeout(() => {
            this.toggleBattleUI(false);
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active').dataset.tab);
            this.checkLevelUp();
            this.saveGame();
        }, 1500);
    }

    loseBattle() {
        this.log("무리한 순례로 인해 탈진했습니다...", "battle");
        this.state.player.hp = 10;
        this.state.player.gold = Math.floor(this.state.player.gold * 0.8);
        this.state.battle = null;
        
        setTimeout(() => {
            this.toggleBattleUI(false);
            this.updateUI();
            this.saveGame();
        }, 2000);
    }

    calculateDrops(dropTableId) {
        const table = window.GAME_DATA.dropTables[dropTableId];
        if (!table) return;

        table.forEach(drop => {
            const roll = Math.random();
            if (roll < drop.chance) {
                this.addItem(drop.itemId);
            }
        });
    }

    addItem(itemId) {
        if (this.inventory.addItem(itemId)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`아이템 획득: [${item.name}]`, "system");
        }
    }

    checkLevelUp() {
        while (this.state.player.exp >= this.state.player.nextExp) {
            this.state.player.exp -= this.state.player.nextExp;
            this.state.player.level++;
            this.state.player.nextExp = Math.floor(this.state.player.nextExp * 1.5);

            // 레벨업 시 기본 스탯 자동 증가
            this.state.player.maxHp  += 12;
            this.state.player.maxPp  += 4;
            this.state.player.atk   += 2;
            this.state.player.def   += 1;
            this.state.player.spd   += 2;

            // 보너스 포인트 지급
            this.state.player.bonusPoints += 2;

            this.log(`🎉 레벨 업! 이제 Lv.${this.state.player.level} 순례자입니다!`, "system");
            this.log(`[성장] HP+12 PP+4 공격+2 방어+1 속도+2 / 보너스 포인트 +2`, "system");

            // HP/PP 전량 회복
            const bonus = this.inventory.getBonuses();
            this.state.player.hp = this.state.player.maxHp + bonus.hp;
            this.state.player.pp = this.state.player.maxPp + bonus.pp;

            this.updateUI();
        }
    }

    showSkillMenu() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        let html = `<h3 style="margin-bottom: 20px;">어떤 능력을 사용하시겠습니까?</h3>`;
        html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
        
        this.state.player.skills.forEach(skill => {
            const canUse = this.state.player.pp >= skill.cost;
            html += `<button class="action-btn ${canUse ? 'primary' : 'secondary'}" data-skill="${skill.id}" ${canUse ? '' : 'disabled'} style="width: 100%;">
                ${skill.name} <span style="font-size: 0.8rem; opacity: 0.7;">(PP ${skill.cost} 소모)</span>
            </button>`;
        });
        
        html += `<button class="action-btn" id="btn-cancel-skill" style="margin-top:10px; width: 100%;">취소</button>`;
        html += `</div>`;
        
        content.innerHTML = html;
        modal.classList.remove('hidden');

        content.querySelectorAll('button[data-skill]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.currentTarget.getAttribute('data-skill');
                const selectedSkill = this.state.player.skills.find(s => s.id === skillId);
                modal.classList.add('hidden');
                if (selectedSkill) this.useSkill(selectedSkill);
            });
        });
        
        document.getElementById('btn-cancel-skill').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    useSkill(skill) {
        const p = this.state.player;
        const b = this.inventory.getBonuses();
        const totalMaxPp = p.maxPp + b.pp;

        if (p.pp < skill.cost) return this.log("PP가 부족합니다!", "system");

        p.pp -= skill.cost;
        this.log(`${p.name}의 기술: [${skill.name}]!`, "info");

        if (skill.id === 'meditation') {
            const totalMaxHp = p.maxHp + b.hp;
            p.hp = Math.min(totalMaxHp, p.hp + 30);
            this.log("HP를 30 회복했습니다.", "info");
        } else {
            const m = this.state.battle.monster;
            const targetEl = document.querySelector('.monster-card');
            const totalAtk = p.atk + b.atk;
            const dmg = Math.round(this.calculateDamage(totalAtk * 1.5, m.stats.def));
            m.hp -= dmg;
            this.spawnDamagePopup(targetEl, dmg, true, false); // Skills often count as crit-like visual
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
