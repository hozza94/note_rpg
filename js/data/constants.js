/**
 * 게임 데이터 공통 메타 (implementation_plan_14 Phase 1)
 * data.js보다 먼저 로드되어 window.GAME_DATA_META에 등록된다.
 */
(function (global) {
    const GAME_DATA_META = {
        /** 몬스터 등급 (약한 순). explore 필터·가중치·검증 공통 */
        monsterGradeOrder: ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
        /** 아이템 등급 (재료·장비 공통 표기) */
        itemGrades: ['Normal', 'Uncommon', 'Rare', 'Epic'],
        /** 장비 슬롯 (inventory.equipment 키와 일치) */
        equipmentSlots: ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'offhand'],
        /** 플레이어 액티브 스킬 타입 */
        playerSkillTypes: ['attack', 'buff'],
        /** 아이템 kind (Phase 2) */
        itemKinds: ['material', 'equipment']
    };

    /**
     * regions.enemyPowerTier(1~7) 기준 보스 패시브·액티브 슬롯 수 (2~5).
     * validate-game-data.mjs 와 동일 공식 — 변경 시 한곳만 수정한다.
     */
    function bossSkillSlotCountFromEnemyPowerTier(tier) {
        const t = Math.max(1, Math.min(7, Number(tier) || 1));
        return 2 + Math.min(3, Math.floor((t - 1) * 3 / 6));
    }

    GAME_DATA_META.bossSkillSlotCountFromEnemyPowerTier = bossSkillSlotCountFromEnemyPowerTier;

    const w = global.window || (global.window = {});
    w.GAME_DATA_META = GAME_DATA_META;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { GAME_DATA_META };
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
