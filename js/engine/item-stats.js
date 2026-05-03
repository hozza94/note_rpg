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
            let rate = Number(rates[level] || 0);
            if (itemId && this.isBossExclusiveItem(itemId)) {
                const tier = this.getItemBossEquipTier(itemId);
                rate *= this.getBossEquipTierEnhanceMultiplier(tier);
            }
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

        /** 보스 전용 드랍 테이블 키 → 장비 등급(지역 진행도). 강화 효율 가산에 사용 */
        getBossDropTableEquipTier(bossId) {
            const map = {
                wraith: 1,
                mud_giant: 2,
                stone_seraph: 3,
                abyss_hydra: 4,
                throne_guardian: 5,
                border_warden: 6,
                void_sovereign: 7,
                beelzebub: 8,
                astaroth: 9,
                lucifer: 10,
                twilight_arbiter: 11
            };
            return map[bossId] || 0;
        },

        /** 보스 전용 장비의 현재 장비 등급(세이브 상 최고 출처 vs 데이터 기본 equipTier 중 큰 값) */
        getItemBossEquipTier(itemId) {
            if (!itemId) return 1;
            const item = window.GAME_DATA?.items?.[itemId];
            const defTier = Math.max(1, Math.floor(Number(item?.equipTier) || 1));
            const st = Number(this.state.player?.itemEquipTier?.[itemId]);
            if (Number.isFinite(st) && st >= 1) return Math.max(defTier, Math.floor(st));
            return defTier;
        },

        /** 등급 1 = 1.0, 이후 (tier-1) * bossEquipTierEnhanceStep 만큼 강화 누적배율 추가 가산 */
        getBossEquipTierEnhanceMultiplier(tier) {
            const t = Math.max(1, Math.floor(Number(tier) || 1));
            const step = Number(window.GAME_DATA?.smithing?.bossEquipTierEnhanceStep);
            const s = Number.isFinite(step) && step > 0 ? step : 0.076;
            return 1 + (t - 1) * s;
        },

        /** 보스 전용 드랍 획득 시 장비 등급 기록(동일 itemId는 더 높은 보스에서 드랍 시 상향) */
        recordBossDropEquipTier(itemId, bossId) {
            if (!itemId || !bossId) return;
            const item = window.GAME_DATA?.items?.[itemId];
            if (!item?.slot || !item.stats) return;
            if (!this.isBossExclusiveItem(itemId)) return;
            const dropTier = this.getBossDropTableEquipTier(bossId);
            if (!dropTier) return;
            if (!this.state.player.itemEquipTier || typeof this.state.player.itemEquipTier !== 'object') {
                this.state.player.itemEquipTier = {};
            }
            const prev = Number(this.state.player.itemEquipTier[itemId]) || 0;
            this.state.player.itemEquipTier[itemId] = Math.max(prev, dropTier);
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
                    if (this.isBossExclusiveItem(itemId) && item.slot) {
                        const et = this.getItemBossEquipTier(itemId);
                        parts.push(`장비등급 ${et}`);
                    }
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
                lifeSteal: '생명력흡수',
                critChance: '치명타확률',
                critDamageMul: '치명타피해'
            };
            /** 내부는 0~1 비율(또는 치명피해 가산 분수) — UI는 %로 표기 */
            const ratioAsPercentKeys = new Set(['lifeSteal', 'critChance', 'critDamageMul']);
            const parts = Object.entries(statKo)
                .map(([key, label]) => {
                    const n = Number(bonuses?.[key] || 0);
                    if (!n) return null;
                    if (ratioAsPercentKeys.has(key)) {
                        const pct = Math.round(n * 100);
                        if (pct === 0) return null;
                        return `${label} ${pct > 0 ? '+' : ''}${pct}%`;
                    }
                    const sign = n > 0 ? '+' : '';
                    return `${label} ${sign}${n}`;
                })
                .filter(Boolean);
            return parts.length ? parts.join(' · ') : '없음';
        }
    });
})();
