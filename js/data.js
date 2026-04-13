/**
 * Basileia - Game Data (Extracted from Lore Books)
 * 
 * 몬스터 등장 레벨 기준 (player.level):
 *   F등급: Lv.1~3  (game level 1)
 *   E등급: Lv.4~8  (game level 2-3)
 *   D등급: Lv.9~14 (game level 4-6)
 *   C등급: Lv.15+  (game level 7+, 보스전 전용)
 */

const GAME_DATA = {
    monsters: [
        // ========================
        // F 등급 - 비손 유역 초입 (플레이어 Lv.1~3)
        // ========================
        {
            id: "gray_slime",
            grade: "F", name: "회색 슬라임", level: 1, minPlayerLv: 1, maxPlayerLv: 99,
            stats: { hp: 40, atk: 4, def: 2, spd: 60 },
            reward: { exp: 30, gold: 8 },
            dropTableId: "drop_f_slime", skills: ["stick"]
        },
        {
            id: "dust_wisp",
            grade: "F", name: "먼지 정령", level: 2, minPlayerLv: 1, maxPlayerLv: 99,
            stats: { hp: 55, atk: 6, def: 1, spd: 90 },
            reward: { exp: 40, gold: 10 },
            dropTableId: "drop_f_slime", skills: ["stick"]
        },
        {
            id: "gray_moth",
            grade: "F", name: "재색 나방", level: 3, minPlayerLv: 1, maxPlayerLv: 99,
            stats: { hp: 45, atk: 5, def: 3, spd: 110 },
            reward: { exp: 45, gold: 12 },
            dropTableId: "drop_f_slime", skills: ["stick"]
        },

        // ========================
        // E 등급 - 비손 유역 초원 (플레이어 Lv.2~6)
        // ========================
        {
            id: "greedy_rat",
            grade: "E", name: "탐욕스러운 쥐", level: 4, minPlayerLv: 2, maxPlayerLv: 99,
            stats: { hp: 100, atk: 10, def: 6, spd: 105 },
            reward: { exp: 100, gold: 30 },
            dropTableId: "drop_e_rat", skills: ["bite"]
        },
        {
            id: "dark_crow",
            grade: "E", name: "어둠까마귀", level: 5, minPlayerLv: 2, maxPlayerLv: 99,
            stats: { hp: 90, atk: 12, def: 4, spd: 140 },
            reward: { exp: 110, gold: 28 },
            dropTableId: "drop_e_rat", skills: ["bite"]
        },
        {
            id: "rot_frog",
            grade: "E", name: "腐臭 개구리", level: 6, minPlayerLv: 3, maxPlayerLv: 99,
            stats: { hp: 130, atk: 9, def: 8, spd: 80 },
            reward: { exp: 120, gold: 35 },
            dropTableId: "drop_e_rat", skills: ["bite"]
        },
        {
            id: "mud_golem_small",
            grade: "E", name: "작은 진흙 골렘", level: 7, minPlayerLv: 3, maxPlayerLv: 99,
            stats: { hp: 190, atk: 8, def: 14, spd: 50 },
            reward: { exp: 140, gold: 40 },
            dropTableId: "drop_e_rat", skills: ["stick"]
        },

        // ========================
        // D 등급 - 비손 유역 황야 (플레이어 Lv.4~8)
        // ========================
        {
            id: "weak_wraith",
            grade: "D", name: "약한 원령", level: 9, minPlayerLv: 4, maxPlayerLv: 99,
            stats: { hp: 280, atk: 28, def: 15, spd: 115 },
            reward: { exp: 250, gold: 70 },
            dropTableId: "drop_d_wraith", skills: ["wail"]
        },
        {
            id: "shadow_bat",
            grade: "D", name: "그림자 박쥐", level: 10, minPlayerLv: 4, maxPlayerLv: 99,
            stats: { hp: 240, atk: 32, def: 10, spd: 165 },
            reward: { exp: 260, gold: 65 },
            dropTableId: "drop_d_wraith", skills: ["bite"]
        },
        {
            id: "mini_imp",
            grade: "D", name: "미니 임프", level: 11, minPlayerLv: 5, maxPlayerLv: 99,
            stats: { hp: 320, atk: 35, def: 20, spd: 135 },
            reward: { exp: 290, gold: 80 },
            dropTableId: "drop_d_imp", skills: ["small_fire"]
        },
        {
            id: "cursed_scarecrow",
            grade: "D", name: "저주받은 허수아비", level: 12, minPlayerLv: 5, maxPlayerLv: 99,
            stats: { hp: 400, atk: 30, def: 25, spd: 70 },
            reward: { exp: 310, gold: 85 },
            dropTableId: "drop_d_wraith", skills: ["wail"]
        },
        {
            id: "gray_wolf",
            grade: "D", name: "회색 이리", level: 13, minPlayerLv: 6, maxPlayerLv: 99,
            stats: { hp: 360, atk: 40, def: 15, spd: 180 },
            reward: { exp: 340, gold: 90 },
            dropTableId: "drop_d_imp", skills: ["bite"]
        },

        // ========================
        // C 등급 - 비손 유역 심부 (보스 포함, 플레이어 Lv.7+)
        // ※ 일반 탐험에서 등장하지 않음 - 보스 전투 전용
        // ========================
        {
            id: "wraith",
            grade: "C", name: "원혼", level: 20, minPlayerLv: 7, maxPlayerLv: 99,
            stats: { hp: 1200, atk: 85, def: 55, spd: 160 },
            reward: { exp: 700, gold: 200 },
            dropTableId: "drop_c_wraith", skills: ["fear"]
        },
        {
            id: "poltergeist",
            grade: "C", name: "폴터가이스트", level: 22, minPlayerLv: 9, maxPlayerLv: 99,
            stats: { hp: 1500, atk: 100, def: 65, spd: 200 },
            reward: { exp: 900, gold: 250 },
            dropTableId: "drop_c_poltergeist", skills: ["telekinesis"]
        }
    ],

    // 스킬 데이터
    skills: {
        // Player Skills
        'meditation': { name: '묵상', cost: 10, type: 'buff', effect: { defMul: 1.5, nextCrit: 0.2 }, desc: '방어력을 높이고 다음 공격의 치명타 확률을 증가시킵니다.' },
        'praise':     { name: '찬양', cost: 15, type: 'buff', effect: { evade: 0.1, spdMul: 1.15 }, desc: '회피율과 속도를 일시적으로 높입니다.' },
        'proclaim':   { name: '선포', cost: 20, type: 'attack', effect: { atkMul: 1.8 }, desc: '성스러운 데미지를 입힙니다.' },

        // Monster Skills
        'stick':      { name: '끈적이기',  type: 'attack', effect: { atkMul: 1.0, spdDebuff: 0.8 } },
        'bite':       { name: '물어뜯기',  type: 'attack', effect: { atkMul: 1.2 } },
        'wail':       { name: '통곡',      type: 'attack', effect: { atkMul: 0.8, fear: true } },
        'small_fire': { name: '작은 불꽃', type: 'attack', effect: { atkMul: 1.3 } },
        'fear':       { name: '공포',      type: 'attack', effect: { atkMul: 1.1, fear: true } },
        'telekinesis':{ name: '염동력',    type: 'attack', effect: { atkMul: 1.4 } }
    },

    items: {
        // 재료 (Materials)
        'gray_dust':  { name: '회색 가루',   grade: 'Normal',   desc: '세계를 덮고 있는 무채색의 가루입니다.' },
        'rat_tail':   { name: '쥐 꼬리',     grade: 'Normal',   desc: '탐욕스러운 쥐의 꼬리입니다.' },
        'tiny_horn':  { name: '작은 뿔',     grade: 'Uncommon', desc: '어린 마귀의 뿔입니다.' },
        'ghost_dust': { name: '영혼의 먼지', grade: 'Uncommon', desc: '원령이 흩어지며 남긴 먼지입니다.' },

        // 장비 (Equipment) - Normal
        'wooden_sword': {
            name: '부러진 나무검', grade: 'Normal', slot: 'weapon',
            stats: { atk: 3 },
            desc: '누군가 버리고 간 낡은 나무검입니다.'
        },
        'rusty_armor': {
            name: '녹슨 호심경', grade: 'Normal', slot: 'armor',
            stats: { def: 2, hp: 10 },
            desc: '세월의 풍파를 견디지 못하고 녹슬어버린 가슴 보호대입니다.'
        },
        'old_boots': {
            name: '해진 가죽신', grade: 'Normal', slot: 'boots',
            stats: { spd: 5 },
            desc: '바닥이 거의 다 닳아버린 낡은 가죽신입니다.'
        },

        // 장비 (Equipment) - Uncommon
        'iron_sword': {
            name: '낡은 철검', grade: 'Uncommon', slot: 'weapon',
            stats: { atk: 7 },
            desc: '녹이 슬었지만 아직 쓸만한 철검입니다.'
        },
        'leather_vest': {
            name: '가죽 조끼', grade: 'Uncommon', slot: 'armor',
            stats: { def: 5, hp: 20 },
            desc: '두꺼운 짐승 가죽으로 만든 조끼입니다.'
        }
    },

    // 드랍 테이블 정의
    dropTables: {
        'drop_f_slime': [
            { itemId: 'gray_dust', chance: 0.5 },
            { itemId: 'wooden_sword', chance: 0.1 }
        ],
        'drop_e_rat': [
            { itemId: 'rat_tail', chance: 0.5 },
            { itemId: 'rusty_armor', chance: 0.08 },
            { itemId: 'wooden_sword', chance: 0.1 }
        ],
        'drop_d_wraith': [
            { itemId: 'ghost_dust', chance: 0.6 },
            { itemId: 'iron_sword', chance: 0.05 },
            { itemId: 'leather_vest', chance: 0.05 }
        ],
        'drop_d_imp': [
            { itemId: 'tiny_horn', chance: 0.6 },
            { itemId: 'iron_sword', chance: 0.1 },
            { itemId: 'old_boots', chance: 0.1 }
        ],
        'drop_c_wraith': [
            { itemId: 'ghost_dust', chance: 1.0 },
            { itemId: 'iron_sword', chance: 0.3 },
            { itemId: 'leather_vest', chance: 0.3 }
        ]
    }
};

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
