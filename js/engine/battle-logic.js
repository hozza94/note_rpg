/**
 * 전투 수치 전용 (DOM·GameEngine 의존 없음). battle.js에서 호출한다.
 */
(function (global) {
    const BattleLogic = {
        calculateDamage(atk, def) {
            const base = atk * (100 / (100 + def));
            const random = 0.9 + Math.random() * 0.2;
            return base * random;
        },

        /**
         * HP 비율에 따라 default 풀 vs 저HP 풀 선택 (몬스터 스킬트리·보스 bossActiveLowHp 공통)
         * @param {number} hpRatio monster.hp / monster.maxHp
         * @param {{ skillIds: string[], weights?: number[] }} defaultPool
         * @param {{ threshold?: number, skillIds: string[], weights?: number[] }|null|undefined} lowHp
         */
        pickSkillPoolByHpRatio(hpRatio, defaultPool, lowHp) {
            if (lowHp && Array.isArray(lowHp.skillIds) && lowHp.skillIds.length > 0 && hpRatio < (lowHp.threshold ?? 0.4)) {
                return { skillIds: lowHp.skillIds, weights: lowHp.weights };
            }
            return { skillIds: defaultPool.skillIds, weights: defaultPool.weights };
        },

        /**
         * 신앙 보정까지 적용된 피해에, 플레이어 공통 배율(피해량·저HP·치명)만 적용한다.
         * @param {number} dmgAfterFaith applyFaithBonusDamage 이후 값
         */
        applyPlayerPhysicalLayersAfterFaith(dmgAfterFaith, combined, playerHpFraction, isCrit) {
            let d = dmgAfterFaith;
            d *= combined.damageMul;
            if (playerHpFraction <= 0.5) d *= combined.lowHpDamageMul;
            if (isCrit) d *= (combined.critDamageMul || 1.5);
            return Math.round(d);
        }
    };

    const w = global.window || global;
    w.BattleLogic = BattleLogic;
})(typeof globalThis !== 'undefined' ? globalThis : this);
