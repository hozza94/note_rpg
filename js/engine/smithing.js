/**
 * Basileia - Smithing Domain Module
 * GameEngine의 대장간 관련 메서드를 분리 관리한다.
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        openBlacksmithModal(tab = 'enhance', options = {}) {
            if (this.state.battle) {
                this.showToast("전투 중에는 대장간을 이용할 수 없습니다.", "warn");
                return;
            }
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const smithing = window.GAME_DATA.smithing || {};
            const tabs = [
                { id: 'enhance', label: '강화' },
                { id: 'salvage', label: '분해' },
                { id: 'craft', label: '제작' }
            ];
            this.blacksmithTab = tab;
            const currentTab = tabs.find(t => t.id === tab) ? tab : 'enhance';
            const fromFacility = !!options.fromFacility;
            this.blacksmithFromFacility = fromFacility;
            const body = currentTab === 'enhance'
                ? this.renderBlacksmithEnhanceBody()
                : currentTab === 'salvage'
                    ? this.renderBlacksmithSalvageBody()
                    : this.renderBlacksmithCraftBody();
            content.style.width = '700px';
            content.style.maxWidth = '95vw';
            content.innerHTML = `
                ${this.renderModalTopBar('🔨 대장간', { showBack: fromFacility })}
                <p style="font-size:0.82rem; color:#b0bec5; margin-bottom:10px;">
                    대장장이 레벨 ${this.state.player.smithLevel || 1} · 등급별 강화 상한 일반 +10 · 고급 +14 · 희귀 +17 · 에픽 +20 · 보스 전용 +30 · 보유 골드 ${this.state.player.gold}G
                </p>
                <div class="smith-tabs">
                    ${tabs.map(t => `<button class="action-btn small ${t.id === currentTab ? 'primary' : ''}" data-smith-tab="${t.id}">${t.label}</button>`).join('')}
                </div>
                <div class="smith-body">${body}</div>
            `;
            modal.classList.remove('hidden');
            this.bindModalTopBarActions(content, {
                onBack: () => this.renderFacilityHub()
            });
            const restoreScrollTop = Number(options?.restoreScrollTop || 0);
            if (restoreScrollTop > 0) {
                const bodyEl = content.querySelector('.smith-body');
                if (bodyEl) {
                    requestAnimationFrame(() => {
                        bodyEl.scrollTop = restoreScrollTop;
                    });
                }
            }

            content.querySelectorAll('[data-smith-tab]').forEach(btn => {
                btn.addEventListener('click', () => this.openBlacksmithModal(btn.getAttribute('data-smith-tab'), options));
            });
            content.querySelectorAll('[data-smith-enhance]').forEach(btn => {
                btn.addEventListener('click', () => this.tryEnhanceItem(btn.getAttribute('data-smith-enhance')));
            });
            content.querySelectorAll('[data-smith-salvage]').forEach(btn => {
                btn.addEventListener('click', () => this.salvageItem(btn.getAttribute('data-smith-salvage')));
            });
            content.querySelector('[data-smith-salvage-all]')?.addEventListener('click', () => this.salvageAllInventoryItems());
            content.querySelectorAll('[data-smith-craft]').forEach(btn => {
                btn.addEventListener('click', () => this.craftRecipe(btn.getAttribute('data-smith-craft')));
            });
        },

        renderBlacksmithEnhanceBody() {
            const smithing = window.GAME_DATA.smithing || {};
            const gradeCost = smithing.gradeCost || {};
            const itemIds = this.getSmithableEquipmentItemIds()
                .filter(id => this.getInventoryCount(id) > 0 || Object.values(this.inventory.equipment).includes(id));

            if (itemIds.length === 0) {
                return '<div class="empty-msg">강화 가능한 장비가 없습니다.</div>';
            }

            return itemIds.map(itemId => {
                const item = window.GAME_DATA.items[itemId];
                const lv = this.getItemEnhanceLevel(itemId);
                const maxLv = this.getMaxEnhanceLevelForItem(itemId);
                const nextLv = Math.min(maxLv, lv + 1);
                const isMax = lv >= maxLv;
                const costRule = gradeCost[item.grade] || gradeCost.Normal || { gold: 40, materialId: 'smithing_shard', materialCount: 1 };
                const goldCost = Math.round((costRule.gold || 40) * (1 + lv * 0.55));
                const matCount = Math.max(1, Math.round((costRule.materialCount || 1) * (1 + lv * 0.35)));
                const successRates = this.isBossExclusiveItem(itemId)
                    ? (smithing.bossSuccessRates || smithing.successRates || [])
                    : (smithing.successRates || [1, 1, 1, 1, 0.8, 0.65]);
                const successRate = isMax ? 0 : Number(successRates[lv] ?? 0.04);
                const canPay = this.state.player.gold >= goldCost && this.getInventoryCount(costRule.materialId) >= matCount;
                const disabled = isMax || !canPay ? 'disabled' : '';
                const statPreview = this.getEnhancePreviewText(itemId, lv, nextLv);
                return `
                    <div class="equip-choice-row ${item.grade.toLowerCase()} ${this.getEnhanceVisualClass(lv, itemId)} ${this.isBossExclusiveItem(itemId) ? 'boss-exclusive' : ''}">
                        <div class="main">
                            <div class="name">${this.getItemDisplayName(itemId, item)} <span class="count">보유 x${this.getInventoryCount(itemId)}${Object.values(this.inventory.equipment).includes(itemId) ? ' · 장착중' : ''}</span></div>
                            <div class="effect">${this.formatShopItemDetails(item, itemId)}</div>
                            <div class="desc">${statPreview}</div>
                            <div class="desc">비용: ${goldCost}G + ${window.GAME_DATA.items[costRule.materialId]?.name || costRule.materialId} x${matCount} · 성공률 ${(successRate * 100).toFixed(0)}%</div>
                        </div>
                        <button class="action-btn small primary" data-smith-enhance="${itemId}" ${disabled}>강화</button>
                    </div>
                `;
            }).join('');
        },

        renderBlacksmithSalvageBody() {
            const smithable = this.getSmithableEquipmentItemIds().filter(id => this.getInventoryCount(id) > 0);
            if (smithable.length === 0) {
                return '<div class="empty-msg">분해할 장비가 가방에 없습니다.</div>';
            }
            const totalCount = smithable.reduce((acc, itemId) => acc + this.getInventoryCount(itemId), 0);
            return `
                <div class="smith-salvage-all-row" style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;">
                    <div style="font-size:0.82rem; color:#b0bec5;">가방 내 분해 가능 장비 ${totalCount}개</div>
                    <button class="action-btn small danger" data-smith-salvage-all>인벤토리 전체 분해</button>
                </div>
                ${smithable.map(itemId => {
                const item = window.GAME_DATA.items[itemId];
                const reward = this.getSalvageReward(itemId);
                const rewardText = reward.materials.map(m => `${window.GAME_DATA.items[m.itemId]?.name || m.itemId} x${m.count}`).join(' · ');
                return `
                    <div class="equip-choice-row ${item.grade.toLowerCase()} ${this.getEnhanceVisualClass(this.getItemEnhanceLevel(itemId), itemId)} ${this.isBossExclusiveItem(itemId) ? 'boss-exclusive' : ''}">
                        <div class="main">
                            <div class="name">${this.getItemDisplayName(itemId, item)} <span class="count">보유 x${this.getInventoryCount(itemId)}</span></div>
                            <div class="effect">${this.formatShopItemDetails(item, itemId)}</div>
                            <div class="desc">분해 보상: ${reward.gold}G${rewardText ? ` · ${rewardText}` : ''}</div>
                        </div>
                        <button class="action-btn small secondary" data-smith-salvage="${itemId}">분해</button>
                    </div>
                `;
                }).join('')}
            `;
        },

        renderBlacksmithCraftBody() {
            const recipes = window.GAME_DATA.smithing?.recipes || [];
            if (recipes.length === 0) {
                return '<div class="empty-msg">등록된 제작식이 없습니다.</div>';
            }
            return recipes.map(recipe => {
                const resultItem = window.GAME_DATA.items[recipe.resultItemId];
                if (!resultItem) return '';
                const lacksGold = this.state.player.gold < (recipe.costGold || 0);
                const lacksMat = (recipe.ingredients || []).some(mat => this.getInventoryCount(mat.itemId) < mat.count);
                const disabled = lacksGold || lacksMat ? 'disabled' : '';
                const ingText = (recipe.ingredients || []).map(mat => {
                    const own = this.getInventoryCount(mat.itemId);
                    const ok = own >= mat.count;
                    return `${window.GAME_DATA.items[mat.itemId]?.name || mat.itemId} ${own}/${mat.count}${ok ? '' : ' 부족'}`;
                }).join(' · ');
                return `
                    <div class="equip-choice-row ${resultItem.grade.toLowerCase()} ${this.getEnhanceVisualClass(this.getItemEnhanceLevel(recipe.resultItemId), recipe.resultItemId)} ${this.isBossExclusiveItem(recipe.resultItemId) ? 'boss-exclusive' : ''}">
                        <div class="main">
                            <div class="name">${this.getItemDisplayName(recipe.resultItemId, resultItem)}</div>
                            <div class="effect">${this.formatShopItemDetails(resultItem, recipe.resultItemId)}</div>
                            <div class="desc">재료: ${ingText}</div>
                            <div class="desc">비용: ${recipe.costGold || 0}G</div>
                        </div>
                        <button class="action-btn small primary" data-smith-craft="${recipe.id}" ${disabled}>제작</button>
                    </div>
                `;
            }).join('');
        },

        getEnhancePreviewText(itemId, currentLv, nextLv) {
            const item = window.GAME_DATA.items[itemId];
            if (!item?.stats) return '강화 가능한 스탯이 없습니다.';
            const curStats = this.getItemFinalStats(itemId, item);
            const max = this.getMaxEnhanceLevelForItem(itemId);
            if (currentLv >= max) return '최대 강화 단계에 도달했습니다.';
            const backup = this.state.player.itemEnhance[itemId] || 0;
            this.state.player.itemEnhance[itemId] = nextLv;
            const nextStats = this.getItemFinalStats(itemId, item);
            this.state.player.itemEnhance[itemId] = backup;
            const isPercentStat = (key) => key === 'lifeSteal' || key === 'critChance' || key === 'critDamageMul';
            const formatStatValue = (key, value) => {
                const n = Number(value || 0);
                if (isPercentStat(key)) {
                    const pct = n * 100;
                    const rounded = Math.round(pct * 10) / 10; // 소수 1자리까지만 노출
                    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
                }
                return `${Math.round(n * 100) / 100}`;
            };
            return Object.keys(item.stats).map(k => {
                const label = { atk: '공격', def: '방어', hp: 'HP', pp: 'PP', spd: '속도', faith: '신앙', hpRegen: '체력재생', lifeSteal: '생명력흡수' }[k] || k;
                const before = Number(curStats?.[k] || 0);
                const after = Number(nextStats?.[k] || 0);
                const diff = after - before;
                const sign = diff > 0 ? '+' : '';
                const beforeText = formatStatValue(k, before);
                const afterText = formatStatValue(k, after);
                const diffText = formatStatValue(k, Math.abs(diff));
                return `${label} ${beforeText}→${afterText}${diff ? ` (${sign}${diffText})` : ''}`;
            }).join(' · ');
        },

        getSalvageReward(itemId) {
            const item = window.GAME_DATA.items[itemId];
            const table = window.GAME_DATA.smithing?.salvageRewards || {};
            const base = table[item?.grade] || table.Normal || { gold: 10, materials: [] };
            const lv = this.getItemEnhanceLevel(itemId);
            return {
                gold: Math.round((base.gold || 0) + lv * 12),
                materials: (base.materials || []).map(m => ({ ...m, count: m.count + (lv >= 3 ? 1 : 0) }))
            };
        },

        tryEnhanceItem(itemId) {
            const item = window.GAME_DATA.items[itemId];
            if (!item || !item.slot) return;
            const smithing = window.GAME_DATA.smithing || {};
            const maxLv = this.getMaxEnhanceLevelForItem(itemId);
            const level = this.getItemEnhanceLevel(itemId);
            if (level >= maxLv) {
                this.showToast("이미 최대 강화 단계입니다.", "warn");
                return;
            }
            const rule = (smithing.gradeCost || {})[item.grade] || { gold: 40, materialId: 'smithing_shard', materialCount: 1 };
            const goldCost = Math.round((rule.gold || 40) * (1 + level * 0.55));
            const matCount = Math.max(1, Math.round((rule.materialCount || 1) * (1 + level * 0.35)));
            if (this.state.player.gold < goldCost || this.getInventoryCount(rule.materialId) < matCount) {
                this.showToast("강화 재료 또는 골드가 부족합니다.", "warn");
                return;
            }
            this.state.player.gold -= goldCost;
            this.inventory.removeItem(rule.materialId, matCount);
            const successRates = this.isBossExclusiveItem(itemId)
                ? (smithing.bossSuccessRates || smithing.successRates || [])
                : (smithing.successRates || [1, 1, 1, 1, 0.8, 0.65]);
            const success = Math.random() < Number(successRates[level] ?? 0.04);
            const bodyEl = document.querySelector('#modal-content .smith-body');
            const preserveScrollTop = bodyEl ? bodyEl.scrollTop : 0;
            if (success) {
                this.state.player.itemEnhance[itemId] = level + 1;
                this.showToast(`${this.getItemDisplayName(itemId, item)} 강화 성공!`, "success");
                this.log(`[대장간] ${item.name} +${level} → +${level + 1} 강화 성공`, "effect");
            } else {
                this.showToast(`${item.name} 강화 실패 (단계 유지)`, "warn");
                this.log(`[대장간] ${item.name} +${level} 강화 실패`, "system");
            }
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
            this.openBlacksmithModal('enhance', {
                restoreScrollTop: preserveScrollTop,
                fromFacility: !!this.blacksmithFromFacility
            });
        },

        salvageItem(itemId) {
            const item = window.GAME_DATA.items[itemId];
            if (!item || this.getInventoryCount(itemId) <= 0) return;
            const bodyEl = document.querySelector('#modal-content .smith-body');
            const preserveScrollTop = bodyEl ? bodyEl.scrollTop : 0;
            this.inventory.removeItem(itemId, 1);
            const reward = this.getSalvageReward(itemId);
            this.state.player.gold += reward.gold;
            reward.materials.forEach(mat => this.inventory.addItem(mat.itemId, mat.count));
            this.showToast(`${item.name} 분해 완료`, "success");
            this.log(`[대장간] ${item.name} 분해: ${reward.gold}G 환급`, "effect");
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
            this.openBlacksmithModal('salvage', {
                restoreScrollTop: preserveScrollTop,
                fromFacility: !!this.blacksmithFromFacility
            });
        },

        salvageAllInventoryItems() {
            const smithable = this.getSmithableEquipmentItemIds().filter(id => this.getInventoryCount(id) > 0);
            if (smithable.length === 0) {
                this.showToast("분해할 장비가 없습니다.", "warn");
                return;
            }
            const totalCount = smithable.reduce((acc, itemId) => acc + this.getInventoryCount(itemId), 0);
            const ok = confirm(`가방의 분해 가능 장비 ${totalCount}개를 모두 분해하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
            if (!ok) return;

            let totalGold = 0;
            const matSummary = {};
            const itemSummary = [];
            smithable.forEach((itemId) => {
                const count = this.getInventoryCount(itemId);
                if (count <= 0) return;
                const item = window.GAME_DATA.items[itemId];
                const reward = this.getSalvageReward(itemId);
                this.inventory.removeItem(itemId, count);
                totalGold += reward.gold * count;
                (reward.materials || []).forEach((mat) => {
                    if (!matSummary[mat.itemId]) matSummary[mat.itemId] = 0;
                    matSummary[mat.itemId] += mat.count * count;
                });
                itemSummary.push(`${item?.name || itemId} x${count}`);
            });

            this.state.player.gold += totalGold;
            Object.entries(matSummary).forEach(([itemId, count]) => {
                this.inventory.addItem(itemId, count);
            });

            const matText = Object.entries(matSummary).map(([itemId, count]) => {
                const name = window.GAME_DATA.items[itemId]?.name || itemId;
                return `${name} x${count}`;
            }).join(' · ');
            this.showToast(`전체 분해 완료 (+${totalGold}G)`, "success");
            this.log(`[대장간] 전체 분해: ${itemSummary.join(', ')} · +${totalGold}G${matText ? ` · ${matText}` : ''}`, "effect");
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
            this.openBlacksmithModal('salvage', {
                fromFacility: !!this.blacksmithFromFacility
            });
        },

        craftRecipe(recipeId) {
            const recipes = window.GAME_DATA.smithing?.recipes || [];
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            if (this.state.player.gold < (recipe.costGold || 0)) {
                this.showToast("골드가 부족합니다.", "warn");
                return;
            }
            const canCraft = (recipe.ingredients || []).every(mat => this.getInventoryCount(mat.itemId) >= mat.count);
            if (!canCraft) {
                this.showToast("재료가 부족합니다.", "warn");
                return;
            }
            const bodyEl = document.querySelector('#modal-content .smith-body');
            const preserveScrollTop = bodyEl ? bodyEl.scrollTop : 0;
            this.state.player.gold -= (recipe.costGold || 0);
            (recipe.ingredients || []).forEach(mat => this.inventory.removeItem(mat.itemId, mat.count));
            this.inventory.addItem(recipe.resultItemId, 1);
            const result = window.GAME_DATA.items[recipe.resultItemId];
            this.showToast(`${result?.name || recipe.resultItemId} 제작 완료`, "success");
            this.log(`[대장간] ${result?.name || recipe.resultItemId} 제작 성공`, "effect");
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
            this.openBlacksmithModal('craft', {
                restoreScrollTop: preserveScrollTop,
                fromFacility: !!this.blacksmithFromFacility
            });
        }
    });
})();
