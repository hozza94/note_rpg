/**
 * 저장 데이터·세이브 호환: player/world 기본값 보정 (리팩터링 플랜 7단계 1차)
 * game.js 본문에서 분리. 스킬트리 프로토타입 확장(js/engine/skilltree.js) 이후 로드할 것.
 */
(function () {
    if (typeof window === 'undefined' || typeof GameEngine === 'undefined') return;

    /** 구 액티브 ID → 합성 스킬 ID 세이브 호환 */
    /** 제거된 트리 노드 ID가 남아 있으면 순례자 트리에 존재하는 노드만 남김 */
    GameEngine.prototype.sanitizePilgrimSkillTreeUnlocks = function () {
        const tree = window.GAME_DATA?.skillTrees?.pilgrim;
        if (!tree || !Array.isArray(tree.nodes)) return;
        const valid = new Set(tree.nodes.map((n) => n.id));
        const start = tree.startNodeId || 'pilgrim_origin';
        const raw = Array.isArray(this.state.player.unlockedSkillNodes) ? this.state.player.unlockedSkillNodes : [];
        let nodes = raw.filter((id) => valid.has(id));
        if (!nodes.includes(start)) nodes.unshift(start);
        this.state.player.unlockedSkillNodes = [...new Set(nodes)];
    };

    GameEngine.prototype.migrateLegacyActiveSkillsToMerged = function () {
        const defs = window.GAME_DATA?.skills || {};
        let ids = Array.isArray(this.state.player.activeSkillIds) ? [...this.state.player.activeSkillIds] : [];
        const melt = (sources, mergedId) => {
            if (!defs[mergedId] || !Array.isArray(sources) || sources.length < 2) return;
            if (ids.includes(mergedId)) {
                ids = ids.filter((x) => !sources.includes(x));
                return;
            }
            if (sources.some((s) => ids.includes(s))) {
                ids = ids.filter((x) => !sources.includes(x));
                if (!ids.includes(mergedId)) ids.push(mergedId);
            }
        };
        melt(['radiant_volley', 'ember_sigil'], 'merged_volley_ember');
        melt(['mercy_breath', 'dawn_shelter'], 'merged_mercy_dawn');
        melt(['eden_lance', 'reckoning_bolt'], 'merged_lance_reckoning');
        this.state.player.activeSkillIds = ids;
    };

    GameEngine.prototype.ensureStateSchema = function () {
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
            ownedRelicIds: [],
            relicToken: 0,
            relicLevels: {},
            relicGachaPity: { premiumWithoutEpic: 0 }
        };
        Object.entries(playerDefaults).forEach(([key, value]) => {
            if (this.state.player[key] === undefined || this.state.player[key] === null) {
                this.state.player[key] = value;
            }
        });

        // 단일 스킬트리(순례자): classId는 저장 호환용 필드로 유지
        this.state.player.classId = 'pilgrim';

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
        if (typeof this.sanitizePilgrimSkillTreeUnlocks === 'function') {
            this.sanitizePilgrimSkillTreeUnlocks();
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

        this.migrateLegacyActiveSkillsToMerged();
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
        if (typeof this.state.player.relicToken !== 'number' || !Number.isFinite(this.state.player.relicToken)) this.state.player.relicToken = 0;
        if (!this.state.player.relicLevels || typeof this.state.player.relicLevels !== 'object' || Array.isArray(this.state.player.relicLevels)) this.state.player.relicLevels = {};
        if (!this.state.player.relicGachaPity || typeof this.state.player.relicGachaPity !== 'object' || Array.isArray(this.state.player.relicGachaPity)) {
            this.state.player.relicGachaPity = { premiumWithoutEpic: 0 };
        } else {
            if (typeof this.state.player.relicGachaPity.premiumWithoutEpic !== 'number' || !Number.isFinite(this.state.player.relicGachaPity.premiumWithoutEpic)) {
                this.state.player.relicGachaPity.premiumWithoutEpic = 0;
            }
        }
        if (this.state.player.equippedRelicId === undefined) this.state.player.equippedRelicId = null;
        if (this.state.player.ownedRelicIds.length === 0 && window.GAME_DATA?.relics?.relic_morning_dew) {
            this.state.player.ownedRelicIds.push('relic_morning_dew');
            if (!this.state.player.equippedRelicId) this.state.player.equippedRelicId = 'relic_morning_dew';
        }
        this.state.player.ownedRelicIds = Array.from(new Set(
            this.state.player.ownedRelicIds.filter(id => window.GAME_DATA?.relics?.[id])
        ));
        const maxRelicLevel = Math.max(1, Number(window.GAME_DATA?.relicGacha?.maxRelicLevel || 10));
        this.state.player.ownedRelicIds.forEach((rid) => {
            const lv = Number(this.state.player.relicLevels?.[rid] || 1);
            this.state.player.relicLevels[rid] = Math.max(1, Math.min(maxRelicLevel, Math.floor(lv || 1)));
        });
        Object.keys(this.state.player.relicLevels || {}).forEach((rid) => {
            if (!this.state.player.ownedRelicIds.includes(rid)) delete this.state.player.relicLevels[rid];
        });
        if (this.state.player.equippedRelicId && !this.state.player.ownedRelicIds.includes(this.state.player.equippedRelicId)) {
            this.state.player.equippedRelicId = null;
        }

        // 세션 관련 휘발성 상태는 로드 시 초기화
        this.state.world.isNavigating = false;
        this.state.battle = null;
    };
})();
