/**
 * Basileia - Skilltree/Toast Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

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
            if (Array.isArray(node.requiresAll) && node.requiresAll.length > 0) {
                const missing = node.requiresAll.filter(reqId => !unlocked.has(reqId));
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
        getSkillTreeEdgePath(ax, ay, bx, by, edgeIndex = 0) {
            const dx = bx - ax;
            const dy = by - ay;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const px = -uy;
            const py = ux;
            const sign = (edgeIndex % 2 === 0) ? 1 : -1;
            const bow = Math.min(len * 0.2, 130) * sign;
            const c1x = ax + ux * len * 0.32 + px * bow;
            const c1y = ay + uy * len * 0.32 + py * bow;
            const c2x = bx - ux * len * 0.32 + px * bow * 0.65;
            const c2y = by - uy * len * 0.32 + py * bow * 0.65;
            const f = (n) => Number(n.toFixed(2));
            return `M ${f(ax)} ${f(ay)} C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(bx)} ${f(by)}`;
        },
        getSkillTreeLayout(tree) { /* truncated in module extraction safety; keep same behavior via copied logic below */
            /** 노드 좌표 단위(px). 클수록 노드 간 간격이 넓어짐(겹침 완화) */
            const unit = 118, padding = 220, fallbackRadius = 2.4;
            const positions = {};
            const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
            const total = Math.max(1, nodes.length);
            nodes.forEach((node, index) => {
                const p = node.position || { x: Math.cos((Math.PI * 2 * index) / total) * fallbackRadius, y: Math.sin((Math.PI * 2 * index) / total) * fallbackRadius };
                positions[node.id] = { x: p.x * unit, y: p.y * unit };
            });
            const points = Object.values(positions);
            const maxAbsX = Math.max(...points.map(p => Math.abs(p.x)), 0);
            const maxAbsY = Math.max(...points.map(p => Math.abs(p.y)), 0);
            const width = Math.max(980, maxAbsX * 2 + padding * 2);
            const height = Math.max(780, maxAbsY * 2 + padding * 2);
            const originX = width / 2, originY = height / 2;
            Object.keys(positions).forEach(nodeId => { positions[nodeId].x += originX; positions[nodeId].y += originY; });
            const xs = Object.values(positions).map(p => p.x);
            const ys = Object.values(positions).map(p => p.y);
            const viewCenterX = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : originX;
            const viewCenterY = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : originY;
            return { positions, width, height, originX, originY, viewCenterX, viewCenterY };
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
            if (k === 'active_unlock') return { core: 18, ring: 26, nameY: -40, stateY: 46 };
            if (k === 'keystone') return { core: 15, ring: 22, nameY: -34, stateY: 40 };
            if (k === 'start') return { core: 14, ring: 21, nameY: -32, stateY: 38 };
            if (k === 'notable') return { core: 12, ring: 18, nameY: -29, stateY: 36 };
            return { core: 10, ring: 15, nameY: -26, stateY: 33 };
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
            const { positions, width, height, originX, originY, viewCenterX, viewCenterY } = this.getSkillTreeLayout(tree);
            const edges = (tree.edges || []).map(([from, to], edgeIdx) => {
                const a = positions[from], b = positions[to];
                if (!a || !b) return '';
                const active = unlocked.has(from) && unlocked.has(to);
                const dx = b.x - a.x, dy = b.y - a.y;
                const len = Math.hypot(dx, dy) || 1;
                const longHop = len > 400;
                const d = this.getSkillTreeEdgePath(a.x, a.y, b.x, b.y, edgeIdx);
                const cls = `skill-web-edge ${active ? 'active' : ''}${longHop ? ' long-hop' : ''}`;
                return `<path class="${cls}" d="${d}" fill="none" />`;
            }).join('');
            const nodes = (tree.nodes || []).map(node => {
                const pos = positions[node.id];
                if (!pos) return '';
                const stateClass = this.getSkillNodeClass(node.id, unlocked);
                const canUnlock = this.canUnlockSkillNode(node.id).ok;
                const isLocked = !unlocked.has(node.id) && !canUnlock;
                const bottomLabel = unlocked.has(node.id) ? '완료' : (canUnlock ? '가능' : '');
                const branchClass = this.getSkillNodeBranchClass(tree, node.id);
                const radii = this.getSkillNodeLayoutRadii(node);
                const nm = this.escapeSvgText(node.name);
                const lockTspan = isLocked ? '<tspan class="skill-web-node-lock" dx="4" dy="0.5">🔒</tspan>' : '';
                const effect = this.formatNodeGrantText(node);
                const isActiveUnlock = node.kind === 'active_unlock';
                const coreShape = isActiveUnlock
                    ? `<polygon class="skill-web-node-core" points="${this.getStarPoints(radii.core, Math.max(4, radii.core * 0.52), 5)}"></polygon>`
                    : `<circle class="skill-web-node-core" r="${radii.core}"></circle>`;
                const ringShape = isActiveUnlock
                    ? `<polygon class="skill-web-node-ring" points="${this.getStarPoints(radii.ring, Math.max(6, radii.ring * 0.54), 5)}"></polygon>`
                    : `<circle class="skill-web-node-ring" r="${radii.ring}"></circle>`;
                return `
                    <g class="skill-web-node ${stateClass} kind-${node.kind} ${branchClass}" data-node-id="${node.id}" transform="translate(${pos.x}, ${pos.y})">
                        ${coreShape}
                        ${ringShape}
                        <text class="skill-web-node-name" text-anchor="middle" y="${radii.nameY}"><tspan>${nm}</tspan>${lockTspan}</text>
                        <text class="skill-web-node-state" text-anchor="middle" y="${radii.stateY}">${bottomLabel}</text>
                        <title>${node.name}\n${effect}\n${node.desc || ''}</title>
                    </g>
                `;
            }).join('');
            content.style.width = `${Math.min(1120, Math.max(980, width + 40))}px`;
            content.style.maxWidth = '97vw';
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
                            <g class="skill-web-edges">${edges}</g>
                            <g class="skill-web-nodes">${nodes}</g>
                        </svg>
                    </div>
                </div>
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
                nodeEl.addEventListener('mouseenter', () => {
                    if (selectedNodeId) return;
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    fillInfoForNode(nodeId);
                });
                nodeEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const nodeId = nodeEl.getAttribute('data-node-id');
                    if (!nodeId) return;
                    selectedNodeId = nodeId;
                    updateSelectionVisual();
                    fillInfoForNode(selectedNodeId);
                    updateLearnButton();
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
