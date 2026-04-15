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
        this.log("세상이 회색빛으로 물들었습니다. 당신의 순례는 여기서부터 시작됩니다.", "system");
    }

    ensureStateSchema() {
        if (!this.state.player) this.state.player = {};
        if (!this.state.world) this.state.world = {};

        const playerDefaults = {
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
            smithLevel: 1,
            itemEnhance: {},
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
        };
        Object.entries(playerDefaults).forEach(([key, value]) => {
            if (this.state.player[key] === undefined || this.state.player[key] === null) {
                this.state.player[key] = value;
            }
        });

        // 구버전 세이브 호환: skills[] -> activeSkillIds
        if ((!Array.isArray(this.state.player.activeSkillIds) || this.state.player.activeSkillIds.length === 0) && Array.isArray(this.state.player.skills)) {
            this.state.player.activeSkillIds = this.state.player.skills.map(skill => skill.id);
        }

        if (!Array.isArray(this.state.player.activeSkillIds) || this.state.player.activeSkillIds.length === 0) {
            this.state.player.activeSkillIds = ['meditation', 'praise', 'proclaim'];
        }
        if (!this.state.player.activeSkillIds.includes('proclaim')) {
            this.state.player.activeSkillIds.push('proclaim');
        }
        if (typeof window !== 'undefined' && window.GAME_DATA?.skills) {
            this.state.player.activeSkillIds = (this.state.player.activeSkillIds || []).filter(id => {
                const s = window.GAME_DATA.skills[id];
                return s && !s.bossOnly;
            });
        }

        const skillTree = this.getSkillTreeConfig();
        const startNodeId = skillTree?.startNodeId || 'pilgrim_origin';
        if (!Array.isArray(this.state.player.unlockedSkillNodes)) {
            this.state.player.unlockedSkillNodes = [startNodeId];
        }
        if (!this.state.player.unlockedSkillNodes.includes(startNodeId)) {
            this.state.player.unlockedSkillNodes.unshift(startNodeId);
        }

        // 레벨 대비 스킬포인트 보정: (레벨-1) * 3 총 획득량을 최소 기준으로 맞춤
        // 총 획득량 = (현재 보유 포인트) + (이미 해금한 노드 수-시작노드)
        const nodeMap = this.getSkillTreeNodeMap ? this.getSkillTreeNodeMap() : {};
        const unlockedNodeCount = (this.state.player.unlockedSkillNodes || [])
            .filter((id, idx, arr) => arr.indexOf(id) === idx)
            .filter(id => id !== startNodeId && !!nodeMap[id])
            .length;
        const level = Math.max(1, Number(this.state.player.level || 1));
        const targetEarnedSkillPoints = Math.max(0, (level - 1) * 3);
        const currentEarnedSkillPoints = Math.max(0, Number(this.state.player.skillTreePoints || 0)) + unlockedNodeCount;
        const compensation = Math.max(0, targetEarnedSkillPoints - currentEarnedSkillPoints);
        if (compensation > 0) {
            this.state.player.skillTreePoints += compensation;
        }

        this.syncUnlockedActiveSkills();
        // 구버전 호환 필드 유지(저장 안정성)
        this.state.player.skills = this.getActiveSkills().map(skill => ({ id: skill.id, name: skill.name, cost: skill.cost }));

        if (this.state.player.avatarGender !== 'male' && this.state.player.avatarGender !== 'female') {
            this.state.player.avatarGender = 'male';
        }
        const avatarCatalog = this.getAvatarCatalog();
        const avatarIds = avatarCatalog.map(a => a.id);
        const avatarDefaults = window.GAME_DATA?.avatars || {};
        const defaultUnlockedIds = Array.isArray(avatarDefaults.defaultUnlockedIds) && avatarDefaults.defaultUnlockedIds.length
            ? avatarDefaults.defaultUnlockedIds
            : ['male_base'];
        const defaultSelectedId = avatarDefaults.defaultSelectedId || defaultUnlockedIds[0] || 'male_base';
        if (!Array.isArray(this.state.player.unlockedAvatarIds)) {
            this.state.player.unlockedAvatarIds = [...defaultUnlockedIds];
        }
        this.state.player.unlockedAvatarIds = Array.from(new Set(
            this.state.player.unlockedAvatarIds.filter(id => avatarIds.includes(id))
        ));
        defaultUnlockedIds.forEach(id => {
            if (avatarIds.includes(id) && !this.state.player.unlockedAvatarIds.includes(id)) {
                this.state.player.unlockedAvatarIds.push(id);
            }
        });
        // 구버전 호환: avatarGender 기반으로 기본 아바타 선택
        if (!this.state.player.selectedAvatarId) {
            this.state.player.selectedAvatarId = this.state.player.avatarGender === 'female'
                ? (avatarIds.includes('female_aa') ? 'female_aa' : defaultSelectedId)
                : defaultSelectedId;
        }
        if (!avatarIds.includes(this.state.player.selectedAvatarId)) {
            this.state.player.selectedAvatarId = defaultSelectedId;
        }
        if (!this.state.player.unlockedAvatarIds.includes(this.state.player.selectedAvatarId)) {
            this.state.player.unlockedAvatarIds.push(this.state.player.selectedAvatarId);
        }
        const selectedMeta = avatarCatalog.find(a => a.id === this.state.player.selectedAvatarId);
        this.state.player.avatarGender = selectedMeta?.gender === 'female' ? 'female' : 'male';
        if (this.state.player.equipmentViewMode !== 'avatar' && this.state.player.equipmentViewMode !== 'edit') {
            this.state.player.equipmentViewMode = 'avatar';
        }
        if (typeof this.state.player.smithLevel !== 'number') {
            this.state.player.smithLevel = 1;
        }
        if (!this.state.player.itemEnhance || typeof this.state.player.itemEnhance !== 'object' || Array.isArray(this.state.player.itemEnhance)) {
            this.state.player.itemEnhance = {};
        }

        if (!this.state.world.currentRegionId) this.state.world.currentRegionId = "pishon";
        if (this.state.world.saturation === undefined) this.state.world.saturation = 0;
        if (this.state.world.explorationProgress === undefined) this.state.world.explorationProgress = 0;
        if (this.state.world.bossDefeated === undefined) this.state.world.bossDefeated = false;
        if (!this.state.world.bossDungeonUnlocked || typeof this.state.world.bossDungeonUnlocked !== 'object' || Array.isArray(this.state.world.bossDungeonUnlocked)) {
            this.state.world.bossDungeonUnlocked = {};
        }
        if (!this.state.world.bossClearHistory || typeof this.state.world.bossClearHistory !== 'object' || Array.isArray(this.state.world.bossClearHistory)) {
            this.state.world.bossClearHistory = {};
        }
        if (!this.state.world.bossDropPity || typeof this.state.world.bossDropPity !== 'object' || Array.isArray(this.state.world.bossDropPity)) {
            this.state.world.bossDropPity = {};
        }
        if (!this.state.world.bossDungeonAuto || typeof this.state.world.bossDungeonAuto !== 'object' || Array.isArray(this.state.world.bossDungeonAuto)) {
            this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 };
        } else {
            if (typeof this.state.world.bossDungeonAuto.active !== 'boolean') this.state.world.bossDungeonAuto.active = false;
            if (this.state.world.bossDungeonAuto.bossId === undefined) this.state.world.bossDungeonAuto.bossId = null;
            if (typeof this.state.world.bossDungeonAuto.startedAt !== 'number') this.state.world.bossDungeonAuto.startedAt = 0;
            if (typeof this.state.world.bossDungeonAuto.runCount !== 'number') this.state.world.bossDungeonAuto.runCount = 0;
        }
        this.updateBossDungeonUnlocks();

        if (!Array.isArray(this.state.player.ownedRelicIds)) this.state.player.ownedRelicIds = [];
        if (this.state.player.equippedRelicId === undefined) this.state.player.equippedRelicId = null;
        if (this.state.player.ownedRelicIds.length === 0 && window.GAME_DATA?.relics?.relic_morning_dew) {
            this.state.player.ownedRelicIds.push('relic_morning_dew');
            if (!this.state.player.equippedRelicId) this.state.player.equippedRelicId = 'relic_morning_dew';
        }
        this.state.player.ownedRelicIds = Array.from(new Set(
            this.state.player.ownedRelicIds.filter(id => window.GAME_DATA?.relics?.[id])
        ));
        if (this.state.player.equippedRelicId && !this.state.player.ownedRelicIds.includes(this.state.player.equippedRelicId)) {
            this.state.player.equippedRelicId = null;
        }

        // 세션 관련 휘발성 상태는 로드 시 초기화
        this.state.world.isNavigating = false;
        this.state.battle = null;
    }

    /** 성물 장착 시 스킬트리 패시브 합산 */
    applyRelicPassivesToBonuses(bonuses) {
        const rid = this.state.player?.equippedRelicId;
        const spec = rid && window.GAME_DATA?.relics?.[rid]?.specials;
        if (!spec || !bonuses) return;
        if (spec.ppOnHitChance) bonuses.ppOnHitChance = (bonuses.ppOnHitChance || 0) + spec.ppOnHitChance;
        if (spec.ppOnHitAmount) bonuses.ppOnHitAmount = (bonuses.ppOnHitAmount || 0) + spec.ppOnHitAmount;
        if (spec.doubleStrikeChance) bonuses.doubleStrikeChance = (bonuses.doubleStrikeChance || 0) + spec.doubleStrikeChance;
    }

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
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
        document.getElementById('btn-smith')?.addEventListener('click', () => this.openBlacksmithModal());
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
        document.getElementById('btn-sync-upload').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
            this.openBackupManagerModal();
        });
        document.getElementById('btn-sync-download').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
            this.openBackupManagerModal();
        });
        document.getElementById('btn-open-skilltree-settings').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
            this.openSkillTreeModal();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("경고: 모든 플레이 데이터가 삭제됩니다.\n정말 처음부터 다시 시작하시겠습니까?")) {
                window.StorageManager.clear();
                window.location.reload();
            }
        });

        this.bindCharacterStatTooltipEvents();
    }

    /** 닉네임/ⓘ 호버 시 툴팁 — 좌측 캐릭터 블록 옆에 붙여 표시(뷰포트 밖으로 밀리지 않음) */
    bindCharacterStatTooltipEvents() {
        const zone = document.querySelector('.char-title-hover-zone');
        const tip = document.getElementById('char-stat-tooltip');
        const infoBtn = document.getElementById('char-stat-info-btn');
        if (!zone || !tip) return;

        const GAP = 8;
        const PAD = 8;

        const placeAnchored = () => {
            const z = document.querySelector('.char-title-hover-zone');
            if (!z || !tip) return;
            const r = z.getBoundingClientRect();
            const maxW = Math.min(232, window.innerWidth - 24);
            tip.style.position = 'fixed';
            tip.style.maxWidth = `${maxW}px`;
            tip.style.width = 'auto';

            const apply = () => {
                const tw = tip.getBoundingClientRect().width || maxW;
                const th = tip.getBoundingClientRect().height || 120;
                let left = r.right + GAP;
                let top = r.top;
                if (left + tw > window.innerWidth - PAD) {
                    left = r.left - tw - GAP;
                }
                if (left < PAD) left = PAD;
                if (left + tw > window.innerWidth - PAD) {
                    left = Math.max(PAD, window.innerWidth - tw - PAD);
                }
                if (top + th > window.innerHeight - PAD) {
                    top = Math.max(PAD, window.innerHeight - th - PAD);
                }
                if (top < PAD) top = PAD;
                tip.style.left = `${left}px`;
                tip.style.top = `${top}px`;
            };

            requestAnimationFrame(apply);
        };

        zone.addEventListener('mouseenter', placeAnchored);
        zone.addEventListener('focusin', () => {
            if (infoBtn) placeAnchored();
        });

        window.addEventListener('resize', placeAnchored);
        document.querySelector('.character-pane')?.addEventListener('scroll', placeAnchored, { passive: true });

        this._repositionCharStatTooltip = placeAnchored;
    }

    buildCharacterStatTooltipHtml() {
        const t = this.getPlayerCombinedStats();
        const row = (label, val) => `<div class="char-stat-tooltip__row"><span>${label}</span><span>${val}</span></div>`;
        const parts = ['<div class="char-stat-tooltip__head">최종 합산<br><span class="char-stat-tooltip__head-sub">기본·장비·패시브</span></div>'];
        parts.push(row('공격', t.atk));
        parts.push(row('방어', t.def));
        parts.push(row('최대 HP', t.hp));
        parts.push(row('최대 PP', t.pp));
        parts.push(row('속도', t.spd));
        parts.push(row('신앙', t.faith));
        parts.push(row('체력재생', t.hpRegen));
        parts.push(row('생명력 흡수', `${Math.round((t.lifeSteal || 0) * 100)}%`));
        const critPct = Math.round((0.1 + (t.critChance || 0)) * 100);
        parts.push(row('치명타 확률', `${critPct}%`));
        parts.push(row('치명타 피해', `${Math.round((t.critDamageMul || 1.5) * 100)}%`));
        if ((t.evadeChance || 0) > 0) {
            parts.push(row('회피', `${Math.round(t.evadeChance * 100)}%`));
        }
        const dm = t.damageMul || 1;
        if (Math.abs(dm - 1) > 1e-5) {
            const p = Math.round((dm - 1) * 100);
            parts.push(row('가하는 피해', `${p >= 0 ? '+' : ''}${p}%`));
        }
        const dtm = t.damageTakenMul || 1;
        if (Math.abs(dtm - 1) > 1e-5) {
            if (dtm < 1) parts.push(row('받는 피해', `-${Math.round((1 - dtm) * 100)}%`));
            else parts.push(row('받는 피해', `+${Math.round((dtm - 1) * 100)}%`));
        }
        const low = t.lowHpDamageMul || 1;
        if (Math.abs(low - 1) > 1e-5) {
            const p = Math.round((low - 1) * 100);
            parts.push(row('HP 50% 이하 피해', `${p >= 0 ? '+' : ''}${p}%`));
        }
        if (this.state.battle) {
            parts.push('<div class="char-stat-tooltip__battle-note">전투 중 강화·다음 치명·선공 속도는<br>닉네임 아래 「전투 중 효과」 참고</div>');
        }
        return parts.join('');
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

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        this.renderTabContent(tabId);
    }

    renderTabContent(tabId) {
        const container = document.getElementById('inventory-list');
        container.innerHTML = '';
        if (tabId === 'equipment') tabId = 'inventory';

        if (tabId === 'relics') {
            this.renderRelicsTab(container);
            return;
        }

        if (tabId === 'inventory') {
            if (this.inventory.items.length === 0) {
                container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
            } else {
                this.inventory.items.forEach(itemInfo => {
                    const itemData = window.GAME_DATA.items[itemInfo.id];
                    const enhanceLv = this.getItemEnhanceLevel(itemInfo.id);
                    const enhanceClass = this.getEnhanceVisualClass(enhanceLv, itemInfo.id);
                    const div = document.createElement('div');
                    const bossExclusiveClass = this.isBossExclusiveItem(itemInfo.id) ? 'boss-exclusive' : '';
                    div.className = `list-item inventory-item ${itemData.grade.toLowerCase()} ${enhanceClass} ${bossExclusiveClass}`;
                    const detailLine = this.formatShopItemDetails(itemData, itemInfo.id);
                    const displayName = this.getItemDisplayName(itemInfo.id, itemData);
                    div.innerHTML = `
                        <div class="item-info">
                            <span class="name">${displayName}</span>
                            <span class="count">x${itemInfo.count}</span>
                            <span class="item-meta">${detailLine}</span>
                        </div>
                        ${itemData.slot ? '<button class="equip-btn">장착</button>' : ''}
                    `;
                    if (itemData.slot) {
                        div.querySelector('.equip-btn').onclick = () => this.equipItem(itemInfo.id);
                    }
                    container.appendChild(div);
                });
            }
        } else if (tabId === 'skills') {
            const activeSkills = this.getActiveSkills();
            const nodeMap = this.getSkillTreeNodeMap();
            const passiveNodes = (this.state.player.unlockedSkillNodes || [])
                .map(nodeId => nodeMap[nodeId])
                .filter(node => !!node && node.kind !== 'start' && node.kind !== 'active_unlock');

            const section = document.createElement('div');
            section.className = 'skill-tab-sections';
            section.innerHTML = `
                <div class="skill-tree-header">
                    <span class="skill-tree-point">스킬트리 포인트: <strong id="skill-tree-points">${this.state.player.skillTreePoints}</strong></span>
                    <button id="btn-open-skilltree" class="action-btn small primary">스킬트리 열기</button>
                </div>
                <div class="skill-group">
                    <h4>액티브 스킬</h4>
                    <div id="active-skill-list"></div>
                </div>
                <div class="skill-group">
                    <h4>패시브 스킬</h4>
                    <div id="passive-skill-list"></div>
                </div>
            `;
            container.appendChild(section);

            const activeList = section.querySelector('#active-skill-list');
            const passiveList = section.querySelector('#passive-skill-list');

            if (activeSkills.length === 0) {
                activeList.innerHTML = '<div class="empty-msg">배운 액티브 스킬이 없습니다.</div>';
            } else {
                activeSkills.forEach(skillData => {
                    const item = document.createElement('div');
                    item.className = 'skill-card active';
                    const tooltip = this.formatActiveSkillTooltip(skillData);
                    item.innerHTML = `
                        <div class="skill-card-main">
                            <div class="skill-card-title-row">
                                <span class="skill-card-title">${skillData.name}</span>
                                <span class="skill-card-cost">PP ${skillData.cost || 0}</span>
                            </div>
                            <div class="skill-card-meta">${skillData.type === 'buff' ? '강화 스킬' : '공격 스킬'}</div>
                            <div class="skill-card-desc">${skillData.desc || ''}</div>
                            <div class="skill-tooltip">${tooltip}</div>
                        </div>
                    `;
                    activeList.appendChild(item);
                });
            }

            if (passiveNodes.length === 0) {
                passiveList.innerHTML = '<div class="empty-msg">배운 패시브 스킬이 없습니다.</div>';
            } else {
                passiveNodes.forEach(node => {
                    const item = document.createElement('div');
                    item.className = 'skill-card passive';
                    const tooltip = this.formatPassiveSkillTooltip(node);
                    item.innerHTML = `
                        <div class="skill-card-main">
                            <div class="skill-card-title-row">
                                <span class="skill-card-title">${node.name}</span>
                                <span class="skill-card-cost">${node.kind === 'keystone' ? '핵심' : '패시브'}</span>
                            </div>
                            <div class="skill-card-meta">패시브 노드</div>
                            <div class="skill-card-desc">${node.desc || ''}</div>
                            <div class="skill-tooltip">${tooltip}</div>
                        </div>
                    `;
                    passiveList.appendChild(item);
                });
            }

            const openTreeBtn = section.querySelector('#btn-open-skilltree');
            if (openTreeBtn) openTreeBtn.addEventListener('click', () => this.openSkillTreeModal());
        }
    }

    renderRelicsTab(container) {
        const regionId = this.state.world.currentRegionId || 'pishon';
        const offers = window.GAME_DATA.relicShops?.[regionId] || [];
        const owned = this.state.player.ownedRelicIds || [];
        const eq = this.state.player.equippedRelicId;
        const relics = window.GAME_DATA.relics || {};

        const wrap = document.createElement('div');
        wrap.className = 'relic-tab-panel';
        wrap.innerHTML = `
            <p class="relic-hint">성물은 <strong>1개만 장착</strong>하며 효과가 스킬트리 패시브와 <strong>합산</strong>됩니다.
            우측 <strong>스킬</strong> 탭에서 <strong>스킬트리 열기</strong>로 노드 그래프를 열 수 있습니다.</p>
            <div class="skill-group">
                <h4>장착 중</h4>
                <div id="relic-equipped-slot"></div>
            </div>
            <div class="skill-group">
                <h4>보유 성물</h4>
                <div id="relic-owned-wrap"></div>
            </div>
            <div class="skill-group" id="relic-shop-section" style="display:${offers.length ? 'block' : 'none'}">
                <h4>이 지역 성물 상인</h4>
                <div id="relic-shop-wrap"></div>
            </div>
        `;
        container.appendChild(wrap);

        const eqSlot = wrap.querySelector('#relic-equipped-slot');
        if (eq && relics[eq]) {
            const r = relics[eq];
            const card = document.createElement('div');
            card.className = 'relic-card equipped';
            card.innerHTML = `
                <div class="relic-name">${r.name}</div>
                <div class="relic-meta">${r.grade || ''}</div>
                <p style="font-size:0.85rem;margin:6px 0;">${r.desc || ''}</p>
                <button type="button" class="action-btn small secondary btn-relic-unequip">장착 해제</button>
            `;
            card.querySelector('.btn-relic-unequip').addEventListener('click', () => {
                this.state.player.equippedRelicId = null;
                this.saveGame();
                this.updateUI();
                this.renderTabContent('relics');
                this.log('[성물] 장착을 해제했습니다.', 'system');
            });
            eqSlot.appendChild(card);
        } else {
            eqSlot.innerHTML = '<div class="empty-msg">장착한 성물이 없습니다.</div>';
        }

        const ownedWrap = wrap.querySelector('#relic-owned-wrap');
        if (owned.length === 0) {
            ownedWrap.innerHTML = '<div class="empty-msg">보유한 성물이 없습니다.</div>';
        } else {
            owned.forEach(rid => {
                const r = relics[rid];
                if (!r) return;
                const row = document.createElement('div');
                row.className = 'relic-card';
                row.style.marginBottom = '8px';
                const isEq = eq === rid;
                row.innerHTML = `
                    <div class="relic-name">${r.name}</div>
                    <div class="relic-meta">${r.grade || ''}${isEq ? ' · 장착 중' : ''}</div>
                    <p style="font-size:0.85rem;margin:6px 0;">${r.desc || ''}</p>
                    ${isEq ? '' : '<button type="button" class="action-btn small primary btn-relic-equip">장착</button>'}
                `;
                const b = row.querySelector('.btn-relic-equip');
                if (b) {
                    b.addEventListener('click', () => {
                        this.state.player.equippedRelicId = rid;
                        this.saveGame();
                        this.updateUI();
                        this.renderTabContent('relics');
                        this.log(`[성물] ${r.name}을(를) 장착했습니다.`, 'effect');
                    });
                }
                ownedWrap.appendChild(row);
            });
        }

        const shopWrap = wrap.querySelector('#relic-shop-wrap');
        offers.forEach(entry => {
            const r = relics[entry.relicId];
            if (!r) return;
            const ownedHere = owned.includes(entry.relicId);
            const row = document.createElement('div');
            row.className = 'relic-card';
            row.style.marginBottom = '8px';
            row.innerHTML = `
                <div class="relic-name">${r.name}</div>
                <div class="relic-meta">${r.grade || ''} · ${entry.price}G</div>
                <p style="font-size:0.85rem;margin:6px 0;">${r.desc || ''}</p>
                <button type="button" class="action-btn small primary btn-relic-buy" ${ownedHere ? 'disabled' : ''}>${ownedHere ? '이미 보유' : '구매'}</button>
            `;
            if (!ownedHere) {
                row.querySelector('.btn-relic-buy').addEventListener('click', () => this.buyRelic(entry.relicId, entry.price));
            }
            shopWrap.appendChild(row);
        });
    }

    buyRelic(relicId, price) {
        if (this.state.battle) return this.log('전투 중에는 구매할 수 없습니다.', 'system');
        const r = window.GAME_DATA.relics?.[relicId];
        if (!r) return;
        const owned = this.state.player.ownedRelicIds || [];
        if (owned.includes(relicId)) return this.log('이미 보유한 성물입니다.', 'system');
        const p = price || 0;
        if (this.state.player.gold < p) return this.log('골드가 부족합니다.', 'system');
        this.state.player.gold -= p;
        owned.push(relicId);
        this.state.player.ownedRelicIds = owned;
        this.log(`[성물] ${r.name}을(를) ${p}G에 구입했습니다.`, 'effect');
        this.saveGame();
        this.updateUI();
        this.renderTabContent('relics');
    }

    getAvatarCatalog() {
        const dataList = window.GAME_DATA?.avatars?.list;
        if (Array.isArray(dataList) && dataList.length) return dataList;
        return [{ id: 'male_base', label: '남성 기본', gender: 'male', image: 'assets/avatars/Avatar_M.png', unlockType: 'default', unlockHint: '기본 해금' }];
    }

    getAvatarImagePath() {
        const catalog = this.getAvatarCatalog();
        const selected = catalog.find(a => a.id === this.state.player.selectedAvatarId);
        if (selected?.image) return selected.image;
        const g = this.state.player.avatarGender === 'female' ? 'female' : 'male';
        return g === 'female' ? 'assets/avatars/Avatar_F_AA.png' : 'assets/avatars/Avatar_M.png';
    }

    toggleEquipmentViewMode() {
        this.state.player.equipmentViewMode = this.state.player.equipmentViewMode === 'edit' ? 'avatar' : 'edit';
        this.saveGame();
        this.renderEquipmentPanel();
    }

    selectAvatar(avatarId) {
        const catalog = this.getAvatarCatalog();
        const selected = catalog.find(a => a.id === avatarId);
        if (!selected) return;
        const unlocked = this.state.player.unlockedAvatarIds || [];
        if (!unlocked.includes(avatarId)) {
            this.showToast("아직 해금되지 않은 아바타입니다.", "warn");
            return;
        }
        this.state.player.selectedAvatarId = avatarId;
        this.state.player.avatarGender = selected.gender === 'female' ? 'female' : 'male';
        this.syncSettingsAvatarRadios();
        this.saveGame();
        this.renderEquipmentPanel();
    }

    syncSettingsAvatarRadios() {
        const host = document.getElementById('settings-avatar-options');
        if (!host) return;
        const catalog = this.getAvatarCatalog();
        const unlockedIds = this.state.player.unlockedAvatarIds || [];
        let selectedId = this.state.player.selectedAvatarId || 'male_base';
        if (!unlockedIds.includes(selectedId)) {
            selectedId = catalog.find((a) => unlockedIds.includes(a.id))?.id || unlockedIds[0] || 'male_base';
        }

        const sel = document.createElement('select');
        sel.id = 'settings-avatar-select';
        sel.className = 'settings-avatar-select';
        sel.setAttribute('aria-label', '캐릭터 아바타');
        catalog.forEach((avatar) => {
            const isUnlocked = unlockedIds.includes(avatar.id);
            const opt = document.createElement('option');
            opt.value = avatar.id;
            opt.textContent = isUnlocked ? avatar.label : `${avatar.label} (잠금)`;
            if (!isUnlocked) opt.disabled = true;
            sel.appendChild(opt);
        });
        sel.value = selectedId;
        if (sel.value !== selectedId) {
            const firstOk = catalog.find((a) => unlockedIds.includes(a.id));
            if (firstOk) sel.value = firstOk.id;
        }

        host.replaceChildren(sel);
    }

    getEquipmentSlotConfig() {
        return [
            { slot: 'helmet', label: '머리', x: 50, y: 12, icon: '🪖' },
            { slot: 'armor', label: '갑주', x: 50, y: 34, icon: '🛡️' },
            { slot: 'accessory', label: '허리', x: 50, y: 58, icon: '🎗️' },
            { slot: 'boots', label: '발', x: 50, y: 82, icon: '🥾' },
            { slot: 'weapon', label: '주무기', x: 17, y: 46, icon: '⚔️' },
            { slot: 'offhand', label: '보조', x: 83, y: 46, icon: '🧿' }
        ];
    }

    openEquipmentSlotModal(slot) {
        const slotKo = {
            weapon: '주무기',
            armor: '갑옷',
            helmet: '투구',
            accessory: '벨트/장신구',
            boots: '신발',
            offhand: '보조장비'
        };
        const equippedItemId = this.inventory.equipment[slot];
        const equippedItem = equippedItemId ? window.GAME_DATA.items[equippedItemId] : null;
        const candidates = this.inventory.items
            .filter(itemInfo => window.GAME_DATA.items[itemInfo.id]?.slot === slot)
            .map(itemInfo => ({ info: itemInfo, data: window.GAME_DATA.items[itemInfo.id] }));

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const equippedBossClass = equippedItemId && this.isBossExclusiveItem(equippedItemId) ? 'boss-exclusive' : '';
        const equippedSection = equippedItem
            ? `
                <div class="equip-choice-current ${equippedBossClass}">
                    <div class="name ${equippedItem.grade.toLowerCase()}">${this.getItemDisplayName(equippedItemId, equippedItem)}</div>
                    <div class="effect">${this.formatShopItemDetails(equippedItem, equippedItemId)}</div>
                    <button id="btn-equip-unequip" class="action-btn small secondary">장착 해제</button>
                </div>
            `
            : '<div class="empty-msg" style="padding:14px;">현재 장착된 아이템이 없습니다.</div>';

        const candidateRows = candidates.length > 0
            ? candidates.map(({ info, data }) => `
                <div class="equip-choice-row ${data.grade.toLowerCase()} ${this.isBossExclusiveItem(info.id) ? 'boss-exclusive' : ''}">
                    <div class="main">
                        <div class="name">${this.getItemDisplayName(info.id, data)} <span class="count">x${info.count}</span></div>
                        <div class="effect">${this.formatShopItemDetails(data, info.id)}</div>
                        <div class="desc">${data.desc || ''}</div>
                    </div>
                    <button class="action-btn small primary" data-equip-item="${info.id}">장착</button>
                </div>
            `).join('')
            : '<div class="empty-msg" style="padding:14px;">이 부위에 장착 가능한 아이템이 가방에 없습니다.</div>';

        content.style.width = '620px';
        content.style.maxWidth = '95vw';
        content.innerHTML = `
            <h3 style="margin-bottom: 8px;">${slotKo[slot] || slot} 장비 관리</h3>
            <section class="equip-choice-section">
                <h4>현재 장착</h4>
                ${equippedSection}
            </section>
            <section class="equip-choice-section">
                <h4>가방에서 선택</h4>
                <div class="equip-choice-list">${candidateRows}</div>
            </section>
            <button id="btn-close-equip-modal" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        const closeModal = () => {
            content.style.width = '';
            content.style.maxWidth = '';
            modal.classList.add('hidden');
        };
        document.getElementById('btn-close-equip-modal')?.addEventListener('click', closeModal);
        document.getElementById('btn-equip-unequip')?.addEventListener('click', () => {
            this.unequipItem(slot);
            closeModal();
        });
        content.querySelectorAll('[data-equip-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-equip-item');
                if (!itemId) return;
                this.equipItem(itemId);
                closeModal();
            });
        });
    }

    renderEquipmentPanel() {
        const container = document.getElementById('equipment-panel');
        if (!container) return;

        const slots = this.getEquipmentSlotConfig();
        const equipBonuses = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
        const equippedCount = slots.filter(({ slot }) => !!this.inventory.equipment[slot]).length;
        const isEdit = this.state.player.equipmentViewMode === 'edit';
        const avatarUrl = this.getAvatarImagePath();
        const modeClass = isEdit ? 'mode-edit' : 'mode-avatar';
        const footerHint = isEdit
            ? '부위를 클릭해 장착·해제'
            : '「장비 편집」에서 슬롯을 열 수 있습니다';
        const toggleLabel = isEdit ? '아바타 보기' : '장비 편집';
        const bonusSummary = this.formatEquipmentBonusSummary(equipBonuses);

        container.innerHTML = `
            <div class="equipment-avatar-panel ${modeClass}">
                <div class="equipment-avatar-toolbar">
                    <button type="button" class="action-btn small primary" id="btn-equip-view-toggle">${toggleLabel}</button>
                    <span class="equipment-avatar-hint">${isEdit ? '편집 모드' : '아바타 모드'}</span>
                </div>
                <div class="equipment-avatar-stage" style="--equip-avatar-url: url('${avatarUrl}');">
                    <div class="equipment-avatar-image" aria-hidden="true"></div>
                    <div class="equipment-slot-layer"></div>
                </div>
                <div class="equipment-avatar-footer">
                    <span>장착 수: ${equippedCount} / ${slots.length}</span>
                    <span class="equipment-total-bonus">총 장비 보정: ${bonusSummary}</span>
                    <span>${footerHint}</span>
                </div>
            </div>
        `;

        const toggleBtn = container.querySelector('#btn-equip-view-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleEquipmentViewMode());

        if (!isEdit) return;

        const layer = container.querySelector('.equipment-slot-layer');
        if (!layer) return;

        slots.forEach(meta => {
            const itemId = this.inventory.equipment[meta.slot];
            const item = itemId ? window.GAME_DATA.items[itemId] : null;
            const enhanceClass = itemId ? this.getEnhanceVisualClass(this.getItemEnhanceLevel(itemId), itemId) : '';
            const button = document.createElement('button');
            button.type = 'button';
            const bossSlotClass = itemId && this.isBossExclusiveItem(itemId) ? 'boss-exclusive' : '';
            button.className = `equipment-slot-btn ${item ? 'equipped' : 'empty'} ${item ? item.grade.toLowerCase() : ''} ${enhanceClass} ${bossSlotClass}`.trim();
            button.style.left = `${meta.x}%`;
            button.style.top = `${meta.y}%`;
            button.innerHTML = `
                <span class="slot-icon">${meta.icon}</span>
                <span class="slot-label">${meta.label}</span>
                <span class="slot-item">${item ? item.name : '비어있음'}</span>
            `;
            button.title = item
                ? `${meta.label}: ${this.getItemDisplayName(itemId, item)}\n${this.formatShopItemDetails(item, itemId)}`
                : `${meta.label}: 비어있음`;
            button.addEventListener('click', () => this.openEquipmentSlotModal(meta.slot));
            layer.appendChild(button);
        });
    }

    equipItem(itemId) {
        if (this.inventory.equip(itemId)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`[장비] ${item.name}을(를) 장착했습니다.`, "system");
            this.updateUI();
            this.renderEquipmentPanel();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
    }

    unequipItem(slot) {
        if (this.inventory.unequip(slot)) {
            this.log(`[장비] 장비를 해제했습니다.`, "system");
            this.updateUI();
            this.renderEquipmentPanel();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
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

    getRegionOrderMap() {
        const order = {};
        let cursor = 'pishon';
        let i = 0;
        while (cursor && !order[cursor] && i < 30) {
            order[cursor] = i++;
            cursor = window.GAME_DATA.regions[cursor]?.nextRegionId || null;
        }
        return order;
    }

    getCurrentRegionOrder() {
        const orderMap = this.getRegionOrderMap();
        return orderMap[this.state.world.currentRegionId] ?? 0;
    }

    updateBossDungeonUnlocks() {
        const entries = window.GAME_DATA?.bossDungeon?.entries || [];
        const unlocked = this.state.world.bossDungeonUnlocked || {};
        const orderMap = this.getRegionOrderMap();
        const currentOrder = this.getCurrentRegionOrder();
        entries.forEach(entry => {
            if (!entry?.bossId) return;
            const entryOrder = orderMap[entry.regionId] ?? Number.MAX_SAFE_INTEGER;
            if (entry.unlockType === 'region_reached' && currentOrder >= entryOrder) {
                unlocked[entry.bossId] = true;
            }
        });
        this.state.world.bossDungeonUnlocked = unlocked;
    }

    getBossDungeonEntries() {
        const entries = window.GAME_DATA?.bossDungeon?.entries || [];
        const monsters = window.GAME_DATA?.monsters || [];
        const unlocked = this.state.world.bossDungeonUnlocked || {};
        return entries
            .map(entry => {
                const boss = monsters.find(m => m.id === entry.bossId && m.isBoss);
                const region = window.GAME_DATA.regions[entry.regionId];
                if (!boss || !region) return null;
                const history = this.state.world.bossClearHistory?.[entry.bossId] || null;
                return {
                    ...entry,
                    boss,
                    region,
                    unlocked: !!unlocked[entry.bossId],
                    history
                };
            })
            .filter(Boolean);
    }

    openBossDungeonModal(filter = 'available') {
        this.updateBossDungeonUnlocks();
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        if (!modal || !content) return;

        const allEntries = this.getBossDungeonEntries();
        const visibleEntries = allEntries.filter(entry => {
            if (filter === 'all') return true;
            if (filter === 'cleared') return !!entry.history?.clearCount;
            if (filter === 'uncleared') return !entry.history?.clearCount;
            return entry.unlocked;
        });

        const orderMap = this.getRegionOrderMap();
        visibleEntries.sort((a, b) => {
            const oa = orderMap[a.regionId] ?? 999;
            const ob = orderMap[b.regionId] ?? 999;
            if (oa !== ob) return oa - ob;
            return (a.recommendedLv || a.boss.level || 1) - (b.recommendedLv || b.boss.level || 1);
        });

        const filterBtn = (id, label) => `<button class="action-btn small ${filter === id ? 'primary' : ''}" data-boss-filter="${id}">${label}</button>`;
        const cardHtml = visibleEntries.length
            ? visibleEntries.map(entry => {
                const pityCount = Number(this.state.world.bossDropPity?.[entry.bossId] || 0);
                const clearCount = Number(entry.history?.clearCount || 0);
                const lastClear = entry.history?.lastClearAt ? new Date(entry.history.lastClearAt).toLocaleString() : '기록 없음';
                const lockedText = entry.unlocked ? '' : '<span class="boss-dungeon-lock">잠금</span>';
                return `
                    <article class="boss-dungeon-card ${entry.unlocked ? '' : 'is-locked'}">
                        <div class="boss-dungeon-head">
                            <h4>${entry.boss.name} ${lockedText}</h4>
                            <span class="boss-dungeon-grade">${entry.boss.grade}</span>
                        </div>
                        <div class="boss-dungeon-meta">${entry.region.name} · 권장 Lv.${entry.recommendedLv || entry.boss.level}</div>
                        <div class="boss-dungeon-meta">클리어 ${clearCount}회 · 최근 ${lastClear}</div>
                        <div class="boss-dungeon-meta">레어 보정 스택: ${pityCount}</div>
                        <div class="boss-dungeon-actions">
                            <button class="action-btn small secondary" data-boss-drop="${entry.bossId}">드랍 보기</button>
                            <button class="action-btn small primary" data-boss-start="${entry.bossId}" ${entry.unlocked ? '' : 'disabled'}>도전</button>
                            <button class="action-btn small" data-boss-sweep="${entry.bossId}" ${(entry.unlocked && clearCount > 0) ? '' : 'disabled'}>소탕 시작</button>
                        </div>
                    </article>
                `;
            }).join('')
            : '<div class="empty-msg">조건에 맞는 보스가 없습니다.</div>';

        content.style.width = '760px';
        content.style.maxWidth = '96vw';
        content.innerHTML = `
            <h3 style="margin-bottom: 12px;">⚔️ 보스 던전</h3>
            <div class="boss-dungeon-filter-row">
                ${filterBtn('available', '도전 가능')}
                ${filterBtn('all', '전체')}
                ${filterBtn('cleared', '클리어 완료')}
                ${filterBtn('uncleared', '미클리어')}
            </div>
            <div class="boss-dungeon-list">${cardHtml}</div>
            <button id="btn-close-boss-dungeon" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        const closeModal = () => {
            content.style.width = '';
            content.style.maxWidth = '';
            modal.classList.add('hidden');
        };

        content.querySelector('#btn-close-boss-dungeon')?.addEventListener('click', closeModal);
        content.querySelectorAll('[data-boss-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextFilter = btn.getAttribute('data-boss-filter') || 'available';
                this.openBossDungeonModal(nextFilter);
            });
        });
        content.querySelectorAll('[data-boss-drop]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bossId = btn.getAttribute('data-boss-drop');
                this.openBossDropInfo(bossId);
            });
        });
        content.querySelectorAll('[data-boss-start]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bossId = btn.getAttribute('data-boss-start');
                this.startBossDungeonBattle(bossId);
            });
        });
        content.querySelectorAll('[data-boss-sweep]').forEach(btn => {
            btn.addEventListener('click', () => {
                const bossId = btn.getAttribute('data-boss-sweep');
                this.startBossDungeonSweep(bossId);
            });
        });
    }

    openBossDropInfo(bossId) {
        const drops = window.GAME_DATA?.bossExclusiveDropTables?.[bossId] || [];
        const boss = window.GAME_DATA.monsters.find(m => m.id === bossId);
        if (!boss) return;
        if (!drops.length) {
            this.showBossDropPopup("드랍 정보", "<div class='empty-msg'>이 보스의 전용 드랍 정보가 아직 없습니다.</div>");
            return;
        }
        const rows = drops.map(drop => {
            const item = window.GAME_DATA.items[drop.itemId];
            if (!item) return null;
            const qtyText = drop.maxQty && drop.maxQty > (drop.minQty || 1)
                ? ` (${drop.minQty || 1}~${drop.maxQty}개)`
                : '';
            const displayName = this.getItemDisplayName(drop.itemId, item);
            return `<div class="boss-drop-row ${this.isBossExclusiveItem(drop.itemId) ? 'boss-exclusive' : ''}">
                <span class="boss-drop-name">${displayName}</span>
                <span class="boss-drop-chance">${(Number(drop.chance || 0) * 100).toFixed(1)}%${qtyText}</span>
            </div>`;
        }).filter(Boolean);
        this.showBossDropPopup(`${boss.name} 전용 드랍`, `<div class="boss-drop-list">${rows.join('')}</div>`);
    }

    showBossDropPopup(title, bodyHtml) {
        const host = document.getElementById('modal-content');
        if (!host) return;
        const old = host.querySelector('.boss-drop-popup');
        if (old) old.remove();
        const popup = document.createElement('div');
        popup.className = 'boss-drop-popup';
        popup.innerHTML = `
            <div class="boss-drop-popup-card">
                <div class="boss-drop-popup-head">
                    <strong>${title}</strong>
                    <button type="button" class="action-btn small" id="btn-close-boss-drop-popup">닫기</button>
                </div>
                <div class="boss-drop-popup-body">${bodyHtml}</div>
            </div>
        `;
        host.appendChild(popup);
        popup.querySelector('#btn-close-boss-drop-popup')?.addEventListener('click', () => popup.remove());
    }

    startBossDungeonBattle(bossId, options = {}) {
        if (this.state.battle || this.state.world.isNavigating) return;
        const unlocked = this.state.world.bossDungeonUnlocked?.[bossId];
        if (!unlocked) {
            this.log("해당 보스는 아직 던전에서 도전할 수 없습니다.", "system");
            return;
        }
        const bossData = window.GAME_DATA.monsters.find(m => m.id === bossId && m.isBoss);
        if (!bossData) return;
        const forceAutoOff = options.forceAutoOff !== false;
        const hadAutoExplore = !!this.state.player.autoExploreEnabled;
        const hadAutoBattle = !!this.state.player.autoBattleEnabled;
        this.state.player.autoExploreEnabled = false;
        if (forceAutoOff) this.state.player.autoBattleEnabled = false;
        if (this.autoExploreTimer) {
            clearTimeout(this.autoExploreTimer);
            this.autoExploreTimer = null;
        }
        if ((hadAutoExplore || hadAutoBattle) && forceAutoOff) {
            this.log("[보스 던전] 자동순례/자동전투를 OFF로 전환하고 전투에 진입합니다.", "system");
        }
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.add('hidden');
        this.log(`[보스 던전] ${bossData.name}에게 도전합니다.`, "battle");
        this.startBattle(JSON.parse(JSON.stringify(bossData)), { source: 'boss_dungeon', bossId });
        this.updateAutoBattleButton();
        this.updateAutoExploreButton();
        this.saveGame();
    }

    startBossDungeonSweep(bossId) {
        if (!bossId) return;
        const clearCount = Number(this.state.world.bossClearHistory?.[bossId]?.clearCount || 0);
        if (clearCount <= 0) {
            this.log("[보스 소탕] 최초 클리어 이력이 있어야 소탕을 시작할 수 있습니다.", "system");
            return;
        }
        if (this.state.battle || this.state.world.isNavigating) return;
        const unlocked = this.state.world.bossDungeonUnlocked?.[bossId];
        if (!unlocked) {
            this.log("[보스 소탕] 해당 보스가 아직 해금되지 않았습니다.", "system");
            return;
        }
        this.state.player.autoExploreEnabled = false;
        this.state.player.autoBattleEnabled = true;
        if (this.autoExploreTimer) {
            clearTimeout(this.autoExploreTimer);
            this.autoExploreTimer = null;
        }
        this.state.world.bossDungeonAuto = {
            active: true,
            bossId,
            startedAt: Date.now(),
            runCount: 0
        };
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.add('hidden');
        this.log("[보스 소탕] 자동전투 ON · 반복 도전을 시작합니다. 자동전투를 OFF로 바꾸면 소탕이 중지됩니다.", "system");
        this.startBossDungeonBattle(bossId, { forceAutoOff: false });
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

    // 탐험/지역/예배/휴식 메서드는 모듈에서 주입됨

    /** 장비 등급·출처에 따른 강화 상한 (+n). 보스 전용 드랍 장비는 +30 */
    getMaxEnhanceLevelForItem(itemId) {
        if (itemId && this.isBossExclusiveItem(itemId)) {
            return Number(window.GAME_DATA?.smithing?.bossMaxEnhanceLevel || 30);
        }
        const item = itemId && window.GAME_DATA?.items?.[itemId];
        const grade = item?.grade || 'Normal';
        const caps = window.GAME_DATA?.smithing?.gradeMaxEnhance;
        if (caps && typeof caps[grade] === 'number') return caps[grade];
        return Number(window.GAME_DATA?.smithing?.maxEnhanceLevel || 20);
    }

    getItemEnhanceLevel(itemId) {
        if (!itemId) return 0;
        const lv = Number(this.state.player.itemEnhance?.[itemId] || 0);
        const max = this.getMaxEnhanceLevelForItem(itemId);
        return Math.max(0, Math.min(max, lv));
    }

    getItemFinalStats(itemId, itemData = null) {
        const item = itemData || window.GAME_DATA.items[itemId];
        if (!item || !item.stats) return null;
        const level = this.getItemEnhanceLevel(itemId);
        if (level <= 0) return { ...item.stats };
        const smith = window.GAME_DATA?.smithing || {};
        const rates = (itemId && this.isBossExclusiveItem(itemId) && Array.isArray(smith.bossEnhanceRates))
            ? smith.bossEnhanceRates
            : (smith.enhanceRates || [0]);
        const rate = Number(rates[level] || 0);
        const out = {};
        const lifeStealMaxMultiplier = 2.5; // 요청 기준: 생명력 흡수는 최대 2.5배까지만 강화 반영
        Object.entries(item.stats).forEach(([k, v]) => {
            const base = Number(v || 0);
            if (k === 'lifeSteal' && base > 0) {
                const scaled = base * (1 + Math.max(0, rate));
                const capped = Math.min(base * lifeStealMaxMultiplier, scaled);
                out[k] = Math.max(0, Number(capped.toFixed(4)));
                return;
            }
            const scaled = Math.floor(Math.abs(base) * rate);
            // 소수 비율 스탯(예: 0.04)은 +1 최소 보정을 적용하면 과도하게 커지므로 제외
            const needsMinOne = Math.abs(base) >= 1;
            const bonus = (rate > 0 && base !== 0)
                ? (needsMinOne ? Math.max(1, scaled) : scaled)
                : scaled;
            out[k] = base + (base >= 0 ? bonus : -bonus);
        });
        return out;
    }

    getItemComputedBonuses(itemId, itemData = null) {
        const item = itemData || window.GAME_DATA.items[itemId];
        if (!item) return null;
        const stats = this.getItemFinalStats(itemId, item) || {};
        const specials = item.specials || {};
        const out = { ...stats };
        // 특수 옵션은 강화 배율과 별개로 원본 수치 그대로 합산
        if (typeof specials.hpRegen === 'number') out.hpRegen = (out.hpRegen || 0) + specials.hpRegen;
        if (typeof specials.lifeSteal === 'number') out.lifeSteal = (out.lifeSteal || 0) + specials.lifeSteal;
        if (typeof specials.critChance === 'number') out.critChance = (out.critChance || 0) + specials.critChance;
        if (typeof specials.critDamageMul === 'number') out.critDamageMul = (out.critDamageMul || 0) + specials.critDamageMul;
        return out;
    }

    getItemDisplayName(itemId, itemData = null) {
        const item = itemData || window.GAME_DATA.items[itemId];
        if (!item) return '';
        const slotIconMap = {
            weapon: '⚔️',
            armor: '🛡️',
            helmet: '🪖',
            accessory: '🎗️',
            boots: '🥾',
            offhand: '🧿'
        };
        const lv = this.getItemEnhanceLevel(itemId);
        const maxEn = this.getMaxEnhanceLevelForItem(itemId);
        const flair = lv >= (maxEn >= 30 ? 22 : 16) ? '✹ ' : lv >= (maxEn >= 30 ? 10 : 8) ? '✦ ' : '';
        const slotIcon = item.slot ? `${slotIconMap[item.slot] || '📦'} ` : '';
        return lv > 0 ? `${slotIcon}${flair}${item.name} +${lv}` : `${slotIcon}${item.name}`;
    }

    isBossExclusiveItem(itemId) {
        if (!itemId) return false;
        const tables = window.GAME_DATA?.bossExclusiveDropTables || {};
        return Object.values(tables).some(list =>
            Array.isArray(list) && list.some(drop => drop?.itemId === itemId)
        );
    }

    /** itemId가 있으면 보스 전용(+30)과 일반 상한에 맞춰 피크/하이 임계값을 구분한다 */
    getEnhanceVisualClass(level, itemId) {
        const lv = Number(level || 0);
        const max = itemId ? this.getMaxEnhanceLevelForItem(itemId) : 20;
        const peakAt = max >= 30 ? 22 : 16;
        const highAt = max >= 30 ? 10 : 8;
        if (lv >= peakAt) return 'enhance-peak';
        if (lv >= highAt) return 'enhance-high';
        if (lv >= 4) return 'enhance-mid';
        return '';
    }

    getInventoryCount(itemId) {
        const row = this.inventory.items.find(i => i.id === itemId);
        return row ? row.count : 0;
    }

    getSmithableEquipmentItemIds() {
        return Object.keys(window.GAME_DATA.items).filter(id => {
            const item = window.GAME_DATA.items[id];
            return !!(item?.slot && item.smithable !== false);
        });
    }

    /** 상점·UI용: 장비 슬롯·스탯을 한 줄 요약 문자열로 */
    formatShopItemDetails(item, itemId = null) {
        if (!item) return '';
        const slotKo = {
            weapon: '무기',
            armor: '갑옷',
            helmet: '투구',
            accessory: '장신구',
            boots: '신발',
            offhand: '보조장비'
        };
        const statKo = {
            atk: '공격',
            def: '방어',
            hp: 'HP',
            pp: 'PP',
            spd: '속도',
            faith: '신앙',
            hpRegen: '체력재생',
            lifeSteal: '생명력흡수'
        };
        const parts = [];
        if (item.slot) parts.push(`[${slotKo[item.slot] || item.slot}]`);
        const stats = itemId ? this.getItemFinalStats(itemId, item) : item.stats;
        if (stats && Object.keys(stats).length > 0) {
            const statStr = Object.entries(stats)
                .map(([k, v]) => {
                    const label = statKo[k] !== undefined ? statKo[k] : k;
                    const sign = Number(v) > 0 ? '+' : '';
                    if (k === 'lifeSteal' || k === 'critChance') {
                        return `${label} ${sign}${Math.round(Number(v) * 100)}%`;
                    }
                    if (k === 'critDamageMul') {
                        return `${label} ${sign}${Math.round(Number(v) * 100)}%`;
                    }
                    return `${label} ${sign}${v}`;
                })
                .join(' · ');
            if (itemId) {
                const lv = this.getItemEnhanceLevel(itemId);
                if (lv > 0) parts.push(`강화 +${lv}`);
            }
            parts.push(statStr);
        } else if (!item.slot) {
            parts.push('재료 · 전리품');
        }
        if (item.specials) {
            const specialParts = [];
            if (typeof item.specials.lifeSteal === 'number') specialParts.push(`생명력흡수 +${Math.round(item.specials.lifeSteal * 100)}%`);
            if (typeof item.specials.critChance === 'number') specialParts.push(`치명타확률 +${Math.round(item.specials.critChance * 100)}%`);
            if (typeof item.specials.critDamageMul === 'number') specialParts.push(`치명타피해 +${Math.round(item.specials.critDamageMul * 100)}%`);
            if (typeof item.specials.hpRegen === 'number') specialParts.push(`체력재생 +${item.specials.hpRegen}`);
            if (specialParts.length) parts.push(specialParts.join(' · '));
        }
        return parts.join(' ');
    }

    formatSingleEquipBonusText(value) {
        const n = Number(value) || 0;
        const sign = n > 0 ? '+' : '';
        return `${sign}${n}`;
    }

    formatEquipmentBonusSummary(bonuses) {
        const statKo = {
            atk: '공격',
            def: '방어',
            hp: 'HP',
            pp: 'PP',
            spd: '속도',
            faith: '신앙',
            hpRegen: '체력재생',
            lifeSteal: '생명력흡수'
        };
        const parts = Object.entries(statKo)
            .map(([key, label]) => {
                const n = Number(bonuses?.[key] || 0);
                if (!n) return null;
                const sign = n > 0 ? '+' : '';
                return `${label} ${sign}${n}`;
            })
            .filter(Boolean);
        return parts.length ? parts.join(' · ') : '없음';
    }

    openShop(tab = 'buy') {
        if (this.state.battle) return this.log("전투 중에는 상점을 이용할 수 없습니다.", "system");

        const regionId = this.state.world.currentRegionId;
        const goods = window.GAME_DATA.shops?.[regionId] || [];
        if (goods.length === 0) return this.log("이 지역에는 상점이 열려 있지 않습니다.", "system");

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const playerGold = this.state.player.gold;
        const currentTab = tab === 'sell' ? 'sell' : 'buy';
        const buyRows = goods.map(entry => {
            const item = window.GAME_DATA.items[entry.itemId];
            if (!item) return '';
            const disabled = playerGold < entry.price ? 'disabled' : '';
            const detailLine = this.formatShopItemDetails(item, entry.itemId);
            const displayName = this.getItemDisplayName(entry.itemId, item);
            const isStackable = !item.slot;
            const maxBuy = Math.max(0, Math.floor(playerGold / entry.price));
            return `
                <div class="shop-item-row list-item inventory-item ${item.grade.toLowerCase()} ${this.getEnhanceVisualClass(this.getItemEnhanceLevel(entry.itemId), entry.itemId)} ${this.isBossExclusiveItem(entry.itemId) ? 'boss-exclusive' : ''}">
                    <div class="shop-item-row__main">
                        <div class="shop-item-row__name">${displayName}</div>
                        <div class="shop-item-row__effect">${detailLine}</div>
                        <div class="shop-item-row__desc">${item.desc || ''}</div>
                        <div class="shop-item-row__price">가격: ${entry.price}G</div>
                    </div>
                    ${isStackable
                        ? `
                            <div class="item-actions" style="display:flex; gap:6px;">
                                <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="1" ${maxBuy < 1 ? 'disabled' : ''}>1개</button>
                                <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="10" ${maxBuy < 1 ? 'disabled' : ''}>10개</button>
                                <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="max" ${maxBuy < 1 ? 'disabled' : ''}>최대</button>
                            </div>
                        `
                        : `<button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="1" ${disabled}>구매</button>`
                    }
                </div>
            `;
        }).join('');
        const sellRows = this.inventory.items
            .filter(info => {
                const item = window.GAME_DATA.items[info.id];
                return item && !item.slot;
            })
            .map(info => {
                const item = window.GAME_DATA.items[info.id];
                const sellPrice = this.getItemSellPrice(info.id);
                return `
                    <div class="shop-item-row list-item inventory-item ${item.grade.toLowerCase()} ${this.isBossExclusiveItem(info.id) ? 'boss-exclusive' : ''}">
                        <div class="shop-item-row__main">
                            <div class="shop-item-row__name">${item.name} <span class="count">x${info.count}</span></div>
                            <div class="shop-item-row__effect">${this.formatShopItemDetails(item, info.id)}</div>
                            <div class="shop-item-row__price">판매가: ${sellPrice}G / 개</div>
                        </div>
                        <div class="item-actions" style="display:flex; gap:6px;">
                            <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="1">1개</button>
                            <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="10">10개</button>
                            <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="max">최대</button>
                        </div>
                    </div>
                `;
            }).join('') || '<div class="empty-msg">판매 가능한 비장비 아이템이 없습니다.</div>';

        content.innerHTML = `
            <h3 style="margin-bottom:14px;">${window.GAME_DATA.regions[regionId].name} 상점</h3>
            <p style="margin-bottom:12px; color:#ffd54f;">보유 골드: ${playerGold}G</p>
            <div class="smith-tabs" style="margin-bottom:10px;">
                <button class="action-btn small ${currentTab === 'buy' ? 'primary' : ''}" data-shop-tab="buy">구매</button>
                <button class="action-btn small ${currentTab === 'sell' ? 'primary' : ''}" data-shop-tab="sell">판매</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:330px; overflow-y:auto;">
                ${currentTab === 'buy' ? buyRows : sellRows}
            </div>
            <button id="btn-close-shop" class="action-btn" style="margin-top:12px; width:100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        content.querySelectorAll('[data-shop-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextTab = btn.getAttribute('data-shop-tab') || 'buy';
                this.openShop(nextTab);
            });
        });
        content.querySelectorAll('button[data-buy-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-buy-id');
                const price = Number(btn.getAttribute('data-buy-price'));
                if (!itemId || !Number.isFinite(price)) return;
                const req = btn.getAttribute('data-buy-qty') || '1';
                const maxBuy = Math.max(0, Math.floor(this.state.player.gold / price));
                if (maxBuy <= 0) {
                    this.showToast("골드가 부족합니다.", "warn");
                    return;
                }
                const amount = req === 'max' ? maxBuy : Math.max(1, Math.min(maxBuy, Math.floor(Number(req) || 1)));
                this.buyShopItem(itemId, price, amount);
                this.openShop('buy');
            });
        });
        content.querySelectorAll('button[data-sell-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-sell-id');
                if (!itemId) return;
                const owned = this.getInventoryCount(itemId);
                if (owned <= 0) return;
                const req = btn.getAttribute('data-sell-qty') || '1';
                const amount = req === 'max' ? owned : Math.max(1, Math.min(owned, Math.floor(Number(req) || 1)));
                this.sellItem(itemId, amount);
                this.openShop('sell');
            });
        });
        document.getElementById('btn-close-shop').addEventListener('click', () => modal.classList.add('hidden'));
    }

    buyShopItem(itemId, price, amount = 1) {
        const count = Math.max(1, Math.floor(Number(amount) || 1));
        const totalPrice = price * count;
        if (this.state.player.gold < totalPrice) {
            this.log("골드가 부족합니다.", "system");
            return;
        }
        this.state.player.gold -= totalPrice;
        this.addItem(itemId, count);
        this.log(`[상점] ${window.GAME_DATA.items[itemId].name} ${count}개를 구매했습니다.`, "effect");
        this.updateUI();
        this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
        this.saveGame();
    }

    getItemSellPrice(itemId) {
        const item = window.GAME_DATA.items[itemId];
        if (!item) return 0;
        let basePrice = 0;
        Object.values(window.GAME_DATA.shops || {}).forEach(goods => {
            const row = (goods || []).find(g => g.itemId === itemId);
            if (row && row.price > basePrice) basePrice = row.price;
        });
        if (basePrice <= 0) {
            const fallbackByGrade = { Normal: 18, Uncommon: 40, Rare: 90, Epic: 170 };
            basePrice = fallbackByGrade[item.grade] || 20;
        }
        return Math.max(1, Math.floor(basePrice * 0.5));
    }

    sellItem(itemId, amount = 1) {
        const item = window.GAME_DATA.items[itemId];
        if (!item || item.slot) return; // 장비류 판매 제외
        const owned = this.getInventoryCount(itemId);
        if (owned <= 0) return;
        const count = Math.max(1, Math.min(owned, Math.floor(Number(amount) || 1)));
        const sellPrice = this.getItemSellPrice(itemId);
        const total = sellPrice * count;
        this.inventory.removeItem(itemId, count);
        this.state.player.gold += total;
        this.showToast(`${item.name} ${count}개 판매 (+${total}G)`, "success");
        this.log(`[판매] ${item.name} ${count}개 판매 · +${total}G`, "effect");
        this.updateUI();
        this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
        this.saveGame();
    }

    // 대장간 도메인 메서드는 js/engine/smithing.js에서 GameEngine.prototype에 주입

    openBackupManagerModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const slots = window.StorageManager.listCloudBackups();

        const rows = slots.map(slotInfo => `
            <div class="shop-item-row list-item inventory-item">
                <div class="shop-item-row__main">
                    <div class="shop-item-row__name">☁️ 백업 슬롯 ${slotInfo.slot}</div>
                    <div class="shop-item-row__desc">${slotInfo.label}</div>
                </div>
                <div class="item-actions" style="display:flex; gap:6px;">
                    <button class="action-btn small primary" data-backup-upload="${slotInfo.slot}">업로드</button>
                    <button class="action-btn small secondary" data-backup-restore="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>복원</button>
                    <button class="action-btn small" data-backup-export="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>파일 저장</button>
                    <button class="action-btn small danger" data-backup-delete="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>삭제</button>
                </div>
            </div>
        `).join('');

        content.style.width = '720px';
        content.style.maxWidth = '95vw';
        content.innerHTML = `
            <h3 style="margin-bottom: 10px;">☁️ 백업 매니저</h3>
            <p style="font-size:0.82rem; color:#b0bec5; margin-bottom:10px;">
                슬롯별로 업로드/복원/삭제를 관리합니다. (현재 사용자 기준)
            </p>
            <div style="display:flex; gap:8px; margin-bottom:10px;">
                <button class="action-btn small" id="btn-backup-export-live">현재 진행 파일 저장</button>
                <button class="action-btn small secondary" id="btn-backup-import-file">파일에서 복원</button>
                <input type="file" id="backup-import-input" accept=".json,application/json" style="display:none;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto;">
                ${rows}
            </div>
            <button id="btn-back-to-settings" class="action-btn secondary" style="margin-top: 10px; width: 100%;">← 설정으로 돌아가기</button>
            <button id="btn-close-backup-manager" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        const settingsMsg = document.getElementById('settings-msg');
        const close = () => {
            content.style.width = '';
            content.style.maxWidth = '';
            modal.classList.add('hidden');
        };

        content.querySelectorAll('[data-backup-upload]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = Number(btn.getAttribute('data-backup-upload'));
                this.state.inventoryData = this.inventory.serialize();
                const res = window.StorageManager.syncToCloudSlot(this.state, slot);
                if (settingsMsg) {
                    settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
                    settingsMsg.innerText = res.msg;
                }
                this.showToast(res.msg, res.success ? 'success' : 'warn');
                if (res.success) this.openBackupManagerModal();
            });
        });

        content.querySelectorAll('[data-backup-restore]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = Number(btn.getAttribute('data-backup-restore'));
                const restoreRes = window.StorageManager.restoreFromCloudSlot(slot);
                if (settingsMsg) {
                    settingsMsg.style.color = restoreRes.success ? '#4caf50' : '#ff4b2b';
                    settingsMsg.innerText = restoreRes.msg;
                }
                if (!restoreRes.success) {
                    this.showToast(restoreRes.msg, 'warn');
                    return;
                }
                this.state = restoreRes.payload;
                this.ensureStateSchema();
                this.inventory = new window.InventoryManager(this.state.inventoryData || {});
                this.toggleBattleUI(false);
                this.updateUI();
                this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                this.log(`클라우드 백업 슬롯 ${slot}에서 데이터를 복원했습니다.`, "system");
                this.saveGame();
                this.showToast(restoreRes.msg, 'success');
                close();
            });
        });

        content.querySelectorAll('[data-backup-delete]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = Number(btn.getAttribute('data-backup-delete'));
                const ok = confirm(`슬롯 ${slot} 백업을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
                if (!ok) return;
                const res = window.StorageManager.deleteCloudSlot(slot);
                if (settingsMsg) {
                    settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
                    settingsMsg.innerText = res.msg;
                }
                this.showToast(res.msg, res.success ? 'success' : 'warn');
                if (res.success) this.openBackupManagerModal();
            });
        });

        content.querySelectorAll('[data-backup-export]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const slot = Number(btn.getAttribute('data-backup-export'));
                const res = window.StorageManager.restoreFromCloudSlot(slot);
                if (!res.success || !res.payload) {
                    this.showToast("내보낼 백업 데이터가 없습니다.", "warn");
                    return;
                }
                const exported = await this.saveBackupPayloadToFile(res.payload, `slot${slot}`);
                if (exported) this.showToast(`슬롯 ${slot} 백업 파일 저장 완료`, "success");
            });
        });

        document.getElementById('btn-backup-export-live')?.addEventListener('click', async () => {
            this.state.inventoryData = this.inventory.serialize();
            const exported = await this.saveBackupPayloadToFile(this.state, 'live');
            if (exported) this.showToast("현재 진행 파일 저장 완료", "success");
        });

        const importInput = document.getElementById('backup-import-input');
        document.getElementById('btn-backup-import-file')?.addEventListener('click', () => importInput?.click());
        importInput?.addEventListener('change', async (e) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const payload = parsed?.payload || parsed;
                if (!payload || typeof payload !== 'object') throw new Error('invalid payload');
                const accountBundle = parsed?.account || null;
                if (accountBundle) {
                    const accountRes = window.AuthManager?.importAccount?.(accountBundle, { overwrite: true, setSession: true });
                    if (!accountRes?.success) {
                        throw new Error(accountRes?.msg || 'account restore failed');
                    }
                }
                this.state = payload;
                this.ensureStateSchema();
                this.inventory = new window.InventoryManager(this.state.inventoryData || {});
                this.toggleBattleUI(false);
                this.updateUI();
                this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                this.log("백업 파일에서 데이터를 복원했습니다.", "system");
                this.saveGame();
                this.showToast("파일 복원 완료", "success");
                close();
            } catch (err) {
                console.error(err);
                this.showToast("백업 파일 복원 실패", "warn");
            } finally {
                e.target.value = '';
            }
        });

        document.getElementById('btn-close-backup-manager')?.addEventListener('click', close);
        document.getElementById('btn-back-to-settings')?.addEventListener('click', () => {
            close();
            const settingsOverlay = document.getElementById('settings-overlay');
            const nickInput = document.getElementById('settings-nickname');
            const msgEl = document.getElementById('settings-msg');
            if (nickInput && window.AuthManager) nickInput.value = window.AuthManager.getNickname();
            if (msgEl) msgEl.innerText = '';
            this.syncSettingsAvatarRadios();
            settingsOverlay?.classList.remove('hidden');
        });
    }

    async saveBackupPayloadToFile(payload, tag = 'backup') {
        try {
            const user = window.AuthManager?.getCurrentUser?.() || 'guest';
            const now = new Date();
            const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            const suggestedName = `basileia_${user}_${tag}_${stamp}.json`;
            const account = window.AuthManager?.exportCurrentAccount?.() || null;
            const text = JSON.stringify({ version: window.StorageManager.version, timestamp: Date.now(), account, payload }, null, 2);

            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName,
                    types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }]
                });
                const writable = await handle.createWritable();
                await writable.write(text);
                await writable.close();
                return true;
            }

            const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = suggestedName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error(err);
            this.showToast("파일 저장에 실패했습니다.", "warn");
            return false;
        }
    }

    syncBackup(isUpload) {
        const settingsMsg = document.getElementById('settings-msg');
        const slots = window.StorageManager.listCloudBackups();
        const slotGuide = slots.map(s => s.label).join('\n');
        const rawSlot = prompt(`백업 슬롯을 선택하세요 (1~3)\n${slotGuide}`, '1');
        if (rawSlot === null) return;
        const slot = Math.max(1, Math.min(3, Math.floor(Number(rawSlot) || 1)));
        if (isUpload) {
            this.state.inventoryData = this.inventory.serialize();
            const res = window.StorageManager.syncToCloudSlot(this.state, slot);
            settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
            settingsMsg.innerText = res.msg;
            return;
        }

        const restoreRes = window.StorageManager.restoreFromCloudSlot(slot);
        settingsMsg.style.color = restoreRes.success ? '#4caf50' : '#ff4b2b';
        settingsMsg.innerText = restoreRes.msg;
        if (!restoreRes.success) return;

        this.state = restoreRes.payload;
        this.ensureStateSchema();
        this.inventory = new window.InventoryManager(this.state.inventoryData || {});
        this.toggleBattleUI(false);
        this.updateUI();
        this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
        this.log("클라우드 백업에서 데이터를 복원했습니다.", "system");
        this.saveGame();
    }

    // 전투 관련 메서드는 js/engine/battle.js에서 주입됨

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
