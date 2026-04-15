#!/usr/bin/env node
/**
 * GAME_DATA 상위 키를 data/parts/*.json 으로 내보냄 (implementation_plan_14 Phase 9)
 * 사용: node scripts/export-game-data-parts.mjs
 */
import vm from 'node:vm';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'data', 'parts');

/** data.js 와 동일한 키 순서(가독성·diff 안정) */
const PART_ORDER = [
    'regions',
    'bossDungeon',
    'avatars',
    'monsters',
    'skills',
    'monsterSkillTrees',
    'skillTrees',
    'items',
    'dropTables',
    'bossExclusiveDropTables',
    'worshipVerses',
    'smithing',
    'relics',
    'relicShops',
    'shops',
    'meta'
];

function loadGameData() {
    const ctx = { console };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(readFileSync(join(root, 'js/data/constants.js'), 'utf8'), ctx);
    vm.runInContext(readFileSync(join(root, 'js/data.js'), 'utf8'), ctx);
    const GD = ctx.window.GAME_DATA;
    if (!GD) throw new Error('GAME_DATA not exposed on window');
    return GD;
}

function main() {
    const GD = loadGameData();
    mkdirSync(outDir, { recursive: true });
    let n = 0;
    for (const key of PART_ORDER) {
        if (!(key in GD)) {
            console.warn(`건너뜀: GAME_DATA.${key} 없음`);
            continue;
        }
        const file = join(outDir, `${key}.json`);
        writeFileSync(file, JSON.stringify(GD[key], null, 2) + '\n', 'utf8');
        n++;
    }
    console.log(`data/parts/ 에 ${n}개 파일 기록 완료`);
}

main();
