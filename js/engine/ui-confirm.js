/**
 * 앱 공통 확인 모달 (네이티브 confirm 대체)
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        ensureAppConfirmModal() {
            let root = document.getElementById('app-confirm-overlay');
            if (root) return root;
            root = document.createElement('div');
            root.id = 'app-confirm-overlay';
            root.className = 'app-confirm-overlay hidden';
            root.setAttribute('role', 'dialog');
            root.setAttribute('aria-modal', 'true');
            root.setAttribute('aria-labelledby', 'app-confirm-title');
            root.innerHTML = `
                <div class="app-confirm-card card">
                    <h3 id="app-confirm-title" class="app-confirm-title"></h3>
                    <p class="app-confirm-message"></p>
                    <div class="app-confirm-actions">
                        <button type="button" class="action-btn" data-app-confirm-cancel>취소</button>
                        <button type="button" class="action-btn primary" data-app-confirm-ok>확인</button>
                    </div>
                </div>
            `;
            document.body.appendChild(root);
            root.addEventListener('click', (e) => {
                if (e.target === root && typeof this._appConfirmResolve === 'function') {
                    this._finishAppConfirm(false);
                }
            });
            return root;
        },

        _finishAppConfirm(value) {
            const fn = this._appConfirmResolve;
            this._appConfirmResolve = null;
            if (typeof this._appConfirmOnKey === 'function') {
                document.removeEventListener('keydown', this._appConfirmOnKey);
                this._appConfirmOnKey = null;
            }
            const root = document.getElementById('app-confirm-overlay');
            if (root) root.classList.add('hidden');
            if (typeof fn === 'function') fn(value);
        },

        /**
         * @param {{ title?: string, message?: string, confirmText?: string, cancelText?: string, danger?: boolean }} opts
         * @returns {Promise<boolean>}
         */
        showConfirmModal(opts = {}) {
            const root = this.ensureAppConfirmModal();
            if (this._appConfirmResolve) {
                return Promise.resolve(false);
            }
            const title = opts.title || '확인';
            const message = opts.message || '';
            const confirmText = opts.confirmText || '확인';
            const cancelText = opts.cancelText || '취소';
            const danger = !!opts.danger;

            root.querySelector('.app-confirm-title').textContent = title;
            const msgEl = root.querySelector('.app-confirm-message');
            msgEl.textContent = message;
            msgEl.style.whiteSpace = 'pre-wrap';

            const okBtn = root.querySelector('[data-app-confirm-ok]');
            const cancelBtn = root.querySelector('[data-app-confirm-cancel]');
            okBtn.textContent = confirmText;
            cancelBtn.textContent = cancelText;
            okBtn.className = danger ? 'action-btn danger' : 'action-btn primary';
            cancelBtn.className = 'action-btn';

            return new Promise((resolve) => {
                this._appConfirmResolve = resolve;

                const onOk = () => this._finishAppConfirm(true);
                const onCancel = () => this._finishAppConfirm(false);
                okBtn.onclick = onOk;
                cancelBtn.onclick = onCancel;

                this._appConfirmOnKey = (e) => {
                    if (e.key === 'Escape') onCancel();
                };
                document.addEventListener('keydown', this._appConfirmOnKey);

                root.classList.remove('hidden');
                requestAnimationFrame(() => cancelBtn.focus());
            });
        },

        getUiPrefOpen(key, defaultOpen = true) {
            try {
                const v = localStorage.getItem(key);
                if (v === null || v === '') return defaultOpen;
                return v === '1' || v === 'true';
            } catch {
                return defaultOpen;
            }
        },

        setUiPrefOpen(key, open) {
            try {
                localStorage.setItem(key, open ? '1' : '0');
            } catch (_) { /* ignore */ }
        }
    });
})();
