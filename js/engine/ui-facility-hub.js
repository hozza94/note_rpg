/**
 * 시설 허브: 상점/성물 소환/대장간 진입점 통합
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        getModalOverlayElements() {
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            if (!modal || !content) return null;
            return { modal, content };
        },
        closeModalOverlay() {
            const refs = this.getModalOverlayElements();
            if (!refs) return;
            refs.content.style.width = '';
            refs.content.style.maxWidth = '';
            refs.modal.classList.add('hidden');
        },
        renderModalTopBar(title, options = {}) {
            const showBack = !!options.showBack;
            return `
                <div class="modal-topbar">
                    ${showBack
                        ? '<button type="button" class="modal-icon-btn" data-modal-back aria-label="뒤로가기" title="뒤로가기">←</button>'
                        : '<span class="modal-icon-btn modal-icon-btn--ghost" aria-hidden="true"></span>'
                    }
                    <h3 class="modal-topbar__title">${title}</h3>
                    <button type="button" class="modal-icon-btn" data-modal-close aria-label="닫기" title="닫기">✕</button>
                </div>
            `;
        },
        bindModalTopBarActions(content, handlers = {}) {
            content.querySelector('[data-modal-close]')?.addEventListener('click', () => this.closeModalOverlay());
            content.querySelector('[data-modal-back]')?.addEventListener('click', () => {
                if (typeof handlers.onBack === 'function') handlers.onBack();
            });
        },
        getFacilityHubMenus() {
            return [
                { id: 'gacha', label: '✨ 성물 소환', desc: '달란트 / 골드 뽑기', action: () => this.openRelicGachaModal({ fromFacility: true }) },
                { id: 'shop', label: '🏪 상점', desc: '구매 / 판매', action: () => this.openShop('buy', { fromFacility: true }) },
                { id: 'smith', label: '🔨 대장간', desc: '강화 / 분해 / 제작', action: () => this.openBlacksmithModal('enhance', { fromFacility: true }) }
            ];
        },
        renderFacilityHub() {
            const refs = this.getModalOverlayElements();
            if (!refs) return;
            const { modal, content } = refs;
            const menus = this.getFacilityHubMenus();
            content.style.width = '540px';
            content.style.maxWidth = '94vw';
            content.innerHTML = `
                ${this.renderModalTopBar('🏛️ 시설 관리')}
                <p style="font-size:0.82rem; color:#b0bec5; margin-bottom:12px;">
                    상점, 성물 소환, 대장간을 한 곳에서 관리합니다.
                </p>
                <div class="facility-hub-grid">
                    ${menus.map(m => `
                        <button type="button" class="action-btn facility-hub-btn ${m.id === 'gacha' ? 'primary' : ''}" data-facility-open="${m.id}">
                            <strong>${m.label}</strong>
                            <span>${m.desc}</span>
                        </button>
                    `).join('')}
                </div>
            `;
            modal.classList.remove('hidden');
            this.bindModalTopBarActions(content);
            content.querySelectorAll('[data-facility-open]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-facility-open');
                    const menu = menus.find(m => m.id === id);
                    if (menu) menu.action();
                });
            });
        },
        openFacilityHub() {
            if (this.state.battle) return this.log("전투 중에는 시설을 이용할 수 없습니다.", "system");
            this.renderFacilityHub();
        },
        formatRelicGachaRateRows(modeCfg = {}) {
            const order = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
            const labelMap = {
                Common: '일반',
                Rare: '희귀',
                Epic: '에픽',
                Legendary: '전설',
                Mythic: '신화'
            };
            const rates = modeCfg?.gradeRates || {};
            return order
                .filter((grade) => Number(rates[grade] || 0) > 0)
                .map((grade) => {
                    const pct = (Number(rates[grade] || 0) * 100).toFixed(2).replace(/\.?0+$/, '');
                    return `<li><span class="relic-rate-grade relic-rate-${String(grade).toLowerCase()}">${labelMap[grade] || grade}</span><span>${pct}%</span></li>`;
                })
                .join('');
        },
        buildRelicGachaRateTooltipHtml(gacha = {}, pityEvery = 0) {
            const normalRows = this.formatRelicGachaRateRows(gacha.normal || {});
            const premiumRows = this.formatRelicGachaRateRows(gacha.premium || {});
            return `
                <div class="relic-gacha-rate-tooltip__title">소환 확률 안내</div>
                <div class="relic-gacha-rate-tooltip__block">
                    <strong>일반 소환</strong>
                    <ul>${normalRows || '<li><span>설정 없음</span><span>-</span></li>'}</ul>
                </div>
                <div class="relic-gacha-rate-tooltip__block">
                    <strong>고급 소환</strong>
                    <ul>${premiumRows || '<li><span>설정 없음</span><span>-</span></li>'}</ul>
                    <p class="relic-gacha-rate-tooltip__pity">천장: ${pityEvery > 0 ? `${pityEvery}회 내 에픽 이상 1회 보장` : '사용 안 함'}</p>
                </div>
            `;
        },
        bindRelicGachaPress(button, onPull) {
            if (!button || typeof onPull !== 'function') return;
            let holdDelayTimer = null;
            let repeatTimer = null;
            let holdTriggered = false;

            const stopRepeat = () => {
                if (holdDelayTimer) clearTimeout(holdDelayTimer);
                if (repeatTimer) clearInterval(repeatTimer);
                holdDelayTimer = null;
                repeatTimer = null;
            };
            const runPull = () => onPull();

            button.addEventListener('pointerdown', (e) => {
                if (e.button !== 0) return;
                holdTriggered = false;
                stopRepeat();
                holdDelayTimer = setTimeout(() => {
                    holdTriggered = true;
                    runPull();
                    repeatTimer = setInterval(runPull, 170);
                }, 320);
            });
            button.addEventListener('pointerup', stopRepeat);
            button.addEventListener('pointerleave', stopRepeat);
            button.addEventListener('pointercancel', stopRepeat);
            button.addEventListener('click', () => {
                stopRepeat();
                if (holdTriggered) {
                    holdTriggered = false;
                    return;
                }
                runPull();
            });
        },

        openRelicGachaModal(options = {}) {
            if (this.state.battle) return this.log("전투 중에는 성물 소환을 사용할 수 없습니다.", "system");
            const refs = this.getModalOverlayElements();
            if (!refs) return;
            const { modal, content } = refs;
            const fromFacility = !!options.fromFacility;
            const gacha = window.GAME_DATA?.relicGacha || {};
            const premiumPity = Math.max(0, Number(this.state.player?.relicGachaPity?.premiumWithoutEpic || 0));
            const pityEvery = Math.max(0, Number(gacha?.premium?.pity?.every || 0));
            const oneGold = Math.max(0, Number(gacha?.normal?.goldCost || 0));
            const tenGold = Math.max(0, Number(gacha?.normal?.tenPullGoldCost || 0) || (oneGold * 10));
            const oneToken = this.formatTalentAmount(gacha?.premium?.tokenCost || 0);
            const tenToken = this.formatTalentAmount(gacha?.premium?.tenPullTokenCost || (Number(gacha?.premium?.tokenCost || 0) * 10));
            content.style.width = '560px';
            content.style.maxWidth = '94vw';
            content.innerHTML = `
                ${this.renderModalTopBar('✨ 성물 소환', { showBack: fromFacility })}
                <div class="relic-gacha-toolbar">
                    <p class="relic-gacha-currency">보유 골드: <strong>${this.state.player.gold}G</strong> · 보유 달란트: <strong>${this.formatTalentAmount(this.state.player.relicToken || 0)} T</strong></p>
                    <div class="relic-gacha-rate-help">
                        <button type="button" class="relic-gacha-rate-btn" aria-label="소환 확률 보기" title="소환 확률 보기">?</button>
                        <div class="relic-gacha-rate-tooltip">
                            ${this.buildRelicGachaRateTooltipHtml(gacha, pityEvery)}
                        </div>
                    </div>
                </div>
                <p class="relic-gacha-pity">고급 천장: ${pityEvery > 0 ? `${premiumPity}/${pityEvery}` : '사용 안 함'}</p>
                <div class="relic-gacha-actions relic-gacha-actions--split">
                    <div class="relic-gacha-action-group">
                        <h4>일반 소환</h4>
                        <button type="button" class="action-btn small" data-relic-gacha-mode="normal" data-relic-gacha-count="1">1회 (${oneGold}G)</button>
                        <button type="button" class="action-btn small" data-relic-gacha-mode="normal" data-relic-gacha-count="10">10회 (${tenGold}G)</button>
                    </div>
                    <div class="relic-gacha-action-group">
                        <h4>고급 소환</h4>
                        <button type="button" class="action-btn small primary" data-relic-gacha-mode="premium" data-relic-gacha-count="1">1회 (${oneToken} 달란트)</button>
                        <button type="button" class="action-btn small primary" data-relic-gacha-mode="premium" data-relic-gacha-count="10">10회 (${tenToken} 달란트)</button>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');

            const currencyEl = content.querySelector('.relic-gacha-currency');
            const pityEl = content.querySelector('.relic-gacha-pity');
            const refreshGachaPanel = () => {
                if (currencyEl) {
                    currencyEl.innerHTML = `보유 골드: <strong>${this.state.player.gold}G</strong> · 보유 달란트: <strong>${this.formatTalentAmount(this.state.player.relicToken || 0)} T</strong>`;
                }
                if (pityEl) {
                    const currentPity = Math.max(0, Number(this.state.player?.relicGachaPity?.premiumWithoutEpic || 0));
                    pityEl.innerText = `고급 천장: ${pityEvery > 0 ? `${currentPity}/${pityEvery}` : '사용 안 함'}`;
                }
            };

            this.bindModalTopBarActions(content, {
                onBack: () => this.renderFacilityHub()
            });
            content.querySelectorAll('[data-relic-gacha-mode]').forEach((btn) => {
                this.bindRelicGachaPress(btn, () => {
                    const mode = btn.getAttribute('data-relic-gacha-mode') || 'normal';
                    const count = Number(btn.getAttribute('data-relic-gacha-count') || 1);
                    this.performRelicGacha(mode, count);
                    refreshGachaPanel();
                });
            });
        }
    });
})();

