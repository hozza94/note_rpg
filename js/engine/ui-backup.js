/** 백업 매니저·파일 내보내기·가져오기 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        openBackupManagerModal() {
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            const slots = window.StorageManager.listCloudBackups();

            const rows = slots.map(slotInfo => `
                <div class="shop-item-row list-item inventory-item">
                    <div class="shop-item-row__main">
                        <div class="shop-item-row__name">☁️ 백업 슬롯 ${slotInfo.slot}</div>
                        <div class="shop-item-row__desc">${slotInfo.label}</div>
                    </div>
                    <div class="item-actions" style="display:flex; gap:6px;">
                        <button class="action-btn small primary" data-backup-upload="${slotInfo.slot}">업로드</button>
                        <button class="action-btn small secondary" data-backup-restore="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>복원</button>
                        <button class="action-btn small" data-backup-export="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>파일 저장</button>
                        <button class="action-btn small danger" data-backup-delete="${slotInfo.slot}" ${slotInfo.exists ? '' : 'disabled'}>삭제</button>
                    </div>
                </div>
            `).join('');

            content.style.width = '720px';
            content.style.maxWidth = '95vw';
            content.innerHTML = `
                <h3 style="margin-bottom: 10px;">☁️ 백업 매니저</h3>
                <p style="font-size:0.82rem; color:#b0bec5; margin-bottom:10px;">
                    슬롯별로 업로드/복원/삭제를 관리합니다. (현재 사용자 기준)
                </p>
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <button class="action-btn small" id="btn-backup-export-live">현재 진행 파일 저장</button>
                    <button class="action-btn small secondary" id="btn-backup-import-file">파일에서 복원</button>
                    <input type="file" id="backup-import-input" accept=".json,application/json" style="display:none;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto;">
                    ${rows}
                </div>
                <button id="btn-back-to-settings" class="action-btn secondary" style="margin-top: 10px; width: 100%;">← 설정으로 돌아가기</button>
                <button id="btn-close-backup-manager" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
            `;
            modal.classList.remove('hidden');

            const settingsMsg = document.getElementById('settings-msg');
            const close = () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            };

            content.querySelectorAll('[data-backup-upload]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const slot = Number(btn.getAttribute('data-backup-upload'));
                    this.state.inventoryData = this.inventory.serialize();
                    const res = window.StorageManager.syncToCloudSlot(this.state, slot);
                    if (settingsMsg) {
                        settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
                        settingsMsg.innerText = res.msg;
                    }
                    this.showToast(res.msg, res.success ? 'success' : 'warn');
                    if (res.success) this.openBackupManagerModal();
                });
            });

            content.querySelectorAll('[data-backup-restore]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const slot = Number(btn.getAttribute('data-backup-restore'));
                    const restoreRes = window.StorageManager.restoreFromCloudSlot(slot);
                    if (settingsMsg) {
                        settingsMsg.style.color = restoreRes.success ? '#4caf50' : '#ff4b2b';
                        settingsMsg.innerText = restoreRes.msg;
                    }
                    if (!restoreRes.success) {
                        this.showToast(restoreRes.msg, 'warn');
                        return;
                    }
                    this.state = restoreRes.payload;
                    this.ensureStateSchema();
                    this.inventory = new window.InventoryManager(this.state.inventoryData || {});
                    this.toggleBattleUI(false);
                    this.updateUI();
                    this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                    this.log(`클라우드 백업 슬롯 ${slot}에서 데이터를 복원했습니다.`, "system");
                    this.saveGame();
                    this.showToast(restoreRes.msg, 'success');
                    close();
                });
            });

            content.querySelectorAll('[data-backup-delete]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const slot = Number(btn.getAttribute('data-backup-delete'));
                    const ok = confirm(`슬롯 ${slot} 백업을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`);
                    if (!ok) return;
                    const res = window.StorageManager.deleteCloudSlot(slot);
                    if (settingsMsg) {
                        settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
                        settingsMsg.innerText = res.msg;
                    }
                    this.showToast(res.msg, res.success ? 'success' : 'warn');
                    if (res.success) this.openBackupManagerModal();
                });
            });

            content.querySelectorAll('[data-backup-export]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const slot = Number(btn.getAttribute('data-backup-export'));
                    const res = window.StorageManager.restoreFromCloudSlot(slot);
                    if (!res.success || !res.payload) {
                        this.showToast("내보낼 백업 데이터가 없습니다.", "warn");
                        return;
                    }
                    const exported = await this.saveBackupPayloadToFile(res.payload, `slot${slot}`);
                    if (exported) this.showToast(`슬롯 ${slot} 백업 파일 저장 완료`, "success");
                });
            });

            document.getElementById('btn-backup-export-live')?.addEventListener('click', async () => {
                this.state.inventoryData = this.inventory.serialize();
                const exported = await this.saveBackupPayloadToFile(this.state, 'live');
                if (exported) this.showToast("현재 진행 파일 저장 완료", "success");
            });

            const importInput = document.getElementById('backup-import-input');
            document.getElementById('btn-backup-import-file')?.addEventListener('click', () => importInput?.click());
            importInput?.addEventListener('change', async (e) => {
                const file = e.target?.files?.[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    const payload = parsed?.payload || parsed;
                    if (!payload || typeof payload !== 'object') throw new Error('invalid payload');
                    const accountBundle = parsed?.account || null;
                    if (accountBundle) {
                        const accountRes = window.AuthManager?.importAccount?.(accountBundle, { overwrite: true, setSession: true });
                        if (!accountRes?.success) {
                            throw new Error(accountRes?.msg || 'account restore failed');
                        }
                    }
                    this.state = payload;
                    this.ensureStateSchema();
                    this.inventory = new window.InventoryManager(this.state.inventoryData || {});
                    this.toggleBattleUI(false);
                    this.updateUI();
                    this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
                    this.log("백업 파일에서 데이터를 복원했습니다.", "system");
                    this.saveGame();
                    this.showToast("파일 복원 완료", "success");
                    close();
                } catch (err) {
                    console.error(err);
                    this.showToast("백업 파일 복원 실패", "warn");
                } finally {
                    e.target.value = '';
                }
            });

            document.getElementById('btn-close-backup-manager')?.addEventListener('click', close);
            document.getElementById('btn-back-to-settings')?.addEventListener('click', () => {
                close();
                const settingsOverlay = document.getElementById('settings-overlay');
                const nickInput = document.getElementById('settings-nickname');
                const msgEl = document.getElementById('settings-msg');
                if (nickInput && window.AuthManager) nickInput.value = window.AuthManager.getNickname();
                if (msgEl) msgEl.innerText = '';
                this.syncSettingsAvatarRadios();
                settingsOverlay?.classList.remove('hidden');
            });
        },

        async saveBackupPayloadToFile(payload, tag = 'backup') {
            try {
                const user = window.AuthManager?.getCurrentUser?.() || 'guest';
                const now = new Date();
                const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
                const suggestedName = `basileia_${user}_${tag}_${stamp}.json`;
                const account = window.AuthManager?.exportCurrentAccount?.() || null;
                const text = JSON.stringify({ version: window.StorageManager.version, timestamp: Date.now(), account, payload }, null, 2);

                if (window.showSaveFilePicker) {
                    const handle = await window.showSaveFilePicker({
                        suggestedName,
                        types: [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(text);
                    await writable.close();
                    return true;
                }

                const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = suggestedName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                return true;
            } catch (err) {
                console.error(err);
                this.showToast("파일 저장에 실패했습니다.", "warn");
                return false;
            }
        }
    });
})();
