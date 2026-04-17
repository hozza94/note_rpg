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
                hpRegen: 0,
                exp: 0,
                nextExp: 80,
                gold: 0,
                bonusPoints: 0,
                classId: 'pilgrim',
                activeSkillIds: ['meditation', 'praise', 'proclaim'],
                unlockedSkillNodes: ['pilgrim_origin'],
                skillTreePoints: 0,
                autoBattleEnabled: false,
                autoExploreEnabled: false,
                selectedAvatarId: 'male_base',
                unlockedAvatarIds: (Array.isArray(window.GAME_DATA?.avatars?.defaultUnlockedIds) && window.GAME_DATA.avatars.defaultUnlockedIds.length
                    ? [...window.GAME_DATA.avatars.defaultUnlockedIds]
                    : ['male_base', 'female_aa', 'female_swim']),
                avatarGender: 'male',
                equipmentViewMode: 'avatar',
                equippedRelicId: null,
                ownedRelicIds: []
            },
            world: {
                currentRegionId: "pishon",
                saturation: 0,
                isNavigating: false,
                explorationProgress: 0,
                bossDefeated: false,
                bossDungeonUnlocked: {},
                bossClearHistory: {},
                bossDropPity: {},
                bossDungeonAuto: { active: false, bossId: null, startedAt: 0, runCount: 0 }
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

        this.bindMainLayoutScrollHints();

        const savedData = window.StorageManager.load();
        if (savedData) {
            this.state = savedData;
            this.ensureStateSchema();
            
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

        this.ensureStateSchema();
        this.bindEvents();
        this.toggleBattleUI(false);
        this.hideVerseOverlay();
        this.updateUI();
        this.renderTabContent('inventory'); // 추가: 게임 시작 시 인벤토리 목록 렌더링
        this.renderEquipmentPanel();
        this.refreshScrollHint(document.querySelector('.character-pane-scroll-body'));
        this.refreshScrollHint(document.querySelector('.tab-scroll-body'));
        this.log("세상이 회색빛으로 물들었습니다. 당신의 순례는 여기서부터 시작됩니다.", "system");
    }

    // ensureStateSchema: js/engine/state-schema.js (skilltree.js 이후 로드)

    // 스킬트리/토스트 관련 메서드는 js/engine/skilltree.js에서 GameEngine.prototype에 주입

    saveGame() {
        this.state.inventoryData = this.inventory.serialize();
        window.StorageManager.save(this.state);
    }

    bindEvents() {
        // Explore Actions
        document.getElementById('btn-explore').addEventListener('click', () => this.explore());
        document.getElementById('btn-auto-explore').addEventListener('click', () => this.toggleAutoExplore());
        document.getElementById('btn-worship').addEventListener('click', () => this.worship());
        document.getElementById('btn-rest').addEventListener('click', () => this.rest());
        document.getElementById('btn-facility-fab')?.addEventListener('click', () => this.openFacilityHub());
        const bossBtn = document.getElementById('btn-boss-challenge');
        if (bossBtn) bossBtn.addEventListener('click', () => this.bossChallenge());
        document.getElementById('btn-boss-dungeon')?.addEventListener('click', () => this.openBossDungeonModal());

        // Region Transition
        const prevRegionBtn = document.createElement('button');
        prevRegionBtn.id = 'btn-prev-region';
        prevRegionBtn.className = 'action-btn small hidden';
        prevRegionBtn.style.marginTop = '10px';
        prevRegionBtn.style.width = '100%';
        prevRegionBtn.innerText = '⬅️ 이전 지역으로 이동';
        document.querySelector('.quest-section').appendChild(prevRegionBtn);
        prevRegionBtn.addEventListener('click', () => this.handlePreviousRegionTransition());

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
        document.getElementById('btn-auto-battle').addEventListener('click', () => this.toggleAutoBattle());

        // UI Tabs (배지 span 클릭 대응)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const t = e.target.closest('.tab-btn');
                const id = t && t.dataset ? t.dataset.tab : null;
                if (id) this.switchTab(id);
            });
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
            this.syncSettingsAvatarRadios();
            settingsOverlay.classList.remove('hidden');
        });

        document.getElementById('settings-avatar-options')?.addEventListener('change', (e) => {
            const t = e.target;
            if (!t || t.id !== 'settings-avatar-select') return;
            const avatarId = t.value;
            if (avatarId) this.selectAvatar(avatarId);
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
        document.getElementById('btn-open-backup-manager')?.addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
            this.openBackupManagerModal();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.showConfirmModal({
                title: '데이터 초기화',
                message: '경고: 모든 플레이 데이터가 삭제됩니다.\n정말 처음부터 다시 시작하시겠습니까?',
                confirmText: '초기화',
                cancelText: '취소',
                danger: true
            }).then((ok) => {
                if (!ok) return;
                window.StorageManager.clear();
                window.location.reload();
            });
        });

        this.bindCharacterStatTooltipEvents();
    }

    // 자동전투/자동순례 관련 메서드는 js/engine/explore.js에서 GameEngine.prototype에 주입

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

    spendPoint(stat) {
        if (this.state.player.bonusPoints <= 0) return;
        
        this.state.player.bonusPoints--;
        if (stat === 'atk') this.state.player.atk += 2;
        else if (stat === 'def') this.state.player.def += 1;
        else if (stat === 'faith') this.state.player.faith += 1;
        else if (stat === 'hpRegen') this.state.player.hpRegen += 10;
        
        const statKo = { atk: '공격', def: '방어', faith: '신앙', hpRegen: '체력재생' };
        this.showToast(`${statKo[stat] || stat.toUpperCase()} 스탯에 포인트를 투자했습니다.`, 'success');
        this.updateUI();
        this.saveGame();
    }

    log(message, type = 'info', extraClass = '') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}${extraClass ? ` ${extraClass}` : ''}`.trim();
        entry.innerText = message;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
        logContainer.dispatchEvent(new Event('scroll'));
        this.refreshScrollHint(logContainer);
    }

    /** 로그 HTML(신뢰 가능한 문자열만 전달 — 사용자 입력은 escapeLogHtml 처리) */
    logHtml(html, type = 'info', extraClass = '') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}${extraClass ? ` ${extraClass}` : ''}`.trim();
        entry.innerHTML = html;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
        logContainer.dispatchEvent(new Event('scroll'));
        this.refreshScrollHint(logContainer);
    }

    escapeLogHtml(text) {
        const s = String(text ?? '');
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    /** 성물 소환: 전설·신화 등급 획득 시 화면 연출 */
    showRelicGachaSpotlight(tier) {
        const t = tier === 'mythic' ? 'mythic' : 'legendary';
        let el = document.getElementById('relic-gacha-spotlight');
        if (!el) {
            el = document.createElement('div');
            el.id = 'relic-gacha-spotlight';
            el.setAttribute('aria-hidden', 'true');
            document.body.appendChild(el);
        }
        el.className = '';
        el.innerHTML = `
            <div class="relic-spotlight-burst"></div>
            <div class="relic-spotlight-ring"></div>
            <div class="relic-spotlight-title ${t}">${t === 'mythic' ? '신화 등급!' : '전설 등급!'}</div>
        `;
        void el.offsetWidth;
        el.classList.add('show', t);
        clearTimeout(this._relicSpotlightTimer);
        this._relicSpotlightTimer = setTimeout(() => {
            el.classList.remove('show');
        }, 2800);
    }

    updateUI() {
        const p = this.state.player;
        const w = this.state.world;
        const totals = this.getPlayerCombinedStats();
        const equipBonuses = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
        const totalAtk = totals.atk;
        const totalDef = totals.def;
        const totalFaith = totals.faith;
        const totalSpd = totals.spd;
        const totalHpRegen = totals.hpRegen;
        const totalLifeSteal = Math.max(0, Number(totals.lifeSteal || 0));
        const totalMaxHp = totals.hp;
        const totalMaxPp = totals.pp;

        const charNameEl = document.getElementById('char-name');
        if (charNameEl) charNameEl.innerText = p.name;
        const charStatTip = document.getElementById('char-stat-tooltip');
        if (charStatTip) {
            charStatTip.innerHTML = this.buildCharacterStatTooltipHtml();
            const hoverZone = document.querySelector('.char-title-hover-zone');
            if (hoverZone?.matches(':hover') && typeof this._repositionCharStatTooltip === 'function') {
                requestAnimationFrame(() => this._repositionCharStatTooltip());
            }
        }
        const charLevelEl = document.getElementById('char-level');
        if (charLevelEl) charLevelEl.innerText = `Lv.${p.level || 1}`;

        document.getElementById('hp-bar').style.width = `${(p.hp / totalMaxHp) * 100}%`;
        document.getElementById('hp-text').innerText = `${Math.round(p.hp)} / ${totalMaxHp}`;
        document.getElementById('pp-bar').style.width = `${(p.pp / totalMaxPp) * 100}%`;
        document.getElementById('pp-text').innerText = `${Math.round(p.pp)} / ${totalMaxPp}`;

        const nextExp = Math.max(1, p.nextExp || 80);
        const expBar = document.getElementById('exp-bar');
        const expText = document.getElementById('exp-text');
        if (expBar && expText) {
            const expPct = Math.min(100, (p.exp / nextExp) * 100);
            expBar.style.width = `${expPct}%`;
            expText.innerText = `${Math.floor(p.exp)} / ${nextExp}`;
        }
        
        document.getElementById('atk-value').innerText = totalAtk;
        document.getElementById('def-value').innerText = totalDef;
        document.getElementById('faith-value').innerText = totalFaith;
        const spdValueEl = document.getElementById('spd-value');
        if (spdValueEl) spdValueEl.innerText = totalSpd;
        const hpRegenValueEl = document.getElementById('hpregen-value');
        if (hpRegenValueEl) hpRegenValueEl.innerText = totalHpRegen;
        const lifeStealValueEl = document.getElementById('lifesteal-value');
        if (lifeStealValueEl) lifeStealValueEl.innerText = `${Math.round(totalLifeSteal * 100)}%`;
        const atkBonusEl = document.getElementById('atk-equip-bonus');
        const defBonusEl = document.getElementById('def-equip-bonus');
        const faithBonusEl = document.getElementById('faith-equip-bonus');
        const spdBonusEl = document.getElementById('spd-equip-bonus');
        const hpRegenBonusEl = document.getElementById('hpregen-equip-bonus');
        const lifeStealBonusEl = document.getElementById('lifesteal-equip-bonus');
        if (atkBonusEl) {
            const bonus = Number(equipBonuses.atk || 0);
            atkBonusEl.innerText = this.formatSingleEquipBonusText(bonus);
            atkBonusEl.classList.toggle('is-zero', bonus === 0);
        }
        if (defBonusEl) {
            const bonus = Number(equipBonuses.def || 0);
            defBonusEl.innerText = this.formatSingleEquipBonusText(bonus);
            defBonusEl.classList.toggle('is-zero', bonus === 0);
        }
        if (faithBonusEl) {
            const bonus = Number(equipBonuses.faith || 0);
            faithBonusEl.innerText = this.formatSingleEquipBonusText(bonus);
            faithBonusEl.classList.toggle('is-zero', bonus === 0);
        }
        if (spdBonusEl) {
            const bonus = Number(equipBonuses.spd || 0);
            spdBonusEl.innerText = this.formatSingleEquipBonusText(bonus);
            spdBonusEl.classList.toggle('is-zero', bonus === 0);
        }
        if (hpRegenBonusEl) {
            const bonus = Number(equipBonuses.hpRegen || 0);
            hpRegenBonusEl.innerText = this.formatSingleEquipBonusText(bonus);
            hpRegenBonusEl.classList.toggle('is-zero', bonus === 0);
        }
        if (lifeStealBonusEl) {
            const bonus = Number(equipBonuses.lifeSteal || 0);
            const pct = Math.round(bonus * 100);
            const sign = pct > 0 ? '+' : '';
            lifeStealBonusEl.innerText = `${sign}${pct}%`;
            lifeStealBonusEl.classList.toggle('is-zero', pct === 0);
        }
        const critChanceEl = document.getElementById('crit-chance-value');
        if (critChanceEl) critChanceEl.innerText = `${Math.round((0.1 + (totals.critChance || 0)) * 100)}%`;
        const critDamageEl = document.getElementById('crit-damage-value');
        if (critDamageEl) critDamageEl.innerText = `${Math.round((totals.critDamageMul || 1.5) * 100)}%`;
        const goldEl = document.getElementById('gold-value');
        if (goldEl) goldEl.innerText = `${p.gold} G`;
        const talentEl = document.getElementById('talent-value');
        if (talentEl) {
            const talent = Math.max(0, Number(p.relicToken || 0));
            talentEl.innerText = `${talent.toFixed(2).replace(/\.?0+$/, '')} T`;
        }

        if (this.state.battle) {
            const m = this.state.battle.monster;
            const clampedMonsterHp = Math.max(0, Math.round(m.hp));
            const hpPercent = m.maxHp > 0 ? (clampedMonsterHp / m.maxHp) * 100 : 0;
            document.getElementById('monster-hp-bar').style.width = `${Math.max(0, hpPercent)}%`;
            document.getElementById('monster-hp-text').innerText = `${clampedMonsterHp} / ${m.maxHp}`;
            this.renderBattleStatus();
        } else {
            const battleStatusEl = document.getElementById('battle-status');
            if (battleStatusEl) {
                battleStatusEl.classList.add('hidden');
                battleStatusEl.innerHTML = '';
            }
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
            const hasNextRegion = !!regionData.nextRegionId;
            nextRegionBtn.classList.toggle('hidden', !w.bossDefeated || !hasNextRegion);
            const prevRegionBtn = document.getElementById('btn-prev-region');
            const prevRegionId = this.getPreviousRegionId ? this.getPreviousRegionId(w.currentRegionId) : null;
            if (prevRegionBtn) prevRegionBtn.classList.toggle('hidden', !prevRegionId);

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
        const skillPointEl = document.getElementById('skill-tree-points');
        if (skillPointEl) skillPointEl.innerText = p.skillTreePoints;
        const stBadge = document.getElementById('skill-tree-tab-badge');
        if (stBadge) {
            const pts = Math.max(0, Number(p.skillTreePoints || 0));
            stBadge.textContent = String(pts);
            stBadge.classList.toggle('hidden', pts <= 0);
        }

        document.querySelectorAll('.point-btn').forEach(btn => {
            btn.classList.toggle('hidden', p.bonusPoints <= 0);
        });

        this.renderEquipmentPanel();
        this.updateAutoBattleButton();
        this.updateAutoExploreButton();
        if (typeof this.renderCharacterBattleEffectsStrip === 'function') {
            this.renderCharacterBattleEffectsStrip();
        }
    }

    // 전투 UI/FX, 말씀 오버레이 메서드는 모듈에서 주입됨

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

    // 탐험/지역/예배/휴식 메서드는 모듈에서 주입됨
    // 아이템 스탯·강화·상점 UI: js/engine/item-stats.js, ui-shop.js 등
    // 대장간: js/engine/smithing.js · 전투: js/engine/battle.js

    calculateDrops(dropTableId) {
        const table = window.GAME_DATA.dropTables[dropTableId];
        if (!table) return;

        table.forEach(drop => {
            const roll = Math.random();
            if (roll < drop.chance) {
                const minQty = Math.max(1, Number(drop.minQty || 1));
                const maxQty = Math.max(minQty, Number(drop.maxQty || minQty));
                const qty = minQty + Math.floor(Math.random() * (maxQty - minQty + 1));
                this.addItem(drop.itemId, qty);
            }
        });
    }

    addItem(itemId, count = 1) {
        const qty = Math.max(1, Math.floor(Number(count) || 1));
        if (this.inventory.addItem(itemId, qty)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`아이템 획득: [${item.name}] x${qty}`, "system");
        }
    }

    checkLevelUp() {
        while (this.state.player.exp >= this.state.player.nextExp) {
            this.state.player.exp -= this.state.player.nextExp;
            this.state.player.level++;
            // 레벨이 올라갈수록 요구치가 과도하게 치솟지 않도록 완만화
            this.state.player.nextExp = Math.floor(this.state.player.nextExp * 1.32);

            // 레벨업 시 기본 스탯 자동 증가
            this.state.player.maxHp  += 12;
            this.state.player.maxPp  += 4;
            this.state.player.atk   += 2;
            this.state.player.def   += 1;
            this.state.player.spd   += 2;

            // 보너스 포인트 지급
            this.state.player.bonusPoints += 2;
            this.state.player.skillTreePoints += 3;

            this.log(`🎉 레벨 업! 이제 Lv.${this.state.player.level} 순례자입니다!`, "system");
            this.log(`[성장] HP+12 PP+4 공격+2 방어+1 속도+2 / 보너스 포인트 +2 / 스킬트리 포인트 +3`, "system");

            // HP/PP 전량 회복
            const totals = this.getPlayerCombinedStats();
            this.state.player.hp = totals.hp;
            this.state.player.pp = totals.pp;

            this.updateUI();
        }
    }

    // 전투 메뉴/스킬/도주 메서드는 js/engine/battle.js에서 주입됨
}

if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
