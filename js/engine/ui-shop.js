/** 지역 상점 구매·판매 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        openShop(tab = 'buy') {
            if (this.state.battle) return this.log("전투 중에는 상점을 이용할 수 없습니다.", "system");

            const regionId = this.state.world.currentRegionId;
            const goods = window.GAME_DATA.shops?.[regionId] || [];
            if (goods.length === 0) return this.log("이 지역에는 상점이 열려 있지 않습니다.", "system");

            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const playerGold = this.state.player.gold;
            const currentTab = tab === 'sell' ? 'sell' : 'buy';
            const buyRows = goods.map(entry => {
                const item = window.GAME_DATA.items[entry.itemId];
                if (!item) return '';
                const disabled = playerGold < entry.price ? 'disabled' : '';
                const detailLine = this.formatShopItemDetails(item, entry.itemId);
                const displayName = this.getItemDisplayName(entry.itemId, item);
                const isStackable = !item.slot;
                const maxBuy = Math.max(0, Math.floor(playerGold / entry.price));
                return `
                    <div class="shop-item-row list-item inventory-item ${item.grade.toLowerCase()} ${this.getEnhanceVisualClass(this.getItemEnhanceLevel(entry.itemId), entry.itemId)} ${this.isBossExclusiveItem(entry.itemId) ? 'boss-exclusive' : ''}">
                        <div class="shop-item-row__main">
                            <div class="shop-item-row__name">${displayName}</div>
                            <div class="shop-item-row__effect">${detailLine}</div>
                            <div class="shop-item-row__desc">${item.desc || ''}</div>
                            <div class="shop-item-row__price">가격: ${entry.price}G</div>
                        </div>
                        ${isStackable
                            ? `
                                <div class="item-actions" style="display:flex; gap:6px;">
                                    <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="1" ${maxBuy < 1 ? 'disabled' : ''}>1개</button>
                                    <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="10" ${maxBuy < 1 ? 'disabled' : ''}>10개</button>
                                    <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="max" ${maxBuy < 1 ? 'disabled' : ''}>최대</button>
                                </div>
                            `
                            : `<button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" data-buy-qty="1" ${disabled}>구매</button>`
                        }
                    </div>
                `;
            }).join('');
            const sellRows = this.inventory.items
                .filter(info => {
                    const item = window.GAME_DATA.items[info.id];
                    return item && !item.slot;
                })
                .map(info => {
                    const item = window.GAME_DATA.items[info.id];
                    const sellPrice = this.getItemSellPrice(info.id);
                    return `
                        <div class="shop-item-row list-item inventory-item ${item.grade.toLowerCase()} ${this.isBossExclusiveItem(info.id) ? 'boss-exclusive' : ''}">
                            <div class="shop-item-row__main">
                                <div class="shop-item-row__name">${item.name} <span class="count">x${info.count}</span></div>
                                <div class="shop-item-row__effect">${this.formatShopItemDetails(item, info.id)}</div>
                                <div class="shop-item-row__price">판매가: ${sellPrice}G / 개</div>
                            </div>
                            <div class="item-actions" style="display:flex; gap:6px;">
                                <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="1">1개</button>
                                <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="10">10개</button>
                                <button type="button" class="action-btn small secondary shop-item-row__sell" data-sell-id="${info.id}" data-sell-qty="max">최대</button>
                            </div>
                        </div>
                    `;
                }).join('') || '<div class="empty-msg">판매 가능한 비장비 아이템이 없습니다.</div>';

            content.innerHTML = `
                <h3 style="margin-bottom:14px;">${window.GAME_DATA.regions[regionId].name} 상점</h3>
                <p style="margin-bottom:12px; color:#ffd54f;">보유 골드: ${playerGold}G</p>
                <div class="smith-tabs" style="margin-bottom:10px;">
                    <button class="action-btn small ${currentTab === 'buy' ? 'primary' : ''}" data-shop-tab="buy">구매</button>
                    <button class="action-btn small ${currentTab === 'sell' ? 'primary' : ''}" data-shop-tab="sell">판매</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; max-height:330px; overflow-y:auto;">
                    ${currentTab === 'buy' ? buyRows : sellRows}
                </div>
                <button id="btn-close-shop" class="action-btn" style="margin-top:12px; width:100%;">닫기</button>
            `;
            modal.classList.remove('hidden');

            content.querySelectorAll('[data-shop-tab]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nextTab = btn.getAttribute('data-shop-tab') || 'buy';
                    this.openShop(nextTab);
                });
            });
            content.querySelectorAll('button[data-buy-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.getAttribute('data-buy-id');
                    const price = Number(btn.getAttribute('data-buy-price'));
                    if (!itemId || !Number.isFinite(price)) return;
                    const req = btn.getAttribute('data-buy-qty') || '1';
                    const maxBuy = Math.max(0, Math.floor(this.state.player.gold / price));
                    if (maxBuy <= 0) {
                        this.showToast("골드가 부족합니다.", "warn");
                        return;
                    }
                    const amount = req === 'max' ? maxBuy : Math.max(1, Math.min(maxBuy, Math.floor(Number(req) || 1)));
                    this.buyShopItem(itemId, price, amount);
                    this.openShop('buy');
                });
            });
            content.querySelectorAll('button[data-sell-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.getAttribute('data-sell-id');
                    if (!itemId) return;
                    const owned = this.getInventoryCount(itemId);
                    if (owned <= 0) return;
                    const req = btn.getAttribute('data-sell-qty') || '1';
                    const amount = req === 'max' ? owned : Math.max(1, Math.min(owned, Math.floor(Number(req) || 1)));
                    this.sellItem(itemId, amount);
                    this.openShop('sell');
                });
            });
            document.getElementById('btn-close-shop').addEventListener('click', () => modal.classList.add('hidden'));
        }
,
        buyShopItem(itemId, price, amount = 1) {
            const count = Math.max(1, Math.floor(Number(amount) || 1));
            const totalPrice = price * count;
            if (this.state.player.gold < totalPrice) {
                this.log("골드가 부족합니다.", "system");
                return;
            }
            this.state.player.gold -= totalPrice;
            this.addItem(itemId, count);
            this.log(`[상점] ${window.GAME_DATA.items[itemId].name} ${count}개를 구매했습니다.`, "effect");
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
,
        getItemSellPrice(itemId) {
            const item = window.GAME_DATA.items[itemId];
            if (!item) return 0;
            let basePrice = 0;
            Object.values(window.GAME_DATA.shops || {}).forEach(goods => {
                const row = (goods || []).find(g => g.itemId === itemId);
                if (row && row.price > basePrice) basePrice = row.price;
            });
            if (basePrice <= 0) {
                const fallbackByGrade = { Normal: 18, Uncommon: 40, Rare: 90, Epic: 170 };
                basePrice = fallbackByGrade[item.grade] || 20;
            }
            return Math.max(1, Math.floor(basePrice * 0.5));
        }
,
        sellItem(itemId, amount = 1) {
            const item = window.GAME_DATA.items[itemId];
            if (!item || item.slot) return; // 장비류 판매 제외
            const owned = this.getInventoryCount(itemId);
            if (owned <= 0) return;
            const count = Math.max(1, Math.min(owned, Math.floor(Number(amount) || 1)));
            const sellPrice = this.getItemSellPrice(itemId);
            const total = sellPrice * count;
            this.inventory.removeItem(itemId, count);
            this.state.player.gold += total;
            this.showToast(`${item.name} ${count}개 판매 (+${total}G)`, "success");
            this.log(`[판매] ${item.name} ${count}개 판매 · +${total}G`, "effect");
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
    });
})();
