#!/usr/bin/env node
/**
 * js/data.js 로드 결과와 data/parts 병합 결과가 동일한지 비교 (개발용)
 * 사용: 먼저 node scripts/export-game-data-parts.mjs 실행 후
 *       node scripts/verify-data-roundtrip.mjs
 */
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const partsDir = join(root, 'data', 'parts');

const PART_ORDER = [
    'regions', 'bossDungeon', 'avatars', 'monsters', 'skills', 'monsterSkillTrees',
    'skillTrees', 'items', 'dropTables', 'bossExclusiveDropTables', 'worshipVerses',
    'smithing', 'relics', 'relicShops', 'shops', 'meta'
];

function loadFromDataJs() {
    const ctx = { console };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(readFileSync(join(root, 'js/data/constants.js'), 'utf8'), ctx);
    vm.runInContext(readFileSync(join(root, 'js/data.js'), 'utf8'), ctx);
    return ctx.window.GAME_DATA;
}

function loadFromParts() {
    const GD = {};
    for (const key of PART_ORDER) {
        const p = join(partsDir, `${key}.json`);
        if (!existsSync(p)) throw new Error(`먼저 export 실행: 없음 ${p}`);
        GD[key] = JSON.parse(readFileSync(p, 'utf8'));
    }
    return GD;
}

function stableStringify(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
    const keys = Object.keys(v).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
}

function main() {
    const a = loadFromDataJs();
    const b = loadFromParts();
    const sa = stableStringify(a);
    const sb = stableStringify(b);
    if (sa !== sb) {
        console.error('라운드트립 불일치: data.js 와 data/parts 병합 결과가 다릅니다.');
        process.exit(1);
    }
    console.log('라운드트립 OK (data.js ≡ data/parts)');
}

main();
