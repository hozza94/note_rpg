#!/usr/bin/env node
/**
 * GAME_DATA 참조 무결성 검사 (implementation_plan_14 Phase 5·6·7·8)
 * 사용: node scripts/validate-game-data.mjs
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
    const GD = ctx.window.GAME_DATA;
    const meta = ctx.window.GAME_DATA_META;
    if (!GD) throw new Error('GAME_DATA not exposed on window');
    if (!meta?.bossSkillSlotCountFromEnemyPowerTier) throw new Error('GAME_DATA_META.bossSkillSlotCountFromEnemyPowerTier 없음');
    return { GD, meta };
}

function gradeIndex(order, g) {
    const i = order.indexOf(g);
    return i >= 0 ? i : -1;
}

function main() {
    const errors = [];
    const warn = [];
    const { GD, meta: rulesMeta } = loadGameData();
    const regions = GD.regions || {};
    const monsters = GD.monsters || [];
    const items = GD.items || {};
    const skills = GD.skills || {};
    const dropTables = GD.dropTables || {};
    const bossEx = GD.bossExclusiveDropTables || {};
    const skillTrees = GD.skillTrees || {};
    const monsterSkillTrees = GD.monsterSkillTrees || {};
    const meta = GD.meta || {};
    const gradeOrder = meta.monsterGradeOrder || ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    const itemGrades = meta.itemGrades || ['Normal', 'Uncommon', 'Rare', 'Epic'];
    const equipSlots = new Set(meta.equipmentSlots || ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'offhand']);

    // --- items: kind, 장비 슬롯, 등급 ---
    for (const [id, it] of Object.entries(items)) {
        if (!it.kind) errors.push(`items.${id}: kind 없음`);
        else if (!['material', 'equipment'].includes(it.kind)) errors.push(`items.${id}: 알 수 없는 kind "${it.kind}"`);
        if (it.kind === 'equipment') {
            if (!it.slot) errors.push(`items.${id}: equipment인데 slot 없음`);
            else if (!equipSlots.has(it.slot)) errors.push(`items.${id}: 비정상 slot "${it.slot}"`);
            if (!it.stats) errors.push(`items.${id}: equipment인데 stats 없음`);
        }
        if (it.kind === 'material' && it.slot) errors.push(`items.${id}: material인데 slot 있음`);
        if (it.grade && !itemGrades.includes(it.grade)) warn.push(`items.${id}: 비표준 grade "${it.grade}"`);
    }

    // --- regions: nextRegionId 체인, 보스 존재 ---
    const regionIds = new Set(Object.keys(regions));
    const pointedTo = new Set(
        Object.values(regions).map((r) => r.nextRegionId).filter(Boolean)
    );
    const chainHeads = Object.keys(regions).filter((k) => !pointedTo.has(k));
    const cycleWalkStarts = chainHeads.length ? chainHeads : Object.keys(regions);
    for (const start of cycleWalkStarts) {
        const path = new Set();
        let cur = start;
        while (cur && regionIds.has(cur)) {
            if (path.has(cur)) {
                errors.push(`regions: nextRegionId 순환 참조 (노드 "${cur}")`);
                break;
            }
            path.add(cur);
            cur = regions[cur]?.nextRegionId;
        }
    }

    for (const [rid, r] of Object.entries(regions)) {
        if (r.nextRegionId && !regionIds.has(r.nextRegionId)) {
            errors.push(`regions.${rid}: nextRegionId "${r.nextRegionId}" 없음`);
        }
        if (r.bossId) {
            const boss = monsters.find(m => m.id === r.bossId);
            if (!boss) errors.push(`regions.${rid}: bossId "${r.bossId}" 몬스터 없음`);
            else if (!boss.isBoss) warn.push(`regions.${rid}: bossId 대상 "${r.bossId}" isBoss 아님`);
        }
        if (r.fieldGradeMin && r.fieldGradeMax) {
            const a = gradeIndex(gradeOrder, r.fieldGradeMin);
            const b = gradeIndex(gradeOrder, r.fieldGradeMax);
            if (a < 0 || b < 0) errors.push(`regions.${rid}: fieldGradeMin/Max 등급 오타`);
            else if (a > b) errors.push(`regions.${rid}: fieldGradeMin이 fieldGradeMax보다 높음`);
        }
    }

    // --- bossDungeon.entries ---
    const bd = GD.bossDungeon?.entries || [];
    bd.forEach((e, i) => {
        if (!e.bossId) errors.push(`bossDungeon.entries[${i}]: bossId 없음`);
        else if (!monsters.find(x => x.id === e.bossId)) errors.push(`bossDungeon.entries[${i}]: 몬스터 "${e.bossId}" 없음`);
        if (e.regionId && !regionIds.has(e.regionId)) errors.push(`bossDungeon.entries[${i}]: regionId "${e.regionId}" 없음`);
        const reg = e.regionId && regions[e.regionId];
        if (reg && e.bossId && reg.bossId !== e.bossId) {
            errors.push(`bossDungeon.entries[${i}]: region ${e.regionId}의 bossId(${reg.bossId})와 불일치`);
        }
    });

    // --- avatars ---
    const av = GD.avatars;
    if (av) {
        const list = av.list || [];
        const ids = new Set();
        list.forEach((a, i) => {
            if (!a.id) errors.push(`avatars.list[${i}]: id 없음`);
            if (a.id && ids.has(a.id)) errors.push(`avatars.list: 중복 id "${a.id}"`);
            if (a.id) ids.add(a.id);
            const hasFile = typeof a.file === 'string' && a.file.trim().length > 0;
            const hasLegacyImage = typeof a.image === 'string' && a.image.trim().length > 0;
            if (!hasFile && !hasLegacyImage) {
                errors.push(`avatars.list[${i}]: file(파일명) 또는 image(구버전) 필요`);
            }
            if (hasFile && (a.file.includes('/') || a.file.includes('\\'))) {
                errors.push(`avatars.list[${i}]: file는 폴더 없이 파일명만 (basePath 아래)`);
            }
        });
        if (av.basePath && typeof av.basePath === 'string' && !av.basePath.endsWith('/')) {
            errors.push('avatars.basePath는 슬래시로 끝나야 합니다 (예: assets/avatars/)');
        }
        if (av.defaultSelectedId && !ids.has(av.defaultSelectedId)) {
            errors.push(`avatars.defaultSelectedId "${av.defaultSelectedId}"가 list에 없음`);
        }
        (av.defaultUnlockedIds || []).forEach((id) => {
            if (!ids.has(id)) errors.push(`avatars.defaultUnlockedIds: "${id}"가 list에 없음`);
        });
    }

    // --- monsters ---
    for (const m of monsters) {
        if (!m.id) continue;
        if (!Array.isArray(m.tags) || m.tags.length < 2) {
            errors.push(`monster ${m.id}: tags ["field|boss","regionId"] 필요`);
        } else {
            const [role, rid] = m.tags;
            if (!['field', 'boss'].includes(role)) errors.push(`monster ${m.id}: tags[0]는 field 또는 boss`);
            if (rid !== m.regionId) errors.push(`monster ${m.id}: tags[1]가 regionId와 불일치`);
            if (role === 'boss' && !m.isBoss) errors.push(`monster ${m.id}: tags boss인데 isBoss 아님`);
            if (role === 'field' && m.isBoss) errors.push(`monster ${m.id}: tags field인데 isBoss`);
        }
        if (!regionIds.has(m.regionId)) errors.push(`monster ${m.id}: regionId "${m.regionId}" 없음`);
        if (!gradeOrder.includes(m.grade)) errors.push(`monster ${m.id}: 비정상 grade "${m.grade}"`);
        const reg = regions[m.regionId];
        if (reg && m.id === reg.bossId && !m.isBoss) errors.push(`monster ${m.id}: 지역 보스인데 isBoss 아님`);
        if (reg && m.id !== reg.bossId && m.isBoss) warn.push(`monster ${m.id}: isBoss인데 해당 지역 bossId 아님`);
        if (!m.isBoss && reg?.bossId === m.id) errors.push(`monster ${m.id}: bossId와 일치하는데 isBoss=false`);

        if (!m.isBoss && m.dropTableId) {
            if (!dropTables[m.dropTableId]) errors.push(`monster ${m.id}: dropTableId "${m.dropTableId}" 없음`);
        }
        if (m.isBoss && bossEx[m.id] === undefined && m.dropTableId) {
            /* 보스도 dropTables 키 쓸 수 있음 — 생략 */
        }
        if (m.skillTreeId && !monsterSkillTrees[m.skillTreeId]) {
            errors.push(`monster ${m.id}: skillTreeId "${m.skillTreeId}" 없음`);
        }

        if (reg && reg.fieldGradeMin && reg.fieldGradeMax && !m.isBoss) {
            const g = gradeIndex(gradeOrder, m.grade);
            const gmin = gradeIndex(gradeOrder, reg.fieldGradeMin);
            const gmax = gradeIndex(gradeOrder, reg.fieldGradeMax);
            if (g >= 0 && gmin >= 0 && gmax >= 0 && (g < gmin || g > gmax)) {
                warn.push(`monster ${m.id}: 등급 ${m.grade}가 지역 ${m.regionId} 의도 범위 [${reg.fieldGradeMin}~${reg.fieldGradeMax}] 밖`);
            }
        }

        // 보스: 패시브·액티브 슬롯 수 — js/data/constants.js bossSkillSlotCountFromEnemyPowerTier 와 동일
        if (m.isBoss) {
            const reg = regions[m.regionId];
            const expSlots = rulesMeta.bossSkillSlotCountFromEnemyPowerTier(reg?.enemyPowerTier);
            if (!Array.isArray(m.bossPassiveSkillIds) || m.bossPassiveSkillIds.length !== expSlots) {
                errors.push(`monster ${m.id}: bossPassiveSkillIds ${expSlots}개 필요 (enemyPowerTier ${reg?.enemyPowerTier ?? '?'})`);
            }
            if (!Array.isArray(m.bossActiveSkillIds) || m.bossActiveSkillIds.length !== expSlots) {
                errors.push(`monster ${m.id}: bossActiveSkillIds ${expSlots}개 필요 (enemyPowerTier ${reg?.enemyPowerTier ?? '?'})`);
            }
            (m.bossPassiveSkillIds || []).forEach((pid) => {
                const sk = skills[pid];
                if (!sk) errors.push(`monster ${m.id}: bossPassiveSkillIds "${pid}" skills에 없음`);
                else if (sk.type !== 'passive') errors.push(`monster ${m.id}: 패시브 "${pid}" type은 passive여야 함`);
                else if (!sk.effect?.monsterPassive) errors.push(`monster ${m.id}: 패시브 "${pid}"에 effect.monsterPassive 없음`);
            });
            (m.bossActiveSkillIds || []).forEach((aid) => {
                const sk = skills[aid];
                if (!sk) errors.push(`monster ${m.id}: bossActiveSkillIds "${aid}" skills에 없음`);
                else if (sk.type === 'buff' && !sk.effect?.monsterBuff) errors.push(`monster ${m.id}: 버프 액티브 "${aid}"에 effect.monsterBuff 없음`);
            });
            const low = m.bossActiveLowHp;
            if (low) {
                if (!Array.isArray(low.skillIds) || low.skillIds.length === 0) {
                    errors.push(`monster ${m.id}: bossActiveLowHp.skillIds 필요`);
                }
                if (low.weights && low.skillIds && low.weights.length !== low.skillIds.length) {
                    errors.push(`monster ${m.id}: bossActiveLowHp skillIds·weights 길이 불일치`);
                }
                (low.skillIds || []).forEach((sid) => {
                    if (!skills[sid]) errors.push(`monster ${m.id}: bossActiveLowHp skillId "${sid}" 없음`);
                });
            }
        }
    }

    // --- dropTables ---
    for (const [tid, rows] of Object.entries(dropTables)) {
        if (!Array.isArray(rows)) {
            errors.push(`dropTables.${tid}: 배열 아님`);
            continue;
        }
        rows.forEach((row, i) => {
            if (!row.itemId) errors.push(`dropTables.${tid}[${i}]: itemId 없음`);
            else if (!items[row.itemId]) errors.push(`dropTables.${tid}[${i}]: itemId "${row.itemId}" 없음`);
            const ch = row.chance;
            if (ch === undefined || typeof ch !== 'number' || ch < 0 || ch > 1) {
                errors.push(`dropTables.${tid}[${i}]: chance 0~1 아님 (${ch})`);
            }
        });
    }

    for (const [bossId, rows] of Object.entries(bossEx)) {
        if (!Array.isArray(rows)) {
            errors.push(`bossExclusiveDropTables.${bossId}: 배열 아님`);
            continue;
        }
        rows.forEach((row, i) => {
            if (!items[row.itemId]) errors.push(`bossExclusiveDropTables.${bossId}[${i}]: itemId "${row.itemId}" 없음`);
            const ch = row.chance;
            if (ch === undefined || typeof ch !== 'number' || ch < 0 || ch > 1) {
                errors.push(`bossExclusiveDropTables.${bossId}[${i}]: chance 오류`);
            }
        });
    }

    // --- skillTrees activeSkillId ---
    for (const [treeKey, tree] of Object.entries(skillTrees)) {
        const nodes = tree.nodes || [];
        for (const node of nodes) {
            const aid = node.grants?.activeSkillId;
            if (aid && !skills[aid]) errors.push(`skillTrees.${treeKey} node ${node.id}: activeSkillId "${aid}" 없음`);
        }
    }

    /** position 그리드 기준 비정상적으로 먼 엣지(지도 끝↔끝 스파인) 방지 */
    const MAX_SKILL_EDGE_GRID = 12;
    for (const [treeKey, tree] of Object.entries(skillTrees)) {
        const posMap = new Map();
        for (const node of tree.nodes || []) {
            const p = node.position;
            if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) posMap.set(node.id, p);
        }
        for (const pair of tree.edges || []) {
            if (!Array.isArray(pair) || pair.length < 2) continue;
            const [a, b] = pair;
            const pa = posMap.get(a);
            const pb = posMap.get(b);
            if (!pa || !pb) continue;
            const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
            if (d > MAX_SKILL_EDGE_GRID) {
                warn.push(
                    `skillTrees.${treeKey}: 엣지 ${a}↔${b} 그리드 거리 ${d.toFixed(2)} (권장 상한 ${MAX_SKILL_EDGE_GRID}, 먼 지점끼리 직접 연결 의심)`
                );
            }
        }
    }

    // --- monsterSkillTrees skill ids + weights 길이 ---
    function checkPoolWeights(tid, label, skillIds, weights) {
        if (!skillIds || !weights) return;
        if (skillIds.length !== weights.length) {
            errors.push(`monsterSkillTrees.${tid} ${label}: skillIds·weights 길이 불일치 (${skillIds.length} vs ${weights.length})`);
        }
    }
    for (const [tid, tree] of Object.entries(monsterSkillTrees)) {
        const pools = [];
        if (tree.defaultPool) pools.push(['defaultPool', tree.defaultPool]);
        if (tree.lowHp?.skillIds) pools.push(['lowHp', tree.lowHp]);
        for (const [label, p] of pools) {
            if (!p?.skillIds) continue;
            checkPoolWeights(tid, label, p.skillIds, p.weights);
            for (const sid of p.skillIds) {
                if (!skills[sid]) errors.push(`monsterSkillTrees.${tid}: skillId "${sid}" skills에 없음`);
            }
        }
    }

    // --- skills: 플레이어용 tags 권장 (경고만) ---
    for (const [sid, sk] of Object.entries(skills)) {
        if (sk.bossOnly || sid.startsWith('boss_')) continue;
        if (!Array.isArray(sk.tags) || sk.tags.length === 0) {
            warn.push(`skills.${sid}: tags 권장 (플레이어/일반 몬스터 스킬)`);
        }
    }

    // --- shops (키 = regionId) ---
    const shops = GD.shops;
    if (shops && typeof shops === 'object') {
        for (const [rid, list] of Object.entries(shops)) {
            if (!regionIds.has(rid)) errors.push(`shops: 알 수 없는 region 키 "${rid}"`);
            if (!Array.isArray(list)) continue;
            list.forEach((e, i) => {
                if (e.itemId && !items[e.itemId]) errors.push(`shops.${rid}[${i}]: itemId "${e.itemId}" 없음`);
            });
        }
    }

    // --- relics 등급 ---
    const relicGrades = new Set(['Common', 'Rare', 'Epic']);
    for (const [rid, rel] of Object.entries(GD.relics || {})) {
        if (rel.grade && !relicGrades.has(rel.grade)) {
            warn.push(`relics.${rid}: 비표준 grade "${rel.grade}"`);
        }
    }

    // --- relicShops ---
    const relicShops = GD.relicShops || {};
    const relics = GD.relics || {};
    for (const [rid, list] of Object.entries(relicShops)) {
        if (!regionIds.has(rid)) errors.push(`relicShops: 알 수 없는 region "${rid}"`);
        if (!Array.isArray(list)) continue;
        list.forEach((e, i) => {
            if (e.relicId && !relics[e.relicId]) errors.push(`relicShops.${rid}[${i}]: relicId "${e.relicId}" 없음`);
        });
    }

    // --- relicGacha ---
    const relicGacha = GD.relicGacha || {};
    const gachaModes = [['normal', relicGacha.normal], ['premium', relicGacha.premium]];
    for (const [modeName, mode] of gachaModes) {
        if (!mode) continue;
        const rates = mode.gradeRates || {};
        const sum = Object.values(rates).reduce((acc, v) => acc + Number(v || 0), 0);
        if (Math.abs(sum - 1) > 0.001) {
            errors.push(`relicGacha.${modeName}.gradeRates 합이 1이 아님 (${sum.toFixed(4)})`);
        }
        const pool = mode.poolByGrade || {};
        Object.keys(pool).forEach((grade) => {
            const ids = pool[grade];
            if (!Array.isArray(ids) || ids.length === 0) {
                errors.push(`relicGacha.${modeName}.poolByGrade.${grade} 비어 있음`);
                return;
            }
            ids.forEach((rid) => {
                if (!relics[rid]) errors.push(`relicGacha.${modeName}.poolByGrade.${grade}: relicId "${rid}" 없음`);
                else if ((relics[rid].grade || 'Common') !== grade) warn.push(`relicGacha.${modeName}.${rid}: 풀 등급(${grade})과 relic.grade(${relics[rid].grade}) 불일치`);
            });
        });
    }
    const talentDrop = relicGacha.talentDrop || {};
    const fieldDrop = talentDrop.field || {};
    const bossDrop = talentDrop.boss || {};
    const fieldMin = Number(fieldDrop.min ?? 0.01);
    const fieldMax = Number(fieldDrop.max ?? 0.1);
    if (!(fieldMin > 0 && fieldMax >= fieldMin)) {
        errors.push(`relicGacha.talentDrop.field: min/max 값 오류 (${fieldMin}~${fieldMax})`);
    }
    for (let t = 1; t <= 7; t++) {
        const ch = Number(fieldDrop?.chanceByTier?.[t]);
        if (!Number.isFinite(ch) || ch < 0 || ch > 1) {
            errors.push(`relicGacha.talentDrop.field.chanceByTier.${t}: 0~1 범위 필요`);
        }
        const b = Number(bossDrop?.amountByTier?.[t]);
        if (!Number.isFinite(b) || b < 0.1 || b > 1.0) {
            errors.push(`relicGacha.talentDrop.boss.amountByTier.${t}: 0.1~1.0 범위 필요`);
        }
    }

    // --- smithing ---
    const sm = GD.smithing || {};
    Object.values(sm.gradeCost || {}).forEach((rule, i) => {
        if (rule.materialId && !items[rule.materialId]) errors.push(`smithing.gradeCost[${i}]: materialId "${rule.materialId}" 없음`);
    });
    (sm.recipes || []).forEach((r, i) => {
        if (r.resultItemId && !items[r.resultItemId]) errors.push(`smithing.recipes[${i}]: resultItemId "${r.resultItemId}" 없음`);
        (r.ingredients || []).forEach((ing, j) => {
            if (ing.itemId && !items[ing.itemId]) errors.push(`smithing.recipes[${i}].ingredients[${j}]: itemId 없음`);
        });
    });

    if (errors.length) {
        console.error('검증 실패:\n' + errors.map(e => '  - ' + e).join('\n'));
        process.exit(1);
    }
    if (warn.length) {
        console.warn('경고:\n' + warn.map(w => '  - ' + w).join('\n'));
    }
    console.log(`검증 통과 (몬스터 ${monsters.length}종, 아이템 ${Object.keys(items).length}종, 경고 ${warn.length}건)`);
}

main();
