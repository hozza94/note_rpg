/**
 * Basileia - Skilltree/Toast Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    const SKILL_TREE_UI = {
        gridSnapPx: 24,
        minNodeSepPx: 46,
        overlapResolvePasses: 42,
        radialStepPx: 150,
        radialOuterPaddingPx: 230,
        radialNodePaddingPx: 48,
        edgePadPx: 20,
        minEdgePx: 8,
        depthTierStep: 5,
        depthTierMax: 3,
        marker: {
            available: { w: 4.6, h: 4.6, refX: 8.4, fill: 'rgba(197, 205, 214, 0.95)' },
            learned: { w: 5.2, h: 5.2, refX: 8.6, fill: 'rgba(255, 215, 120, 0.98)' }
        },
        clusterPad: 40,
        bracketArm: 12,
        bracketGap: 2
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
            if (this.state.player.skillTreePoints <= 0) return { ok: false, reason: '스킬트리 포인트가 부족합니다.' };
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
            this.state.player.unlockedSkillNodes.push(nodeId);
            this.state.player.skillTreePoints = Math.max(0, this.state.player.skillTreePoints - 1);
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
        getSkillTreeLayout(tree) { /* 방사형(Radial) 자동 레이아웃 우선 */
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const { depth, parentsById, childrenById, nodeMap } = this.computeSkillTreeLogicalDepth(tree);
            const startId = tree?.startNodeId;
            const stepR = 180; // 요청사항: 단계 * 180px
            const outerPad = SKILL_TREE_UI.radialOuterPaddingPx;
            const twopi = Math.PI * 2;
            const norm = (a) => {
                let v = a % twopi;
                if (v < 0) v += twopi;
                return v;
            };
            const angDist = (a, b) => {
                let d = Math.abs(norm(a) - norm(b));
                if (d > Math.PI) d = twopi - d;
                return d;
            };

            // 루트 외 depth 0은 1링으로 올려 충돌 방지
            const effectiveDepth = new Map();
            let maxDepth = 0;
            nodes.forEach((n) => {
                let d = depth.get(n.id) || 0;
                if (n.id !== startId && d === 0) d = 1;
                effectiveDepth.set(n.id, d);
                maxDepth = Math.max(maxDepth, d);
            });

            const tierMap = new Map();
            for (const n of nodes) {
                const d = effectiveDepth.get(n.id) || 0;
                if (!tierMap.has(d)) tierMap.set(d, []);
                tierMap.get(d).push(n.id);
            }

            const angleById = new Map();
            if (startId && nodeMap.has(startId)) angleById.set(startId, -Math.PI / 2);

            for (let d = 1; d <= maxDepth; d++) {
                const ids = tierMap.get(d) || [];
                if (!ids.length) continue;
                const targetById = new Map();
                ids.forEach((id) => {
                    const p = parentsById.get(id) || [];
                    const pa = p.filter((pid) => angleById.has(pid)).map((pid) => angleById.get(pid));
                    if (pa.length) {
                        const sx = pa.reduce((s, a) => s + Math.cos(a), 0);
                        const sy = pa.reduce((s, a) => s + Math.sin(a), 0);
                        targetById.set(id, Math.atan2(sy, sx));
                    } else {
                        targetById.set(id, null);
                    }
                });
                ids.sort((a, b) => {
                    const ta = targetById.get(a);
                    const tb = targetById.get(b);
                    if (ta !== null && tb !== null && ta !== tb) return ta - tb;
                    if (ta !== null && tb === null) return -1;
                    if (ta === null && tb !== null) return 1;
                    return String(a).localeCompare(String(b));
                });
                const stepA = twopi / ids.length;
                const base = -Math.PI / 2;
                let bestPhase = 0;
                let bestScore = Infinity;
                for (let phase = 0; phase < ids.length; phase++) {
                    let score = 0;
                    for (let i = 0; i < ids.length; i++) {
                        const target = targetById.get(ids[i]);
                        if (target === null) continue;
                        const a = base + (i + phase) * stepA;
                        score += angDist(a, target);
                    }
                    if (score < bestScore) {
                        bestScore = score;
                        bestPhase = phase;
                    }
                }
                ids.forEach((id, i) => angleById.set(id, norm(base + (i + bestPhase) * stepA)));
            }

            const outerR = Math.max(stepR, maxDepth * stepR);
            const span = outerR + outerPad;
            const width = Math.max(980, span * 2);
            const height = Math.max(780, span * 2);
            const originX = width / 2;
            const originY = height / 2;
            const positions = {};

            for (const n of nodes) {
                const id = n.id;
                const d = effectiveDepth.get(id) || 0;
                if (d === 0) {
                    positions[id] = { x: originX, y: originY };
                    continue;
                }
                const theta = angleById.get(id) ?? 0;
                const r = d * stepR;
                positions[id] = {
                    x: originX + Math.cos(theta) * r,
                    y: originY + Math.sin(theta) * r
                };
            }

            const viewCenterX = originX;
            const viewCenterY = originY;
            return { positions, width, height, originX, originY, viewCenterX, viewCenterY, unit: 1 };
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
        getSkillNodeLayoutRadii(node) {
            const k = node?.kind || 'small';
            if (k === 'active_unlock') return { core: 20, ring: 29, ringStroke: 3.8, coreStroke: 2.8, nameY: -44, stateY: 50 };
            if (k === 'keystone') return { core: 17, ring: 25, ringStroke: 3.4, coreStroke: 2.6, nameY: -38, stateY: 43 };
            if (k === 'start') return { core: 16, ring: 23, ringStroke: 3.2, coreStroke: 2.5, nameY: -34, stateY: 41 };
            if (k === 'notable') return { core: 12, ring: 19, ringStroke: 2.6, coreStroke: 2.1, nameY: -30, stateY: 37 };
            return { core: 10, ring: 16, ringStroke: 2.3, coreStroke: 2, nameY: -27, stateY: 34 };
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
            const { positions, width, height, originX, originY, viewCenterX, viewCenterY } = this.getSkillTreeLayout(tree);
            const clusterOverlays = this.getSkillTreeClusterOverlays(tree, positions, originX, originY);
            const clustersSvg = clusterOverlays.map((cluster) => {
                const label = this.escapeSvgText(cluster.name);
                const cls = `skill-web-cluster branch-${cluster.id}`;
                const sectorD = this.getSkillTreeSectorPath(originX, originY, cluster.innerR, cluster.outerR, cluster.startA, cluster.endA);
                return `
                    <g class="${cls}">
                        <path class="skill-web-cluster-sector" d="${sectorD}"></path>
                        <path class="skill-web-cluster-sector-edge" d="${sectorD}"></path>
                        <text class="skill-web-cluster-label" x="${cluster.labelX.toFixed(2)}" y="${cluster.labelY.toFixed(2)}">${label}</text>
                    </g>
                `;
            }).join('');
            const edgePadById = {};
            (tree.nodes || []).forEach((node) => {
                const radii = this.getSkillNodeLayoutRadii(node);
                edgePadById[node.id] = (Number(radii?.ring || 15) + SKILL_TREE_UI.edgePadPx);
            });
            const edges = (tree.edges || []).map(([from, to]) => {
                const a = positions[from], b = positions[to];
                if (!a || !b) return '';
                const state = this.getSkillTreeEdgeState(from, to, unlocked);
                const tier = this.getSkillTreeEdgeDepthTier(from, to, depthMap);
                const d = this.getSkillTreeEdgePath(a.x, a.y, b.x, b.y, edgePadById[from], edgePadById[to]);
                const marker = state === 'locked' ? '' : ` marker-end="url(#skill-edge-arrow-${state})"`;
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
                const branchPointClass = isBranchPoint(node.id) ? 'is-branch' : '';
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
                    <g class="skill-web-node ${stateClass} ${branchPointClass} kind-${node.kind} ${branchClass}" data-node-id="${node.id}" style="--node-core-sw:${cw};--node-ring-sw:${rw};" transform="translate(${pos.x}, ${pos.y})">
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
                    <span class="skill-web-help">드래그로 이동, 휠/버튼으로 확대·축소 · 노드를 클릭해 선택 후 「배우기」로 해금</span>
                    <div class="skill-web-zoom-buttons">
                        <button id="skill-web-zoom-out" class="action-btn small">-</button>
                        <span id="skill-web-zoom-level">100%</span>
                        <button id="skill-web-zoom-in" class="action-btn small">+</button>
                        <button id="skill-web-focus-center" class="action-btn small primary" title="전체 노드가 균형 있게 보이도록 화면 중심 이동">트리 중심</button>
                        <button id="skill-web-zoom-reset" class="action-btn small">초기화</button>
                    </div>
                </div>
                <div id="skill-web-viewport" class="skill-web-viewport">
                    <div id="skill-web-zoom-layer" class="skill-web-zoom-layer">
                        <svg class="skill-web-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                            <defs>
                                <marker id="skill-edge-arrow-available" viewBox="0 0 10 10" refX="${SKILL_TREE_UI.marker.available.refX}" refY="5" markerWidth="${SKILL_TREE_UI.marker.available.w}" markerHeight="${SKILL_TREE_UI.marker.available.h}" orient="auto-start-reverse">
                                    <path d="M 0.4 0.6 L 9.6 5 L 0.4 9.4 z" fill="${SKILL_TREE_UI.marker.available.fill}"></path>
                                </marker>
                                <marker id="skill-edge-arrow-learned" viewBox="0 0 10 10" refX="${SKILL_TREE_UI.marker.learned.refX}" refY="5" markerWidth="${SKILL_TREE_UI.marker.learned.w}" markerHeight="${SKILL_TREE_UI.marker.learned.h}" orient="auto-start-reverse">
                                    <path d="M 0.4 0.6 L 9.6 5 L 0.4 9.4 z" fill="${SKILL_TREE_UI.marker.learned.fill}"></path>
                                </marker>
                            </defs>
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
                const check = this.canUnlockSkillNode(selectedNodeId);
                if (check.ok) {
                    learnBtn.disabled = false;
                    learnBtn.textContent = '배우기';
                } else {
                    learnBtn.disabled = true;
                    learnBtn.textContent = '배우기';
                    learnBtn.title = check.reason;
                }
            };
            const updateSelectionVisual = () => {
                content.querySelectorAll('.skill-web-node').forEach(el => {
                    const id = el.getAttribute('data-node-id');
                    el.classList.toggle('is-selected', id === selectedNodeId);
                });
            };
            if (viewport && zoomLayer && zoomLabel) {
                const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
                const savedView = this._skillTreeViewState && this._skillTreeViewState[tree.classId];
                let zoom = savedView && typeof savedView.zoom === 'number' ? clamp(savedView.zoom, 0.55, 2.4) : 1;
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
                content.querySelector('#skill-web-zoom-reset')?.addEventListener('click', () => setZoom(1));
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
            learnBtn?.addEventListener('click', () => {
                if (!selectedNodeId || learnBtn.disabled) return;
                const result = this.unlockSkillNode(selectedNodeId, { notify: 'none' });
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
            document.getElementById('btn-close-skilltree')?.addEventListener('click', () => {
                persistSkillTreeView();
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            });
        }
    });
})();
