/**
 * Basileia - Game Data (Extracted from Lore Books)
 */

const GAME_DATA = {
    monsters: [
        { id: "gray_slime", grade: "F", name: "회색 슬라임", level: 1, stats: { hp: 150, atk: 20, def: 10, spd: 80 }, reward: { exp: 50, gold: 10 }, dropTableId: "drop_f_slime", skills: ["stick"] },
        { id: "greedy_rat", grade: "E", name: "탐욕스러운 쥐", level: 7, stats: { hp: 400, atk: 45, def: 30, spd: 150 }, reward: { exp: 150, gold: 40 }, dropTableId: "drop_e_rat", skills: ["bite"] },
        { id: "weak_wraith", grade: "D", name: "약한 원령", level: 10, stats: { hp: 800, atk: 80, def: 50, spd: 120 }, reward: { exp: 300, gold: 80 }, dropTableId: "drop_d_wraith", skills: ["wail"] },
        { id: "mini_imp", grade: "D", name: "미니 임프", level: 12, stats: { hp: 1000, atk: 90, def: 60, spd: 180 }, reward: { exp: 350, gold: 100 }, dropTableId: "drop_d_imp", skills: ["small_fire"] },
        { id: "wraith", grade: "C", name: "원혼", level: 20, stats: { hp: 2000, atk: 150, def: 100, spd: 180 }, reward: { exp: 800, gold: 200 }, dropTableId: "drop_c_wraith", skills: ["fear"] },
        { id: "poltergeist", grade: "C", name: "폴터가이스트", level: 18, stats: { hp: 1800, atk: 130, def: 90, spd: 220 }, reward: { exp: 700, gold: 180 }, dropTableId: "drop_c_poltergeist", skills: ["telekinesis"] }
    ],
    
    // 스킬 데이터 구체화 (배율 및 효과)
    skills: {
        // Player Skills
        'meditation': { name: '묵상', cost: 10, type: 'buff', effect: { defMul: 1.5, nextCrit: 0.2 }, desc: '방어력을 높이고 다음 공격의 치명타 확률을 증가시킵니다.' },
        'praise': { name: '찬양', cost: 15, type: 'buff', effect: { evade: 0.1, spdMul: 1.15 }, desc: '회피율과 속도를 일시적으로 높입니다.' },
        'proclaim': { name: '선포', cost: 20, type: 'attack', effect: { atkMul: 1.8 }, desc: '성스러운 데미지를 입힙니다.' },
        
        // Monster Skills
        'stick': { name: '끈적이기', type: 'attack', effect: { atkMul: 1.0, spdDebuff: 0.8 } },
        'bite': { name: '물어뜯기', type: 'attack', effect: { atkMul: 1.2 } },
        'wail': { name: '통곡', type: 'attack', effect: { atkMul: 0.8, fear: true } },
        'small_fire': { name: '작은 불꽃', type: 'attack', effect: { atkMul: 1.3 } }
    },

    items: {
        'gray_dust': { name: '회색 가루', grade: 'Normal', desc: '세계를 덮고 있는 무채색의 가루입니다.' },
        'rat_tail': { name: '쥐 꼬리', grade: 'Normal', desc: '탐욕스러운 쥐의 꼬리입니다.' },
        'tiny_horn': { name: '작은 뿔', grade: 'Uncommon', desc: '어린 마귀의 뿔입니다.' }
    }
};

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
