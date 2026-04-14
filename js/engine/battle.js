/**
 * Basileia - Battle Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        renderBattleStatus() {
            const statusEl = document.getElementById('battle-status');
            if (!statusEl || !this.state.battle) return;
            const effects = this.state.battle.effects;
            const chips = [];
            if (effects.player.defMulTurns > 0) chips.push(`<span class="status-chip player">수호 ${effects.player.defMulTurns}턴</span>`);
            if (effects.player.evadeTurns > 0) chips.push(`<span class="status-chip player">회피 ${effects.player.evadeTurns}턴</span>`);
            if (effects.player.fearTurns > 0) chips.push(`<span class="status-chip player">공포 ${effects.player.fearTurns}턴</span>`);
            if (effects.monster.spdDebuffTurns > 0) chips.push(`<span class="status-chip monster">적 둔화 ${effects.monster.spdDebuffTurns}턴</span>`);
            if (chips.length === 0) {
                statusEl.classList.add('hidden');
                statusEl.innerHTML = '';
                return;
            }
            statusEl.classList.remove('hidden');
            statusEl.innerHTML = chips.join('');
        },
        toggleBattleUI(isBattle) {
            document.getElementById('explore-actions').classList.toggle('hidden', isBattle);
            document.getElementById('battle-actions').classList.toggle('hidden', !isBattle);
            document.getElementById('battle-scene').classList.toggle('hidden', !isBattle);
            this.updateAutoBattleButton();
            this.updateAutoExploreButton();
            if (isBattle) this.scheduleAutoBattleTurn(500);
        },
        spawnDamagePopup(targetEl, value, isCrit, isMonsterDamage) {
            const rect = targetEl.getBoundingClientRect();
            const popup = document.createElement('div');
            popup.className = `damage-popup ${isCrit ? 'critical' : ''} ${isMonsterDamage ? 'monster-dmg' : ''}`;
            popup.innerText = (isCrit ? 'CRITICAL! ' : '') + Math.round(value);
            const randomX = (Math.random() - 0.5) * 40;
            popup.style.left = `${rect.left + rect.width / 2 + randomX}px`;
            popup.style.top = `${rect.top}px`;
            document.body.appendChild(popup);
            setTimeout(() => popup.remove(), 1000);
        },
        startBattle(monster, options = {}) {
            monster.maxHp = monster.stats.hp;
            monster.hp = monster.stats.hp;
            const bossId = options.bossId || monster.id || null;
            const bossClearCount = Number(this.state.world?.bossClearHistory?.[bossId]?.clearCount || 0);
            const bossAutoAllowed = !!(monster.isBoss && options.source === 'boss_dungeon' && bossClearCount > 0);
            if (monster.isBoss) {
                const totals = this.getPlayerCombinedStats();
                this.state.player.hp = totals.hp;
                this.state.player.pp = totals.pp;
                this.log("[보스전 준비] 전투 시작과 함께 HP/PP가 전부 회복되었습니다.", "system");
            }
            if (monster.isBoss && this.state.player.autoBattleEnabled && !bossAutoAllowed) {
                this.state.player.autoBattleEnabled = false;
                this.log("[전투] 보스전 진입으로 자동전투가 자동 해제되었습니다.", "system");
            }
            this.state.battle = {
                monster,
                source: options.source || 'field',
                bossId,
                isPlayerTurn: true,
                turn: 1,
                effects: {
                    player: { defMulTurns: 0, defMulValue: 1, evadeTurns: 0, evadeChance: 0, spdMulTurns: 0, spdMulValue: 1, nextCritChance: 0, fearTurns: 0, spdDebuffTurns: 0, spdDebuffMul: 1 },
                    monster: { spdDebuffTurns: 0, spdDebuffMul: 1 }
                },
                flags: { lowHpCutscenePlayed: false }
            };
            document.getElementById('monster-name').innerText = monster.name;
            document.getElementById('monster-grade').innerText = monster.grade;
            document.getElementById('monster-level').innerText = `Lv.${monster.level}`;
            this.toggleBattleUI(true);
            this.log(`${monster.name}(이)가 나타났습니다!`, "battle");
            this.updateUI();
            const bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
            const totalSpd = this.getPlayerSpeed(bonus);
            const monsterSpeed = this.getMonsterSpeed();
            if (monsterSpeed > totalSpd) {
                this.state.battle.isPlayerTurn = false;
                setTimeout(() => this.monsterTurn(), 1000);
            }
        },
        getBattleEffects() { return this.state.battle?.effects || null; },
        getPlayerSpeed(bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData))) { const passive = this.getPassiveBonuses(); const base = this.state.player.spd + bonus.spd + passive.spd; const effects = this.getBattleEffects(); if (!effects) return base; const playerFx = effects.player; return Math.max(1, base * playerFx.spdMulValue * playerFx.spdDebuffMul); },
        getMonsterSpeed() { if (!this.state.battle) return 0; const base = this.state.battle.monster.stats.spd; const monsterFx = this.state.battle.effects.monster; return Math.max(1, base * monsterFx.spdDebuffMul); },
        resolveFearCheck() { const effects = this.getBattleEffects(); if (!effects || effects.player.fearTurns <= 0) return false; const blocked = Math.random() < 0.5; if (blocked) { this.log("공포에 사로잡혀 잠시 움직이지 못했습니다!", "battle"); effects.player.fearTurns = Math.max(0, effects.player.fearTurns - 1); } return blocked; },
        applySkillEffectToTarget(effect, isMonsterCaster = false) { const effects = this.getBattleEffects(); if (!effects || !effect) return; if (isMonsterCaster) { if (effect.fear) { effects.player.fearTurns = Math.max(effects.player.fearTurns, 1); this.log("적의 공포가 당신의 마음을 짓누릅니다.", "battle"); } if (effect.spdDebuff) { effects.player.spdDebuffTurns = Math.max(effects.player.spdDebuffTurns, 2); effects.player.spdDebuffMul = Math.min(effects.player.spdDebuffMul, effect.spdDebuff); this.log("당신의 움직임이 둔화되었습니다.", "battle"); } return; } if (effect.spdDebuff) { effects.monster.spdDebuffTurns = Math.max(effects.monster.spdDebuffTurns, 2); effects.monster.spdDebuffMul = Math.min(effects.monster.spdDebuffMul, effect.spdDebuff); this.log("적의 속도가 감소했습니다.", "effect"); } },
        tickBattleEffects(endOfTurnForMonster = false) { const effects = this.getBattleEffects(); if (!effects) return; const { player, monster } = effects; if (!endOfTurnForMonster) return; if (player.defMulTurns > 0 && --player.defMulTurns === 0) player.defMulValue = 1; if (player.evadeTurns > 0 && --player.evadeTurns === 0) player.evadeChance = 0; if (player.spdMulTurns > 0 && --player.spdMulTurns === 0) player.spdMulValue = 1; if (player.fearTurns > 0) player.fearTurns--; if (player.spdDebuffTurns > 0 && --player.spdDebuffTurns === 0) player.spdDebuffMul = 1; if (monster.spdDebuffTurns > 0 && --monster.spdDebuffTurns === 0) monster.spdDebuffMul = 1; },
        applyFaithBonusDamage(dmg, monster) { const totalFaith = this.getPlayerCombinedStats().faith; const faithGap = totalFaith - (monster.requiredFaith || 0); if (faithGap <= 0) return dmg; return dmg * (1 + Math.min(0.2, faithGap * 0.05)); },
        applyLifeStealFromDamage(damage) { const dealt = Math.max(0, Math.floor(Number(damage) || 0)); if (dealt <= 0) return; const combined = this.getPlayerCombinedStats(); const lifeStealRatio = Math.max(0, Number(combined.lifeSteal || 0)); if (lifeStealRatio <= 0) return; const maxHp = combined.hp; const beforeHp = this.state.player.hp; const healAmount = Math.max(0, Math.floor(dealt * lifeStealRatio)); if (healAmount <= 0) return; this.state.player.hp = Math.min(maxHp, this.state.player.hp + healAmount); const actual = this.state.player.hp - beforeHp; if (actual > 0) this.log(`[생명력 흡수] 피해 ${dealt}의 ${(lifeStealRatio * 100).toFixed(0)}% → HP +${actual}`, "effect"); },
        applyPostBattleHpRegen() { const combined = this.getPlayerCombinedStats(); const regen = Math.max(0, Math.floor(Number(combined.hpRegen || 0))); if (regen <= 0) return; const maxHp = combined.hp; const beforeHp = this.state.player.hp; this.state.player.hp = Math.min(maxHp, this.state.player.hp + regen); const actual = this.state.player.hp - beforeHp; if (actual > 0) this.log(`[체력재생] 전투 종료 후 HP +${actual}`, "effect"); },
        playerAttack() { if (!this.state.battle || !this.state.battle.isPlayerTurn) return; if (this.resolveFearCheck()) { this.state.battle.isPlayerTurn = false; setTimeout(() => this.monsterTurn(), 900); return; } const p = this.state.player; const combined = this.getPlayerCombinedStats(); const m = this.state.battle.monster; const effects = this.getBattleEffects(); const extraCrit = effects ? effects.player.nextCritChance : 0; const isCrit = Math.random() < Math.min(0.7, 0.1 + combined.critChance + extraCrit); if (effects) effects.player.nextCritChance = 0; const totalAtk = combined.atk; let dmg = this.calculateDamage(totalAtk, m.stats.def); dmg = this.applyFaithBonusDamage(dmg, m); dmg *= combined.damageMul; if (p.hp <= combined.hp * 0.5) dmg *= combined.lowHpDamageMul; if (isCrit) dmg *= (combined.critDamageMul || 1.5); dmg = Math.round(dmg); m.hp -= dmg; if (m.isBoss && !this.state.battle.flags.lowHpCutscenePlayed && m.hp <= m.maxHp * 0.3) { this.state.battle.flags.lowHpCutscenePlayed = true; this.log(`${m.name}의 형상이 흔들립니다... 마지막 저항이 시작됩니다!`, "effect"); } const targetEl = document.querySelector('.monster-card'); const sceneEl = document.getElementById('battle-scene'); if (isCrit) { sceneEl.classList.add('shake-heavy'); document.getElementById('app').classList.add('crit-flash'); setTimeout(() => { sceneEl.classList.remove('shake-heavy'); document.getElementById('app').classList.remove('crit-flash'); }, 500); } else { sceneEl.classList.add('shake'); setTimeout(() => sceneEl.classList.remove('shake'), 400); } this.spawnDamagePopup(targetEl, dmg, isCrit, false); this.log(`${m.name}에게 ${dmg}${isCrit ? '!!! (강력한 일격)' : ''}의 피해를 입혔습니다!`, "player"); this.applyLifeStealFromDamage(dmg); this.updateUI(); if (m.hp <= 0) return this.winBattle(); this.state.battle.isPlayerTurn = false; setTimeout(() => this.monsterTurn(), 1000); },
        monsterTurn() { if (!this.state.battle) return; const m = this.state.battle.monster; const p = this.state.player; const combined = this.getPlayerCombinedStats(); const effects = this.getBattleEffects(); const playerFx = effects?.player; const totalEvadeChance = Math.min(0.5, (playerFx?.evadeChance || 0) + combined.evadeChance); if (totalEvadeChance > 0 && Math.random() < totalEvadeChance) { this.log("찬양의 은혜로 공격을 회피했습니다!", "effect"); this.tickBattleEffects(true); this.state.battle.turn++; this.state.battle.isPlayerTurn = true; this.updateUI(); this.log("▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.", "system"); this.scheduleAutoBattleTurn(); return; } const monsterSkillId = this.chooseMonsterSkill(m); const skillData = monsterSkillId ? window.GAME_DATA.skills[monsterSkillId] : null; const skillEffect = skillData?.effect || { atkMul: 1 }; const atkMul = skillEffect.atkMul || 1; const totalDef = combined.def * (playerFx?.defMulValue || 1); const dmg = Math.round(this.calculateDamage(m.stats.atk * atkMul, totalDef)); const appliedDmg = Math.round(dmg * combined.damageTakenMul); p.hp -= appliedDmg; this.applySkillEffectToTarget(skillEffect, true); const targetEl = document.querySelector('.character-pane'); this.spawnDamagePopup(targetEl, appliedDmg, false, true); document.getElementById('app').classList.add('hit-flash'); setTimeout(() => document.getElementById('app').classList.remove('hit-flash'), 200); this.log(skillData ? `${m.name}의 [${skillData.name}]! ${appliedDmg}의 피해를 입었습니다.` : `${m.name}의 공격! ${appliedDmg}의 피해를 입었습니다.`, "enemy"); this.updateUI(); if (p.hp <= 0) return this.loseBattle(); this.tickBattleEffects(true); this.state.battle.turn++; this.state.battle.isPlayerTurn = true; this.log("▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.", "system"); this.scheduleAutoBattleTurn(); },
        pickWeightedSkillId(skillIds, weights) { if (!skillIds || skillIds.length === 0) return null; const w = weights && weights.length === skillIds.length ? weights : skillIds.map(() => 1); const sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum; for (let i = 0; i < skillIds.length; i++) { r -= w[i]; if (r <= 0) return skillIds[i]; } return skillIds[skillIds.length - 1]; },
        getMonsterSkillTreePool(monster) { const trees = window.GAME_DATA.monsterSkillTrees; const tree = monster.skillTreeId && trees ? trees[monster.skillTreeId] : null; if (tree) { const ratio = monster.maxHp > 0 ? monster.hp / monster.maxHp : 1; if (tree.lowHp && ratio < tree.lowHp.threshold) return { skillIds: tree.lowHp.skillIds, weights: tree.lowHp.weights }; return { skillIds: tree.defaultPool.skillIds, weights: tree.defaultPool.weights }; } if (monster.skills && monster.skills.length) return { skillIds: monster.skills, weights: null }; return null; },
        chooseMonsterSkill(monster) { const pool = this.getMonsterSkillTreePool(monster); if (!pool || !pool.skillIds.length) return null; if (Math.random() > 0.45) return null; return this.pickWeightedSkillId(pool.skillIds, pool.weights); },
        calculateDamage(atk, def) { const base = atk * (100 / (100 + def)); const random = 0.9 + Math.random() * 0.2; return base * random; },
        applyBossExclusiveDrops(bossId) {
            const table = window.GAME_DATA?.bossExclusiveDropTables?.[bossId];
            if (!Array.isArray(table) || table.length === 0) return;
            const pityMap = this.state.world.bossDropPity || {};
            const pityCount = Math.max(0, Number(pityMap[bossId] || 0));
            let rareDropped = false;
            table.forEach(drop => {
                const chance = Number(drop.chance || 0);
                const bonus = Math.min(0.12, pityCount * 0.005);
                const finalChance = Math.min(1, chance + bonus);
                if (Math.random() >= finalChance) return;
                const minQty = Math.max(1, Number(drop.minQty || 1));
                const maxQty = Math.max(minQty, Number(drop.maxQty || minQty));
                const qty = minQty + Math.floor(Math.random() * (maxQty - minQty + 1));
                this.addItem(drop.itemId, qty);
                const item = window.GAME_DATA.items[drop.itemId];
                if (item?.slot) {
                    rareDropped = true;
                    this.log(`[보스 전용 레어] ${item.name} 획득!`, "effect");
                }
            });
            pityMap[bossId] = rareDropped ? 0 : (pityCount + 1);
            this.state.world.bossDropPity = pityMap;
            if (!rareDropped) this.log(`[보스 보정] ${bossId} 레어 보정 스택이 ${pityMap[bossId]}로 증가했습니다.`, "system");
        },
        recordBossClear(bossId, turnCount = 0) {
            if (!bossId) return;
            const historyMap = this.state.world.bossClearHistory || {};
            const prev = historyMap[bossId] || { clearCount: 0, lastClearAt: null, bestTurn: null, firstClearRewarded: false };
            const clearCount = Number(prev.clearCount || 0) + 1;
            const bestTurn = prev.bestTurn === null ? turnCount : Math.min(Number(prev.bestTurn), turnCount || Number(prev.bestTurn));
            historyMap[bossId] = {
                clearCount,
                lastClearAt: Date.now(),
                bestTurn: Number.isFinite(bestTurn) ? bestTurn : null,
                firstClearRewarded: !!prev.firstClearRewarded
            };
            if (!prev.firstClearRewarded) {
                const rewardMap = {
                    wraith: 'echo_of_wraith',
                    mud_giant: 'heart_of_giant',
                    stone_seraph: 'seraph_feather',
                    abyss_hydra: 'hydra_venom_gem',
                    throne_guardian: 'guardian_oath'
                };
                const rewardItemId = rewardMap[bossId];
                if (rewardItemId) {
                    this.addItem(rewardItemId, 1);
                    const item = window.GAME_DATA.items[rewardItemId];
                    this.log(`[최초 클리어 보상] ${item?.name || rewardItemId} x1`, "system");
                }
                historyMap[bossId].firstClearRewarded = true;
            }
            this.state.world.bossClearHistory = historyMap;
        },
        winBattle() {
            const battleInfo = this.state.battle;
            const m = battleInfo.monster;
            this.log(`${m.name}을(를) 물리쳤습니다!`, "info");
            this.log(`경험치 ${m.reward.exp}, 골드 ${m.reward.gold}를 획득했습니다.`, "system");
            this.state.player.exp += m.reward.exp;
            this.state.player.gold += m.reward.gold;
            this.calculateDrops(m.dropTableId);
            if (m.isBoss) {
                const regionName = window.GAME_DATA.regions[this.state.world.currentRegionId].name;
                this.log(`[시나리오 달성] ${regionName}의 주인을 물리쳤습니다! 다음 지역으로 나아갈 수 있습니다.`, "system");
                this.state.world.bossDefeated = true;
                this.state.world.explorationProgress = 100;
                this.state.world.saturation = Math.min(100, this.state.world.saturation + 10);
                const bossId = battleInfo.bossId || m.id;
                this.applyBossExclusiveDrops(bossId);
                this.recordBossClear(bossId, battleInfo.turn || 0);
                this.updateBossDungeonUnlocks();
            } else {
                if (!this.state.world.bossDefeated) this.state.world.explorationProgress = Math.min(100, this.state.world.explorationProgress + 2);
                this.state.world.saturation = Math.min(100, this.state.world.saturation + 0.1);
            }
            this.applyPostBattleHpRegen();
            if (battleInfo.source === 'boss_dungeon') {
                const auto = this.state.world.bossDungeonAuto || { active: false, bossId: null, runCount: 0 };
                if (auto.active && auto.bossId === (battleInfo.bossId || m.id)) {
                    auto.runCount = Number(auto.runCount || 0) + 1;
                    this.state.world.bossDungeonAuto = auto;
                    if (this.state.player.autoBattleEnabled) {
                        const nextBossId = auto.bossId;
                        const nextBoss = window.GAME_DATA.monsters.find(x => x.id === nextBossId && x.isBoss);
                        if (nextBoss) {
                            this.log(`[보스 소탕] ${auto.runCount}회 클리어 · 다음 도전을 시작합니다.`, "system");
                            const nextMonster = JSON.parse(JSON.stringify(nextBoss));
                            this.state.battle = null;
                            setTimeout(() => {
                                this.toggleBattleUI(false);
                                this.updateUI();
                                this.renderTabContent(document.querySelector('.tab-btn.active').dataset.tab);
                                this.checkLevelUp();
                                this.saveGame();
                                this.startBattle(nextMonster, { source: 'boss_dungeon', bossId: nextBossId });
                            }, 900);
                            return;
                        }
                    } else {
                        this.log("[보스 소탕] 자동전투 OFF로 전환되어 소탕을 중지합니다.", "system");
                    }
                    this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 };
                }
            }
            this.state.battle = null;
            setTimeout(() => {
                this.toggleBattleUI(false);
                this.updateUI();
                this.renderTabContent(document.querySelector('.tab-btn.active').dataset.tab);
                this.checkLevelUp();
                this.saveGame();
                if (this.state.player.autoExploreEnabled) this.scheduleAutoExplore(500);
            }, 1500);
        },
        loseBattle() { this.log("무리한 순례로 인해 탈진했습니다...", "battle"); this.state.player.hp = 10; this.state.player.gold = Math.floor(this.state.player.gold * 0.8); this.state.player.autoBattleEnabled = false; this.state.player.autoExploreEnabled = false; this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 }; if (this.autoExploreTimer) { clearTimeout(this.autoExploreTimer); this.autoExploreTimer = null; } this.log("[자동 진행] 탈진으로 자동순례/자동전투가 중지되었습니다.", "system"); this.state.battle = null; setTimeout(() => { this.toggleBattleUI(false); this.updateUI(); this.saveGame(); }, 2000); },
        showSkillMenu() { if (!this.state.battle || !this.state.battle.isPlayerTurn) return; const modal = document.getElementById('modal-overlay'); const content = document.getElementById('modal-content'); let html = `<h3 style="margin-bottom: 20px;">어떤 능력을 사용하시겠습니까?</h3>`; html += `<div style="display:flex; flex-direction:column; gap:10px;">`; this.getActiveSkills().forEach(skillData => { const canUse = this.state.player.pp >= skillData.cost; html += `<button class="action-btn ${canUse ? 'primary' : 'secondary'}" data-skill="${skillData.id}" ${canUse ? '' : 'disabled'} style="width: 100%;">${skillData.name} <span style="font-size: 0.8rem; opacity: 0.7;">(PP ${skillData.cost} 소모)</span></button>`; }); html += `<button class="action-btn" id="btn-cancel-skill" style="margin-top:10px; width: 100%;">취소</button></div>`; content.innerHTML = html; modal.classList.remove('hidden'); content.querySelectorAll('button[data-skill]').forEach(btn => { btn.addEventListener('click', (e) => { const skillId = e.currentTarget.getAttribute('data-skill'); const selectedSkill = this.getActiveSkills().find(s => s.id === skillId); modal.classList.add('hidden'); if (selectedSkill) this.useSkill(selectedSkill); }); }); document.getElementById('btn-cancel-skill').addEventListener('click', () => modal.classList.add('hidden')); },
        useSkill(skill) {
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.resolveFearCheck()) {
                this.state.battle.isPlayerTurn = false;
                setTimeout(() => this.monsterTurn(), 900);
                return;
            }

            const p = this.state.player;
            const combined = this.getPlayerCombinedStats();
            const skillData = window.GAME_DATA.skills[skill.id];
            if (!skillData) return this.log("스킬 데이터가 존재하지 않습니다.", "system");
            if (skillData.bossOnly) return this.log("이 스킬은 플레이어가 사용할 수 없습니다.", "system");
            if (p.pp < (skillData.cost || 0)) return this.log("PP가 부족합니다!", "system");

            p.pp -= skillData.cost;
            this.log(`${p.name}의 기술: [${skillData.name}]!`, "player");

            if (skillData.type === 'buff') {
                const effects = this.getBattleEffects();
                const effect = skillData.effect || {};
                const buffScale = skillData.scaling?.buff || {};

                // 회복 스킬: 최소 고정값 + 스탯 비례(데이터 기반, 기본 스킬 fallback 포함)
                const healScale = skillData.scaling?.heal || (skill.id === 'meditation'
                    ? { base: 24, atk: 0.12, def: 1.8, faith: 9 }
                    : null);
                if (healScale) {
                    const base = Number(healScale.base || 20);
                    const atkPart = (combined.atk || 0) * Number(healScale.atk || 0);
                    const defPart = (combined.def || 0) * Number(healScale.def || 0);
                    const faithPart = (combined.faith || 0) * Number(healScale.faith || 0);
                    const healAmount = Math.max(
                        base,
                        Math.floor(
                            base + defPart + faithPart + atkPart
                        )
                    );
                    const beforeHp = p.hp;
                    p.hp = Math.min(combined.hp, p.hp + healAmount);
                    const actual = p.hp - beforeHp;
                    if (actual > 0) {
                        this.log(`고정+비례 회복으로 HP를 ${actual} 회복했습니다.`, "info");
                        this.log(`[묵상 계산] base ${base.toFixed(0)} + DEF ${defPart.toFixed(1)} + FAITH ${faithPart.toFixed(1)} + ATK ${atkPart.toFixed(1)} = ${healAmount} (실회복 ${actual})`, "system");
                    } else {
                        this.log("회복 효과를 사용했지만 HP가 이미 가득 차 있습니다.", "info");
                    }
                }

                if (effect.defMul) {
                    const defMulBonus = Number(buffScale.defMulBase || 0) + (combined.def || 0) * Number(buffScale.defMulDef || 0) + (combined.faith || 0) * Number(buffScale.defMulFaith || 0);
                    effects.player.defMulValue = Math.max(effects.player.defMulValue, effect.defMul + defMulBonus);
                    effects.player.defMulTurns = Math.max(effects.player.defMulTurns, 2);
                }
                if (effect.evade) {
                    const evadeBonus = Number(buffScale.evadeBase || 0) + (combined.faith || 0) * Number(buffScale.evadeFaith || 0) + (combined.spd || 0) * Number(buffScale.evadeSpd || 0);
                    effects.player.evadeChance = Math.max(effects.player.evadeChance, effect.evade + evadeBonus);
                    effects.player.evadeTurns = Math.max(effects.player.evadeTurns, 2);
                }
                if (effect.spdMul) {
                    const spdMulBonus = Number(buffScale.spdMulBase || 0) + (combined.faith || 0) * Number(buffScale.spdMulFaith || 0) + (combined.spd || 0) * Number(buffScale.spdMulSpd || 0);
                    effects.player.spdMulValue = Math.max(effects.player.spdMulValue, effect.spdMul + spdMulBonus);
                    effects.player.spdMulTurns = Math.max(effects.player.spdMulTurns, 2);
                }
                if (effect.nextCrit) {
                    effects.player.nextCritChance = Math.max(effects.player.nextCritChance, effect.nextCrit);
                }
                this.log("강화 효과가 적용되었습니다.", "effect");
            } else {
                const effect = skillData.effect || {};
                const m = this.state.battle.monster;
                const targetEl = document.querySelector('.monster-card');
                const totalAtk = combined.atk;
                const atkMul = effect.atkMul || 1.2;
                const critLike = atkMul >= 1.5;

                // 공격 스킬: 최소 고정값 + 스탯 비례(데이터 기반)
                const scale = skillData.scaling?.damage || { base: 10, atk: 0.24, def: 0.06, faith: 1.8 };

                let dmg = this.calculateDamage(totalAtk * atkMul, m.stats.def);
                const scalingBonus = Math.floor(
                    Number(scale.base || 10) +
                    (combined.atk || 0) * Number(scale.atk || 0) +
                    (combined.def || 0) * Number(scale.def || 0) +
                    (combined.faith || 0) * Number(scale.faith || 0)
                );
                dmg += Math.max(Number(scale.base || 10), scalingBonus);
                dmg = this.applyFaithBonusDamage(dmg, m);
                dmg *= combined.damageMul;
                if (p.hp <= combined.hp * 0.5) dmg *= combined.lowHpDamageMul;
                dmg = Math.round(dmg);

                m.hp -= dmg;
                this.applySkillEffectToTarget(effect, false);
                this.spawnDamagePopup(targetEl, dmg, critLike, false);
                this.log(`${m.name}에게 ${Math.floor(dmg)}의 강력한 피해를 입혔습니다!`, "player");
                this.applyLifeStealFromDamage(dmg);
            }

            this.updateUI();
            if (this.state.battle.monster.hp <= 0) return this.winBattle();

            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        },
        tryEscape() { if (!this.state.battle || !this.state.battle.isPlayerTurn) return; const bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData)); const playerSpd = this.getPlayerSpeed(bonus); const monsterSpd = this.getMonsterSpeed(); const rawRate = playerSpd / (playerSpd + monsterSpd); const escapeRate = Math.max(0.05, Math.min(0.9, rawRate)); if (Math.random() < escapeRate) { this.log("무사히 도망쳤습니다!", "info"); this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 }; this.state.battle = null; this.toggleBattleUI(false); this.updateUI(); this.saveGame(); } else { this.log(`도망치는 데 실패했습니다! (성공 확률 ${Math.round(escapeRate * 100)}%)`, "battle"); this.state.battle.isPlayerTurn = false; setTimeout(() => this.monsterTurn(), 1000); } }
    });
})();
