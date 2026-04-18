# Plan: 전투 씬 좌·우 듀얼 레이아웃 (1)

## 목표
- 중앙 전투 영역을 **플레이어(좌)** / **몬스터(우)** 로 분할.
- 좌측: 아바타(`getAvatarImagePath`), 이름·레벨, HP/PP 바, 전투 효과 요약 칩.
- 우측: 기존 몬스터 카드(이미지·등급·이름·HP·적 상태).

## 반영
- `index.html`: `#battle-scene` 내부 `battle-duel` 그리드 + `#battle-player-*` 요소.
- `style.css`: `.battle-duel`, `.battle-actor`, 플레이어 아바타·스탯 행, `monster-card--duel` 폭 조정.
- `game.js` `updateUI`: 전투 씬 플레이어 HP/PP/이름/레벨/아바타 배경 동기화.
- `js/engine/battle.js`: `renderBattlePlayerStatus` 추가, `renderCharacterBattleEffectsStrip` 종료 시 호출, 몬스터 피해 팝업 타겟을 `.battle-image-wrap--player` 우선.

## 보완 (3): 좌·우 동일 템플릿
- 순서: **이름(행)** → **초상** → **HP(HP 라벨·수치·바, 플레이어는 PP 추가)** → **상태 칩**.
- 클래스 공유: `battle-actor-header`, `battle-image-wrap`, `battle-actor-stats` + `battle-stat-row`.

## 보완 (4): 동일 슬롯·HP 바 높이
- `.battle-duel` CSS 변수: 초상 크기·바 `max-width` 공통.
- 초상: 외곽 `battle-image-wrap` 고정 크기 + `overflow:hidden`; 플레이어 아바타·몬스터 placeholder는 슬롯 안 `cover`/`100%` 채움.

## 보완 (5): 큰 초상·스탯 여백 정리
- 초상 `168×210px`, 바 최대 `200px`.
- 스탯 블록은 **내용 높이만** 사용(`min-height` 제거). 구분선(`.battle-duel-divider`)도 **강제 `min-height` 제거**해 그리드 행이 실제 콘텐츠 높이에만 맞도록 함(아래 빈 여백 방지).
- 적 측에 `battle-stat-row--duel-skip` 숨김 PP 행을 두어 플레이어와 **동일 DOM 포맷·줄 수**로 HP/PP 세로 정렬 유지.

## 다음 (별도 작업)
- 자동전투용 스킬 `ai*` 메타 및 선택 로직 강화.

---

# 보완 (2): 자동전투 스킬 `ai` 메타

## 스키마 (`GAME_DATA.skills[id].ai`)
- `role`: `cleanse` | `heal` | `defense` | `buff` | `attack` 등 — 점수 가중 규칙 분기.
- `weight`: 기본 선호 배율.
- `cooldownTurns`: 자동 사용 최소 턴 간격.
- `minHpRatio` / `maxHpRatio`: 플레이어 HP 비율 허용 구간.
- `minEnemyHpRatio` / `maxEnemyHpRatio`: 적 HP 비율 허용 구간.
- `burstBonus` / `setupBonus`: 공격 스킬만 — 적 체력 낮을 때·넉넉할 때 가산.
- `repeatPenalty`: 직전 자동 스킬과 동일 id일 때 점수 감쇠.

미설정 스킬은 `getDefaultSkillAi`로 유형별 기본값 후 `ai`로 덮어씀.

## 코드
- `js/engine/explore.js`: `getDefaultSkillAi`, `resolveSkillAi`, `pickAutoBattleSkillAction`, `executeAutoBattleTurn` 교체.
- `js/engine/battle.js`: `startBattle` 시 `battle.autoState = { skillLastTurn, lastAutoSkillId }` 초기화.
- `js/data.js` (+ `data/parts/skills.json` 동기화): 플레이어 액티브 위주 `ai` 블록 추가.

## 선택 알고리즘 요약
1. PP·쿨다운·HP(자신/적) 구간으로 후보 필터.
2. 역할별 점수 + 공격은 atkMul·스케일링·burst/setup.
3. 직전 스킬과 같으면 `repeatPenalty` 적용.
4. 상위 4개 중 **점수 가중 랜덤**으로 1개 선택; 없으면 평타.
