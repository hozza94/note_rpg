/** 인벤 탭·스킬 탭·성물 탭 렌더 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        switchTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
            this.renderTabContent(tabId);
        }
,
        getItemGradeRank(grade) {
            const order = window.GAME_DATA_META?.itemGrades || ['Normal', 'Uncommon', 'Rare', 'Epic'];
            const g = String(grade || 'Normal');
            const idx = order.indexOf(g);
            return idx >= 0 ? idx : 0;
        },
        getRelicGradeRank(grade) {
            const order = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
            const g = String(grade || 'Common');
            const idx = order.indexOf(g);
            return idx >= 0 ? idx : 0;
        },
        /** 접힘 콘텐츠 높이에 맞춰 애니메이션 길이/최대높이를 동적으로 계산 */
        setupDynamicSkillCollapse(rootEl) {
            const root = rootEl || document;
            const detailsList = Array.from(root.querySelectorAll('details.skill-collapse'));
            if (!detailsList.length) return;
            const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
            const measureAndApply = (detailsEl) => {
                const body = detailsEl.querySelector('.skill-collapse-body');
                if (!body) return;
                const height = Math.max(0, Math.ceil(body.scrollHeight || 0));
                const dur = clamp(Math.round(120 + height * 0.35), 140, 540);
                detailsEl.style.setProperty('--collapse-max', `${height}px`);
                detailsEl.style.setProperty('--collapse-dur', `${dur}ms`);
                if (detailsEl.open) body.style.maxHeight = `${height}px`;
            };
            const animateOpen = (detailsEl, body) => {
                if (detailsEl.dataset.collapsing === '1') return;
                detailsEl.dataset.collapsing = '1';
                detailsEl.open = true;
                measureAndApply(detailsEl);
                const h = Math.max(0, Math.ceil(body.scrollHeight || 0));
                body.style.maxHeight = '0px';
                body.style.opacity = '0';
                body.style.paddingBottom = '0px';
                requestAnimationFrame(() => {
                    body.style.maxHeight = `${h}px`;
                    body.style.opacity = '1';
                    body.style.paddingBottom = '10px';
                });
                const dur = parseInt(getComputedStyle(detailsEl).getPropertyValue('--collapse-dur'), 10) || 220;
                setTimeout(() => {
                    detailsEl.dataset.collapsing = '0';
                    this.refreshScrollHint(document.querySelector('.tab-scroll-body'));
                }, dur + 24);
            };
            const animateClose = (detailsEl, body) => {
                if (detailsEl.dataset.collapsing === '1') return;
                detailsEl.dataset.collapsing = '1';
                const h = Math.max(0, Math.ceil(body.scrollHeight || 0));
                const dur = clamp(Math.round(120 + h * 0.35), 140, 540);
                detailsEl.style.setProperty('--collapse-dur', `${dur}ms`);
                body.style.maxHeight = `${h}px`;
                body.style.opacity = '1';
                body.style.paddingBottom = '10px';
                requestAnimationFrame(() => {
                    body.style.maxHeight = '0px';
                    body.style.opacity = '0';
                    body.style.paddingBottom = '0px';
                });
                setTimeout(() => {
                    detailsEl.open = false;
                    body.style.maxHeight = '';
                    body.style.opacity = '';
                    body.style.paddingBottom = '';
                    detailsEl.dataset.collapsing = '0';
                    this.refreshScrollHint(document.querySelector('.tab-scroll-body'));
                }, dur + 24);
            };
            detailsList.forEach((el) => {
                if (el.dataset.dynamicCollapseBound === '1') return;
                el.dataset.dynamicCollapseBound = '1';
                measureAndApply(el);
                const body = el.querySelector('.skill-collapse-body');
                const summary = el.querySelector('.skill-collapse-summary');
                if (!body || !summary) return;
                summary.addEventListener('click', (evt) => {
                    evt.preventDefault();
                    measureAndApply(el);
                    if (el.open) animateClose(el, body);
                    else animateOpen(el, body);
                });
            });
            // 폰트/이미지 로딩 후 실제 높이로 재보정
            requestAnimationFrame(() => detailsList.forEach(measureAndApply));
            setTimeout(() => detailsList.forEach(measureAndApply), 180);
        },
        renderTabContent(tabId) {
            const container = document.getElementById('inventory-list');
            container.innerHTML = '';
            if (tabId === 'equipment') tabId = 'inventory';

            if (tabId === 'relics') {
                this.renderRelicsTab(container);
                this.refreshScrollHint(document.querySelector('.tab-scroll-body'));
                return;
            }

            if (tabId === 'inventory') {
                if (this.inventory.items.length === 0) {
                    container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
                } else {
                    const hint = document.createElement('p');
                    hint.className = 'tab-sort-hint';
                    hint.textContent = '등급 높은 순으로 정렬됩니다.';
                    container.appendChild(hint);
                    const sortedItems = [...this.inventory.items].sort((a, b) => {
                        const da = window.GAME_DATA.items[a.id];
                        const db = window.GAME_DATA.items[b.id];
                        if (!da && !db) return String(a.id).localeCompare(String(b.id), 'ko');
                        if (!da) return 1;
                        if (!db) return -1;
                        const ra = this.getItemGradeRank(da.grade);
                        const rb = this.getItemGradeRank(db.grade);
                        if (rb !== ra) return rb - ra;
                        const na = this.getItemDisplayName(a.id, da);
                        const nb = this.getItemDisplayName(b.id, db);
                        return na.localeCompare(nb, 'ko');
                    });
                    sortedItems.forEach(itemInfo => {
                        const itemData = window.GAME_DATA.items[itemInfo.id];
                        if (!itemData) return;
                        const enhanceLv = this.getItemEnhanceLevel(itemInfo.id);
                        const enhanceClass = this.getEnhanceVisualClass(enhanceLv, itemInfo.id);
                        const div = document.createElement('div');
                        const bossExclusiveClass = this.isBossExclusiveItem(itemInfo.id) ? 'boss-exclusive' : '';
                        div.className = `list-item inventory-item ${(itemData.grade || 'normal').toLowerCase()} ${enhanceClass} ${bossExclusiveClass}`;
                        const detailLine = this.formatShopItemDetails(itemData, itemInfo.id);
                        const displayName = this.getItemDisplayName(itemInfo.id, itemData);
                        div.innerHTML = `
                            <div class="item-info">
                                <span class="name">${displayName}</span>
                                <span class="count">x${itemInfo.count}</span>
                                <span class="item-meta">${detailLine}</span>
                            </div>
                            ${itemData.slot ? '<button class="equip-btn">장착</button>' : ''}
                        `;
                        if (itemData.slot) {
                            div.querySelector('.equip-btn').onclick = () => this.equipItem(itemInfo.id);
                        }
                        container.appendChild(div);
                    });
                }
            } else if (tabId === 'skills') {
                const activeSkills = this.getActiveSkills();
                const nodeMap = this.getSkillTreeNodeMap();
                const passiveNodes = (this.state.player.unlockedSkillNodes || [])
                    .map(nodeId => nodeMap[nodeId])
                    .filter(node => !!node && node.kind !== 'start' && node.kind !== 'active_unlock');

                const activeSectionOpen = this.getUiPrefOpen('basileia_ui_skill_active_open', true);
                const passiveSectionOpen = this.getUiPrefOpen('basileia_ui_skill_passive_open', true);
                const section = document.createElement('div');
                section.className = 'skill-tab-sections';
                section.innerHTML = `
                    <div class="skill-tree-header">
                        <span class="skill-tree-point">스킬트리 포인트: <strong id="skill-tree-points">${this.state.player.skillTreePoints}</strong></span>
                        <button id="btn-open-skilltree" class="action-btn small primary">스킬트리 열기</button>
                    </div>
                    <details class="skill-collapse" id="skill-section-active"${activeSectionOpen ? ' open' : ''}>
                        <summary class="skill-collapse-summary">액티브 스킬</summary>
                        <div class="skill-collapse-body">
                            <div id="active-skill-list"></div>
                        </div>
                    </details>
                    <details class="skill-collapse" id="skill-section-passive"${passiveSectionOpen ? ' open' : ''}>
                        <summary class="skill-collapse-summary">패시브 스킬</summary>
                        <div class="skill-collapse-body">
                            <div id="passive-skill-list"></div>
                        </div>
                    </details>
                `;
                container.appendChild(section);

                section.querySelector('#skill-section-active')?.addEventListener('toggle', (e) => {
                    const el = e.target;
                    if (el && el.id === 'skill-section-active') this.setUiPrefOpen('basileia_ui_skill_active_open', el.open);
                });
                section.querySelector('#skill-section-passive')?.addEventListener('toggle', (e) => {
                    const el = e.target;
                    if (el && el.id === 'skill-section-passive') this.setUiPrefOpen('basileia_ui_skill_passive_open', el.open);
                });

                const activeList = section.querySelector('#active-skill-list');
                const passiveList = section.querySelector('#passive-skill-list');

                if (activeSkills.length === 0) {
                    activeList.innerHTML = '<div class="empty-msg">배운 액티브 스킬이 없습니다.</div>';
                } else {
                    activeSkills.forEach(skillData => {
                        const item = document.createElement('div');
                        item.className = 'skill-card active';
                        const tooltip = this.formatActiveSkillTooltip(skillData);
                        item.innerHTML = `
                            <div class="skill-card-main">
                                <div class="skill-card-title-row">
                                    <span class="skill-card-title">${skillData.name}</span>
                                    <span class="skill-card-cost">PP ${skillData.cost || 0}</span>
                                </div>
                                <div class="skill-card-meta">${skillData.type === 'buff' ? '강화 스킬' : '공격 스킬'}</div>
                                <div class="skill-card-desc">${skillData.desc || ''}</div>
                                <div class="skill-tooltip">${tooltip}</div>
                            </div>
                        `;
                        activeList.appendChild(item);
                    });
                }

                if (passiveNodes.length === 0) {
                    passiveList.innerHTML = '<div class="empty-msg">배운 패시브 스킬이 없습니다.</div>';
                } else {
                    passiveNodes.forEach(node => {
                        const item = document.createElement('div');
                        item.className = 'skill-card passive';
                        const tooltip = this.formatPassiveSkillTooltip(node);
                        item.innerHTML = `
                            <div class="skill-card-main">
                                <div class="skill-card-title-row">
                                    <span class="skill-card-title">${node.name}</span>
                                    <span class="skill-card-cost">${node.kind === 'keystone' ? '핵심' : '패시브'}</span>
                                </div>
                                <div class="skill-card-meta">패시브 노드</div>
                                <div class="skill-card-desc">${node.desc || ''}</div>
                                <div class="skill-tooltip">${tooltip}</div>
                            </div>
                        `;
                        passiveList.appendChild(item);
                    });
                }

                const openTreeBtn = section.querySelector('#btn-open-skilltree');
                if (openTreeBtn) openTreeBtn.addEventListener('click', () => this.openSkillTreeModal());
                this.setupDynamicSkillCollapse(section);
            }
            this.refreshScrollHint(document.querySelector('.tab-scroll-body'));
        }
,
        getRelicGradeClass(grade) {
            const g = String(grade || '').toLowerCase();
            return ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].includes(g) ? g : 'common';
        },
        getRelicDisplayLevel(relicId) {
            const lv = Number(this.getRelicLevel ? this.getRelicLevel(relicId) : 1);
            return Math.max(1, Math.floor(lv || 1));
        },
        formatTalentAmount(value) {
            const n = Math.max(0, Number(value || 0));
            return n.toFixed(2).replace(/\.?0+$/, '');
        },
        formatRelicSpecialsHtml(relic, relicId = '') {
            const s = (this.getRelicSpecialsScaled && relicId)
                ? (this.getRelicSpecialsScaled(relicId) || relic?.specials || {})
                : (relic?.specials || {});
            const lines = [];
            if (relicId) {
                const lv = this.getRelicDisplayLevel(relicId);
                const maxLv = Math.max(1, Number(window.GAME_DATA?.relicGacha?.maxRelicLevel || 10));
                lines.push(`성물 레벨 ${lv}/${maxLv}`);
            }
            if (typeof s.ppOnHitChance === 'number' || typeof s.ppOnHitAmount === 'number') {
                const ch = Math.round((Number(s.ppOnHitChance || 0)) * 100);
                const amt = Math.max(0, Math.floor(Number(s.ppOnHitAmount || 0)));
                if (ch > 0 && amt > 0) lines.push(`적중 시 PP +${amt} (${ch}% 확률)`);
                else if (ch > 0) lines.push(`적중 시 PP 회복 확률 +${ch}%`);
                else if (amt > 0) lines.push(`적중 시 PP 회복량 +${amt}`);
            }
            if (typeof s.doubleStrikeChance === 'number' && s.doubleStrikeChance > 0) {
                lines.push(`추가 타격 확률 +${Math.round(s.doubleStrikeChance * 100)}%`);
            }
            if (typeof s.critChance === 'number' && s.critChance > 0) {
                lines.push(`치명타 확률 +${Math.round(s.critChance * 100)}%`);
            }
            if (typeof s.critDamageMul === 'number' && s.critDamageMul > 0) {
                lines.push(`치명타 피해 +${Math.round(s.critDamageMul * 100)}%p`);
            }
            if (typeof s.lifeSteal === 'number' && s.lifeSteal > 0) {
                lines.push(`생명력 흡수 +${Math.round(s.lifeSteal * 100)}%`);
            }
            if (typeof s.hpRegen === 'number' && s.hpRegen > 0) {
                lines.push(`턴 종료 체력 재생 +${Math.floor(s.hpRegen)}`);
            }
            if (typeof s.turnStartCleanseChance === 'number' && s.turnStartCleanseChance > 0) {
                lines.push(`턴 시작 정화 확률 +${Math.round(s.turnStartCleanseChance * 100)}%`);
            }
            if (typeof s.ailmentResist === 'number' && s.ailmentResist > 0) {
                lines.push(`상태이상 저항 +${Math.round(s.ailmentResist * 100)}%`);
            }
            if (typeof s.evadeChance === 'number' && s.evadeChance > 0) {
                lines.push(`회피 확률 +${Math.round(s.evadeChance * 100)}%`);
            }
            if (typeof s.damageMul === 'number' && Math.abs(s.damageMul - 1) > 1e-6) {
                const pct = Math.round((s.damageMul - 1) * 100);
                lines.push(`가하는 피해 ${pct >= 0 ? '+' : ''}${pct}%`);
            }
            if (typeof s.damageTakenMul === 'number' && Math.abs(s.damageTakenMul - 1) > 1e-6) {
                const pct = Math.round((1 - s.damageTakenMul) * 100);
                lines.push(`받는 피해 ${pct >= 0 ? '-' : '+'}${Math.abs(pct)}%`);
            }
            if (typeof s.lowHpDamageMul === 'number' && Math.abs(s.lowHpDamageMul - 1) > 1e-6) {
                const pct = Math.round((s.lowHpDamageMul - 1) * 100);
                lines.push(`HP 50% 이하 피해 ${pct >= 0 ? '+' : ''}${pct}%`);
            }
            if (!lines.length) lines.push('적용 효과 없음');
            return `<ul class="relic-effects">${lines.map(line => `<li>${line}</li>`).join('')}</ul>`;
        },
        pickRelicGachaGrade(modeCfg, forcedGrade = null) {
            if (forcedGrade) return forcedGrade;
            const rates = modeCfg?.gradeRates || {};
            const order = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
            const roll = Math.random();
            let acc = 0;
            for (const grade of order) {
                acc += Number(rates[grade] || 0);
                if (roll <= acc) return grade;
            }
            return 'Common';
        },
        pickRelicIdFromGachaPool(modeCfg, grade) {
            const pool = modeCfg?.poolByGrade?.[grade] || [];
            if (!Array.isArray(pool) || pool.length === 0) return null;
            return pool[Math.floor(Math.random() * pool.length)] || null;
        },
        awardRelicByGacha(relicId) {
            const relic = window.GAME_DATA?.relics?.[relicId];
            if (!relic) return null;
            const owned = this.state.player.ownedRelicIds || [];
            this.state.player.relicLevels = this.state.player.relicLevels || {};
            const maxLv = Math.max(1, Number(window.GAME_DATA?.relicGacha?.maxRelicLevel || 10));
            if (!owned.includes(relicId)) {
                owned.push(relicId);
                this.state.player.ownedRelicIds = owned;
                this.state.player.relicLevels[relicId] = 1;
                return { relicId, type: 'new', level: 1 };
            }
            const before = this.getRelicDisplayLevel(relicId);
            if (before >= maxLv) {
                this.state.player.relicToken = Math.max(0, Number(this.state.player.relicToken || 0)) + 1;
                return { relicId, type: 'max', level: before, tokenRefund: 1 };
            }
            const after = Math.min(maxLv, before + 1);
            this.state.player.relicLevels[relicId] = after;
            return { relicId, type: 'dupe', from: before, to: after };
        },
        performRelicGacha(mode = 'normal', count = 1) {
            if (this.state.battle) return this.log('전투 중에는 성물 소환을 사용할 수 없습니다.', 'system');
            const gacha = window.GAME_DATA?.relicGacha || {};
            const modeCfg = gacha[mode];
            if (!modeCfg) return this.log('성물 소환 설정이 없습니다.', 'system');
            const pullCount = Math.max(1, Math.min(10, Math.floor(Number(count) || 1)));
            if (mode === 'normal') {
                const oneGold = Math.max(0, Number(modeCfg.goldCost || 0));
                const tenBundle = Math.max(0, Number(modeCfg.tenPullGoldCost || 0));
                const needGold = pullCount >= 10 && tenBundle > 0 ? tenBundle : oneGold * pullCount;
                if (this.state.player.gold < needGold) return this.showToast('골드가 부족합니다.', 'warn');
                this.state.player.gold -= needGold;
            } else {
                const oneCost = Math.max(0, Number(modeCfg.tokenCost || 0));
                const tenCost = Math.max(0, Number(modeCfg.tenPullTokenCost || oneCost * 10));
                const needToken = pullCount >= 10 ? tenCost : oneCost * pullCount;
                this.state.player.relicToken = Math.max(0, Number(this.state.player.relicToken || 0));
                if (this.state.player.relicToken < needToken) return this.showToast('달란트가 부족합니다.', 'warn');
                this.state.player.relicToken -= needToken;
            }

            this.state.player.relicGachaPity = this.state.player.relicGachaPity || { premiumWithoutEpic: 0 };
            const pityCfg = modeCfg.pity || {};
            const pityEvery = Math.max(0, Number(pityCfg.every || 0));
            const forcedGrade = pityCfg.guaranteedGrade || 'Epic';
            const results = [];
            for (let i = 0; i < pullCount; i++) {
                const forced = (mode === 'premium' && pityEvery > 0 && (this.state.player.relicGachaPity.premiumWithoutEpic + 1) >= pityEvery)
                    ? forcedGrade
                    : null;
                const grade = this.pickRelicGachaGrade(modeCfg, forced);
                const relicId = this.pickRelicIdFromGachaPool(modeCfg, grade);
                if (!relicId) continue;
                const awarded = this.awardRelicByGacha(relicId);
                if (!awarded) continue;
                results.push({ ...awarded, grade });
                if (mode === 'premium') {
                    if (grade === 'Epic' || grade === 'Legendary' || grade === 'Mythic') {
                        this.state.player.relicGachaPity.premiumWithoutEpic = 0;
                    } else {
                        this.state.player.relicGachaPity.premiumWithoutEpic += 1;
                    }
                }
            }
            if (!results.length) return this.log('소환 결과를 계산하지 못했습니다.', 'system');
            const esc = (s) => this.escapeLogHtml(s);
            const header = esc(`[성물 소환:${mode === 'normal' ? '일반' : '고급'} x${pullCount}] `);
            const body = results.map((r) => {
                const name = window.GAME_DATA?.relics?.[r.relicId]?.name || r.relicId;
                let line;
                if (r.type === 'new') line = `${name} 신규 획득`;
                else if (r.type === 'dupe') line = `${name} 레벨 ${r.from}→${r.to}`;
                else line = `${name} 최대 레벨 (달란트 +${this.formatTalentAmount(r.tokenRefund || 0)})`;
                const g = String(r.grade || 'Common').toLowerCase();
                return `<span class="relic-log-grade relic-log-${g}">${esc(line)}</span>`;
            }).join('<span class="log-gacha-sep"> / </span>');
            this.logHtml(`<span class="log-gacha-header">${header}</span>${body}`, 'effect', 'log-gacha');

            const hasMythic = results.some((r) => r.grade === 'Mythic');
            const hasLegendary = results.some((r) => r.grade === 'Legendary');
            if (hasMythic) this.showRelicGachaSpotlight('mythic');
            else if (hasLegendary) this.showRelicGachaSpotlight('legendary');
            this.saveGame();
            this.updateUI();
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'relics';
            this.renderTabContent(activeTab);
        },
        renderRelicsTab(container) {
            const owned = this.state.player.ownedRelicIds || [];
            const eq = this.state.player.equippedRelicId;
            const relics = window.GAME_DATA.relics || {};

            const relicOwnedOpen = this.getUiPrefOpen('basileia_ui_relic_owned_open', true);
            const wrap = document.createElement('div');
            wrap.className = 'relic-tab-panel';
            wrap.innerHTML = `
                <div class="skill-group">
                    <h4>장착 중</h4>
                    <div id="relic-equipped-slot"></div>
                </div>
                <details class="skill-collapse relic-owned-collapse" id="relic-section-owned"${relicOwnedOpen ? ' open' : ''}>
                    <summary class="skill-collapse-summary">보유 성물 <span class="relic-owned-count">(${owned.length})</span></summary>
                    <div class="skill-collapse-body">
                        <p class="tab-sort-hint tab-sort-hint--inline">등급 높은 순으로 정렬됩니다.</p>
                        <div id="relic-owned-wrap"></div>
                    </div>
                </details>
            `;
            container.appendChild(wrap);

            wrap.querySelector('#relic-section-owned')?.addEventListener('toggle', (e) => {
                const el = e.target;
                if (el && el.id === 'relic-section-owned') this.setUiPrefOpen('basileia_ui_relic_owned_open', el.open);
            });

            const eqSlot = wrap.querySelector('#relic-equipped-slot');
            if (eq && relics[eq]) {
                const r = relics[eq];
                const card = document.createElement('div');
                card.className = `relic-card equipped ${this.getRelicGradeClass(r.grade)}`;
                card.innerHTML = `
                    <div class="relic-head">
                        <div class="relic-name">${r.name}</div>
                        <button type="button" class="relic-info-btn" aria-label="성물 설명">ⓘ</button>
                        <div class="relic-tooltip">${r.desc || '설명이 없습니다.'}</div>
                    </div>
                    <div class="relic-meta">${r.grade || ''} · 현재 적용 중</div>
                    ${this.formatRelicSpecialsHtml(r, eq)}
                    <button type="button" class="action-btn small secondary btn-relic-unequip">장착 해제</button>
                `;
                card.querySelector('.btn-relic-unequip').addEventListener('click', () => {
                    this.state.player.equippedRelicId = null;
                    this.saveGame();
                    this.updateUI();
                    this.renderTabContent('relics');
                    this.log('[성물] 장착을 해제했습니다.', 'system');
                });
                eqSlot.appendChild(card);
            } else {
                eqSlot.innerHTML = '<div class="empty-msg">장착한 성물이 없습니다.</div>';
            }

            const ownedWrap = wrap.querySelector('#relic-owned-wrap');
            if (owned.length === 0) {
                ownedWrap.innerHTML = '<div class="empty-msg">보유한 성물이 없습니다.</div>';
            } else {
                const sortedOwned = [...owned].sort((a, b) => {
                    const ra = relics[a];
                    const rb = relics[b];
                    if (!ra && !rb) return String(a).localeCompare(String(b), 'ko');
                    if (!ra) return 1;
                    if (!rb) return -1;
                    const ga = this.getRelicGradeRank(ra.grade);
                    const gb = this.getRelicGradeRank(rb.grade);
                    if (gb !== ga) return gb - ga;
                    return (ra.name || a).localeCompare(rb.name || b, 'ko');
                });
                sortedOwned.forEach(rid => {
                    const r = relics[rid];
                    if (!r) return;
                    const row = document.createElement('div');
                    row.className = `relic-card ${this.getRelicGradeClass(r.grade)}`;
                    row.style.marginBottom = '8px';
                    const isEq = eq === rid;
                    row.innerHTML = `
                        <div class="relic-head">
                            <div class="relic-name">${r.name}</div>
                            <button type="button" class="relic-info-btn" aria-label="성물 설명">ⓘ</button>
                            <div class="relic-tooltip">${r.desc || '설명이 없습니다.'}</div>
                        </div>
                        <div class="relic-meta">${r.grade || ''}${isEq ? ' · 장착 중' : ''}</div>
                        ${this.formatRelicSpecialsHtml(r, rid)}
                        ${isEq ? '' : '<button type="button" class="action-btn small primary btn-relic-equip">장착</button>'}
                    `;
                    const b = row.querySelector('.btn-relic-equip');
                    if (b) {
                        b.addEventListener('click', () => {
                            this.state.player.equippedRelicId = rid;
                            this.saveGame();
                            this.updateUI();
                            this.renderTabContent('relics');
                            this.log(`[성물] ${r.name}을(를) 장착했습니다.`, 'effect');
                        });
                    }
                    ownedWrap.appendChild(row);
                });
            }
            this.setupDynamicSkillCollapse(wrap);
        }
    });
})();
