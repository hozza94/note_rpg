#!/usr/bin/env node
/**
 * 순례자 스킬트리 밸런스 감사: 시작점 BFS 최단 엣지 수 L, position 기준 방사 r,
 * kind별 휴리스틱 환산 점수(참고용). 계획: Docs/plans/skill_tree_overhaul_1.md §2
 *
 * 사용: node scripts/audit-pilgrim-skill-tree.mjs
 * 옵션:
 *   --json                        한 줄 JSON 출력
 *   --include-active              active_unlock도 이상치 판정에 포함
 *   --active-score-mode=legacy    active_unlock 점수를 기존 고정(+25) 방식으로 계산
 */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadGameData() {
    const ctx = { console };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(readFileSync(join(root, 'js/data/constants.js'), 'utf8'), ctx);
    vm.runInContext(readFileSync(join(root, 'js/data.js'), 'utf8'), ctx);
    return ctx.window.GAME_DATA;
}

/** 무방향 그래프에서 startId 기준 BFS 엣지 거리 */
function bfsEdgeDepth(startId, edges) {
    const adj = new Map();
    for (const pair of edges) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        const [a, b] = pair;
        if (!adj.has(a)) adj.set(a, []);
        if (!adj.has(b)) adj.set(b, []);
        adj.get(a).push(b);
        adj.get(b).push(a);
    }
    const dist = new Map();
    const q = [startId];
    dist.set(startId, 0);
    for (let i = 0; i < q.length; i++) {
        const u = q[i];
        const du = dist.get(u);
        for (const v of adj.get(u) || []) {
            if (dist.has(v)) continue;
            dist.set(v, du + 1);
            q.push(v);
        }
    }
    return dist;
}

function parseFlagValue(name, fallback = '') {
    const hit = process.argv.find((arg) => arg.startsWith(`${name}=`));
    if (!hit) return fallback;
    const idx = hit.indexOf('=');
    return idx >= 0 ? hit.slice(idx + 1) : fallback;
}

function sumNumeric(obj, keys) {
    if (!obj || typeof obj !== 'object') return 0;
    let total = 0;
    for (const k of keys) total += Number(obj[k] || 0);
    return total;
}

function scoreSingleSkillShape(skill) {
    if (!skill || typeof skill !== 'object') return 0;
    const effect = skill.effect || {};
    const scaling = skill.scaling || {};
    let s = 0;
    s += Number(skill.cost || 0) * 0.5;
    if (skill.type === 'attack') s += 6;
    if (skill.type === 'buff') s += 5;
    if (effect.atkMul) s += Math.max(0, (Number(effect.atkMul) - 1) * 14);
    if (effect.defMul) s += Math.max(0, (Number(effect.defMul) - 1) * 12);
    if (effect.evade) s += Number(effect.evade || 0) * 90;
    if (effect.spdMul) s += Math.max(0, (Number(effect.spdMul) - 1) * 12);
    if (effect.nextCrit) s += Number(effect.nextCrit || 0) * 80;
    if (effect.spdDebuff) s += Math.max(0, (1 - Number(effect.spdDebuff)) * 42);
    if (effect.cleanse) s += 6;
    if (effect.fear) s += 8;
    const heal = scaling.heal;
    if (heal) {
        const healSeed = Number(heal.base || 0)
            + Number(heal.atk || 0) * 12
            + Number(heal.def || 0) * 8
            + Number(heal.faith || 0) * 1.3;
        s += healSeed * 0.06;
    }
    const dmg = scaling.damage;
    if (dmg) {
        const dmgSeed = Number(dmg.base || 0)
            + Number(dmg.atk || 0) * 40
            + Number(dmg.def || 0) * 16
            + Number(dmg.faith || 0) * 8;
        s += dmgSeed * 0.08;
    }
    const buff = scaling.buff;
    if (buff) {
        s += sumNumeric(buff, ['evadeBase', 'evadeFaith', 'evadeSpd']) * 120;
        s += sumNumeric(buff, ['spdMulBase', 'spdMulFaith', 'spdMulSpd']) * 60;
        s += sumNumeric(buff, ['defMulBase', 'defMulDef', 'defMulFaith']) * 60;
    }
    return s;
}

function scoreActiveUnlock(node, skills, mergeDefaults) {
    const id = node?.grants?.activeSkillId;
    const skill = id ? skills[id] : null;
    if (!skill) return 20;
    if (Array.isArray(skill.mergedFrom) && skill.mergedFrom.length >= 2) {
        const profile = { ...(mergeDefaults || {}), ...(skill.mergeProfile || {}) };
        const dmgMul = Number(profile.damageMul || 0.88);
        const bufMul = Number(profile.buffEffectMul || 0.88);
        const ratio = Number(profile.ppCostRatio || 0.85);
        let composed = 0;
        for (const sid of skill.mergedFrom) composed += scoreSingleSkillShape(skills[sid] || {});
        const avgMul = Math.max(0.4, Math.min(1.2, (dmgMul + bufMul) / 2));
        return 8 + composed * avgMul * Math.max(0.6, ratio);
    }
    return 6 + scoreSingleSkillShape(skill);
}

/** 패시브·소형 노드 환산 점수 (밸런스 감사용, 전투 DPS와 무관) */
function heuristicUtilityScore(node, opts = {}) {
    const g = node?.grants;
    if (!g) return 0;
    let s = 0;
    if (g.stats) {
        const st = g.stats;
        s += (st.atk || 0) * 1.2 + (st.def || 0) * 1.0 + (st.faith || 0) * 1.0 + (st.spd || 0) * 0.35;
        s += (st.hp || 0) / 12 + (st.pp || 0) / 6;
        s += (st.hpRegen || 0) * 0.8;
    }
    if (g.specials) {
        const sp = g.specials;
        if (sp.damageMul != null && sp.damageMul !== 1) s += Math.abs(sp.damageMul - 1) * 80;
        if (sp.damageTakenMul != null && sp.damageTakenMul !== 1) s += Math.abs(1 - sp.damageTakenMul) * 70;
        if (sp.lowHpDamageMul != null && sp.lowHpDamageMul !== 1) s += Math.abs(sp.lowHpDamageMul - 1) * 60;
        s += (sp.critChance || 0) * 45 + (sp.evadeChance || 0) * 40;
        s += (sp.critDamageMul || 0) * 30;
        s += (sp.ailmentResist || 0) * 25 + (sp.turnStartCleanseChance || 0) * 35;
        s += (sp.lifeSteal || 0) * 50;
        s += (sp.ppOnHitChance || 0) * 20 + (sp.doubleStrikeChance || 0) * 55;
        if (sp.hpRegen) s += Number(sp.hpRegen) * 0.5;
    }
    if (g.activeSkillId) {
        if (opts.activeScoreMode === 'legacy') s += 25;
        else s += scoreActiveUnlock(node, opts.skills || {}, opts.mergeDefaults || {});
    }
    return Math.round(s * 10) / 10;
}

function main() {
    const jsonOut = process.argv.includes('--json');
    const includeActiveUnlock = process.argv.includes('--include-active');
    const activeScoreMode = parseFlagValue('--active-score-mode', 'adaptive');
    const GD = loadGameData();
    const tree = GD.skillTrees?.pilgrim;
    if (!tree) {
        console.error('skillTrees.pilgrim 없음');
        process.exit(1);
    }
    const start = tree.startNodeId || 'pilgrim_origin';
    const edges = tree.edges || [];
    const nodes = tree.nodes || [];
    const depth = bfsEdgeDepth(start, edges);
    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

    const rows = [];
    for (const node of nodes) {
        const p = node.position || { x: 0, y: 0 };
        const r = Math.hypot(Number(p.x) || 0, Number(p.y) || 0);
        const L = depth.has(node.id) ? depth.get(node.id) : null;
        const score = heuristicUtilityScore(node, {
            activeScoreMode,
            skills: GD.skills || {},
            mergeDefaults: GD.skillMergeDefaults || {},
        });
        const active = node.kind === 'active_unlock' || !!node.grants?.activeSkillId;
        rows.push({
            id: node.id,
            name: node.name,
            kind: node.kind || '',
            L: L === null ? -1 : L,
            r: Math.round(r * 1000) / 1000,
            score,
            active: active ? 1 : 0,
        });
    }

    rows.sort((a, b) => a.L - b.L || a.r - b.r || a.id.localeCompare(b.id));

    const missing = nodes.filter((n) => !depth.has(n.id)).map((n) => n.id);
    const badEdges = [];
    for (const pair of edges) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        const [a, b] = pair;
        if (!nodeById[a]) badEdges.push(`unknown from: ${a}`);
        if (!nodeById[b]) badEdges.push(`unknown to: ${b}`);
    }

    // 같은 kind 내 이상치 탐지:
    // - low_efficiency: L 상위 35%인데 score 하위 35%
    // - high_efficiency: L 하위 35%인데 score 상위 35%
    const outliers = [];
    const byKind = {};
    for (const row of rows) {
        if (row.L < 0 || row.kind === 'start') continue;
        if (!includeActiveUnlock && row.kind === 'active_unlock') continue;
        if (!byKind[row.kind]) byKind[row.kind] = [];
        byKind[row.kind].push(row);
    }
    for (const kind of Object.keys(byKind)) {
        const list = byKind[kind];
        if (list.length < 6) continue;
        const sortedL = list.map((x) => x.L).sort((a, b) => a - b);
        const sortedS = list.map((x) => x.score).sort((a, b) => a - b);
        const q = (arr, p) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor((arr.length - 1) * p)))];
        const lLow = q(sortedL, 0.35);
        const lHigh = q(sortedL, 0.65);
        const sLow = q(sortedS, 0.35);
        const sHigh = q(sortedS, 0.65);
        for (const row of list) {
            if (row.L >= lHigh && row.score <= sLow) {
                outliers.push({ ...row, issue: 'low_efficiency' });
            } else if (row.L <= lLow && row.score >= sHigh) {
                outliers.push({ ...row, issue: 'high_efficiency' });
            }
        }
    }

    if (jsonOut) {
        console.log(JSON.stringify({
            rows,
            missingFromBfs: missing,
            badEdges: [...new Set(badEdges)],
            outliers
        }));
    } else {
        console.log('순례자 스킬트리 감사 (L=시작점 기준 최단 엣지 수, r=sqrt(x²+y²), score=휴리스틱)\n');
        const pad = (s, w) => String(s).padEnd(w);
        console.log([pad('L', 4), pad('r', 8), pad('kind', 14), pad('score', 7), pad('id', 36), 'name'].join('\t'));
        for (const row of rows) {
            const Ls = row.L < 0 ? '—' : String(row.L);
            console.log([pad(Ls, 4), pad(row.r, 8), pad(row.kind, 14), pad(row.score, 7), pad(row.id, 36), row.name].join('\t'));
        }
        if (missing.length) {
            console.log('\n[경고] BFS에서 도달 불가 노드:', missing.join(', '));
        }
        if (badEdges.length) {
            console.log('\n[경고] 엣지 노드 ID:', [...new Set(badEdges)].join('; '));
        }

        console.log('\n--- kind별 L vs score (같은 kind 내 정렬, 육안 점검용) ---');
        for (const kind of Object.keys(byKind).sort()) {
            const list = byKind[kind].slice().sort((a, b) => a.L - b.L || b.score - a.score);
            console.log(`\n[${kind}] (${list.length})`);
            list.slice(0, 12).forEach((row) => console.log(`  L=${row.L} score=${row.score} ${row.id}`));
            if (list.length > 12) console.log(`  ... 외 ${list.length - 12}개`);
        }
        if (outliers.length) {
            console.log('\n--- 자동 이상치 경고 ---');
            outliers
                .sort((a, b) => a.kind.localeCompare(b.kind) || a.L - b.L || a.score - b.score)
                .forEach((o) => console.log(`[${o.kind}] ${o.issue} | L=${o.L} score=${o.score} ${o.id}`));
        } else {
            console.log('\n--- 자동 이상치 경고 ---\n감지된 이상치 없음');
        }
        if (!includeActiveUnlock) {
            console.log('\n(참고) active_unlock은 기본적으로 이상치 판정에서 제외됩니다. 포함하려면 --include-active 사용');
        }
        console.log(`(점수 모드) active_unlock=${activeScoreMode}`);
    }

    if (missing.length || badEdges.length) process.exit(1);
}

main();
