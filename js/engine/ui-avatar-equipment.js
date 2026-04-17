/** 아바타·장비 패널·슬롯 모달 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        ensureDefaultAvatarUnlocks() {
            const defaults = window.GAME_DATA?.avatars?.defaultUnlockedIds;
            if (!Array.isArray(defaults) || defaults.length === 0) return;
            if (!Array.isArray(this.state.player.unlockedAvatarIds)) {
                this.state.player.unlockedAvatarIds = [];
            }
            const merged = new Set(this.state.player.unlockedAvatarIds);
            defaults.forEach((id) => merged.add(id));
            this.state.player.unlockedAvatarIds = Array.from(merged);
        }
,
        getAvatarCatalog() {
            const dataList = window.GAME_DATA?.avatars?.list;
            if (Array.isArray(dataList) && dataList.length) return dataList;
            return [{ id: 'male_base', label: '남성 기본', gender: 'male', file: 'Avatar_M.png', unlockType: 'default', unlockHint: '기본 해금' }];
        }
,
        getAvatarImagePath() {
            const AA = window.AvatarAssets;
            if (!AA) {
                const g = this.state.player.avatarGender === 'female' ? 'female' : 'male';
                return g === 'female' ? 'assets/avatars/Avatar_F_AA.png' : 'assets/avatars/Avatar_M.png';
            }
            const catalog = this.getAvatarCatalog();
            const selected = catalog.find(a => a.id === this.state.player.selectedAvatarId);
            if (selected) return AA.resolveAvatarImageUrl(selected);
            const g = this.state.player.avatarGender === 'female' ? 'female' : 'male';
            return AA.resolveAvatarImageUrl({ file: AA.resolveDefaultAvatarFileByGender(g) });
        }
,
        toggleEquipmentViewMode() {
            this.state.player.equipmentViewMode = this.state.player.equipmentViewMode === 'edit' ? 'avatar' : 'edit';
            this.saveGame();
            this.renderEquipmentPanel();
        }
,
        selectAvatar(avatarId) {
            const catalog = this.getAvatarCatalog();
            const selected = catalog.find(a => a.id === avatarId);
            if (!selected) return;
            const unlocked = this.state.player.unlockedAvatarIds || [];
            if (!unlocked.includes(avatarId)) {
                this.showToast("아직 해금되지 않은 아바타입니다.", "warn");
                return;
            }
            this.state.player.selectedAvatarId = avatarId;
            this.state.player.avatarGender = selected.gender === 'female' ? 'female' : 'male';
            this.syncSettingsAvatarRadios();
            this.saveGame();
            this.renderEquipmentPanel();
        }
,
        syncSettingsAvatarRadios() {
            const host = document.getElementById('settings-avatar-options');
            if (!host) return;
            this.ensureDefaultAvatarUnlocks();
            const catalog = this.getAvatarCatalog();
            const unlockedIds = this.state.player.unlockedAvatarIds || [];
            let selectedId = this.state.player.selectedAvatarId || 'male_base';
            if (!unlockedIds.includes(selectedId)) {
                selectedId = catalog.find((a) => unlockedIds.includes(a.id))?.id || unlockedIds[0] || 'male_base';
            }

            const sel = document.createElement('select');
            sel.id = 'settings-avatar-select';
            sel.className = 'settings-avatar-select';
            sel.setAttribute('aria-label', '캐릭터 아바타');
            catalog.forEach((avatar) => {
                const isUnlocked = unlockedIds.includes(avatar.id);
                const opt = document.createElement('option');
                opt.value = avatar.id;
                opt.textContent = isUnlocked ? avatar.label : `${avatar.label} (잠금)`;
                if (!isUnlocked) opt.disabled = true;
                sel.appendChild(opt);
            });
            sel.value = selectedId;
            if (sel.value !== selectedId) {
                const firstOk = catalog.find((a) => unlockedIds.includes(a.id));
                if (firstOk) sel.value = firstOk.id;
            }

            host.replaceChildren(sel);
        }
,
        getEquipmentSlotConfig() {
            return [
                { slot: 'helmet', label: '머리', x: 50, y: 12, icon: '🪖' },
                { slot: 'armor', label: '갑주', x: 50, y: 34, icon: '🛡️' },
                { slot: 'accessory', label: '허리', x: 50, y: 58, icon: '🎗️' },
                { slot: 'boots', label: '발', x: 50, y: 82, icon: '🥾' },
                { slot: 'weapon', label: '주무기', x: 17, y: 46, icon: '⚔️' },
                { slot: 'offhand', label: '보조', x: 83, y: 46, icon: '🧿' }
            ];
        }
,
        openEquipmentSlotModal(slot) {
            const slotKo = {
                weapon: '주무기',
                armor: '갑옷',
                helmet: '투구',
                accessory: '벨트/장신구',
                boots: '신발',
                offhand: '보조장비'
            };
            const equippedItemId = this.inventory.equipment[slot];
            const equippedItem = equippedItemId ? window.GAME_DATA.items[equippedItemId] : null;
            const candidates = this.inventory.items
                .filter(itemInfo => window.GAME_DATA.items[itemInfo.id]?.slot === slot)
                .map(itemInfo => ({ info: itemInfo, data: window.GAME_DATA.items[itemInfo.id] }));

            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const equippedBossClass = equippedItemId && this.isBossExclusiveItem(equippedItemId) ? 'boss-exclusive' : '';
            const equippedSection = equippedItem
                ? `
                    <div class="equip-choice-current ${equippedBossClass}">
                        <div class="name ${equippedItem.grade.toLowerCase()}">${this.getItemDisplayName(equippedItemId, equippedItem)}</div>
                        <div class="effect">${this.formatShopItemDetails(equippedItem, equippedItemId)}</div>
                        <button id="btn-equip-unequip" class="action-btn small secondary">장착 해제</button>
                    </div>
                `
                : '<div class="empty-msg" style="padding:14px;">현재 장착된 아이템이 없습니다.</div>';

            const candidateRows = candidates.length > 0
                ? candidates.map(({ info, data }) => `
                    <div class="equip-choice-row ${data.grade.toLowerCase()} ${this.isBossExclusiveItem(info.id) ? 'boss-exclusive' : ''}">
                        <div class="main">
                            <div class="name">${this.getItemDisplayName(info.id, data)} <span class="count">x${info.count}</span></div>
                            <div class="effect">${this.formatShopItemDetails(data, info.id)}</div>
                            <div class="desc">${data.desc || ''}</div>
                        </div>
                        <button class="action-btn small primary" data-equip-item="${info.id}">장착</button>
                    </div>
                `).join('')
                : '<div class="empty-msg" style="padding:14px;">이 부위에 장착 가능한 아이템이 가방에 없습니다.</div>';

            content.style.width = '620px';
            content.style.maxWidth = '95vw';
            content.innerHTML = `
                <h3 style="margin-bottom: 8px;">${slotKo[slot] || slot} 장비 관리</h3>
                <section class="equip-choice-section">
                    <h4>현재 장착</h4>
                    ${equippedSection}
                </section>
                <section class="equip-choice-section">
                    <h4>가방에서 선택</h4>
                    <div class="modal-scroll-wrap equip-choice-scroll-wrap">
                        <div class="equip-choice-list modal-scroll-body">${candidateRows}</div>
                        <div class="modal-scroll-hint" aria-hidden="true"></div>
                    </div>
                </section>
                <button id="btn-close-equip-modal" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
            `;
            modal.classList.remove('hidden');
            this.bindModalScrollHint(content.querySelector('.equip-choice-scroll-wrap .modal-scroll-body'));

            const closeModal = () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            };
            document.getElementById('btn-close-equip-modal')?.addEventListener('click', closeModal);
            document.getElementById('btn-equip-unequip')?.addEventListener('click', () => {
                this.unequipItem(slot);
                closeModal();
            });
            content.querySelectorAll('[data-equip-item]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.getAttribute('data-equip-item');
                    if (!itemId) return;
                    this.equipItem(itemId);
                    closeModal();
                });
            });
        }
,
        renderEquipmentPanel() {
            const container = document.getElementById('equipment-panel');
            if (!container) return;

            const slots = this.getEquipmentSlotConfig();
            const equipBonuses = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
            const equippedCount = slots.filter(({ slot }) => !!this.inventory.equipment[slot]).length;
            const isEdit = this.state.player.equipmentViewMode === 'edit';
            const avatarUrl = this.getAvatarImagePath();
            const modeClass = isEdit ? 'mode-edit' : 'mode-avatar';
            const footerHint = isEdit
                ? '부위를 클릭해 장착·해제'
                : '「장비 편집」에서 슬롯을 열 수 있습니다';
            const toggleLabel = isEdit ? '아바타 보기' : '장비 편집';
            const bonusSummary = this.formatEquipmentBonusSummary(equipBonuses);

            container.innerHTML = `
                <div class="equipment-avatar-panel ${modeClass}">
                    <div class="equipment-avatar-toolbar">
                        <button type="button" class="action-btn small primary" id="btn-equip-view-toggle">${toggleLabel}</button>
                        <span class="equipment-avatar-hint">${isEdit ? '편집 모드' : '아바타 모드'}</span>
                    </div>
                    <div class="equipment-avatar-stage" style="--equip-avatar-url: url('${avatarUrl}');">
                        <div class="equipment-avatar-image" aria-hidden="true"></div>
                        <div class="equipment-slot-layer"></div>
                    </div>
                    <div class="equipment-avatar-footer">
                        <span>장착 수: ${equippedCount} / ${slots.length}</span>
                        <span class="equipment-total-bonus">총 장비 보정: ${bonusSummary}</span>
                        <span>${footerHint}</span>
                    </div>
                </div>
            `;

            const toggleBtn = container.querySelector('#btn-equip-view-toggle');
            if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleEquipmentViewMode());

            const charScrollBody = document.querySelector('.character-pane-scroll-body');
            if (!isEdit) {
                this.refreshScrollHint(charScrollBody);
                return;
            }

            const layer = container.querySelector('.equipment-slot-layer');
            if (!layer) {
                this.refreshScrollHint(charScrollBody);
                return;
            }

            slots.forEach(meta => {
                const itemId = this.inventory.equipment[meta.slot];
                const item = itemId ? window.GAME_DATA.items[itemId] : null;
                const enhanceClass = itemId ? this.getEnhanceVisualClass(this.getItemEnhanceLevel(itemId), itemId) : '';
                const button = document.createElement('button');
                button.type = 'button';
                const bossSlotClass = itemId && this.isBossExclusiveItem(itemId) ? 'boss-exclusive' : '';
                button.className = `equipment-slot-btn ${item ? 'equipped' : 'empty'} ${item ? item.grade.toLowerCase() : ''} ${enhanceClass} ${bossSlotClass}`.trim();
                button.style.left = `${meta.x}%`;
                button.style.top = `${meta.y}%`;
                button.innerHTML = `
                    <span class="slot-icon">${meta.icon}</span>
                    <span class="slot-label">${meta.label}</span>
                    <span class="slot-item">${item ? item.name : '비어있음'}</span>
                `;
                button.title = item
                    ? `${meta.label}: ${this.getItemDisplayName(itemId, item)}\n${this.formatShopItemDetails(item, itemId)}`
                    : `${meta.label}: 비어있음`;
                button.addEventListener('click', () => this.openEquipmentSlotModal(meta.slot));
                layer.appendChild(button);
            });
            this.refreshScrollHint(charScrollBody);
        }
,
        equipItem(itemId) {
            if (this.inventory.equip(itemId)) {
                const item = window.GAME_DATA.items[itemId];
                this.log(`[장비] ${item.name}을(를) 장착했습니다.`, "system");
                this.updateUI();
                this.renderEquipmentPanel();
                this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                this.saveGame();
            }
        }
,
        unequipItem(slot) {
            if (this.inventory.unequip(slot)) {
                this.log(`[장비] 장비를 해제했습니다.`, "system");
                this.updateUI();
                this.renderEquipmentPanel();
                this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                this.saveGame();
            }
        }
    });
})();
