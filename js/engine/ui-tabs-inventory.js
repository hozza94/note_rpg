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
        renderTabContent(tabId) {
            const container = document.getElementById('inventory-list');
            container.innerHTML = '';
            if (tabId === 'equipment') tabId = 'inventory';

            if (tabId === 'relics') {
                this.renderRelicsTab(container);
                return;
            }

            if (tabId === 'inventory') {
                if (this.inventory.items.length === 0) {
                    container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
                } else {
                    this.inventory.items.forEach(itemInfo => {
                        const itemData = window.GAME_DATA.items[itemInfo.id];
                        const enhanceLv = this.getItemEnhanceLevel(itemInfo.id);
                        const enhanceClass = this.getEnhanceVisualClass(enhanceLv, itemInfo.id);
                        const div = document.createElement('div');
                        const bossExclusiveClass = this.isBossExclusiveItem(itemInfo.id) ? 'boss-exclusive' : '';
                        div.className = `list-item inventory-item ${itemData.grade.toLowerCase()} ${enhanceClass} ${bossExclusiveClass}`;
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

                const section = document.createElement('div');
                section.className = 'skill-tab-sections';
                section.innerHTML = `
                    <div class="skill-tree-header">
                        <span class="skill-tree-point">스킬트리 포인트: <strong id="skill-tree-points">${this.state.player.skillTreePoints}</strong></span>
                        <button id="btn-open-skilltree" class="action-btn small primary">스킬트리 열기</button>
                    </div>
                    <div class="skill-group">
                        <h4>액티브 스킬</h4>
                        <div id="active-skill-list"></div>
                    </div>
                    <div class="skill-group">
                        <h4>패시브 스킬</h4>
                        <div id="passive-skill-list"></div>
                    </div>
                `;
                container.appendChild(section);

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
            }
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
            const roll = Math.random();
            let acc = 0;
            for (const grade of ['Common', 'Rare', 'Epic']) {
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
                const needGold = Math.max(0, Number(modeCfg.goldCost || 0)) * pullCount;
                if (this.state.player.gold < needGold) return this.log('골드가 부족합니다.', 'system');
                this.state.player.gold -= needGold;
            } else {
                const oneCost = Math.max(0, Number(modeCfg.tokenCost || 0));
                const tenCost = Math.max(0, Number(modeCfg.tenPullTokenCost || oneCost * 10));
                const needToken = pullCount >= 10 ? tenCost : oneCost * pullCount;
                this.state.player.relicToken = Math.max(0, Number(this.state.player.relicToken || 0));
                if (this.state.player.relicToken < needToken) return this.log('달란트가 부족합니다.', 'system');
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
                    if (grade === 'Epic') this.state.player.relicGachaPity.premiumWithoutEpic = 0;
                    else this.state.player.relicGachaPity.premiumWithoutEpic += 1;
                }
            }
            if (!results.length) return this.log('소환 결과를 계산하지 못했습니다.', 'system');
            const summary = results.map((r) => {
                const name = window.GAME_DATA?.relics?.[r.relicId]?.name || r.relicId;
                if (r.type === 'new') return `${name} 신규 획득`;
                if (r.type === 'dupe') return `${name} 레벨 ${r.from}→${r.to}`;
                return `${name} 최대 레벨 (달란트 +${this.formatTalentAmount(r.tokenRefund || 0)})`;
            });
            this.log(`[성물 소환:${mode === 'normal' ? '일반' : '고급'} x${pullCount}] ${summary.join(' / ')}`, 'effect');
            this.saveGame();
            this.updateUI();
            this.renderTabContent('relics');
        },
        renderRelicsTab(container) {
            const owned = this.state.player.ownedRelicIds || [];
            const eq = this.state.player.equippedRelicId;
            const relics = window.GAME_DATA.relics || {};

            const wrap = document.createElement('div');
            wrap.className = 'relic-tab-panel';
            wrap.innerHTML = `
                <p class="relic-hint">성물은 <strong>1개만 장착</strong>하며 효과가 스킬트리 패시브와 <strong>합산</strong>됩니다.
                우측 <strong>스킬</strong> 탭에서 <strong>스킬트리 열기</strong>로 노드 그래프를 열 수 있습니다.<br>
                성물 소환은 하단 <strong>시설</strong> 메뉴에서 이용할 수 있습니다.</p>
                <div class="skill-group">
                    <h4>장착 중</h4>
                    <div id="relic-equipped-slot"></div>
                </div>
                <div class="skill-group">
                    <h4>보유 성물</h4>
                    <div id="relic-owned-wrap"></div>
                </div>
            `;
            container.appendChild(wrap);

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
                owned.forEach(rid => {
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
        }
    });
})();
