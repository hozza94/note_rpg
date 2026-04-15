/** 강화·아이템 스탯·상점 한줄 요약 (리팩터링: game.js 분리) */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        getMaxEnhanceLevelForItem(itemId) {
            if (itemId && this.isBossExclusiveItem(itemId)) {
                return Number(window.GAME_DATA?.smithing?.bossMaxEnhanceLevel || 30);
            }
            const item = itemId && window.GAME_DATA?.items?.[itemId];
            const grade = item?.grade || 'Normal';
            const caps = window.GAME_DATA?.smithing?.gradeMaxEnhance;
            if (caps && typeof caps[grade] === 'number') return caps[grade];
            return Number(window.GAME_DATA?.smithing?.maxEnhanceLevel || 20);
        }
,
        getItemEnhanceLevel(itemId) {
            if (!itemId) return 0;
            const lv = Number(this.state.player.itemEnhance?.[itemId] || 0);
            const max = this.getMaxEnhanceLevelForItem(itemId);
            return Math.max(0, Math.min(max, lv));
        }
,
        getItemFinalStats(itemId, itemData = null) {
            const item = itemData || window.GAME_DATA.items[itemId];
            if (!item || !item.stats) return null;
            const level = this.getItemEnhanceLevel(itemId);
            if (level <= 0) return { ...item.stats };
            const smith = window.GAME_DATA?.smithing || {};
            const rates = (itemId && this.isBossExclusiveItem(itemId) && Array.isArray(smith.bossEnhanceRates))
                ? smith.bossEnhanceRates
                : (smith.enhanceRates || [0]);
            const rate = Number(rates[level] || 0);
            const out = {};
            const lifeStealMaxMultiplier = 2.5; // 요청 기준: 생명력 흡수는 최대 2.5배까지만 강화 반영
            Object.entries(item.stats).forEach(([k, v]) => {
                const base = Number(v || 0);
                if (k === 'lifeSteal' && base > 0) {
                    const scaled = base * (1 + Math.max(0, rate));
                    const capped = Math.min(base * lifeStealMaxMultiplier, scaled);
                    out[k] = Math.max(0, Number(capped.toFixed(4)));
                    return;
                }
                const scaled = Math.floor(Math.abs(base) * rate);
                // 소수 비율 스탯(예: 0.04)은 +1 최소 보정을 적용하면 과도하게 커지므로 제외
                const needsMinOne = Math.abs(base) >= 1;
                const bonus = (rate > 0 && base !== 0)
                    ? (needsMinOne ? Math.max(1, scaled) : scaled)
                    : scaled;
                out[k] = base + (base >= 0 ? bonus : -bonus);
            });
            return out;
        }
,
        getItemComputedBonuses(itemId, itemData = null) {
            const item = itemData || window.GAME_DATA.items[itemId];
            if (!item) return null;
            const stats = this.getItemFinalStats(itemId, item) || {};
            const specials = item.specials || {};
            const out = { ...stats };
            // 특수 옵션은 강화 배율과 별개로 원본 수치 그대로 합산
            if (typeof specials.hpRegen === 'number') out.hpRegen = (out.hpRegen || 0) + specials.hpRegen;
            if (typeof specials.lifeSteal === 'number') out.lifeSteal = (out.lifeSteal || 0) + specials.lifeSteal;
            if (typeof specials.critChance === 'number') out.critChance = (out.critChance || 0) + specials.critChance;
            if (typeof specials.critDamageMul === 'number') out.critDamageMul = (out.critDamageMul || 0) + specials.critDamageMul;
            return out;
        }
,
        getItemDisplayName(itemId, itemData = null) {
            const item = itemData || window.GAME_DATA.items[itemId];
            if (!item) return '';
            const slotIconMap = {
                weapon: '⚔️',
                armor: '🛡️',
                helmet: '🪖',
                accessory: '🎗️',
                boots: '🥾',
                offhand: '🧿'
            };
            const lv = this.getItemEnhanceLevel(itemId);
            const maxEn = this.getMaxEnhanceLevelForItem(itemId);
            const flair = lv >= (maxEn >= 30 ? 22 : 16) ? '✹ ' : lv >= (maxEn >= 30 ? 10 : 8) ? '✦ ' : '';
            const slotIcon = item.slot ? `${slotIconMap[item.slot] || '📦'} ` : '';
            return lv > 0 ? `${slotIcon}${flair}${item.name} +${lv}` : `${slotIcon}${item.name}`;
        }
,
        isBossExclusiveItem(itemId) {
            if (!itemId) return false;
            const tables = window.GAME_DATA?.bossExclusiveDropTables || {};
            return Object.values(tables).some(list =>
                Array.isArray(list) && list.some(drop => drop?.itemId === itemId)
            );
        },

        /** itemId가 있으면 보스 전용(+30)과 일반 상한에 맞춰 피크/하이 임계값을 구분한다 */
        getEnhanceVisualClass(level, itemId) {
            const lv = Number(level || 0);
            const max = itemId ? this.getMaxEnhanceLevelForItem(itemId) : 20;
            const peakAt = max >= 30 ? 22 : 16;
            const highAt = max >= 30 ? 10 : 8;
            if (lv >= peakAt) return 'enhance-peak';
            if (lv >= highAt) return 'enhance-high';
            if (lv >= 4) return 'enhance-mid';
            return '';
        }
,
        getInventoryCount(itemId) {
            const row = this.inventory.items.find(i => i.id === itemId);
            return row ? row.count : 0;
        }
,
        getSmithableEquipmentItemIds() {
            return Object.keys(window.GAME_DATA.items).filter(id => {
                const item = window.GAME_DATA.items[id];
                return !!(item?.slot && item.smithable !== false);
            });
        },

        /** 상점·UI용: 장비 슬롯·스탯을 한 줄 요약 문자열로 */
        formatShopItemDetails(item, itemId = null) {
            if (!item) return '';
            const slotKo = {
                weapon: '무기',
                armor: '갑옷',
                helmet: '투구',
                accessory: '장신구',
                boots: '신발',
                offhand: '보조장비'
            };
            const statKo = {
                atk: '공격',
                def: '방어',
                hp: 'HP',
                pp: 'PP',
                spd: '속도',
                faith: '신앙',
                hpRegen: '체력재생',
                lifeSteal: '생명력흡수'
            };
            const parts = [];
            if (item.slot) parts.push(`[${slotKo[item.slot] || item.slot}]`);
            const stats = itemId ? this.getItemFinalStats(itemId, item) : item.stats;
            if (stats && Object.keys(stats).length > 0) {
                const statStr = Object.entries(stats)
                    .map(([k, v]) => {
                        const label = statKo[k] !== undefined ? statKo[k] : k;
                        const sign = Number(v) > 0 ? '+' : '';
                        if (k === 'lifeSteal' || k === 'critChance') {
                            return `${label} ${sign}${Math.round(Number(v) * 100)}%`;
                        }
                        if (k === 'critDamageMul') {
                            return `${label} ${sign}${Math.round(Number(v) * 100)}%`;
                        }
                        return `${label} ${sign}${v}`;
                    })
                    .join(' · ');
                if (itemId) {
                    const lv = this.getItemEnhanceLevel(itemId);
                    if (lv > 0) parts.push(`강화 +${lv}`);
                }
                parts.push(statStr);
            } else if (!item.slot) {
                parts.push('재료 · 전리품');
            }
            if (item.specials) {
                const specialParts = [];
                if (typeof item.specials.lifeSteal === 'number') specialParts.push(`생명력흡수 +${Math.round(item.specials.lifeSteal * 100)}%`);
                if (typeof item.specials.critChance === 'number') specialParts.push(`치명타확률 +${Math.round(item.specials.critChance * 100)}%`);
                if (typeof item.specials.critDamageMul === 'number') specialParts.push(`치명타피해 +${Math.round(item.specials.critDamageMul * 100)}%`);
                if (typeof item.specials.hpRegen === 'number') specialParts.push(`체력재생 +${item.specials.hpRegen}`);
                if (specialParts.length) parts.push(specialParts.join(' · '));
            }
            return parts.join(' ');
        }
,
        formatSingleEquipBonusText(value) {
            const n = Number(value) || 0;
            const sign = n > 0 ? '+' : '';
            return `${sign}${n}`;
        }
,
        formatEquipmentBonusSummary(bonuses) {
            const statKo = {
                atk: '공격',
                def: '방어',
                hp: 'HP',
                pp: 'PP',
                spd: '속도',
                faith: '신앙',
                hpRegen: '체력재생',
                lifeSteal: '생명력흡수'
            };
            const parts = Object.entries(statKo)
                .map(([key, label]) => {
                    const n = Number(bonuses?.[key] || 0);
                    if (!n) return null;
                    const sign = n > 0 ? '+' : '';
                    return `${label} ${sign}${n}`;
                })
                .filter(Boolean);
            return parts.length ? parts.join(' · ') : '없음';
        }
    });
})();
