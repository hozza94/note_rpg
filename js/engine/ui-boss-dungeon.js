/** 보스 던전 모달·지역 순서·던전 해금 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;
    Object.assign(window.GameEngine.prototype, {
        getRegionOrderMap() {
            const order = {};
            let cursor = 'pishon';
            let i = 0;
            while (cursor && !order[cursor] && i < 30) {
                order[cursor] = i++;
                cursor = window.GAME_DATA.regions[cursor]?.nextRegionId || null;
            }
            return order;
        }
,
        getCurrentRegionOrder() {
            const orderMap = this.getRegionOrderMap();
            return orderMap[this.state.world.currentRegionId] ?? 0;
        }
,
        updateBossDungeonUnlocks() {
            const entries = window.GAME_DATA?.bossDungeon?.entries || [];
            const unlocked = this.state.world.bossDungeonUnlocked || {};
            const orderMap = this.getRegionOrderMap();
            const currentOrder = this.getCurrentRegionOrder();
            entries.forEach(entry => {
                if (!entry?.bossId) return;
                const entryOrder = orderMap[entry.regionId] ?? Number.MAX_SAFE_INTEGER;
                if (entry.unlockType === 'region_reached' && currentOrder >= entryOrder) {
                    unlocked[entry.bossId] = true;
                }
            });
            this.state.world.bossDungeonUnlocked = unlocked;
        }
,
        getBossDungeonEntries() {
            const entries = window.GAME_DATA?.bossDungeon?.entries || [];
            const monsters = window.GAME_DATA?.monsters || [];
            const unlocked = this.state.world.bossDungeonUnlocked || {};
            return entries
                .map(entry => {
                    const boss = monsters.find(m => m.id === entry.bossId && m.isBoss);
                    const region = window.GAME_DATA.regions[entry.regionId];
                    if (!boss || !region) return null;
                    const history = this.state.world.bossClearHistory?.[entry.bossId] || null;
                    return {
                        ...entry,
                        boss,
                        region,
                        unlocked: !!unlocked[entry.bossId],
                        history
                    };
                })
                .filter(Boolean);
        }
,
        openBossDungeonModal(filter = 'available') {
            this.updateBossDungeonUnlocks();
            const modal = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            if (!modal || !content) return;

            const allEntries = this.getBossDungeonEntries();
            const visibleEntries = allEntries.filter(entry => {
                if (filter === 'all') return true;
                if (filter === 'cleared') return !!entry.history?.clearCount;
                if (filter === 'uncleared') return !entry.history?.clearCount;
                return entry.unlocked;
            });

            const orderMap = this.getRegionOrderMap();
            visibleEntries.sort((a, b) => {
                const oa = orderMap[a.regionId] ?? 999;
                const ob = orderMap[b.regionId] ?? 999;
                if (oa !== ob) return oa - ob;
                return (a.recommendedLv || a.boss.level || 1) - (b.recommendedLv || b.boss.level || 1);
            });

            const filterBtn = (id, label) => `<button class="action-btn small ${filter === id ? 'primary' : ''}" data-boss-filter="${id}">${label}</button>`;
            const cardHtml = visibleEntries.length
                ? visibleEntries.map(entry => {
                    const pityCount = Number(this.state.world.bossDropPity?.[entry.bossId] || 0);
                    const clearCount = Number(entry.history?.clearCount || 0);
                    const lastClear = entry.history?.lastClearAt ? new Date(entry.history.lastClearAt).toLocaleString() : '기록 없음';
                    const lockedText = entry.unlocked ? '' : '<span class="boss-dungeon-lock">잠금</span>';
                    return `
                        <article class="boss-dungeon-card ${entry.unlocked ? '' : 'is-locked'}">
                            <div class="boss-dungeon-head">
                                <h4>${entry.boss.name} ${lockedText}</h4>
                                <span class="boss-dungeon-grade">${entry.boss.grade}</span>
                            </div>
                            <div class="boss-dungeon-meta">${entry.region.name} · 권장 Lv.${entry.recommendedLv || entry.boss.level}</div>
                            <div class="boss-dungeon-meta">클리어 ${clearCount}회 · 최근 ${lastClear}</div>
                            <div class="boss-dungeon-meta">레어 보정 스택: ${pityCount}</div>
                            <div class="boss-dungeon-actions">
                                <button class="action-btn small secondary" data-boss-drop="${entry.bossId}">드랍 보기</button>
                                <button class="action-btn small primary" data-boss-start="${entry.bossId}" ${entry.unlocked ? '' : 'disabled'}>도전</button>
                                <button class="action-btn small" data-boss-sweep="${entry.bossId}" ${(entry.unlocked && clearCount > 0) ? '' : 'disabled'}>소탕 시작</button>
                            </div>
                        </article>
                    `;
                }).join('')
                : '<div class="empty-msg">조건에 맞는 보스가 없습니다.</div>';

            content.style.width = '760px';
            content.style.maxWidth = '96vw';
            content.innerHTML = `
                <h3 style="margin-bottom: 12px;">⚔️ 보스 던전</h3>
                <div class="boss-dungeon-filter-row">
                    ${filterBtn('available', '도전 가능')}
                    ${filterBtn('all', '전체')}
                    ${filterBtn('cleared', '클리어 완료')}
                    ${filterBtn('uncleared', '미클리어')}
                </div>
                <div class="boss-dungeon-list">${cardHtml}</div>
                <button id="btn-close-boss-dungeon" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
            `;
            modal.classList.remove('hidden');

            const closeModal = () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            };

            content.querySelector('#btn-close-boss-dungeon')?.addEventListener('click', closeModal);
            content.querySelectorAll('[data-boss-filter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nextFilter = btn.getAttribute('data-boss-filter') || 'available';
                    this.openBossDungeonModal(nextFilter);
                });
            });
            content.querySelectorAll('[data-boss-drop]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const bossId = btn.getAttribute('data-boss-drop');
                    this.openBossDropInfo(bossId);
                });
            });
            content.querySelectorAll('[data-boss-start]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const bossId = btn.getAttribute('data-boss-start');
                    this.startBossDungeonBattle(bossId);
                });
            });
            content.querySelectorAll('[data-boss-sweep]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const bossId = btn.getAttribute('data-boss-sweep');
                    this.startBossDungeonSweep(bossId);
                });
            });
        }
,
        openBossDropInfo(bossId) {
            const drops = window.GAME_DATA?.bossExclusiveDropTables?.[bossId] || [];
            const boss = window.GAME_DATA.monsters.find(m => m.id === bossId);
            if (!boss) return;
            if (!drops.length) {
                this.showBossDropPopup("드랍 정보", "<div class='empty-msg'>이 보스의 전용 드랍 정보가 아직 없습니다.</div>");
                return;
            }
            const rows = drops.map(drop => {
                const item = window.GAME_DATA.items[drop.itemId];
                if (!item) return null;
                const qtyText = drop.maxQty && drop.maxQty > (drop.minQty || 1)
                    ? ` (${drop.minQty || 1}~${drop.maxQty}개)`
                    : '';
                const displayName = this.getItemDisplayName(drop.itemId, item);
                return `<div class="boss-drop-row ${this.isBossExclusiveItem(drop.itemId) ? 'boss-exclusive' : ''}">
                    <span class="boss-drop-name">${displayName}</span>
                    <span class="boss-drop-chance">${(Number(drop.chance || 0) * 100).toFixed(1)}%${qtyText}</span>
                </div>`;
            }).filter(Boolean);
            this.showBossDropPopup(`${boss.name} 전용 드랍`, `<div class="boss-drop-list">${rows.join('')}</div>`);
        }
,
        showBossDropPopup(title, bodyHtml) {
            const host = document.getElementById('modal-content');
            if (!host) return;
            const old = host.querySelector('.boss-drop-popup');
            if (old) old.remove();
            const popup = document.createElement('div');
            popup.className = 'boss-drop-popup';
            popup.innerHTML = `
                <div class="boss-drop-popup-card">
                    <div class="boss-drop-popup-head">
                        <strong>${title}</strong>
                        <button type="button" class="action-btn small" id="btn-close-boss-drop-popup">닫기</button>
                    </div>
                    <div class="boss-drop-popup-body">${bodyHtml}</div>
                </div>
            `;
            host.appendChild(popup);
            popup.querySelector('#btn-close-boss-drop-popup')?.addEventListener('click', () => popup.remove());
        }
,
        startBossDungeonBattle(bossId, options = {}) {
            if (this.state.battle || this.state.world.isNavigating) return;
            const unlocked = this.state.world.bossDungeonUnlocked?.[bossId];
            if (!unlocked) {
                this.log("해당 보스는 아직 던전에서 도전할 수 없습니다.", "system");
                return;
            }
            const bossData = window.GAME_DATA.monsters.find(m => m.id === bossId && m.isBoss);
            if (!bossData) return;
            const forceAutoOff = options.forceAutoOff !== false;
            const hadAutoExplore = !!this.state.player.autoExploreEnabled;
            const hadAutoBattle = !!this.state.player.autoBattleEnabled;
            this.state.player.autoExploreEnabled = false;
            if (forceAutoOff) this.state.player.autoBattleEnabled = false;
            if (this.autoExploreTimer) {
                clearTimeout(this.autoExploreTimer);
                this.autoExploreTimer = null;
            }
            if ((hadAutoExplore || hadAutoBattle) && forceAutoOff) {
                this.log("[보스 던전] 자동순례/자동전투를 OFF로 전환하고 전투에 진입합니다.", "system");
            }
            const modal = document.getElementById('modal-overlay');
            if (modal) modal.classList.add('hidden');
            this.log(`[보스 던전] ${bossData.name}에게 도전합니다.`, "battle");
            this.startBattle(JSON.parse(JSON.stringify(bossData)), { source: 'boss_dungeon', bossId });
            this.updateAutoBattleButton();
            this.updateAutoExploreButton();
            this.saveGame();
        }
,
        startBossDungeonSweep(bossId) {
            if (!bossId) return;
            const clearCount = Number(this.state.world.bossClearHistory?.[bossId]?.clearCount || 0);
            if (clearCount <= 0) {
                this.log("[보스 소탕] 최초 클리어 이력이 있어야 소탕을 시작할 수 있습니다.", "system");
                return;
            }
            if (this.state.battle || this.state.world.isNavigating) return;
            const unlocked = this.state.world.bossDungeonUnlocked?.[bossId];
            if (!unlocked) {
                this.log("[보스 소탕] 해당 보스가 아직 해금되지 않았습니다.", "system");
                return;
            }
            this.state.player.autoExploreEnabled = false;
            this.state.player.autoBattleEnabled = true;
            if (this.autoExploreTimer) {
                clearTimeout(this.autoExploreTimer);
                this.autoExploreTimer = null;
            }
            this.state.world.bossDungeonAuto = {
                active: true,
                bossId,
                startedAt: Date.now(),
                runCount: 0
            };
            const modal = document.getElementById('modal-overlay');
            if (modal) modal.classList.add('hidden');
            this.log("[보스 소탕] 자동전투 ON · 반복 도전을 시작합니다. 자동전투를 OFF로 바꾸면 소탕이 중지됩니다.", "system");
            this.startBossDungeonBattle(bossId, { forceAutoOff: false });
        }
    });
})();
