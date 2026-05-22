/**
 * Basileia - Skilltree/Toast Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    const SKILL_TREE_UI = {
        gridSnapPx: 24,
        minNodeSepPx: 78,
        overlapResolvePasses: 72,
        overlapHardMinPx: 84,
        wedgeStepR: 78,
        wedgeMinAngleRad: Math.PI / 22,
        wedgeDepthCap: { main: 7, ext: 11, hub: 5 },
        wedgeBaseR: { faith: 148, valor: 148, guard: 148, agile: 148, center: 0, ext_m: 438, ext_t: 438, ext_r: 438 },
        wedgeOuterPaddingPx: 180,
        wedgeSpanRad: Math.PI / 3.25,
        lod0ZoomMax: 0.9,
        lod1ZoomMax: 1.2,
        defaultOverviewZoom: 0.72,
        edgePadPx: 20,
        minEdgePx: 8,
        depthTierStep: 5,
        depthTierMax: 3,
        marker: {
            available: { w: 4.6, h: 4.6, refX: 8.4, fill: 'rgba(197, 205, 214, 0.95)' },
            learned: { w: 3.2, h: 3.2, refX: 7.2, fill: 'rgba(140, 148, 158, 0.5)' }
        },
        clusterPad: 40,
        bracketArm: 12,
        bracketGap: 2
    };

    /** 클러스터 ID → 4방향 웨지(overview-redesign) */
    const CLUSTER_TO_WEDGE = {
        faith_path: 'faith',
        valor_path: 'valor',
        guard_path: 'guard',
        agile_path: 'agile',
        keystone_path: 'center',
        convergence_path: 'center',
        contemplation_path: 'faith',
        oracle_branch: 'faith',
        skirmish_branch: 'valor',
        aegis_branch: 'guard',
        swift_branch: 'agile',
        ascendant_branch: 'faith',
        abyss_branch: 'center',
        martyr_path: 'ext_m',
        boss_hunt_path: 'valor',
        sanctuary_path: 'faith',
        revelation_path: 'faith',
        bulwark_path: 'guard',
        flux_path: 'faith',
        stellar_path: 'faith',
        radiant_volley_branch: 'ext_r',
        solemn_bastion_branch: 'guard',
        mercy_breath_branch: 'faith',
        ember_sigil_branch: 'valor',
        devotion_twig: 'faith',
        steadfast_twig: 'guard',
        quickness_twig: 'agile',
        chorus_extension: 'faith',
        vitality_path: 'guard',
        penitent_path: 'center',
        iron_will_twig: 'agile',
        dawn_cleanse_twig: 'center',
        eden_lance_branch: 'valor',
        dawn_shelter_branch: 'guard',
        reckoning_branch: 'valor',
        mirror_path: 'center',
        tithe_branch: 'ext_t',
        first_ring_outer: 'center',
        ascent_martyr: 'ext_m',
        ascent_tithe: 'ext_t',
        ascent_radiant: 'ext_r'
    };

    const RING_NODE_WEDGE = {
        pilgrim_ring_n: 'faith',
        pilgrim_ring_e: 'valor',
        pilgrim_ring_s: 'guard',
        pilgrim_ring_w: 'agile'
    };

    const WEDGE_LAYOUT_META = {
        faith: { label: '신앙', angle: -Math.PI / 2, hue: 231 },
        valor: { label: '전투', angle: 0, hue: 3 },
        guard: { label: '수호', angle: Math.PI / 2, hue: 145 },
        agile: { label: '기동', angle: Math.PI, hue: 286 },
        center: { label: '서약·합일', angle: 0, hue: 43, hub: true },
        ext_m: { label: '순교 연장', angle: Math.PI / 2 + 0.55, hue: 348 },
        ext_t: { label: '십일조 연장', angle: Math.PI + 0.55, hue: 226 },
        ext_r: { label: '광휘 연장', angle: -Math.PI / 2 - 0.55, hue: 218 }
    };

    Object.assign(window.GameEngine.prototype, {
        getSkillTreeConfig() {
            const classId = this.state.player.classId || 'pilgrim';
            return window.GAME_DATA.skillTrees?.[classId] || null;
        },
        getSkillTreeNodeMap() {
            const tree = this.getSkillTreeConfig();
            const map = {};
            if (!tree || !Array.isArray(tree.nodes)) return map;
            tree.nodes.forEach(node => { map[node.id] = node; });
            return map;
        },
        /** 시작 노드 기준 무방향 BFS 최단 엣지 수 L (밸런스·UI 표시용) */
        buildSkillTreeBfsDepthMap(tree) {
            const startId = tree?.startNodeId;
            const edges = tree?.edges;
            if (!startId || !Array.isArray(edges)) return new Map();
            const adj = new Map();
            for (let i = 0; i < edges.length; i++) {
                const pair = edges[i];
                if (!Array.isArray(pair) || pair.length < 2) continue;
                const a = pair[0];
                const b = pair[1];
                if (!adj.has(a)) adj.set(a, []);
                if (!adj.has(b)) adj.set(b, []);
                adj.get(a).push(b);
                adj.get(b).push(a);
            }
            const dist = new Map();
            const q = [startId];
            dist.set(startId, 0);
            for (let qi = 0; qi < q.length; qi++) {
                const u = q[qi];
                const du = dist.get(u);
                for (const v of adj.get(u) || []) {
                    if (dist.has(v)) continue;
                    dist.set(v, du + 1);
                    q.push(v);
                }
            }
            return dist;
        },
        getSkillNodeGraphMeta(node, depthById = null) {
            if (!node) return null;
            const pos = node.position;
            const r = pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) ? Math.hypot(pos.x, pos.y) : null;
            let L = null;
            if (depthById && typeof depthById.get === 'function' && depthById.has(node.id)) {
                L = depthById.get(node.id);
            } else {
                const tree = this.getSkillTreeConfig?.();
                const map = tree ? this.buildSkillTreeBfsDepthMap(tree) : null;
                if (map && map.has(node.id)) L = map.get(node.id);
            }
            return { L, r };
        },
        getSkillMergeDefaults() {
            return window.GAME_DATA.skillMergeDefaults || { damageMul: 0.88, buffEffectMul: 0.88, ppCostRatio: 0.85 };
        },
        getSkillMergeProfile(skillData) {
            if (!skillData) return this.getSkillMergeDefaults();
            return Object.assign({}, this.getSkillMergeDefaults(), skillData.mergeProfile || {});
        },
        /** 합성 스킬 PP = ceil(구성 스킬 PP 합 × ppCostRatio) */
        getMergedSkillPpCost(skillData) {
            if (!skillData || !Array.isArray(skillData.mergedFrom) || skillData.mergedFrom.length < 2) {
                return Math.max(0, Math.floor(Number(skillData.cost || 0)));
            }
            let sum = 0;
            for (const sid of skillData.mergedFrom) {
                sum += Number(window.GAME_DATA.skills[sid]?.cost || 0);
            }
            const r = Number(this.getSkillMergeProfile(skillData).ppCostRatio || 0.85);
            return Math.max(1, Math.ceil(sum * r));
        },
        getActiveSkills() {
            const ids = (this.state.player.activeSkillIds || []).filter(id => !window.GAME_DATA.skills[id]?.bossOnly);
            return ids.map((id) => {
                const base = window.GAME_DATA.skills[id] || { name: id, cost: 0 };
                const out = { id, ...base };
                if (Array.isArray(base.mergedFrom) && base.mergedFrom.length >= 2) {
                    out.cost = this.getMergedSkillPpCost(base);
                }
                return out;
            });
        },
        syncUnlockedActiveSkills() {
            const tree = this.getSkillTreeConfig();
            if (!tree) return;
            const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
            const nodeMap = this.getSkillTreeNodeMap();
            const activeSet = new Set(this.state.player.activeSkillIds || []);
            unlocked.forEach(nodeId => {
                const node = nodeMap[nodeId];
                const activeSkillId = node?.grants?.activeSkillId;
                if (activeSkillId) activeSet.add(activeSkillId);
            });
            let list = Array.from(activeSet).filter(id => {
                const s = window.GAME_DATA.skills[id];
                return s && !s.bossOnly;
            });
            const mergedParents = list.filter((id) => {
                const sk = window.GAME_DATA.skills[id];
                return sk && Array.isArray(sk.mergedFrom) && sk.mergedFrom.length >= 2;
            });
            if (mergedParents.length) {
                const strip = new Set();
                mergedParents.forEach((pid) => {
                    (window.GAME_DATA.skills[pid].mergedFrom || []).forEach((sub) => strip.add(sub));
                });
                list = list.filter((id) => !strip.has(id));
            }
            this.state.player.activeSkillIds = list;
        },
        getRelicLevel(relicId) {
            if (!relicId) return 1;
            const maxLv = Math.max(1, Number(window.GAME_DATA?.relicGacha?.maxRelicLevel || 10));
            const lv = Number(this.state.player?.relicLevels?.[relicId] || 1);
            return Math.max(1, Math.min(maxLv, Math.floor(lv || 1)));
        },
        getRelicSpecialsScaled(relicId) {
            const base = window.GAME_DATA?.relics?.[relicId]?.specials;
            if (!base || typeof base !== 'object') return null;
            const level = this.getRelicLevel(relicId);
            const step = Math.max(0, level - 1);
            if (step <= 0) return { ...base };
            const cfg = window.GAME_DATA?.relicGacha?.levelScaling || {};
            const perLevel = cfg.perLevel || {};
            const caps = cfg.caps || {};
            const out = {};
            Object.entries(base).forEach(([key, value]) => {
                const n = Number(value || 0);
                if (!Number.isFinite(n)) return;
                const scale = Math.max(0, Number(perLevel[key] || 0));
                let next;
                if (key === 'damageTakenMul') {
                    next = n - (1 - n) * scale * step;
                    if (caps[key] !== undefined) next = Math.max(Number(caps[key]), next);
                } else if (key === 'damageMul' || key === 'lowHpDamageMul') {
                    next = n + (n - 1) * scale * step;
                    if (caps[key] !== undefined) next = Math.min(Number(caps[key]), next);
                } else if (Number.isInteger(n) && Math.abs(n) >= 1) {
                    next = n + Math.max(0, Math.round(n * scale * step));
                    if (caps[key] !== undefined) next = Math.min(Number(caps[key]), next);
                } else {
                    next = n + Math.max(0, n * scale * step);
                    if (caps[key] !== undefined) next = Math.min(Number(caps[key]), next);
                }
                out[key] = Number(next.toFixed(4));
            });
            return out;
        },
        applyRelicPassivesToBonuses(bonuses) {
            const rid = this.state.player?.equippedRelicId;
            const spec = rid && this.getRelicSpecialsScaled(rid);
            if (!spec || !bonuses) return;
            Object.entries(spec).forEach(([key, value]) => {
                if (key === 'damageMul' || key === 'damageTakenMul' || key === 'lowHpDamageMul') bonuses[key] *= value;
                else if (key === 'critChance' || key === 'evadeChance' || key === 'ailmentResist' || key === 'turnStartCleanseChance'
                    || key === 'ppOnHitChance' || key === 'doubleStrikeChance') bonuses[key] += value;
                else if (key === 'ppOnHitAmount') bonuses[key] += value;
                else if (key === 'hpRegen' || key === 'lifeSteal' || key === 'critDamageMul') bonuses[key] += value;
            });
        },
        getPassiveBonuses() {
            const bonuses = {
                atk: 0, def: 0, hp: 0, pp: 0, spd: 0, faith: 0, hpRegen: 0, lifeSteal: 0,
                damageMul: 1, damageTakenMul: 1, critChance: 0, critDamageMul: 0, evadeChance: 0, lowHpDamageMul: 1,
                ailmentResist: 0, turnStartCleanseChance: 0,
                ppOnHitChance: 0, ppOnHitAmount: 0, doubleStrikeChance: 0
            };
            const nodeMap = this.getSkillTreeNodeMap();
            (this.state.player.unlockedSkillNodes || []).forEach(nodeId => {
                const grants = nodeMap[nodeId]?.grants;
                if (!grants) return;
                if (grants.stats) {
                    Object.entries(grants.stats).forEach(([stat, value]) => {
                        if (stat === 'lifeSteal') return;
                        if (bonuses[stat] !== undefined) bonuses[stat] += value;
                    });
                }
                if (grants.specials) {
                    Object.entries(grants.specials).forEach(([key, value]) => {
                        if (key === 'damageMul' || key === 'damageTakenMul' || key === 'lowHpDamageMul') bonuses[key] *= value;
                        else if (key === 'critChance' || key === 'evadeChance' || key === 'ailmentResist' || key === 'turnStartCleanseChance'
                            || key === 'ppOnHitChance' || key === 'doubleStrikeChance') bonuses[key] += value;
                        else if (key === 'ppOnHitAmount') bonuses[key] += value;
                        else if (key === 'hpRegen' || key === 'lifeSteal' || key === 'critDamageMul') bonuses[key] += value;
                    });
                }
            });
            if (typeof this.applyRelicPassivesToBonuses === 'function') {
                this.applyRelicPassivesToBonuses(bonuses);
            }
            return bonuses;
        },
        getPlayerCombinedStats() {
            const p = this.state.player;
            const equip = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
            const passive = this.getPassiveBonuses();
            return {
                atk: p.atk + equip.atk + passive.atk,
                def: p.def + equip.def + passive.def,
                hp: p.maxHp + equip.hp + passive.hp,
                pp: p.maxPp + equip.pp + passive.pp,
                spd: p.spd + equip.spd + passive.spd,
                faith: p.faith + (equip.faith || 0) + passive.faith,
                hpRegen: Math.max(0, (p.hpRegen || 0) + (equip.hpRegen || 0) + (passive.hpRegen || 0)),
                lifeSteal: Math.max(0, (equip.lifeSteal || 0) + (passive.lifeSteal || 0)),
                critChance: Math.max(0, (equip.critChance || 0) + (passive.critChance || 0)),
                critDamageMul: Math.max(1.5, 1.5 + (equip.critDamageMul || 0) + (passive.critDamageMul || 0)),
                evadeChance: Math.max(0, passive.evadeChance || 0),
                damageMul: passive.damageMul || 1,
                damageTakenMul: passive.damageTakenMul || 1,
                lowHpDamageMul: passive.lowHpDamageMul || 1
            };
        },
        canUnlockSkillNode(nodeId) {
            const tree = this.getSkillTreeConfig();
            if (!tree) return { ok: false, reason: '스킬트리 정보를 찾을 수 없습니다.' };
            const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
            if (unlocked.has(nodeId)) return { ok: false, reason: '이미 배운 노드입니다.' };
            const cost = this.getSkillNodePointCost(nodeId);
            if (cost > 0 && this.state.player.skillTreePoints < cost) return { ok: false, reason: '스킬트리 포인트가 부족합니다.' };
            const nodeMap = this.getSkillTreeNodeMap();
            const node = nodeMap[nodeId];
            if (!node) return { ok: false, reason: '존재하지 않는 노드입니다.' };
            const preRequired = Array.isArray(node.preRequired) ? node.preRequired : [];
            const requiresAll = Array.isArray(node.requiresAll) ? node.requiresAll : [];
            const needAll = [...new Set([...requiresAll, ...preRequired])];
            if (needAll.length > 0) {
                const missing = needAll.filter(reqId => !unlocked.has(reqId));
                if (missing.length > 0) {
                    const missingNames = missing.map(id => nodeMap[id]?.name || id).slice(0, 3).join(', ');
                    return { ok: false, reason: `선행 노드 필요: ${missingNames}` };
                }
            }
            const isAdjacent = (tree.edges || []).some(([from, to]) => (from === nodeId && unlocked.has(to)) || (to === nodeId && unlocked.has(from)));
            if (!isAdjacent) return { ok: false, reason: '연결된 노드부터 해금해야 합니다.' };
            return { ok: true };
        },
        getSkillNodePointCost(nodeId) {
            const tree = this.getSkillTreeConfig();
            const startId = tree?.startNodeId;
            if (nodeId === startId) return 0;
            const node = this.getSkillTreeNodeMap()[nodeId];
            if (!node) return 0;
            const raw = Number(node.points);
            return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
        },
        canUnlockSkillNodeWithState(nodeId, unlockedSet, skillPoints) {
            const tree = this.getSkillTreeConfig();
            if (!tree) return { ok: false, reason: '스킬트리 정보를 찾을 수 없습니다.' };
            const unlocked = unlockedSet instanceof Set ? unlockedSet : new Set(unlockedSet || []);
            if (unlocked.has(nodeId)) return { ok: false, reason: '이미 배운 노드입니다.' };
            const cost = this.getSkillNodePointCost(nodeId);
            if (cost > 0 && skillPoints < cost) return { ok: false, reason: '스킬트리 포인트가 부족합니다.' };
            const nodeMap = this.getSkillTreeNodeMap();
            const node = nodeMap[nodeId];
            if (!node) return { ok: false, reason: '존재하지 않는 노드입니다.' };
            const preRequired = Array.isArray(node.preRequired) ? node.preRequired : [];
            const requiresAll = Array.isArray(node.requiresAll) ? node.requiresAll : [];
            const needAll = [...new Set([...requiresAll, ...preRequired])];
            if (needAll.length > 0) {
                const missing = needAll.filter(reqId => !unlocked.has(reqId));
                if (missing.length > 0) {
                    const missingNames = missing.map(id => nodeMap[id]?.name || id).slice(0, 3).join(', ');
                    return { ok: false, reason: `선행 노드 필요: ${missingNames}` };
                }
            }
            const isAdjacent = (tree.edges || []).some(([from, to]) => (from === nodeId && unlocked.has(to)) || (to === nodeId && unlocked.has(from)));
            if (!isAdjacent) return { ok: false, reason: '연결된 노드부터 해금해야 합니다.' };
            return { ok: true, cost };
        },
        buildSkillTreeAdjacency(tree) {
            const adj = new Map();
            const edges = Array.isArray(tree?.edges) ? tree.edges : [];
            for (const pair of edges) {
                if (!Array.isArray(pair) || pair.length < 2) continue;
                const a = pair[0];
                const b = pair[1];
                if (!adj.has(a)) adj.set(a, []);
                if (!adj.has(b)) adj.set(b, []);
                adj.get(a).push(b);
                adj.get(b).push(a);
            }
            return adj;
        },
        findSkillTreePathFromUnlocked(unlockedSet, targetId, adj) {
            if (unlockedSet.has(targetId)) return [];
            const q = [...unlockedSet];
            const parent = new Map();
            const visited = new Set(unlockedSet);
            for (let qi = 0; qi < q.length; qi++) {
                const u = q[qi];
                if (u === targetId) {
                    const path = [];
                    let cur = targetId;
                    while (cur && !unlockedSet.has(cur)) {
                        path.unshift(cur);
                        cur = parent.get(cur);
                    }
                    return path;
                }
                for (const v of adj.get(u) || []) {
                    if (visited.has(v)) continue;
                    visited.add(v);
                    parent.set(v, u);
                    q.push(v);
                }
            }
            return null;
        },
        collectSkillTreePrereqClosure(nodeId, nodeMap, cache = new Map()) {
            if (cache.has(nodeId)) return cache.get(nodeId);
            const need = new Set();
            const stack = [nodeId];
            while (stack.length) {
                const id = stack.pop();
                const node = nodeMap[id];
                if (!node) continue;
                const preRequired = Array.isArray(node.preRequired) ? node.preRequired : [];
                const requiresAll = Array.isArray(node.requiresAll) ? node.requiresAll : [];
                for (const req of [...new Set([...requiresAll, ...preRequired])]) {
                    if (!need.has(req)) {
                        need.add(req);
                        stack.push(req);
                    }
                }
            }
            cache.set(nodeId, need);
            return need;
        },
        getSkillTreeUnlockPlanTo(targetId) {
            const tree = this.getSkillTreeConfig();
            if (!tree) return { ok: false, plan: [], cost: 0, reason: '스킬트리 정보를 찾을 수 없습니다.' };
            const nodeMap = this.getSkillTreeNodeMap();
            const target = nodeMap[targetId];
            if (!target) return { ok: false, plan: [], cost: 0, reason: '존재하지 않는 노드입니다.' };
            const startId = tree.startNodeId;
            const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
            if (unlocked.has(targetId)) return { ok: true, plan: [], cost: 0, reason: '' };
            const adj = this.buildSkillTreeAdjacency(tree);
            const simUnlocked = new Set(unlocked);
            let simPoints = Math.max(0, Number(this.state.player.skillTreePoints || 0));
            const plan = [];
            const prereqCache = new Map();
            const maxSteps = (tree.nodes || []).length + 8;

            for (let step = 0; step < maxSteps; step++) {
                if (simUnlocked.has(targetId)) {
                    const cost = plan.reduce((s, id) => s + this.getSkillNodePointCost(id), 0);
                    return { ok: true, plan, cost, targetName: target.name };
                }
                if (simPoints <= 0) {
                    const cost = plan.reduce((s, id) => s + this.getSkillNodePointCost(id), 0);
                    return { ok: false, plan, cost, reason: `포인트가 부족합니다. (필요 ${cost + this.getSkillNodePointCost(targetId)} / 보유 ${this.state.player.skillTreePoints})` };
                }

                const prereqs = this.collectSkillTreePrereqClosure(targetId, nodeMap, prereqCache);
                const missingPrereq = [...prereqs].filter((id) => !simUnlocked.has(id) && id !== startId)
                    .filter((id) => this.canUnlockSkillNodeWithState(id, simUnlocked, simPoints).ok);
                if (missingPrereq.length) {
                    const pick = missingPrereq.sort((a, b) => String(a).localeCompare(String(b)))[0];
                    plan.push(pick);
                    simUnlocked.add(pick);
                    simPoints -= this.getSkillNodePointCost(pick);
                    continue;
                }

                const path = this.findSkillTreePathFromUnlocked(simUnlocked, targetId, adj);
                if (!path || !path.length) {
                    return { ok: false, plan, cost: plan.length, reason: '시작점과 연결된 경로가 없습니다.' };
                }
                let picked = null;
                for (const id of path) {
                    const check = this.canUnlockSkillNodeWithState(id, simUnlocked, simPoints);
                    if (check.ok) {
                        picked = id;
                        break;
                    }
                }
                if (!picked) {
                    const candidates = (tree.nodes || []).map((n) => n.id).filter((id) => {
                        return this.canUnlockSkillNodeWithState(id, simUnlocked, simPoints).ok;
                    });
                    if (!candidates.length) {
                        const probe = path.find((id) => !simUnlocked.has(id));
                        const why = probe
                            ? this.canUnlockSkillNodeWithState(probe, simUnlocked, simPoints).reason
                            : '해금할 수 있는 노드가 없습니다.';
                        return { ok: false, plan, cost: plan.length, reason: why || '해금할 수 있는 노드가 없습니다.' };
                    }
                    picked = candidates.find((id) => path.includes(id)) || candidates[0];
                }
                plan.push(picked);
                simUnlocked.add(picked);
                simPoints -= this.getSkillNodePointCost(picked);
            }
            return { ok: false, plan, cost: plan.length, reason: '해금 계획을 완성하지 못했습니다.' };
        },
        unlockSkillPathTo(targetId, options = {}) {
            const notify = options.notify || 'log';
            const planResult = this.getSkillTreeUnlockPlanTo(targetId);
            if (!planResult.ok) {
                this.emitSkillTreeFeedback(planResult.reason, notify, 'system');
                return { ok: false, message: planResult.reason, plan: planResult.plan || [] };
            }
            if (!planResult.plan.length) {
                return { ok: true, message: '이미 해금된 노드입니다.', plan: [], count: 0 };
            }
            const unlockedNames = [];
            for (const id of planResult.plan) {
                const result = this.unlockSkillNode(id, { notify: 'none' });
                if (!result.ok) {
                    const msg = `${result.message} (중단: ${unlockedNames.length}개 해금됨)`;
                    this.emitSkillTreeFeedback(msg, notify, 'system');
                    return { ok: false, message: msg, plan: planResult.plan, count: unlockedNames.length };
                }
                unlockedNames.push(result.nodeName || id);
            }
            const targetName = this.getSkillTreeNodeMap()[targetId]?.name || targetId;
            const message = unlockedNames.length > 1
                ? `${unlockedNames.length}개 노드를 해금했습니다. (목표: ${targetName})`
                : `새로운 노드를 해금했습니다: ${targetName}`;
            this.emitSkillTreeFeedback(message, notify, 'effect');
            return { ok: true, message, plan: planResult.plan, count: unlockedNames.length, targetName };
        },
        resetSkillTree(options = {}) {
            const notify = options.notify || 'log';
            const tree = this.getSkillTreeConfig();
            if (!tree) {
                const msg = '스킬트리 정보를 찾을 수 없습니다.';
                this.emitSkillTreeFeedback(msg, notify, 'system');
                return { ok: false, message: msg };
            }
            const startId = tree.startNodeId || 'pilgrim_origin';
            const nodeMap = this.getSkillTreeNodeMap();
            const unlocked = [...new Set(this.state.player.unlockedSkillNodes || [])];
            const refund = unlocked
                .filter((id) => id !== startId && nodeMap[id])
                .reduce((sum, id) => sum + this.getSkillNodePointCost(id), 0);
            this.state.player.unlockedSkillNodes = [startId];
            this.state.player.skillTreePoints = Math.max(0, Number(this.state.player.skillTreePoints || 0)) + refund;
            this.state.player.activeSkillIds = ['meditation', 'praise', 'proclaim'];
            if (typeof this.migrateLegacyActiveSkillsToMerged === 'function') {
                this.migrateLegacyActiveSkillsToMerged();
            }
            this.syncUnlockedActiveSkills();
            this.state.player.skills = this.getActiveSkills().map((skill) => ({
                id: skill.id,
                name: skill.name,
                cost: skill.cost
            }));
            const message = refund > 0
                ? `스킬트리를 초기화했습니다. 포인트 ${refund}을 돌려받았습니다.`
                : '스킬트리를 초기화했습니다.';
            this.emitSkillTreeFeedback(message, notify, 'effect');
            this.updateUI();
            this.saveGame();
            return { ok: true, message, refund };
        },
        emitSkillTreeFeedback(message, notify = 'log', type = 'system') {
            if (notify === 'toast') {
                this.showSkillTreeToast(message, type === 'effect' ? 'success' : 'info');
                return;
            }
            if (notify !== 'none') this.log(`[스킬트리] ${message}`, type);
        },
        unlockSkillNode(nodeId, options = {}) {
            const notify = options.notify || 'log';
            const check = this.canUnlockSkillNode(nodeId);
            if (!check.ok) {
                this.emitSkillTreeFeedback(check.reason, notify, 'system');
                return { ok: false, message: check.reason };
            }
            const cost = this.getSkillNodePointCost(nodeId);
            this.state.player.unlockedSkillNodes.push(nodeId);
            if (cost > 0) {
                this.state.player.skillTreePoints = Math.max(0, this.state.player.skillTreePoints - cost);
            }
            this.syncUnlockedActiveSkills();
            const nodeName = this.getSkillTreeNodeMap()[nodeId].name;
            const message = `새로운 노드를 해금했습니다: ${nodeName}`;
            this.emitSkillTreeFeedback(message, notify, 'effect');
            this.updateUI();
            this.saveGame();
            return { ok: true, message, nodeName };
        },
        formatNodeGrantText(node) {
            if (!node || !node.grants) return '효과 정보 없음';
            const parts = [];
            const statKo = { atk: '공격', def: '방어', hp: 'HP', pp: 'PP', spd: '속도', faith: '신앙' };
            if (node.grants.stats) parts.push(Object.entries(node.grants.stats).map(([k, v]) => `${statKo[k] || k} ${v > 0 ? '+' : ''}${v}`).join(' · '));
            if (node.grants.activeSkillId) {
                const skill = window.GAME_DATA.skills[node.grants.activeSkillId];
                let label = skill ? skill.name : node.grants.activeSkillId;
                if (skill && Array.isArray(skill.mergedFrom) && skill.mergedFrom.length >= 2) {
                    const names = skill.mergedFrom.map((id) => window.GAME_DATA.skills[id]?.name || id).join(' + ');
                    const pp = this.getMergedSkillPpCost(skill);
                    label += ` (합성: ${names}, PP ${pp})`;
                } else if (skill && Number(skill.cost) >= 0) {
                    label += ` (PP ${skill.cost})`;
                }
                parts.push(`액티브 해금: ${label}`);
            }
            if (node.grants.specials) {
                Object.entries(node.grants.specials).forEach(([k, v]) => {
                    if (k === 'damageMul') parts.push(`피해량 ${Math.round((v - 1) * 100)}% 증가`);
                    if (k === 'damageTakenMul') {
                        if (v < 1) parts.push(`받는 피해 ${Math.round((1 - v) * 100)}% 감소`);
                        if (v > 1) parts.push(`받는 피해 ${Math.round((v - 1) * 100)}% 증가`);
                    }
                    if (k === 'critChance') parts.push(`치명타 +${Math.round(v * 100)}%`);
                    if (k === 'critDamageMul') parts.push(`치명 피해 배율 +${Math.round(v * 100)}%p`);
                    if (k === 'evadeChance') parts.push(`회피 +${Math.round(v * 100)}%`);
                    if (k === 'lowHpDamageMul') parts.push(`HP 50% 이하 피해 +${Math.round((v - 1) * 100)}%`);
                    if (k === 'ailmentResist') parts.push(`상태이상 저항 +${Math.round(v * 100)}%`);
                    if (k === 'turnStartCleanseChance') parts.push(`턴 시작 시 ${Math.round(v * 100)}%로 상태이상 해제 시도`);
                    if (k === 'ppOnHitChance') parts.push(`적중 PP회복 확률 +${Math.round(v * 100)}%p`);
                    if (k === 'ppOnHitAmount') parts.push(`적중 PP회복량 +${v}`);
                    if (k === 'doubleStrikeChance') parts.push(`추가 일격 ${Math.round(v * 100)}%`);
                });
            }
            return parts.join(' / ') || '효과 정보 없음';
        },
        formatActiveSkillSummary(skillData) {
            if (!skillData) return '효과 정보 없음';
            if (Array.isArray(skillData.mergedFrom) && skillData.mergedFrom.length >= 2) {
                const names = skillData.mergedFrom.map((id) => window.GAME_DATA.skills[id]?.name || id).join(' + ');
                const pp = this.getMergedSkillPpCost(skillData);
                const d = this.getSkillMergeProfile(skillData);
                return `합성: ${names} · PP ${pp} · 공격 ${d.damageMul}x · 강화 ${d.buffEffectMul}x`;
            }
            const effect = skillData.effect || {};
            const chunks = [];
            if (effect.atkMul) chunks.push(`피해 x${effect.atkMul.toFixed(2)}`);
            if (effect.defMul) chunks.push(`방어 x${effect.defMul.toFixed(2)}`);
            if (effect.evade) chunks.push(`회피 +${Math.round(effect.evade * 100)}%`);
            if (effect.spdMul) chunks.push(`속도 x${effect.spdMul.toFixed(2)}`);
            if (effect.nextCrit) chunks.push(`다음 치명 +${Math.round(effect.nextCrit * 100)}%`);
            if (effect.spdDebuff) chunks.push(`적 속도 ${Math.round(effect.spdDebuff * 100)}%`);
            if (effect.fear) chunks.push('공포 부여');
            if (effect.cleanse) chunks.push('자신의 공포·둔화 해제');
            return chunks.join(' · ') || '기본 효과';
        },
        formatActiveSkillBattleDetail(skillData) {
            if (!skillData) return '전투 정보 없음';
            const effect = skillData.effect || {};
            const lines = [];
            if (effect.atkMul) lines.push(`계산: 기본 공격 계수 x${effect.atkMul.toFixed(2)}`);
            if (effect.defMul) lines.push(`강화: 방어 배율 x${effect.defMul.toFixed(2)}`);
            if (effect.evade) lines.push(`강화: 회피 +${Math.round(effect.evade * 100)}%`);
            if (effect.spdMul) lines.push(`강화: 속도 배율 x${effect.spdMul.toFixed(2)}`);
            if (effect.nextCrit) lines.push(`강화: 다음 치명 +${Math.round(effect.nextCrit * 100)}%`);
            if (effect.spdDebuff) lines.push(`약화: 적 속도 ${Math.round(effect.spdDebuff * 100)}%`);
            if (effect.fear) lines.push('약화: 공포 부여');
            if (effect.cleanse) lines.push('정화: 공포·이동 둔화 제거');
            return lines.join(' · ') || '기본 공격 기반 스킬';
        },
        formatSkillTreeInfo(node) {
            if (!node) return { descText: '', effectText: '효과 정보 없음' };
            const normalize = (text) => String(text || '').replace(/\s+/g, ' ').trim();
            const canonicalize = (text) => normalize(text).replace(/[\/,]/g, ' · ').replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ').trim();
            const descText = normalize(node.desc);
            if (node.grants?.activeSkillId) {
                const skill = window.GAME_DATA.skills[node.grants.activeSkillId];
                const header = skill ? `액티브: ${skill.name} (${skill.type === 'buff' ? '강화형' : '공격형'})` : '액티브 해금';
                const pp = skill ? `소모 PP: ${skill.cost || 0}` : '';
                const summary = skill ? this.formatActiveSkillSummary(skill) : '효과 정보 없음';
                const detail = skill ? this.formatActiveSkillBattleDetail(skill) : '';
                const activeDesc = skill?.desc ? normalize(skill.desc) : '';
                return { descText: activeDesc || descText, effectText: [header, pp, `요약: ${summary}`, detail].filter(Boolean).join(' / ') };
            }
            const effectText = normalize(this.formatNodeGrantText(node));
            const descCanon = canonicalize(descText);
            const effectCanon = canonicalize(effectText);
            if (!descText) return { descText: '', effectText };
            if (descCanon === effectCanon) return { descText, effectText: '' };
            if (descCanon.includes(effectCanon) || effectCanon.includes(descCanon)) return descText.length >= effectText.length ? { descText, effectText: '' } : { descText: '', effectText };
            return { descText, effectText };
        },
        formatActiveSkillTooltip(skillData) {
            if (!skillData) return '상세 정보 없음';
            const isMerged = Array.isArray(skillData.mergedFrom) && skillData.mergedFrom.length >= 2;
            const ppCost = isMerged ? this.getMergedSkillPpCost(skillData) : Number(skillData.cost || 0);
            const lines = [`타입: ${skillData.type === 'buff' ? '강화' : '공격'}`, `소모 PP: ${ppCost}`];
            if (isMerged) {
                const profile = this.getSkillMergeProfile(skillData);
                const subLines = skillData.mergedFrom.map((id) => {
                    const sk = window.GAME_DATA.skills[id];
                    if (!sk) return `- ${id}`;
                    const cost = Number(sk.cost || 0);
                    return `- ${sk.name} (PP ${cost})`;
                });
                lines.push(`합성 구성:\n${subLines.join('\n')}`);
                lines.push(`합성 배율: 공격 ${Number(profile.damageMul || 0.88).toFixed(2)}x · 강화 ${Number(profile.buffEffectMul || 0.88).toFixed(2)}x`);
                lines.push(`PP 규칙: (구성 PP 합 × ${Number(profile.ppCostRatio || 0.85).toFixed(2)}) 올림`);
            }
            if (skillData.effect?.cleanse) lines.push('즉시: 공포·이동 둔화 해제');
            const healScale = skillData.scaling?.heal;
            if (healScale) {
                lines.push(`회복식: 최소 ${Number(healScale.base || 0)} + 공격×${Number(healScale.atk || 0)} + 방어×${Number(healScale.def || 0)} + 신앙×${Number(healScale.faith || 0)}`);
            }
            const dmgScale = skillData.scaling?.damage;
            if (dmgScale) {
                lines.push(`피해식: 최소 ${Number(dmgScale.base || 0)} + 공격×${Number(dmgScale.atk || 0)} + 방어×${Number(dmgScale.def || 0)} + 신앙×${Number(dmgScale.faith || 0)}`);
            }
            const buffScale = skillData.scaling?.buff;
            if (buffScale) {
                const buffParts = [];
                if (buffScale.evadeBase || buffScale.evadeFaith || buffScale.evadeSpd) {
                    buffParts.push(`회피 보정(기본 ${Number(buffScale.evadeBase || 0)}, 신앙×${Number(buffScale.evadeFaith || 0)}, 속도×${Number(buffScale.evadeSpd || 0)})`);
                }
                if (buffScale.spdMulBase || buffScale.spdMulFaith || buffScale.spdMulSpd) {
                    buffParts.push(`속도 배율 보정(기본 ${Number(buffScale.spdMulBase || 0)}, 신앙×${Number(buffScale.spdMulFaith || 0)}, 속도×${Number(buffScale.spdMulSpd || 0)})`);
                }
                if (buffParts.length > 0) {
                    lines.push(`버프식: ${buffParts.join(' / ')}`);
                }
            }
            if (skillData.desc) lines.push(`설명: ${skillData.desc}`);
            return lines.join('\n');
        },
        formatPassiveSkillSummary(node) {
            if (!node) return '효과 정보 없음';
            return this.formatNodeGrantText(node);
        },
        formatPassiveSkillTooltip(node) {
            if (!node) return '상세 정보 없음';
            const lines = [`노드 유형: ${node.kind}`, `효과: ${this.formatPassiveSkillSummary(node)}`];
            if (node.desc) lines.push(`설명: ${node.desc}`);
            return lines.join('\n');
        },
        getToastPrefix(message, kind = 'info') {
            if (kind === 'success') return '✅ ';
            if (kind === 'error') return '❌ ';
            if (kind === 'warn') return '⚠️ ';
            if (/부족/.test(message)) return '⚠️ ';
            if (/연결된|해금해야/.test(message)) return '🔗 ';
            if (/이미/.test(message)) return '🔁 ';
            if (/존재하지 않는/.test(message)) return '❌ ';
            return 'ℹ️ ';
        },
        ensureGlobalToastStack() {
            let stack = document.getElementById('global-toast-stack');
            if (stack) return stack;
            stack = document.createElement('div');
            stack.id = 'global-toast-stack';
            stack.className = 'global-toast-stack';
            document.body.appendChild(stack);
            return stack;
        },
        showToast(message, kind = 'info') {
            const stack = this.ensureGlobalToastStack();
            const toast = document.createElement('div');
            toast.className = `global-toast ${kind}`;
            toast.innerText = this.getToastPrefix(message, kind) + message;
            stack.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 220);
            }, 1800);
        },
        showSkillTreeToast(message, kind = 'info') {
            const stack = document.getElementById('skill-web-toast-stack');
            if (!stack) {
                this.log(`[스킬트리] ${message}`, kind === 'success' ? 'effect' : 'system');
                return;
            }
            const text = this.getToastPrefix(message, kind) + message;
            const toast = document.createElement('div');
            toast.className = `skill-web-toast ${kind}`;
            toast.innerText = text;
            stack.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 220);
            }, 1800);
        },
        getSkillTreeEdgePath(ax, ay, bx, by, startPad = 0, endPad = 0) {
            const dx = bx - ax;
            const dy = by - ay;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const safeStart = Math.max(0, Math.min(len - SKILL_TREE_UI.minEdgePx, Number(startPad) || 0));
            const safeEnd = Math.max(0, Math.min(len - SKILL_TREE_UI.minEdgePx, Number(endPad) || 0));
            const sx = ax + ux * safeStart;
            const sy = ay + uy * safeStart;
            const ex = bx - ux * safeEnd;
            const ey = by - uy * safeEnd;
            const f = (n) => Number(n.toFixed(2));
            return `M ${f(sx)} ${f(sy)} L ${f(ex)} ${f(ey)}`;
        },
        getSkillTreeEdgeState(fromId, toId, unlocked) {
            const fromUnlocked = unlocked.has(fromId);
            const toUnlocked = unlocked.has(toId);
            if (fromUnlocked && toUnlocked) return 'learned';
            const available = (!fromUnlocked && this.canUnlockSkillNode(fromId).ok)
                || (!toUnlocked && this.canUnlockSkillNode(toId).ok);
            if (available) return 'available';
            return 'locked';
        },
        buildSkillTreePrereqGraph(tree) {
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const nodeMap = new Map();
            nodes.forEach((n) => nodeMap.set(n.id, n));
            const parentsById = new Map();
            const childrenById = new Map();
            nodes.forEach((n) => {
                const preRequired = Array.isArray(n.preRequired) ? n.preRequired : [];
                const requiresAll = Array.isArray(n.requiresAll) ? n.requiresAll : [];
                const needAll = [...new Set([...requiresAll, ...preRequired])].filter((id) => nodeMap.has(id));
                parentsById.set(n.id, needAll);
                if (!childrenById.has(n.id)) childrenById.set(n.id, []);
            });
            for (const [childId, parents] of parentsById.entries()) {
                for (const p of parents) {
                    if (!childrenById.has(p)) childrenById.set(p, []);
                    childrenById.get(p).push(childId);
                }
            }
            return { nodeMap, parentsById, childrenById };
        },
        computeSkillTreeLogicalDepth(tree) {
            const { nodeMap, parentsById, childrenById } = this.buildSkillTreePrereqGraph(tree);
            const nodes = Array.from(nodeMap.keys());
            const indeg = new Map();
            nodes.forEach((id) => indeg.set(id, (parentsById.get(id) || []).length));
            const depth = new Map();
            const q = [];
            const startId = tree?.startNodeId;
            for (const id of nodes) {
                if ((indeg.get(id) || 0) === 0) q.push(id);
                depth.set(id, id === startId ? 0 : 0);
            }
            for (let qi = 0; qi < q.length; qi++) {
                const u = q[qi];
                const du = depth.get(u) || 0;
                for (const v of childrenById.get(u) || []) {
                    const next = Math.max(depth.get(v) || 0, du + 1);
                    depth.set(v, next);
                    indeg.set(v, (indeg.get(v) || 1) - 1);
                    if ((indeg.get(v) || 0) === 0) q.push(v);
                }
            }
            // 사이클/누락 보호: 아직 depth가 0인 노드 중 선행이 있는 경우, 선행 최대 +1로 재계산
            for (const id of nodes) {
                const parents = parentsById.get(id) || [];
                if (parents.length === 0) continue;
                let best = 0;
                for (const p of parents) best = Math.max(best, (depth.get(p) || 0) + 1);
                depth.set(id, Math.max(depth.get(id) || 0, best));
            }
            // 수동 preRequired가 없는 노드가 다수일 때 중앙 겹침 방지:
            // start 기준 엣지 BFS 깊이를 보조 tier로 사용해 non-root 0단계를 승격.
            if (startId && nodeMap.has(startId)) {
                const adj = this.buildSkillTreeUndirectedAdj(tree);
                const bfs = new Map([[startId, 0]]);
                const q2 = [startId];
                for (let qi = 0; qi < q2.length; qi++) {
                    const u = q2[qi];
                    for (const v of adj.get(u) || []) {
                        if (bfs.has(v)) continue;
                        bfs.set(v, (bfs.get(u) || 0) + 1);
                        q2.push(v);
                    }
                }
                for (const id of nodes) {
                    if (id === startId) {
                        depth.set(id, 0);
                        continue;
                    }
                    const d = depth.get(id) || 0;
                    const bd = bfs.get(id);
                    if (d <= 0 && Number.isFinite(bd) && bd > 0) depth.set(id, bd);
                }
            }
            return { depth, parentsById, childrenById, nodeMap };
        },
        buildSkillTreeUndirectedAdj(tree) {
            const adj = new Map();
            const edges = Array.isArray(tree?.edges) ? tree.edges : [];
            for (const pair of edges) {
                if (!Array.isArray(pair) || pair.length < 2) continue;
                const a = pair[0], b = pair[1];
                if (!adj.has(a)) adj.set(a, []);
                if (!adj.has(b)) adj.set(b, []);
                adj.get(a).push(b);
                adj.get(b).push(a);
            }
            return adj;
        },
        buildSkillTreeWedgeByNodeId(tree) {
            const wedgeById = new Map();
            const startId = tree?.startNodeId;
            const clusters = Array.isArray(tree?.clusters) ? tree.clusters : [];
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const assign = (id, wedge, force = false) => {
                if (!id || !wedge) return;
                if (force || !wedgeById.has(id)) wedgeById.set(id, wedge);
            };
            nodes.forEach((n) => {
                if (n.id === startId) assign(n.id, 'center', true);
                else if (RING_NODE_WEDGE[n.id]) assign(n.id, RING_NODE_WEDGE[n.id], true);
                else if (/^pilgrim_ascent_m_/.test(n.id)) assign(n.id, 'ext_m', true);
                else if (/^pilgrim_ascent_t_/.test(n.id)) assign(n.id, 'ext_t', true);
                else if (/^pilgrim_ascent_r_/.test(n.id)) assign(n.id, 'ext_r', true);
            });
            for (const cluster of clusters) {
                const wedge = CLUSTER_TO_WEDGE[cluster?.id];
                if (!wedge) continue;
                const nodeIds = Array.isArray(cluster.nodeIds) ? cluster.nodeIds : [];
                nodeIds.forEach((id) => assign(id, wedge));
            }
            const inferFromId = (id) => {
                if (/faith|sanct|rev_|flux|stellar|radiant|mercy|chorus|devotion|oracle|cont_|pilgrim_ring_n|pilgrim_out_n/.test(id)) return 'faith';
                if (/valor|atk_|hunt|skirm|ember|eden|reck|pilgrim_ring_e|pilgrim_out_e/.test(id)) return 'valor';
                if (/guard|def_|bulwark|bastion|steadfast|vita|aegis|endurance|pilgrim_ring_s|pilgrim_out_s/.test(id)) return 'guard';
                if (/agile|spd_|swift|quickness|grace|pilgrim_ring_w|pilgrim_out_w/.test(id)) return 'agile';
                if (/vow|zeal|resolve|convergence|mirror|pen_|abyss|cleanse|tithe_ep/.test(id)) return 'center';
                return 'center';
            };
            nodes.forEach((n) => {
                if (!wedgeById.has(n.id)) wedgeById.set(n.id, inferFromId(n.id));
            });
            return wedgeById;
        },
        getSkillTreeWedgeProgress(tree, unlocked) {
            const wedgeById = this.buildSkillTreeWedgeByNodeId(tree);
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const stats = {};
            Object.keys(WEDGE_LAYOUT_META).forEach((k) => { stats[k] = { total: 0, unlocked: 0 }; });
            nodes.forEach((n) => {
                if (n.kind === 'start') return;
                const w = wedgeById.get(n.id) || 'center';
                if (!stats[w]) stats[w] = { total: 0, unlocked: 0 };
                stats[w].total += 1;
                if (unlocked.has(n.id)) stats[w].unlocked += 1;
            });
            return stats;
        },
        getSkillTreeWedgeOverlays(originX, originY, innerR, outerR) {
            const span = SKILL_TREE_UI.wedgeSpanRad;
            const twopi = Math.PI * 2;
            const normA = (a) => {
                let v = a % twopi;
                if (v < 0) v += twopi;
                return v;
            };
            return Object.entries(WEDGE_LAYOUT_META).map(([id, meta]) => {
                const half = meta.hub ? Math.PI / 6 : span / 2;
                const startA = normA(meta.angle - half);
                let endA = meta.angle + half;
                if (endA < startA) endA += twopi;
                const ir = meta.hub ? 36 : innerR;
                const or = meta.hub ? innerR + 118 : (id.startsWith('ext_') ? outerR + 42 : outerR);
                return {
                    id,
                    name: meta.label,
                    hue: meta.hue,
                    startA,
                    endA,
                    innerR: ir,
                    outerR: or,
                    labelX: originX + Math.cos(meta.angle) * (ir + (or - ir) * 0.42),
                    labelY: originY + Math.sin(meta.angle) * (ir + (or - ir) * 0.42)
                };
            });
        },
        snapSkillTreePositions(positions, originX, originY, maxRadius) {
            const snap = SKILL_TREE_UI.gridSnapPx;
            const minSep = SKILL_TREE_UI.minNodeSepPx;
            const hardMin = SKILL_TREE_UI.overlapHardMinPx;
            const ids = Object.keys(positions);
            ids.forEach((id) => {
                const p = positions[id];
                p.x = Math.round(p.x / snap) * snap;
                p.y = Math.round(p.y / snap) * snap;
            });
            const separate = (required) => {
                let moved = false;
                for (let i = 0; i < ids.length; i++) {
                    for (let j = i + 1; j < ids.length; j++) {
                        const a = positions[ids[i]];
                        const b = positions[ids[j]];
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.hypot(dx, dy) || 0.001;
                        if (dist >= required) continue;
                        const push = (required - dist) / 2 + 0.5;
                        const ux = dx / dist;
                        const uy = dy / dist;
                        a.x -= ux * push;
                        a.y -= uy * push;
                        b.x += ux * push;
                        b.y += uy * push;
                        moved = true;
                    }
                }
                return moved;
            };
            for (let pass = 0; pass < SKILL_TREE_UI.overlapResolvePasses; pass++) {
                if (!separate(minSep)) break;
            }
            for (let pass = 0; pass < 32; pass++) {
                if (!separate(hardMin)) break;
            }
            if (Number.isFinite(originX) && Number.isFinite(originY) && Number.isFinite(maxRadius) && maxRadius > 0) {
                ids.forEach((id) => {
                    const p = positions[id];
                    const dx = p.x - originX;
                    const dy = p.y - originY;
                    const d = Math.hypot(dx, dy) || 1;
                    if (d > maxRadius) {
                        const s = maxRadius / d;
                        p.x = originX + dx * s;
                        p.y = originY + dy * s;
                    }
                });
            }
        },
        getSkillTreeLayout(tree) {
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const startId = tree?.startNodeId;
            const { depth } = this.computeSkillTreeLogicalDepth(tree);
            const wedgeById = this.buildSkillTreeWedgeByNodeId(tree);
            const stepR = SKILL_TREE_UI.wedgeStepR;
            const outerPad = SKILL_TREE_UI.wedgeOuterPaddingPx;
            const spanRad = SKILL_TREE_UI.wedgeSpanRad;
            const twopi = Math.PI * 2;
            const normA = (a) => {
                let v = a % twopi;
                if (v < 0) v += twopi;
                return v;
            };

            const effectiveDepth = new Map();
            let maxDepth = 0;
            nodes.forEach((n) => {
                let d = depth.get(n.id) || 0;
                if (n.id !== startId && d === 0) d = 1;
                const wedge = wedgeById.get(n.id);
                if (wedge === 'center' && n.id !== startId) d = Math.min(d, 4);
                if (wedge && wedge.startsWith('ext_')) d = Math.max(1, Math.min(d, 12));
                effectiveDepth.set(n.id, d);
                maxDepth = Math.max(maxDepth, d);
            });

            const angleById = new Map();
            const radiusSlotById = new Map();
            const byWedge = new Map();
            nodes.forEach((n) => {
                if (n.id === startId) return;
                const w = wedgeById.get(n.id) || 'center';
                if (!byWedge.has(w)) byWedge.set(w, []);
                byWedge.get(w).push(n.id);
            });

            const minStep = SKILL_TREE_UI.wedgeMinAngleRad;
            const sameDepthRadialGap = 26;

            for (const [wedge, ids] of byWedge.entries()) {
                const meta = WEDGE_LAYOUT_META[wedge] || WEDGE_LAYOUT_META.center;
                ids.sort((a, b) => {
                    const da = effectiveDepth.get(a) || 0;
                    const db = effectiveDepth.get(b) || 0;
                    if (da !== db) return da - db;
                    return String(a).localeCompare(String(b));
                });
                const count = ids.length;
                const spanCap = meta.hub ? Math.PI / 2.1 : spanRad * 1.42;
                const stepA = count > 1 ? Math.min(spanCap / (count - 1), Math.max(minStep, spanRad / count)) : 0;
                const usedSpan = stepA * Math.max(0, count - 1);
                const depthCount = new Map();
                ids.forEach((id, i) => {
                    const offset = (i - (count - 1) / 2) * stepA;
                    angleById.set(id, meta.angle + offset);
                    const d = effectiveDepth.get(id) || 0;
                    const slot = depthCount.get(d) || 0;
                    depthCount.set(d, slot + 1);
                    radiusSlotById.set(id, slot);
                });
            }

            if (startId) angleById.set(startId, 0);

            const caps = SKILL_TREE_UI.wedgeDepthCap;
            const polar = [];
            let maxNodeR = 0;

            for (const n of nodes) {
                const id = n.id;
                const wedge = wedgeById.get(id) || 'center';
                const d = effectiveDepth.get(id) || 0;
                if (id === startId) {
                    polar.push({ id, r: 0, theta: 0, wedge });
                    continue;
                }
                const meta = WEDGE_LAYOUT_META[wedge] || WEDGE_LAYOUT_META.center;
                const theta = angleById.get(id) ?? meta.angle;
                const depthSlot = radiusSlotById.get(id) || 0;
                let r;
                if (meta.hub) {
                    r = 52 + Math.min(d, caps.hub) * 38 + depthSlot * (sameDepthRadialGap * 0.65);
                } else if (wedge.startsWith('ext_')) {
                    const base = SKILL_TREE_UI.wedgeBaseR[wedge] || 438;
                    r = base + Math.max(0, d - 1) * 24 + depthSlot * (sameDepthRadialGap * 0.55);
                } else {
                    const base = SKILL_TREE_UI.wedgeBaseR[wedge] || 148;
                    r = base + Math.max(0, d - 1) * stepR + depthSlot * sameDepthRadialGap;
                }
                maxNodeR = Math.max(maxNodeR, r);
                polar.push({ id, r, theta, wedge });
            }

            const hubR = maxNodeR + 52;
            const width = Math.max(1100, hubR * 2 + outerPad * 2);
            const height = Math.max(860, hubR * 2 + outerPad * 2);
            const originX = width / 2;
            const originY = height / 2;
            const positions = {};

            for (const p of polar) {
                if (p.id === startId) {
                    positions[p.id] = { x: originX, y: originY, wedge: p.wedge };
                    continue;
                }
                positions[p.id] = {
                    x: originX + Math.cos(p.theta) * p.r,
                    y: originY + Math.sin(p.theta) * p.r,
                    wedge: p.wedge
                };
            }

            this.snapSkillTreePositions(positions, originX, originY, hubR + 40);
            const xs = Object.values(positions).map((p) => p.x);
            const ys = Object.values(positions).map((p) => p.y);
            const viewCenterX = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : originX;
            const viewCenterY = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : originY;
            const layoutInnerR = 148;
            const layoutOuterR = hubR - 20;
            return {
                positions,
                width,
                height,
                originX,
                originY,
                viewCenterX,
                viewCenterY,
                layoutInnerR,
                layoutOuterR,
                wedgeById,
                unit: 1
            };
        },
        getSkillTreeLodLevel(zoom) {
            const z = Number(zoom) || 1;
            if (z <= SKILL_TREE_UI.lod0ZoomMax) return 0;
            if (z <= SKILL_TREE_UI.lod1ZoomMax) return 1;
            return 2;
        },
        getSkillNodeStateLabel(nodeId, unlocked) {
            if (unlocked.has(nodeId)) return '해금 완료';
            if (this.canUnlockSkillNode(nodeId).ok) return '해금 가능';
            return '잠김';
        },
        getSkillNodeStateLabelShort(nodeId, unlocked) {
            if (unlocked.has(nodeId)) return '해금 완료';
            if (this.canUnlockSkillNode(nodeId).ok) return '해금 가능';
            return '🔒';
        },
        getSkillNodeBranchClass(tree, nodeId) {
            if (!tree || !nodeId) return 'branch-unknown';
            if (nodeId === tree.startNodeId) return 'branch-origin';
            const clusters = tree.clusters;
            if (!Array.isArray(clusters)) return 'branch-unknown';
            for (let i = 0; i < clusters.length; i++) {
                const ids = clusters[i].nodeIds;
                if (Array.isArray(ids) && ids.includes(nodeId)) return `branch-${clusters[i].id}`;
            }
            return 'branch-unknown';
        },
        getSkillNodeWedgeClass(wedgeId) {
            if (!wedgeId) return 'wedge-unknown';
            return `wedge-${wedgeId}`;
        },
        getSkillNodeLayoutRadii(node) {
            const k = node?.kind || 'small';
            if (k === 'active_unlock') return { core: 14, ring: 21, ringStroke: 2.8, coreStroke: 2.2, nameY: -32, stateY: 38 };
            if (k === 'keystone') return { core: 12, ring: 18, ringStroke: 2.6, coreStroke: 2.1, nameY: -28, stateY: 34 };
            if (k === 'start') return { core: 11, ring: 17, ringStroke: 2.5, coreStroke: 2, nameY: -26, stateY: 32 };
            if (k === 'notable') return { core: 8.5, ring: 14, ringStroke: 2.2, coreStroke: 1.8, nameY: -24, stateY: 30 };
            return { core: 7, ring: 12, ringStroke: 2, coreStroke: 1.7, nameY: -22, stateY: 28 };
        },
        getSkillNodeKindGlyph(node) {
            const k = node?.kind || 'small';
            if (k === 'start') return '✦';
            if (k === 'keystone') return '◆';
            if (k === 'active_unlock') return '★';
            if (k === 'notable') return '●';
            return '·';
        },
        getSkillTreeClusterOverlays(tree, positions, centerX, centerY) {
            const clusters = Array.isArray(tree?.clusters) ? tree.clusters : [];
            const overlays = [];
            const pad = SKILL_TREE_UI.clusterPad;
            const twopi = Math.PI * 2;
            const norm = (a) => {
                let v = a % twopi;
                if (v < 0) v += twopi;
                return v;
            };
            for (const cluster of clusters) {
                const nodeIds = Array.isArray(cluster?.nodeIds) ? cluster.nodeIds : [];
                const pts = nodeIds.map((id) => positions[id]).filter(Boolean);
                if (pts.length < 2) continue;
                const angles = pts.map((p) => norm(Math.atan2(p.y - centerY, p.x - centerX))).sort((a, b) => a - b);
                let maxGap = -1;
                let gapIdx = 0;
                for (let i = 0; i < angles.length; i++) {
                    const cur = angles[i];
                    const nxt = i === angles.length - 1 ? angles[0] + twopi : angles[i + 1];
                    const gap = nxt - cur;
                    if (gap > maxGap) {
                        maxGap = gap;
                        gapIdx = i;
                    }
                }
                const start = angles[(gapIdx + 1) % angles.length];
                const end = angles[gapIdx] + (start <= angles[gapIdx] ? twopi : 0);
                const rs = pts.map((p) => Math.hypot(p.x - centerX, p.y - centerY));
                const innerR = Math.max(48, Math.min(...rs) - pad * 0.75);
                const outerR = Math.max(innerR + 40, Math.max(...rs) + pad);
                const midA = (start + end) / 2;
                overlays.push({
                    id: cluster.id || 'unknown',
                    name: cluster.name || cluster.id || '분기',
                    startA: start,
                    endA: end,
                    innerR,
                    outerR,
                    labelX: centerX + Math.cos(midA) * (innerR + (outerR - innerR) * 0.56),
                    labelY: centerY + Math.sin(midA) * (innerR + (outerR - innerR) * 0.56)
                });
            }
            return overlays;
        },
        getSkillTreeSectorPath(cx, cy, innerR, outerR, startA, endA) {
            const span = Math.max(0.01, endA - startA);
            const large = span > Math.PI ? 1 : 0;
            const x1 = cx + Math.cos(startA) * outerR;
            const y1 = cy + Math.sin(startA) * outerR;
            const x2 = cx + Math.cos(endA) * outerR;
            const y2 = cy + Math.sin(endA) * outerR;
            const x3 = cx + Math.cos(endA) * innerR;
            const y3 = cy + Math.sin(endA) * innerR;
            const x4 = cx + Math.cos(startA) * innerR;
            const y4 = cy + Math.sin(startA) * innerR;
            return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
        },
        getSkillTreeEdgeDepthTier(fromId, toId, depthMap) {
            const da = depthMap.has(fromId) ? depthMap.get(fromId) : 0;
            const db = depthMap.has(toId) ? depthMap.get(toId) : 0;
            const L = Math.max(da, db);
            return Math.min(SKILL_TREE_UI.depthTierMax, Math.floor(L / SKILL_TREE_UI.depthTierStep));
        },
        getStarPoints(outerR, innerR, tips = 5) {
            const points = [], step = Math.PI / tips;
            for (let i = 0; i < tips * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const theta = -Math.PI / 2 + step * i;
                points.push(`${(Math.cos(theta) * r).toFixed(2)},${(Math.sin(theta) * r).toFixed(2)}`);
            }
            return points.join(' ');
        },
        escapeSvgText(str) {
            return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },
        getSkillNodeClass(nodeId, unlocked) {
            if (unlocked.has(nodeId)) return 'is-unlocked';
            if (this.canUnlockSkillNode(nodeId).ok) return 'is-available';
            return 'is-locked';
        },
        openSkillTreeModal() {
            const tree = this.getSkillTreeConfig();
            if (!tree) return this.log('스킬트리 정보를 찾을 수 없습니다.', 'system');
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
            const nodeMap = this.getSkillTreeNodeMap();
            const depthMap = this.buildSkillTreeBfsDepthMap(tree);
            const prereq = this.buildSkillTreePrereqGraph(tree);
            const isBranchPoint = (nodeId) => (prereq.childrenById.get(nodeId) || []).length >= 2;
            const layout = this.getSkillTreeLayout(tree);
            const { positions, width, height, originX, originY, viewCenterX, viewCenterY, layoutInnerR, layoutOuterR } = layout;
            const wedgeProgress = this.getSkillTreeWedgeProgress(tree, unlocked);
            const showLearned = !!this._skillTreeShowLearned;
            const wedgeOverlays = this.getSkillTreeWedgeOverlays(originX, originY, layoutInnerR, layoutOuterR);
            const wedgesSvg = wedgeOverlays.map((w) => {
                const label = this.escapeSvgText(w.name);
                const prog = wedgeProgress[w.id];
                const pct = prog && prog.total > 0 ? Math.round((prog.unlocked / prog.total) * 100) : 0;
                const sub = prog && prog.total > 0 ? `${prog.unlocked}/${prog.total} (${pct}%)` : '';
                const sectorD = this.getSkillTreeSectorPath(originX, originY, w.innerR, w.outerR, w.startA, w.endA);
                return `
                    <g class="skill-web-wedge wedge-${w.id}" data-wedge="${w.id}">
                        <path class="skill-web-wedge-sector" d="${sectorD}" style="--wedge-hue:${w.hue}"></path>
                        <path class="skill-web-wedge-sector-edge" d="${sectorD}"></path>
                        <text class="skill-web-wedge-label" x="${w.labelX.toFixed(2)}" y="${w.labelY.toFixed(2)}">${label}</text>
                        <text class="skill-web-wedge-progress" x="${w.labelX.toFixed(2)}" y="${(w.labelY + 14).toFixed(2)}">${sub}</text>
                    </g>
                `;
            }).join('');
            /* 세부 클러스터 부채꼴은 웨지와 겹쳐 확대 시 시각 노이즈 → 렌더 생략 */
            const clustersSvg = '';
            const edgePadById = {};
            (tree.nodes || []).forEach((node) => {
                const radii = this.getSkillNodeLayoutRadii(node);
                edgePadById[node.id] = (Number(radii?.ring || 15) + SKILL_TREE_UI.edgePadPx);
            });
            const edges = (tree.edges || []).map(([from, to]) => {
                const a = positions[from], b = positions[to];
                if (!a || !b) return '';
                const state = this.getSkillTreeEdgeState(from, to, unlocked);
                if (state === 'learned' && !showLearned) return '';
                if (state === 'locked') return '';
                const tier = this.getSkillTreeEdgeDepthTier(from, to, depthMap);
                const d = this.getSkillTreeEdgePath(a.x, a.y, b.x, b.y, edgePadById[from], edgePadById[to]);
                const marker = state === 'available'
                    ? ' marker-end="url(#skill-edge-arrow-available)"'
                    : '';
                return `<path class="skill-web-edge is-${state} tier-${tier}" data-from="${from}" data-to="${to}" d="${d}" fill="none"${marker} />`;
            }).join('');
            const nodes = (tree.nodes || []).map(node => {
                const pos = positions[node.id];
                if (!pos) return '';
                const stateClass = this.getSkillNodeClass(node.id, unlocked);
                const canUnlock = this.canUnlockSkillNode(node.id).ok;
                const isLocked = !unlocked.has(node.id) && !canUnlock;
                const bottomLabel = unlocked.has(node.id) ? '완료' : (canUnlock ? '가능' : '');
                const branchClass = this.getSkillNodeBranchClass(tree, node.id);
                const wedgeClass = this.getSkillNodeWedgeClass(pos.wedge || layout.wedgeById?.get(node.id));
                const branchPointClass = isBranchPoint(node.id) ? 'is-branch' : '';
                const isKeyVisual = node.kind === 'keystone' || node.kind === 'active_unlock' || node.kind === 'start';
                const radii = this.getSkillNodeLayoutRadii(node);
                const nm = this.escapeSvgText(node.name);
                const lockTspan = isLocked ? '<tspan class="skill-web-node-lock" dx="4" dy="0.5">🔒</tspan>' : '';
                const kindGlyph = this.escapeSvgText(this.getSkillNodeKindGlyph(node));
                const effect = this.formatNodeGrantText(node);
                const isActiveUnlock = node.kind === 'active_unlock';
                const cw = typeof radii.coreStroke === 'number' ? radii.coreStroke : 2;
                const rw = typeof radii.ringStroke === 'number' ? radii.ringStroke : 3;
                const coreShape = isActiveUnlock
                    ? `<polygon class="skill-web-node-core" points="${this.getStarPoints(radii.core, Math.max(4, radii.core * 0.52), 5)}"></polygon>`
                    : `<circle class="skill-web-node-core" r="${radii.core}"></circle>`;
                const ringShape = isActiveUnlock
                    ? `<polygon class="skill-web-node-ring" points="${this.getStarPoints(radii.ring, Math.max(6, radii.ring * 0.54), 5)}"></polygon>`
                    : `<circle class="skill-web-node-ring" r="${radii.ring}"></circle>`;
                return `
                    <g class="skill-web-node ${stateClass} ${branchPointClass} kind-${node.kind} ${branchClass} ${wedgeClass}${isKeyVisual ? ' is-key-visual' : ''}" data-node-id="${node.id}" data-wedge="${pos.wedge || ''}" style="--node-core-sw:${cw};--node-ring-sw:${rw};" transform="translate(${pos.x}, ${pos.y})">
                        ${coreShape}
                        ${ringShape}
                        <text class="skill-web-node-kind" text-anchor="middle" y="1">${kindGlyph}</text>
                        <text class="skill-web-node-name" text-anchor="middle" y="${radii.nameY}"><tspan>${nm}</tspan>${lockTspan}</text>
                        <text class="skill-web-node-state" text-anchor="middle" y="${radii.stateY}">${bottomLabel}</text>
                        <title>${node.name}\n${effect}\n${node.desc || ''}</title>
                    </g>
                `;
            }).join('');
            content.style.width = `${Math.min(1120, Math.max(980, width + 40))}px`;
            content.style.maxWidth = '97vw';
            content.style.position = 'relative';
            content.innerHTML = `
                <h3 style="margin-bottom: 8px;">${tree.className} 스킬트리</h3>
                <p style="margin-bottom: 12px; color:#ffd54f;">남은 포인트: ${this.state.player.skillTreePoints}</p>
                <div class="skill-web-toolbar">
                    <span class="skill-web-help">4방향 웨지 · 줌 아웃=개요 / 줌 인=상세 · 드래그 이동</span>
                    <div class="skill-web-zoom-buttons">
                        <label class="skill-web-toggle-learned" title="해금 완료된 연결선 표시">
                            <input type="checkbox" id="skill-web-show-learned" ${showLearned ? 'checked' : ''} />
                            완료 경로
                        </label>
                        <button id="skill-web-zoom-out" class="action-btn small">-</button>
                        <span id="skill-web-zoom-level">100%</span>
                        <button id="skill-web-zoom-in" class="action-btn small">+</button>
                        <button id="skill-web-focus-center" class="action-btn small primary" title="전체 노드가 균형 있게 보이도록 화면 중심 이동">트리 중심</button>
                        <button id="skill-web-zoom-reset" class="action-btn small" title="개요 줌으로 초기화">개요</button>
                    </div>
                </div>
                <div id="skill-web-viewport" class="skill-web-viewport lod-0">
                    <div id="skill-web-zoom-layer" class="skill-web-zoom-layer">
                        <svg class="skill-web-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                            <defs>
                                <marker id="skill-edge-arrow-available" viewBox="0 0 10 10" refX="${SKILL_TREE_UI.marker.available.refX}" refY="5" markerWidth="${SKILL_TREE_UI.marker.available.w}" markerHeight="${SKILL_TREE_UI.marker.available.h}" orient="auto-start-reverse">
                                    <path d="M 0.4 0.6 L 9.6 5 L 0.4 9.4 z" fill="${SKILL_TREE_UI.marker.available.fill}"></path>
                                </marker>
                            </defs>
                            <g class="skill-web-wedges">${wedgesSvg}</g>
                            <g class="skill-web-clusters">${clustersSvg}</g>
                            <g class="skill-web-edges">${edges}</g>
                            <g class="skill-web-nodes">${nodes}</g>
                        </svg>
                    </div>
                </div>
                <div id="skill-web-tooltip" class="skill-web-tooltip hidden"></div>
                <div id="skill-web-toast-stack" class="skill-web-toast-stack"></div>
                <div id="skill-web-info" class="skill-web-info">노드를 선택하면 상세 효과를 확인할 수 있습니다.</div>
                <div class="skill-web-learn-row">
                    <button type="button" id="skill-web-learn" class="action-btn primary" disabled>배우기</button>
                    <button type="button" id="skill-web-reset" class="action-btn danger" title="해금한 스킬을 모두 되돌리고 포인트를 돌려받습니다">스킬 초기화</button>
                </div>
                <button id="btn-close-skilltree" class="action-btn" style="margin-top: 14px; width: 100%;">닫기</button>
            `;
            modal.classList.remove('hidden');

            const viewport = content.querySelector('#skill-web-viewport');
            const zoomLayer = content.querySelector('#skill-web-zoom-layer');
            const infoBox = content.querySelector('#skill-web-info');
            const learnBtn = content.querySelector('#skill-web-learn');
            const zoomLabel = content.querySelector('#skill-web-zoom-level');
            const tooltip = content.querySelector('#skill-web-tooltip');
            const edgeEls = Array.from(content.querySelectorAll('.skill-web-edge'));
            let selectedNodeId = null;

            /** 모달이 다시 그려져도 팬·줌 위치 유지 (배우기 후·닫았다 열기) */
            const persistSkillTreeView = () => {
                const vp = content.querySelector('#skill-web-viewport');
                const zl = content.querySelector('#skill-web-zoom-layer');
                if (!vp || !zl) return;
                const m = String(zl.style.transform || '').match(/scale\(([\d.]+)\)/);
                const z = m ? parseFloat(m[1]) : 1;
                this._skillTreeViewState = this._skillTreeViewState || {};
                this._skillTreeViewState[tree.classId] = {
                    zoom: z,
                    scrollLeft: vp.scrollLeft,
                    scrollTop: vp.scrollTop
                };
            };

            const fillInfoForNode = (nodeId) => {
                const node = nodeId ? nodeMap[nodeId] : null;
                if (!node || !infoBox) return;
                const info = this.formatSkillTreeInfo(node);
                infoBox.innerHTML = `
                        <strong>${node.name}</strong>
                        ${info.descText ? `<div>${info.descText}</div>` : ''}
                        ${info.effectText ? `<div class="effect">${info.effectText}</div>` : ''}
                        <div class="meta">${this.getSkillNodeStateLabelShort(node.id, unlocked)} · ${node.kind}</div>
                    `;
            };
            const updateLearnButton = () => {
                if (!learnBtn) return;
                learnBtn.removeAttribute('title');
                const unlockedNow = new Set(this.state.player.unlockedSkillNodes || []);
                const pointsNow = Math.max(0, Number(this.state.player.skillTreePoints || 0));
                if (!selectedNodeId) {
                    learnBtn.disabled = true;
                    learnBtn.textContent = '배우기';
                    learnBtn.title = '노드를 먼저 선택하세요';
                    return;
                }
                if (unlockedNow.has(selectedNodeId)) {
                    learnBtn.disabled = true;
                    learnBtn.textContent = '이미 해금됨';
                    return;
                }
                const plan = this.getSkillTreeUnlockPlanTo(selectedNodeId);
                if (plan.ok && plan.cost > 0 && pointsNow >= plan.cost) {
                    learnBtn.disabled = false;
                    learnBtn.textContent = plan.cost > 1 ? `경로 배우기 (${plan.cost})` : '배우기';
                    if (plan.cost > 1) {
                        learnBtn.title = `선행·연결 경로 ${plan.cost}개 노드를 한 번에 해금합니다`;
                    }
                    return;
                }
                if (plan.ok && plan.cost > 0) {
                    learnBtn.disabled = true;
                    learnBtn.textContent = plan.cost > 1 ? `경로 배우기 (${plan.cost})` : '배우기';
                    learnBtn.title = `포인트 부족 (필요 ${plan.cost} / 보유 ${pointsNow})`;
                    return;
                }
                learnBtn.disabled = true;
                learnBtn.textContent = '배우기';
                learnBtn.title = plan.reason || this.canUnlockSkillNode(selectedNodeId).reason;
            };
            const updateSelectionVisual = () => {
                content.querySelectorAll('.skill-web-node').forEach(el => {
                    const id = el.getAttribute('data-node-id');
                    el.classList.toggle('is-selected', id === selectedNodeId);
                });
            };
            const applySkillTreeLod = (zoomLevel) => {
                if (!viewport) return;
                viewport.classList.remove('lod-0', 'lod-1', 'lod-2');
                viewport.classList.add(`lod-${zoomLevel}`);
            };
            if (viewport && zoomLayer && zoomLabel) {
                const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
                const savedView = this._skillTreeViewState && this._skillTreeViewState[tree.classId];
                const defaultZoom = savedView && typeof savedView.zoom === 'number'
                    ? savedView.zoom
                    : SKILL_TREE_UI.defaultOverviewZoom;
                let zoom = clamp(defaultZoom, 0.55, 2.4);
                /** 시작점만 보면 상단(음수 그리드 y) 노드가 화면 밖으로 나가므로, 전체 분포의 중심을 기준으로 맞춤 */
                const centerOnView = () => {
                    viewport.scrollLeft = Math.max(0, viewCenterX * zoom - viewport.clientWidth / 2);
                    viewport.scrollTop = Math.max(0, viewCenterY * zoom - viewport.clientHeight / 2);
                };
                const setZoom = (nextZoom, focusX, focusY) => {
                    const prevZoom = zoom;
                    zoom = clamp(nextZoom, 0.55, 2.4);
                    zoomLayer.style.transform = `scale(${zoom})`;
                    zoomLabel.innerText = `${Math.round(zoom * 100)}%`;
                    applySkillTreeLod(this.getSkillTreeLodLevel(zoom));
                    if (focusX === undefined || focusY === undefined) {
                        centerOnView();
                        return;
                    }
                    const worldX = (viewport.scrollLeft + focusX) / prevZoom;
                    const worldY = (viewport.scrollTop + focusY) / prevZoom;
                    viewport.scrollLeft = worldX * zoom - focusX;
                    viewport.scrollTop = worldY * zoom - focusY;
                };
                zoomLayer.style.transform = `scale(${zoom})`;
                zoomLabel.innerText = `${Math.round(zoom * 100)}%`;
                applySkillTreeLod(this.getSkillTreeLodLevel(zoom));
                content.querySelector('#skill-web-show-learned')?.addEventListener('change', (e) => {
                    this._skillTreeShowLearned = !!e.target.checked;
                    persistSkillTreeView();
                    this.openSkillTreeModal();
                });
                setTimeout(() => {
                    if (savedView && typeof savedView.scrollLeft === 'number') {
                        const maxL = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
                        const maxT = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
                        viewport.scrollLeft = Math.min(Math.max(0, savedView.scrollLeft), maxL);
                        viewport.scrollTop = Math.min(Math.max(0, savedView.scrollTop), maxT);
                    } else {
                        centerOnView();
                    }
                }, 0);
                viewport.addEventListener('wheel', (event) => {
                    event.preventDefault();
                    const rect = viewport.getBoundingClientRect();
                    const focusX = event.clientX - rect.left;
                    const focusY = event.clientY - rect.top;
                    const delta = event.deltaY < 0 ? 0.1 : -0.1;
                    setZoom(zoom + delta, focusX, focusY);
                }, { passive: false });
                let dragStartX = 0, dragStartY = 0, startScrollLeft = 0, startScrollTop = 0, dragging = false;
                viewport.addEventListener('pointerdown', (event) => {
                    if (event.target.closest('.skill-web-node')) return;
                    dragging = true;
                    dragStartX = event.clientX;
                    dragStartY = event.clientY;
                    startScrollLeft = viewport.scrollLeft;
                    startScrollTop = viewport.scrollTop;
                    viewport.setPointerCapture(event.pointerId);
                    viewport.classList.add('dragging');
                });
                viewport.addEventListener('pointermove', (event) => {
                    if (!dragging) return;
                    const dx = event.clientX - dragStartX;
                    const dy = event.clientY - dragStartY;
                    viewport.scrollLeft = startScrollLeft - dx;
                    viewport.scrollTop = startScrollTop - dy;
                });
                viewport.addEventListener('pointerup', () => {
                    dragging = false;
                    viewport.classList.remove('dragging');
                });
                viewport.addEventListener('pointercancel', () => {
                    dragging = false;
                    viewport.classList.remove('dragging');
                });
                content.querySelector('#skill-web-zoom-in')?.addEventListener('click', () => setZoom(zoom + 0.15, viewport.clientWidth / 2, viewport.clientHeight / 2));
                content.querySelector('#skill-web-zoom-out')?.addEventListener('click', () => setZoom(zoom - 0.15, viewport.clientWidth / 2, viewport.clientHeight / 2));
                content.querySelector('#skill-web-zoom-reset')?.addEventListener('click', () => setZoom(SKILL_TREE_UI.defaultOverviewZoom));
                content.querySelector('#skill-web-focus-center')?.addEventListener('click', () => centerOnView());
            }
            content.querySelectorAll('.skill-web-node').forEach(nodeEl => {
                const highlightNodeEdges = (nodeId, on) => {
                    if (!nodeId) return;
                    edgeEls.forEach((edgeEl) => {
                        const from = edgeEl.getAttribute('data-from');
                        const to = edgeEl.getAttribute('data-to');
                        const related = from === nodeId || to === nodeId;
                        edgeEl.classList.toggle('is-related', !!on && related);
                    });
                };
                const moveTooltip = (event, nodeId) => {
                    if (!tooltip) return;
                    const node = nodeMap[nodeId];
                    if (!node) return;
                    const effect = this.formatNodeGrantText(node);
                    const pointCost = Number(node.points || 1);
                    tooltip.innerHTML = `
                        <strong>${node.name}</strong>
                        <div>${node.desc || '설명 없음'}</div>
                        <div class="meta">효과: ${effect}</div>
                        <div class="meta">소모 포인트: ${pointCost}</div>
                    `;
                    tooltip.classList.remove('hidden');
                    const box = content.getBoundingClientRect();
                    const x = Math.max(12, Math.min(box.width - 260, event.clientX - box.left + 14));
                    const y = Math.max(12, Math.min(box.height - 120, event.clientY - box.top + 14));
                    tooltip.style.left = `${x}px`;
                    tooltip.style.top = `${y}px`;
                };
                nodeEl.addEventListener('mouseenter', () => {
                    if (selectedNodeId) return;
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    fillInfoForNode(nodeId);
                    highlightNodeEdges(nodeId, true);
                });
                nodeEl.addEventListener('mousemove', (event) => {
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    if (!nodeId || selectedNodeId) return;
                    moveTooltip(event, nodeId);
                });
                nodeEl.addEventListener('mouseleave', () => {
                    tooltip?.classList.add('hidden');
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    highlightNodeEdges(nodeId, false);
                });
                nodeEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    if (!nodeId) return;
                    selectedNodeId = nodeId;
                    updateSelectionVisual();
                    fillInfoForNode(selectedNodeId);
                    updateLearnButton();
                    tooltip?.classList.add('hidden');
                    highlightNodeEdges(selectedNodeId, true);
                    if (!unlocked.has(nodeId)) {
                        const check = this.canUnlockSkillNode(nodeId);
                        if (!check.ok && /선행|연결된 노드/.test(String(check.reason || ''))) {
                            this.showSkillTreeToast('선행 스킬이 필요합니다.', 'info');
                        }
                    }
                });
            });
            learnBtn?.addEventListener('click', async () => {
                if (!selectedNodeId || learnBtn.disabled) return;
                const plan = this.getSkillTreeUnlockPlanTo(selectedNodeId);
                const result = (plan.ok && plan.plan.length > 0)
                    ? this.unlockSkillPathTo(selectedNodeId, { notify: 'none' })
                    : this.unlockSkillNode(selectedNodeId, { notify: 'none' });
                if (result.ok) {
                    persistSkillTreeView();
                    this.openSkillTreeModal();
                    this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'skills');
                    this.showSkillTreeToast(result.message, 'success');
                } else {
                    this.showSkillTreeToast(result.message, 'info');
                    updateLearnButton();
                }
            });
            content.querySelector('#skill-web-reset')?.addEventListener('click', async () => {
                const unlockedCount = (this.state.player.unlockedSkillNodes || []).filter((id) => {
                    const tree = this.getSkillTreeConfig();
                    return id !== tree?.startNodeId;
                }).length;
                if (unlockedCount <= 0) {
                    this.showSkillTreeToast('초기화할 스킬이 없습니다.', 'info');
                    return;
                }
                const ok = await this.showConfirmModal({
                    title: '스킬트리 초기화',
                    message: '해금한 모든 스킬 노드를 되돌리고, 사용한 포인트를 전부 돌려받습니다.\n시작 노드만 남습니다. 계속할까요?',
                    confirmText: '초기화',
                    cancelText: '취소',
                    danger: true
                });
                if (!ok) return;
                const result = this.resetSkillTree({ notify: 'none' });
                if (result.ok) {
                    selectedNodeId = null;
                    persistSkillTreeView();
                    this.openSkillTreeModal();
                    this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'skills');
                    this.showSkillTreeToast(result.message, 'success');
                } else {
                    this.showSkillTreeToast(result.message, 'info');
                }
            });
            document.getElementById('btn-close-skilltree')?.addEventListener('click', () => {
                persistSkillTreeView();
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            });
        }
    });
})();
