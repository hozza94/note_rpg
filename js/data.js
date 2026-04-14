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
            nextRegionId: 'gihon',
            themeColor: '#00bcd4', // Cyan
            description: '금과 베델리엄이 풍부하여 화려하지만, 탐욕으로 인해 가장 먼저 색이 바랜 땅.'
        },
        'gihon': {
            id: 'gihon',
            name: '기혼 유역',
            minLevel: 8,
            bossId: 'mud_giant',
            nextRegionId: 'hidekel',
            themeColor: '#4caf50', // Emerald Green
            description: '구스 온 땅을 둘렀으며, 짙은 눅눅함과 생명력이 공존하는 늪지대.'
        },
        'hidekel': {
            id: 'hidekel',
            name: '히데겔 협곡',
            minLevel: 14,
            bossId: 'stone_seraph',
            nextRegionId: null,
            themeColor: '#ff9800',
            description: '메마른 협곡과 붉은 바람이 지배하는 땅. 신념이 약하면 방향을 잃기 쉽습니다.'
        }
    },

    monsters: [
        // ========================
        // 비손 유역 (pishon) 몬스터 — skillTreeId로 스킬 풀 참조 (dropTableId와 동일 패턴)
        // ========================
        { id: "gray_slime", regionId: "pishon", grade: "F", name: "회색 슬라임", level: 1, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 40, atk: 4, def: 2, spd: 60 }, reward: { exp: 30, gold: 8 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "dust_wisp", regionId: "pishon", grade: "F", name: "먼지 정령", level: 2, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 55, atk: 6, def: 1, spd: 90 }, reward: { exp: 40, gold: 10 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "gray_moth", regionId: "pishon", grade: "F", name: "재색 나방", level: 3, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 45, atk: 5, def: 3, spd: 110 }, reward: { exp: 45, gold: 12 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "greedy_rat", regionId: "pishon", grade: "E", name: "탐욕스러운 쥐", level: 4, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 100, atk: 10, def: 6, spd: 105 }, reward: { exp: 100, gold: 30 }, dropTableId: "drop_e_rat", skillTreeId: "st_bite_only" },
        { id: "dark_crow", regionId: "pishon", grade: "E", name: "어둠까마귀", level: 5, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 90, atk: 12, def: 4, spd: 140 }, reward: { exp: 110, gold: 28 }, dropTableId: "drop_e_rat", skillTreeId: "st_bite_only" },
        { id: "weak_wraith", regionId: "pishon", grade: "D", name: "약한 원령", level: 9, minPlayerLv: 4, maxPlayerLv: 99, stats: { hp: 280, atk: 28, def: 15, spd: 115 }, reward: { exp: 250, gold: 70 }, dropTableId: "drop_d_wraith", skillTreeId: "st_wail_only" },
        { id: "mini_imp", regionId: "pishon", grade: "D", name: "미니 임프", level: 11, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 320, atk: 35, def: 20, spd: 135 }, reward: { exp: 290, gold: 80 }, dropTableId: "drop_d_imp", skillTreeId: "st_small_fire_only" },

        // 보스: 원혼 (비손)
        { id: "wraith", regionId: "pishon", grade: "C", name: "원혼", level: 20, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1200, atk: 85, def: 55, spd: 160 }, reward: { exp: 700, gold: 200 }, dropTableId: "drop_c_wraith", skillTreeId: "st_wraith_boss", isBoss: true },

        // ========================
        // 기혼 유역 (gihon) 몬스터
        // ========================
        { id: "swamp_frog", regionId: "gihon", grade: "D", name: "늪의 독개구리", level: 10, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 450, atk: 45, def: 25, spd: 90 }, reward: { exp: 350, gold: 120 }, dropTableId: "drop_d_frog", skillTreeId: "st_stick_only" },
        { id: "mud_snake", regionId: "gihon", grade: "D", name: "진흙 구렁이", level: 12, minPlayerLv: 6, maxPlayerLv: 99, stats: { hp: 550, atk: 55, def: 30, spd: 150 }, reward: { exp: 420, gold: 150 }, dropTableId: "drop_d_snake", skillTreeId: "st_bite_only" },
        { id: "moss_skeleton", regionId: "gihon", grade: "C", name: "이끼 낀 해골전사", level: 16, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1000, atk: 90, def: 70, spd: 110 }, reward: { exp: 650, gold: 250 }, dropTableId: "drop_c_skeleton", skillTreeId: "st_wail_only" },
        { id: "swamp_stalker", regionId: "gihon", grade: "C", name: "습지의 추격자", level: 18, minPlayerLv: 8, maxPlayerLv: 99, stats: { hp: 1200, atk: 120, def: 50, spd: 190 }, reward: { exp: 780, gold: 320 }, dropTableId: "drop_c_stalker", skillTreeId: "st_fear_only" },

        // 보스: 진흙 거인 (기혼)
        { id: "mud_giant", regionId: "gihon", grade: "B", name: "진흙 거인", level: 25, minPlayerLv: 10, maxPlayerLv: 99, stats: { hp: 4500, atk: 220, def: 180, spd: 70 }, reward: { exp: 2500, gold: 1000 }, dropTableId: "drop_b_giant", skillTreeId: "st_mud_giant_boss", isBoss: true },

        // ========================
        // 히데겔 협곡 (hidekel) 몬스터
        // ========================
        { id: "canyon_hyena", regionId: "hidekel", grade: "C", name: "협곡 하이에나", level: 19, minPlayerLv: 12, maxPlayerLv: 99, stats: { hp: 1450, atk: 130, def: 70, spd: 185 }, reward: { exp: 920, gold: 360 }, dropTableId: "drop_c_hidekel", skillTreeId: "st_bite_only" },
        { id: "burning_imp", regionId: "hidekel", grade: "C", name: "화염 임프", level: 20, minPlayerLv: 13, maxPlayerLv: 99, stats: { hp: 1500, atk: 145, def: 65, spd: 170 }, reward: { exp: 980, gold: 380 }, dropTableId: "drop_c_hidekel", skillTreeId: "st_small_fire_only" },
        { id: "ash_knight", regionId: "hidekel", grade: "B", name: "잿빛 기사", level: 23, minPlayerLv: 14, maxPlayerLv: 99, stats: { hp: 2600, atk: 185, def: 120, spd: 120 }, reward: { exp: 1550, gold: 620 }, dropTableId: "drop_b_hidekel", skillTreeId: "st_wail_root" },

        // 보스: 석화 세라프 (히데겔)
        { id: "stone_seraph", regionId: "hidekel", grade: "A", name: "석화 세라프", level: 30, minPlayerLv: 16, maxPlayerLv: 99, stats: { hp: 7800, atk: 290, def: 220, spd: 180 }, reward: { exp: 4200, gold: 2000 }, dropTableId: "drop_a_seraph", skillTreeId: "st_stone_seraph_boss", isBoss: true }
    ],

    // 스킬 데이터
    skills: {
        'meditation': { name: '묵상', cost: 10, type: 'buff', effect: { defMul: 1.5, nextCrit: 0.2 }, desc: '방어력을 높이고 다음 공격의 치명타 확률을 증가시킵니다.' },
        'praise':     { name: '찬양', cost: 15, type: 'buff', effect: { evade: 0.1, spdMul: 1.15 }, desc: '회피율과 속도를 일시적으로 높입니다.' },
        'proclaim':   { name: '선포', cost: 20, type: 'attack', effect: { atkMul: 1.8 }, desc: '성스러운 데미지를 입힙니다.' },
        'smite':      { name: '심판의 강타', cost: 22, type: 'attack', effect: { atkMul: 2.0 }, desc: '신념을 모아 강력한 일격을 가합니다.' },
        'holy_wall':  { name: '거룩한 방벽', cost: 18, type: 'buff', effect: { defMul: 1.8, nextCrit: 0.1 }, desc: '잠시 동안 견고한 보호를 얻습니다.' },
        'stick':      { name: '끈적이기',  type: 'attack', effect: { atkMul: 1.0, spdDebuff: 0.8 } },
        'bite':       { name: '물어뜯기',  type: 'attack', effect: { atkMul: 1.2 } },
        'wail':       { name: '통곡',      type: 'attack', effect: { atkMul: 0.8, fear: true } },
        'small_fire': { name: '작은 불꽃', type: 'attack', effect: { atkMul: 1.3 } },
        'fear':       { name: '공포',      type: 'attack', effect: { atkMul: 1.1, fear: true } },
        'telekinesis':{ name: '염동력',    type: 'attack', effect: { atkMul: 1.4 } },
        'root_bind':  { name: '속박의 뿌리', type: 'attack', effect: { atkMul: 0.9, spdDebuff: 0.75, fear: true } },

        // 보스 전용 (플레이어·스킬트리 해금 불가, monsterSkillTrees에서만 참조)
        'boss_wraith_haunt': {
            name: '영혼 잠식', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.18, fear: true },
            desc: '원혼이 그림자처럼 당신의 기력을 긁어냅니다.'
        },
        'boss_wraith_soul_split': {
            name: '분열하는 절규', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.32, fear: true },
            desc: '비명이 여러 갈래로 흩어지며 정신을 갉아먹습니다.'
        },
        'boss_mud_grasp': {
            name: '진흙 손아귀', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.22, spdDebuff: 0.88 },
            desc: '늪이 발목을 잡아당깁니다.'
        },
        'boss_mud_quake': {
            name: '대지의 격동', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.55, spdDebuff: 0.72 },
            desc: '거인이 몸을 부딪쳐 땅이 꺼집니다.'
        },
        'boss_seraph_gaze': {
            name: '석화의 시선', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.28, fear: true, spdDebuff: 0.9 },
            desc: '빛이 시야를 얼려 움직임을 봉쇄합니다.'
        },
        'boss_seraph_petrify': {
            name: '완전 석화', type: 'attack', bossOnly: true,
            effect: { atkMul: 1.42, fear: true, spdDebuff: 0.82 },
            desc: '발끝부터 돌이 되어가는 감각이 옵니다.'
        }
    },

    // 몬스터 스킬 풀 (dropTableId와 동일하게 ID로 참조, HP 구간별 가중치 선택 가능)
    monsterSkillTrees: {
        st_stick_only: {
            id: 'st_stick_only',
            label: '끈적임',
            defaultPool: { skillIds: ['stick'], weights: [1] }
        },
        st_bite_only: {
            id: 'st_bite_only',
            label: '교합',
            defaultPool: { skillIds: ['bite'], weights: [1] }
        },
        st_wail_only: {
            id: 'st_wail_only',
            label: '애가',
            defaultPool: { skillIds: ['wail'], weights: [1] }
        },
        st_small_fire_only: {
            id: 'st_small_fire_only',
            label: '불꽃',
            defaultPool: { skillIds: ['small_fire'], weights: [1] }
        },
        st_fear_only: {
            id: 'st_fear_only',
            label: '압박',
            defaultPool: { skillIds: ['fear'], weights: [1] }
        },
        st_wail_root: {
            id: 'st_wail_root',
            label: '기사',
            defaultPool: { skillIds: ['wail', 'root_bind'], weights: [2, 1] }
        },
        st_wraith_boss: {
            id: 'st_wraith_boss',
            label: '원혼',
            defaultPool: { skillIds: ['fear', 'boss_wraith_haunt'], weights: [1, 2] },
            lowHp: {
                threshold: 0.5,
                skillIds: ['boss_wraith_soul_split', 'fear', 'boss_wraith_haunt'],
                weights: [2, 1, 1]
            }
        },
        st_mud_giant_boss: {
            id: 'st_mud_giant_boss',
            label: '진흙 거인',
            defaultPool: { skillIds: ['telekinesis', 'boss_mud_grasp'], weights: [1, 1] },
            lowHp: {
                threshold: 0.45,
                skillIds: ['boss_mud_quake', 'telekinesis', 'boss_mud_grasp'],
                weights: [2, 1, 1]
            }
        },
        st_stone_seraph_boss: {
            id: 'st_stone_seraph_boss',
            label: '석화 세라프',
            defaultPool: { skillIds: ['fear', 'boss_seraph_gaze', 'telekinesis'], weights: [1, 2, 1] },
            lowHp: {
                threshold: 0.5,
                skillIds: ['boss_seraph_petrify', 'root_bind', 'boss_seraph_gaze', 'fear'],
                weights: [2, 1, 1, 1]
            }
        }
    },

    // 직업 고정형 스킬트리 (PoE 스타일의 연결형 노드 구조, 1차 소규모)
    skillTrees: {
        pilgrim: {
            classId: 'pilgrim',
            className: '순례자',
            startNodeId: 'pilgrim_origin',
            clusters: [
                { id: 'faith_path', name: '신앙의 길', nodeIds: ['pilgrim_faith_1', 'pilgrim_faith_2', 'pilgrim_faith_3', 'pilgrim_faith_core', 'pilgrim_faith_4', 'pilgrim_active_holy_wall', 'pilgrim_faith_final'] },
                { id: 'valor_path', name: '전투의 길', nodeIds: ['pilgrim_atk_1', 'pilgrim_atk_2', 'pilgrim_atk_3', 'pilgrim_valor_core', 'pilgrim_atk_4', 'pilgrim_active_smite', 'pilgrim_valor_final'] },
                { id: 'guard_path', name: '수호의 길', nodeIds: ['pilgrim_def_1', 'pilgrim_def_2', 'pilgrim_def_3', 'pilgrim_guard_core', 'pilgrim_endurance', 'pilgrim_guard_hp_1', 'pilgrim_guard_final'] },
                { id: 'agile_path', name: '기동의 길', nodeIds: ['pilgrim_spd_1', 'pilgrim_grace', 'pilgrim_pp_1', 'pilgrim_agile_core', 'pilgrim_spd_2', 'pilgrim_pp_2', 'pilgrim_agile_final'] },
                { id: 'keystone_path', name: '서약의 길', nodeIds: ['pilgrim_zeal', 'pilgrim_zeal_2', 'pilgrim_resolve', 'pilgrim_resolve_2', 'pilgrim_vow_mid', 'pilgrim_vow_final'] },
                { id: 'contemplation_path', name: '수양의 길', nodeIds: ['pilgrim_cont_1', 'pilgrim_cont_2', 'pilgrim_cont_notable', 'pilgrim_cont_sanctum'] },
                { id: 'oracle_branch', name: '예언의 가지', nodeIds: ['pilgrim_oracle_1', 'pilgrim_oracle_2', 'pilgrim_oracle_notable'] },
                { id: 'skirmish_branch', name: '전장의 측면', nodeIds: ['pilgrim_skirm_1', 'pilgrim_skirm_line'] },
                { id: 'aegis_branch', name: '방패선', nodeIds: ['pilgrim_aegis_1', 'pilgrim_aegis_2'] },
                { id: 'swift_branch', name: '질주선', nodeIds: ['pilgrim_swift_1', 'pilgrim_swift_notable'] },
                { id: 'ascendant_branch', name: '천상 상승', nodeIds: ['pilgrim_sky_1', 'pilgrim_sky_crown'] },
                { id: 'abyss_branch', name: '심연 저항', nodeIds: ['pilgrim_abyss_1', 'pilgrim_abyss_anchor'] }
            ],
            nodes: [
                { id: 'pilgrim_origin', name: '순례의 서약', kind: 'start', desc: '빛을 향한 여정의 시작점입니다.', grants: { stats: { faith: 1 } }, position: { x: 0, y: 0 } },

                { id: 'pilgrim_faith_1', name: '기도의 숨결', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -1.2, y: -0.6 } },
                { id: 'pilgrim_faith_2', name: '축복의 공명', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -2.2, y: -1.2 } },
                { id: 'pilgrim_faith_3', name: '응답의 속삭임', kind: 'notable', desc: '신앙 +2, PP +8', grants: { stats: { faith: 2, pp: 8 } }, position: { x: -3.2, y: -1.8 } },
                { id: 'pilgrim_faith_core', name: '은총의 중핵', kind: 'keystone', desc: '신앙 기반 피해 10% 증가', grants: { specials: { damageMul: 1.1 } }, position: { x: -4.4, y: -2.4 } },
                { id: 'pilgrim_faith_4', name: '성가의 파문', kind: 'small', desc: '신앙 +1, 속도 +2', grants: { stats: { faith: 1, spd: 2 } }, position: { x: -5.6, y: -3.0 } },
                { id: 'pilgrim_active_holy_wall', name: '거룩한 방벽 해금', kind: 'active_unlock', desc: '액티브 스킬 [거룩한 방벽]을 배웁니다.', grants: { activeSkillId: 'holy_wall' }, position: { x: -6.8, y: -3.6 } },
                { id: 'pilgrim_faith_final', name: '성역의 서약', kind: 'keystone', desc: '받는 피해 10% 감소', grants: { specials: { damageTakenMul: 0.9 } }, position: { x: -8.0, y: -4.2 } },

                { id: 'pilgrim_atk_1', name: '신념의 일격', kind: 'small', desc: '공격 +2', grants: { stats: { atk: 2 } }, position: { x: 1.2, y: -0.7 } },
                { id: 'pilgrim_atk_2', name: '맹세의 검', kind: 'small', desc: '공격 +2, 속도 +1', grants: { stats: { atk: 2, spd: 1 } }, position: { x: 2.4, y: -1.3 } },
                { id: 'pilgrim_atk_3', name: '철의 전진', kind: 'notable', desc: '공격 +3, HP +10', grants: { stats: { atk: 3, hp: 10 } }, position: { x: 3.6, y: -1.9 } },
                { id: 'pilgrim_valor_core', name: '심판의 중핵', kind: 'keystone', desc: '피해량 10% 증가', grants: { specials: { damageMul: 1.1 } }, position: { x: 4.8, y: -2.5 } },
                { id: 'pilgrim_atk_4', name: '단죄의 발걸음', kind: 'small', desc: '공격 +3', grants: { stats: { atk: 3 } }, position: { x: 6.0, y: -3.1 } },
                { id: 'pilgrim_active_smite', name: '심판의 강타 해금', kind: 'active_unlock', desc: '액티브 스킬 [심판의 강타]를 배웁니다.', grants: { activeSkillId: 'smite' }, position: { x: 7.2, y: -3.7 } },
                { id: 'pilgrim_valor_final', name: '순결한 심판', kind: 'keystone', desc: '치명타 확률 +8%', grants: { specials: { critChance: 0.08 } }, position: { x: 8.4, y: -4.3 } },

                { id: 'pilgrim_def_1', name: '견고한 걸음', kind: 'small', desc: '방어 +1, HP +10', grants: { stats: { def: 1, hp: 10 } }, position: { x: 1.0, y: 1.0 } },
                { id: 'pilgrim_def_2', name: '강인한 의지', kind: 'small', desc: '방어 +2', grants: { stats: { def: 2 } }, position: { x: 2.0, y: 2.0 } },
                { id: 'pilgrim_def_3', name: '갑주의 기도', kind: 'small', desc: '방어 +2, HP +8', grants: { stats: { def: 2, hp: 8 } }, position: { x: 3.0, y: 3.0 } },
                { id: 'pilgrim_guard_core', name: '수호의 중핵', kind: 'keystone', desc: '받는 피해 8% 감소', grants: { specials: { damageTakenMul: 0.92 } }, position: { x: 4.0, y: 4.0 } },
                { id: 'pilgrim_endurance', name: '수호자 본능', kind: 'notable', desc: 'HP +25, 방어 +2', grants: { stats: { hp: 25, def: 2 } }, position: { x: 5.0, y: 5.0 } },
                { id: 'pilgrim_guard_hp_1', name: '침착한 호흡', kind: 'small', desc: 'HP +20', grants: { stats: { hp: 20 } }, position: { x: 6.0, y: 6.0 } },
                { id: 'pilgrim_guard_final', name: '철벽의 맹세', kind: 'keystone', desc: '받는 피해 12% 감소', grants: { specials: { damageTakenMul: 0.88 } }, position: { x: 7.0, y: 7.0 } },

                { id: 'pilgrim_spd_1', name: '빠른 발', kind: 'small', desc: '속도 +4', grants: { stats: { spd: 4 } }, position: { x: -1.0, y: 1.0 } },
                { id: 'pilgrim_grace', name: '은총의 회피', kind: 'small', desc: '속도 +4, 회피 +3%', grants: { stats: { spd: 4 }, specials: { evadeChance: 0.03 } }, position: { x: -2.0, y: 2.0 } },
                { id: 'pilgrim_pp_1', name: '영적 축적', kind: 'small', desc: 'PP +10', grants: { stats: { pp: 10 } }, position: { x: -3.0, y: 3.0 } },
                { id: 'pilgrim_agile_core', name: '기민의 중핵', kind: 'keystone', desc: '회피 +5%', grants: { specials: { evadeChance: 0.05 } }, position: { x: -4.0, y: 4.0 } },
                { id: 'pilgrim_spd_2', name: '빛의 보폭', kind: 'small', desc: '속도 +5', grants: { stats: { spd: 5 } }, position: { x: -5.0, y: 5.0 } },
                { id: 'pilgrim_pp_2', name: '고요한 축적', kind: 'notable', desc: 'PP +12, 신앙 +1', grants: { stats: { pp: 12, faith: 1 } }, position: { x: -6.0, y: 6.0 } },
                { id: 'pilgrim_agile_final', name: '바람의 서약', kind: 'keystone', desc: '속도 +6, 회피 +7%', grants: { stats: { spd: 6 }, specials: { evadeChance: 0.07 } }, position: { x: -7.0, y: 7.0 } },

                { id: 'pilgrim_zeal', name: '열망의 심장', kind: 'notable', desc: '공격 피해 8% 증가', grants: { specials: { damageMul: 1.08 } }, position: { x: 0, y: -2.0 } },
                { id: 'pilgrim_zeal_2', name: '타오르는 선서', kind: 'small', desc: '공격 +2, 피해 5% 증가', grants: { stats: { atk: 2 }, specials: { damageMul: 1.05 } }, position: { x: 0, y: -3.3 } },
                { id: 'pilgrim_resolve', name: '불굴의 심장', kind: 'notable', desc: '치명타 확률 +5%', grants: { specials: { critChance: 0.05 } }, position: { x: 0, y: 2.0 } },
                { id: 'pilgrim_resolve_2', name: '굳건한 맹세', kind: 'small', desc: '방어 +2, 치명타 +3%', grants: { stats: { def: 2 }, specials: { critChance: 0.03 } }, position: { x: 0, y: 3.3 } },
                { id: 'pilgrim_vow_mid', name: '중심 서약', kind: 'keystone', desc: 'HP 50% 이하일 때 피해 12% 증가', grants: { specials: { lowHpDamageMul: 1.12 } }, position: { x: 0, y: 4.8 } },
                { id: 'pilgrim_vow_final', name: '순교자의 대서약', kind: 'keystone', desc: 'HP 50% 이하일 때 피해 20% 증가, 치명타 +5%', grants: { specials: { lowHpDamageMul: 1.2, critChance: 0.05 } }, position: { x: 0, y: 6.5 } },

                { id: 'pilgrim_cont_1', name: '침묵의 첫걸음', kind: 'small', desc: '신앙 +1, HP +8', grants: { stats: { faith: 1, hp: 8 } }, position: { x: -0.85, y: 0.55 } },
                { id: 'pilgrim_cont_2', name: '내면의 성소', kind: 'small', desc: '방어 +1, PP +6', grants: { stats: { def: 1, pp: 6 } }, position: { x: -1.7, y: 1.15 } },
                { id: 'pilgrim_cont_notable', name: '길잃은 자의 위로', kind: 'notable', desc: 'HP +22, 신앙 +1', grants: { stats: { hp: 22, faith: 1 } }, position: { x: -2.55, y: 1.75 } },
                { id: 'pilgrim_cont_sanctum', name: '고요의 성역', kind: 'keystone', desc: '받는 피해 6% 감소', grants: { specials: { damageTakenMul: 0.94 } }, position: { x: -3.38, y: 2.38 } },

                { id: 'pilgrim_oracle_1', name: '작은 징조', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -3.0, y: -0.35 } },
                { id: 'pilgrim_oracle_2', name: '흐릿한 계시', kind: 'small', desc: '신앙 +1, 속도 +2', grants: { stats: { faith: 1, spd: 2 } }, position: { x: -3.9, y: 0.15 } },
                { id: 'pilgrim_oracle_notable', name: '파편 예언', kind: 'notable', desc: '치명타 확률 +4%', grants: { specials: { critChance: 0.04 } }, position: { x: -4.78, y: 0.72 } },

                { id: 'pilgrim_skirm_1', name: '교전 숙달', kind: 'small', desc: '공격 +2', grants: { stats: { atk: 2 } }, position: { x: 2.05, y: -0.28 } },
                { id: 'pilgrim_skirm_line', name: '돌파선', kind: 'notable', desc: '공격 +2, 속도 +3', grants: { stats: { atk: 2, spd: 3 } }, position: { x: 2.75, y: 0.38 } },

                { id: 'pilgrim_aegis_1', name: '방패 들기', kind: 'small', desc: 'HP +14', grants: { stats: { hp: 14 } }, position: { x: 1.55, y: 1.55 } },
                { id: 'pilgrim_aegis_2', name: '얇은 성역', kind: 'small', desc: '방어 +3, HP +8', grants: { stats: { def: 3, hp: 8 } }, position: { x: 2.18, y: 2.18 } },

                { id: 'pilgrim_swift_1', name: '보조 가속', kind: 'small', desc: '속도 +4', grants: { stats: { spd: 4 } }, position: { x: -1.48, y: 1.55 } },
                { id: 'pilgrim_swift_notable', name: '숨 고르기', kind: 'notable', desc: 'PP +10, 회피 +2%', grants: { stats: { pp: 10 }, specials: { evadeChance: 0.02 } }, position: { x: -2.15, y: 2.18 } },

                { id: 'pilgrim_sky_1', name: '상승 기도', kind: 'small', desc: '피해량 4% 증가', grants: { specials: { damageMul: 1.04 } }, position: { x: 0.48, y: -4.15 } },
                { id: 'pilgrim_sky_crown', name: '빛의 면류관', kind: 'keystone', desc: '피해량 8% 증가, 공격 +2', grants: { stats: { atk: 2 }, specials: { damageMul: 1.08 } }, position: { x: 0.95, y: -5.05 } },

                { id: 'pilgrim_abyss_1', name: '낭떠러지 걸음', kind: 'small', desc: 'HP +18, 방어 +1', grants: { stats: { hp: 18, def: 1 } }, position: { x: 0.52, y: 3.95 } },
                { id: 'pilgrim_abyss_anchor', name: '심연의 닻', kind: 'notable', desc: 'HP 50% 이하일 때 피해 6% 증가, HP +12', grants: { stats: { hp: 12 }, specials: { lowHpDamageMul: 1.06 } }, position: { x: 0.95, y: 4.42 } }
            ],
            edges: [
                ['pilgrim_origin', 'pilgrim_faith_1'],
                ['pilgrim_faith_1', 'pilgrim_faith_2'],
                ['pilgrim_faith_2', 'pilgrim_faith_3'],
                ['pilgrim_faith_3', 'pilgrim_faith_core'],
                ['pilgrim_faith_core', 'pilgrim_faith_4'],
                ['pilgrim_faith_4', 'pilgrim_active_holy_wall'],
                ['pilgrim_active_holy_wall', 'pilgrim_faith_final'],

                ['pilgrim_origin', 'pilgrim_atk_1'],
                ['pilgrim_atk_1', 'pilgrim_atk_2'],
                ['pilgrim_atk_2', 'pilgrim_atk_3'],
                ['pilgrim_atk_3', 'pilgrim_valor_core'],
                ['pilgrim_valor_core', 'pilgrim_atk_4'],
                ['pilgrim_atk_4', 'pilgrim_active_smite'],
                ['pilgrim_active_smite', 'pilgrim_valor_final'],

                ['pilgrim_origin', 'pilgrim_def_1'],
                ['pilgrim_def_1', 'pilgrim_def_2'],
                ['pilgrim_def_2', 'pilgrim_def_3'],
                ['pilgrim_def_3', 'pilgrim_guard_core'],
                ['pilgrim_guard_core', 'pilgrim_endurance'],
                ['pilgrim_endurance', 'pilgrim_guard_hp_1'],
                ['pilgrim_guard_hp_1', 'pilgrim_guard_final'],

                ['pilgrim_origin', 'pilgrim_spd_1'],
                ['pilgrim_spd_1', 'pilgrim_grace'],
                ['pilgrim_grace', 'pilgrim_pp_1'],
                ['pilgrim_pp_1', 'pilgrim_agile_core'],
                ['pilgrim_agile_core', 'pilgrim_spd_2'],
                ['pilgrim_spd_2', 'pilgrim_pp_2'],
                ['pilgrim_pp_2', 'pilgrim_agile_final'],

                ['pilgrim_origin', 'pilgrim_zeal'],
                ['pilgrim_zeal', 'pilgrim_zeal_2'],
                ['pilgrim_origin', 'pilgrim_resolve'],
                ['pilgrim_resolve', 'pilgrim_resolve_2'],
                ['pilgrim_resolve_2', 'pilgrim_vow_mid'],
                ['pilgrim_vow_mid', 'pilgrim_vow_final'],

                ['pilgrim_faith_core', 'pilgrim_zeal_2'],
                ['pilgrim_valor_core', 'pilgrim_zeal_2'],
                ['pilgrim_guard_core', 'pilgrim_vow_mid'],
                ['pilgrim_agile_core', 'pilgrim_vow_mid'],

                ['pilgrim_origin', 'pilgrim_cont_1'],
                ['pilgrim_cont_1', 'pilgrim_cont_2'],
                ['pilgrim_cont_2', 'pilgrim_cont_notable'],
                ['pilgrim_cont_notable', 'pilgrim_cont_sanctum'],

                ['pilgrim_faith_2', 'pilgrim_oracle_1'],
                ['pilgrim_oracle_1', 'pilgrim_oracle_2'],
                ['pilgrim_oracle_2', 'pilgrim_oracle_notable'],

                ['pilgrim_atk_2', 'pilgrim_skirm_1'],
                ['pilgrim_skirm_1', 'pilgrim_skirm_line'],

                ['pilgrim_def_1', 'pilgrim_aegis_1'],
                ['pilgrim_aegis_1', 'pilgrim_aegis_2'],

                ['pilgrim_spd_1', 'pilgrim_swift_1'],
                ['pilgrim_swift_1', 'pilgrim_swift_notable'],

                ['pilgrim_zeal_2', 'pilgrim_sky_1'],
                ['pilgrim_sky_1', 'pilgrim_sky_crown'],

                ['pilgrim_resolve_2', 'pilgrim_abyss_1'],
                ['pilgrim_abyss_1', 'pilgrim_abyss_anchor']
            ]
        }
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
        'mud_boots': { name: '진흙장화', grade: 'Epic', slot: 'boots', stats: { spd: 25, def: 8 }, desc: '어떠한 험비나 늪지대에서도 달릴 수 있게 해주는 마법의 장화입니다.' },

        // --- 투구 (Helmet) ---
        'pilgrim_hood': { name: '순례자의 두건', grade: 'Normal', slot: 'helmet', stats: { def: 2, hp: 8 }, desc: '먼지와 바람을 막아주는 평범한 두건입니다.' },
        'seraph_crown': { name: '세라프의 왕관', grade: 'Epic', slot: 'helmet', stats: { def: 15, faith: 2 }, desc: '석화 세라프의 잔재가 스며든 왕관입니다.' },

        // --- 장신구 (Accessory) ---
        'prayer_ring': { name: '기도의 반지', grade: 'Uncommon', slot: 'accessory', stats: { pp: 12, faith: 1 }, desc: '간결한 기도문이 새겨진 은빛 반지입니다.' },
        'ember_necklace': { name: '잿빛 목걸이', grade: 'Rare', slot: 'accessory', stats: { atk: 6, pp: 10 }, desc: '숨겨진 불씨가 미세하게 맥동하는 목걸이입니다.' },

        // --- 방패 (Off-hand) ---
        'wooden_shield': { name: '나무 방패', grade: 'Normal', slot: 'offhand', stats: { def: 4, hp: 15 }, desc: '기초 방어를 위한 단단한 원형 방패입니다.' },
        'covenant_shield': { name: '언약의 방패', grade: 'Rare', slot: 'offhand', stats: { def: 12, hp: 40, faith: 1 }, desc: '진동하는 문양이 새겨진 신성한 방패입니다.' }
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
        'drop_b_giant': [ { itemId: 'giant_core', chance: 1.0 }, { itemId: 'earth_hammer', chance: 0.2 }, { itemId: 'thorn_armor', chance: 0.15 }, { itemId: 'mud_boots', chance: 0.15 } ],

        // 히데겔 협곡 (Hidekel)
        'drop_c_hidekel': [ { itemId: 'tainted_moss', chance: 0.45 }, { itemId: 'ember_necklace', chance: 0.08 }, { itemId: 'wooden_shield', chance: 0.1 } ],
        'drop_b_hidekel': [ { itemId: 'giant_core', chance: 0.5 }, { itemId: 'covenant_shield', chance: 0.12 }, { itemId: 'steel_longsword', chance: 0.1 } ],
        'drop_a_seraph': [ { itemId: 'seraph_crown', chance: 0.25 }, { itemId: 'covenant_shield', chance: 0.2 }, { itemId: 'earth_hammer', chance: 0.15 } ]
    },

    shops: {
        pishon: [
            { itemId: 'wooden_sword', price: 60 },
            { itemId: 'ragged_cloak', price: 50 },
            { itemId: 'straw_shoes', price: 45 },
            { itemId: 'pilgrim_hood', price: 55 }
        ],
        gihon: [
            { itemId: 'bronze_sword', price: 180 },
            { itemId: 'leather_vest', price: 170 },
            { itemId: 'prayer_ring', price: 210 },
            { itemId: 'wooden_shield', price: 160 }
        ],
        hidekel: [
            { itemId: 'steel_longsword', price: 520 },
            { itemId: 'swamp_leather', price: 480 },
            { itemId: 'ember_necklace', price: 560 },
            { itemId: 'covenant_shield', price: 600 }
        ]
    }
};

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
