/**
 * 시설 허브: 상점/성물 소환/대장간 진입점 통합
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        getFacilityHubTabs() {
            return [
                { id: 'shop', label: '🏪 상점', desc: '구매 / 판매', actionLabel: '상점 열기', action: () => this.openShop('buy') },
                { id: 'gacha', label: '✨ 성물 소환', desc: '달란트 / 골드 뽑기', actionLabel: '소환 열기', action: () => this.openRelicGachaModal() },
                { id: 'smith', label: '🔨 대장간', desc: '강화 / 분해 / 제작', actionLabel: '대장간 열기', action: () => this.openBlacksmithModal('enhance') }
            ];
        },
        renderFacilityHub(tabId = 'gacha') {
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            if (!modal || !content) return;
            const tabs = this.getFacilityHubTabs();
            const current = tabs.find(t => t.id === tabId) || tabs[0];
            content.style.width = '540px';
            content.style.maxWidth = '94vw';
            content.innerHTML = `
                <h3 style="margin-bottom: 10px;">🏛️ 시설 관리</h3>
                <p style="font-size:0.82rem; color:#b0bec5; margin-bottom:12px;">
                    상점, 성물 소환, 대장간을 한 곳에서 관리합니다.
                </p>
                <div class="facility-hub-tabs">
                    ${tabs.map(t => `<button type="button" class="action-btn small ${t.id === current.id ? 'primary' : ''}" data-facility-tab="${t.id}">${t.label}</button>`).join('')}
                </div>
                <div class="facility-hub-grid">
                    <div class="action-btn facility-hub-btn">
                        <strong>${current.label}</strong>
                        <span>${current.desc}</span>
                    </div>
                </div>
                <button id="btn-facility-open-current" class="action-btn primary" style="margin-top:8px; width:100%;">${current.actionLabel}</button>
                <button id="btn-close-facility-hub" class="action-btn" style="margin-top:12px; width:100%;">닫기</button>
            `;
            modal.classList.remove('hidden');
            const close = () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            };
            content.querySelector('#btn-close-facility-hub')?.addEventListener('click', close);
            content.querySelectorAll('[data-facility-tab]').forEach((btn) => {
                btn.addEventListener('click', () => this.renderFacilityHub(btn.getAttribute('data-facility-tab') || 'gacha'));
            });
            content.querySelector('#btn-facility-open-current')?.addEventListener('click', () => current.action());
        },
        openFacilityHub() {
            if (this.state.battle) return this.log("전투 중에는 시설을 이용할 수 없습니다.", "system");
            this.renderFacilityHub('gacha');
        },

        openRelicGachaModal() {
            if (this.state.battle) return this.log("전투 중에는 성물 소환을 사용할 수 없습니다.", "system");
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            if (!modal || !content) return;
            const gacha = window.GAME_DATA?.relicGacha || {};
            const premiumPity = Math.max(0, Number(this.state.player?.relicGachaPity?.premiumWithoutEpic || 0));
            const pityEvery = Math.max(0, Number(gacha?.premium?.pity?.every || 0));
            content.style.width = '560px';
            content.style.maxWidth = '94vw';
            content.innerHTML = `
                <h3 style="margin-bottom: 10px;">✨ 성물 소환</h3>
                <p class="relic-gacha-currency">보유 골드: <strong>${this.state.player.gold}G</strong> · 보유 달란트: <strong>${this.formatTalentAmount(this.state.player.relicToken || 0)} T</strong></p>
                <p class="relic-gacha-pity" style="margin-bottom:12px;">고급 천장: ${pityEvery > 0 ? `${premiumPity}/${pityEvery}` : '사용 안 함'}</p>
                <div class="relic-gacha-actions">
                    <button type="button" class="action-btn small" data-relic-gacha-mode="normal" data-relic-gacha-count="1">일반 1회 (${Math.max(0, Number(gacha?.normal?.goldCost || 0))}G)</button>
                    <button type="button" class="action-btn small primary" data-relic-gacha-mode="premium" data-relic-gacha-count="1">고급 1회 (${this.formatTalentAmount(gacha?.premium?.tokenCost || 0)} 달란트)</button>
                    <button type="button" class="action-btn small primary" data-relic-gacha-mode="premium" data-relic-gacha-count="10">고급 10회 (${this.formatTalentAmount(gacha?.premium?.tenPullTokenCost || (Number(gacha?.premium?.tokenCost || 0) * 10))} 달란트)</button>
                </div>
                <button id="btn-back-facility-hub" class="action-btn secondary" style="margin-top:12px; width:100%;">← 시설 허브로</button>
                <button id="btn-close-relic-gacha" class="action-btn" style="margin-top:8px; width:100%;">닫기</button>
            `;
            modal.classList.remove('hidden');
            const close = () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            };
            content.querySelector('#btn-close-relic-gacha')?.addEventListener('click', close);
            content.querySelector('#btn-back-facility-hub')?.addEventListener('click', () => this.renderFacilityHub('gacha'));
            content.querySelectorAll('[data-relic-gacha-mode]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const mode = btn.getAttribute('data-relic-gacha-mode') || 'normal';
                    const count = Number(btn.getAttribute('data-relic-gacha-count') || 1);
                    this.performRelicGacha(mode, count);
                    this.openRelicGachaModal();
                });
            });
        }
    });
})();

