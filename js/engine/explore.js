/**
 * Basileia - Explore/Automation Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        canUseAutoBattleOnCurrentBoss() {
            const battle = this.state.battle;
            if (!battle?.monster?.isBoss) return true;
            const source = battle.source || 'field';
            if (source !== 'boss_dungeon') return false;
            const bossId = battle.bossId || battle.monster.id;
            const clearCount = Number(this.state.world?.bossClearHistory?.[bossId]?.clearCount || 0);
            return clearCount > 0;
        },
        showVerseOverlay(verseText, reference) {
            const overlay = document.getElementById('verse-overlay');
            const content = document.getElementById('verse-content');
            const ref = document.getElementById('verse-ref');
            if (this.verseTimer) {
                clearTimeout(this.verseTimer);
                this.verseTimer = null;
            }
            content.innerText = verseText;
            ref.innerText = reference;
            overlay.classList.remove('hidden');
            this.verseTimer = setTimeout(() => {
                this.verseTimer = null;
                this.hideVerseOverlay();
            }, 3000);
        },
        hideVerseOverlay() {
            document.getElementById('verse-overlay').classList.add('hidden');
            if (this.verseTimer) {
                clearTimeout(this.verseTimer);
                this.verseTimer = null;
            }
        },
        updateAutoBattleButton() {
            const btn = document.getElementById('btn-auto-battle');
            if (!btn) return;
            btn.classList.remove('hidden');
            const enabled = !!this.state.player.autoBattleEnabled;
            const isBossFight = !!(this.state.battle?.monster?.isBoss);
            const canBossAuto = this.canUseAutoBattleOnCurrentBoss();
            if (isBossFight && !canBossAuto) {
                btn.innerText = '🤖 자동전투 잠금(보스)';
            } else if (isBossFight && canBossAuto) {
                btn.innerText = `🤖 자동전투(보스) ${enabled ? 'ON' : 'OFF'}`;
            } else {
                btn.innerText = `🤖 자동전투 ${enabled ? 'ON' : 'OFF'}`;
            }
            btn.classList.toggle('auto-on', enabled);
            btn.disabled = isBossFight && !canBossAuto;
        },
        updateAutoExploreButton() {
            const btn = document.getElementById('btn-auto-explore');
            if (!btn) return;
            const enabled = !!this.state.player.autoExploreEnabled;
            btn.innerText = `🧭 자동순례 ${enabled ? 'ON' : 'OFF'}`;
            btn.classList.toggle('auto-on', enabled);
        },
        hasBlockingOverlayOpen() {
            const ids = ['modal-overlay', 'settings-overlay', 'auth-overlay', 'verse-overlay'];
            return ids.some(id => {
                const el = document.getElementById(id);
                return el && !el.classList.contains('hidden');
            });
        },
        performAutoExploreRecoveryIfNeeded() {
            if (this.state.battle || this.state.world.isNavigating) return false;
            const totals = this.getPlayerCombinedStats();
            const hpRatio = totals.hp > 0 ? (this.state.player.hp / totals.hp) : 1;
            const ppRatio = totals.pp > 0 ? (this.state.player.pp / totals.pp) : 1;
            if (hpRatio <= 0.45) {
                this.log("[자동순례] 체력이 낮아 휴식을 우선 수행합니다.", "system");
                this.rest();
                return true;
            }
            if (ppRatio <= 0.3) {
                this.log("[자동순례] PP가 낮아 예배를 우선 수행합니다.", "system");
                this.worship();
                return true;
            }
            return false;
        },
        /** 지역이 올라갈수록 필드 일반몹 스탯 배율(보스·보스던전 제외) */
        getRegionFieldStatScale(regionId) {
            const table = { pishon: 1, gihon: 1.1, hidekel: 1.22, euphrates: 1.45, eden_core: 1.68, periphery: 1.82, void_remnant: 1.95 };
            return table[regionId] || 1;
        },
        applyFieldMonsterRegionScaling(monster, regionId) {
            if (!monster || monster.isBoss || !monster.stats) return;
            const s = this.getRegionFieldStatScale(regionId);
            if (s === 1) return;
            const st = monster.stats;
            st.hp = Math.max(1, Math.round(st.hp * s));
            st.atk = Math.max(1, Math.round(st.atk * s));
            st.def = Math.max(0, Math.round(st.def * s));
            st.spd = Math.max(1, Math.round(st.spd * s));
        },
        /** 같은 지역 풀 안에서 등급·레벨이 높은 몹이 더 잘 나오도록 가중 랜덤 */
        pickWeightedFieldMonster(monsterList) {
            if (!monsterList || monsterList.length === 0) return null;
            if (monsterList.length === 1) return monsterList[0];
            const gradeWeight = { F: 1, E: 1.4, D: 2.1, C: 3.2, B: 5, A: 8, S: 12, SS: 18, SSS: 26 };
            const weights = monsterList.map(m => {
                const gw = gradeWeight[m.grade] || 1;
                const lv = m.level || 1;
                return gw * (1 + lv * 0.035);
            });
            const total = weights.reduce((a, b) => a + b, 0);
            let r = Math.random() * total;
            for (let i = 0; i < monsterList.length; i++) {
                r -= weights[i];
                if (r <= 0) return monsterList[i];
            }
            return monsterList[monsterList.length - 1];
        },
        scheduleAutoExplore(delayMs = 800) {
            if (!this.state.player.autoExploreEnabled) return;
            if (this.autoExploreTimer) clearTimeout(this.autoExploreTimer);
            this.autoExploreTimer = setTimeout(() => {
                if (!this.state.player.autoExploreEnabled) return;
                if (this.state.battle || this.state.world.isNavigating) return;
                if (this.hasBlockingOverlayOpen()) return this.scheduleAutoExplore(1200);
                if (this.performAutoExploreRecoveryIfNeeded()) return this.scheduleAutoExplore(1400);
                this.explore();
            }, delayMs);
        },
        scheduleAutoBattleTurn(delayMs = 420) {
            if (!this.state.player.autoBattleEnabled) return;
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.state.battle.monster?.isBoss && !this.canUseAutoBattleOnCurrentBoss()) return;
            setTimeout(() => {
                if (!this.state.player.autoBattleEnabled) return;
                if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
                if (this.state.battle.monster?.isBoss && !this.canUseAutoBattleOnCurrentBoss()) return;
                this.executeAutoBattleTurn();
            }, delayMs);
        },
        executeAutoBattleTurn() {
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.state.battle.monster?.isBoss && !this.canUseAutoBattleOnCurrentBoss()) return;
            const combined = this.getPlayerCombinedStats();
            const hpRatio = combined.hp > 0 ? (this.state.player.hp / combined.hp) : 1;
            const activeSkills = this.getActiveSkills();
            const turn = Number(this.state.battle.turn || 1);
            const autoState = (this.state.battle.autoState ||= {});
            const meditation = activeSkills.find(s => s.id === 'meditation');
            if (meditation && this.state.player.pp >= (meditation.cost || 0)) {
                const canUseMeditationAgain = !autoState.lastMeditationTurn || (turn - autoState.lastMeditationTurn >= 3);
                // 저체력에서만 사용 + 연속 난사 방지(최소 3턴 간격)
                if (hpRatio <= 0.32 && canUseMeditationAgain) {
                    autoState.lastMeditationTurn = turn;
                    return this.useSkill(meditation);
                }
            }
            if (hpRatio < 0.42) {
                const defensiveSkill = activeSkills.find(s => s.type === 'buff' && this.state.player.pp >= (s.cost || 0) && ((s.effect?.defMul || 1) > 1 || (s.effect?.evade || 0) > 0));
                if (defensiveSkill) return this.useSkill(defensiveSkill);
            }
            const attackSkills = activeSkills
                .filter(skill => skill.type === 'attack' && this.state.player.pp >= (skill.cost || 0))
                .sort((a, b) => (b.effect?.atkMul || 1) - (a.effect?.atkMul || 1));
            if (attackSkills.length > 0) return this.useSkill(attackSkills[0]);
            this.playerAttack();
        },
        toggleAutoBattle() {
            if (this.state.battle?.monster?.isBoss && !this.canUseAutoBattleOnCurrentBoss()) {
                this.log("[전투] 보스전에서는 자동전투를 사용할 수 없습니다.", "system");
                this.state.player.autoBattleEnabled = false;
                this.updateAutoBattleButton();
                this.saveGame();
                return;
            }
            this.state.player.autoBattleEnabled = !this.state.player.autoBattleEnabled;
            if (!this.state.player.autoBattleEnabled && this.state.world?.bossDungeonAuto?.active) {
                this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 };
                this.log("[보스 소탕] 자동전투 OFF로 소탕이 중지되었습니다.", "system");
            }
            this.updateAutoBattleButton();
            this.log(`[전투] 자동전투를 ${this.state.player.autoBattleEnabled ? '활성화' : '비활성화'}했습니다.`, "system");
            this.saveGame();
            if (this.state.player.autoBattleEnabled) this.scheduleAutoBattleTurn(120);
        },
        toggleAutoExplore() {
            this.state.player.autoExploreEnabled = !this.state.player.autoExploreEnabled;
            if (this.state.player.autoExploreEnabled && !this.state.player.autoBattleEnabled) {
                this.state.player.autoBattleEnabled = true;
                this.log("[자동순례] 전투 연계를 위해 자동전투를 함께 활성화합니다.", "system");
            }
            if (!this.state.player.autoExploreEnabled && this.autoExploreTimer) {
                clearTimeout(this.autoExploreTimer);
                this.autoExploreTimer = null;
            }
            this.updateAutoExploreButton();
            this.updateAutoBattleButton();
            this.log(`[자동순례] ${this.state.player.autoExploreEnabled ? '활성화' : '비활성화'}되었습니다.`, "system");
            this.saveGame();
            if (this.state.player.autoExploreEnabled) this.scheduleAutoExplore(180);
        },
        explore() {
            if (this.state.world.isNavigating || this.state.battle) return;
            this.state.world.isNavigating = true;
            this.log("주변을 탐험합니다...", "info");
            setTimeout(() => {
                try {
                    if (this.state.world.explorationProgress >= 100 && !this.state.world.bossDefeated) {
                        if (this.state.player.autoBattleEnabled) {
                            this.log("[자동전투] 보스전 진입을 건너뛰고 일반 탐험을 계속합니다.", "system");
                        } else {
                            this.state.world.isNavigating = false;
                            this.bossChallenge();
                            return;
                        }
                    }
                    const playerLv = this.state.player.level || 1;
                    const roll = Math.random();
                    const regionId = this.state.world.currentRegionId || 'pishon';
                    const regionData = window.GAME_DATA.regions[regionId];
                    if (roll < 0.75) {
                        const normalGrades = window.GAME_DATA.meta?.monsterGradeOrder || ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
                        const monsterList = window.GAME_DATA.monsters.filter(m =>
                            m.regionId === regionId &&
                            normalGrades.includes(m.grade) &&
                            m.minPlayerLv <= playerLv &&
                            m.maxPlayerLv >= playerLv &&
                            (!regionData || m.id !== regionData.bossId)
                        );
                        if (monsterList.length === 0) {
                            const fallback = window.GAME_DATA.monsters.filter(m => m.grade === 'F');
                            const raw = JSON.parse(JSON.stringify(fallback[Math.floor(Math.random() * fallback.length)]));
                            this.applyFieldMonsterRegionScaling(raw, regionId);
                            this.startBattle(raw);
                        } else {
                            const picked = this.pickWeightedFieldMonster(monsterList);
                            const raw = JSON.parse(JSON.stringify(picked));
                            this.applyFieldMonsterRegionScaling(raw, regionId);
                            this.startBattle(raw);
                        }
                    } else {
                        this.log("고요한 길을 따라 걷습니다. 아무 일도 일어나지 않았습니다.", "info");
                    }
                } catch (err) {
                    console.error("Explore Error:", err);
                    this.log("탐험 중 알 수 없는 문제가 발생했습니다.", "system");
                } finally {
                    this.state.world.isNavigating = false;
                    this.updateUI();
                    if (this.state.player.autoExploreEnabled && !this.state.battle) this.scheduleAutoExplore(700);
                }
            }, 800);
        },
        bossChallenge() {
            if (this.state.world.isNavigating || this.state.battle) return;
            if (this.state.player.autoBattleEnabled) {
                this.log("[자동전투] ON 상태에서는 보스전에 진입할 수 없습니다. 자동전투를 OFF로 전환해 주세요.", "system");
                return;
            }
            const regionData = window.GAME_DATA.regions[this.state.world.currentRegionId];
            const bossId = regionData.bossId;
            const bossData = window.GAME_DATA.monsters.find(m => m.id === bossId);
            if (!bossData) return;
            this.log(`${regionData.name}의 강력한 기운이 확산됩니다... ${bossData.name}와(과) 조우했습니다!`, "battle");
            const bossMonster = JSON.parse(JSON.stringify(bossData));
            bossMonster.isBoss = true;
            this.log("장대한 기운이 흐르며 전장이 뒤틀립니다...", "effect");
            this.startBattle(bossMonster, { source: 'region_progress', bossId });
        },
        getPreviousRegionId(regionId = this.state.world.currentRegionId) {
            const regions = window.GAME_DATA?.regions || {};
            const prevEntry = Object.values(regions).find(r => r?.nextRegionId === regionId);
            return prevEntry?.id || null;
        },
        handlePreviousRegionTransition() {
            const currentRegionId = this.state.world.currentRegionId;
            const prevRegionId = this.getPreviousRegionId(currentRegionId);
            if (!prevRegionId) {
                this.log("이전 지역이 없습니다.", "system");
                return;
            }
            this.moveToRegion(prevRegionId);
        },
        handleRegionTransition() {
            const currentRegion = window.GAME_DATA.regions[this.state.world.currentRegionId];
            const nextRegionId = currentRegion?.nextRegionId || null;
            if (!nextRegionId) return;
            const nextRegion = window.GAME_DATA.regions[nextRegionId];
            const playerLevel = this.state.player.level;
            if (playerLevel < nextRegion.minLevel) {
                const proceed = confirm(`⚠️ 경고: [${nextRegion.name}]의 권장 진입 레벨은 ${nextRegion.minLevel}입니다.\n현재 레벨(${playerLevel})로는 매우 위험할 수 있습니다. 그래도 이동하시겠습니까?`);
                if (!proceed) return;
            }
            this.moveToRegion(nextRegionId);
        },
        moveToRegion(regionId) {
            const region = window.GAME_DATA.regions[regionId];
            this.state.world.currentRegionId = regionId;
            this.state.world.explorationProgress = 0;
            this.state.world.bossDefeated = false;
            this.updateBossDungeonUnlocks();
            this.log(`✨ 새로운 지역: [${region.name}]에 도착했습니다.`, "system");
            this.log(`📜 ${region.description}`, "info");
            this.updateUI();
            this.saveGame();
        },
        worship() {
            const totals = this.getPlayerCombinedStats();
            const totalMaxPp = totals.pp;
            const totalMaxHp = totals.hp;
            const hpMissing = Math.max(0, totalMaxHp - this.state.player.hp);
            const ppMissing = Math.max(0, totalMaxPp - this.state.player.pp);
            if (ppMissing <= 0 && hpMissing <= 0) return this.log("이미 영적으로 충만하고 몸도 회복된 상태입니다.", "system");
            this.log("조용히 눈을 감고 예배를 드립니다...", "info");
            setTimeout(() => {
                const hpRecoverAmount = Math.max(1, Math.floor(totalMaxHp * 0.2));
                this.state.player.pp = totalMaxPp;
                this.state.player.hp = Math.min(totalMaxHp, this.state.player.hp + hpRecoverAmount);
                const pool = window.GAME_DATA?.worshipVerses;
                const fallback = [
                    { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
                    { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" }
                ];
                const verses = Array.isArray(pool) && pool.length ? pool : fallback;
                const verse = verses[Math.floor(Math.random() * verses.length)];
                this.log(`[묵상] ${verse.text} (${verse.ref})`, "system");
                this.log(`[예배 회복] 체력 +${Math.min(hpMissing, hpRecoverAmount)} · PP 전량 회복`, "effect");
                this.showVerseOverlay(verse.text, verse.ref);
                this.updateUI();
                this.saveGame();
            }, 1000);
        },
        rest() {
            const totalMaxHp = this.getPlayerCombinedStats().hp;
            this.log("잠시 휴식을 취하며 체력을 회복합니다.", "info");
            const healAmount = Math.max(1, Math.floor(totalMaxHp * 0.5));
            const before = this.state.player.hp;
            this.state.player.hp = Math.min(totalMaxHp, this.state.player.hp + healAmount);
            const actual = this.state.player.hp - before;
            this.log(`휴식하여 HP +${actual} 회복했습니다.`, "effect");
            this.updateUI();
            this.saveGame();
        }
    });
})();
