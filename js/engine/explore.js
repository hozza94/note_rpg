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
            const table = {
                pishon: 1,
                gihon: 1.1,
                hidekel: 1.22,
                euphrates: 1.45,
                eden_core: 1.68,
                periphery: 1.82,
                void_remnant: 1.95,
                infernal_pandemonium: 2.05,
                astral_abyss: 2.18,
                fallen_paradise: 2.28,
                twilight_reach: 2.38
            };
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
        /** 스킬 데이터에 없을 때 자동전투용 기본 ai (role·쿨다운·반복 패널티) */
        getDefaultSkillAi(skillData) {
            if (!skillData || skillData.bossOnly) return null;
            if (skillData.type === 'passive') return null;
            const eff = skillData.effect || {};
            if (eff.cleanse) return { role: 'cleanse', weight: 1.12, cooldownTurns: 2, maxHpRatio: 1, repeatPenalty: 0.42 };
            if (skillData.type === 'buff' && skillData.scaling?.heal) {
                return { role: 'heal', weight: 1, cooldownTurns: 2, maxHpRatio: 0.55, burstBonus: 0, setupBonus: 0.08, repeatPenalty: 0.38 };
            }
            if (skillData.type === 'buff') {
                return { role: 'defense', weight: 1, cooldownTurns: 3, maxHpRatio: 0.9, repeatPenalty: 0.4 };
            }
            if (skillData.type === 'attack') {
                return { role: 'attack', weight: 1, cooldownTurns: 1, burstBonus: 0.42, setupBonus: 0.14, repeatPenalty: 0.36 };
            }
            return { role: 'unknown', weight: 0.45, cooldownTurns: 2, repeatPenalty: 0.3 };
        },
        /** GAME_DATA.skills[id].ai 가 있으면 기본값 위에 병합 */
        resolveSkillAi(skillData) {
            const d = this.getDefaultSkillAi(skillData);
            const c = skillData.ai && typeof skillData.ai === 'object' ? skillData.ai : {};
            return { ...(d || { role: 'unknown', weight: 0.5, cooldownTurns: 1, repeatPenalty: 0.3 }), ...c };
        },
        /**
         * 자동전투: 후보 스킬 점수화 + 상위 후보 가중 랜덤.
         * 스킬별 `ai` 메타는 `js/data.js` skills.*.ai 참고.
         */
        pickAutoBattleSkillAction() {
            const battle = this.state.battle;
            const p = this.state.player;
            if (!battle?.monster || !battle.isPlayerTurn) return null;
            const combined = this.getPlayerCombinedStats();
            const hpRatio = combined.hp > 0 ? p.hp / combined.hp : 1;
            const m = battle.monster;
            const enemyHpRatio = m.maxHp > 0 ? m.hp / m.maxHp : 1;
            const turn = Number(battle.turn || 1);
            const autoState = (battle.autoState ||= {});
            autoState.skillLastTurn ||= {};
            const fx = battle.effects?.player || {};
            const activeSkills = this.getActiveSkills();
            const scored = [];

            for (const skill of activeSkills) {
                const skillData = window.GAME_DATA.skills[skill.id];
                if (!skillData || skillData.bossOnly) continue;
                const ppCost = Number(skill.cost ?? skillData.cost ?? 0);
                if (p.pp < ppCost) continue;
                const ai = this.resolveSkillAi(skillData);
                if (!ai) continue;

                if (Number(ai.minHpRatio || 0) > 0 && hpRatio < Number(ai.minHpRatio)) continue;
                if (Number(ai.maxHpRatio ?? 1) < 1 && hpRatio > Number(ai.maxHpRatio)) continue;
                if (Number(ai.minEnemyHpRatio || 0) > 0 && enemyHpRatio < Number(ai.minEnemyHpRatio)) continue;
                if (Number(ai.maxEnemyHpRatio ?? 1) < 1 && enemyHpRatio > Number(ai.maxEnemyHpRatio)) continue;

                const cd = Math.max(0, Number(ai.cooldownTurns || 0));
                if (cd > 0) {
                    const last = autoState.skillLastTurn[skill.id];
                    if (last != null && turn - last < cd) continue;
                }

                let score = Number(ai.weight || 1) * 10;
                const role = String(ai.role || 'attack');

                if (role === 'cleanse') {
                    const need = (fx.fearTurns > 0) || (fx.spdDebuffTurns > 0 && fx.spdDebuffMul < 1);
                    if (need) score += 40;
                    else score *= 0.1;
                } else if (role === 'heal') {
                    score += (1 - hpRatio) * 36;
                } else if (role === 'defense' || role === 'buff') {
                    score += Math.max(0, 0.55 - hpRatio) * 28;
                    if (enemyHpRatio > 0.32) score += 6;
                } else if (role === 'attack') {
                    const atkMul = Number(skillData.effect?.atkMul || 1);
                    score += atkMul * 7.5;
                    const sc = skillData.scaling?.damage;
                    if (sc && typeof sc === 'object') {
                        score += Number(sc.base || 0) * 0.075 + Number(sc.atk || 0) * 13 + Number(sc.faith || 0) * 2.1;
                    }
                    const burst = Number(ai.burstBonus ?? 0.42);
                    score += burst * 17 * (1 - enemyHpRatio);
                    const setup = Number(ai.setupBonus ?? 0.14);
                    score += setup * 12 * enemyHpRatio * Math.min(1, hpRatio + 0.12);
                } else {
                    score *= 0.85;
                }

                if (autoState.lastAutoSkillId === skill.id) {
                    const pen = Number(ai.repeatPenalty ?? 0.35);
                    score *= Math.max(0.1, 1 - pen);
                }

                if (score > 0.02) scored.push({ skill, score });
            }

            if (scored.length === 0) return null;
            scored.sort((a, b) => b.score - a.score);
            const top = scored.slice(0, Math.min(4, scored.length));
            const minW = 0.5;
            let total = 0;
            const weights = top.map((x) => {
                const w = Math.max(minW, x.score);
                total += w;
                return w;
            });
            let r = Math.random() * total;
            for (let i = 0; i < top.length; i++) {
                r -= weights[i];
                if (r <= 0) return top[i].skill;
            }
            return top[top.length - 1].skill;
        },
        executeAutoBattleTurn() {
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.state.battle.monster?.isBoss && !this.canUseAutoBattleOnCurrentBoss()) return;
            const turn = Number(this.state.battle.turn || 1);
            const autoState = (this.state.battle.autoState ||= {});
            autoState.skillLastTurn ||= {};

            const picked = this.pickAutoBattleSkillAction();
            if (picked) {
                autoState.skillLastTurn[picked.id] = turn;
                autoState.lastAutoSkillId = picked.id;
                return this.useSkill(picked);
            }
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
                    const roll = Math.random();
                    const regionId = this.state.world.currentRegionId || 'pishon';
                    const regionData = window.GAME_DATA.regions[regionId];
                    if (roll < 0.75) {
                        const normalGrades = window.GAME_DATA.meta?.monsterGradeOrder || ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
                        // 지역 필드 풀만 사용(플레이어 레벨로 약한 몹을 고르지 않음). 강행 진입 시에도 해당 지역 몬스터만 조우.
                        const monsterList = window.GAME_DATA.monsters.filter(m =>
                            m.regionId === regionId &&
                            !m.isBoss &&
                            normalGrades.includes(m.grade) &&
                            (!regionData || m.id !== regionData.bossId)
                        );
                        if (monsterList.length > 0) {
                            const picked = this.pickWeightedFieldMonster(monsterList);
                            const raw = JSON.parse(JSON.stringify(picked));
                            this.applyFieldMonsterRegionScaling(raw, regionId);
                            this.startBattle(raw);
                        } else {
                            this.log("이 지역에 조우 가능한 일반 몬스터가 없습니다. 데이터를 확인해 주세요.", "system");
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
                this.showConfirmModal({
                    title: '지역 이동',
                    message: `⚠️ 경고: [${nextRegion.name}]의 권장 진입 레벨은 ${nextRegion.minLevel}입니다.\n현재 레벨(${playerLevel})로는 매우 위험할 수 있습니다. 그래도 이동하시겠습니까?`,
                    confirmText: '이동',
                    cancelText: '취소',
                    danger: true
                }).then((proceed) => {
                    if (!proceed) return;
                    this.moveToRegion(nextRegionId);
                });
                return;
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
