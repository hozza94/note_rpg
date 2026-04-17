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
            description: '금과 베델리엄이 풍부하여 화려하지만, 탐욕으로 인해 가장 먼저 색이 바랜 땅.',
            fieldGradeMin: 'F',
            fieldGradeMax: 'D',
            recommendedPlayerLv: { min: 1, max: 14 },
            enemyPowerTier: 1
        },
        'gihon': {
            id: 'gihon',
            name: '기혼 유역',
            minLevel: 10,
            bossId: 'mud_giant',
            nextRegionId: 'hidekel',
            themeColor: '#4caf50', // Emerald Green
            description: '구스 온 땅을 둘렀으며, 짙은 눅눅함과 생명력이 공존하는 늪지대.',
            fieldGradeMin: 'D',
            fieldGradeMax: 'C',
            recommendedPlayerLv: { min: 8, max: 22 },
            enemyPowerTier: 2
        },
        'hidekel': {
            id: 'hidekel',
            name: '히데겔 협곡',
            minLevel: 18,
            bossId: 'stone_seraph',
            nextRegionId: 'euphrates',
            themeColor: '#ff9800',
            description: '메마른 협곡과 붉은 바람이 지배하는 땅. 신념이 약하면 방향을 잃기 쉽습니다.',
            fieldGradeMin: 'C',
            fieldGradeMax: 'B',
            recommendedPlayerLv: { min: 16, max: 30 },
            enemyPowerTier: 3
        },
        'euphrates': {
            id: 'euphrates',
            name: '유브라데 전장',
            minLevel: 26,
            bossId: 'abyss_hydra',
            nextRegionId: 'eden_core',
            themeColor: '#7e57c2',
            description: '부서진 성벽과 잿빛 강이 맞닿은 전장. 끝없는 소모전이 이어집니다.',
            fieldGradeMin: 'B',
            fieldGradeMax: 'S',
            recommendedPlayerLv: { min: 24, max: 38 },
            enemyPowerTier: 4
        },
        'eden_core': {
            id: 'eden_core',
            name: '에덴 심연',
            minLevel: 34,
            bossId: 'throne_guardian',
            nextRegionId: 'periphery',
            themeColor: '#ef5350',
            description: '고요하지만 압도적인 심연의 중심. 마지막 시련이 잠들어 있습니다.',
            fieldGradeMin: 'A',
            fieldGradeMax: 'S',
            recommendedPlayerLv: { min: 32, max: 45 },
            enemyPowerTier: 5
        },
        'periphery': {
            id: 'periphery',
            name: '변방의 회랑',
            minLevel: 40,
            bossId: 'border_warden',
            nextRegionId: 'void_remnant',
            themeColor: '#9c27b0',
            description: '에덴 둘레를 도는 잔향의 복도. 떠난 자들의 기억이 아직 걸려 있다.',
            fieldGradeMin: 'A',
            fieldGradeMax: 'SS',
            recommendedPlayerLv: { min: 38, max: 48 },
            enemyPowerTier: 6
        },
        'void_remnant': {
            id: 'void_remnant',
            name: '공허 잔해',
            minLevel: 46,
            bossId: 'void_sovereign',
            nextRegionId: null,
            themeColor: '#455a64',
            description: '세계 끝자락, 색이 완전히 사라진 잔해. 군주만이 그 중심에 선다.',
            fieldGradeMin: 'S',
            fieldGradeMax: 'SSS',
            recommendedPlayerLv: { min: 44, max: 55 },
            enemyPowerTier: 7
        }
    },

    // 보스 던전 목록 (보스 재도전용)
    bossDungeon: {
        entries: [
            { bossId: 'wraith', regionId: 'pishon', recommendedLv: 14, unlockType: 'region_reached' },
            { bossId: 'mud_giant', regionId: 'gihon', recommendedLv: 22, unlockType: 'region_reached' },
            { bossId: 'stone_seraph', regionId: 'hidekel', recommendedLv: 30, unlockType: 'region_reached' },
            { bossId: 'abyss_hydra', regionId: 'euphrates', recommendedLv: 38, unlockType: 'region_reached' },
            { bossId: 'throne_guardian', regionId: 'eden_core', recommendedLv: 45, unlockType: 'region_reached' },
            { bossId: 'border_warden', regionId: 'periphery', recommendedLv: 47, unlockType: 'region_reached' },
            { bossId: 'void_sovereign', regionId: 'void_remnant', recommendedLv: 52, unlockType: 'region_reached' }
        ]
    },

    // 아바타 카탈로그 — 파일은 assets/avatars/ 기준(file=파일명만). basePath·defaultFiles는 AvatarAssets가 조합.
    avatars: {
        basePath: 'assets/avatars/',
        defaultFiles: { male: 'Avatar_M.png', female: 'Avatar_F_AA.png' },
        defaultSelectedId: 'male_base',
        defaultUnlockedIds: [
            'male_base', 'female_aa', 'female_swim', 'female_full', 'female_l', 'female_aa_alt',
            'sketch_portrait_a', 'portrait_lll', 'portrait_llll', 'portrait_duct',
            'pilgrim_silhouette', 'equipment_preview_gemini',
            'beauty', 'beauty_1', 'beauty_2'
        ],
        list: [
            { id: 'male_base', label: '남성 기본', gender: 'male', file: 'Avatar_M.png', rarity: 'base', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'female_aa', label: '여성 기본 (AA)', gender: 'female', file: 'Avatar_F_AA.png', rarity: 'base', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'female_swim', label: '여성 수영복', gender: 'female', file: 'Avatar_F_S.png', rarity: 'special', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'female_full', label: '여성 일러스트 (F)', gender: 'female', file: 'Avatar_F.png', rarity: 'common', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'female_l', label: '여성 L', gender: 'female', file: 'Avatar_F_L.png', rarity: 'common', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'female_aa_alt', label: '여성 변형 (aa)', gender: 'female', file: 'aa.png', rarity: 'common', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'sketch_portrait_a', label: '초상 스케치 A', gender: 'male', file: 'a.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'portrait_lll', label: '추가 초상 (lll)', gender: 'female', file: 'lll.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'portrait_llll', label: '추가 초상 (llll)', gender: 'female', file: 'llll.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'portrait_duct', label: '추가 초상 (duct)', gender: 'male', file: 'duct.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'pilgrim_silhouette', label: '순례자 실루엣 (SVG)', gender: 'male', file: 'pilgrim_avatar.svg', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'equipment_preview_gemini', label: '장비 합성 프리뷰', gender: 'female', file: 'gemini_equipment_avatar.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'beauty', label: '뷰티 (석양)', gender: 'female', file: 'beauty.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'beauty_1', label: '뷰티 변형 1', gender: 'female', file: 'beauty_1.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' },
            { id: 'beauty_2', label: '뷰티 변형 2', gender: 'female', file: 'beauty_2.png', rarity: 'extra', unlockType: 'default', unlockHint: '기본 해금' }
        ]
    },

    monsters: [
        // ========================
        // 비손 유역 (pishon) 몬스터 — skillTreeId로 스킬 풀 참조 (dropTableId와 동일 패턴)
        // ========================
        { id: "gray_slime", tags: ["field","pishon"], regionId: "pishon", grade: "F", name: "회색 슬라임", level: 1, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 40, atk: 4, def: 2, spd: 60 }, reward: { exp: 30, gold: 8 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "dust_wisp", tags: ["field","pishon"], regionId: "pishon", grade: "F", name: "먼지 정령", level: 2, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 55, atk: 6, def: 1, spd: 90 }, reward: { exp: 40, gold: 10 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "gray_moth", tags: ["field","pishon"], regionId: "pishon", grade: "F", name: "재색 나방", level: 3, minPlayerLv: 1, maxPlayerLv: 99, stats: { hp: 45, atk: 5, def: 3, spd: 110 }, reward: { exp: 45, gold: 12 }, dropTableId: "drop_f_slime", skillTreeId: "st_stick_only" },
        { id: "greedy_rat", tags: ["field","pishon"], regionId: "pishon", grade: "E", name: "탐욕스러운 쥐", level: 4, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 100, atk: 10, def: 6, spd: 105 }, reward: { exp: 100, gold: 30 }, dropTableId: "drop_e_rat", skillTreeId: "st_bite_only" },
        { id: "dark_crow", tags: ["field","pishon"], regionId: "pishon", grade: "E", name: "어둠까마귀", level: 5, minPlayerLv: 2, maxPlayerLv: 99, stats: { hp: 90, atk: 12, def: 4, spd: 140 }, reward: { exp: 110, gold: 28 }, dropTableId: "drop_e_rat", skillTreeId: "st_bite_only" },
        { id: "weak_wraith", tags: ["field","pishon"], regionId: "pishon", grade: "D", name: "약한 원령", level: 8, minPlayerLv: 4, maxPlayerLv: 99, stats: { hp: 280, atk: 28, def: 15, spd: 115 }, reward: { exp: 250, gold: 70 }, dropTableId: "drop_d_wraith", skillTreeId: "st_wail_only" },
        { id: "mini_imp", tags: ["field","pishon"], regionId: "pishon", grade: "D", name: "미니 임프", level: 10, minPlayerLv: 5, maxPlayerLv: 99, stats: { hp: 320, atk: 35, def: 20, spd: 135 }, reward: { exp: 290, gold: 80 }, dropTableId: "drop_d_imp", skillTreeId: "st_small_fire_only" },

        // 보스: 원혼 (비손)
        { id: "wraith", tags: ["boss","pishon"], regionId: "pishon", grade: "C", name: "원혼", level: 14, minPlayerLv: 7, maxPlayerLv: 99, stats: { hp: 1200, atk: 85, def: 55, spd: 160 }, reward: { exp: 1225, gold: 250 }, dropTableId: "drop_c_wraith", isBoss: true, bossPassiveSkillIds: ["boss_p_malice", "boss_p_grudge_shell"], bossActiveSkillIds: ["boss_wraith_haunt", "boss_a_iron_hide"], bossActiveWeights: [2, 1] },

        // ========================
        // 기혼 유역 (gihon) 몬스터
        // ========================
        { id: "swamp_frog", tags: ["field","gihon"], regionId: "gihon", grade: "D", name: "늪의 독개구리", level: 11, minPlayerLv: 8, maxPlayerLv: 99, stats: { hp: 450, atk: 45, def: 25, spd: 90 }, reward: { exp: 350, gold: 120 }, dropTableId: "drop_d_frog", skillTreeId: "st_stick_only" },
        { id: "mud_snake", tags: ["field","gihon"], regionId: "gihon", grade: "D", name: "진흙 구렁이", level: 13, minPlayerLv: 9, maxPlayerLv: 99, stats: { hp: 550, atk: 55, def: 30, spd: 150 }, reward: { exp: 420, gold: 150 }, dropTableId: "drop_d_snake", skillTreeId: "st_bite_only" },
        { id: "moss_skeleton", tags: ["field","gihon"], regionId: "gihon", grade: "C", name: "이끼 낀 해골전사", level: 16, minPlayerLv: 10, maxPlayerLv: 99, stats: { hp: 1000, atk: 90, def: 70, spd: 110 }, reward: { exp: 650, gold: 250 }, dropTableId: "drop_c_skeleton", skillTreeId: "st_wail_only" },
        { id: "swamp_stalker", tags: ["field","gihon"], regionId: "gihon", grade: "C", name: "습지의 추격자", level: 19, minPlayerLv: 11, maxPlayerLv: 99, stats: { hp: 1200, atk: 120, def: 50, spd: 190 }, reward: { exp: 780, gold: 320 }, dropTableId: "drop_c_stalker", skillTreeId: "st_fear_only" },

        // 보스: 진흙 거인 (기혼)
        { id: "mud_giant", tags: ["boss","gihon"], regionId: "gihon", grade: "B", name: "진흙 거인", level: 22, minPlayerLv: 12, maxPlayerLv: 99, stats: { hp: 4500, atk: 220, def: 180, spd: 70 }, reward: { exp: 4375, gold: 1250 }, dropTableId: "drop_b_giant", isBoss: true, bossPassiveSkillIds: ["boss_p_deep_root", "boss_p_stone_blood"], bossActiveSkillIds: ["boss_mud_grasp", "boss_a_war_drum"], bossActiveWeights: [1, 1] },

        // ========================
        // 히데겔 협곡 (hidekel) 몬스터
        // ========================
        { id: "canyon_hyena", tags: ["field","hidekel"], regionId: "hidekel", grade: "C", name: "협곡 하이에나", level: 20, minPlayerLv: 16, maxPlayerLv: 99, stats: { hp: 1450, atk: 130, def: 70, spd: 185 }, reward: { exp: 920, gold: 360 }, dropTableId: "drop_c_hidekel", skillTreeId: "st_bite_only" },
        { id: "burning_imp", tags: ["field","hidekel"], regionId: "hidekel", grade: "C", name: "화염 임프", level: 23, minPlayerLv: 17, maxPlayerLv: 99, stats: { hp: 1500, atk: 145, def: 65, spd: 170 }, reward: { exp: 980, gold: 380 }, dropTableId: "drop_c_hidekel", skillTreeId: "st_small_fire_only" },
        { id: "ash_knight", tags: ["field","hidekel"], regionId: "hidekel", grade: "B", name: "잿빛 기사", level: 27, minPlayerLv: 18, maxPlayerLv: 99, stats: { hp: 2600, atk: 185, def: 120, spd: 120 }, reward: { exp: 1550, gold: 620 }, dropTableId: "drop_b_hidekel", skillTreeId: "st_wail_root" },

        // 보스: 석화 세라프 (히데겔)
        { id: "stone_seraph", tags: ["boss","hidekel"], regionId: "hidekel", grade: "A", name: "석화 세라프", level: 30, minPlayerLv: 20, maxPlayerLv: 99, stats: { hp: 7800, atk: 290, def: 220, spd: 180 }, reward: { exp: 7350, gold: 2500 }, dropTableId: "drop_a_seraph", isBoss: true, bossPassiveSkillIds: ["boss_p_grudge_shell", "boss_p_malice", "boss_p_throne_sigil"], bossActiveSkillIds: ["boss_seraph_gaze", "boss_a_iron_hide", "boss_a_fortress"], bossActiveWeights: [2, 1, 1] },

        // ========================
        // 유브라데 전장 (euphrates) 몬스터
        // ========================
        { id: "rift_reaver", tags: ["field","euphrates"], regionId: "euphrates", grade: "B", name: "균열 약탈자", level: 28, minPlayerLv: 24, maxPlayerLv: 99, stats: { hp: 2900, atk: 210, def: 135, spd: 170 }, reward: { exp: 1850, gold: 760 }, dropTableId: "drop_b_euphrates", skillTreeId: "st_fear_only" },
        { id: "obsidian_hound", tags: ["field","euphrates"], regionId: "euphrates", grade: "B", name: "흑요 사냥개", level: 31, minPlayerLv: 25, maxPlayerLv: 99, stats: { hp: 3200, atk: 230, def: 145, spd: 185 }, reward: { exp: 2100, gold: 820 }, dropTableId: "drop_b_euphrates", skillTreeId: "st_bite_only" },
        { id: "warlock_remnant", tags: ["field","euphrates"], regionId: "euphrates", grade: "A", name: "전장의 주술 잔재", level: 35, minPlayerLv: 26, maxPlayerLv: 99, stats: { hp: 4100, atk: 265, def: 165, spd: 160 }, reward: { exp: 2800, gold: 980 }, dropTableId: "drop_a_euphrates", skillTreeId: "st_wail_root" },
        { id: "void_marauder", tags: ["field","euphrates"], regionId: "euphrates", grade: "S", name: "공허의 약탈자", level: 36, minPlayerLv: 28, maxPlayerLv: 99, stats: { hp: 6500, atk: 295, def: 185, spd: 178 }, reward: { exp: 3400, gold: 1050 }, dropTableId: "drop_a_euphrates", skillTreeId: "st_wail_root" },

        // 보스: 심연 히드라 (유브라데)
        { id: "abyss_hydra", tags: ["boss","euphrates"], regionId: "euphrates", grade: "A", name: "심연 히드라", level: 38, minPlayerLv: 28, maxPlayerLv: 99, stats: { hp: 9800, atk: 360, def: 250, spd: 210 }, reward: { exp: 10850, gold: 3500 }, dropTableId: "drop_a_hydra", isBoss: true, bossPassiveSkillIds: ["boss_p_abyss_tide", "boss_p_swarm_mind", "boss_p_deep_root"], bossActiveSkillIds: ["boss_hydra_maelstrom", "boss_a_overdrive", "bite"], bossActiveWeights: [2, 1, 1] },

        // ========================
        // 에덴 심연 (eden_core) 몬스터
        // ========================
        { id: "throne_sentinel", tags: ["field","eden_core"], regionId: "eden_core", grade: "A", name: "왕좌 감시병", level: 36, minPlayerLv: 32, maxPlayerLv: 99, stats: { hp: 4600, atk: 285, def: 190, spd: 170 }, reward: { exp: 3200, gold: 1200 }, dropTableId: "drop_a_eden", skillTreeId: "st_wail_root" },
        { id: "halo_wraith", tags: ["field","eden_core"], regionId: "eden_core", grade: "A", name: "고리 원령", level: 39, minPlayerLv: 33, maxPlayerLv: 99, stats: { hp: 5100, atk: 315, def: 210, spd: 195 }, reward: { exp: 3700, gold: 1380 }, dropTableId: "drop_a_eden", skillTreeId: "st_fear_only" },
        { id: "eden_judicator", tags: ["field","eden_core"], regionId: "eden_core", grade: "S", name: "에덴 심판관", level: 42, minPlayerLv: 34, maxPlayerLv: 99, stats: { hp: 5800, atk: 340, def: 230, spd: 185 }, reward: { exp: 4300, gold: 1600 }, dropTableId: "drop_s_eden", skillTreeId: "st_stone_seraph_boss" },
        { id: "core_devourer", tags: ["field","eden_core"], regionId: "eden_core", grade: "S", name: "심연 심장의 포식자", level: 44, minPlayerLv: 34, maxPlayerLv: 99, stats: { hp: 9200, atk: 380, def: 245, spd: 200 }, reward: { exp: 6200, gold: 2100 }, dropTableId: "drop_s_eden", skillTreeId: "st_fear_only" },

        // 보스: 왕좌 수호자 (에덴 심연)
        { id: "throne_guardian", tags: ["boss","eden_core"], regionId: "eden_core", grade: "S", name: "왕좌 수호자", level: 45, minPlayerLv: 36, maxPlayerLv: 99, stats: { hp: 13000, atk: 420, def: 300, spd: 220 }, reward: { exp: 15750, gold: 5250 }, dropTableId: "drop_s_guardian", isBoss: true, bossPassiveSkillIds: ["boss_p_throne_sigil", "boss_p_crown_pressure", "boss_p_stone_blood", "boss_p_restless"], bossActiveSkillIds: ["boss_guardian_verdict", "boss_seraph_gaze", "boss_a_rampart", "telekinesis"], bossActiveWeights: [2, 1, 1, 1], bossActiveLowHp: { threshold: 0.45, skillIds: ["boss_guardian_verdict", "boss_seraph_petrify", "boss_hydra_maelstrom", "boss_a_overdrive"], weights: [2, 1, 1, 1] } },

        // ========================
        // 변방의 회랑 (periphery)
        // ========================
        { id: "periphery_sentinel", tags: ["field","periphery"], regionId: "periphery", grade: "A", name: "회랑의 파수꾼", level: 40, minPlayerLv: 38, maxPlayerLv: 99, stats: { hp: 5200, atk: 300, def: 195, spd: 175 }, reward: { exp: 4800, gold: 1500 }, dropTableId: "drop_periphery_field", skillTreeId: "st_wail_root" },
        { id: "periphery_stalker", tags: ["field","periphery"], regionId: "periphery", grade: "A", name: "변두리 추적자", level: 42, minPlayerLv: 38, maxPlayerLv: 99, stats: { hp: 5800, atk: 318, def: 205, spd: 188 }, reward: { exp: 5400, gold: 1680 }, dropTableId: "drop_periphery_field", skillTreeId: "st_fear_only" },
        { id: "periphery_harbinger", tags: ["field","periphery"], regionId: "periphery", grade: "SS", name: "잔향의 선구자", level: 44, minPlayerLv: 38, maxPlayerLv: 99, stats: { hp: 6800, atk: 335, def: 218, spd: 182 }, reward: { exp: 6200, gold: 1900 }, dropTableId: "drop_periphery_field", skillTreeId: "st_wail_root" },
        { id: "border_warden", tags: ["boss","periphery"], regionId: "periphery", grade: "SS", name: "변방 감시자", level: 47, minPlayerLv: 40, maxPlayerLv: 99, stats: { hp: 15800, atk: 445, def: 315, spd: 228 }, reward: { exp: 18200, gold: 5800 }, dropTableId: "drop_border_warden", isBoss: true, bossPassiveSkillIds: ["boss_p_border_lock", "boss_p_null_skin", "boss_p_throne_sigil", "boss_p_abyss_tide"], bossActiveSkillIds: ["boss_guardian_verdict", "boss_a_void_surge", "boss_a_fortress", "boss_seraph_gaze"], bossActiveWeights: [2, 1, 1, 1], bossActiveLowHp: { threshold: 0.45, skillIds: ["boss_guardian_verdict", "boss_seraph_petrify", "boss_hydra_maelstrom", "boss_a_bloodlust"], weights: [2, 1, 1, 1] } },

        // ========================
        // 공허 잔해 (void_remnant)
        // ========================
        { id: "void_lurker", tags: ["field","void_remnant"], regionId: "void_remnant", grade: "SS", name: "공허의 잠복자", level: 46, minPlayerLv: 44, maxPlayerLv: 99, stats: { hp: 7800, atk: 355, def: 232, spd: 195 }, reward: { exp: 7200, gold: 2200 }, dropTableId: "drop_void_field", skillTreeId: "st_fear_only" },
        { id: "void_executioner", tags: ["field","void_remnant"], regionId: "void_remnant", grade: "SS", name: "잔해의 집행자", level: 48, minPlayerLv: 44, maxPlayerLv: 99, stats: { hp: 8500, atk: 375, def: 245, spd: 188 }, reward: { exp: 8100, gold: 2450 }, dropTableId: "drop_void_field", skillTreeId: "st_wail_root" },
        { id: "void_colossus", tags: ["field","void_remnant"], regionId: "void_remnant", grade: "SSS", name: "공허 거신", level: 50, minPlayerLv: 44, maxPlayerLv: 99, stats: { hp: 9800, atk: 395, def: 268, spd: 165 }, reward: { exp: 9200, gold: 2800 }, dropTableId: "drop_void_field", skillTreeId: "st_bite_only" },
        { id: "void_sovereign", tags: ["boss","void_remnant"], regionId: "void_remnant", grade: "SSS", name: "공허의 군주", level: 52, minPlayerLv: 46, maxPlayerLv: 99, stats: { hp: 19800, atk: 495, def: 355, spd: 238 }, reward: { exp: 22000, gold: 7200 }, dropTableId: "drop_void_sovereign", isBoss: true, bossPassiveSkillIds: ["boss_p_void_heart", "boss_p_null_skin", "boss_p_abyss_tide", "boss_p_crown_pressure", "boss_p_border_lock"], bossActiveSkillIds: ["boss_guardian_verdict", "boss_hydra_maelstrom", "boss_seraph_petrify", "boss_a_overdrive", "boss_a_bloodlust"], bossActiveWeights: [2, 2, 1, 1, 1], bossActiveLowHp: { threshold: 0.42, skillIds: ["boss_guardian_verdict", "boss_hydra_maelstrom", "boss_seraph_petrify", "boss_a_overdrive", "boss_mud_quake"], weights: [2, 2, 1, 1, 1] } }
    ],

    // 로어북 기반 몬스터/보스 카탈로그(미출현 보관용). 실제 출현은 regions·monsters 체인에 추가 시 활성화.
    monsterCompendium: {
        source: 'Lore Book/Lore Book _ Monster.md',
        archived: [
            { id: 'lucifer', grade: 'SSS', name: '루시퍼', type: 'archdemon', level: 100, dropTableId: 'drop_sss_lucifer', skills: ['falling_light', 'soul_domination'] },
            { id: 'baal', grade: 'SS', name: '바알', type: 'archdemon', level: 90, dropTableId: 'drop_ss_baal', skills: ['flame_tyrant', 'fear_aura'] },
            { id: 'astaroth', grade: 'SS', name: '아스타로트', type: 'archdemon', level: 88, dropTableId: 'drop_ss_astaroth', skills: ['knowledge_drain', 'chaos_magic'] },
            { id: 'beelzebub', grade: 'S', name: '벨제부브', type: 'high_demon', level: 75, dropTableId: 'drop_s_beelzebub', skills: ['decay_breath'] },
            { id: 'asmodeus', grade: 'S', name: '아스모데우스', type: 'high_demon', level: 72, dropTableId: 'drop_s_asmodeus', skills: ['temptation', 'mind_control'] },
            { id: 'baphomet', grade: 'A', name: '바포메트', type: 'mid_demon', level: 60, dropTableId: 'drop_a_baphomet', skills: ['dark_ritual'] },
            { id: 'incubus', grade: 'A', name: '인큐버스', type: 'mid_demon', level: 55, dropTableId: 'drop_a_incubus', skills: ['life_drain'] },
            { id: 'imp', grade: 'B', name: '임프', type: 'low_demon', level: 35, dropTableId: 'drop_b_imp', skills: ['trick_fire'] },
            { id: 'hellhound', grade: 'B', name: '헬하운드', type: 'beast', level: 40, dropTableId: 'drop_b_hellhound', skills: ['flame_dash'] },
            { id: 'poltergeist', grade: 'C', name: '폴터가이스트', type: 'ghost', level: 18, dropTableId: 'drop_c_poltergeist', skills: ['telekinesis'] },
            { id: 'shadow_wraith', grade: 'C', name: '그림자 망령', type: 'ghost', level: 22, dropTableId: 'drop_c_shadow', skills: ['stealth', 'ambush'] },
            { id: 'cursed_doll', grade: 'C', name: '저주받은 인형', type: 'cursed', level: 19, dropTableId: 'drop_c_doll', skills: ['fear_gaze'] },
            { id: 'lost_soul', grade: 'C', name: '떠도는 영혼', type: 'ghost', level: 17, dropTableId: 'drop_c_soul', skills: ['possession'] },
            { id: 'nightmare_remnant', grade: 'C', name: '악몽의 잔재', type: 'mental', level: 23, dropTableId: 'drop_c_nightmare', skills: ['hallucination'] }
        ]
    },

    // 스킬 데이터
    skills: {
        'meditation': { name: '묵상', tags: ['buff', 'heal', 'defense'], cost: 10, type: 'buff', effect: { defMul: 1.5, nextCrit: 0.2 }, scaling: { heal: { base: 24, atk: 0.12, def: 1.8, faith: 9 } }, desc: '방어력을 높이고 다음 공격의 치명타 확률을 증가시킵니다.' },
        'praise':     { name: '찬양', tags: ['buff', 'evade', 'spd'], cost: 15, type: 'buff', effect: { evade: 0.1, spdMul: 1.15 }, scaling: { buff: { evadeBase: 0.02, evadeFaith: 0.006, evadeSpd: 0.0002, spdMulBase: 0.02, spdMulFaith: 0.004, spdMulSpd: 0.00025 } }, desc: '회피율과 속도를 일시적으로 높입니다.' },
        'proclaim':   { name: '선포', tags: ['attack', 'holy'], cost: 20, type: 'attack', effect: { atkMul: 1.8 }, scaling: { damage: { base: 12, atk: 0.28, def: 0.05, faith: 2.6 } }, desc: '성스러운 데미지를 입힙니다.' },
        'smite':      { name: '심판의 강타', tags: ['attack', 'holy'], cost: 22, type: 'attack', effect: { atkMul: 2.0 }, scaling: { damage: { base: 20, atk: 0.34, def: 0.08, faith: 3.0 } }, desc: '신념을 모아 강력한 일격을 가합니다.' },
        'holy_wall':  { name: '거룩한 방벽', tags: ['buff', 'defense'], cost: 18, type: 'buff', effect: { defMul: 1.8, nextCrit: 0.1 }, desc: '잠시 동안 견고한 보호를 얻습니다.' },
        'aegis_prayer': { name: '수호의 기도', tags: ['buff', 'defense', 'evade'], cost: 20, type: 'buff', effect: { defMul: 2.0, evade: 0.08 }, desc: '방어를 대폭 강화하고 짧게 회피력을 끌어올립니다.' },
        'purify': { name: '정화의 숨', tags: ['buff', 'cleanse'], cost: 14, type: 'buff', effect: { cleanse: true }, desc: '공포와 이동 둔화를 즉시 해제합니다.' },
        'light_dash': { name: '광휘 질주', tags: ['attack', 'debuff', 'spd'], cost: 19, type: 'attack', effect: { atkMul: 1.7, spdDebuff: 0.88 }, scaling: { damage: { base: 16, atk: 0.26, def: 0.04, faith: 2.0 } }, desc: '빛처럼 파고들어 적의 균형을 무너뜨립니다.' },
        'martyr_brand': { name: '순교자의 낙인', tags: ['attack', 'fear'], cost: 27, type: 'attack', effect: { atkMul: 2.35, fear: true }, scaling: { damage: { base: 30, atk: 0.42, def: 0.1, faith: 2.4 } }, desc: '고통을 힘으로 바꿔 극단적인 일격을 가합니다.' },
        'radiant_volley': { name: '광휘 난사', tags: ['attack', 'holy'], cost: 24, type: 'attack', effect: { atkMul: 1.72 }, scaling: { damage: { base: 14, atk: 0.30, def: 0.06, faith: 2.8 } }, desc: '빛줄기를 여러 갈래로 흩뿌려 넓은 범위를 태웁니다.' },
        'solemn_bastion': { name: '엄숙한 요새', tags: ['buff', 'defense'], cost: 21, type: 'buff', effect: { defMul: 2.05, nextCrit: 0.05 }, scaling: { buff: { defMulBase: 0.02, defMulDef: 0.001, defMulFaith: 0.003 } }, desc: '순간적으로 방벽을 증축하고 다음 일격의 치명 가능성을 살짝 높입니다.' },
        'mercy_breath': { name: '자비의 숨', tags: ['buff', 'heal', 'defense'], cost: 14, type: 'buff', effect: { defMul: 1.22 }, scaling: { heal: { base: 20, atk: 0.06, def: 1.4, faith: 7 } }, desc: '온화한 기운으로 상처를 어루만지고 잠시 방어력을 높입니다.' },
        'ember_sigil': { name: '잔화 인장', tags: ['attack', 'fire', 'debuff'], cost: 20, type: 'attack', effect: { atkMul: 1.78, spdDebuff: 0.9 }, scaling: { damage: { base: 11, atk: 0.29, def: 0.05, faith: 2.4 } }, desc: '타오르는 인장을 새겨 적의 발을 느리게 합니다.' },
        'eden_lance': { name: '에덴의 창', tags: ['attack', 'holy'], cost: 23, type: 'attack', effect: { atkMul: 1.88 }, scaling: { damage: { base: 18, atk: 0.32, def: 0.07, faith: 2.9 } }, desc: '낙원을 향해 찌르는 성스러운 일격입니다.' },
        'dawn_shelter': { name: '새벽 피난처', tags: ['buff', 'heal', 'defense'], cost: 16, type: 'buff', effect: { defMul: 1.35, nextCrit: 0.08 }, scaling: { heal: { base: 18, atk: 0.08, def: 1.5, faith: 8 } }, desc: '새벽빛으로 방어를 두르고 상처를 어루만집니다.' },
        'reckoning_bolt': { name: '심판의 전류', tags: ['attack', 'holy', 'debuff'], cost: 26, type: 'attack', effect: { atkMul: 2.05, spdDebuff: 0.92 }, scaling: { damage: { base: 22, atk: 0.36, def: 0.06, faith: 3.2 } }, desc: '하늘에서 떨어진 심판이 적의 균형을 무너뜨립니다.' },
        'stick':      { name: '끈적이기', tags: ['monster', 'attack', 'debuff'], type: 'attack', effect: { atkMul: 1.0, spdDebuff: 0.8 } },
        'bite':       { name: '물어뜯기', tags: ['monster', 'attack'], type: 'attack', effect: { atkMul: 1.2 } },
        'wail':       { name: '통곡', tags: ['monster', 'attack', 'fear'], type: 'attack', effect: { atkMul: 0.8, fear: true } },
        'small_fire': { name: '작은 불꽃', tags: ['monster', 'attack', 'fire'], type: 'attack', effect: { atkMul: 1.3 } },
        'fear':       { name: '공포', tags: ['monster', 'attack', 'fear'], type: 'attack', effect: { atkMul: 1.1, fear: true } },
        'telekinesis':{ name: '염동력', tags: ['monster', 'attack'], type: 'attack', effect: { atkMul: 1.4 } },
        'root_bind':  { name: '속박의 뿌리', tags: ['monster', 'attack', 'debuff', 'fear'], type: 'attack', effect: { atkMul: 0.9, spdDebuff: 0.75, fear: true } },

        // 보스 전용 (플레이어·스킬트리 해금 불가, monsterSkillTrees에서만 참조)
        'boss_wraith_haunt': {
            name: '영혼 잠식', tags: ['boss', 'attack', 'fear'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.18, fear: true },
            desc: '원혼이 그림자처럼 당신의 기력을 긁어냅니다.'
        },
        'boss_wraith_soul_split': {
            name: '분열하는 절규', tags: ['boss', 'attack', 'fear'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.32, fear: true },
            desc: '비명이 여러 갈래로 흩어지며 정신을 갉아먹습니다.'
        },
        'boss_mud_grasp': {
            name: '진흙 손아귀', tags: ['boss', 'attack', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.22, spdDebuff: 0.88 },
            desc: '늪이 발목을 잡아당깁니다.'
        },
        'boss_mud_quake': {
            name: '대지의 격동', tags: ['boss', 'attack', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.55, spdDebuff: 0.72 },
            desc: '거인이 몸을 부딪쳐 땅이 꺼집니다.'
        },
        'boss_seraph_gaze': {
            name: '석화의 시선', tags: ['boss', 'attack', 'fear', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.28, fear: true, spdDebuff: 0.9 },
            desc: '빛이 시야를 얼려 움직임을 봉쇄합니다.'
        },
        'boss_seraph_petrify': {
            name: '완전 석화', tags: ['boss', 'attack', 'fear', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.42, fear: true, spdDebuff: 0.82 },
            desc: '발끝부터 돌이 되어가는 감각이 옵니다.'
        },
        'boss_hydra_maelstrom': {
            name: '심연 소용돌이', tags: ['boss', 'attack', 'fear', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.48, fear: true, spdDebuff: 0.8 },
            desc: '히드라의 포효가 전장을 소용돌이로 뒤엎습니다.'
        },
        'boss_guardian_verdict': {
            name: '왕좌의 판결', tags: ['boss', 'attack', 'fear', 'debuff'], type: 'attack', bossOnly: true,
            effect: { atkMul: 1.62, fear: true, spdDebuff: 0.78 },
            desc: '수호자의 판결이 무거운 충격으로 내려앉습니다.'
        },

        // 보스 패시브(전투 시작 시 스탯 배율 적용, 턴 소모 없음)
        'boss_p_malice': { name: '악의의 잔향', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.06 } }, desc: '공격 스탯이 소폭 상승합니다.' },
        'boss_p_grudge_shell': { name: '원한의 껍질', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { defMul: 1.06 } }, desc: '방어 스탯이 소폭 상승합니다.' },
        'boss_p_restless': { name: '불안한 기류', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { spdMul: 1.06 } }, desc: '속도가 소폭 상승합니다.' },
        'boss_p_stone_blood': { name: '석화 혈맥', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.05, defMul: 1.08 } }, desc: '공격과 방어가 함께 굳어집니다.' },
        'boss_p_deep_root': { name: '깊은 뿌리', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { defMul: 1.07 } }, desc: '방어에 집중합니다.' },
        'boss_p_abyss_tide': { name: '심연의 밀물', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.08 } }, desc: '공격이 거세집니다.' },
        'boss_p_swarm_mind': { name: '군체의 의지', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.07 } }, desc: '집단의 압박이 느껴집니다.' },
        'boss_p_throne_sigil': { name: '왕좌의 인장', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { defMul: 1.1 } }, desc: '왕권의 방어가 깔립니다.' },
        'boss_p_crown_pressure': { name: '면류관의 중압', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.09 } }, desc: '압도적인 위세가 공격을 보탭니다.' },
        'boss_p_border_lock': { name: '변방의 봉쇄', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { defMul: 1.09, spdMul: 1.05 } }, desc: '경계가 몸을 단단히 감쌉니다.' },
        'boss_p_void_heart': { name: '공허 심장', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { atkMul: 1.1, defMul: 1.1 } }, desc: '핵이 공허와 하나가 됩니다.' },
        'boss_p_null_skin': { name: '무(無)의 피부', tags: ['boss', 'passive'], type: 'passive', bossOnly: true, effect: { monsterPassive: { defMul: 1.12 } }, desc: '색이 벗겨진 외피가 충격을 흡수합니다.' },

        // 보스 액티브 자기강화(피해 없음, 몬스터 임시 배율)
        'boss_a_iron_hide': { name: '응축 껍질', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { defMul: 1.15, turns: 3 } }, desc: '몸을 단단히 웅크립니다.' },
        'boss_a_war_drum': { name: '전장의 북소리', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { atkMul: 1.12, turns: 3 } }, desc: '격동이 공격에 실립니다.' },
        'boss_a_void_surge': { name: '공허 가속', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { spdMul: 1.15, turns: 3 } }, desc: '잔해의 흐름이 속도를 끌어올립니다.' },
        'boss_a_rampart': { name: '성채 각성', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { defMul: 1.22, turns: 2 } }, desc: '잠시 방벽이 두꺼워집니다.' },
        'boss_a_overdrive': { name: '과부하 각성', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { atkMul: 1.18, turns: 3 } }, desc: '공격이 폭발적으로 증가합니다.' },
        'boss_a_fortress': { name: '요새 입장', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { defMul: 1.12, turns: 4 } }, desc: '오래도록 방어 태세를 유지합니다.' },
        'boss_a_bloodlust': { name: '광전의 혈', tags: ['boss', 'buff', 'self'], type: 'buff', bossOnly: true, effect: { monsterBuff: { atkMul: 1.15, turns: 2 } }, desc: '짧은 시간 극단의 공격력을 얻습니다.' }
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
        /** 필드 몬스터(eden_judicator 등)용. 지역 보스는 bossActiveSkillIds 단일 소스 */
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
                { id: 'faith_path', name: '신앙의 길', nodeIds: ['pilgrim_faith_1', 'pilgrim_faith_2', 'pilgrim_faith_3', 'pilgrim_faith_core', 'pilgrim_faith_4', 'pilgrim_faith_5', 'pilgrim_faith_6', 'pilgrim_active_holy_wall', 'pilgrim_faith_final'] },
                { id: 'valor_path', name: '전투의 길', nodeIds: ['pilgrim_atk_1', 'pilgrim_atk_2', 'pilgrim_atk_bridge', 'pilgrim_atk_3', 'pilgrim_valor_core', 'pilgrim_atk_4', 'pilgrim_atk_5', 'pilgrim_atk_6', 'pilgrim_active_smite', 'pilgrim_valor_final'] },
                { id: 'guard_path', name: '수호의 길', nodeIds: ['pilgrim_def_1', 'pilgrim_def_2', 'pilgrim_def_bridge', 'pilgrim_def_3', 'pilgrim_guard_core', 'pilgrim_endurance', 'pilgrim_guard_hp_1', 'pilgrim_guard_hp_2', 'pilgrim_active_aegis_prayer', 'pilgrim_guard_final'] },
                { id: 'agile_path', name: '기동의 길', nodeIds: ['pilgrim_spd_1', 'pilgrim_grace', 'pilgrim_spd_bridge', 'pilgrim_pp_1', 'pilgrim_agile_core', 'pilgrim_spd_2', 'pilgrim_pp_2', 'pilgrim_swift_2', 'pilgrim_active_light_dash', 'pilgrim_agile_final'] },
                { id: 'keystone_path', name: '서약의 길', nodeIds: ['pilgrim_zeal', 'pilgrim_zeal_2', 'pilgrim_resolve', 'pilgrim_resolve_2', 'pilgrim_vow_mid', 'pilgrim_vow_final'] },
                { id: 'contemplation_path', name: '수양의 길', nodeIds: ['pilgrim_cont_1', 'pilgrim_cont_2', 'pilgrim_cont_notable', 'pilgrim_cont_sanctum'] },
                { id: 'oracle_branch', name: '예언의 가지', nodeIds: ['pilgrim_oracle_1', 'pilgrim_oracle_2', 'pilgrim_oracle_notable'] },
                { id: 'skirmish_branch', name: '전장의 측면', nodeIds: ['pilgrim_skirm_1', 'pilgrim_skirm_line'] },
                { id: 'aegis_branch', name: '방패선', nodeIds: ['pilgrim_aegis_1', 'pilgrim_aegis_2'] },
                { id: 'swift_branch', name: '질주선', nodeIds: ['pilgrim_swift_1', 'pilgrim_swift_notable'] },
                { id: 'ascendant_branch', name: '천상 상승', nodeIds: ['pilgrim_sky_1', 'pilgrim_sky_crown'] },
                { id: 'abyss_branch', name: '심연 저항', nodeIds: ['pilgrim_abyss_1', 'pilgrim_cleanse_1', 'pilgrim_cleanse_2', 'pilgrim_active_purify', 'pilgrim_abyss_anchor'] },
                { id: 'convergence_path', name: '합일의 길', nodeIds: ['pilgrim_convergence_minor', 'pilgrim_convergence_major'] },
                { id: 'martyr_path', name: '순교의 길', nodeIds: ['pilgrim_martyr_1', 'pilgrim_martyr_2', 'pilgrim_martyr_3', 'pilgrim_martyr_4', 'pilgrim_active_martyr_brand', 'pilgrim_martyr_keystone'] },
                { id: 'boss_hunt_path', name: '보스 사냥의 길', nodeIds: ['pilgrim_hunt_1', 'pilgrim_hunt_2', 'pilgrim_hunt_3', 'pilgrim_hunt_core'] },
                { id: 'sanctuary_path', name: '성역 수호의 길', nodeIds: ['pilgrim_sanct_1', 'pilgrim_sanct_2', 'pilgrim_sanct_3', 'pilgrim_sanct_keystone'] },
                { id: 'revelation_path', name: '계시의 길', nodeIds: ['pilgrim_rev_1', 'pilgrim_rev_2', 'pilgrim_rev_3', 'pilgrim_rev_keystone'] },
                { id: 'bulwark_path', name: '성채의 길', nodeIds: ['pilgrim_bulwark_1', 'pilgrim_bulwark_2', 'pilgrim_bulwark_3', 'pilgrim_bulwark_keystone'] },
                { id: 'flux_path', name: '영력의 길', nodeIds: ['pilgrim_flux_1', 'pilgrim_flux_2', 'pilgrim_flux_3', 'pilgrim_flux_keystone'] },
                { id: 'stellar_path', name: '천궁의 길', nodeIds: ['pilgrim_stellar_1', 'pilgrim_stellar_2', 'pilgrim_stellar_crown'] },
                { id: 'radiant_volley_branch', name: '광휘 난사', nodeIds: ['pilgrim_radiant_1', 'pilgrim_radiant_2', 'pilgrim_active_radiant_volley'] },
                { id: 'solemn_bastion_branch', name: '엄숙한 요새', nodeIds: ['pilgrim_bastion_1', 'pilgrim_active_solemn_bastion'] },
                { id: 'mercy_breath_branch', name: '자비의 숨', nodeIds: ['pilgrim_mercy_1', 'pilgrim_active_mercy_breath'] },
                { id: 'ember_sigil_branch', name: '잔화 인장', nodeIds: ['pilgrim_ember_1', 'pilgrim_active_ember_sigil'] },
                { id: 'devotion_twig', name: '헌신의 가지', nodeIds: ['pilgrim_devotion_1', 'pilgrim_devotion_2'] },
                { id: 'steadfast_twig', name: '불굴의 가지', nodeIds: ['pilgrim_steadfast_1'] },
                { id: 'quickness_twig', name: '기민의 가지', nodeIds: ['pilgrim_quickness_1'] },
                { id: 'chorus_extension', name: '합창의 여운', nodeIds: ['pilgrim_chorus_1', 'pilgrim_chorus_2', 'pilgrim_chorus_keystone'] },
                { id: 'vitality_path', name: '생명의 길', nodeIds: ['pilgrim_vita_1', 'pilgrim_vita_2', 'pilgrim_vita_keystone'] },
                { id: 'penitent_path', name: '참회의 길', nodeIds: ['pilgrim_pen_1', 'pilgrim_pen_2', 'pilgrim_pen_keystone'] },
                { id: 'iron_will_twig', name: '철의 의지', nodeIds: ['pilgrim_iron_mind'] },
                { id: 'dawn_cleanse_twig', name: '새벽 정화', nodeIds: ['pilgrim_clear_dawn'] },
                { id: 'eden_lance_branch', name: '에덴 창', nodeIds: ['pilgrim_eden_minor', 'pilgrim_active_eden_lance'] },
                { id: 'dawn_shelter_branch', name: '새벽 피난처', nodeIds: ['pilgrim_dawn_minor', 'pilgrim_active_dawn_shelter'] },
                { id: 'reckoning_branch', name: '심판 전류', nodeIds: ['pilgrim_reck_minor', 'pilgrim_active_reckoning'] },
                { id: 'mirror_path', name: '거울의 길', nodeIds: ['pilgrim_mirror_1', 'pilgrim_mirror_2', 'pilgrim_mirror_keystone'] },
                { id: 'tithe_branch', name: '십일조의 가지', nodeIds: ['pilgrim_tithe_1', 'pilgrim_tithe_2'] }
            ],
            nodes: [
                { id: 'pilgrim_origin', name: '순례의 서약', kind: 'start', desc: '빛을 향한 여정의 시작점입니다.', grants: { stats: { faith: 1 } }, position: { x: 0, y: 0 } },

                { id: 'pilgrim_faith_1', name: '기도의 숨결', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -1.55, y: -0.72 } },
                { id: 'pilgrim_faith_2', name: '축복의 공명', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -2.85, y: -1.58 } },
                { id: 'pilgrim_faith_3', name: '응답의 속삭임', kind: 'notable', desc: '신앙 +2, PP +8', grants: { stats: { faith: 2, pp: 8 } }, position: { x: -4.35, y: -2.48 } },
                { id: 'pilgrim_faith_core', name: '은총의 중핵', kind: 'keystone', desc: '신앙 기반 피해 10% 증가', grants: { specials: { damageMul: 1.1 } }, position: { x: -5.9, y: -3.4 } },
                { id: 'pilgrim_faith_4', name: '성가의 파문', kind: 'small', desc: '신앙 +1, 속도 +2', grants: { stats: { faith: 1, spd: 2 } }, position: { x: -7.2, y: -4.4 } },
                { id: 'pilgrim_faith_5', name: '기도의 연쇄', kind: 'small', desc: '신앙 +1, PP +6', grants: { stats: { faith: 1, pp: 6 } }, position: { x: -8.6, y: -5.3 } },
                { id: 'pilgrim_faith_6', name: '신성 결속', kind: 'notable', desc: '신앙 +2, 받는 피해 4% 감소', grants: { stats: { faith: 2 }, specials: { damageTakenMul: 0.96 } }, position: { x: -9.8, y: -6.2 } },
                { id: 'pilgrim_active_holy_wall', name: '거룩한 방벽 해금', kind: 'active_unlock', desc: '액티브 스킬 [거룩한 방벽]을 배웁니다.', grants: { activeSkillId: 'holy_wall' }, position: { x: -11.2, y: -7.2 } },
                { id: 'pilgrim_faith_final', name: '성역의 서약', kind: 'keystone', desc: '받는 피해 10% 감소', grants: { specials: { damageTakenMul: 0.9 } }, position: { x: -12.7, y: -8.3 } },

                { id: 'pilgrim_atk_1', name: '신념의 일격', kind: 'small', desc: '공격 +2', grants: { stats: { atk: 2 } }, position: { x: 1.55, y: -0.72 } },
                { id: 'pilgrim_atk_2', name: '맹세의 검', kind: 'small', desc: '공격 +2, 속도 +1', grants: { stats: { atk: 2, spd: 1 } }, position: { x: 2.85, y: -1.58 } },
                { id: 'pilgrim_atk_bridge', name: '연속 가르기', kind: 'small', desc: '공격 +1', grants: { stats: { atk: 1 } }, position: { x: 3.5, y: -2.05 } },
                { id: 'pilgrim_atk_3', name: '철의 전진', kind: 'notable', desc: '공격 +3, HP +10', grants: { stats: { atk: 3, hp: 10 } }, position: { x: 4.35, y: -2.52 } },
                { id: 'pilgrim_valor_core', name: '심판의 중핵', kind: 'keystone', desc: '피해량 10% 증가', grants: { specials: { damageMul: 1.1 } }, position: { x: 5.9, y: -3.4 } },
                { id: 'pilgrim_atk_4', name: '단죄의 발걸음', kind: 'small', desc: '공격 +3', grants: { stats: { atk: 3 } }, position: { x: 7.2, y: -4.4 } },
                { id: 'pilgrim_atk_5', name: '성전의 박차', kind: 'small', desc: '공격 +2, 속도 +1', grants: { stats: { atk: 2, spd: 1 } }, position: { x: 8.6, y: -5.3 } },
                { id: 'pilgrim_atk_6', name: '심판 예열', kind: 'notable', desc: '공격 +2, 치명타 +4%', grants: { stats: { atk: 2 }, specials: { critChance: 0.04 } }, position: { x: 9.8, y: -6.2 } },
                { id: 'pilgrim_active_smite', name: '심판의 강타 해금', kind: 'active_unlock', desc: '액티브 스킬 [심판의 강타]를 배웁니다.', grants: { activeSkillId: 'smite' }, position: { x: 11.2, y: -7.2 } },
                { id: 'pilgrim_valor_final', name: '순결한 심판', kind: 'keystone', desc: '치명타 확률 +8%', grants: { specials: { critChance: 0.08 } }, position: { x: 12.7, y: -8.3 } },

                { id: 'pilgrim_def_1', name: '견고한 걸음', kind: 'small', desc: '방어 +1, HP +10', grants: { stats: { def: 1, hp: 10 } }, position: { x: 1.25, y: 1.35 } },
                { id: 'pilgrim_def_2', name: '강인한 의지', kind: 'small', desc: '방어 +2', grants: { stats: { def: 2 } }, position: { x: 2.45, y: 2.65 } },
                { id: 'pilgrim_def_bridge', name: '판금 보강', kind: 'small', desc: '방어 +1, HP +6', grants: { stats: { def: 1, hp: 6 } }, position: { x: 3.1, y: 3.28 } },
                { id: 'pilgrim_def_3', name: '갑주의 기도', kind: 'small', desc: '방어 +2, HP +8', grants: { stats: { def: 2, hp: 8 } }, position: { x: 3.85, y: 3.95 } },
                { id: 'pilgrim_guard_core', name: '수호의 중핵', kind: 'keystone', desc: '받는 피해 8% 감소', grants: { specials: { damageTakenMul: 0.92 } }, position: { x: 5.2, y: 5.2 } },
                { id: 'pilgrim_endurance', name: '수호자 본능', kind: 'notable', desc: 'HP +25, 방어 +2', grants: { stats: { hp: 25, def: 2 } }, position: { x: 6.5, y: 6.5 } },
                { id: 'pilgrim_guard_hp_1', name: '침착한 호흡', kind: 'small', desc: 'HP +20', grants: { stats: { hp: 20 } }, position: { x: 7.8, y: 7.8 } },
                { id: 'pilgrim_guard_hp_2', name: '철의 기도문', kind: 'small', desc: 'HP +20, 방어 +1', grants: { stats: { hp: 20, def: 1 } }, position: { x: 9.1, y: 9.2 } },
                { id: 'pilgrim_active_aegis_prayer', name: '수호의 기도 해금', kind: 'active_unlock', desc: '액티브 스킬 [수호의 기도]를 배웁니다.', grants: { activeSkillId: 'aegis_prayer' }, position: { x: 10.6, y: 10.5 } },
                { id: 'pilgrim_guard_final', name: '철벽의 맹세', kind: 'keystone', desc: '받는 피해 12% 감소', grants: { specials: { damageTakenMul: 0.88 } }, position: { x: 12.2, y: 12.1 } },

                { id: 'pilgrim_spd_1', name: '빠른 발', kind: 'small', desc: '속도 +4', grants: { stats: { spd: 4 } }, position: { x: -1.25, y: 1.35 } },
                { id: 'pilgrim_grace', name: '은총의 회피', kind: 'small', desc: '속도 +4, 회피 +3%', grants: { stats: { spd: 4 }, specials: { evadeChance: 0.03 } }, position: { x: -2.45, y: 2.65 } },
                { id: 'pilgrim_spd_bridge', name: '발끝 집중', kind: 'small', desc: '속도 +3', grants: { stats: { spd: 3 } }, position: { x: -3.1, y: 3.28 } },
                { id: 'pilgrim_pp_1', name: '영적 축적', kind: 'small', desc: 'PP +10', grants: { stats: { pp: 10 } }, position: { x: -3.85, y: 3.95 } },
                { id: 'pilgrim_agile_core', name: '기민의 중핵', kind: 'keystone', desc: '회피 +5%', grants: { specials: { evadeChance: 0.05 } }, position: { x: -5.2, y: 5.2 } },
                { id: 'pilgrim_spd_2', name: '빛의 보폭', kind: 'small', desc: '속도 +5', grants: { stats: { spd: 5 } }, position: { x: -6.5, y: 6.5 } },
                { id: 'pilgrim_pp_2', name: '고요한 축적', kind: 'notable', desc: 'PP +12, 신앙 +1', grants: { stats: { pp: 12, faith: 1 } }, position: { x: -7.8, y: 7.8 } },
                { id: 'pilgrim_swift_2', name: '순풍 포착', kind: 'small', desc: '속도 +4, PP +6', grants: { stats: { spd: 4, pp: 6 } }, position: { x: -9.1, y: 9.2 } },
                { id: 'pilgrim_active_light_dash', name: '광휘 질주 해금', kind: 'active_unlock', desc: '액티브 스킬 [광휘 질주]를 배웁니다.', grants: { activeSkillId: 'light_dash' }, position: { x: -10.6, y: 10.5 } },
                { id: 'pilgrim_agile_final', name: '바람의 서약', kind: 'keystone', desc: '속도 +6, 회피 +7%', grants: { stats: { spd: 6 }, specials: { evadeChance: 0.07 } }, position: { x: -12.2, y: 12.1 } },

                { id: 'pilgrim_zeal', name: '열망의 심장', kind: 'notable', desc: '공격 피해 8% 증가', grants: { specials: { damageMul: 1.08 } }, position: { x: 0.08, y: -2.45 } },
                { id: 'pilgrim_zeal_2', name: '타오르는 선서', kind: 'small', desc: '공격 +2, 피해 5% 증가', grants: { stats: { atk: 2 }, specials: { damageMul: 1.05 } }, position: { x: 0.08, y: -4.28 } },
                { id: 'pilgrim_resolve', name: '불굴의 심장', kind: 'notable', desc: '치명타 확률 +5%', grants: { specials: { critChance: 0.05 } }, position: { x: -0.08, y: 2.52 } },
                { id: 'pilgrim_resolve_2', name: '굳건한 맹세', kind: 'small', desc: '방어 +2, 치명타 +3%', grants: { stats: { def: 2 }, specials: { critChance: 0.03 } }, position: { x: -0.08, y: 4.35 } },
                { id: 'pilgrim_vow_mid', name: '중심 서약', kind: 'keystone', desc: 'HP 50% 이하일 때 피해 12% 증가', grants: { specials: { lowHpDamageMul: 1.12 } }, position: { x: 0, y: 6.4 } },
                { id: 'pilgrim_vow_final', name: '순교자의 대서약', kind: 'keystone', desc: 'HP 50% 이하일 때 피해 20% 증가, 치명타 +5%', grants: { specials: { lowHpDamageMul: 1.2, critChance: 0.05 } }, position: { x: 0, y: 8.8 } },

                { id: 'pilgrim_cont_1', name: '침묵의 첫걸음', kind: 'small', desc: '신앙 +1, HP +8', grants: { stats: { faith: 1, hp: 8 } }, position: { x: -1.42, y: 0.95 } },
                { id: 'pilgrim_cont_2', name: '내면의 성소', kind: 'small', desc: '방어 +1, PP +6', grants: { stats: { def: 1, pp: 6 } }, position: { x: -2.72, y: 1.98 } },
                { id: 'pilgrim_cont_notable', name: '길잃은 자의 위로', kind: 'notable', desc: 'HP +22, 신앙 +1', grants: { stats: { hp: 22, faith: 1 } }, position: { x: -4.05, y: 3.02 } },
                { id: 'pilgrim_cont_sanctum', name: '고요의 성역', kind: 'keystone', desc: '받는 피해 6% 감소', grants: { specials: { damageTakenMul: 0.94 } }, position: { x: -5.35, y: 4.05 } },

                { id: 'pilgrim_oracle_1', name: '작은 징조', kind: 'small', desc: '신앙 +1, PP +5', grants: { stats: { faith: 1, pp: 5 } }, position: { x: -3.78, y: -0.32 } },
                { id: 'pilgrim_oracle_2', name: '흐릿한 계시', kind: 'small', desc: '신앙 +1, 속도 +2', grants: { stats: { faith: 1, spd: 2 } }, position: { x: -5.25, y: 0.52 } },
                { id: 'pilgrim_oracle_notable', name: '파편 예언', kind: 'notable', desc: '치명타 확률 +4%', grants: { specials: { critChance: 0.04 } }, position: { x: -6.55, y: 1.42 } },

                { id: 'pilgrim_skirm_1', name: '교전 숙달', kind: 'small', desc: '공격 +2', grants: { stats: { atk: 2 } }, position: { x: 3.48, y: -0.28 } },
                { id: 'pilgrim_skirm_line', name: '돌파선', kind: 'notable', desc: '공격 +2, 속도 +3', grants: { stats: { atk: 2, spd: 3 } }, position: { x: 4.82, y: 0.92 } },

                { id: 'pilgrim_aegis_1', name: '방패 들기', kind: 'small', desc: 'HP +14', grants: { stats: { hp: 14 } }, position: { x: 2.18, y: 1.92 } },
                { id: 'pilgrim_aegis_2', name: '얇은 성역', kind: 'small', desc: '방어 +3, HP +8', grants: { stats: { def: 3, hp: 8 } }, position: { x: 3.52, y: 3.08 } },

                { id: 'pilgrim_swift_1', name: '보조 가속', kind: 'small', desc: '속도 +4', grants: { stats: { spd: 4 } }, position: { x: -2.18, y: 1.92 } },
                { id: 'pilgrim_swift_notable', name: '숨 고르기', kind: 'notable', desc: 'PP +10, 회피 +2%', grants: { stats: { pp: 10 }, specials: { evadeChance: 0.02 } }, position: { x: -3.52, y: 3.08 } },

                { id: 'pilgrim_sky_1', name: '상승 기도', kind: 'small', desc: '피해량 4% 증가', grants: { specials: { damageMul: 1.04 } }, position: { x: 0.8, y: -5.4 } },
                { id: 'pilgrim_sky_crown', name: '빛의 면류관', kind: 'keystone', desc: '피해량 8% 증가, 공격 +2', grants: { stats: { atk: 2 }, specials: { damageMul: 1.08 } }, position: { x: 1.5, y: -6.9 } },

                { id: 'pilgrim_abyss_1', name: '낭떠러지 걸음', kind: 'small', desc: 'HP +18, 방어 +1', grants: { stats: { hp: 18, def: 1 } }, position: { x: 0.58, y: 5.05 } },
                { id: 'pilgrim_cleanse_1', name: '맑은 이성', kind: 'small', desc: '상태이상 저항 +8%', grants: { specials: { ailmentResist: 0.08 } }, position: { x: 0.88, y: 5.55 } },
                { id: 'pilgrim_cleanse_2', name: '새벽의 각성', kind: 'notable', desc: '턴 시작 시 10% 확률로 상태이상 해제', grants: { specials: { turnStartCleanseChance: 0.1 } }, position: { x: 1.18, y: 6.05 } },
                { id: 'pilgrim_active_purify', name: '정화의 숨 해금', kind: 'active_unlock', desc: '액티브 스킬 [정화의 숨]을 배웁니다.', grants: { activeSkillId: 'purify' }, position: { x: 1.48, y: 6.55 } },
                { id: 'pilgrim_abyss_anchor', name: '심연의 닻', kind: 'notable', desc: 'HP 50% 이하일 때 피해 6% 증가, HP +12', grants: { stats: { hp: 12 }, specials: { lowHpDamageMul: 1.06 } }, position: { x: 1.78, y: 7.05 } },

                { id: 'pilgrim_convergence_minor', name: '조화의 심장', kind: 'notable', desc: '공격 +2, 방어 +2, HP +20', grants: { stats: { atk: 2, def: 2, hp: 20 } }, requiresAll: ['pilgrim_faith_core', 'pilgrim_valor_core'], position: { x: 0.58, y: -1.22 } },
                { id: 'pilgrim_convergence_major', name: '성광의 합일', kind: 'keystone', desc: '공격 +3, 방어 +3, HP +30, PP +10', grants: { stats: { atk: 3, def: 3, hp: 30, pp: 10 } }, requiresAll: ['pilgrim_guard_core', 'pilgrim_agile_core', 'pilgrim_convergence_minor'], position: { x: 0.38, y: 2.22 } },

                { id: 'pilgrim_martyr_1', name: '피의 서원', kind: 'small', desc: '공격 +2, 받는 피해 4% 증가', grants: { stats: { atk: 2 }, specials: { damageTakenMul: 1.04 } }, position: { x: 2.6, y: 8.7 } },
                { id: 'pilgrim_martyr_2', name: '극한의 각성', kind: 'small', desc: '피해량 8% 증가, 받는 피해 6% 증가', grants: { specials: { damageMul: 1.08, damageTakenMul: 1.06 } }, position: { x: 3.8, y: 10.0 } },
                { id: 'pilgrim_martyr_3', name: '순교의 광휘', kind: 'notable', desc: '치명타 +5%, 받는 피해 8% 증가', grants: { specials: { critChance: 0.05, damageTakenMul: 1.08 } }, position: { x: 5.1, y: 11.3 } },
                { id: 'pilgrim_martyr_4', name: '붉은 단심', kind: 'small', desc: '공격 +2, 피해량 6% 증가', grants: { stats: { atk: 2 }, specials: { damageMul: 1.06 } }, position: { x: 6.3, y: 12.6 } },
                { id: 'pilgrim_active_martyr_brand', name: '순교자의 낙인 해금', kind: 'active_unlock', desc: '액티브 스킬 [순교자의 낙인]을 배웁니다.', grants: { activeSkillId: 'martyr_brand' }, position: { x: 7.6, y: 13.8 } },
                { id: 'pilgrim_martyr_keystone', name: '잔혹한 신탁', kind: 'keystone', desc: '하이 리스크 하이 리턴: 피해량 22% 증가, 받는 피해 18% 증가', grants: { specials: { damageMul: 1.22, damageTakenMul: 1.18 } }, position: { x: 9.0, y: 15.1 } },

                { id: 'pilgrim_hunt_1', name: '사냥의 감각', kind: 'small', desc: '공격 +2, 치명타 +2%', grants: { stats: { atk: 2 }, specials: { critChance: 0.02 } }, position: { x: 8.3, y: -1.2 } },
                { id: 'pilgrim_hunt_2', name: '급소 분석', kind: 'small', desc: '피해량 6% 증가', grants: { specials: { damageMul: 1.06 } }, position: { x: 9.8, y: -2.4 } },
                { id: 'pilgrim_hunt_3', name: '처형 호흡', kind: 'notable', desc: '공격 +3, 치명타 +4%', grants: { stats: { atk: 3 }, specials: { critChance: 0.04 } }, position: { x: 11.3, y: -3.6 } },
                { id: 'pilgrim_hunt_core', name: '절대 추적자', kind: 'keystone', desc: '피해량 12% 증가, 치명타 +6%', grants: { specials: { damageMul: 1.12, critChance: 0.06 } }, position: { x: 12.9, y: -4.8 } },

                { id: 'pilgrim_sanct_1', name: '성역의 숨결', kind: 'small', desc: '방어 +2, HP +18', grants: { stats: { def: 2, hp: 18 } }, position: { x: -8.2, y: 0.9 } },
                { id: 'pilgrim_sanct_2', name: '평정의 진', kind: 'small', desc: '받는 피해 4% 감소', grants: { specials: { damageTakenMul: 0.96 } }, position: { x: -9.8, y: 2.0 } },
                { id: 'pilgrim_sanct_3', name: '복원의 기도', kind: 'notable', desc: '체력재생 +12, HP +20', grants: { stats: { hpRegen: 12, hp: 20 } }, position: { x: -11.2, y: 3.2 } },
                { id: 'pilgrim_sanct_keystone', name: '영원의 성벽', kind: 'keystone', desc: '받는 피해 10% 감소, 체력재생 +18', grants: { specials: { damageTakenMul: 0.9 }, stats: { hpRegen: 18 } }, position: { x: -12.8, y: 4.5 } },

                { id: 'pilgrim_rev_1', name: '계시의 불꽃', kind: 'small', desc: '신앙 +2, PP +8', grants: { stats: { faith: 2, pp: 8 } }, position: { x: -6.8, y: -8.9 } },
                { id: 'pilgrim_rev_2', name: '성광의 파편', kind: 'small', desc: '피해량 6% 증가, 치명타 +2%', grants: { specials: { damageMul: 1.06, critChance: 0.02 } }, position: { x: -8.4, y: -9.9 } },
                { id: 'pilgrim_rev_3', name: '예언의 합창', kind: 'notable', desc: '신앙 +3, 치명타 +4%', grants: { stats: { faith: 3 }, specials: { critChance: 0.04 } }, position: { x: -9.9, y: -11.0 } },
                { id: 'pilgrim_rev_keystone', name: '종말의 계시', kind: 'keystone', desc: '피해량 12% 증가, 신앙 +4', grants: { stats: { faith: 4 }, specials: { damageMul: 1.12 } }, position: { x: -11.4, y: -12.1 } },

                { id: 'pilgrim_bulwark_1', name: '방진 대형', kind: 'small', desc: '방어 +3, HP +25', grants: { stats: { def: 3, hp: 25 } }, position: { x: 7.2, y: 8.4 } },
                { id: 'pilgrim_bulwark_2', name: '역류 차단', kind: 'small', desc: '받는 피해 5% 감소', grants: { specials: { damageTakenMul: 0.95 } }, position: { x: 8.8, y: 9.7 } },
                { id: 'pilgrim_bulwark_3', name: '신성 완충', kind: 'notable', desc: 'HP +35, 방어 +3', grants: { stats: { hp: 35, def: 3 } }, position: { x: 10.3, y: 11.0 } },
                { id: 'pilgrim_bulwark_keystone', name: '불멸의 방패', kind: 'keystone', desc: '받는 피해 12% 감소, HP +40', grants: { specials: { damageTakenMul: 0.88 }, stats: { hp: 40 } }, position: { x: 11.9, y: 12.3 } },

                { id: 'pilgrim_flux_1', name: '영력의 맥동', kind: 'small', desc: '적중 시 10% 확률로 PP +1', grants: { specials: { ppOnHitChance: 0.1, ppOnHitAmount: 1 } }, position: { x: -10.8, y: -13.4 } },
                { id: 'pilgrim_flux_2', name: '잔광의 호흡', kind: 'notable', desc: '적중 시 8% 확률로 PP +1 (중첩)', grants: { specials: { ppOnHitChance: 0.08, ppOnHitAmount: 1 } }, position: { x: -10.0, y: -14.6 } },
                { id: 'pilgrim_flux_3', name: '유성의 궤적', kind: 'notable', desc: '적중 시 PP회복 확률 +6%', grants: { specials: { ppOnHitChance: 0.06, ppOnHitAmount: 1 } }, position: { x: -9.2, y: -15.8 } },
                { id: 'pilgrim_flux_keystone', name: '쌍연의 각인', kind: 'keystone', desc: '평타·공격 스킬에 10% 확률로 추가 일격(피해 약 56%)', grants: { specials: { doubleStrikeChance: 0.1 } }, position: { x: -8.4, y: -17.0 } },
                { id: 'pilgrim_stellar_1', name: '성운의 발판', kind: 'small', desc: '신앙 +1, 속도 +3', grants: { stats: { faith: 1, spd: 3 } }, position: { x: -7.5, y: -18.4 } },
                { id: 'pilgrim_stellar_2', name: '천구의 호흡', kind: 'notable', desc: '피해량 7% 증가', grants: { specials: { damageMul: 1.07 } }, position: { x: -6.6, y: -19.8 } },
                { id: 'pilgrim_stellar_crown', name: '천궁의 왕관', kind: 'keystone', desc: '치명타 +5%, 치명 피해 +8%', grants: { specials: { critChance: 0.05, critDamageMul: 0.08 } }, position: { x: -5.7, y: -21.2 } },

                { id: 'pilgrim_radiant_1', name: '광휘 침전', kind: 'small', desc: '신앙 +1, PP +4', grants: { stats: { faith: 1, pp: 4 } }, position: { x: -13.35, y: -9.05 } },
                { id: 'pilgrim_radiant_2', name: '폭광 정렬', kind: 'notable', desc: '피해량 5% 증가', grants: { specials: { damageMul: 1.05 } }, position: { x: -14.05, y: -9.75 } },
                { id: 'pilgrim_active_radiant_volley', name: '광휘 난사 해금', kind: 'active_unlock', desc: '액티브 [광휘 난사]를 배웁니다.', grants: { activeSkillId: 'radiant_volley' }, position: { x: -14.75, y: -10.45 } },

                { id: 'pilgrim_bastion_1', name: '침묵의 방벽', kind: 'small', desc: '방어 +2, HP +14', grants: { stats: { def: 2, hp: 14 } }, position: { x: 12.95, y: 12.95 } },
                { id: 'pilgrim_active_solemn_bastion', name: '엄숙한 요새 해금', kind: 'active_unlock', desc: '액티브 [엄숙한 요새]를 배웁니다.', grants: { activeSkillId: 'solemn_bastion' }, position: { x: 13.65, y: 13.75 } },

                { id: 'pilgrim_mercy_1', name: '은총의 잔물결', kind: 'small', desc: 'PP +8, 방어 +1', grants: { stats: { pp: 8, def: 1 } }, position: { x: -6.15, y: 4.78 } },
                { id: 'pilgrim_active_mercy_breath', name: '자비의 숨 해금', kind: 'active_unlock', desc: '액티브 [자비의 숨]을 배웁니다.', grants: { activeSkillId: 'mercy_breath' }, position: { x: -6.88, y: 5.48 } },

                { id: 'pilgrim_ember_1', name: '불꽃 각인', kind: 'small', desc: '공격 +2, 속도 +2', grants: { stats: { atk: 2, spd: 2 } }, position: { x: 13.45, y: -9.05 } },
                { id: 'pilgrim_active_ember_sigil', name: '잔화 인장 해금', kind: 'active_unlock', desc: '액티브 [잔화 인장]을 배웁니다.', grants: { activeSkillId: 'ember_sigil' }, position: { x: 14.15, y: -9.75 } },

                { id: 'pilgrim_devotion_1', name: '헌신의 첫걸음', kind: 'small', desc: '신앙 +1', grants: { stats: { faith: 1 } }, position: { x: -2.28, y: -0.38 } },
                { id: 'pilgrim_devotion_2', name: '헌신의 결속', kind: 'notable', desc: 'HP +14, PP +6', grants: { stats: { hp: 14, pp: 6 } }, position: { x: -3.05, y: 0.05 } },

                { id: 'pilgrim_steadfast_1', name: '불굴의 버팀', kind: 'notable', desc: '방어 +3, HP +16', grants: { stats: { def: 3, hp: 16 } }, position: { x: 0.95, y: 2.15 } },

                { id: 'pilgrim_quickness_1', name: '가벼운 발놀림', kind: 'notable', desc: '속도 +5, 회피 +2%', grants: { stats: { spd: 5 }, specials: { evadeChance: 0.02 } }, position: { x: -1.95, y: 0.55 } },

                { id: 'pilgrim_chorus_1', name: '합창의 첫음', kind: 'small', desc: '신앙 +1, PP +8', grants: { stats: { faith: 1, pp: 8 } }, position: { x: -4.1, y: 0.35 } },
                { id: 'pilgrim_chorus_2', name: '합창의 화음', kind: 'notable', desc: 'PP +14, 치명타 +3%', grants: { stats: { pp: 14 }, specials: { critChance: 0.03 } }, position: { x: -4.85, y: 0.95 } },
                { id: 'pilgrim_chorus_keystone', name: '천상 합창', kind: 'keystone', desc: '피해량 8% 증가, 신앙 +1', grants: { stats: { faith: 1 }, specials: { damageMul: 1.08 } }, position: { x: -5.65, y: 1.55 } },

                { id: 'pilgrim_vita_1', name: '생명의 샘', kind: 'small', desc: 'HP +20, 턴당 HP 재생 +5', grants: { stats: { hp: 20 }, specials: { hpRegen: 5 } }, position: { x: 1.2, y: 2.95 } },
                { id: 'pilgrim_vita_2', name: '불사의 맥', kind: 'notable', desc: 'HP +28, 생명 흡수 +2.5%', grants: { stats: { hp: 28 }, specials: { lifeSteal: 0.025 } }, position: { x: 1.45, y: 3.75 } },
                { id: 'pilgrim_vita_keystone', name: '생명의 언약', kind: 'keystone', desc: '턴당 HP 재생 +18, 받는 피해 5% 감소', grants: { specials: { hpRegen: 18, damageTakenMul: 0.95 } }, position: { x: 1.7, y: 4.55 } },

                { id: 'pilgrim_pen_1', name: '채찍의 각오', kind: 'small', desc: '공격 +2, 받는 피해 3% 증가', grants: { stats: { atk: 2 }, specials: { damageTakenMul: 1.03 } }, position: { x: -7.4, y: 2.1 } },
                { id: 'pilgrim_pen_2', name: '고행의 불꽃', kind: 'notable', desc: '피해량 8% 증가, 받는 피해 5% 증가', grants: { specials: { damageMul: 1.08, damageTakenMul: 1.05 } }, position: { x: -8.15, y: 2.75 } },
                { id: 'pilgrim_pen_keystone', name: '참회의 대가', kind: 'keystone', desc: '피해량 12% 증가, 생명 흡수 +4%, 받는 피해 8% 증가', grants: { specials: { damageMul: 1.12, lifeSteal: 0.04, damageTakenMul: 1.08 } }, position: { x: -8.85, y: 3.45 } },

                { id: 'pilgrim_iron_mind', name: '철의 의지', kind: 'notable', desc: '상태이상 저항 +8%', grants: { specials: { ailmentResist: 0.08 } }, position: { x: -2.65, y: 1.15 } },
                { id: 'pilgrim_clear_dawn', name: '새벽의 정화', kind: 'notable', desc: '턴 시작 시 8% 확률로 상태이상 해제', grants: { specials: { turnStartCleanseChance: 0.08 } }, position: { x: 0.35, y: 6.55 } },

                { id: 'pilgrim_eden_minor', name: '낙원의 기미', kind: 'small', desc: '공격 +2, 신앙 +1', grants: { stats: { atk: 2, faith: 1 } }, position: { x: 13.5, y: -7.5 } },
                { id: 'pilgrim_active_eden_lance', name: '에덴의 창 해금', kind: 'active_unlock', desc: '액티브 [에덴의 창]을 배웁니다.', grants: { activeSkillId: 'eden_lance' }, position: { x: 14.2, y: -6.85 } },

                { id: 'pilgrim_dawn_minor', name: '새벽의 방패', kind: 'small', desc: '방어 +2, HP +12', grants: { stats: { def: 2, hp: 12 } }, position: { x: 11.4, y: 12.85 } },
                { id: 'pilgrim_active_dawn_shelter', name: '새벽 피난처 해금', kind: 'active_unlock', desc: '액티브 [새벽 피난처]를 배웁니다.', grants: { activeSkillId: 'dawn_shelter' }, position: { x: 10.6, y: 13.55 } },

                { id: 'pilgrim_reck_minor', name: '심판의 예고', kind: 'notable', desc: '공격 +3, 치명타 +3%', grants: { stats: { atk: 3 }, specials: { critChance: 0.03 } }, position: { x: 13.8, y: -4.0 } },
                { id: 'pilgrim_active_reckoning', name: '심판의 전류 해금', kind: 'active_unlock', desc: '액티브 [심판의 전류]를 배웁니다.', grants: { activeSkillId: 'reckoning_bolt' }, position: { x: 14.6, y: -3.2 } },

                { id: 'pilgrim_mirror_1', name: '거울의 첫면', kind: 'small', desc: '받는 피해 2% 감소, 피해량 2% 증가', grants: { specials: { damageTakenMul: 0.98, damageMul: 1.02 } }, position: { x: -3.8, y: -3.2 } },
                { id: 'pilgrim_mirror_2', name: '거울의 둘째면', kind: 'notable', desc: '받는 피해 3% 감소, 피해량 3% 증가', grants: { specials: { damageTakenMul: 0.97, damageMul: 1.03 } }, position: { x: -3.15, y: -3.85 } },
                { id: 'pilgrim_mirror_keystone', name: '양면의 성소', kind: 'keystone', desc: '받는 피해 6% 감소, 피해량 6% 증가', grants: { specials: { damageTakenMul: 0.94, damageMul: 1.06 } }, position: { x: -2.45, y: -4.55 } },

                { id: 'pilgrim_tithe_1', name: '십일조의 약속', kind: 'small', desc: '신앙 +1, PP +10', grants: { stats: { faith: 1, pp: 10 } }, position: { x: -6.45, y: 2.15 } },
                { id: 'pilgrim_tithe_2', name: '십일조의 결실', kind: 'notable', desc: 'PP +15, 치명 피해 +5%p', grants: { stats: { pp: 15 }, specials: { critDamageMul: 0.05 } }, position: { x: -7.25, y: 2.85 } }
            ],
            edges: [
                ['pilgrim_origin', 'pilgrim_faith_1'],
                ['pilgrim_faith_1', 'pilgrim_faith_2'],
                ['pilgrim_faith_2', 'pilgrim_faith_3'],
                ['pilgrim_faith_3', 'pilgrim_faith_core'],
                ['pilgrim_faith_core', 'pilgrim_faith_4'],
                ['pilgrim_faith_4', 'pilgrim_faith_5'],
                ['pilgrim_faith_5', 'pilgrim_faith_6'],
                ['pilgrim_faith_6', 'pilgrim_active_holy_wall'],
                ['pilgrim_active_holy_wall', 'pilgrim_faith_final'],

                ['pilgrim_origin', 'pilgrim_atk_1'],
                ['pilgrim_atk_1', 'pilgrim_atk_2'],
                ['pilgrim_atk_2', 'pilgrim_atk_bridge'],
                ['pilgrim_atk_bridge', 'pilgrim_atk_3'],
                ['pilgrim_atk_3', 'pilgrim_valor_core'],
                ['pilgrim_valor_core', 'pilgrim_atk_4'],
                ['pilgrim_atk_4', 'pilgrim_atk_5'],
                ['pilgrim_atk_5', 'pilgrim_atk_6'],
                ['pilgrim_atk_6', 'pilgrim_active_smite'],
                ['pilgrim_active_smite', 'pilgrim_valor_final'],

                ['pilgrim_origin', 'pilgrim_def_1'],
                ['pilgrim_def_1', 'pilgrim_def_2'],
                ['pilgrim_def_2', 'pilgrim_def_bridge'],
                ['pilgrim_def_bridge', 'pilgrim_def_3'],
                ['pilgrim_def_3', 'pilgrim_guard_core'],
                ['pilgrim_guard_core', 'pilgrim_endurance'],
                ['pilgrim_endurance', 'pilgrim_guard_hp_1'],
                ['pilgrim_guard_hp_1', 'pilgrim_guard_hp_2'],
                ['pilgrim_guard_hp_2', 'pilgrim_active_aegis_prayer'],
                ['pilgrim_active_aegis_prayer', 'pilgrim_guard_final'],

                ['pilgrim_origin', 'pilgrim_spd_1'],
                ['pilgrim_spd_1', 'pilgrim_grace'],
                ['pilgrim_grace', 'pilgrim_spd_bridge'],
                ['pilgrim_spd_bridge', 'pilgrim_pp_1'],
                ['pilgrim_pp_1', 'pilgrim_agile_core'],
                ['pilgrim_agile_core', 'pilgrim_spd_2'],
                ['pilgrim_spd_2', 'pilgrim_pp_2'],
                ['pilgrim_pp_2', 'pilgrim_swift_2'],
                ['pilgrim_swift_2', 'pilgrim_active_light_dash'],
                ['pilgrim_active_light_dash', 'pilgrim_agile_final'],

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
                ['pilgrim_faith_core', 'pilgrim_convergence_minor'],
                ['pilgrim_valor_core', 'pilgrim_convergence_minor'],
                ['pilgrim_convergence_minor', 'pilgrim_convergence_major'],
                ['pilgrim_guard_core', 'pilgrim_convergence_major'],
                ['pilgrim_agile_core', 'pilgrim_convergence_major'],
                ['pilgrim_convergence_major', 'pilgrim_vow_mid'],

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
                ['pilgrim_abyss_1', 'pilgrim_cleanse_1'],
                ['pilgrim_cleanse_1', 'pilgrim_cleanse_2'],
                ['pilgrim_cleanse_2', 'pilgrim_active_purify'],
                ['pilgrim_active_purify', 'pilgrim_abyss_anchor'],

                ['pilgrim_vow_final', 'pilgrim_martyr_1'],
                ['pilgrim_martyr_1', 'pilgrim_martyr_2'],
                ['pilgrim_martyr_2', 'pilgrim_martyr_3'],
                ['pilgrim_martyr_3', 'pilgrim_martyr_4'],
                ['pilgrim_martyr_4', 'pilgrim_active_martyr_brand'],
                ['pilgrim_active_martyr_brand', 'pilgrim_martyr_keystone'],

                ['pilgrim_valor_core', 'pilgrim_hunt_1'],
                ['pilgrim_hunt_1', 'pilgrim_hunt_2'],
                ['pilgrim_hunt_2', 'pilgrim_hunt_3'],
                ['pilgrim_hunt_3', 'pilgrim_hunt_core'],
                ['pilgrim_hunt_core', 'pilgrim_valor_final'],

                ['pilgrim_faith_core', 'pilgrim_sanct_1'],
                ['pilgrim_sanct_1', 'pilgrim_sanct_2'],
                ['pilgrim_sanct_2', 'pilgrim_sanct_3'],
                ['pilgrim_sanct_3', 'pilgrim_sanct_keystone'],
                ['pilgrim_sanct_keystone', 'pilgrim_guard_final'],

                ['pilgrim_faith_final', 'pilgrim_rev_1'],
                ['pilgrim_rev_1', 'pilgrim_rev_2'],
                ['pilgrim_rev_2', 'pilgrim_rev_3'],
                ['pilgrim_rev_3', 'pilgrim_rev_keystone'],
                ['pilgrim_rev_keystone', 'pilgrim_flux_1'],
                ['pilgrim_flux_1', 'pilgrim_flux_2'],
                ['pilgrim_flux_2', 'pilgrim_flux_3'],
                ['pilgrim_flux_3', 'pilgrim_flux_keystone'],
                ['pilgrim_flux_keystone', 'pilgrim_stellar_1'],
                ['pilgrim_stellar_1', 'pilgrim_stellar_2'],
                ['pilgrim_stellar_2', 'pilgrim_stellar_crown'],
                ['pilgrim_stellar_crown', 'pilgrim_hunt_core'],

                ['pilgrim_guard_final', 'pilgrim_bulwark_1'],
                ['pilgrim_bulwark_1', 'pilgrim_bulwark_2'],
                ['pilgrim_bulwark_2', 'pilgrim_bulwark_3'],
                ['pilgrim_bulwark_3', 'pilgrim_bulwark_keystone'],
                ['pilgrim_bulwark_keystone', 'pilgrim_martyr_1'],

                ['pilgrim_faith_final', 'pilgrim_radiant_1'],
                ['pilgrim_radiant_1', 'pilgrim_radiant_2'],
                ['pilgrim_radiant_2', 'pilgrim_active_radiant_volley'],

                ['pilgrim_guard_final', 'pilgrim_bastion_1'],
                ['pilgrim_bastion_1', 'pilgrim_active_solemn_bastion'],

                ['pilgrim_cont_sanctum', 'pilgrim_mercy_1'],
                ['pilgrim_mercy_1', 'pilgrim_active_mercy_breath'],

                ['pilgrim_valor_final', 'pilgrim_ember_1'],
                ['pilgrim_ember_1', 'pilgrim_active_ember_sigil'],

                ['pilgrim_faith_1', 'pilgrim_devotion_1'],
                ['pilgrim_devotion_1', 'pilgrim_devotion_2'],

                ['pilgrim_def_1', 'pilgrim_steadfast_1'],
                ['pilgrim_steadfast_1', 'pilgrim_vita_1'],
                ['pilgrim_vita_1', 'pilgrim_vita_2'],
                ['pilgrim_vita_2', 'pilgrim_vita_keystone'],

                ['pilgrim_spd_1', 'pilgrim_quickness_1'],
                ['pilgrim_quickness_1', 'pilgrim_iron_mind'],

                ['pilgrim_devotion_2', 'pilgrim_chorus_1'],
                ['pilgrim_chorus_1', 'pilgrim_chorus_2'],
                ['pilgrim_chorus_2', 'pilgrim_chorus_keystone'],
                ['pilgrim_chorus_keystone', 'pilgrim_tithe_1'],
                ['pilgrim_tithe_1', 'pilgrim_tithe_2'],

                ['pilgrim_oracle_notable', 'pilgrim_pen_1'],
                ['pilgrim_pen_1', 'pilgrim_pen_2'],
                ['pilgrim_pen_2', 'pilgrim_pen_keystone'],

                ['pilgrim_cleanse_2', 'pilgrim_clear_dawn'],

                ['pilgrim_faith_3', 'pilgrim_mirror_1'],
                ['pilgrim_mirror_1', 'pilgrim_mirror_2'],
                ['pilgrim_mirror_2', 'pilgrim_mirror_keystone'],

                ['pilgrim_valor_final', 'pilgrim_eden_minor'],
                ['pilgrim_eden_minor', 'pilgrim_active_eden_lance'],

                ['pilgrim_guard_final', 'pilgrim_dawn_minor'],
                ['pilgrim_dawn_minor', 'pilgrim_active_dawn_shelter'],

                ['pilgrim_hunt_core', 'pilgrim_reck_minor'],
                ['pilgrim_reck_minor', 'pilgrim_active_reckoning']
            ]
        }
    },

    items: {
        // --- 전리품 (재료) ---
        'gray_dust':  { kind: 'material', name: '회색 가루',   grade: 'Normal',   desc: '세계를 덮고 있는 무채색의 가루입니다.' },
        'rat_tail':   { kind: 'material', name: '쥐 꼬리',     grade: 'Normal',   desc: '탐욕스러운 쥐의 꼬리입니다.' },
        'tiny_horn':  { kind: 'material', name: '작은 뿔',     grade: 'Uncommon', desc: '어린 마귀의 뿔입니다.' },
        'ghost_dust': { kind: 'material', name: '영혼의 먼지', grade: 'Uncommon', desc: '원령이 흩어지며 남긴 불길한 먼지입니다.' },
        'frog_poison': { kind: 'material', name: '개구리 독샘', grade: 'Uncommon', desc: '늪의 독개구리에게서 채취한 맹독 물질입니다.' },
        'snake_scale': { kind: 'material', name: '뱀 비늘', grade: 'Uncommon', desc: '진흙 구렁이의 단단하고 질긴 비늘입니다.' },
        'tainted_moss': { kind: 'material', name: '오염된 이끼', grade: 'Rare', desc: '해골전사에게 붙어있던 죽음의 이끼입니다.' },
        'giant_core': { kind: 'material', name: '거인의 핵', grade: 'Epic', desc: '진흙 거인의 몸체 중심에서 맥동하던 코어입니다.' },
        'smithing_shard': { kind: 'material', name: '제련 파편', grade: 'Uncommon', desc: '대장간에서 강화 촉매로 쓰이는 금속 파편입니다.' },
        'blessed_iron': { kind: 'material', name: '축성 강철', grade: 'Rare', desc: '기도로 정련된 단단한 합금 재료입니다.' },
        'seraph_ember': { kind: 'material', name: '세라프 잔화', grade: 'Epic', desc: '고위 존재의 잔열이 남은 희귀한 단조 촉매입니다.' },
        'abyss_scale': { kind: 'material', name: '심연 비늘', grade: 'Rare', desc: '심연 수계 괴수에게서 떨어져 나온 단단한 비늘입니다.' },
        'throne_fragment': { kind: 'material', name: '왕좌 파편', grade: 'Epic', desc: '오래된 왕좌의 조각. 고밀도 광휘가 남아 있습니다.' },
        'echo_of_wraith': { kind: 'material', name: '원혼의 잔향', grade: 'Rare', desc: '원혼 보스를 쓰러뜨렸다는 증표가 되는 잔향 조각입니다.' },
        'heart_of_giant': { kind: 'material', name: '거인의 심핵', grade: 'Epic', desc: '진흙 거인의 심부에서만 떨어지는 무거운 핵입니다.' },
        'seraph_feather': { kind: 'material', name: '석화 깃편', grade: 'Epic', desc: '석화 세라프의 날개에서 흩어진 희귀 깃편입니다.' },
        'hydra_venom_gem': { kind: 'material', name: '히드라 맹독핵', grade: 'Epic', desc: '심연 히드라의 독이 응축된 광물 결정입니다.' },
        'guardian_oath': { kind: 'material', name: '수호자의 맹세', grade: 'Epic', desc: '왕좌 수호자의 의지가 봉인된 성물 조각입니다.' },
        'border_reliquary': { kind: 'material', name: '변방 성구함 조각', grade: 'Epic', desc: '회랑 끝 의식장에서 떨어진 성구함의 파편입니다.' },
        'void_sliver': { kind: 'material', name: '공허의 파편', grade: 'Epic', desc: '색이 사라진 틈새에만 남는 결정질 잔재입니다.' },

        // --- 무기 (Weapon) ---
        'wooden_sword': { kind: 'equipment', name: '부러진 나무검', grade: 'Normal', slot: 'weapon', stats: { atk: 3 }, desc: '장난감에 가까운 낡은 나무검입니다.' },
        'chipped_dagger': { kind: 'equipment', name: '이 빠진 단검', grade: 'Normal', slot: 'weapon', stats: { atk: 4, spd: 3 }, desc: '날이 많이 상한 녹슨 단검입니다.' },
        'iron_sword': { kind: 'equipment', name: '낡은 철검', grade: 'Uncommon', slot: 'weapon', stats: { atk: 7 }, desc: '녹이 슬었지만 제법 날카로운 철검입니다.' },
        'hunter_bow': { kind: 'equipment', name: '사냥꾼의 활', grade: 'Uncommon', slot: 'weapon', stats: { atk: 8, spd: 5 }, desc: '가볍게 다루기 좋은 수렵용 활입니다.' },
        'bronze_sword': { kind: 'equipment', name: '청동 검', grade: 'Uncommon', slot: 'weapon', stats: { atk: 9, hp: 10 }, desc: '무겁지만 튼튼한 청동 재질의 검입니다.' },
        'silver_dagger': { kind: 'equipment', name: '은장도', grade: 'Rare', slot: 'weapon', stats: { atk: 12, spd: 8 }, desc: '어둠을 베어내는 신성한 은빛 단검입니다.' },
        'steel_longsword': { kind: 'equipment', name: '강철 장검', grade: 'Rare', slot: 'weapon', stats: { atk: 14, hp: 15 }, desc: '숙련된 대장장이가 벼려낸 매끄러운 강철 장검입니다.' },
        'bone_spear': { kind: 'equipment', name: '기혼의 뼈창', grade: 'Rare', slot: 'weapon', stats: { atk: 16, def: 2 }, desc: '거대한 늪 괴수의 뼈로 깎아 만든 날카로운 창입니다.' },
        'wraith_blade': { kind: 'equipment', name: '원혼을 베는 검', grade: 'Epic', slot: 'weapon', stats: { atk: 22, spd: 10 }, desc: '원혼 보스가 사용하던 서늘한 기운을 내뿜는 마검입니다.' },
        'earth_hammer': { kind: 'equipment', name: '대지의 둔기', grade: 'Epic', slot: 'weapon', stats: { atk: 28, def: 10, spd: -5 }, desc: '진흙 거인이 대지를 내리칠 때 쓰던 거대한 둔기입니다.' },

        // --- 방어구 (Armor) ---
        'ragged_cloak': { kind: 'equipment', name: '누더기 망토', grade: 'Normal', slot: 'armor', stats: { def: 1, hp: 5, spd: 2 }, desc: '거적때기를 이어 붙여 만든 엉성한 망토입니다.' },
        'rusty_armor': { kind: 'equipment', name: '녹슨 호심경', grade: 'Normal', slot: 'armor', stats: { def: 2, hp: 10 }, desc: '가슴 부분만을 간신히 가려주는 낡은 철판입니다.' },
        'leather_vest': { kind: 'equipment', name: '가죽 조끼', grade: 'Uncommon', slot: 'armor', stats: { def: 5, hp: 20 }, desc: '질긴 코뿔소 가죽으로 만든 훌륭한 조끼입니다.' },
        'bronze_breastplate': { kind: 'equipment', name: '청동 흉갑', grade: 'Uncommon', slot: 'armor', stats: { def: 7, hp: 30 }, desc: '심장을 보호하기 위해 설계된 청동 마갑입니다.' },
        'swamp_leather': { kind: 'equipment', name: '습지의 가죽옷', grade: 'Rare', slot: 'armor', stats: { def: 9, hp: 35, spd: 5 }, desc: '독늪의 습기를 차단해주는 부드럽고 가벼운 가죽옷입니다.' },
        'steel_armor': { kind: 'equipment', name: '강철 갑옷', grade: 'Rare', slot: 'armor', stats: { def: 12, hp: 50, spd: -2 }, desc: '이름 없는 기사가 남기고 간 견고한 판금 갑옷입니다.' },
        'thorn_armor': { kind: 'equipment', name: '가시나무 흉갑', grade: 'Epic', slot: 'armor', stats: { def: 18, hp: 80 }, desc: '강력한 가시덤불 마력이 얽혀 만들어진 전설적인 방어구입니다.' },

        // --- 신발 (Boots) ---
        'straw_shoes': { kind: 'equipment', name: '짚신', grade: 'Normal', slot: 'boots', stats: { spd: 3, hp: 5 }, desc: '가난한 순례자들이 흔히 매고 다니는 짚신입니다.' },
        'old_boots': { kind: 'equipment', name: '해진 가죽신', grade: 'Normal', slot: 'boots', stats: { spd: 5 }, desc: '뒤축이 완전히 닳아버린 장화입니다.' },
        'sturdy_boots': { kind: 'equipment', name: '튼튼한 가죽화', grade: 'Uncommon', slot: 'boots', stats: { spd: 8, def: 2 }, desc: '마감 처리가 훌륭한 여행자용 가죽 신발입니다.' },
        'soldier_boots': { kind: 'equipment', name: '병사의 전투화', grade: 'Uncommon', slot: 'boots', stats: { spd: 10, hp: 15 }, desc: '왕국군의 규격에 맞춰 제작된 실용적인 군화입니다.' },
        'steel_boots': { kind: 'equipment', name: '강철 군화', grade: 'Rare', slot: 'boots', stats: { spd: 12, def: 5 }, desc: '무겁지만 날카로운 공격으로부터 발을 완벽히 보호합니다.' },
        'wind_shoes': { kind: 'equipment', name: '바람의 신', grade: 'Rare', slot: 'boots', stats: { spd: 20 }, desc: '바람 정령의 축복을 받아 발걸음을 깃털처럼 가볍게 해줍니다.' },
        'mud_boots': { kind: 'equipment', name: '진흙장화', grade: 'Epic', slot: 'boots', stats: { spd: 25, def: 8 }, desc: '어떠한 험비나 늪지대에서도 달릴 수 있게 해주는 마법의 장화입니다.' },

        // --- 투구 (Helmet) ---
        'pilgrim_hood': { kind: 'equipment', name: '순례자의 두건', grade: 'Normal', slot: 'helmet', stats: { def: 2, hp: 8 }, desc: '먼지와 바람을 막아주는 평범한 두건입니다.' },
        'seraph_crown': { kind: 'equipment', name: '세라프의 왕관', grade: 'Epic', slot: 'helmet', stats: { def: 15, faith: 2 }, desc: '석화 세라프의 잔재가 스며든 왕관입니다.' },

        // --- 장신구 (Accessory) ---
        'pilgrim_beads': { kind: 'equipment', name: '순례 염주', grade: 'Normal', slot: 'accessory', stats: { pp: 6, faith: 1 }, desc: '짧은 기도문이 새겨진 초심자용 염주입니다.' },
        'prayer_ring': { kind: 'equipment', name: '기도의 반지', grade: 'Uncommon', slot: 'accessory', stats: { pp: 12, faith: 1 }, desc: '간결한 기도문이 새겨진 은빛 반지입니다.' },
        'ember_necklace': { kind: 'equipment', name: '잿빛 목걸이', grade: 'Rare', slot: 'accessory', stats: { atk: 6, pp: 10 }, desc: '숨겨진 불씨가 미세하게 맥동하는 목걸이입니다.' },
        'oracle_pendant': { kind: 'equipment', name: '신탁의 펜던트', grade: 'Rare', slot: 'accessory', stats: { faith: 2, pp: 16 }, desc: '희미한 계시가 머무는 청명한 펜던트입니다.' },
        'battle_rosary': { kind: 'equipment', name: '전장의 묵주', grade: 'Rare', slot: 'accessory', stats: { atk: 5, faith: 1, pp: 8 }, desc: '전투 기도를 위해 매듭이 촘촘히 엮인 묵주입니다.' },
        'wraith_locket': { kind: 'equipment', name: '원혼 로켓', grade: 'Epic', slot: 'accessory', stats: { faith: 3, pp: 18, lifeSteal: 0.04 }, desc: '서늘한 잔향이 맴도는 보스 전용 장신구입니다.' },

        // --- 방패 (Off-hand) ---
        'wooden_shield': { kind: 'equipment', name: '나무 방패', grade: 'Normal', slot: 'offhand', stats: { def: 4, hp: 15 }, desc: '기초 방어를 위한 단단한 원형 방패입니다.' },
        'covenant_shield': { kind: 'equipment', name: '언약의 방패', grade: 'Rare', slot: 'offhand', stats: { def: 12, hp: 40, faith: 1 }, desc: '진동하는 문양이 새겨진 신성한 방패입니다.' },
        'mirror_buckler': { kind: 'equipment', name: '반향 버클러', grade: 'Rare', slot: 'offhand', stats: { def: 9, spd: 6, pp: 6 }, desc: '충격을 흘려보내는 얇은 경량 보조 방패입니다.' },
        'giant_heart_shield': { kind: 'equipment', name: '거인의 심장 방패', grade: 'Epic', slot: 'offhand', stats: { def: 18, hp: 75, spd: -2 }, desc: '진흙 거인의 심핵으로 단조된 중량형 방패입니다.' },

        // --- 신규 장비 1차 확장 ---
        'pilgrim_lance': { kind: 'equipment', name: '순례 창', grade: 'Uncommon', slot: 'weapon', stats: { atk: 10, spd: 2 }, desc: '긴 사거리로 균형 잡힌 전투를 돕는 창입니다.' },
        'sanctum_mail': { kind: 'equipment', name: '성역 쇄자갑', grade: 'Rare', slot: 'armor', stats: { def: 10, hp: 42, faith: 1 }, desc: '성소 문양이 새겨진 중갑입니다.' },
        'watcher_hood': { kind: 'equipment', name: '감시자의 후드', grade: 'Rare', slot: 'helmet', stats: { def: 7, spd: 6 }, desc: '시야를 잃지 않도록 도와주는 경량 투구입니다.' },
        'pilgrim_greaves': { kind: 'equipment', name: '순례 경갑', grade: 'Uncommon', slot: 'boots', stats: { spd: 11, def: 3 }, desc: '장거리 이동과 전투를 함께 고려한 다용도 경갑입니다.' },
        'river_trident': { kind: 'equipment', name: '강의 삼지창', grade: 'Rare', slot: 'weapon', stats: { atk: 20, spd: 6 }, desc: '급류를 가르며 단련된 날카로운 삼지창입니다.' },
        'dusk_plate': { kind: 'equipment', name: '황혼 판금갑', grade: 'Epic', slot: 'armor', stats: { def: 16, hp: 70 }, desc: '황혼빛 합금으로 단조된 중후한 판금갑입니다.' },
        'halo_boots': { kind: 'equipment', name: '광륜 장화', grade: 'Epic', slot: 'boots', stats: { spd: 18, faith: 1 }, desc: '미세한 광륜 잔광이 발끝을 감싸는 장화입니다.' },
        'oath_diadem': { kind: 'equipment', name: '서약의 디아뎀', grade: 'Epic', slot: 'helmet', stats: { def: 12, faith: 2, pp: 14 }, desc: '서약 문장이 새겨진 의식용 관입니다.' },
        'relic_talisman': { kind: 'equipment', name: '유물 부적', grade: 'Epic', slot: 'accessory', stats: { atk: 8, faith: 2, pp: 12 }, desc: '봉인된 유물의 파편을 엮은 부적입니다.' },
        'aegis_core': { kind: 'equipment', name: '아이기스 코어', grade: 'Epic', slot: 'offhand', stats: { def: 14, hp: 55, faith: 2 }, desc: '집중 방어 결계를 생성하는 핵심 장치입니다.' },
        'seraphite_mail': { kind: 'equipment', name: '세라파이트 성갑', grade: 'Epic', slot: 'armor', stats: { def: 20, hp: 85, faith: 2 }, desc: '석화 세라프의 깃편으로 엮은 보스 전용 갑주입니다.' },
        'hydra_fang_blade': { kind: 'equipment', name: '히드라 송곳니도', grade: 'Epic', slot: 'weapon', stats: { atk: 32, spd: 10, lifeSteal: 0.03 }, desc: '심연 히드라의 송곳니를 제련한 포식자의 검입니다.' },
        'guardian_halo': { kind: 'equipment', name: '수호자의 광륜', grade: 'Epic', slot: 'helmet', stats: { def: 16, faith: 3, pp: 20 }, desc: '왕좌 수호자의 맹세가 남은 최상급 투구입니다.' }
    },

    dropTables: {
        // 비손 유역 (Pishon)
        'drop_f_slime': [ { itemId: 'gray_dust', chance: 0.4 }, { itemId: 'wooden_sword', chance: 0.05 }, { itemId: 'straw_shoes', chance: 0.05 }, { itemId: 'pilgrim_hood', chance: 0.02 }, { itemId: 'pilgrim_beads', chance: 0.02 }, { itemId: 'wooden_shield', chance: 0.02 }, { itemId: 'smithing_shard', chance: 0.06 } ],
        'drop_e_rat': [ { itemId: 'rat_tail', chance: 0.4 }, { itemId: 'chipped_dagger', chance: 0.08 }, { itemId: 'ragged_cloak', chance: 0.08 }, { itemId: 'old_boots', chance: 0.08 }, { itemId: 'pilgrim_hood', chance: 0.04 }, { itemId: 'pilgrim_beads', chance: 0.04 }, { itemId: 'wooden_shield', chance: 0.04 }, { itemId: 'smithing_shard', chance: 0.1 } ],
        'drop_d_wraith': [ { itemId: 'ghost_dust', chance: 0.5 }, { itemId: 'iron_sword', chance: 0.08 }, { itemId: 'rusty_armor', chance: 0.08 }, { itemId: 'sturdy_boots', chance: 0.06 }, { itemId: 'pilgrim_hood', chance: 0.05 }, { itemId: 'prayer_ring', chance: 0.05 }, { itemId: 'wooden_shield', chance: 0.05 }, { itemId: 'smithing_shard', chance: 0.14 } ],
        'drop_d_imp': [ { itemId: 'tiny_horn', chance: 0.5 }, { itemId: 'hunter_bow', chance: 0.08 }, { itemId: 'leather_vest', chance: 0.08 }, { itemId: 'soldier_boots', chance: 0.06 }, { itemId: 'pilgrim_hood', chance: 0.05 }, { itemId: 'prayer_ring', chance: 0.05 }, { itemId: 'wooden_shield', chance: 0.05 }, { itemId: 'smithing_shard', chance: 0.14 } ],
        'drop_c_wraith': [ { itemId: 'ghost_dust', chance: 1.0 }, { itemId: 'wraith_blade', chance: 0.15 }, { itemId: 'bronze_breastplate', chance: 0.15 }, { itemId: 'sturdy_boots', chance: 0.1 }, { itemId: 'prayer_ring', chance: 0.07 }, { itemId: 'wooden_shield', chance: 0.07 } ],
        
        // 기혼 유역 (Gihon)
        'drop_d_frog': [ { itemId: 'frog_poison', chance: 0.4 }, { itemId: 'bronze_sword', chance: 0.08 }, { itemId: 'leather_vest', chance: 0.08 } ],
        'drop_d_snake': [ { itemId: 'snake_scale', chance: 0.4 }, { itemId: 'hunter_bow', chance: 0.08 }, { itemId: 'bronze_breastplate', chance: 0.05 } ],
        'drop_c_skeleton': [ { itemId: 'tainted_moss', chance: 0.5 }, { itemId: 'steel_longsword', chance: 0.1 }, { itemId: 'steel_armor', chance: 0.1 }, { itemId: 'soldier_boots', chance: 0.08 } ],
        'drop_c_stalker': [ { itemId: 'tainted_moss', chance: 0.4 }, { itemId: 'silver_dagger', chance: 0.1 }, { itemId: 'swamp_leather', chance: 0.1 }, { itemId: 'wind_shoes', chance: 0.08 } ],
        'drop_b_giant': [ { itemId: 'giant_core', chance: 1.0 }, { itemId: 'earth_hammer', chance: 0.2 }, { itemId: 'thorn_armor', chance: 0.15 }, { itemId: 'mud_boots', chance: 0.15 } ],

        // 히데겔 협곡 (Hidekel)
        'drop_c_hidekel': [ { itemId: 'tainted_moss', chance: 0.45 }, { itemId: 'ember_necklace', chance: 0.08 }, { itemId: 'wooden_shield', chance: 0.1 }, { itemId: 'blessed_iron', chance: 0.14 } ],
        'drop_b_hidekel': [ { itemId: 'giant_core', chance: 0.5 }, { itemId: 'covenant_shield', chance: 0.12 }, { itemId: 'steel_longsword', chance: 0.1 }, { itemId: 'smithing_shard', chance: 0.35 } ],
        'drop_a_seraph': [ { itemId: 'seraph_crown', chance: 0.25 }, { itemId: 'covenant_shield', chance: 0.2 }, { itemId: 'earth_hammer', chance: 0.15 }, { itemId: 'seraph_ember', chance: 0.22 } ],

        // 유브라데 전장 (Euphrates)
        'drop_b_euphrates': [ { itemId: 'blessed_iron', chance: 0.32 }, { itemId: 'river_trident', chance: 0.1 }, { itemId: 'mirror_buckler', chance: 0.09 }, { itemId: 'abyss_scale', chance: 0.2 } ],
        'drop_a_euphrates': [ { itemId: 'seraph_ember', chance: 0.24 }, { itemId: 'dusk_plate', chance: 0.11 }, { itemId: 'oath_diadem', chance: 0.1 }, { itemId: 'abyss_scale', chance: 0.28 } ],
        'drop_a_hydra': [ { itemId: 'abyss_scale', chance: 1.0 }, { itemId: 'halo_boots', chance: 0.22 }, { itemId: 'relic_talisman', chance: 0.18 }, { itemId: 'seraph_ember', chance: 0.35 } ],

        // 에덴 심연 (Eden Core)
        'drop_a_eden': [ { itemId: 'abyss_scale', chance: 0.35 }, { itemId: 'throne_fragment', chance: 0.22 }, { itemId: 'aegis_core', chance: 0.08 } ],
        'drop_s_eden': [ { itemId: 'throne_fragment', chance: 0.45 }, { itemId: 'relic_talisman', chance: 0.1 }, { itemId: 'oath_diadem', chance: 0.1 } ],
        'drop_s_guardian': [ { itemId: 'throne_fragment', chance: 1.0 }, { itemId: 'aegis_core', chance: 0.26 }, { itemId: 'halo_boots', chance: 0.24 }, { itemId: 'seraph_ember', chance: 0.4 } ],

        'drop_periphery_field': [
            { itemId: 'throne_fragment', chance: 0.42 },
            { itemId: 'abyss_scale', chance: 0.3 },
            { itemId: 'blessed_iron', chance: 0.22 },
            { itemId: 'seraph_ember', chance: 0.28 },
            { itemId: 'smithing_shard', chance: 0.4 },
            { itemId: 'border_reliquary', chance: 0.06 },
            { itemId: 'dusk_plate', chance: 0.045 },
            { itemId: 'oath_diadem', chance: 0.04 },
            { itemId: 'relic_talisman', chance: 0.035 },
            { itemId: 'river_trident', chance: 0.03 },
            { itemId: 'mirror_buckler', chance: 0.028 },
            { itemId: 'covenant_shield', chance: 0.025 }
        ],
        'drop_void_field': [
            { itemId: 'throne_fragment', chance: 0.5 },
            { itemId: 'guardian_oath', chance: 0.12 },
            { itemId: 'void_sliver', chance: 0.1 },
            { itemId: 'abyss_scale', chance: 0.26 },
            { itemId: 'blessed_iron', chance: 0.26 },
            { itemId: 'seraph_ember', chance: 0.36 },
            { itemId: 'smithing_shard', chance: 0.42 },
            { itemId: 'halo_boots', chance: 0.05 },
            { itemId: 'aegis_core', chance: 0.04 },
            { itemId: 'relic_talisman', chance: 0.045 },
            { itemId: 'hydra_fang_blade', chance: 0.018 },
            { itemId: 'dusk_plate', chance: 0.038 }
        ],
        'drop_border_warden': [
            { itemId: 'throne_fragment', chance: 1.0 },
            { itemId: 'border_reliquary', chance: 0.55 },
            { itemId: 'aegis_core', chance: 0.34 },
            { itemId: 'oath_diadem', chance: 0.3 },
            { itemId: 'halo_boots', chance: 0.26 },
            { itemId: 'relic_talisman', chance: 0.28 },
            { itemId: 'seraph_ember', chance: 0.48 },
            { itemId: 'guardian_oath', chance: 0.12 }
        ],
        'drop_void_sovereign': [
            { itemId: 'guardian_oath', chance: 1.0 },
            { itemId: 'void_sliver', chance: 0.62 },
            { itemId: 'aegis_core', chance: 0.42 },
            { itemId: 'guardian_halo', chance: 0.26 },
            { itemId: 'hydra_fang_blade', chance: 0.2 },
            { itemId: 'seraph_ember', chance: 0.52 },
            { itemId: 'throne_fragment', chance: 0.85 }
        ]
    },

    // 보스 던전/보스전 전용 드랍 (일반 필드에서는 획득 불가)
    bossExclusiveDropTables: {
        wraith: [
            { itemId: 'echo_of_wraith', chance: 1.0, minQty: 1, maxQty: 1 },
            { itemId: 'wraith_locket', chance: 0.04, minQty: 1, maxQty: 1 }
        ],
        mud_giant: [
            { itemId: 'heart_of_giant', chance: 1.0, minQty: 1, maxQty: 1 },
            { itemId: 'giant_heart_shield', chance: 0.035, minQty: 1, maxQty: 1 }
        ],
        stone_seraph: [
            { itemId: 'seraph_feather', chance: 1.0, minQty: 1, maxQty: 1 },
            { itemId: 'seraphite_mail', chance: 0.03, minQty: 1, maxQty: 1 }
        ],
        abyss_hydra: [
            { itemId: 'hydra_venom_gem', chance: 1.0, minQty: 1, maxQty: 1 },
            { itemId: 'hydra_fang_blade', chance: 0.025, minQty: 1, maxQty: 1 }
        ],
        throne_guardian: [
            { itemId: 'guardian_oath', chance: 1.0, minQty: 1, maxQty: 1 },
            { itemId: 'guardian_halo', chance: 0.02, minQty: 1, maxQty: 1 }
        ],
        border_warden: [
            { itemId: 'border_reliquary', chance: 1.0, minQty: 1, maxQty: 2 },
            { itemId: 'throne_fragment', chance: 1.0, minQty: 2, maxQty: 4 },
            { itemId: 'hydra_fang_blade', chance: 0.028, minQty: 1, maxQty: 1 },
            { itemId: 'seraphite_mail', chance: 0.022, minQty: 1, maxQty: 1 }
        ],
        void_sovereign: [
            { itemId: 'void_sliver', chance: 1.0, minQty: 1, maxQty: 2 },
            { itemId: 'guardian_oath', chance: 1.0, minQty: 1, maxQty: 2 },
            { itemId: 'guardian_halo', chance: 0.045, minQty: 1, maxQty: 1 },
            { itemId: 'aegis_core', chance: 0.08, minQty: 1, maxQty: 1 }
        ]
    },

    /**
     * 예배하기(말씀 카드)에 표시할 구절 — 개역개정 번역 인용
     * text: 본문 일부(카드·로그 표시용), ref: 성경 권·장·절
     */
    worshipVerses: [
        { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
        { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" },
        { text: "강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라", ref: "여호수아 1:9" },
        { text: "너는 내게 부르짖으라 내가 네게 응답하겠고 네가 알지 못하는 크고 은밀한 일을 네게 보이리라", ref: "예레미야 33:3" },
        { text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라", ref: "요한복음 3:16" },
        { text: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라", ref: "로마서 8:28" },
        { text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 네 길에서 그를 인정하라 그리하면 네 길을 지도하시리라", ref: "잠언 3:5-6" },
        { text: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라", ref: "마태복음 11:28" },
        { text: "오직 여호와를 기다리는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요", ref: "이사야 40:31" },
        { text: "아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로, 감사함으로 너희 구할 것을 하나님께 아뢰라", ref: "빌립보서 4:6" },
        { text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", ref: "시편 119:105" },
        { text: "너의 행사를 여호와에게 맡기라 그리하면 네 경영하는 바가 이루어지리라", ref: "잠언 16:3" },
        { text: "또한 여호와를 기뻐하라 그가 네 마음의 소원을 이루어 주시리라", ref: "시편 37:4" },
        { text: "내가 내게 이르기를 내 은혜가 네게 족하다 하였으니 이는 내 능력이 약한 데서 온전하여짐이라 하심이라", ref: "고린도후서 12:9" },
        { text: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라", ref: "요한일서 4:19" },
        { text: "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 여호와는 내 생명의 능력이시니 내가 누구를 무서워하리요", ref: "시편 27:1" },
        { text: "사람아 주께서 선한 것이 무엇임을 네게 보이셨나이과 공의를 행하며 인자를 사랑하며 겸손히 네 하나님과 함께 행하는 것이 아니냐", ref: "미가 6:8" },
        { text: "너희는 이 세대를 본받지 말고 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라", ref: "로마서 12:2" },
        { text: "나의 도움이 천지를 지으신 여호와에게서로다", ref: "시편 121:2" },
        { text: "두려워하지 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라", ref: "이사야 41:10" },
        { text: "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라", ref: "마태복음 6:33" },
        { text: "여호와를 경외하는 것이 지식의 근본이거늘 미련한 자는 지혜와 훈계를 멸시하느니라", ref: "잠언 1:7" },
        { text: "여호와께서 내 주에게 이르시되 내가 네 원수로 네 발등상이 되게 하기까지 너는 내 우편에 앉으라 하셨도다", ref: "시편 110:1" },
        { text: "내가 세상 끝 날까지 너희와 항상 함께 있으리라", ref: "마태복음 28:20" },
        { text: "평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 세상이 주는 것 같이 주지 아니하노라", ref: "요한복음 14:27" },
        { text: "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라", ref: "베드로전서 5:7" },
        { text: "내가 진실로 진실로 너희에게 이르노니 나는 양의 문이니", ref: "요한복음 10:7" },
        { text: "여호와는 긍휼이 많으시고 은혜로우시며 노하기를 더디 하시고 인자하심이 풍부하시도다", ref: "시편 103:8" },
        { text: "너는 내 종이니 내가 너를 택하였고 내가 너를 버리지 아니하였고 너를 버리지 아니하리라 하였느니라", ref: "이사야 41:9" },
        { text: "주는 나의 피난처시요 산성이시니 내가 당할 환난에서 나를 인도하시리이다", ref: "시편 61:3" },
        { text: "네가 물 가운데로 지날 때에 내가 함께할 것이라 또는 강을 건널 때에 물이 너를 침몰하지 못할 것이며", ref: "이사야 43:2" },
        { text: "내가 너를 지명하였고 너는 내 것이라", ref: "이사야 43:1" },
        { text: "여호와는 가까이 계시니 모든 부르짖는 자에게, 곧 진실하게 부르짖는 자에게 가까이 하시는도다", ref: "시편 145:18" },
        { text: "너희가 내 이름으로 무엇이든지 내게 구하면 내가 행하리라", ref: "요한복음 14:13" },
        { text: "하나님은 사랑이시라 사랑 안에 거하는 자는 하나님 안에 거하고 하나님도 그 안에 거하시느니라", ref: "요한일서 4:16" },
        { text: "너희는 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라", ref: "요한복음 13:34" },
        { text: "여호와는 나의 힘이시요 나의 방패시니 내 마음이 그를 의지하여 도움을 얻었도다", ref: "시편 28:7" },
        { text: "내가 너희에게 명한 것은 곧 서로 사랑하라 하는 이것이니라", ref: "요한복음 15:17" },
        { text: "하나님이 우리를 사랑하신 것 같이 우리도 서로 사랑하는 것이 마땅하니라", ref: "요한일서 4:11" },
        { text: "내 영혼아 여호와를 송축하라 내 속에 있는 것들아 그 성호를 송축하라", ref: "시편 103:1" },
        { text: "여호와를 찬송할지어다 내 영혼아 찬송할지어다 여호와는 심히 크시도다", ref: "시편 104:1" },
        { text: "너는 잠잠히 있어 여호와를 기다리라 그를 바라는 자에게 견디게 하시리로다", ref: "시편 37:7" },
        { text: "내가 여호와를 항상 송축함이여 그의 찬송을 내 입에 계속하리로다", ref: "시편 34:1" },
        { text: "여호와는 자비로우시고 은혜로우시며 노하기를 더디 하시고 인자하심이 풍부하시도다", ref: "시편 145:8" },
        { text: "거룩하게 하시는 이와 또한 거룩하게 함을 입은 자들이 다 한에서 남이니 이로 말미암아 그가 형제들이라 부르시기를 부끄러워 아니하시고", ref: "히브리서 2:11" },
        { text: "믿음이 없이는 하나님을 기쁘시게 하지 못하나니 하나님께 나아가는 자는 반드시 그가 계신 것과 또한 그가 자기를 찾는 자들에게 상 주시는 이심을 믿어야 할지니라", ref: "히브리서 11:6" },
        { text: "저희가 아들을 낳으리니 이름을 임마누엘이라 하리라 하셨으니 이는 번역한즉 하나님이 우리와 함께 계시다라 함이라", ref: "마태복음 1:23" },
        { text: "내가 네 하나님 여호와가 네 오른손을 붙들고 네게 이르기를 두려워하지 말라 내가 너를 도우리라", ref: "이사야 41:13" },
        { text: "주 예수를 믿으라 그리하면 너와 네 집이 구원을 받으리라", ref: "사도행전 16:31" },
        { text: "하나님은 모든 사람이 구원을 받으며 진리를 아는 데 이르기를 원하시느니라", ref: "디모데전서 2:4" },
        { text: "내가 진실로 진실로 너희에게 이르노니 포도나무 가지가 포도나무에 붙어 있지 아니하면 스스로 열매를 맺을 수 없음 같이 너희도 내 안에 있지 아니하면 그러하리라", ref: "요한복음 15:5" },
        { text: "너희가 내 말에 거하면 무엇이든지 원하는 대로 구하라 그리하면 이루리라", ref: "요한복음 15:7" },
        { text: "너희가 과실을 많이 맺으면 내 아버지께서 영광을 받으실 것이요 너희가 내 제자가 되리라", ref: "요한복음 15:8" },
        { text: "사람이 마음으로 믿어 의에 이르고 입으로 시인하여 구원에 이르느니라", ref: "로마서 10:10" },
        { text: "모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니", ref: "디모데후서 3:16" },
        { text: "너희가 세상에 속하지 아니함 같이 나도 세상에 속하지 아니하였느니라", ref: "요한복음 17:16" },
        { text: "아버지께서 나 안에, 내가 아버지 안에 있는 것 같이 저희도 다 하나가 되어 우리 안에 있게 하사 세상으로 아버지께서 나를 보내신 것을 믿게 하옵소서", ref: "요한복음 17:21" },
        { text: "내가 너희에게 이름을 주노니 이는 아버지께서 내게 주신 이름이니라", ref: "요한복음 17:11" },
        { text: "여호와는 나의 반석이시요 나의 구원이시며 나의 산성이시니 내가 흔들리지 아니하리로다", ref: "시편 62:2" },
        { text: "하나님이 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라", ref: "시편 46:1" },
        { text: "너는 잠잠히 있어 하나님을 기다릴지어다 참으로 그가 나를 이롭게 하시는도다", ref: "시편 62:5" },
        { text: "여호와는 나를 선하시고 정직하신 분이시라 그러므로 그는 죄인의 길로 인도하지 아니하시리로다", ref: "시편 25:8" },
        { text: "내가 여호와를 항상 의지하리니 이는 그가 나의 오른편에 계시므로 내가 요동치 아니할 것임이로다", ref: "시편 16:8" },
        { text: "내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라", ref: "요한복음 14:6" },
        { text: "나는 마음이 온유하고 겸손하니 나의 멍에를 메고 내게 배우라 그러면 너희 마음이 쉼을 얻으리라", ref: "마태복음 11:29" },
        { text: "너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라", ref: "야고보서 1:5" },
        { text: "모든 착한 은사와 온전한 선물이 위로부터 빛들의 아버지께로 내려오나니", ref: "야고보서 1:17" },
        { text: "하나님이 처음부터 너희를 택하사 성령의 거룩하게 하심과 진리를 믿음으로 구원을 받게 하심이니", ref: "데살로니가후서 2:13" },
        { text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라", ref: "데살로니가전서 5:16-18" },
        { text: "이것이 내 계명이니 서로 사랑하라 내가 너희를 사랑한 것 같이 너희도 서로 사랑하라", ref: "요한복음 15:12" },
        { text: "너희는 마음에 그리스도를 주로 삼아 거룩하게 하고 너희 속에 있는 소망에 관한 이유를 묻는 자에게 대답할 것을 항상 예비하되", ref: "베드로전서 3:15" },
        { text: "너희가 그 은혜를 인함으로 말미암아 믿음으로 말미암아 구원을 받았나니 이것이 너희에게서 난 것이 아니요 하나님의 선물이라", ref: "에베소서 2:8" },
        { text: "그리스도의 평강이 너희 마음을 주장하게 하라 평강을 위하여 너희가 한 몸으로 부르심을 입었나니 너희는 또한 감사하는 자가 되라", ref: "골로새서 3:15" },
        { text: "모든 눈물을 그 눈에서 닦아 주시니 다시 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라", ref: "요한계시록 21:4" },
        { text: "마땅히 행할 길을 아이에게 가르치라 그리하면 늙어도 그것을 떠나지 아니하리라", ref: "잠언 22:6" },
        { text: "주께 마음을 굳게 정한 자는 평안함을 누리리니 이는 그가 주께 의뢰함이니이다", ref: "이사야 26:3" },
        { text: "우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에게 대한 자기의 사랑을 확증하셨느니라", ref: "로마서 5:8" },
        { text: "잠잠히 있어 하나님이 하나님 됨을 알지어다 내가 만국 중에 높임을 받으리라 내가 온 땅에 높임을 받으리로다", ref: "시편 46:10" },
        { text: "내 하나님이 그리스도 예수 안에서 영광 가운데 그 풍성한 대로 너희 모든 쓸 것을 채우시리라", ref: "빌립보서 4:19" },
        { text: "마지막으로 너희가 주 안에서와 그의 힘의 능력으로 강건하여라", ref: "에베소서 6:10" }
    ],

    smithing: {
        // 배열 길이·에픽 등 최고 등급의 절대 상한 (등급별 실제 상한은 gradeMaxEnhance)
        maxEnhanceLevel: 20,
        /** 등급별 최대 강화 (+n). 에픽만 +20까지 */
        gradeMaxEnhance: {
            Normal: 10,
            Uncommon: 14,
            Rare: 17,
            Epic: 20
        },
        // index = 강화 단계(+n) 누적 보너스 배율(기본 스탯 대비). 구간 1~10 / 11~14 / 15~17 / 18~20 로 뒤로 갈수록 효율 상승
        enhanceRates: [
            0,
            0.09, 0.19, 0.3, 0.42, 0.55, 0.69, 0.84, 1.0, 1.17, 1.35,
            1.58, 1.84, 2.13, 2.45,
            2.82, 3.22, 3.65,
            4.15, 4.7, 5.3
        ],
        // 현재 단계 lv에서 +1 시도 시 성공률 (lv 0~19)
        successRates: [
            1, 1, 1, 1, 0.88, 0.76, 0.64, 0.52, 0.42, 0.32,
            0.26, 0.21, 0.17, 0.14,
            0.12, 0.1, 0.09,
            0.08, 0.07, 0.06
        ],
        /** 보스 전용 드랍 장비 강화 상한 (+30). 구간 1~15 / 16~20 / 21~24 / 25~28 / 29~30 로 뒤로 갈수록 단계당 상승폭 증가 */
        bossMaxEnhanceLevel: 30,
        bossEnhanceRates: [
            0,
            0.103, 0.212, 0.327, 0.448, 0.575, 0.708, 0.847, 0.992, 1.143, 1.3,
            1.463, 1.632, 1.807, 1.988, 2.2,
            2.48, 2.78, 3.1, 3.44, 3.8,
            4.18, 4.58, 5.0, 5.4,
            5.92, 6.48, 7.08, 7.5,
            8.1, 8.8
        ],
        // 보스 전용: lv 0~29 에서 +1 시도 성공률
        bossSuccessRates: [
            1, 1, 1, 1, 0.9, 0.82, 0.74, 0.66, 0.58, 0.5,
            0.44, 0.38, 0.33, 0.28, 0.24,
            0.2, 0.17, 0.14, 0.12, 0.1,
            0.09, 0.08, 0.07, 0.065,
            0.06, 0.055, 0.05, 0.045,
            0.04, 0.035
        ],
        gradeCost: {
            Normal: { gold: 35, materialId: 'smithing_shard', materialCount: 1 },
            Uncommon: { gold: 65, materialId: 'smithing_shard', materialCount: 2 },
            Rare: { gold: 120, materialId: 'blessed_iron', materialCount: 1 },
            Epic: { gold: 210, materialId: 'seraph_ember', materialCount: 1 }
        },
        salvageRewards: {
            Normal: { gold: 12, materials: [{ itemId: 'smithing_shard', count: 1 }] },
            Uncommon: { gold: 24, materials: [{ itemId: 'smithing_shard', count: 2 }] },
            Rare: { gold: 55, materials: [{ itemId: 'blessed_iron', count: 1 }] },
            Epic: { gold: 95, materials: [{ itemId: 'blessed_iron', count: 1 }, { itemId: 'seraph_ember', count: 1 }] }
        },
        recipes: [
            {
                id: 'rcp_pilgrim_lance',
                resultItemId: 'pilgrim_lance',
                costGold: 170,
                ingredients: [
                    { itemId: 'gray_dust', count: 3 },
                    { itemId: 'rat_tail', count: 2 },
                    { itemId: 'smithing_shard', count: 2 }
                ]
            },
            {
                id: 'rcp_pilgrim_hood',
                resultItemId: 'pilgrim_hood',
                costGold: 110,
                ingredients: [
                    { itemId: 'gray_dust', count: 3 },
                    { itemId: 'rat_tail', count: 1 }
                ]
            },
            {
                id: 'rcp_pilgrim_beads',
                resultItemId: 'pilgrim_beads',
                costGold: 120,
                ingredients: [
                    { itemId: 'gray_dust', count: 2 },
                    { itemId: 'ghost_dust', count: 1 }
                ]
            },
            {
                id: 'rcp_wooden_shield',
                resultItemId: 'wooden_shield',
                costGold: 140,
                ingredients: [
                    { itemId: 'gray_dust', count: 2 },
                    { itemId: 'rat_tail', count: 2 },
                    { itemId: 'smithing_shard', count: 1 }
                ]
            },
            {
                id: 'rcp_pilgrim_greaves',
                resultItemId: 'pilgrim_greaves',
                costGold: 190,
                ingredients: [
                    { itemId: 'snake_scale', count: 3 },
                    { itemId: 'frog_poison', count: 2 },
                    { itemId: 'smithing_shard', count: 2 }
                ]
            },
            {
                id: 'rcp_watcher_hood',
                resultItemId: 'watcher_hood',
                costGold: 360,
                ingredients: [
                    { itemId: 'tainted_moss', count: 3 },
                    { itemId: 'blessed_iron', count: 2 }
                ]
            },
            {
                id: 'rcp_oracle_pendant',
                resultItemId: 'oracle_pendant',
                costGold: 420,
                ingredients: [
                    { itemId: 'ghost_dust', count: 4 },
                    { itemId: 'blessed_iron', count: 2 },
                    { itemId: 'seraph_ember', count: 1 }
                ]
            }
        ]
    },

    /** 장착형 성물 (스킬트리와 별도, 1개 슬롯) — specials는 getPassiveBonuses에 합산 */
    relics: {
        relic_morning_dew: {
            id: 'relic_morning_dew',
            name: '이슬 맺힌 조각',
            grade: 'Common',
            desc: '기도가 맺힌 작은 성물. 적중 시 가끔 영력(PP)이 돌아옵니다.',
            specials: { ppOnHitChance: 0.07, ppOnHitAmount: 1 }
        },
        relic_ashen_rosary: {
            id: 'relic_ashen_rosary',
            name: '잿빛 묵주',
            grade: 'Common',
            desc: '마모된 기도구슬. 심장이 흔들릴 때 치명의 방향을 바로잡아 줍니다.',
            specials: { critChance: 0.03, ppOnHitChance: 0.06 }
        },
        relic_clay_token: {
            id: 'relic_clay_token',
            name: '점토 징표',
            grade: 'Common',
            desc: '아직 구워지지 않은 흙의 인장. 작은 기도가 스며들어 적중 시 희미한 영력을 돌려줍니다.',
            specials: { ppOnHitChance: 0.05, ppOnHitAmount: 1 }
        },
        relic_salt_crystal: {
            id: 'relic_salt_crystal',
            name: '소금 결정',
            grade: 'Common',
            desc: '바닷바람에 말린 소금 알. 상처 입은 살을 조용히 어루만집니다.',
            specials: { hpRegen: 4 }
        },
        relic_wind_charm: {
            id: 'relic_wind_charm',
            name: '바람 부적',
            grade: 'Common',
            desc: '허공에 매달린 얇은 끈. 한순간의 틈을 타고 공격을 비켜가게 합니다.',
            specials: { evadeChance: 0.025 }
        },
        relic_rust_flake: {
            id: 'relic_rust_flake',
            name: '녹슨 비늘',
            grade: 'Common',
            desc: '오래된 금속에서 떨어진 조각. 악의 기운을 희미하게 걸러 냅니다.',
            specials: { ailmentResist: 0.05 }
        },
        relic_folded_psalm: {
            id: 'relic_folded_psalm',
            name: '접힌 시편 조각',
            grade: 'Common',
            desc: '찢겨 다시 접힌 찬송 한 구절. 낡았지만 여전히 방향을 가리킵니다.',
            specials: { critChance: 0.02 }
        },
        relic_bent_iron: {
            id: 'relic_bent_iron',
            name: '휜 쇠못',
            grade: 'Common',
            desc: '한 번 맞고 휘어진 못. 불완전하지만 타격의 무게를 조금 더 실어 줍니다.',
            specials: { damageMul: 1.02 }
        },
        relic_twin_sigil: {
            id: 'relic_twin_sigil',
            name: '쌍날 인장',
            grade: 'Rare',
            desc: '잔광이 한 번 더 베어 가릅니다.',
            specials: { doubleStrikeChance: 0.06 }
        },
        relic_lantern_of_vow: {
            id: 'relic_lantern_of_vow',
            name: '서약의 등불',
            grade: 'Rare',
            desc: '흔들릴수록 더 밝아지는 등불. 전투 중 생명력과 평정을 유지합니다.',
            specials: { hpRegen: 7, turnStartCleanseChance: 0.05 }
        },
        relic_river_pebble: {
            id: 'relic_river_pebble',
            name: '강가의 조약돌',
            grade: 'Rare',
            desc: '물살에 다듬어진 돌. 흐름처럼 상처를 씻고 잔여의 불순물을 걷어 냅니다.',
            specials: { hpRegen: 5, turnStartCleanseChance: 0.03 }
        },
        relic_bramble_ring: {
            id: 'relic_bramble_ring',
            name: '가시덩굴 고리',
            grade: 'Rare',
            desc: '가시가 얽힌 고리. 받는 고통을 줄이고 속박에 맞섭니다.',
            specials: { damageTakenMul: 0.96, ailmentResist: 0.07 }
        },
        relic_echo_chime: {
            id: 'relic_echo_chime',
            name: '메아리 종',
            grade: 'Rare',
            desc: '울림이 한 번 더 이어지는 작은 종. 잔향이 공격과 기도를 함께 되돌립니다.',
            specials: { doubleStrikeChance: 0.04, ppOnHitChance: 0.06 }
        },
        relic_dusk_wrap: {
            id: 'relic_dusk_wrap',
            name: '황혼 붕대',
            grade: 'Rare',
            desc: '노을빛에 젖은 천 조각. 스며든 피를 조용히 되돌립니다.',
            specials: { lifeSteal: 0.03, critChance: 0.03 }
        },
        relic_well_spring: {
            id: 'relic_well_spring',
            name: '우물의 심장',
            grade: 'Epic',
            desc: '깊은 샘에서 흘러나온 회복의 기운.',
            specials: { ppOnHitChance: 0.12, ppOnHitAmount: 2 }
        },
        relic_judicator_feather: {
            id: 'relic_judicator_feather',
            name: '심판자 깃편',
            grade: 'Epic',
            desc: '가벼운 깃 하나가 무게 없는 심판을 불러옵니다.',
            specials: { critChance: 0.05, critDamageMul: 0.12 }
        },
        relic_fortress_psalm: {
            id: 'relic_fortress_psalm',
            name: '성채의 시편',
            grade: 'Epic',
            desc: '굴복하지 않는 찬송. 타격을 흘리고 생존을 굳힙니다.',
            specials: { damageTakenMul: 0.93, ailmentResist: 0.12, hpRegen: 10 }
        },
        relic_throne_spark: {
            id: 'relic_throne_spark',
            name: '왕좌의 불씨',
            grade: 'Epic',
            desc: '꺼지지 않는 왕좌의 잔광. 공격의 결을 더 날카롭게 세웁니다.',
            specials: { damageMul: 1.11, doubleStrikeChance: 0.08 }
        },
        relic_eclipse_tear: {
            id: 'relic_eclipse_tear',
            name: '일식의 눈물',
            grade: 'Epic',
            desc: '빛과 그림자가 만나는 순간 맺힌 눈물. 고통을 힘으로 바꿉니다.',
            specials: { lowHpDamageMul: 1.2, lifeSteal: 0.05, critChance: 0.04 }
        },
        relic_first_oath: {
            id: 'relic_first_oath',
            name: '첫 맹세의 조각',
            grade: 'Epic',
            desc: '처음 발화된 맹세의 파편. 파동 하나하나가 신성한 잔향을 남깁니다.',
            specials: { damageMul: 1.08, ppOnHitChance: 0.16, ppOnHitAmount: 2, critDamageMul: 0.1 }
        },
        relic_covenant_flame: {
            id: 'relic_covenant_flame',
            name: '언약의 불꽃',
            grade: 'Legendary',
            desc: '하늘과 땅을 잇는 맹세가 타오른 잔광. 공격의 결을 더 깊게 새깁니다.',
            specials: { damageMul: 1.14, critChance: 0.08, lifeSteal: 0.06, critDamageMul: 0.14 }
        },
        relic_veil_eternal: {
            id: 'relic_veil_eternal',
            name: '영원의 장막',
            grade: 'Legendary',
            desc: '시간 너머 펼쳐진 성소의 베일. 상처와 속박을 함께 걷어 냅니다.',
            specials: { damageTakenMul: 0.87, ailmentResist: 0.14, hpRegen: 14, turnStartCleanseChance: 0.08 }
        },
        relic_dawn_resonance: {
            id: 'relic_dawn_resonance',
            name: '여명의 공명',
            grade: 'Legendary',
            desc: '새벽 첫 빛이 맺힌 공명석. 연속된 일격과 기도가 하나로 울립니다.',
            specials: { doubleStrikeChance: 0.1, ppOnHitChance: 0.18, ppOnHitAmount: 2, damageMul: 1.1 }
        },
        relic_apotheosis_core: {
            id: 'relic_apotheosis_core',
            name: '신성화의 심핵',
            grade: 'Mythic',
            desc: '성스러운 불길이 응축된 핵. 전설의 한계를 넘어 공격의 본질에 닿습니다.',
            specials: { damageMul: 1.26, critChance: 0.13, critDamageMul: 0.26, lifeSteal: 0.09 }
        },
        relic_pantheon_aegis: {
            id: 'relic_pantheon_aegis',
            name: '만신전의 방패',
            grade: 'Mythic',
            desc: '수많은 성좌의 맹세가 겹쳐진 방벽. 세상의 상처를 끊고 굴복을 거부합니다.',
            specials: { damageTakenMul: 0.76, ailmentResist: 0.2, hpRegen: 22, turnStartCleanseChance: 0.12, evadeChance: 0.06 }
        },
        relic_edict_starfall: {
            id: 'relic_edict_starfall',
            name: '성운 낙하의 율령',
            grade: 'Mythic',
            desc: '별이 규칙처럼 쏟아질 때 선포된 율. 연속 타격·영력·절망 속의 힘이 하나의 궤적이 됩니다.',
            specials: { doubleStrikeChance: 0.13, ppOnHitChance: 0.25, ppOnHitAmount: 3, damageMul: 1.22, lowHpDamageMul: 1.18 }
        }
    },

    /** 성물 상인 기능 제거: 성물 획득은 시설 > 성물 소환으로 통합 */
    relicShops: {},

    /** 성물 가챠 설정 (혼합 재화: 골드 + 달란트) */
    relicGacha: {
        maxRelicLevel: 10,
        talentDrop: {
            field: {
                // 일반 몬스터: 극악 확률로 0.01~0.1 달란트 획득
                chanceByTier: { 1: 0.003, 2: 0.0045, 3: 0.006, 4: 0.0075, 5: 0.009, 6: 0.0105, 7: 0.012 },
                min: 0.01,
                max: 0.1
            },
            boss: {
                // 보스: enemyPowerTier 1~7 기준 0.1~1.0 구간
                amountByTier: { 1: 0.1, 2: 0.25, 3: 0.4, 4: 0.55, 5: 0.7, 6: 0.85, 7: 1.0 }
            }
        },
        levelScaling: {
            perLevel: {
                ppOnHitChance: 0.08,
                ppOnHitAmount: 0.35,
                doubleStrikeChance: 0.1,
                critChance: 0.08,
                critDamageMul: 0.12,
                lifeSteal: 0.12,
                hpRegen: 0.16,
                turnStartCleanseChance: 0.1,
                ailmentResist: 0.1,
                evadeChance: 0.1,
                damageMul: 0.2,
                damageTakenMul: 0.12,
                lowHpDamageMul: 0.18
            },
            caps: {
                ppOnHitChance: 0.35,
                ppOnHitAmount: 6,
                doubleStrikeChance: 0.3,
                critChance: 0.4,
                critDamageMul: 0.9,
                lifeSteal: 0.3,
                hpRegen: 80,
                turnStartCleanseChance: 0.4,
                ailmentResist: 0.45,
                evadeChance: 0.35,
                damageMul: 1.8,
                damageTakenMul: 0.72,
                lowHpDamageMul: 2.1
            }
        },
        normal: {
            goldCost: 1000,
            tenPullGoldCost: 9000,
            gradeRates: { Common: 0.802, Rare: 0.135, Epic: 0.055, Legendary: 0.008 },
            poolByGrade: {
                Common: [
                    'relic_morning_dew', 'relic_ashen_rosary', 'relic_clay_token', 'relic_salt_crystal',
                    'relic_wind_charm', 'relic_rust_flake', 'relic_folded_psalm', 'relic_bent_iron'
                ],
                Rare: [
                    'relic_twin_sigil', 'relic_lantern_of_vow', 'relic_river_pebble', 'relic_bramble_ring',
                    'relic_echo_chime', 'relic_dusk_wrap'
                ],
                Epic: ['relic_well_spring', 'relic_judicator_feather', 'relic_fortress_psalm', 'relic_throne_spark', 'relic_eclipse_tear', 'relic_first_oath'],
                Legendary: ['relic_covenant_flame', 'relic_veil_eternal', 'relic_dawn_resonance']
            }
        },
        premium: {
            tokenCost: 10,
            tenPullTokenCost: 100,
            gradeRates: { Common: 0.415, Rare: 0.371, Epic: 0.142, Legendary: 0.055, Mythic: 0.017 },
            pity: { every: 20, guaranteedGrade: 'Epic' },
            poolByGrade: {
                Common: [
                    'relic_morning_dew', 'relic_ashen_rosary', 'relic_clay_token', 'relic_salt_crystal',
                    'relic_wind_charm', 'relic_rust_flake', 'relic_folded_psalm', 'relic_bent_iron'
                ],
                Rare: [
                    'relic_twin_sigil', 'relic_lantern_of_vow', 'relic_river_pebble', 'relic_bramble_ring',
                    'relic_echo_chime', 'relic_dusk_wrap'
                ],
                Epic: ['relic_well_spring', 'relic_judicator_feather', 'relic_fortress_psalm', 'relic_throne_spark', 'relic_eclipse_tear', 'relic_first_oath'],
                Legendary: ['relic_covenant_flame', 'relic_veil_eternal', 'relic_dawn_resonance'],
                Mythic: ['relic_apotheosis_core', 'relic_pantheon_aegis', 'relic_edict_starfall']
            }
        }
    },

    shops: {
        pishon: [
            { itemId: 'wooden_sword', price: 60 },
            { itemId: 'ragged_cloak', price: 50 },
            { itemId: 'straw_shoes', price: 45 },
            { itemId: 'pilgrim_hood', price: 55 },
            { itemId: 'pilgrim_beads', price: 70 },
            { itemId: 'wooden_shield', price: 75 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 240 },
            { itemId: 'seraph_ember', price: 560 },
            { itemId: 'pilgrim_lance', price: 140 }
        ],
        gihon: [
            { itemId: 'bronze_sword', price: 180 },
            { itemId: 'leather_vest', price: 170 },
            { itemId: 'prayer_ring', price: 210 },
            { itemId: 'wooden_shield', price: 160 },
            { itemId: 'pilgrim_greaves', price: 260 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 220 },
            { itemId: 'seraph_ember', price: 560 }
        ],
        hidekel: [
            { itemId: 'steel_longsword', price: 520 },
            { itemId: 'swamp_leather', price: 480 },
            { itemId: 'ember_necklace', price: 560 },
            { itemId: 'covenant_shield', price: 600 },
            { itemId: 'watcher_hood', price: 630 },
            { itemId: 'oracle_pendant', price: 720 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 220 },
            { itemId: 'seraph_ember', price: 540 }
        ],
        euphrates: [
            { itemId: 'river_trident', price: 860 },
            { itemId: 'dusk_plate', price: 980 },
            { itemId: 'mirror_buckler', price: 770 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 280 },
            { itemId: 'seraph_ember', price: 520 }
        ],
        eden_core: [
            { itemId: 'halo_boots', price: 1320 },
            { itemId: 'oath_diadem', price: 1280 },
            { itemId: 'relic_talisman', price: 1390 },
            { itemId: 'aegis_core', price: 1500 },
            { itemId: 'throne_fragment', price: 780 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 300 },
            { itemId: 'seraph_ember', price: 520 }
        ],
        periphery: [
            { itemId: 'border_reliquary', price: 680 },
            { itemId: 'oath_diadem', price: 1360 },
            { itemId: 'relic_talisman', price: 1420 },
            { itemId: 'aegis_core', price: 1540 },
            { itemId: 'dusk_plate', price: 1180 },
            { itemId: 'throne_fragment', price: 820 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 310 },
            { itemId: 'seraph_ember', price: 510 }
        ],
        void_remnant: [
            { itemId: 'void_sliver', price: 740 },
            { itemId: 'guardian_halo', price: 1680 },
            { itemId: 'hydra_fang_blade', price: 1750 },
            { itemId: 'aegis_core', price: 1580 },
            { itemId: 'relic_talisman', price: 1450 },
            { itemId: 'guardian_oath', price: 920 },
            { itemId: 'smithing_shard', price: 45 },
            { itemId: 'blessed_iron', price: 320 },
            { itemId: 'seraph_ember', price: 500 }
        ]
    }
};

/** implementation_plan_14: 공통 메타(js/data/constants.js)와 동기화 (함수는 GAME_DATA_META에만 두고 meta는 JSON 직렬화 가능 필드만) */
(function assignMeta() {
    const M = (typeof window !== 'undefined' && window.GAME_DATA_META) || null;
    const fallback = {
        monsterGradeOrder: ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
        itemGrades: ['Normal', 'Uncommon', 'Rare', 'Epic'],
        equipmentSlots: ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'offhand'],
        playerSkillTypes: ['attack', 'buff'],
        itemKinds: ['material', 'equipment']
    };
    const src = M || fallback;
    GAME_DATA.meta = {
        monsterGradeOrder: src.monsterGradeOrder,
        itemGrades: src.itemGrades,
        equipmentSlots: src.equipmentSlots,
        playerSkillTypes: src.playerSkillTypes,
        itemKinds: src.itemKinds
    };
})();

if (typeof window !== 'undefined') {
    window.GAME_DATA = GAME_DATA;
}
