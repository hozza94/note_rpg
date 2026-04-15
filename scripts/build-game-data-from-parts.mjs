#!/usr/bin/env node
/**
 * data/parts/*.json 을 읽어 단일 GAME_DATA JS 파일 생성 (선택적 워크플로)
 * 사용: node scripts/build-game-data-from-parts.mjs [출력경로]
 * 기본: js/data.from-parts.js (검토 후 data.js 와 비교·교체)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const partsDir = join(root, 'data', 'parts');

const PART_ORDER = [
    'regions',
    'bossDungeon',
    'avatars',
    'monsters',
    'monsterCompendium',
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

function loadPart(key) {
    const p = join(partsDir, `${key}.json`);
    if (!existsSync(p)) throw new Error(`파일 없음: ${p}`);
    return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
    const outPath = process.argv[2] || join(root, 'js', 'data.from-parts.js');
    const GAME_DATA = {};
    for (const key of PART_ORDER) {
        GAME_DATA[key] = loadPart(key);
    }
    const body = JSON.stringify(GAME_DATA, null, 4);
    const src = `/**
 * Basileia — data/parts 에서 생성됨 (수동 편집 금지)
 * 생성: node scripts/build-game-data-from-parts.mjs
 */
const GAME_DATA = ${body};

/** implementation_plan_14: 공통 메타(js/data/constants.js)와 동기화 */
GAME_DATA.meta = (typeof window !== 'undefined' && window.GAME_DATA_META) || GAME_DATA.meta;

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
`;
    writeFileSync(outPath, src, 'utf8');
    console.log(`작성: ${outPath}`);
}

main();
