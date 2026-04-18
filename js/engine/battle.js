/**
 * Basileia - Battle Domain Module
 */
(function () {
    if (typeof window === 'undefined' || typeof window.GameEngine === 'undefined') return;

    Object.assign(window.GameEngine.prototype, {
        /** 몬스터 카드 하단: 적에게 걸린 디버프·(향후) 적 자기강화만 표시. 플레이어 효과는 렌더하지 않음 */
        renderBattleStatus() {
            const statusEl = document.getElementById('battle-status');
            if (!statusEl || !this.state.battle) return;
            const mx = this.state.battle.effects.monster;
            const chips = [];
            if (mx.spdDebuffTurns > 0 && mx.spdDebuffMul < 1) {
                chips.push(`<span class="status-chip monster-debuff" title="플레이어가 부여한 디버프">이동 둔화 ×${mx.spdDebuffMul.toFixed(2)} ${mx.spdDebuffTurns}턴</span>`);
            }
            if (mx.tempAtkTurns > 0 && mx.tempAtkMul > 1) {
                chips.push(`<span class="status-chip monster-buff" title="보스 자기강화">공격 강화 ×${mx.tempAtkMul.toFixed(2)} ${mx.tempAtkTurns}턴</span>`);
            }
            if (mx.tempDefTurns > 0 && mx.tempDefMul > 1) {
                chips.push(`<span class="status-chip monster-buff" title="보스 자기강화">방어 강화 ×${mx.tempDefMul.toFixed(2)} ${mx.tempDefTurns}턴</span>`);
            }
            if (mx.tempSpdTurns > 0 && mx.tempSpdMul > 1) {
                chips.push(`<span class="status-chip monster-buff" title="보스 자기강화">속도 강화 ×${mx.tempSpdMul.toFixed(2)} ${mx.tempSpdTurns}턴</span>`);
            }
            if (chips.length === 0) {
                statusEl.classList.add('hidden');
                statusEl.innerHTML = '';
                return;
            }
            statusEl.classList.remove('hidden');
            statusEl.innerHTML = `
                <div class="battle-status__label">적 상태</div>
                <div class="battle-status__chips">${chips.join('')}</div>
            `;
        },

        /** 좌측 캐릭터 패널: 플레이어 자기강화·플레이어에게 걸린 상태이상만 (적 상태는 renderBattleStatus) */
        renderCharacterBattleEffectsStrip() {
            const el = document.getElementById('char-battle-effects');
            if (!el) return;
            if (!this.state.battle) {
                el.classList.add('hidden');
                el.innerHTML = '';
                this.renderBattlePlayerStatus();
                return;
            }
            const combined = this.getPlayerCombinedStats();
            const fx = this.state.battle.effects.player;
            const bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData));
            const rows = [];

            if (fx.defMulTurns > 0 && fx.defMulValue !== 1) {
                const effDef = Math.round(combined.def * fx.defMulValue);
                rows.push(`<div class="char-battle-effects__row"><span>방어 강화</span><span>배율 ×${fx.defMulValue.toFixed(2)} → 피해계산 방어 <strong>${effDef}</strong> <em>${fx.defMulTurns}턴</em></span></div>`);
            }
            if (fx.evadeTurns > 0 && fx.evadeChance > 0) {
                const totalEv = Math.min(0.5, fx.evadeChance + combined.evadeChance);
                rows.push(`<div class="char-battle-effects__row"><span>회피(스킬)</span><span>버프 +${Math.round(fx.evadeChance * 100)}% · 합산 <strong>${Math.round(totalEv * 100)}%</strong> <em>${fx.evadeTurns}턴</em></span></div>`);
            }
            if (fx.spdMulTurns > 0 && fx.spdMulValue !== 1) {
                const battleSpd = this.getPlayerSpeed(bonus);
                rows.push(`<div class="char-battle-effects__row"><span>속도 강화</span><span>배율 ×${fx.spdMulValue.toFixed(2)} → 선공 <strong>전투속도 ${battleSpd}</strong> <em>${fx.spdMulTurns}턴</em></span></div>`);
            }
            if (fx.nextCritChance > 0) {
                const baseCrit = 0.1 + combined.critChance;
                const withNext = Math.min(0.7, baseCrit + fx.nextCritChance);
                rows.push(`<div class="char-battle-effects__row"><span>다음 치명타</span><span>추가 +${Math.round(fx.nextCritChance * 100)}% → 다음 공격 확률 약 <strong>${Math.round(withNext * 100)}%</strong> <em>1회</em></span></div>`);
            }
            if (fx.fearTurns > 0) {
                rows.push(`<div class="char-battle-effects__row is-debuff"><span>공포</span><span>행동 실패 가능 <em>${fx.fearTurns}턴</em></span></div>`);
            }
            if (fx.spdDebuffTurns > 0 && fx.spdDebuffMul < 1) {
                rows.push(`<div class="char-battle-effects__row is-debuff"><span>이동 둔화</span><span>×${fx.spdDebuffMul.toFixed(2)} <em>${fx.spdDebuffTurns}턴</em></span></div>`);
            }

            if (rows.length === 0) {
                el.classList.add('hidden');
                el.innerHTML = '';
                this.renderBattlePlayerStatus();
                return;
            }
            el.classList.remove('hidden');
            el.innerHTML = `<div class="char-battle-effects__head">플레이어 · 전투 효과 <span class="char-battle-effects__hint">(자기강화·상태이상)</span></div>${rows.join('')}`;
            this.renderBattlePlayerStatus();
        },

        /** 전투 씬 좌측: 플레이어 버프·디버프 요약 칩 */
        renderBattlePlayerStatus() {
            const statusEl = document.getElementById('battle-player-status');
            if (!statusEl) return;
            if (!this.state.battle) {
                statusEl.classList.add('hidden');
                statusEl.innerHTML = '';
                return;
            }
            const combined = this.getPlayerCombinedStats();
            const fx = this.state.battle.effects.player;
            const chips = [];
            if (fx.defMulTurns > 0 && fx.defMulValue !== 1) {
                chips.push(`<span class="status-chip player" title="방어 강화">방어 ×${fx.defMulValue.toFixed(2)} · ${fx.defMulTurns}턴</span>`);
            }
            if (fx.evadeTurns > 0 && fx.evadeChance > 0) {
                const totalEv = Math.min(0.5, fx.evadeChance + combined.evadeChance);
                chips.push(`<span class="status-chip player" title="회피">회피 ${Math.round(totalEv * 100)}% · ${fx.evadeTurns}턴</span>`);
            }
            if (fx.spdMulTurns > 0 && fx.spdMulValue !== 1) {
                chips.push(`<span class="status-chip player" title="속도 강화">속도 ×${fx.spdMulValue.toFixed(2)} · ${fx.spdMulTurns}턴</span>`);
            }
            if (fx.nextCritChance > 0) {
                chips.push(`<span class="status-chip player" title="다음 치명타">치명 +${Math.round(fx.nextCritChance * 100)}%</span>`);
            }
            if (fx.fearTurns > 0) {
                chips.push(`<span class="status-chip player is-debuff-chip" title="공포">공포 ${fx.fearTurns}턴</span>`);
            }
            if (fx.spdDebuffTurns > 0 && fx.spdDebuffMul < 1) {
                chips.push(`<span class="status-chip player is-debuff-chip" title="이동 둔화">둔화 ×${fx.spdDebuffMul.toFixed(2)} · ${fx.spdDebuffTurns}턴</span>`);
            }
            if (chips.length === 0) {
                statusEl.classList.add('hidden');
                statusEl.innerHTML = '';
                return;
            }
            statusEl.classList.remove('hidden');
            statusEl.innerHTML = `
                <div class="battle-status__label">내 상태</div>
                <div class="battle-status__chips">${chips.join('')}</div>
            `;
        },

        toggleBattleUI(isBattle) {
            document.getElementById('explore-actions').classList.toggle('hidden', isBattle);
            document.getElementById('battle-actions').classList.toggle('hidden', !isBattle);
            document.getElementById('battle-scene').classList.toggle('hidden', !isBattle);
            this.updateAutoBattleButton();
            this.updateAutoExploreButton();
            if (isBattle) this.scheduleAutoBattleTurn(500);
        },
        spawnDamagePopup(targetEl, value, isCrit, isMonsterDamage, options = {}) {
            const rect = targetEl.getBoundingClientRect();
            const popup = document.createElement('div');
            popup.className = `damage-popup ${isCrit ? 'critical' : ''} ${isMonsterDamage ? 'monster-dmg' : ''}`;
            popup.innerText = (isCrit ? 'CRITICAL! ' : '') + Math.round(value);
            const baseRandomX = (Math.random() - 0.5) * 40;
            const xOffset = Number(options.xOffset || 0);
            const yOffset = Number(options.yOffset || 0);
            popup.style.left = `${rect.left + rect.width / 2 + baseRandomX + xOffset}px`;
            popup.style.top = `${rect.top + yOffset}px`;
            document.body.appendChild(popup);
            const lifetime = Math.max(300, Number(options.lifetime || 1000));
            setTimeout(() => popup.remove(), lifetime);
        },
        ensureMonsterSkillFxLayer() {
            const wrap = document.querySelector('#battle-scene .battle-image-wrap--enemy .monster-image-wrap');
            if (!wrap) return null;
            let layer = wrap.querySelector('.battle-skill-fx-layer');
            if (layer) return layer;
            layer = document.createElement('div');
            layer.className = 'battle-skill-fx-layer';
            layer.setAttribute('aria-hidden', 'true');
            wrap.appendChild(layer);
            return layer;
        },
        resolveSkillFxType(skillData) {
            const id = String(skillData?.id || '');
            const tags = Array.isArray(skillData?.tags) ? skillData.tags.map(t => String(t)) : [];
            if (id.includes('void') || id.includes('null') || id.includes('abyss')) return 'void';
            if (id.includes('seraph') || id.includes('radiant') || id.includes('holy') || tags.includes('holy')) return 'holy';
            if (id.includes('stone') || id.includes('mud') || id.includes('rampart') || id.includes('fortress')) return 'stone';
            if (id.includes('blood') || id.includes('martyr') || tags.includes('fear')) return 'blood';
            if (id.includes('bolt') || tags.includes('lightning') || tags.includes('thunder')) return 'lightning';
            if (id.includes('aegis') || id.includes('wall') || tags.includes('defense')) return 'shield';
            if (id.includes('mercy') || id.includes('dawn') || tags.includes('heal')) return 'nova';
            if (id.includes('dash') || tags.includes('spd')) return 'dash';
            if (id.includes('ember') || tags.includes('fire')) return 'fire';
            if (id.includes('smite') || id.includes('slash')) return 'slash';
            return 'slash';
        },
        resolveSkillFxPreset(skillData, options = {}) {
            const id = String(skillData?.id || '');
            const fxType = options.fxType || this.resolveSkillFxType(skillData);
            const base = {
                fxType,
                count: 1,
                interval: 70,
                lifetime: 560,
                spreadX: 20,
                spreadY: 14,
                emphasize: !!options.emphasize
            };
            const byId = {
                basic_attack: { fxType: 'slash', count: 1, interval: 0 },
                double_strike: { fxType: 'slash', count: 2, interval: 95 },
                smite: { fxType: 'slash', count: 3, interval: 56, emphasize: true, spreadX: 32, spreadY: 18 },
                holy_wall: { fxType: 'shield', count: 2, interval: 80, lifetime: 700, spreadX: 8, spreadY: 8 },
                aegis_prayer: { fxType: 'shield', count: 3, interval: 72, lifetime: 720, spreadX: 10, spreadY: 10 },
                light_dash: { fxType: 'dash', count: 3, interval: 48, spreadX: 36, spreadY: 16 },
                radiant_volley: { fxType: 'slash', count: 4, interval: 56, spreadX: 34, spreadY: 18 },
                ember_sigil: { fxType: 'fire', count: 3, interval: 75, spreadX: 30, spreadY: 18 },
                reckoning_bolt: { fxType: 'lightning', count: 3, interval: 72, emphasize: true, spreadX: 18, spreadY: 14 },
                eden_lance: { fxType: 'slash', count: 3, interval: 56, spreadX: 30, spreadY: 16 },
                purify: { fxType: 'nova', count: 2, interval: 68, lifetime: 620, spreadX: 8, spreadY: 8 },
                mercy_breath: { fxType: 'nova', count: 2, interval: 62, lifetime: 640, spreadX: 10, spreadY: 8 },
                dawn_shelter: { fxType: 'shield', count: 2, interval: 72, lifetime: 700, spreadX: 10, spreadY: 8 },
                proclaim: { fxType: 'slash', count: 1, interval: 0 },
                solemn_bastion: { fxType: 'shield', count: 3, interval: 70, lifetime: 740, spreadX: 10, spreadY: 10 },
                martyr_brand: { fxType: 'slash', count: 4, interval: 60, emphasize: true, spreadX: 34, spreadY: 20 },
                merged_volley_ember: {
                    sequence: [
                        { fxType: 'fire', count: 2, interval: 52, spreadX: 24, spreadY: 16 },
                        { fxType: 'slash', count: 3, interval: 48, spreadX: 32, spreadY: 18, emphasize: true }
                    ]
                },
                merged_mercy_dawn: {
                    sequence: [
                        { fxType: 'nova', count: 2, interval: 58, lifetime: 680, spreadX: 8, spreadY: 8 },
                        { fxType: 'shield', count: 2, interval: 70, lifetime: 760, spreadX: 8, spreadY: 8 }
                    ]
                },
                merged_lance_reckoning: {
                    sequence: [
                        { fxType: 'lightning', count: 2, interval: 62, spreadX: 18, spreadY: 12 },
                        { fxType: 'slash', count: 3, interval: 56, spreadX: 32, spreadY: 18, emphasize: true }
                    ]
                },
                merged_holy_judgment: {
                    sequence: [
                        { fxType: 'shield', count: 2, interval: 72, lifetime: 720, spreadX: 8, spreadY: 8 },
                        { fxType: 'slash', count: 3, interval: 54, spreadX: 30, spreadY: 16, emphasize: true }
                    ]
                },
                merged_aegis_dash: {
                    sequence: [
                        { fxType: 'shield', count: 2, interval: 72, lifetime: 700, spreadX: 8, spreadY: 8 },
                        { fxType: 'dash', count: 3, interval: 48, spreadX: 34, spreadY: 16, emphasize: true }
                    ]
                },
                boss_wraith_haunt: {
                    sequence: [
                        { fxType: 'void', count: 2, interval: 58, lifetime: 640, spreadX: 16, spreadY: 14 },
                        { fxType: 'blood', count: 2, interval: 70, lifetime: 620, spreadX: 16, spreadY: 14 }
                    ]
                },
                boss_wraith_soul_split: {
                    sequence: [
                        { fxType: 'void', count: 3, interval: 52, lifetime: 660, spreadX: 18, spreadY: 14 },
                        { fxType: 'slash', count: 2, interval: 60, spreadX: 30, spreadY: 16, emphasize: true }
                    ]
                },
                boss_mud_grasp: { fxType: 'stone', count: 3, interval: 62, lifetime: 700, spreadX: 20, spreadY: 16 },
                boss_mud_quake: {
                    sequence: [
                        { fxType: 'stone', count: 2, interval: 48, lifetime: 700, spreadX: 22, spreadY: 14 },
                        { fxType: 'dash', count: 2, interval: 54, spreadX: 36, spreadY: 12, emphasize: true }
                    ]
                },
                boss_seraph_gaze: {
                    sequence: [
                        { fxType: 'holy', count: 2, interval: 60, lifetime: 620, spreadX: 12, spreadY: 10 },
                        { fxType: 'lightning', count: 2, interval: 64, spreadX: 14, spreadY: 10, emphasize: true }
                    ]
                },
                boss_seraph_petrify: {
                    sequence: [
                        { fxType: 'holy', count: 2, interval: 64, lifetime: 640, spreadX: 12, spreadY: 10 },
                        { fxType: 'stone', count: 3, interval: 52, lifetime: 760, spreadX: 18, spreadY: 12, emphasize: true }
                    ]
                },
                boss_hydra_maelstrom: {
                    sequence: [
                        { fxType: 'void', count: 2, interval: 58, lifetime: 680, spreadX: 20, spreadY: 14 },
                        { fxType: 'lightning', count: 2, interval: 56, spreadX: 16, spreadY: 12 },
                        { fxType: 'blood', count: 2, interval: 58, spreadX: 18, spreadY: 14, emphasize: true }
                    ]
                },
                boss_guardian_verdict: {
                    sequence: [
                        { fxType: 'holy', count: 2, interval: 64, lifetime: 640, spreadX: 12, spreadY: 10 },
                        { fxType: 'shield', count: 2, interval: 66, lifetime: 760, spreadX: 12, spreadY: 10 },
                        { fxType: 'slash', count: 3, interval: 52, spreadX: 30, spreadY: 16, emphasize: true }
                    ]
                },
                boss_a_iron_hide: { fxType: 'shield', count: 2, interval: 70, lifetime: 760, spreadX: 10, spreadY: 8 },
                boss_a_war_drum: { fxType: 'blood', count: 2, interval: 68, lifetime: 640, spreadX: 16, spreadY: 12 },
                boss_a_void_surge: { fxType: 'void', count: 3, interval: 54, lifetime: 660, spreadX: 20, spreadY: 14 },
                boss_a_rampart: { fxType: 'stone', count: 3, interval: 60, lifetime: 760, spreadX: 18, spreadY: 12 },
                boss_a_overdrive: {
                    sequence: [
                        { fxType: 'lightning', count: 2, interval: 58, spreadX: 16, spreadY: 10 },
                        { fxType: 'blood', count: 2, interval: 56, spreadX: 18, spreadY: 12, emphasize: true }
                    ]
                },
                boss_a_fortress: { fxType: 'stone', count: 2, interval: 66, lifetime: 760, spreadX: 16, spreadY: 12 },
                boss_a_bloodlust: { fxType: 'blood', count: 3, interval: 54, lifetime: 650, spreadX: 18, spreadY: 12, emphasize: true }
            };
            if (id.startsWith('boss_') && !byId[id]) {
                return { ...base, fxType: this.resolveSkillFxType(skillData), count: 2, interval: 62, spreadX: 18, spreadY: 12, lifetime: 660, emphasize: !!options.emphasize };
            }
            return { ...base, ...(byId[id] || {}) };
        },
        emitSkillFxBursts(layer, preset, delay = 0) {
            const count = Math.max(1, Math.min(5, Number(preset.count || 1)));
            const interval = Math.max(0, Number(preset.interval || 0));
            const lifetime = Math.max(320, Number(preset.lifetime || 560));
            const spreadX = Math.max(0, Number(preset.spreadX || 20));
            const spreadY = Math.max(0, Number(preset.spreadY || 14));
            const fxType = String(preset.fxType || 'slash');
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const burst = document.createElement('div');
                    burst.className = `battle-skill-fx battle-skill-fx--${fxType}`;
                    if (preset.emphasize && i === 0) burst.classList.add('is-emphasize');
                    burst.style.left = `${Math.round((Math.random() - 0.5) * spreadX)}px`;
                    burst.style.top = `${Math.round((Math.random() - 0.5) * spreadY)}px`;
                    layer.appendChild(burst);
                    setTimeout(() => burst.remove(), lifetime);
                }, delay + (i * interval));
            }
        },
        /** 플레이어 초상 슬롯: 몬스터 측 공격·스킬 이펙트 레이어 */
        ensurePlayerSkillFxLayer() {
            const wrap = document.querySelector('#battle-scene .battle-image-wrap--player');
            if (!wrap) return null;
            let layer = wrap.querySelector('.battle-mattack-fx-layer');
            if (layer) return layer;
            layer = document.createElement('div');
            layer.className = 'battle-mattack-fx-layer';
            layer.setAttribute('aria-hidden', 'true');
            wrap.appendChild(layer);
            return layer;
        },
        mapMonsterAttackBurstType(theme) {
            const t = String(theme || 'default');
            if (t === 'default') return 'claw';
            return t;
        },
        emitMonsterAttackFxBursts(layer, preset, delay = 0) {
            const count = Math.max(1, Math.min(5, Number(preset.count || 1)));
            const interval = Math.max(0, Number(preset.interval || 0));
            const lifetime = Math.max(320, Number(preset.lifetime || 520));
            const spreadX = Math.max(0, Number(preset.spreadX || 22));
            const spreadY = Math.max(0, Number(preset.spreadY || 14));
            const fxType = String(preset.fxType || 'claw');
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const burst = document.createElement('div');
                    burst.className = `battle-mattack-fx battle-mattack-fx--${fxType}`;
                    if (preset.emphasize && i === 0) burst.classList.add('is-emphasize');
                    burst.style.left = `${Math.round((Math.random() - 0.5) * spreadX)}px`;
                    burst.style.top = `${Math.round((Math.random() - 0.5) * spreadY)}px`;
                    layer.appendChild(burst);
                    setTimeout(() => burst.remove(), lifetime);
                }, delay + (i * interval));
            }
        },
        /** 몬스터 공격이 플레이어 구역에 닿을 때 버스트 (전용 시각 셋) */
        spawnMonsterAttackSkillFx(skillData = null) {
            const layer = this.ensurePlayerSkillFxLayer();
            if (!layer) return;
            const theme = this.resolveImpactTheme(skillData);
            const fxType = this.mapMonsterAttackBurstType(theme);
            const heavy = theme === 'void' || theme === 'stone' || theme === 'blood';
            const preset = {
                fxType,
                count: heavy ? 3 : 2,
                interval: 50,
                spreadX: 26,
                spreadY: 16,
                lifetime: 540,
                emphasize: heavy
            };
            this.emitMonsterAttackFxBursts(layer, preset, 0);
        },
        spawnMonsterSkillFx(skillData, options = {}) {
            const layer = this.ensureMonsterSkillFxLayer();
            if (!layer) return;
            const preset = this.resolveSkillFxPreset(skillData, options);
            if (Array.isArray(preset.sequence) && preset.sequence.length > 0) {
                let cursor = 0;
                for (const seq of preset.sequence) {
                    const merged = { ...preset, ...seq };
                    this.emitSkillFxBursts(layer, merged, cursor);
                    const count = Math.max(1, Math.min(5, Number(merged.count || 1)));
                    const interval = Math.max(0, Number(merged.interval || 0));
                    cursor += Math.max(120, count * interval + 80);
                }
                return;
            }
            this.emitSkillFxBursts(layer, preset, 0);
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
                    monster: {
                        spdDebuffTurns: 0, spdDebuffMul: 1,
                        passiveAtkMul: 1, passiveDefMul: 1, passiveSpdMul: 1,
                        tempAtkMul: 1, tempDefMul: 1, tempSpdMul: 1,
                        tempAtkTurns: 0, tempDefTurns: 0, tempSpdTurns: 0
                    }
                },
                flags: { lowHpCutscenePlayed: false },
                autoState: { skillLastTurn: {}, lastAutoSkillId: null }
            };
            this.applyBossPassiveEffects(monster);
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
        /** 보스 패시브 스킬을 전투 효과 배율에 반영 (전투 시작 1회) */
        applyBossPassiveEffects(monster) {
            if (!this.state.battle || !monster?.isBoss) return;
            const ids = monster.bossPassiveSkillIds;
            if (!Array.isArray(ids) || ids.length === 0) return;
            const mx = this.state.battle.effects.monster;
            let a = 1; let d = 1; let s = 1;
            const names = [];
            ids.forEach((id) => {
                const sk = window.GAME_DATA.skills[id];
                const mp = sk?.effect?.monsterPassive;
                if (!mp) return;
                names.push(sk.name);
                if (mp.atkMul) a *= mp.atkMul;
                if (mp.defMul) d *= mp.defMul;
                if (mp.spdMul) s *= mp.spdMul;
            });
            mx.passiveAtkMul = a;
            mx.passiveDefMul = d;
            mx.passiveSpdMul = s;
            if (names.length) this.log(`[보스 패시브] ${names.join(' · ')}`, 'system');
        },
        /** 플레이어 피해 계산용: 몬스터 유효 방어 */
        getMonsterEffectiveDef() {
            if (!this.state.battle) return 0;
            const m = this.state.battle.monster;
            const mx = this.state.battle.effects.monster;
            return m.stats.def * (mx.passiveDefMul || 1) * (mx.tempDefMul || 1);
        },
        /** 몬스터 공격 피해용: 유효 공격력 */
        getMonsterEffectiveAtk() {
            if (!this.state.battle) return 0;
            const m = this.state.battle.monster;
            const mx = this.state.battle.effects.monster;
            return m.stats.atk * (mx.passiveAtkMul || 1) * (mx.tempAtkMul || 1);
        },
        applyBossMonsterBuff(effect) {
            const b = effect?.monsterBuff;
            if (!b || !this.state.battle) return;
            const mx = this.state.battle.effects.monster;
            if (b.atkMul && b.turns) {
                mx.tempAtkMul = Math.max(mx.tempAtkMul, b.atkMul);
                mx.tempAtkTurns = Math.max(mx.tempAtkTurns, b.turns);
            }
            if (b.defMul && b.turns) {
                mx.tempDefMul = Math.max(mx.tempDefMul, b.defMul);
                mx.tempDefTurns = Math.max(mx.tempDefTurns, b.turns);
            }
            if (b.spdMul && b.turns) {
                mx.tempSpdMul = Math.max(mx.tempSpdMul, b.spdMul);
                mx.tempSpdTurns = Math.max(mx.tempSpdTurns, b.turns);
            }
        },
        /** regions.enemyPowerTier(1~7)에서 파생. 상태이상 보정용 인덱스 0~6 */
        getRegionAilmentTier(regionId) {
            const r = window.GAME_DATA?.regions?.[regionId];
            const tier = Number(r?.enemyPowerTier);
            if (!Number.isFinite(tier) || tier < 1) return 0;
            return Math.min(6, Math.max(0, tier - 1));
        },
        /** 보스: 스킬을 더 자주 쓰고, 걸릴 확률·지속·둔화 강도가 등급·지역에 따라 상승 */
        getBossMonsterAilmentModifiers(monster) {
            const tier = this.getRegionAilmentTier(monster?.regionId);
            const gradeBonus = { F: 0, E: 0.02, D: 0.04, C: 0.07, B: 0.09, A: 0.12, S: 0.15, SS: 0.18, SSS: 0.22 };
            const g = gradeBonus[monster?.grade] ?? 0.06;
            return {
                skillUseChance: Math.min(0.88, 0.42 + tier * 0.09 + g),
                baseApply: Math.min(0.96, 0.55 + tier * 0.09 + g),
                durationMul: 1 + tier * 0.15 + g * 0.4,
                spdDebuffIntensify: Math.min(0.22, tier * 0.028 + g * 0.12)
            };
        },
        tryTurnStartPlayerPassives() {
            if (!this.state.battle?.isPlayerTurn) return;
            const ch = Math.min(0.45, Math.max(0, this.getPassiveBonuses().turnStartCleanseChance || 0));
            if (ch <= 0 || Math.random() >= ch) return;
            const fx = this.getBattleEffects()?.player;
            if (!fx) return;
            const has = fx.fearTurns > 0 || (fx.spdDebuffTurns > 0 && fx.spdDebuffMul < 1);
            if (!has) return;
            if (this.clearPlayerBattleDebuffs('맑은 정신으로 상태이상을 떨쳐냈습니다.')) this.updateUI();
        },
        clearPlayerBattleDebuffs(message = '부정한 상태가 정화되었습니다.') {
            const effects = this.getBattleEffects();
            if (!effects) return false;
            const pl = effects.player;
            const had = pl.fearTurns > 0 || (pl.spdDebuffTurns > 0 && pl.spdDebuffMul < 1);
            pl.fearTurns = 0;
            pl.spdDebuffTurns = 0;
            pl.spdDebuffMul = 1;
            if (had && message) this.log(message, 'effect');
            return had;
        },
        getPlayerSpeed(bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData))) { const passive = this.getPassiveBonuses(); const base = this.state.player.spd + bonus.spd + passive.spd; const effects = this.getBattleEffects(); if (!effects) return base; const playerFx = effects.player; return Math.max(1, base * playerFx.spdMulValue * playerFx.spdDebuffMul); },
        getMonsterSpeed() {
            if (!this.state.battle) return 0;
            const base = this.state.battle.monster.stats.spd;
            const monsterFx = this.state.battle.effects.monster;
            return Math.max(1, base * (monsterFx.passiveSpdMul || 1) * (monsterFx.tempSpdMul || 1) * monsterFx.spdDebuffMul);
        },
        resolveFearCheck() { const effects = this.getBattleEffects(); if (!effects || effects.player.fearTurns <= 0) return false; const blocked = Math.random() < 0.5; if (blocked) { this.log("공포에 사로잡혀 잠시 움직이지 못했습니다!", "battle"); effects.player.fearTurns = Math.max(0, effects.player.fearTurns - 1); } return blocked; },
        applySkillEffectToTarget(effect, isMonsterCaster = false, casterMonster = null) {
            const effects = this.getBattleEffects();
            if (!effects || !effect) return;
            const m = casterMonster || this.state.battle?.monster;
            if (isMonsterCaster) {
                if (!effect.fear && !effect.spdDebuff) return;
                const pass = this.getPassiveBonuses();
                const resist = Math.min(0.5, Math.max(0, pass.ailmentResist || 0));
                let applyChance = 1;
                let durMul = 1;
                let spdIntensify = 0;
                if (m?.isBoss) {
                    const mod = this.getBossMonsterAilmentModifiers(m);
                    applyChance = Math.min(0.97, mod.baseApply * (1 - resist));
                    durMul = mod.durationMul;
                    spdIntensify = mod.spdDebuffIntensify;
                } else {
                    applyChance = Math.max(0.2, 1 - resist * 0.55);
                }
                if (Math.random() >= applyChance) {
                    this.log(m?.isBoss ? '간신히 부정한 기운을 막아냈습니다!' : '상태이상에 저항했습니다!', 'effect');
                    return;
                }
                if (effect.fear) {
                    const turns = Math.max(1, Math.round(1 * durMul));
                    effects.player.fearTurns = Math.max(effects.player.fearTurns, turns);
                    this.log('적의 공포가 당신의 마음을 짓누릅니다.', 'battle');
                }
                if (effect.spdDebuff) {
                    const rawMul = effect.spdDebuff * (m?.isBoss ? (1 - spdIntensify) : 1);
                    const turns = Math.max(2, Math.round(2 * durMul));
                    effects.player.spdDebuffTurns = Math.max(effects.player.spdDebuffTurns, turns);
                    effects.player.spdDebuffMul = Math.min(effects.player.spdDebuffMul, rawMul);
                    this.log('당신의 움직임이 둔화되었습니다.', 'battle');
                }
                return;
            }
            if (effect.spdDebuff) {
                effects.monster.spdDebuffTurns = Math.max(effects.monster.spdDebuffTurns, 2);
                effects.monster.spdDebuffMul = Math.min(effects.monster.spdDebuffMul, effect.spdDebuff);
                this.log('적의 속도가 감소했습니다.', 'effect');
            }
        },
        tickBattleEffects(endOfTurnForMonster = false) {
            const effects = this.getBattleEffects();
            if (!effects) return;
            const { player, monster } = effects;
            if (!endOfTurnForMonster) return;
            if (player.defMulTurns > 0 && --player.defMulTurns === 0) player.defMulValue = 1;
            if (player.evadeTurns > 0 && --player.evadeTurns === 0) player.evadeChance = 0;
            if (player.spdMulTurns > 0 && --player.spdMulTurns === 0) player.spdMulValue = 1;
            if (player.fearTurns > 0) player.fearTurns--;
            if (player.spdDebuffTurns > 0 && --player.spdDebuffTurns === 0) player.spdDebuffMul = 1;
            if (monster.spdDebuffTurns > 0 && --monster.spdDebuffTurns === 0) monster.spdDebuffMul = 1;
            if (monster.tempAtkTurns > 0 && --monster.tempAtkTurns === 0) monster.tempAtkMul = 1;
            if (monster.tempDefTurns > 0 && --monster.tempDefTurns === 0) monster.tempDefMul = 1;
            if (monster.tempSpdTurns > 0 && --monster.tempSpdTurns === 0) monster.tempSpdMul = 1;
        },
        /**
         * 몬스터 턴 종료 후 플레이어에게 넘김.
         * tickBattleEffects(true): 몬스터 행동 직후 플레이어·몬스터 지속효과를 한 번 감소(동일 타이밍 유지).
         */
        finishMonsterTurnHandoff(options = {}) {
            const { preTickUpdate = false } = options;
            if (preTickUpdate) this.updateUI();
            this.tickBattleEffects(true);
            this.state.battle.turn++;
            this.state.battle.isPlayerTurn = true;
            this.tryTurnStartPlayerPassives();
            this.updateUI();
            this.log('▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.', 'system');
            this.scheduleAutoBattleTurn();
        },
        applyFaithBonusDamage(dmg, monster) { const totalFaith = this.getPlayerCombinedStats().faith; const faithGap = totalFaith - (monster.requiredFaith || 0); if (faithGap <= 0) return dmg; return dmg * (1 + Math.min(0.2, faithGap * 0.05)); },
        applyLifeStealFromDamage(damage) { const dealt = Math.max(0, Math.floor(Number(damage) || 0)); if (dealt <= 0) return; const combined = this.getPlayerCombinedStats(); const lifeStealRatio = Math.max(0, Number(combined.lifeSteal || 0)); if (lifeStealRatio <= 0) return; const maxHp = combined.hp; const beforeHp = this.state.player.hp; const healAmount = Math.max(0, Math.floor(dealt * lifeStealRatio)); if (healAmount <= 0) return; this.state.player.hp = Math.min(maxHp, this.state.player.hp + healAmount); const actual = this.state.player.hp - beforeHp; if (actual > 0) this.log(`[생명력 흡수] 피해 ${dealt}의 ${(lifeStealRatio * 100).toFixed(0)}% → HP +${actual}`, "effect"); },
        applyPostBattleHpRegen() { const combined = this.getPlayerCombinedStats(); const regen = Math.max(0, Math.floor(Number(combined.hpRegen || 0))); if (regen <= 0) return; const maxHp = combined.hp; const beforeHp = this.state.player.hp; this.state.player.hp = Math.min(maxHp, this.state.player.hp + regen); const actual = this.state.player.hp - beforeHp; if (actual > 0) this.log(`[체력재생] 전투 종료 후 HP +${actual}`, "effect"); },
        /** 패시브·성물: 적중 시 확률적 PP 회복 */
        applyPpOnHitPassive(damageDealt) {
            const pass = this.getPassiveBonuses();
            const ch = Math.min(0.55, Math.max(0, pass.ppOnHitChance || 0));
            const amt = Math.max(0, Math.floor(pass.ppOnHitAmount || 0));
            if (damageDealt <= 0 || amt <= 0 || ch <= 0) return;
            if (Math.random() >= ch) return;
            const combined = this.getPlayerCombinedStats();
            const before = this.state.player.pp;
            this.state.player.pp = Math.min(combined.pp, this.state.player.pp + amt);
            const g = this.state.player.pp - before;
            if (g > 0) this.log(`[영력 회수] PP +${g}`, 'effect');
        },
        resolveImpactTheme(skillData) {
            const id = String(skillData?.id || '');
            const tags = Array.isArray(skillData?.tags) ? skillData.tags.map(t => String(t)) : [];
            if (id.includes('void') || id.includes('abyss') || id.includes('null')) return 'void';
            if (id.includes('seraph') || id.includes('holy') || tags.includes('holy')) return 'holy';
            if (id.includes('stone') || id.includes('mud') || id.includes('fortress') || id.includes('rampart')) return 'stone';
            if (id.includes('blood') || id.includes('martyr') || tags.includes('fear')) return 'blood';
            if (id.includes('ember') || tags.includes('fire')) return 'fire';
            if (id.includes('dash') || tags.includes('spd')) return 'dash';
            if (id.includes('bolt') || tags.includes('lightning') || tags.includes('thunder')) return 'lightning';
            return 'default';
        },
        clearBattleDuelZoneImpactFx() {
            const shakeClasses = ['shake-light', 'shake', 'shake-heavy', 'shake-brutal'];
            const flashClasses = [
                'hit-flash', 'crit-flash',
                'hit-flash-holy', 'hit-flash-void', 'hit-flash-stone', 'hit-flash-blood',
                'hit-flash-fire', 'hit-flash-dash', 'hit-flash-lightning',
                'zone-m-flash', 'zone-m-flash--void', 'zone-m-flash--fire', 'zone-m-flash--stone',
                'zone-m-flash--blood', 'zone-m-flash--lightning', 'zone-m-flash--holy', 'zone-m-flash--dash'
            ];
            const els = [
                document.querySelector('#battle-scene .battle-actor--player'),
                document.querySelector('#battle-scene .battle-actor--enemy'),
                document.getElementById('battle-scene'),
                document.getElementById('app')
            ].filter(Boolean);
            els.forEach((el) => {
                shakeClasses.forEach((c) => el.classList.remove(c));
                flashClasses.forEach((c) => el.classList.remove(c));
            });
        },
        /** 플레이어 공격 적중: 몬스터 구역만 흔들림·플래시 */
        triggerPlayerPhysicalHitFx(isCrit, skillData = null) {
            const enemyZone = document.querySelector('#battle-scene .battle-actor--enemy');
            if (!enemyZone) return;
            const theme = this.resolveImpactTheme(skillData);
            const flashByTheme = {
                holy: 'hit-flash-holy',
                void: 'hit-flash-void',
                stone: 'hit-flash-stone',
                blood: 'hit-flash-blood',
                fire: 'hit-flash-fire',
                dash: 'hit-flash-dash',
                lightning: 'hit-flash-lightning',
                default: 'hit-flash'
            };
            const shakeByTheme = {
                holy: 'shake',
                void: 'shake-heavy',
                stone: 'shake-brutal',
                blood: 'shake-heavy',
                fire: 'shake',
                dash: 'shake-light',
                lightning: 'shake-heavy',
                default: 'shake'
            };
            const shakeClass = isCrit ? 'shake-brutal' : (shakeByTheme[theme] || 'shake');
            const flashClass = isCrit ? 'crit-flash' : (flashByTheme[theme] || 'hit-flash');
            this.clearBattleDuelZoneImpactFx();
            enemyZone.classList.add(shakeClass, flashClass);
            setTimeout(() => {
                enemyZone.classList.remove(shakeClass, flashClass);
            }, isCrit ? 520 : 360);
        },
        /** 몬스터 공격 피격: 플레이어 구역만 + 몬스터 전용 이펙트 셋 */
        triggerMonsterImpactFx(skillData = null) {
            const playerZone = document.querySelector('#battle-scene .battle-actor--player');
            if (!playerZone) return;
            const theme = this.resolveImpactTheme(skillData);
            const shake = (theme === 'stone' || theme === 'void') ? 'shake-heavy' : 'shake';
            const flashByTheme = {
                holy: 'zone-m-flash--holy',
                void: 'zone-m-flash--void',
                stone: 'zone-m-flash--stone',
                blood: 'zone-m-flash--blood',
                fire: 'zone-m-flash--fire',
                dash: 'zone-m-flash--dash',
                lightning: 'zone-m-flash--lightning',
                default: 'zone-m-flash'
            };
            const flashClass = flashByTheme[theme] || flashByTheme.default;
            this.clearBattleDuelZoneImpactFx();
            playerZone.classList.add(shake, flashClass);
            this.spawnMonsterAttackSkillFx(skillData);
            setTimeout(() => {
                playerZone.classList.remove(shake, flashClass);
            }, 360);
        },
        playerAttack() {
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.resolveFearCheck()) {
                this.state.battle.isPlayerTurn = false;
                setTimeout(() => this.monsterTurn(), 900);
                return;
            }
            const p = this.state.player;
            const combined = this.getPlayerCombinedStats();
            const m = this.state.battle.monster;
            const effects = this.getBattleEffects();
            const extraCrit = effects ? effects.player.nextCritChance : 0;
            const isCrit = Math.random() < Math.min(0.7, 0.1 + combined.critChance + extraCrit);
            if (effects) effects.player.nextCritChance = 0;
            const BL = window.BattleLogic;
            let raw = BL.calculateDamage(combined.atk, this.getMonsterEffectiveDef());
            raw = this.applyFaithBonusDamage(raw, m);
            const hpFrac = combined.hp > 0 ? p.hp / combined.hp : 1;
            let dmg = BL.applyPlayerPhysicalLayersAfterFaith(raw, combined, hpFrac, isCrit);
            m.hp -= dmg;
            if (m.isBoss && !this.state.battle.flags.lowHpCutscenePlayed && m.hp <= m.maxHp * 0.3) {
                this.state.battle.flags.lowHpCutscenePlayed = true;
                this.log(`${m.name}의 형상이 흔들립니다... 마지막 저항이 시작됩니다!`, 'effect');
            }
            const targetEl = document.querySelector('.monster-card');
            this.triggerPlayerPhysicalHitFx(isCrit, { id: 'basic_attack', tags: ['attack', 'slash'] });
            this.spawnMonsterSkillFx({ id: 'basic_attack', tags: ['attack', 'slash'] }, { fxType: 'slash', emphasize: !!isCrit });
            this.spawnDamagePopup(targetEl, dmg, isCrit, false);
            this.log(`${m.name}에게 ${dmg}${isCrit ? '!!! (강력한 일격)' : ''}의 피해를 입혔습니다!`, 'player');
            this.applyLifeStealFromDamage(dmg);
            this.applyPpOnHitPassive(dmg);
            this.updateUI();
            if (m.hp <= 0) return this.winBattle();
            const ds = Math.min(0.35, Math.max(0, this.getPassiveBonuses().doubleStrikeChance || 0));
            if (ds > 0 && Math.random() < ds) {
                const dmg2 = Math.max(1, Math.round(dmg * 0.56));
                m.hp -= dmg2;
                this.spawnMonsterSkillFx({ id: 'double_strike', tags: ['attack', 'slash'] }, { fxType: 'slash' });
                this.spawnDamagePopup(targetEl, dmg2, false, false, { xOffset: 24, yOffset: -8 });
                this.log(`추가 일격! ${dmg2}의 피해`, 'player');
                this.applyLifeStealFromDamage(dmg2);
                this.applyPpOnHitPassive(dmg2);
                this.updateUI();
                if (m.isBoss && !this.state.battle.flags.lowHpCutscenePlayed && m.hp <= m.maxHp * 0.3) {
                    this.state.battle.flags.lowHpCutscenePlayed = true;
                    this.log(`${m.name}의 형상이 흔들립니다... 마지막 저항이 시작됩니다!`, 'effect');
                }
                if (m.hp <= 0) return this.winBattle();
            }
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        },
        monsterTurn() {
            if (!this.state.battle) return;
            const m = this.state.battle.monster;
            const p = this.state.player;
            const combined = this.getPlayerCombinedStats();
            const effects = this.getBattleEffects();
            const playerFx = effects?.player;
            const totalEvadeChance = Math.min(0.5, (playerFx?.evadeChance || 0) + combined.evadeChance);
            if (totalEvadeChance > 0 && Math.random() < totalEvadeChance) {
                this.log('찬양의 은혜로 공격을 회피했습니다!', 'effect');
                this.finishMonsterTurnHandoff();
                return;
            }
            const monsterSkillId = this.chooseMonsterSkill(m);
            const skillData = monsterSkillId ? window.GAME_DATA.skills[monsterSkillId] : null;
            if (skillData && skillData.type === 'buff' && skillData.effect?.monsterBuff) {
                this.applyBossMonsterBuff(skillData.effect);
                this.log(`${m.name}의 [${skillData.name}]! 자세가 바뀝니다.`, 'enemy');
                if (p.hp <= 0) return this.loseBattle();
                this.finishMonsterTurnHandoff({ preTickUpdate: true });
                return;
            }
            const skillEffect = skillData?.effect || { atkMul: 1 };
            const atkMul = skillEffect.atkMul || 1;
            const totalDef = combined.def * (playerFx?.defMulValue || 1);
            const baseAtk = this.getMonsterEffectiveAtk();
            const dmg = Math.round(this.calculateDamage(baseAtk * atkMul, totalDef));
            const appliedDmg = Math.round(dmg * combined.damageTakenMul);
            p.hp -= appliedDmg;
            this.applySkillEffectToTarget(skillEffect, true, m);
            const targetEl = document.querySelector('.battle-image-wrap--player') || document.querySelector('.character-pane');
            this.spawnDamagePopup(targetEl, appliedDmg, false, true);
            this.triggerMonsterImpactFx(skillData || { id: 'monster_attack', tags: ['attack'] });
            this.log(skillData ? `${m.name}의 [${skillData.name}]! ${appliedDmg}의 피해를 입었습니다.` : `${m.name}의 공격! ${appliedDmg}의 피해를 입었습니다.`, 'enemy');
            this.updateUI();
            if (p.hp <= 0) return this.loseBattle();
            this.finishMonsterTurnHandoff();
        },
        pickWeightedSkillId(skillIds, weights) { if (!skillIds || skillIds.length === 0) return null; const w = weights && weights.length === skillIds.length ? weights : skillIds.map(() => 1); const sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum; for (let i = 0; i < skillIds.length; i++) { r -= w[i]; if (r <= 0) return skillIds[i]; } return skillIds[skillIds.length - 1]; },
        getMonsterSkillTreePool(monster) {
            const BL = window.BattleLogic;
            const ratio = monster.maxHp > 0 ? monster.hp / monster.maxHp : 1;
            if (monster.isBoss && Array.isArray(monster.bossActiveSkillIds) && monster.bossActiveSkillIds.length > 0) {
                return BL.pickSkillPoolByHpRatio(ratio, { skillIds: monster.bossActiveSkillIds, weights: monster.bossActiveWeights }, monster.bossActiveLowHp);
            }
            const trees = window.GAME_DATA.monsterSkillTrees;
            const tree = monster.skillTreeId && trees ? trees[monster.skillTreeId] : null;
            if (tree) {
                return BL.pickSkillPoolByHpRatio(ratio, tree.defaultPool, tree.lowHp);
            }
            if (monster.skills && monster.skills.length) return { skillIds: monster.skills, weights: null };
            return null;
        },
        chooseMonsterSkill(monster) {
            const pool = this.getMonsterSkillTreePool(monster);
            if (!pool || !pool.skillIds.length) return null;
            const useChance = monster.isBoss
                ? this.getBossMonsterAilmentModifiers(monster).skillUseChance
                : 0.45;
            if (Math.random() > useChance) return null;
            return this.pickWeightedSkillId(pool.skillIds, pool.weights);
        },
        calculateDamage(atk, def) { return window.BattleLogic.calculateDamage(atk, def); },
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
                if (typeof this.recordBossDropEquipTier === 'function') {
                    this.recordBossDropEquipTier(drop.itemId, bossId);
                }
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
        grantRelicTokenByBattle(monster) {
            if (!monster) return;
            const region = window.GAME_DATA?.regions?.[monster.regionId || this.state.world.currentRegionId] || {};
            const tier = Math.max(1, Math.min(7, Number(region.enemyPowerTier || 1)));
            const talentCfg = window.GAME_DATA?.relicGacha?.talentDrop || {};
            let gain = 0;
            if (monster.isBoss) {
                const amountByTier = talentCfg?.boss?.amountByTier || {};
                gain = Number(amountByTier[tier]);
                if (!Number.isFinite(gain) || gain <= 0) gain = 0.1 + ((tier - 1) * 0.9 / 6);
            } else {
                const field = talentCfg?.field || {};
                const chance = Number(field?.chanceByTier?.[tier]);
                const chanceSafe = Number.isFinite(chance) ? Math.max(0, Math.min(1, chance)) : Math.min(0.012, 0.002 + tier * 0.0015);
                if (Math.random() < chanceSafe) {
                    const min = Math.max(0, Number(field.min || 0.01));
                    const max = Math.max(min, Number(field.max || 0.1));
                    gain = min + (Math.random() * (max - min));
                }
            }
            if (gain <= 0) return;
            this.state.player.relicToken = Math.max(0, Number(this.state.player.relicToken || 0)) + gain;
            this.log(`[달란트] +${gain.toFixed(3).replace(/\.?0+$/, '')} 획득`, 'effect');
        },
        winBattle() {
            const battleInfo = this.state.battle;
            const m = battleInfo.monster;
            this.log(`${m.name}을(를) 물리쳤습니다!`, "info");
            this.log(`경험치 ${m.reward.exp}, 골드 ${m.reward.gold}를 획득했습니다.`, "system");
            this.state.player.exp += m.reward.exp;
            this.state.player.gold += m.reward.gold;
            this.calculateDrops(m.dropTableId);
            this.grantRelicTokenByBattle(m);
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

        /**
         * 합성 스킬의 구성 요소 하나를 적용 (damageMul·buffEffectMul 적용).
         * @param {object} subSkillData GAME_DATA.skills 항목
         * @param {{ damageMul: number, buffEffectMul: number }} profile
         * @param {{ fromMerged?: boolean }} [options]
         */
        applyPartialPlayerSkillForBattle(subSkillData, profile, options = {}) {
            const dmgMul = Number(profile.damageMul || 0.88);
            const bufMul = Number(profile.buffEffectMul || 0.88);
            const fromMerged = !!options.fromMerged;
            const p = this.state.player;
            const combined = this.getPlayerCombinedStats();
            if (!this.state.battle || !subSkillData || subSkillData.bossOnly) return;

            if (subSkillData.type === 'buff') {
                const effects = this.getBattleEffects();
                const effect = subSkillData.effect || {};
                const buffScale = subSkillData.scaling?.buff || {};
                if (effect.cleanse) {
                    if (!this.clearPlayerBattleDebuffs('합성 구성: 상태이상을 걷어냈습니다.')) {
                        this.log('정화 시도: 걸린 상태이상이 없었습니다.', 'info');
                    }
                }
                const healScale = subSkillData.scaling?.heal || (subSkillData.id === 'meditation'
                    ? { base: 24, atk: 0.12, def: 1.8, faith: 9 }
                    : null);
                if (healScale) {
                    const base = Number(healScale.base || 20);
                    const atkPart = (combined.atk || 0) * Number(healScale.atk || 0);
                    const defPart = (combined.def || 0) * Number(healScale.def || 0);
                    const faithPart = (combined.faith || 0) * Number(healScale.faith || 0);
                    let healAmount = Math.max(base, Math.floor(base + defPart + faithPart + atkPart));
                    healAmount = Math.max(1, Math.floor(healAmount * bufMul));
                    const beforeHp = p.hp;
                    p.hp = Math.min(combined.hp, p.hp + healAmount);
                    const actual = p.hp - beforeHp;
                    if (actual > 0) this.log(`회복(합성 ${bufMul}) HP +${actual}`, 'info');
                    else this.log('회복을 시도했지만 HP가 이미 가득 찼습니다.', 'info');
                }
                if (effect.defMul) {
                    const defMulBonus = Number(buffScale.defMulBase || 0) + (combined.def || 0) * Number(buffScale.defMulDef || 0) + (combined.faith || 0) * Number(buffScale.defMulFaith || 0);
                    const scaled = 1 + (effect.defMul + defMulBonus - 1) * bufMul;
                    effects.player.defMulValue = Math.max(effects.player.defMulValue, scaled);
                    effects.player.defMulTurns = Math.max(effects.player.defMulTurns, 2);
                }
                if (effect.evade) {
                    const evadeBonus = Number(buffScale.evadeBase || 0) + (combined.faith || 0) * Number(buffScale.evadeFaith || 0) + (combined.spd || 0) * Number(buffScale.evadeSpd || 0);
                    effects.player.evadeChance = Math.max(effects.player.evadeChance, (effect.evade + evadeBonus) * bufMul);
                    effects.player.evadeTurns = Math.max(effects.player.evadeTurns, 2);
                }
                if (effect.spdMul) {
                    const spdMulBonus = Number(buffScale.spdMulBase || 0) + (combined.faith || 0) * Number(buffScale.spdMulFaith || 0) + (combined.spd || 0) * Number(buffScale.spdMulSpd || 0);
                    const scaledSpd = 1 + (effect.spdMul + spdMulBonus - 1) * bufMul;
                    effects.player.spdMulValue = Math.max(effects.player.spdMulValue, scaledSpd);
                    effects.player.spdMulTurns = Math.max(effects.player.spdMulTurns, 2);
                }
                if (effect.nextCrit) {
                    effects.player.nextCritChance = Math.max(effects.player.nextCritChance, effect.nextCrit * bufMul);
                }
                const appliedAnyBuff = !!(effect.defMul || effect.evade || effect.spdMul || effect.nextCrit || healScale);
                if (appliedAnyBuff) this.log('강화 효과가 적용되었습니다.', 'effect');
                return;
            }
            if (subSkillData.type === 'attack') {
                const effect = subSkillData.effect || {};
                const m = this.state.battle.monster;
                const targetEl = document.querySelector('.monster-card');
                const totalAtk = combined.atk;
                const atkMulRaw = effect.atkMul || 1.2;
                const atkMul = 1 + (atkMulRaw - 1) * dmgMul;
                const effects = this.getBattleEffects();
                const extraCrit = effects ? effects.player.nextCritChance : 0;
                const isCrit = Math.random() < Math.min(0.7, 0.1 + combined.critChance + extraCrit);
                if (effects) effects.player.nextCritChance = 0;
                const scale = subSkillData.scaling?.damage || { base: 10, atk: 0.24, def: 0.06, faith: 1.8 };
                const BL = window.BattleLogic;
                let raw = BL.calculateDamage(totalAtk * atkMul, this.getMonsterEffectiveDef());
                const scalingCore = Number(scale.base || 10)
                    + (combined.atk || 0) * Number(scale.atk || 0)
                    + (combined.def || 0) * Number(scale.def || 0)
                    + (combined.faith || 0) * Number(scale.faith || 0);
                const scalingBonus = Math.floor(scalingCore * dmgMul);
                raw += Math.max(Math.floor(Number(scale.base || 10) * dmgMul), scalingBonus);
                raw = this.applyFaithBonusDamage(raw, m);
                const hpFrac = combined.hp > 0 ? p.hp / combined.hp : 1;
                const dmg = BL.applyPlayerPhysicalLayersAfterFaith(raw, combined, hpFrac, isCrit);
                m.hp -= dmg;
                const effDebuff = effect.spdDebuff
                    ? { ...effect, spdDebuff: 1 - (1 - effect.spdDebuff) * dmgMul }
                    : effect;
                this.applySkillEffectToTarget(effDebuff, false);
                this.triggerPlayerPhysicalHitFx(isCrit, subSkillData);
                this.spawnMonsterSkillFx(subSkillData, { emphasize: !!isCrit });
                this.spawnDamagePopup(targetEl, dmg, isCrit, false);
                this.log(`${m.name}에게 ${dmg}${isCrit ? '!!!' : ''} (합성 구성)`, 'player');
                this.applyLifeStealFromDamage(dmg);
                this.applyPpOnHitPassive(dmg);
                if (!fromMerged) {
                    const ds = Math.min(0.35, Math.max(0, this.getPassiveBonuses().doubleStrikeChance || 0));
                    if (m.hp > 0 && ds > 0 && Math.random() < ds) {
                        const dmg2 = Math.max(1, Math.round(dmg * 0.56));
                        m.hp -= dmg2;
                        this.spawnDamagePopup(targetEl, dmg2, false, false, { xOffset: 26, yOffset: -10 });
                        this.log(`추가 일격! ${dmg2}의 피해`, 'player');
                        this.applyLifeStealFromDamage(dmg2);
                        this.applyPpOnHitPassive(dmg2);
                        this.updateUI();
                    }
                }
            }
        },

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
            const isMerged = Array.isArray(skillData.mergedFrom) && skillData.mergedFrom.length >= 2;
            const ppCost = isMerged ? this.getMergedSkillPpCost(skillData) : Math.max(0, Number(skillData.cost || 0));
            if (p.pp < ppCost) return this.log("PP가 부족합니다!", "system");

            p.pp -= ppCost;
            this.log(`${p.name}의 기술: [${skillData.name}]!`, "player");

            if (isMerged) {
                const profile = this.getSkillMergeProfile(skillData);
                for (const sid of skillData.mergedFrom) {
                    const raw = window.GAME_DATA.skills[sid];
                    if (!raw || raw.bossOnly) continue;
                    const sub = { ...raw, id: sid };
                    this.applyPartialPlayerSkillForBattle(sub, profile, { fromMerged: true });
                }
                this.updateUI();
                if (this.state.battle.monster.hp <= 0) return this.winBattle();
                this.state.battle.isPlayerTurn = false;
                setTimeout(() => this.monsterTurn(), 1000);
                return;
            }

            if (skillData.type === 'buff') {
                const effects = this.getBattleEffects();
                const effect = skillData.effect || {};
                const buffScale = skillData.scaling?.buff || {};

                if (effect.cleanse) {
                    if (!this.clearPlayerBattleDebuffs('정화의 숨으로 공포와 둔화를 걷어냈습니다.')) {
                        this.log('정화를 시도했지만 걸린 상태이상이 없었습니다.', 'info');
                    }
                }

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
                const appliedAnyBuff = !!(effect.defMul || effect.evade || effect.spdMul || effect.nextCrit || healScale);
                if (appliedAnyBuff) this.log('강화 효과가 적용되었습니다.', 'effect');
            } else {
                const effect = skillData.effect || {};
                const m = this.state.battle.monster;
                const targetEl = document.querySelector('.monster-card');
                const totalAtk = combined.atk;
                const atkMul = effect.atkMul || 1.2;
                const effects = this.getBattleEffects();
                const extraCrit = effects ? effects.player.nextCritChance : 0;
                const isCrit = Math.random() < Math.min(0.7, 0.1 + combined.critChance + extraCrit);
                if (effects) effects.player.nextCritChance = 0;

                // 공격 스킬: 최소 고정값 + 스탯 비례(데이터 기반) — 평타와 동일한 치명 확률·배율
                const scale = skillData.scaling?.damage || { base: 10, atk: 0.24, def: 0.06, faith: 1.8 };
                const BL = window.BattleLogic;

                let raw = BL.calculateDamage(totalAtk * atkMul, this.getMonsterEffectiveDef());
                const scalingBonus = Math.floor(
                    Number(scale.base || 10) +
                    (combined.atk || 0) * Number(scale.atk || 0) +
                    (combined.def || 0) * Number(scale.def || 0) +
                    (combined.faith || 0) * Number(scale.faith || 0)
                );
                raw += Math.max(Number(scale.base || 10), scalingBonus);
                raw = this.applyFaithBonusDamage(raw, m);
                const hpFrac = combined.hp > 0 ? p.hp / combined.hp : 1;
                let dmg = BL.applyPlayerPhysicalLayersAfterFaith(raw, combined, hpFrac, isCrit);

                m.hp -= dmg;
                this.applySkillEffectToTarget(effect, false);
                this.triggerPlayerPhysicalHitFx(isCrit, skillData);
                this.spawnMonsterSkillFx(skillData, { emphasize: !!isCrit });
                this.spawnDamagePopup(targetEl, dmg, isCrit, false);
                this.log(`${m.name}에게 ${dmg}${isCrit ? '!!! (강력한 일격)' : ''}의 피해를 입혔습니다!`, "player");
                this.applyLifeStealFromDamage(dmg);
                this.applyPpOnHitPassive(dmg);
                const ds = Math.min(0.35, Math.max(0, this.getPassiveBonuses().doubleStrikeChance || 0));
                if (m.hp > 0 && ds > 0 && Math.random() < ds) {
                    const dmg2 = Math.max(1, Math.round(dmg * 0.56));
                    m.hp -= dmg2;
                    this.spawnDamagePopup(targetEl, dmg2, false, false, { xOffset: 26, yOffset: -10 });
                    this.log(`추가 일격! ${dmg2}의 피해`, 'player');
                    this.applyLifeStealFromDamage(dmg2);
                    this.applyPpOnHitPassive(dmg2);
                    this.updateUI();
                }
            }

            this.updateUI();
            if (this.state.battle.monster.hp <= 0) return this.winBattle();

            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        },
        tryEscape() { if (!this.state.battle || !this.state.battle.isPlayerTurn) return; const bonus = this.inventory.getBonuses((itemId, itemData) => this.getItemComputedBonuses(itemId, itemData)); const playerSpd = this.getPlayerSpeed(bonus); const monsterSpd = this.getMonsterSpeed(); const rawRate = playerSpd / (playerSpd + monsterSpd); const escapeRate = Math.max(0.05, Math.min(0.9, rawRate)); if (Math.random() < escapeRate) { this.log("무사히 도망쳤습니다!", "info"); this.state.world.bossDungeonAuto = { active: false, bossId: null, startedAt: 0, runCount: 0 }; this.state.battle = null; this.toggleBattleUI(false); this.updateUI(); this.saveGame(); } else { this.log(`도망치는 데 실패했습니다! (성공 확률 ${Math.round(escapeRate * 100)}%)`, "battle"); this.state.battle.isPlayerTurn = false; setTimeout(() => this.monsterTurn(), 1000); } }
    });
})();
