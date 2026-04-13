/**
 * Basileia - Game Data
 */

const GAME_DATA = {
    // 지역 정보
    regions: {
        'pishon': {
            id: 'pishon',
            name: '비손 유역',
            minLevel: 1,
            bossId: 'wraith',
            themeColor: '#00bcd4', // Cyan
            description: '금과 베델리엄이 풍부하여 화려하지만, 탐욕으로 인해 가장 먼저 색이 바랜 땅.'
        },
        'gihon': {
            id: 'gihon',
            name: '기혼 유역',
            minLevel: 8,
            bossId: 'mud_giant',
            themeColor: '#4caf50', // Emerald Green
            description: '구스 온 땅을 둘렀으며, 짙은 눅눅함과 생명력이 공존하는 늪지대.'
        }
    },

    monsters: [
        // ========================
        // 비손 유역 (pishon) 몬스터
        // ========================
        { id: "gray_slime", regionId: "pishon", grade: "F", name: "회색 슬라임", level: 1, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 40, atk: 4, def: 2, spd: 60 }, reward: { exp: 30, gold: 8 }, dropTableId: "drop_f_slime", skills: ["stick"] },
        { id: "dust_wisp", regionId: "pishon", grade: "F", name: "먼지 정령", level: 2, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 55, atk: 6, def: 1, spd: 90 }, reward: { exp: 40, gold: 10 }, dropTableId: "drop_f_slime", skills: ["stick"] },
        { id: "gray_moth", regionId: "pishon", grade: "F", name: "재색 나방", level: 3, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 45, atk: 5, def: 3, spd: 110 }, reward: { exp: 45, gold: 12 }, dropTableId: "drop_f_slime", skills: ["stick"] },
        { id: "greedy_rat", regionId: "pishon", grade: "E", name: "탐욕스러운 쥐", level: 4, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 100, atk: 10, def: 6, spd: 105 }, reward: { exp: 100, gold: 30 }, dropTableId: "drop_e_rat", skills: ["bite"] },
        { id: "dark_crow", regionId: "pishon", grade: "E", name: "어둠까마귀", level: 5, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 90, atk: 12, def: 4, spd: 140 }, reward: { exp: 110, gold: 28 }, dropTableId: "drop_e_rat", skills: ["bite"] },
        { id: "weak_wraith", regionId: "pishon", grade: "D", name: "약한 원령", level: 9, minPlayerLv: 4, maxPlayerLv: 99, stats: { hp: 280, atk: 28, def: 15, spd: 115 }, reward: { exp: 250, gold: 70 }, dropTableId: "drop_d_wraith", skills: ["wail"] },
        { id: "mini_imp", regionId: "pishon", grade: "D", name: "미니 임프", level: 11, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 320, atk: 35, def: 20, spd: 135 }, reward: { exp: 290, gold: 80 }, dropTableId: "drop_d_imp", skills: ["small_fire"] },
        
        // 보스: 원혼 (비손)
        { id: "wraith", regionId: "pishon", grade: "C", name: "원혼", level: 20, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1200, atk: 85, def: 55, spd: 160 }, reward: { exp: 700, gold: 200 }, dropTableId: "drop_c_wraith", skills: ["fear"] },

        // ========================
        // 기혼 유역 (gihon) 몬스터
        // ========================
        { id: "swamp_frog", regionId: "gihon", grade: "D", name: "늪의 독개구리", level: 10, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 450, atk: 45, def: 25, spd: 90 }, reward: { exp: 350, gold: 120 }, dropTableId: "drop_d_wraith", skills: ["stick"] },
        { id: "mud_snake", regionId: "gihon", grade: "D", name: "진흙 구렁이", level: 12, minPlayerLv: 6, maxPlayerLv: 99, stats: { hp: 550, atk: 55, def: 30, spd: 150 }, reward: { exp: 420, gold: 150 }, dropTableId: "drop_d_imp", skills: ["bite"] },
        { id: "moss_skeleton", regionId: "gihon", grade: "C", name: "이끼 낀 해골전사", level: 16, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1000, atk: 90, def: 70, spd: 110 }, reward: { exp: 650, gold: 250 }, dropTableId: "drop_c_wraith", skills: ["wail"] },
        { id: "swamp_stalker", regionId: "gihon", grade: "C", name: "습지의 추격자", level: 18, minPlayerLv: 8, maxPlayerLv: 99, stats: { hp: 1200, atk: 120, def: 50, spd: 190 }, reward: { exp: 780, gold: 320 }, dropTableId: "drop_c_wraith", skills: ["fear"] },
        
        // 보스: 진흙 거인 (기혼)
        { id: "mud_giant", regionId: "gihon", grade: "B", name: "진흙 거인", level: 25, minPlayerLv: 10, maxPlayerLv: 99, stats: { hp: 4500, atk: 220, def: 180, spd: 70 }, reward: { exp: 2500, gold: 1000 }, dropTableId: "drop_c_wraith", skills: ["telekinesis"] }
    ],

    // 스킬 데이터
    skills: {
        'meditation': { name: '묵상', cost: 10, type: 'buff', effect: { defMul: 1.5, nextCrit: 0.2 }, desc: '방어력을 높이고 다음 공격의 치명타 확률을 증가시킵니다.' },
        'praise':     { name: '찬양', cost: 15, type: 'buff', effect: { evade: 0.1, spdMul: 1.15 }, desc: '회피율과 속도를 일시적으로 높입니다.' },
        'proclaim':   { name: '선포', cost: 20, type: 'attack', effect: { atkMul: 1.8 }, desc: '성스러운 데미지를 입힙니다.' },
        'stick':      { name: '끈적이기',  type: 'attack', effect: { atkMul: 1.0, spdDebuff: 0.8 } },
        'bite':       { name: '물어뜯기',  type: 'attack', effect: { atkMul: 1.2 } },
        'wail':       { name: '통곡',      type: 'attack', effect: { atkMul: 0.8, fear: true } },
        'small_fire': { name: '작은 불꽃', type: 'attack', effect: { atkMul: 1.3 } },
        'fear':       { name: '공포',      type: 'attack', effect: { atkMul: 1.1, fear: true } },
        'telekinesis':{ name: '염동력',    type: 'attack', effect: { atkMul: 1.4 } }
    },

    items: {
        'gray_dust':  { name: '회색 가루',   grade: 'Normal',   desc: '세계를 덮고 있는 무채색의 가루입니다.' },
        'rat_tail':   { name: '쥐 꼬리',     grade: 'Normal',   desc: '탐욕스러운 쥐의 꼬리입니다.' },
        'tiny_horn':  { name: '작은 뿔',     grade: 'Uncommon', desc: '어린 마귀의 뿔입니다.' },
        'ghost_dust': { name: '영혼의 먼지', grade: 'Uncommon', desc: '원령이 흩어지며 남긴 먼지입니다.' },
        'wooden_sword': { name: '부러진 나무검', grade: 'Normal', slot: 'weapon', stats: { atk: 3 }, desc: '낡은 나무검입니다.' },
        'rusty_armor': { name: '녹슨 호심경', grade: 'Normal', slot: 'armor', stats: { def: 2, hp: 10 }, desc: '낡은 가슴 보호대입니다.' },
        'old_boots': { name: '해진 가죽신', grade: 'Normal', slot: 'boots', stats: { spd: 5 }, desc: '낡은 가죽신입니다.' },
        'iron_sword': { name: '낡은 철검', grade: 'Uncommon', slot: 'weapon', stats: { atk: 7 }, desc: '철검입니다.' },
        'leather_vest': { name: '가죽 조끼', grade: 'Uncommon', slot: 'armor', stats: { def: 5, hp: 20 }, desc: '조끼입니다.' }
    },

    dropTables: {
        'drop_f_slime': [ { itemId: 'gray_dust', chance: 0.5 }, { itemId: 'wooden_sword', chance: 0.1 } ],
        'drop_e_rat': [ { itemId: 'rat_tail', chance: 0.5 }, { itemId: 'rusty_armor', chance: 0.08 }, { itemId: 'wooden_sword', chance: 0.1 } ],
        'drop_d_wraith': [ { itemId: 'ghost_dust', chance: 0.6 }, { itemId: 'iron_sword', chance: 0.05 }, { itemId: 'leather_vest', chance: 0.05 } ],
        'drop_d_imp': [ { itemId: 'tiny_horn', chance: 0.6 }, { itemId: 'iron_sword', chance: 0.1 }, { itemId: 'old_boots', chance: 0.1 } ],
        'drop_c_wraith': [ { itemId: 'ghost_dust', chance: 1.0 }, { itemId: 'iron_sword', chance: 0.3 }, { itemId: 'leather_vest', chance: 0.3 } ]
    }
};

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
