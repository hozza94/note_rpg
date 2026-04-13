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
        { id: "swamp_frog", regionId: "gihon", grade: "D", name: "늪의 독개구리", level: 10, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 450, atk: 45, def: 25, spd: 90 }, reward: { exp: 350, gold: 120 }, dropTableId: "drop_d_frog", skills: ["stick"] },
        { id: "mud_snake", regionId: "gihon", grade: "D", name: "진흙 구렁이", level: 12, minPlayerLv: 6, maxPlayerLv: 99, stats: { hp: 550, atk: 55, def: 30, spd: 150 }, reward: { exp: 420, gold: 150 }, dropTableId: "drop_d_snake", skills: ["bite"] },
        { id: "moss_skeleton", regionId: "gihon", grade: "C", name: "이끼 낀 해골전사", level: 16, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1000, atk: 90, def: 70, spd: 110 }, reward: { exp: 650, gold: 250 }, dropTableId: "drop_c_skeleton", skills: ["wail"] },
        { id: "swamp_stalker", regionId: "gihon", grade: "C", name: "습지의 추격자", level: 18, minPlayerLv: 8, maxPlayerLv: 99, stats: { hp: 1200, atk: 120, def: 50, spd: 190 }, reward: { exp: 780, gold: 320 }, dropTableId: "drop_c_stalker", skills: ["fear"] },
        
        // 보스: 진흙 거인 (기혼)
        { id: "mud_giant", regionId: "gihon", grade: "B", name: "진흙 거인", level: 25, minPlayerLv: 10, maxPlayerLv: 99, stats: { hp: 4500, atk: 220, def: 180, spd: 70 }, reward: { exp: 2500, gold: 1000 }, dropTableId: "drop_b_giant", skills: ["telekinesis"] }
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
        // --- 전리품 (재료) ---
        'gray_dust':  { name: '회색 가루',   grade: 'Normal',   desc: '세계를 덮고 있는 무채색의 가루입니다.' },
        'rat_tail':   { name: '쥐 꼬리',     grade: 'Normal',   desc: '탐욕스러운 쥐의 꼬리입니다.' },
        'tiny_horn':  { name: '작은 뿔',     grade: 'Uncommon', desc: '어린 마귀의 뿔입니다.' },
        'ghost_dust': { name: '영혼의 먼지', grade: 'Uncommon', desc: '원령이 흩어지며 남긴 불길한 먼지입니다.' },
        'frog_poison': { name: '개구리 독샘', grade: 'Uncommon', desc: '늪의 독개구리에게서 채취한 맹독 물질입니다.' },
        'snake_scale': { name: '뱀 비늘', grade: 'Uncommon', desc: '진흙 구렁이의 단단하고 질긴 비늘입니다.' },
        'tainted_moss': { name: '오염된 이끼', grade: 'Rare', desc: '해골전사에게 붙어있던 죽음의 이끼입니다.' },
        'giant_core': { name: '거인의 핵', grade: 'Epic', desc: '진흙 거인의 몸체 중심에서 맥동하던 코어입니다.' },

        // --- 무기 (Weapon) ---
        'wooden_sword': { name: '부러진 나무검', grade: 'Normal', slot: 'weapon', stats: { atk: 3 }, desc: '장난감에 가까운 낡은 나무검입니다.' },
        'chipped_dagger': { name: '이 빠진 단검', grade: 'Normal', slot: 'weapon', stats: { atk: 4, spd: 3 }, desc: '날이 많이 상한 녹슨 단검입니다.' },
        'iron_sword': { name: '낡은 철검', grade: 'Uncommon', slot: 'weapon', stats: { atk: 7 }, desc: '녹이 슬었지만 제법 날카로운 철검입니다.' },
        'hunter_bow': { name: '사냥꾼의 활', grade: 'Uncommon', slot: 'weapon', stats: { atk: 8, spd: 5 }, desc: '가볍게 다루기 좋은 수렵용 활입니다.' },
        'bronze_sword': { name: '청동 검', grade: 'Uncommon', slot: 'weapon', stats: { atk: 9, hp: 10 }, desc: '무겁지만 튼튼한 청동 재질의 검입니다.' },
        'silver_dagger': { name: '은장도', grade: 'Rare', slot: 'weapon', stats: { atk: 12, spd: 8 }, desc: '어둠을 베어내는 신성한 은빛 단검입니다.' },
        'steel_longsword': { name: '강철 장검', grade: 'Rare', slot: 'weapon', stats: { atk: 14, hp: 15 }, desc: '숙련된 대장장이가 벼려낸 매끄러운 강철 장검입니다.' },
        'bone_spear': { name: '기혼의 뼈창', grade: 'Rare', slot: 'weapon', stats: { atk: 16, def: 2 }, desc: '거대한 늪 괴수의 뼈로 깎아 만든 날카로운 창입니다.' },
        'wraith_blade': { name: '원혼을 베는 검', grade: 'Epic', slot: 'weapon', stats: { atk: 22, spd: 10 }, desc: '원혼 보스가 사용하던 서늘한 기운을 내뿜는 마검입니다.' },
        'earth_hammer': { name: '대지의 둔기', grade: 'Epic', slot: 'weapon', stats: { atk: 28, def: 10, spd: -5 }, desc: '진흙 거인이 대지를 내리칠 때 쓰던 거대한 둔기입니다.' },

        // --- 방어구 (Armor) ---
        'ragged_cloak': { name: '누더기 망토', grade: 'Normal', slot: 'armor', stats: { def: 1, hp: 5, spd: 2 }, desc: '거적때기를 이어 붙여 만든 엉성한 망토입니다.' },
        'rusty_armor': { name: '녹슨 호심경', grade: 'Normal', slot: 'armor', stats: { def: 2, hp: 10 }, desc: '가슴 부분만을 간신히 가려주는 낡은 철판입니다.' },
        'leather_vest': { name: '가죽 조끼', grade: 'Uncommon', slot: 'armor', stats: { def: 5, hp: 20 }, desc: '질긴 코뿔소 가죽으로 만든 훌륭한 조끼입니다.' },
        'bronze_breastplate': { name: '청동 흉갑', grade: 'Uncommon', slot: 'armor', stats: { def: 7, hp: 30 }, desc: '심장을 보호하기 위해 설계된 청동 마갑입니다.' },
        'swamp_leather': { name: '습지의 가죽옷', grade: 'Rare', slot: 'armor', stats: { def: 9, hp: 35, spd: 5 }, desc: '독늪의 습기를 차단해주는 부드럽고 가벼운 가죽옷입니다.' },
        'steel_armor': { name: '강철 갑옷', grade: 'Rare', slot: 'armor', stats: { def: 12, hp: 50, spd: -2 }, desc: '이름 없는 기사가 남기고 간 견고한 판금 갑옷입니다.' },
        'thorn_armor': { name: '가시나무 흉갑', grade: 'Epic', slot: 'armor', stats: { def: 18, hp: 80 }, desc: '강력한 가시덤불 마력이 얽혀 만들어진 전설적인 방어구입니다.' },

        // --- 신발 (Boots) ---
        'straw_shoes': { name: '짚신', grade: 'Normal', slot: 'boots', stats: { spd: 3, hp: 5 }, desc: '가난한 순례자들이 흔히 매고 다니는 짚신입니다.' },
        'old_boots': { name: '해진 가죽신', grade: 'Normal', slot: 'boots', stats: { spd: 5 }, desc: '뒤축이 완전히 닳아버린 장화입니다.' },
        'sturdy_boots': { name: '튼튼한 가죽화', grade: 'Uncommon', slot: 'boots', stats: { spd: 8, def: 2 }, desc: '마감 처리가 훌륭한 여행자용 가죽 신발입니다.' },
        'soldier_boots': { name: '병사의 전투화', grade: 'Uncommon', slot: 'boots', stats: { spd: 10, hp: 15 }, desc: '왕국군의 규격에 맞춰 제작된 실용적인 군화입니다.' },
        'steel_boots': { name: '강철 군화', grade: 'Rare', slot: 'boots', stats: { spd: 12, def: 5 }, desc: '무겁지만 날카로운 공격으로부터 발을 완벽히 보호합니다.' },
        'wind_shoes': { name: '바람의 신', grade: 'Rare', slot: 'boots', stats: { spd: 20 }, desc: '바람 정령의 축복을 받아 발걸음을 깃털처럼 가볍게 해줍니다.' },
        'mud_boots': { name: '진흙장화', grade: 'Epic', slot: 'boots', stats: { spd: 25, def: 8 }, desc: '어떠한 험비나 늪지대에서도 달릴 수 있게 해주는 마법의 장화입니다.' }
    },

    dropTables: {
        // 비손 유역 (Pishon)
        'drop_f_slime': [ { itemId: 'gray_dust', chance: 0.4 }, { itemId: 'wooden_sword', chance: 0.05 }, { itemId: 'straw_shoes', chance: 0.05 } ],
        'drop_e_rat': [ { itemId: 'rat_tail', chance: 0.4 }, { itemId: 'chipped_dagger', chance: 0.08 }, { itemId: 'ragged_cloak', chance: 0.08 }, { itemId: 'old_boots', chance: 0.08 } ],
        'drop_d_wraith': [ { itemId: 'ghost_dust', chance: 0.5 }, { itemId: 'iron_sword', chance: 0.08 }, { itemId: 'rusty_armor', chance: 0.08 }, { itemId: 'sturdy_boots', chance: 0.06 } ],
        'drop_d_imp': [ { itemId: 'tiny_horn', chance: 0.5 }, { itemId: 'hunter_bow', chance: 0.08 }, { itemId: 'leather_vest', chance: 0.08 }, { itemId: 'soldier_boots', chance: 0.06 } ],
        'drop_c_wraith': [ { itemId: 'ghost_dust', chance: 1.0 }, { itemId: 'wraith_blade', chance: 0.15 }, { itemId: 'bronze_breastplate', chance: 0.15 }, { itemId: 'sturdy_boots', chance: 0.1 } ],
        
        // 기혼 유역 (Gihon)
        'drop_d_frog': [ { itemId: 'frog_poison', chance: 0.4 }, { itemId: 'bronze_sword', chance: 0.08 }, { itemId: 'leather_vest', chance: 0.08 } ],
        'drop_d_snake': [ { itemId: 'snake_scale', chance: 0.4 }, { itemId: 'hunter_bow', chance: 0.08 }, { itemId: 'bronze_breastplate', chance: 0.05 } ],
        'drop_c_skeleton': [ { itemId: 'tainted_moss', chance: 0.5 }, { itemId: 'steel_longsword', chance: 0.1 }, { itemId: 'steel_armor', chance: 0.1 }, { itemId: 'soldier_boots', chance: 0.08 } ],
        'drop_c_stalker': [ { itemId: 'tainted_moss', chance: 0.4 }, { itemId: 'silver_dagger', chance: 0.1 }, { itemId: 'swamp_leather', chance: 0.1 }, { itemId: 'wind_shoes', chance: 0.08 } ],
        'drop_b_giant': [ { itemId: 'giant_core', chance: 1.0 }, { itemId: 'earth_hammer', chance: 0.2 }, { itemId: 'thorn_armor', chance: 0.15 }, { itemId: 'mud_boots', chance: 0.15 } ]
    }
};

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
