/**
 * Basileia - Game Engine Core
 */

class GameEngine {
    constructor() {
        this.state = {
            player: {
                name: "순례자",
                title: "Pilgrim",
                level: 1,
                hp: 80,
                maxHp: 80,
                pp: 30,
                maxPp: 30,
                atk: 8,
                def: 4,
                spd: 95,
                faith: 1,
                exp: 0,
                nextExp: 80,
                gold: 0,
                bonusPoints: 0,
                classId: 'pilgrim',
                activeSkillIds: ['meditation', 'praise', 'proclaim'],
                unlockedSkillNodes: ['pilgrim_origin'],
                skillTreePoints: 0,
                autoBattleEnabled: false,
                avatarGender: 'male',
                equipmentViewMode: 'avatar'
            },
            world: {
                currentRegionId: "pishon",
                saturation: 0,
                isNavigating: false,
                explorationProgress: 0,
                bossDefeated: false
            }
        };

        this.inventory = new window.InventoryManager();
        this.init();
    }

    init() {
        if (typeof window !== 'undefined' && window.AuthManager) {
            const user = window.AuthManager.getCurrentUser();
            if (!user) {
                document.getElementById('auth-overlay').classList.remove('hidden');
                this.bindAuthEvents();
                return; // Stop initialization until logged in
            }
        }

        const savedData = window.StorageManager.load();
        if (savedData) {
            this.state = savedData;
            this.ensureStateSchema();
            
            if (this.state.inventoryData) {
                this.inventory = new window.InventoryManager(this.state.inventoryData);
            }
            this.log("이전의 여정을 이어갑니다...", "system");
        } else {
            // 새 게임인 경우 닉네임 로드
            if (typeof window !== 'undefined' && window.AuthManager) {
                this.state.player.name = window.AuthManager.getNickname();
            }
        }

        this.ensureStateSchema();
        this.bindEvents();
        this.toggleBattleUI(false);
        this.hideVerseOverlay();
        this.updateUI();
        this.renderTabContent('inventory'); // 추가: 게임 시작 시 인벤토리 목록 렌더링
        this.renderEquipmentPanel();
        this.log("세상이 회색빛으로 물들었습니다. 당신의 순례는 여기서부터 시작됩니다.", "system");
    }

    ensureStateSchema() {
        if (!this.state.player) this.state.player = {};
        if (!this.state.world) this.state.world = {};

        const playerDefaults = {
            name: "순례자",
            title: "Pilgrim",
            level: 1,
            hp: 80,
            maxHp: 80,
            pp: 30,
            maxPp: 30,
            atk: 8,
            def: 4,
            spd: 95,
            faith: 1,
            exp: 0,
            nextExp: 80,
            gold: 0,
            bonusPoints: 0,
            classId: 'pilgrim',
            activeSkillIds: ['meditation', 'praise', 'proclaim'],
            unlockedSkillNodes: ['pilgrim_origin'],
            skillTreePoints: 0,
            autoBattleEnabled: false,
            avatarGender: 'male',
            equipmentViewMode: 'avatar'
        };
        Object.entries(playerDefaults).forEach(([key, value]) => {
            if (this.state.player[key] === undefined || this.state.player[key] === null) {
                this.state.player[key] = value;
            }
        });

        // 구버전 세이브 호환: skills[] -> activeSkillIds
        if ((!Array.isArray(this.state.player.activeSkillIds) || this.state.player.activeSkillIds.length === 0) && Array.isArray(this.state.player.skills)) {
            this.state.player.activeSkillIds = this.state.player.skills.map(skill => skill.id);
        }

        if (!Array.isArray(this.state.player.activeSkillIds) || this.state.player.activeSkillIds.length === 0) {
            this.state.player.activeSkillIds = ['meditation', 'praise', 'proclaim'];
        }
        if (!this.state.player.activeSkillIds.includes('proclaim')) {
            this.state.player.activeSkillIds.push('proclaim');
        }
        if (typeof window !== 'undefined' && window.GAME_DATA?.skills) {
            this.state.player.activeSkillIds = (this.state.player.activeSkillIds || []).filter(id => {
                const s = window.GAME_DATA.skills[id];
                return s && !s.bossOnly;
            });
        }

        const skillTree = this.getSkillTreeConfig();
        const startNodeId = skillTree?.startNodeId || 'pilgrim_origin';
        if (!Array.isArray(this.state.player.unlockedSkillNodes)) {
            this.state.player.unlockedSkillNodes = [startNodeId];
        }
        if (!this.state.player.unlockedSkillNodes.includes(startNodeId)) {
            this.state.player.unlockedSkillNodes.unshift(startNodeId);
        }

        this.syncUnlockedActiveSkills();
        // 구버전 호환 필드 유지(저장 안정성)
        this.state.player.skills = this.getActiveSkills().map(skill => ({ id: skill.id, name: skill.name, cost: skill.cost }));

        if (this.state.player.avatarGender !== 'male' && this.state.player.avatarGender !== 'female') {
            this.state.player.avatarGender = 'male';
        }
        if (this.state.player.equipmentViewMode !== 'avatar' && this.state.player.equipmentViewMode !== 'edit') {
            this.state.player.equipmentViewMode = 'avatar';
        }

        if (!this.state.world.currentRegionId) this.state.world.currentRegionId = "pishon";
        if (this.state.world.saturation === undefined) this.state.world.saturation = 0;
        if (this.state.world.explorationProgress === undefined) this.state.world.explorationProgress = 0;
        if (this.state.world.bossDefeated === undefined) this.state.world.bossDefeated = false;

        // 세션 관련 휘발성 상태는 로드 시 초기화
        this.state.world.isNavigating = false;
        this.state.battle = null;
    }

    getSkillTreeConfig() {
        const classId = this.state.player.classId || 'pilgrim';
        return window.GAME_DATA.skillTrees?.[classId] || null;
    }

    getSkillTreeNodeMap() {
        const tree = this.getSkillTreeConfig();
        const map = {};
        if (!tree || !Array.isArray(tree.nodes)) return map;
        tree.nodes.forEach(node => { map[node.id] = node; });
        return map;
    }

    getActiveSkills() {
        const ids = (this.state.player.activeSkillIds || []).filter(id => !window.GAME_DATA.skills[id]?.bossOnly);
        return ids.map(id => ({ id, ...(window.GAME_DATA.skills[id] || { name: id, cost: 0 }) }));
    }

    syncUnlockedActiveSkills() {
        const tree = this.getSkillTreeConfig();
        if (!tree) return;
        const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
        const nodeMap = this.getSkillTreeNodeMap();
        const activeSet = new Set(this.state.player.activeSkillIds || []);

        unlocked.forEach(nodeId => {
            const node = nodeMap[nodeId];
            const activeSkillId = node?.grants?.activeSkillId;
            if (activeSkillId) activeSet.add(activeSkillId);
        });

        this.state.player.activeSkillIds = Array.from(activeSet).filter(id => {
            const s = window.GAME_DATA.skills[id];
            return s && !s.bossOnly;
        });
    }

    getPassiveBonuses() {
        const bonuses = {
            atk: 0,
            def: 0,
            hp: 0,
            pp: 0,
            spd: 0,
            faith: 0,
            damageMul: 1,
            damageTakenMul: 1,
            critChance: 0,
            evadeChance: 0,
            lowHpDamageMul: 1
        };

        const nodeMap = this.getSkillTreeNodeMap();
        (this.state.player.unlockedSkillNodes || []).forEach(nodeId => {
            const grants = nodeMap[nodeId]?.grants;
            if (!grants) return;

            if (grants.stats) {
                Object.entries(grants.stats).forEach(([stat, value]) => {
                    if (bonuses[stat] !== undefined) bonuses[stat] += value;
                });
            }

            if (grants.specials) {
                Object.entries(grants.specials).forEach(([key, value]) => {
                    if (key === 'damageMul' || key === 'damageTakenMul' || key === 'lowHpDamageMul') {
                        bonuses[key] *= value;
                    } else if (key === 'critChance' || key === 'evadeChance') {
                        bonuses[key] += value;
                    }
                });
            }
        });

        return bonuses;
    }

    getPlayerCombinedStats() {
        const p = this.state.player;
        const equip = this.inventory.getBonuses();
        const passive = this.getPassiveBonuses();

        return {
            atk: p.atk + equip.atk + passive.atk,
            def: p.def + equip.def + passive.def,
            hp: p.maxHp + equip.hp + passive.hp,
            pp: p.maxPp + equip.pp + passive.pp,
            spd: p.spd + equip.spd + passive.spd,
            faith: p.faith + (equip.faith || 0) + passive.faith,
            critChance: Math.max(0, passive.critChance || 0),
            evadeChance: Math.max(0, passive.evadeChance || 0),
            damageMul: passive.damageMul || 1,
            damageTakenMul: passive.damageTakenMul || 1,
            lowHpDamageMul: passive.lowHpDamageMul || 1
        };
    }

    canUnlockSkillNode(nodeId) {
        const tree = this.getSkillTreeConfig();
        if (!tree) return { ok: false, reason: '스킬트리 정보를 찾을 수 없습니다.' };
        const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
        if (unlocked.has(nodeId)) return { ok: false, reason: '이미 배운 노드입니다.' };
        if (this.state.player.skillTreePoints <= 0) return { ok: false, reason: '스킬트리 포인트가 부족합니다.' };

        const nodeMap = this.getSkillTreeNodeMap();
        const node = nodeMap[nodeId];
        if (!node) return { ok: false, reason: '존재하지 않는 노드입니다.' };

        const isAdjacent = (tree.edges || []).some(([from, to]) =>
            (from === nodeId && unlocked.has(to)) || (to === nodeId && unlocked.has(from))
        );
        if (!isAdjacent) return { ok: false, reason: '연결된 노드부터 해금해야 합니다.' };
        return { ok: true };
    }

    emitSkillTreeFeedback(message, notify = 'log', type = 'system') {
        if (notify === 'toast') {
            this.showSkillTreeToast(message, type === 'effect' ? 'success' : 'info');
            return;
        }
        if (notify !== 'none') {
            this.log(`[스킬트리] ${message}`, type);
        }
    }

    unlockSkillNode(nodeId, options = {}) {
        const notify = options.notify || 'log';
        const check = this.canUnlockSkillNode(nodeId);
        if (!check.ok) {
            this.emitSkillTreeFeedback(check.reason, notify, 'system');
            return { ok: false, message: check.reason };
        }

        this.state.player.unlockedSkillNodes.push(nodeId);
        this.state.player.skillTreePoints = Math.max(0, this.state.player.skillTreePoints - 1);
        this.syncUnlockedActiveSkills();
        const nodeName = this.getSkillTreeNodeMap()[nodeId].name;
        const message = `새로운 노드를 해금했습니다: ${nodeName}`;
        this.emitSkillTreeFeedback(message, notify, 'effect');
        this.updateUI();
        this.saveGame();
        return { ok: true, message, nodeName };
    }

    formatNodeGrantText(node) {
        if (!node || !node.grants) return '효과 정보 없음';
        const parts = [];
        const statKo = { atk: '공격', def: '방어', hp: 'HP', pp: 'PP', spd: '속도', faith: '신앙' };

        if (node.grants.stats) {
            const statStr = Object.entries(node.grants.stats)
                .map(([k, v]) => `${statKo[k] || k} ${v > 0 ? '+' : ''}${v}`)
                .join(' · ');
            parts.push(statStr);
        }
        if (node.grants.activeSkillId) {
            const skill = window.GAME_DATA.skills[node.grants.activeSkillId];
            parts.push(`액티브 해금: ${skill ? skill.name : node.grants.activeSkillId}`);
        }
        if (node.grants.specials) {
            Object.entries(node.grants.specials).forEach(([k, v]) => {
                if (k === 'damageMul') parts.push(`피해량 ${Math.round((v - 1) * 100)}% 증가`);
                if (k === 'damageTakenMul') parts.push(`받는 피해 ${Math.round((1 - v) * 100)}% 감소`);
                if (k === 'critChance') parts.push(`치명타 +${Math.round(v * 100)}%`);
                if (k === 'evadeChance') parts.push(`회피 +${Math.round(v * 100)}%`);
                if (k === 'lowHpDamageMul') parts.push(`HP 50% 이하 피해 +${Math.round((v - 1) * 100)}%`);
            });
        }

        return parts.join(' / ') || '효과 정보 없음';
    }

    formatActiveSkillSummary(skillData) {
        if (!skillData) return '효과 정보 없음';
        const effect = skillData.effect || {};
        const chunks = [];
        if (effect.atkMul) chunks.push(`피해 x${effect.atkMul.toFixed(2)}`);
        if (effect.defMul) chunks.push(`방어 x${effect.defMul.toFixed(2)}`);
        if (effect.evade) chunks.push(`회피 +${Math.round(effect.evade * 100)}%`);
        if (effect.spdMul) chunks.push(`속도 x${effect.spdMul.toFixed(2)}`);
        if (effect.nextCrit) chunks.push(`다음 치명 +${Math.round(effect.nextCrit * 100)}%`);
        if (effect.spdDebuff) chunks.push(`적 속도 ${Math.round(effect.spdDebuff * 100)}%`);
        if (effect.fear) chunks.push('공포 부여');
        return chunks.join(' · ') || '기본 효과';
    }

    formatActiveSkillTooltip(skillData) {
        if (!skillData) return '상세 정보 없음';
        const lines = [
            `타입: ${skillData.type === 'buff' ? '강화' : '공격'}`,
            `소모 PP: ${skillData.cost || 0}`,
            `요약: ${this.formatActiveSkillSummary(skillData)}`
        ];
        if (skillData.desc) lines.push(`설명: ${skillData.desc}`);
        return lines.join('\n');
    }

    formatPassiveSkillSummary(node) {
        if (!node) return '효과 정보 없음';
        return this.formatNodeGrantText(node);
    }

    formatPassiveSkillTooltip(node) {
        if (!node) return '상세 정보 없음';
        const lines = [
            `노드 유형: ${node.kind}`,
            `요약: ${this.formatPassiveSkillSummary(node)}`
        ];
        if (node.desc) lines.push(`설명: ${node.desc}`);
        return lines.join('\n');
    }

    showSkillTreeToast(message, kind = 'info') {
        const stack = document.getElementById('skill-web-toast-stack');
        if (!stack) {
            this.log(`[스킬트리] ${message}`, kind === 'success' ? 'effect' : 'system');
            return;
        }

        let prefix = 'ℹ️ ';
        if (kind === 'success') prefix = '✅ ';
        else if (/부족/.test(message)) prefix = '⚠️ ';
        else if (/연결된|해금해야/.test(message)) prefix = '🔗 ';
        else if (/이미/.test(message)) prefix = '🔁 ';
        else if (/존재하지 않는/.test(message)) prefix = '❌ ';
        const text = prefix + message;

        const toast = document.createElement('div');
        toast.className = `skill-web-toast ${kind}`;
        toast.innerText = text;
        stack.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 220);
        }, 1800);
    }

    getSkillTreeLayout(tree) {
        const unit = 96;
        const padding = 180;
        const fallbackRadius = 2.4;
        const positions = {};
        const nodes = Array.isArray(tree?.nodes) ? tree.nodes : [];
        const total = Math.max(1, nodes.length);

        nodes.forEach((node, index) => {
            const p = node.position || {
                x: Math.cos((Math.PI * 2 * index) / total) * fallbackRadius,
                y: Math.sin((Math.PI * 2 * index) / total) * fallbackRadius
            };
            positions[node.id] = { x: p.x * unit, y: p.y * unit };
        });

        const points = Object.values(positions);
        const maxAbsX = Math.max(...points.map(p => Math.abs(p.x)), 0);
        const maxAbsY = Math.max(...points.map(p => Math.abs(p.y)), 0);
        const width = Math.max(980, maxAbsX * 2 + padding * 2);
        const height = Math.max(780, maxAbsY * 2 + padding * 2);
        const originX = width / 2;
        const originY = height / 2;

        Object.keys(positions).forEach(nodeId => {
            positions[nodeId].x += originX;
            positions[nodeId].y += originY;
        });

        return { positions, width, height, originX, originY };
    }

    getSkillNodeStateLabel(nodeId, unlocked) {
        if (unlocked.has(nodeId)) return '해금 완료';
        if (this.canUnlockSkillNode(nodeId).ok) return '해금 가능';
        return '잠김';
    }

    getSkillNodeClass(nodeId, unlocked) {
        if (unlocked.has(nodeId)) return 'is-unlocked';
        if (this.canUnlockSkillNode(nodeId).ok) return 'is-available';
        return 'is-locked';
    }

    openSkillTreeModal() {
        const tree = this.getSkillTreeConfig();
        if (!tree) return this.log('스킬트리 정보를 찾을 수 없습니다.', 'system');

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const unlocked = new Set(this.state.player.unlockedSkillNodes || []);
        const nodeMap = this.getSkillTreeNodeMap();
        const { positions, width, height, originX, originY } = this.getSkillTreeLayout(tree);

        const edges = (tree.edges || []).map(([from, to]) => {
            const a = positions[from];
            const b = positions[to];
            if (!a || !b) return '';
            const active = unlocked.has(from) && unlocked.has(to);
            return `<line class="skill-web-edge ${active ? 'active' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`;
        }).join('');

        const nodes = (tree.nodes || []).map(node => {
            const pos = positions[node.id];
            if (!pos) return '';
            const stateClass = this.getSkillNodeClass(node.id, unlocked);
            const label = this.getSkillNodeStateLabel(node.id, unlocked);
            const effect = this.formatNodeGrantText(node);
            return `
                <g class="skill-web-node ${stateClass} kind-${node.kind}" data-node-id="${node.id}" transform="translate(${pos.x}, ${pos.y})">
                    <circle class="skill-web-node-core" r="20"></circle>
                    <circle class="skill-web-node-ring" r="28"></circle>
                    <text class="skill-web-node-name" text-anchor="middle" y="-38">${node.name}</text>
                    <text class="skill-web-node-state" text-anchor="middle" y="47">${label}</text>
                    <title>${node.name}\n${effect}\n${node.desc || ''}</title>
                </g>
            `;
        }).join('');

        content.style.width = '980px';
        content.style.maxWidth = '97vw';
        content.innerHTML = `
            <h3 style="margin-bottom: 8px;">${tree.className} 스킬트리</h3>
            <p style="margin-bottom: 12px; color:#ffd54f;">남은 포인트: ${this.state.player.skillTreePoints}</p>
            <div class="skill-web-toolbar">
                <span class="skill-web-help">드래그로 이동, 휠/버튼으로 확대·축소 · 노드를 클릭해 선택 후 「배우기」로 해금</span>
                <div class="skill-web-zoom-buttons">
                    <button id="skill-web-zoom-out" class="action-btn small">-</button>
                    <span id="skill-web-zoom-level">100%</span>
                    <button id="skill-web-zoom-in" class="action-btn small">+</button>
                    <button id="skill-web-focus-center" class="action-btn small primary">중앙 포커스</button>
                    <button id="skill-web-zoom-reset" class="action-btn small">초기화</button>
                </div>
            </div>
            <div id="skill-web-viewport" class="skill-web-viewport">
                <div id="skill-web-zoom-layer" class="skill-web-zoom-layer">
                    <svg class="skill-web-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                        <g class="skill-web-edges">${edges}</g>
                        <g class="skill-web-nodes">${nodes}</g>
                    </svg>
                </div>
            </div>
            <div id="skill-web-toast-stack" class="skill-web-toast-stack"></div>
            <div id="skill-web-info" class="skill-web-info">노드를 선택하면 상세 효과를 확인할 수 있습니다.</div>
            <div class="skill-web-learn-row">
                <button type="button" id="skill-web-learn" class="action-btn primary" disabled>배우기</button>
            </div>
            <button id="btn-close-skilltree" class="action-btn" style="margin-top: 14px; width: 100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        const viewport = content.querySelector('#skill-web-viewport');
        const zoomLayer = content.querySelector('#skill-web-zoom-layer');
        const infoBox = content.querySelector('#skill-web-info');
        const learnBtn = content.querySelector('#skill-web-learn');
        const zoomLabel = content.querySelector('#skill-web-zoom-level');

        let selectedNodeId = null;

        const fillInfoForNode = (nodeId) => {
            const node = nodeId ? nodeMap[nodeId] : null;
            if (!node || !infoBox) return;
            infoBox.innerHTML = `
                    <strong>${node.name}</strong>
                    <div>${node.desc || ''}</div>
                    <div class="effect">${this.formatNodeGrantText(node)}</div>
                    <div class="meta">${this.getSkillNodeStateLabel(node.id, unlocked)} · ${node.kind}</div>
                `;
        };

        const updateLearnButton = () => {
            if (!learnBtn) return;
            learnBtn.removeAttribute('title');
            const unlockedNow = new Set(this.state.player.unlockedSkillNodes || []);
            if (!selectedNodeId) {
                learnBtn.disabled = true;
                learnBtn.textContent = '배우기';
                learnBtn.title = '노드를 먼저 선택하세요';
                return;
            }
            if (unlockedNow.has(selectedNodeId)) {
                learnBtn.disabled = true;
                learnBtn.textContent = '이미 해금됨';
                return;
            }
            const check = this.canUnlockSkillNode(selectedNodeId);
            if (check.ok) {
                learnBtn.disabled = false;
                learnBtn.textContent = '배우기';
            } else {
                learnBtn.disabled = true;
                learnBtn.textContent = '배우기';
                learnBtn.title = check.reason;
            }
        };

        const updateSelectionVisual = () => {
            content.querySelectorAll('.skill-web-node').forEach(el => {
                const id = el.getAttribute('data-node-id');
                el.classList.toggle('is-selected', id === selectedNodeId);
            });
        };

        if (viewport && zoomLayer && zoomLabel) {
            const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
            let zoom = 1;
            const centerOnOrigin = () => {
                viewport.scrollLeft = Math.max(0, originX * zoom - viewport.clientWidth / 2);
                viewport.scrollTop = Math.max(0, originY * zoom - viewport.clientHeight / 2);
            };

            const setZoom = (nextZoom, focusX, focusY) => {
                const prevZoom = zoom;
                zoom = clamp(nextZoom, 0.55, 2.4);
                zoomLayer.style.transform = `scale(${zoom})`;
                zoomLabel.innerText = `${Math.round(zoom * 100)}%`;

                if (focusX === undefined || focusY === undefined) {
                    centerOnOrigin();
                    return;
                }
                const worldX = (viewport.scrollLeft + focusX) / prevZoom;
                const worldY = (viewport.scrollTop + focusY) / prevZoom;
                viewport.scrollLeft = worldX * zoom - focusX;
                viewport.scrollTop = worldY * zoom - focusY;
            };

            setTimeout(() => {
                centerOnOrigin();
            }, 0);

            viewport.addEventListener('wheel', (event) => {
                event.preventDefault();
                const rect = viewport.getBoundingClientRect();
                const focusX = event.clientX - rect.left;
                const focusY = event.clientY - rect.top;
                const delta = event.deltaY < 0 ? 0.1 : -0.1;
                setZoom(zoom + delta, focusX, focusY);
            }, { passive: false });

            let dragStartX = 0;
            let dragStartY = 0;
            let startScrollLeft = 0;
            let startScrollTop = 0;
            let dragging = false;

            viewport.addEventListener('pointerdown', (event) => {
                if (event.target.closest('.skill-web-node')) return;
                dragging = true;
                dragStartX = event.clientX;
                dragStartY = event.clientY;
                startScrollLeft = viewport.scrollLeft;
                startScrollTop = viewport.scrollTop;
                viewport.setPointerCapture(event.pointerId);
                viewport.classList.add('dragging');
            });

            viewport.addEventListener('pointermove', (event) => {
                if (!dragging) return;
                const dx = event.clientX - dragStartX;
                const dy = event.clientY - dragStartY;
                viewport.scrollLeft = startScrollLeft - dx;
                viewport.scrollTop = startScrollTop - dy;
            });

            viewport.addEventListener('pointerup', () => {
                dragging = false;
                viewport.classList.remove('dragging');
            });
            viewport.addEventListener('pointercancel', () => {
                dragging = false;
                viewport.classList.remove('dragging');
            });

            content.querySelector('#skill-web-zoom-in')?.addEventListener('click', () => {
                setZoom(zoom + 0.15, viewport.clientWidth / 2, viewport.clientHeight / 2);
            });
            content.querySelector('#skill-web-zoom-out')?.addEventListener('click', () => {
                setZoom(zoom - 0.15, viewport.clientWidth / 2, viewport.clientHeight / 2);
            });
            content.querySelector('#skill-web-zoom-reset')?.addEventListener('click', () => {
                setZoom(1);
            });
            content.querySelector('#skill-web-focus-center')?.addEventListener('click', () => centerOnOrigin());
        }

        content.querySelectorAll('.skill-web-node').forEach(nodeEl => {
            nodeEl.addEventListener('mouseenter', () => {
                if (selectedNodeId) return;
                const nodeId = nodeEl.getAttribute('data-node-id');
                fillInfoForNode(nodeId);
            });
            nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = nodeEl.getAttribute('data-node-id');
                if (!nodeId) return;
                selectedNodeId = nodeId;
                updateSelectionVisual();
                fillInfoForNode(selectedNodeId);
                updateLearnButton();
            });
        });

        learnBtn?.addEventListener('click', () => {
            if (!selectedNodeId || learnBtn.disabled) return;
            const result = this.unlockSkillNode(selectedNodeId, { notify: 'none' });
            if (result.ok) {
                this.openSkillTreeModal();
                this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'skills');
                this.showSkillTreeToast(result.message, 'success');
            } else {
                this.showSkillTreeToast(result.message, 'info');
                updateLearnButton();
            }
        });

        const closeBtn = document.getElementById('btn-close-skilltree');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                content.style.width = '';
                content.style.maxWidth = '';
                modal.classList.add('hidden');
            });
        }
    }

    saveGame() {
        this.state.inventoryData = this.inventory.serialize();
        window.StorageManager.save(this.state);
    }

    bindEvents() {
        // Explore Actions
        document.getElementById('btn-explore').addEventListener('click', () => this.explore());
        document.getElementById('btn-worship').addEventListener('click', () => this.worship());
        document.getElementById('btn-rest').addEventListener('click', () => this.rest());
        document.getElementById('btn-shop').addEventListener('click', () => this.openShop());
        const bossBtn = document.getElementById('btn-boss-challenge');
        if (bossBtn) bossBtn.addEventListener('click', () => this.bossChallenge());

        // Region Transition
        const nextRegionBtn = document.createElement('button');
        nextRegionBtn.id = 'btn-next-region';
        nextRegionBtn.className = 'action-btn primary small hidden';
        nextRegionBtn.style.marginTop = '10px';
        nextRegionBtn.style.width = '100%';
        nextRegionBtn.innerText = '➡️ 다음 지역으로 이동';
        document.querySelector('.quest-section').appendChild(nextRegionBtn);
        nextRegionBtn.addEventListener('click', () => this.handleRegionTransition());

        // Battle Actions
        document.getElementById('btn-attack').addEventListener('click', () => this.playerAttack());
        document.getElementById('btn-skill').addEventListener('click', () => this.showSkillMenu());
        document.getElementById('btn-run').addEventListener('click', () => this.tryEscape());
        document.getElementById('btn-auto-battle').addEventListener('click', () => this.toggleAutoBattle());

        // UI Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Stat Point Buttons
        document.querySelectorAll('.point-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.spendPoint(e.target.dataset.stat));
        });

        // Verse Card Actions (Phase 3)
        document.getElementById('btn-close-verse').addEventListener('click', () => this.hideVerseOverlay());
        document.getElementById('btn-download-verse').addEventListener('click', () => this.downloadVerseCard());
        document.getElementById('verse-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'verse-overlay') this.hideVerseOverlay();
        });

        // Phase 6: Settings Actions
        const settingsOverlay = document.getElementById('settings-overlay');
        document.getElementById('btn-settings').addEventListener('click', () => {
            if (window.AuthManager) {
                document.getElementById('settings-nickname').value = window.AuthManager.getNickname();
                document.getElementById('settings-msg').innerText = '';
            }
            this.syncSettingsAvatarRadios();
            settingsOverlay.classList.remove('hidden');
        });

        document.getElementById('settings-avatar-male')?.addEventListener('change', (e) => {
            if (!e.target.checked) return;
            this.state.player.avatarGender = 'male';
            this.saveGame();
            this.renderEquipmentPanel();
        });
        document.getElementById('settings-avatar-female')?.addEventListener('change', (e) => {
            if (!e.target.checked) return;
            this.state.player.avatarGender = 'female';
            this.saveGame();
            this.renderEquipmentPanel();
        });
        
        document.getElementById('btn-update-nickname').addEventListener('click', () => {
            const newVal = document.getElementById('settings-nickname').value;
            const msgEl = document.getElementById('settings-msg');
            const res = window.AuthManager.updateNickname(newVal);
            if (res.success) {
                this.state.player.name = newVal;
                this.updateUI();
                msgEl.style.color = '#4caf50';
                msgEl.innerText = res.msg;
                this.saveGame();
            } else {
                msgEl.style.color = '#ff4b2b';
                msgEl.innerText = res.msg;
            }
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
        });
        document.getElementById('btn-logout').addEventListener('click', () => {
            window.AuthManager.logout();
            window.location.reload();
        });
        document.getElementById('btn-sync-upload').addEventListener('click', () => this.syncBackup(true));
        document.getElementById('btn-sync-download').addEventListener('click', () => this.syncBackup(false));
        document.getElementById('btn-open-skilltree-settings').addEventListener('click', () => {
            settingsOverlay.classList.add('hidden');
            this.openSkillTreeModal();
        });
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("경고: 모든 플레이 데이터가 삭제됩니다.\n정말 처음부터 다시 시작하시겠습니까?")) {
                window.StorageManager.clear();
                window.location.reload();
            }
        });
    }

    updateAutoBattleButton() {
        const btn = document.getElementById('btn-auto-battle');
        if (!btn) return;
        const enabled = !!this.state.player.autoBattleEnabled;
        const isBossFight = !!(this.state.battle?.monster?.isBoss);
        btn.innerText = isBossFight
            ? '🤖 자동전투 잠금(보스)'
            : `🤖 자동전투 ${enabled ? 'ON' : 'OFF'}`;
        btn.classList.toggle('auto-on', enabled);
        btn.disabled = isBossFight;
    }

    scheduleAutoBattleTurn(delayMs = 420) {
        if (!this.state.player.autoBattleEnabled) return;
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        if (this.state.battle.monster?.isBoss) return;
        setTimeout(() => {
            if (!this.state.player.autoBattleEnabled) return;
            if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
            if (this.state.battle.monster?.isBoss) return;
            this.executeAutoBattleTurn();
        }, delayMs);
    }

    executeAutoBattleTurn() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        if (this.state.battle.monster?.isBoss) return;
        const combined = this.getPlayerCombinedStats();
        const hpRatio = combined.hp > 0 ? (this.state.player.hp / combined.hp) : 1;
        const activeSkills = this.getActiveSkills();

        const meditation = activeSkills.find(s => s.id === 'meditation');
        if (hpRatio < 0.4 && meditation && this.state.player.pp >= (meditation.cost || 0)) {
            this.useSkill(meditation);
            return;
        }

        const attackSkills = activeSkills
            .filter(skill => skill.type === 'attack' && this.state.player.pp >= (skill.cost || 0))
            .sort((a, b) => (b.effect?.atkMul || 1) - (a.effect?.atkMul || 1));
        if (attackSkills.length > 0) {
            this.useSkill(attackSkills[0]);
            return;
        }

        this.playerAttack();
    }

    toggleAutoBattle() {
        if (this.state.battle?.monster?.isBoss) {
            this.log("[전투] 보스전에서는 자동전투를 사용할 수 없습니다.", "system");
            this.state.player.autoBattleEnabled = false;
            this.updateAutoBattleButton();
            this.saveGame();
            return;
        }
        this.state.player.autoBattleEnabled = !this.state.player.autoBattleEnabled;
        this.updateAutoBattleButton();
        this.log(`[전투] 자동전투를 ${this.state.player.autoBattleEnabled ? '활성화' : '비활성화'}했습니다.`, "system");
        this.saveGame();
        if (this.state.player.autoBattleEnabled) {
            this.scheduleAutoBattleTurn(120);
        }
    }

    bindAuthEvents() {
        const authOverlay = document.getElementById('auth-overlay');
        const authId = document.getElementById('auth-id');
        const authPw = document.getElementById('auth-pw');
        const authMsg = document.getElementById('auth-msg');

        document.getElementById('btn-login').addEventListener('click', () => {
            const res = window.AuthManager.login(authId.value, authPw.value);
            if (res.success) {
                authOverlay.classList.add('hidden');
                window.location.reload();
            } else {
                authMsg.innerText = res.msg;
                authMsg.style.color = '#ff4b2b';
            }
        });

        document.getElementById('btn-register').addEventListener('click', () => {
            const res = window.AuthManager.register(authId.value, authPw.value);
            authMsg.innerText = res.msg;
            authMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        this.renderTabContent(tabId);
    }

    renderTabContent(tabId) {
        const container = document.getElementById('inventory-list');
        container.innerHTML = '';
        if (tabId === 'equipment') tabId = 'inventory';
        
        if (tabId === 'inventory') {
            if (this.inventory.items.length === 0) {
                container.innerHTML = '<div class="empty-msg">가방이 비어있습니다.</div>';
            } else {
                this.inventory.items.forEach(itemInfo => {
                    const itemData = window.GAME_DATA.items[itemInfo.id];
                    const div = document.createElement('div');
                    div.className = `list-item inventory-item ${itemData.grade.toLowerCase()}`;
                    div.innerHTML = `
                        <div class="item-info">
                            <span class="name">${itemData.name}</span>
                            <span class="count">x${itemInfo.count}</span>
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
                    const summary = this.formatActiveSkillSummary(skillData);
                    const tooltip = this.formatActiveSkillTooltip(skillData);
                    item.innerHTML = `
                        <div class="skill-card-main">
                            <div class="skill-card-title-row">
                                <span class="skill-card-title">${skillData.name}</span>
                                <span class="skill-card-cost">PP ${skillData.cost || 0}</span>
                            </div>
                            <div class="skill-card-meta">${skillData.type === 'buff' ? '강화 스킬' : '공격 스킬'}</div>
                            <div class="skill-card-summary">${summary}</div>
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
                    const summary = this.formatPassiveSkillSummary(node);
                    const tooltip = this.formatPassiveSkillTooltip(node);
                    item.innerHTML = `
                        <div class="skill-card-main">
                            <div class="skill-card-title-row">
                                <span class="skill-card-title">${node.name}</span>
                                <span class="skill-card-cost">${node.kind === 'keystone' ? '핵심' : '패시브'}</span>
                            </div>
                            <div class="skill-card-meta">패시브 노드</div>
                            <div class="skill-card-summary">${summary}</div>
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

    getAvatarImagePath() {
        const g = this.state.player.avatarGender === 'female' ? 'female' : 'male';
        return g === 'female' ? 'assets/Avatar_F.png' : 'assets/Avatar_M.png';
    }

    toggleEquipmentViewMode() {
        this.state.player.equipmentViewMode = this.state.player.equipmentViewMode === 'edit' ? 'avatar' : 'edit';
        this.saveGame();
        this.renderEquipmentPanel();
    }

    syncSettingsAvatarRadios() {
        const male = document.getElementById('settings-avatar-male');
        const female = document.getElementById('settings-avatar-female');
        if (!male || !female) return;
        const g = this.state.player.avatarGender === 'female' ? 'female' : 'male';
        male.checked = g === 'male';
        female.checked = g === 'female';
    }

    getEquipmentSlotConfig() {
        return [
            { slot: 'helmet', label: '머리', x: 50, y: 12, icon: '🪖' },
            { slot: 'armor', label: '갑주', x: 50, y: 34, icon: '🛡️' },
            { slot: 'accessory', label: '허리', x: 50, y: 58, icon: '🎗️' },
            { slot: 'boots', label: '발', x: 50, y: 82, icon: '🥾' },
            { slot: 'weapon', label: '주무기', x: 17, y: 46, icon: '⚔️' },
            { slot: 'offhand', label: '보조', x: 83, y: 46, icon: '🧿' }
        ];
    }

    openEquipmentSlotModal(slot) {
        const slotKo = {
            weapon: '주무기',
            armor: '갑옷',
            helmet: '투구',
            accessory: '벨트/장신구',
            boots: '신발',
            offhand: '보조장비'
        };
        const equippedItemId = this.inventory.equipment[slot];
        const equippedItem = equippedItemId ? window.GAME_DATA.items[equippedItemId] : null;
        const candidates = this.inventory.items
            .filter(itemInfo => window.GAME_DATA.items[itemInfo.id]?.slot === slot)
            .map(itemInfo => ({ info: itemInfo, data: window.GAME_DATA.items[itemInfo.id] }));

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const equippedSection = equippedItem
            ? `
                <div class="equip-choice-current">
                    <div class="name ${equippedItem.grade.toLowerCase()}">${equippedItem.name}</div>
                    <div class="effect">${this.formatShopItemDetails(equippedItem)}</div>
                    <button id="btn-equip-unequip" class="action-btn small secondary">장착 해제</button>
                </div>
            `
            : '<div class="empty-msg" style="padding:14px;">현재 장착된 아이템이 없습니다.</div>';

        const candidateRows = candidates.length > 0
            ? candidates.map(({ info, data }) => `
                <div class="equip-choice-row ${data.grade.toLowerCase()}">
                    <div class="main">
                        <div class="name">${data.name} <span class="count">x${info.count}</span></div>
                        <div class="effect">${this.formatShopItemDetails(data)}</div>
                        <div class="desc">${data.desc || ''}</div>
                    </div>
                    <button class="action-btn small primary" data-equip-item="${info.id}">장착</button>
                </div>
            `).join('')
            : '<div class="empty-msg" style="padding:14px;">이 부위에 장착 가능한 아이템이 가방에 없습니다.</div>';

        content.style.width = '620px';
        content.style.maxWidth = '95vw';
        content.innerHTML = `
            <h3 style="margin-bottom: 8px;">${slotKo[slot] || slot} 장비 관리</h3>
            <section class="equip-choice-section">
                <h4>현재 장착</h4>
                ${equippedSection}
            </section>
            <section class="equip-choice-section">
                <h4>가방에서 선택</h4>
                <div class="equip-choice-list">${candidateRows}</div>
            </section>
            <button id="btn-close-equip-modal" class="action-btn" style="margin-top: 12px; width: 100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        const closeModal = () => {
            content.style.width = '';
            content.style.maxWidth = '';
            modal.classList.add('hidden');
        };
        document.getElementById('btn-close-equip-modal')?.addEventListener('click', closeModal);
        document.getElementById('btn-equip-unequip')?.addEventListener('click', () => {
            this.unequipItem(slot);
            closeModal();
        });
        content.querySelectorAll('[data-equip-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-equip-item');
                if (!itemId) return;
                this.equipItem(itemId);
                closeModal();
            });
        });
    }

    renderEquipmentPanel() {
        const container = document.getElementById('equipment-panel');
        if (!container) return;

        const slots = this.getEquipmentSlotConfig();
        const equippedCount = slots.filter(({ slot }) => !!this.inventory.equipment[slot]).length;
        const isEdit = this.state.player.equipmentViewMode === 'edit';
        const avatarUrl = this.getAvatarImagePath();
        const modeClass = isEdit ? 'mode-edit' : 'mode-avatar';
        const footerHint = isEdit
            ? '부위를 클릭해 장착·해제'
            : '「장비 편집」에서 슬롯을 열 수 있습니다';
        const toggleLabel = isEdit ? '아바타 보기' : '장비 편집';

        container.innerHTML = `
            <div class="equipment-avatar-panel ${modeClass}">
                <div class="equipment-avatar-toolbar">
                    <button type="button" class="action-btn small primary" id="btn-equip-view-toggle">${toggleLabel}</button>
                    <span class="equipment-avatar-hint">${isEdit ? '편집 모드' : '아바타 모드'}</span>
                </div>
                <div class="equipment-avatar-stage" style="--equip-avatar-url: url('${avatarUrl}');">
                    <div class="equipment-avatar-image" aria-hidden="true"></div>
                    <div class="equipment-slot-layer"></div>
                </div>
                <div class="equipment-avatar-footer">
                    <span>장착 수: ${equippedCount} / ${slots.length}</span>
                    <span>${footerHint}</span>
                </div>
            </div>
        `;

        const toggleBtn = container.querySelector('#btn-equip-view-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleEquipmentViewMode());

        if (!isEdit) return;

        const layer = container.querySelector('.equipment-slot-layer');
        if (!layer) return;

        slots.forEach(meta => {
            const itemId = this.inventory.equipment[meta.slot];
            const item = itemId ? window.GAME_DATA.items[itemId] : null;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `equipment-slot-btn ${item ? 'equipped' : 'empty'} ${item ? item.grade.toLowerCase() : ''}`;
            button.style.left = `${meta.x}%`;
            button.style.top = `${meta.y}%`;
            button.innerHTML = `
                <span class="slot-icon">${meta.icon}</span>
                <span class="slot-label">${meta.label}</span>
                <span class="slot-item">${item ? item.name : '비어있음'}</span>
            `;
            button.title = item
                ? `${meta.label}: ${item.name}\n${this.formatShopItemDetails(item)}`
                : `${meta.label}: 비어있음`;
            button.addEventListener('click', () => this.openEquipmentSlotModal(meta.slot));
            layer.appendChild(button);
        });
    }

    equipItem(itemId) {
        if (this.inventory.equip(itemId)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`[장비] ${item.name}을(를) 장착했습니다.`, "system");
            this.updateUI();
            this.renderEquipmentPanel();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
    }

    unequipItem(slot) {
        if (this.inventory.unequip(slot)) {
            this.log(`[장비] 장비를 해제했습니다.`, "system");
            this.updateUI();
            this.renderEquipmentPanel();
            this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
            this.saveGame();
        }
    }

    spendPoint(stat) {
        if (this.state.player.bonusPoints <= 0) return;
        
        this.state.player.bonusPoints--;
        if (stat === 'atk') this.state.player.atk += 2;
        else if (stat === 'def') this.state.player.def += 1;
        else if (stat === 'faith') this.state.player.faith += 1;
        
        this.log(`[성장] ${stat.toUpperCase()} 스탯에 포인트를 투자했습니다.`, "system");
        this.updateUI();
        this.saveGame();
    }

    log(message, type = 'info') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = message;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    updateUI() {
        const p = this.state.player;
        const w = this.state.world;
        const totals = this.getPlayerCombinedStats();
        const totalAtk = totals.atk;
        const totalDef = totals.def;
        const totalFaith = totals.faith;
        const totalMaxHp = totals.hp;
        const totalMaxPp = totals.pp;

        const charNameEl = document.getElementById('char-name');
        if (charNameEl) charNameEl.innerText = p.name;

        document.getElementById('hp-bar').style.width = `${(p.hp / totalMaxHp) * 100}%`;
        document.getElementById('hp-text').innerText = `${Math.round(p.hp)} / ${totalMaxHp}`;
        document.getElementById('pp-bar').style.width = `${(p.pp / totalMaxPp) * 100}%`;
        document.getElementById('pp-text').innerText = `${Math.round(p.pp)} / ${totalMaxPp}`;

        const nextExp = Math.max(1, p.nextExp || 80);
        const expBar = document.getElementById('exp-bar');
        const expText = document.getElementById('exp-text');
        if (expBar && expText) {
            const expPct = Math.min(100, (p.exp / nextExp) * 100);
            expBar.style.width = `${expPct}%`;
            expText.innerText = `${Math.floor(p.exp)} / ${nextExp}`;
        }
        
        document.getElementById('atk-value').innerText = totalAtk;
        document.getElementById('def-value').innerText = totalDef;
        document.getElementById('faith-value').innerText = totalFaith;
        const goldEl = document.getElementById('gold-value');
        if (goldEl) goldEl.innerText = `${p.gold} G`;

        if (this.state.battle) {
            const m = this.state.battle.monster;
            document.getElementById('monster-hp-bar').style.width = `${(m.hp / m.maxHp) * 100}%`;
            document.getElementById('monster-hp-text').innerText = `${Math.round(m.hp)} / ${m.maxHp}`;
            this.renderBattleStatus();
        } else {
            const battleStatusEl = document.getElementById('battle-status');
            if (battleStatusEl) {
                battleStatusEl.classList.add('hidden');
                battleStatusEl.innerHTML = '';
            }
        }

        const questBar = document.getElementById('quest-bar');
        if (questBar) {
            const regionData = window.GAME_DATA.regions[w.currentRegionId];
            questBar.style.width = `${w.explorationProgress}%`;
            document.getElementById('quest-text').innerText = `${Math.round(w.explorationProgress)}%`;
            document.getElementById('quest-title').innerText = `${regionData.name} 탐사`;
            
            const bossBtn = document.getElementById('btn-boss-challenge');
            bossBtn.classList.toggle('hidden', w.bossDefeated);

            const nextRegionBtn = document.getElementById('btn-next-region');
            const hasNextRegion = !!regionData.nextRegionId;
            nextRegionBtn.classList.toggle('hidden', !w.bossDefeated || !hasNextRegion);

            // Update Theme Color
            document.documentElement.style.setProperty('--accent-color', regionData.themeColor);
            const r = parseInt(regionData.themeColor.slice(1, 3), 16);
            const g = parseInt(regionData.themeColor.slice(3, 5), 16);
            const b_val = parseInt(regionData.themeColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b_val}, 0.3)`);
        }

        const saturationFill = document.getElementById('saturation-fill');
        if (saturationFill) saturationFill.style.width = `${w.saturation}%`;
        const saturationVal = document.getElementById('saturation-value');
        if (saturationVal) saturationVal.innerText = `${w.saturation.toFixed(1)}%`;
        document.body.style.setProperty('--world-saturation', w.saturation);

        const pointEl = document.getElementById('bonus-points');
        if (pointEl) pointEl.innerText = p.bonusPoints;
        const skillPointEl = document.getElementById('skill-tree-points');
        if (skillPointEl) skillPointEl.innerText = p.skillTreePoints;

        document.querySelectorAll('.point-btn').forEach(btn => {
            btn.classList.toggle('hidden', p.bonusPoints <= 0);
        });

        this.renderEquipmentPanel();
        this.updateAutoBattleButton();
    }

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
    }

    toggleBattleUI(isBattle) {
        document.getElementById('explore-actions').classList.toggle('hidden', isBattle);
        document.getElementById('battle-actions').classList.toggle('hidden', !isBattle);
        document.getElementById('battle-scene').classList.toggle('hidden', !isBattle);
        this.updateAutoBattleButton();
        if (isBattle) this.scheduleAutoBattleTurn(500);
    }

    // --- FX Functions (Phase 3) ---
    spawnDamagePopup(targetEl, value, isCrit, isMonsterDamage) {
        const rect = targetEl.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = `damage-popup ${isCrit ? 'critical' : ''} ${isMonsterDamage ? 'monster-dmg' : ''}`;
        popup.innerText = (isCrit ? 'CRITICAL! ' : '') + Math.round(value);
        
        // Randomize spawn position slightly
        const randomX = (Math.random() - 0.5) * 40;
        popup.style.left = `${rect.left + rect.width / 2 + randomX}px`;
        popup.style.top = `${rect.top}px`;
        
        document.body.appendChild(popup);
        
        // Auto-remove
        setTimeout(() => popup.remove(), 1000);
    }

    showVerseOverlay(verseText, reference) {
        const overlay = document.getElementById('verse-overlay');
        const content = document.getElementById('verse-content');
        const ref = document.getElementById('verse-ref');
        
        content.innerText = verseText;
        ref.innerText = reference;
        
        overlay.classList.remove('hidden');
        
        // Auto-hide after 5 seconds if not closed
        this.verseTimer = setTimeout(() => this.hideVerseOverlay(), 5000);
    }

    hideVerseOverlay() {
        document.getElementById('verse-overlay').classList.add('hidden');
        if (this.verseTimer) clearTimeout(this.verseTimer);
    }

    async downloadVerseCard() {
        const card = document.getElementById('verse-card');
        const canvas = await html2canvas(card, {
            backgroundColor: '#111',
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `Basileia_Verse_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    // --- Explore Functions ---
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
                        this.state.world.isNavigating = false; // 보스 챌린지 전 상태 해제 필수
                        this.bossChallenge();
                        return;
                    }
                }

                const playerLv = this.state.player.level || 1;
                const roll = Math.random();
                const regionId = this.state.world.currentRegionId || 'pishon';
                const regionData = window.GAME_DATA.regions[regionId];

                // 조우 확률 75%
                if (roll < 0.75) {
                    const normalGrades = ['F', 'E', 'D', 'C'];
                    const monsterList = window.GAME_DATA.monsters.filter(m =>
                        m.regionId === regionId &&
                        normalGrades.includes(m.grade) &&
                        m.minPlayerLv <= playerLv &&
                        m.maxPlayerLv >= playerLv &&
                        (!regionData || m.id !== regionData.bossId)
                    );

                    if (monsterList.length === 0) {
                        const fallback = window.GAME_DATA.monsters.filter(m => m.grade === 'F');
                        const randomMonster = JSON.parse(JSON.stringify(fallback[Math.floor(Math.random() * fallback.length)]));
                        this.startBattle(randomMonster);
                    } else {
                        const randomMonster = JSON.parse(JSON.stringify(monsterList[Math.floor(Math.random() * monsterList.length)]));
                        this.startBattle(randomMonster);
                    }
                } else {
                    this.log("고요한 길을 따라 걷습니다. 아무 일도 일어나지 않았습니다.", "info");
                }
            } catch (err) {
                console.error("Explore Error:", err);
                this.log("탐험 중 알 수 없는 문제가 발생했습니다.", "system");
            } finally {
                this.state.world.isNavigating = false;
                this.updateUI(); // 상태 반영을 위해 UI 업데이트 호출
            }
        }, 800);
    }

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

        this.startBattle(bossMonster);
    }

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
    }

    moveToRegion(regionId) {
        const region = window.GAME_DATA.regions[regionId];
        this.state.world.currentRegionId = regionId;
        this.state.world.explorationProgress = 0;
        this.state.world.bossDefeated = false;

        this.log(`✨ 새로운 지역: [${region.name}]에 도착했습니다.`, "system");
        this.log(`📜 ${region.description}`, "info");

        this.updateUI();
        this.saveGame();
    }

    worship() {
        const totalMaxPp = this.getPlayerCombinedStats().pp;

        if (this.state.player.pp >= totalMaxPp) return this.log("이미 영적으로 충만한 상태입니다.", "system");
        this.log("조용히 눈을 감고 예배를 드립니다...", "info");
        setTimeout(() => {
            this.state.player.pp = totalMaxPp;
            const verses = [
                { text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13" },
                { text: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1" },
                { text: "강하고 담대하라 두려워하지 말며 놀라지 말라", ref: "여호수아 1:9" },
                { text: "너는 내게 부르짖으라 내가 네게 응답하겠고 네가 알지 못하는 크고 은밀한 일을 네게 보이리라", ref: "예레미야 33:3" }
            ];
            const verse = verses[Math.floor(Math.random() * verses.length)];
            this.log(`[묵상] ${verse.text} (${verse.ref})`, "system");
            this.showVerseOverlay(verse.text, verse.ref);
            this.updateUI();
            this.saveGame();
        }, 1000);
    }

    rest() {
        const totalMaxHp = this.getPlayerCombinedStats().hp;

        this.log("잠시 휴식을 취하며 체력을 회복합니다.", "info");
        this.state.player.hp = Math.min(totalMaxHp, this.state.player.hp + 20);
        this.updateUI();
        this.saveGame();
    }

    /** 상점·UI용: 장비 슬롯·스탯을 한 줄 요약 문자열로 */
    formatShopItemDetails(item) {
        if (!item) return '';
        const slotKo = {
            weapon: '무기',
            armor: '갑옷',
            helmet: '투구',
            accessory: '장신구',
            boots: '신발',
            offhand: '보조장비'
        };
        const statKo = {
            atk: '공격',
            def: '방어',
            hp: 'HP',
            pp: 'PP',
            spd: '속도',
            faith: '신앙'
        };
        const parts = [];
        if (item.slot) parts.push(`[${slotKo[item.slot] || item.slot}]`);
        if (item.stats && Object.keys(item.stats).length > 0) {
            const statStr = Object.entries(item.stats)
                .map(([k, v]) => {
                    const label = statKo[k] !== undefined ? statKo[k] : k;
                    const sign = Number(v) > 0 ? '+' : '';
                    return `${label} ${sign}${v}`;
                })
                .join(' · ');
            parts.push(statStr);
        } else if (!item.slot) {
            parts.push('재료 · 전리품');
        }
        return parts.join(' ');
    }

    openShop() {
        if (this.state.battle) return this.log("전투 중에는 상점을 이용할 수 없습니다.", "system");

        const regionId = this.state.world.currentRegionId;
        const goods = window.GAME_DATA.shops?.[regionId] || [];
        if (goods.length === 0) return this.log("이 지역에는 상점이 열려 있지 않습니다.", "system");

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        const playerGold = this.state.player.gold;

        const rows = goods.map(entry => {
            const item = window.GAME_DATA.items[entry.itemId];
            if (!item) return '';
            const disabled = playerGold < entry.price ? 'disabled' : '';
            const detailLine = this.formatShopItemDetails(item);
            return `
                <div class="shop-item-row list-item inventory-item ${item.grade.toLowerCase()}">
                    <div class="shop-item-row__main">
                        <div class="shop-item-row__name">${item.name}</div>
                        <div class="shop-item-row__effect">${detailLine}</div>
                        <div class="shop-item-row__desc">${item.desc || ''}</div>
                        <div class="shop-item-row__price">가격: ${entry.price}G</div>
                    </div>
                    <button type="button" class="action-btn small primary shop-item-row__buy" data-buy-id="${entry.itemId}" data-buy-price="${entry.price}" ${disabled}>구매</button>
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <h3 style="margin-bottom:14px;">${window.GAME_DATA.regions[regionId].name} 상점</h3>
            <p style="margin-bottom:12px; color:#ffd54f;">보유 골드: ${playerGold}G</p>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:330px; overflow-y:auto;">${rows}</div>
            <button id="btn-close-shop" class="action-btn" style="margin-top:12px; width:100%;">닫기</button>
        `;
        modal.classList.remove('hidden');

        content.querySelectorAll('button[data-buy-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.getAttribute('data-buy-id');
                const price = Number(btn.getAttribute('data-buy-price'));
                this.buyShopItem(itemId, price);
                modal.classList.add('hidden');
            });
        });
        document.getElementById('btn-close-shop').addEventListener('click', () => modal.classList.add('hidden'));
    }

    buyShopItem(itemId, price) {
        if (this.state.player.gold < price) {
            this.log("골드가 부족합니다.", "system");
            return;
        }
        this.state.player.gold -= price;
        this.addItem(itemId);
        this.log(`[상점] ${window.GAME_DATA.items[itemId].name}을(를) 구매했습니다.`, "effect");
        this.updateUI();
        this.saveGame();
    }

    syncBackup(isUpload) {
        const settingsMsg = document.getElementById('settings-msg');
        if (isUpload) {
            this.state.inventoryData = this.inventory.serialize();
            const res = window.StorageManager.syncToCloud(this.state);
            settingsMsg.style.color = res.success ? '#4caf50' : '#ff4b2b';
            settingsMsg.innerText = res.msg;
            return;
        }

        const restoreRes = window.StorageManager.restoreFromCloud();
        settingsMsg.style.color = restoreRes.success ? '#4caf50' : '#ff4b2b';
        settingsMsg.innerText = restoreRes.msg;
        if (!restoreRes.success) return;

        this.state = restoreRes.payload;
        this.ensureStateSchema();
        this.inventory = new window.InventoryManager(this.state.inventoryData || {});
        this.toggleBattleUI(false);
        this.updateUI();
        this.renderTabContent(document.querySelector('.tab-btn.active')?.dataset.tab || 'inventory');
        this.log("클라우드 백업에서 데이터를 복원했습니다.", "system");
        this.saveGame();
    }

    // --- Battle Functions ---
    startBattle(monster) {
        monster.maxHp = monster.stats.hp;
        monster.hp = monster.stats.hp;
        if (monster.isBoss && this.state.player.autoBattleEnabled) {
            this.state.player.autoBattleEnabled = false;
            this.log("[전투] 보스전 진입으로 자동전투가 자동 해제되었습니다.", "system");
        }
        this.state.battle = {
            monster,
            isPlayerTurn: true,
            turn: 1,
            effects: {
                player: {
                    defMulTurns: 0,
                    defMulValue: 1,
                    evadeTurns: 0,
                    evadeChance: 0,
                    spdMulTurns: 0,
                    spdMulValue: 1,
                    nextCritChance: 0,
                    fearTurns: 0,
                    spdDebuffTurns: 0,
                    spdDebuffMul: 1
                },
                monster: {
                    spdDebuffTurns: 0,
                    spdDebuffMul: 1
                }
            },
            flags: {
                lowHpCutscenePlayed: false
            }
        };
        
        document.getElementById('monster-name').innerText = monster.name;
        document.getElementById('monster-grade').innerText = monster.grade;
        document.getElementById('monster-level').innerText = `Lv.${monster.level}`;
        
        this.toggleBattleUI(true);
        this.log(`${monster.name}(이)가 나타났습니다!`, "battle");
        this.updateUI();

        const bonus = this.inventory.getBonuses();
        const totalSpd = this.getPlayerSpeed(bonus);
        const monsterSpeed = this.getMonsterSpeed();

        if (monsterSpeed > totalSpd) {
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }

    getBattleEffects() {
        return this.state.battle?.effects || null;
    }

    getPlayerSpeed(bonus = this.inventory.getBonuses()) {
        const passive = this.getPassiveBonuses();
        const base = this.state.player.spd + bonus.spd + passive.spd;
        const effects = this.getBattleEffects();
        if (!effects) return base;
        const playerFx = effects.player;
        return Math.max(1, base * playerFx.spdMulValue * playerFx.spdDebuffMul);
    }

    getMonsterSpeed() {
        if (!this.state.battle) return 0;
        const base = this.state.battle.monster.stats.spd;
        const monsterFx = this.state.battle.effects.monster;
        return Math.max(1, base * monsterFx.spdDebuffMul);
    }

    resolveFearCheck() {
        const effects = this.getBattleEffects();
        if (!effects || effects.player.fearTurns <= 0) return false;

        const blocked = Math.random() < 0.5;
        if (blocked) {
            this.log("공포에 사로잡혀 잠시 움직이지 못했습니다!", "battle");
            effects.player.fearTurns = Math.max(0, effects.player.fearTurns - 1);
        }
        return blocked;
    }

    applySkillEffectToTarget(effect, isMonsterCaster = false) {
        const effects = this.getBattleEffects();
        if (!effects || !effect) return;

        if (isMonsterCaster) {
            if (effect.fear) {
                effects.player.fearTurns = Math.max(effects.player.fearTurns, 1);
                this.log("적의 공포가 당신의 마음을 짓누릅니다.", "battle");
            }
            if (effect.spdDebuff) {
                effects.player.spdDebuffTurns = Math.max(effects.player.spdDebuffTurns, 2);
                effects.player.spdDebuffMul = Math.min(effects.player.spdDebuffMul, effect.spdDebuff);
                this.log("당신의 움직임이 둔화되었습니다.", "battle");
            }
            return;
        }

        if (effect.spdDebuff) {
            effects.monster.spdDebuffTurns = Math.max(effects.monster.spdDebuffTurns, 2);
            effects.monster.spdDebuffMul = Math.min(effects.monster.spdDebuffMul, effect.spdDebuff);
            this.log("적의 속도가 감소했습니다.", "effect");
        }
    }

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
    }

    applyFaithBonusDamage(dmg, monster) {
        const totalFaith = this.getPlayerCombinedStats().faith;
        const faithGap = totalFaith - (monster.requiredFaith || 0);
        if (faithGap <= 0) return dmg;
        return dmg * (1 + Math.min(0.2, faithGap * 0.05));
    }

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

        const totalAtk = combined.atk;
        let dmg = this.calculateDamage(totalAtk, m.stats.def);
        dmg = this.applyFaithBonusDamage(dmg, m);
        dmg *= combined.damageMul;
        if (p.hp <= combined.hp * 0.5) dmg *= combined.lowHpDamageMul;
        if (isCrit) dmg *= 1.5;
        dmg = Math.round(dmg);
        
        m.hp -= dmg;
        if (m.isBoss && !this.state.battle.flags.lowHpCutscenePlayed && m.hp <= m.maxHp * 0.3) {
            this.state.battle.flags.lowHpCutscenePlayed = true;
            this.log(`${m.name}의 형상이 흔들립니다... 마지막 저항이 시작됩니다!`, "effect");
        }
        
        const targetEl = document.querySelector('.monster-card');
        const sceneEl = document.getElementById('battle-scene');
        
        if (isCrit) {
            sceneEl.classList.add('shake-heavy');
            document.getElementById('app').classList.add('crit-flash');
            setTimeout(() => {
                sceneEl.classList.remove('shake-heavy');
                document.getElementById('app').classList.remove('crit-flash');
            }, 500);
        } else {
            sceneEl.classList.add('shake');
            setTimeout(() => sceneEl.classList.remove('shake'), 400);
        }

        this.spawnDamagePopup(targetEl, dmg, isCrit, false);
        this.log(`${m.name}에게 ${dmg}${isCrit ? '!!! (강력한 일격)' : ''}의 피해를 입혔습니다!`, "player");
        this.updateUI();

        if (m.hp <= 0) return this.winBattle();
        
        this.state.battle.isPlayerTurn = false;
        setTimeout(() => this.monsterTurn(), 1000);
    }

    monsterTurn() {
        if (!this.state.battle) return;
        
        const m = this.state.battle.monster;
        const p = this.state.player;
        const combined = this.getPlayerCombinedStats();
        const effects = this.getBattleEffects();
        const playerFx = effects?.player;

        const totalEvadeChance = Math.min(0.5, (playerFx?.evadeChance || 0) + combined.evadeChance);
        if (totalEvadeChance > 0 && Math.random() < totalEvadeChance) {
            this.log("찬양의 은혜로 공격을 회피했습니다!", "effect");
            this.tickBattleEffects(true);
            this.state.battle.turn++;
            this.state.battle.isPlayerTurn = true;
            this.updateUI();
            this.log("▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.", "system");
            this.scheduleAutoBattleTurn();
            return;
        }

        const monsterSkillId = this.chooseMonsterSkill(m);
        const skillData = monsterSkillId ? window.GAME_DATA.skills[monsterSkillId] : null;
        const skillEffect = skillData?.effect || { atkMul: 1 };
        const atkMul = skillEffect.atkMul || 1;

        const totalDef = combined.def * (playerFx?.defMulValue || 1);
        const dmg = Math.round(this.calculateDamage(m.stats.atk * atkMul, totalDef));
        const appliedDmg = Math.round(dmg * combined.damageTakenMul);
        p.hp -= appliedDmg;
        this.applySkillEffectToTarget(skillEffect, true);

        const targetEl = document.querySelector('.character-pane');
        this.spawnDamagePopup(targetEl, appliedDmg, false, true);

        document.getElementById('app').classList.add('hit-flash');
        setTimeout(() => document.getElementById('app').classList.remove('hit-flash'), 200);

        if (skillData) {
            this.log(`${m.name}의 [${skillData.name}]! ${appliedDmg}의 피해를 입었습니다.`, "enemy");
        } else {
            this.log(`${m.name}의 공격! ${appliedDmg}의 피해를 입었습니다.`, "enemy");
        }
        this.updateUI();

        if (p.hp <= 0) return this.loseBattle();

        this.tickBattleEffects(true);
        this.state.battle.turn++;
        this.state.battle.isPlayerTurn = true;
        this.log("▶ 당신의 차례입니다. [공격]이나 [기술]을 선택하세요.", "system");
        this.scheduleAutoBattleTurn();
    }

    /** 가중치 기반으로 스킬 ID 하나 선택 */
    pickWeightedSkillId(skillIds, weights) {
        if (!skillIds || skillIds.length === 0) return null;
        const w = weights && weights.length === skillIds.length ? weights : skillIds.map(() => 1);
        const sum = w.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;
        for (let i = 0; i < skillIds.length; i++) {
            r -= w[i];
            if (r <= 0) return skillIds[i];
        }
        return skillIds[skillIds.length - 1];
    }

    /** monsterSkillTrees 또는 레거시 monster.skills 에서 현재 HP 구간 풀 반환 */
    getMonsterSkillTreePool(monster) {
        const trees = window.GAME_DATA.monsterSkillTrees;
        const tree = monster.skillTreeId && trees ? trees[monster.skillTreeId] : null;
        if (tree) {
            const ratio = monster.maxHp > 0 ? monster.hp / monster.maxHp : 1;
            if (tree.lowHp && ratio < tree.lowHp.threshold) {
                return { skillIds: tree.lowHp.skillIds, weights: tree.lowHp.weights };
            }
            return { skillIds: tree.defaultPool.skillIds, weights: tree.defaultPool.weights };
        }
        if (monster.skills && monster.skills.length) {
            return { skillIds: monster.skills, weights: null };
        }
        return null;
    }

    chooseMonsterSkill(monster) {
        const pool = this.getMonsterSkillTreePool(monster);
        if (!pool || !pool.skillIds.length) return null;
        if (Math.random() > 0.45) return null;
        return this.pickWeightedSkillId(pool.skillIds, pool.weights);
    }

    calculateDamage(atk, def) {
        const base = atk * (100 / (100 + def));
        const random = 0.9 + Math.random() * 0.2;
        return base * random;
    }

    winBattle() {
        const m = this.state.battle.monster;
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
        } else {
            if (!this.state.world.bossDefeated) {
                this.state.world.explorationProgress = Math.min(100, this.state.world.explorationProgress + 2);
            }
            this.state.world.saturation = Math.min(100, this.state.world.saturation + 0.1);
        }
        
        this.state.battle = null;
        setTimeout(() => {
            this.toggleBattleUI(false);
            this.updateUI();
            this.renderTabContent(document.querySelector('.tab-btn.active').dataset.tab);
            this.checkLevelUp();
            this.saveGame();
        }, 1500);
    }

    loseBattle() {
        this.log("무리한 순례로 인해 탈진했습니다...", "battle");
        this.state.player.hp = 10;
        this.state.player.gold = Math.floor(this.state.player.gold * 0.8);
        this.state.battle = null;
        
        setTimeout(() => {
            this.toggleBattleUI(false);
            this.updateUI();
            this.saveGame();
        }, 2000);
    }

    calculateDrops(dropTableId) {
        const table = window.GAME_DATA.dropTables[dropTableId];
        if (!table) return;

        table.forEach(drop => {
            const roll = Math.random();
            if (roll < drop.chance) {
                this.addItem(drop.itemId);
            }
        });
    }

    addItem(itemId) {
        if (this.inventory.addItem(itemId)) {
            const item = window.GAME_DATA.items[itemId];
            this.log(`아이템 획득: [${item.name}]`, "system");
        }
    }

    checkLevelUp() {
        while (this.state.player.exp >= this.state.player.nextExp) {
            this.state.player.exp -= this.state.player.nextExp;
            this.state.player.level++;
            this.state.player.nextExp = Math.floor(this.state.player.nextExp * 1.5);

            // 레벨업 시 기본 스탯 자동 증가
            this.state.player.maxHp  += 12;
            this.state.player.maxPp  += 4;
            this.state.player.atk   += 2;
            this.state.player.def   += 1;
            this.state.player.spd   += 2;

            // 보너스 포인트 지급
            this.state.player.bonusPoints += 2;
            this.state.player.skillTreePoints += 1;

            this.log(`🎉 레벨 업! 이제 Lv.${this.state.player.level} 순례자입니다!`, "system");
            this.log(`[성장] HP+12 PP+4 공격+2 방어+1 속도+2 / 보너스 포인트 +2 / 스킬트리 포인트 +1`, "system");

            // HP/PP 전량 회복
            const totals = this.getPlayerCombinedStats();
            this.state.player.hp = totals.hp;
            this.state.player.pp = totals.pp;

            this.updateUI();
        }
    }

    showSkillMenu() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;

        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        let html = `<h3 style="margin-bottom: 20px;">어떤 능력을 사용하시겠습니까?</h3>`;
        html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
        
        this.getActiveSkills().forEach(skillData => {
            const canUse = this.state.player.pp >= skillData.cost;
            html += `<button class="action-btn ${canUse ? 'primary' : 'secondary'}" data-skill="${skillData.id}" ${canUse ? '' : 'disabled'} style="width: 100%;">
                ${skillData.name} <span style="font-size: 0.8rem; opacity: 0.7;">(PP ${skillData.cost} 소모)</span>
            </button>`;
        });
        
        html += `<button class="action-btn" id="btn-cancel-skill" style="margin-top:10px; width: 100%;">취소</button>`;
        html += `</div>`;
        
        content.innerHTML = html;
        modal.classList.remove('hidden');

        content.querySelectorAll('button[data-skill]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.currentTarget.getAttribute('data-skill');
                const selectedSkill = this.getActiveSkills().find(s => s.id === skillId);
                modal.classList.add('hidden');
                if (selectedSkill) this.useSkill(selectedSkill);
            });
        });
        
        document.getElementById('btn-cancel-skill').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

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
            if (skill.id === 'meditation') {
                p.hp = Math.min(combined.hp, p.hp + 30);
                this.log("HP를 30 회복했습니다.", "info");
            }

            if (effect.defMul) {
                effects.player.defMulValue = Math.max(effects.player.defMulValue, effect.defMul);
                effects.player.defMulTurns = Math.max(effects.player.defMulTurns, 2);
            }
            if (effect.evade) {
                effects.player.evadeChance = Math.max(effects.player.evadeChance, effect.evade);
                effects.player.evadeTurns = Math.max(effects.player.evadeTurns, 2);
            }
            if (effect.spdMul) {
                effects.player.spdMulValue = Math.max(effects.player.spdMulValue, effect.spdMul);
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
            let dmg = this.calculateDamage(totalAtk * atkMul, m.stats.def);
            dmg = this.applyFaithBonusDamage(dmg, m);
            dmg *= combined.damageMul;
            if (p.hp <= combined.hp * 0.5) dmg *= combined.lowHpDamageMul;
            dmg = Math.round(dmg);
            m.hp -= dmg;
            this.applySkillEffectToTarget(effect, false);
            this.spawnDamagePopup(targetEl, dmg, critLike, false);
            this.log(`${m.name}에게 ${Math.floor(dmg)}의 강력한 피해를 입혔습니다!`, "player");
        }

        this.updateUI();
        if (this.state.battle.monster.hp <= 0) return this.winBattle();

        this.state.battle.isPlayerTurn = false;
        setTimeout(() => this.monsterTurn(), 1000);
    }

    tryEscape() {
        if (!this.state.battle || !this.state.battle.isPlayerTurn) return;
        const bonus = this.inventory.getBonuses();
        const playerSpd = this.getPlayerSpeed(bonus);
        const monsterSpd = this.getMonsterSpeed();
        const rawRate = playerSpd / (playerSpd + monsterSpd);
        const escapeRate = Math.max(0.05, Math.min(0.9, rawRate));

        if (Math.random() < escapeRate) {
            this.log("무사히 도망쳤습니다!", "info");
            this.state.battle = null;
            this.toggleBattleUI(false);
            this.updateUI();
            this.saveGame();
        } else {
            this.log(`도망치는 데 실패했습니다! (성공 확률 ${Math.round(escapeRate * 100)}%)`, "battle");
            this.state.battle.isPlayerTurn = false;
            setTimeout(() => this.monsterTurn(), 1000);
        }
    }
}

// Start Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
