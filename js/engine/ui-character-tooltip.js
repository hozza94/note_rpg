/** 캐릭터 스탯 ⓘ 툴팁 위치·HTML */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        /** 닉네임/ⓘ 호버 시 툴팁 — ⓘ 아이콘 기준으로 옆에 붙임(마우스 좌표 아님, 뷰포트 클램프) */
        bindCharacterStatTooltipEvents() {
            const zone = document.querySelector('.char-title-hover-zone');
            const tip = document.getElementById('char-stat-tooltip');
            const infoBtn = document.getElementById('char-stat-info-btn');
            if (!zone || !tip) return;

            const GAP = 8;
            const PAD = 8;

            const placeAnchored = () => {
                if (!tip) return;
                const z = document.querySelector('.char-title-hover-zone');
                const btn = document.getElementById('char-stat-info-btn');
                const anchorEl = btn || z;
                if (!anchorEl) return;
                const r = anchorEl.getBoundingClientRect();
                const maxW = Math.min(232, window.innerWidth - 24);
                tip.style.position = 'fixed';
                tip.style.maxWidth = `${maxW}px`;
                tip.style.width = 'auto';

                const apply = () => {
                    const tw = tip.getBoundingClientRect().width || maxW;
                    const th = tip.getBoundingClientRect().height || 120;
                    let left = r.right + GAP;
                    let top = r.top + (r.height - th) / 2;
                    if (left + tw > window.innerWidth - PAD) {
                        left = r.left - tw - GAP;
                    }
                    if (left < PAD) left = PAD;
                    if (left + tw > window.innerWidth - PAD) {
                        left = Math.max(PAD, window.innerWidth - tw - PAD);
                    }
                    if (top + th > window.innerHeight - PAD) {
                        top = Math.max(PAD, window.innerHeight - th - PAD);
                    }
                    if (top < PAD) top = PAD;
                    tip.style.left = `${left}px`;
                    tip.style.top = `${top}px`;
                };

                requestAnimationFrame(apply);
            };

            zone.addEventListener('mouseenter', placeAnchored);
            infoBtn?.addEventListener('mouseenter', placeAnchored);
            zone.addEventListener('focusin', placeAnchored);

            window.addEventListener('resize', placeAnchored);
            document.querySelector('.character-pane')?.addEventListener('scroll', placeAnchored, { passive: true });

            this._repositionCharStatTooltip = placeAnchored;
        }
,
        buildCharacterStatTooltipHtml() {
            const t = this.getPlayerCombinedStats();
            const row = (label, val) => `<div class="char-stat-tooltip__row"><span>${label}</span><span>${val}</span></div>`;
            const parts = ['<div class="char-stat-tooltip__head">최종 합산<br><span class="char-stat-tooltip__head-sub">기본·장비·패시브</span></div>'];
            parts.push(row('공격', t.atk));
            parts.push(row('방어', t.def));
            parts.push(row('최대 HP', t.hp));
            parts.push(row('최대 PP', t.pp));
            parts.push(row('속도', t.spd));
            parts.push(row('신앙', t.faith));
            parts.push(row('체력재생', t.hpRegen));
            parts.push(row('생명력 흡수', `${Math.round((t.lifeSteal || 0) * 100)}%`));
            const critPct = Math.round((0.1 + (t.critChance || 0)) * 100);
            parts.push(row('치명타 확률', `${critPct}%`));
            parts.push(row('치명타 피해', `${Math.round((t.critDamageMul || 1.5) * 100)}%`));
            if ((t.evadeChance || 0) > 0) {
                parts.push(row('회피', `${Math.round(t.evadeChance * 100)}%`));
            }
            const dm = t.damageMul || 1;
            if (Math.abs(dm - 1) > 1e-5) {
                const p = Math.round((dm - 1) * 100);
                parts.push(row('가하는 피해', `${p >= 0 ? '+' : ''}${p}%`));
            }
            const dtm = t.damageTakenMul || 1;
            if (Math.abs(dtm - 1) > 1e-5) {
                if (dtm < 1) parts.push(row('받는 피해', `-${Math.round((1 - dtm) * 100)}%`));
                else parts.push(row('받는 피해', `+${Math.round((dtm - 1) * 100)}%`));
            }
            const low = t.lowHpDamageMul || 1;
            if (Math.abs(low - 1) > 1e-5) {
                const p = Math.round((low - 1) * 100);
                parts.push(row('HP 50% 이하 피해', `${p >= 0 ? '+' : ''}${p}%`));
            }
            if (this.state.battle) {
                parts.push('<div class="char-stat-tooltip__battle-note">전투 중 강화·다음 치명·선공 속도는<br>닉네임 아래 「전투 중 효과」 참고</div>');
            }
            return parts.join('');
        }
    });
})();
