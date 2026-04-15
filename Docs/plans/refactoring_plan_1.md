# 리팩터링 구조 계획 1

전투·데이터·엔진 경계를 어떻게 나눌지와, **무엇을 먼저 할지**만 정리한 문서이다. 구현은 별도 작업으로 진행한다.

---

## 1. 목표

- **가독성**: `GameEngine` 안에서 “한 턴이 어떻게 끝나는지”를 추적하기 쉽게 한다.
- **단일 출처**: 보스 스킬·지역 티어처럼 지금 이중으로 존재하는 규칙을 한곳에서 정의하거나, 역할을 명확히 나눈다.
- **회귀 최소화**: 기존 동작(수치·로그·저장)을 바꾸지 않는 선에서 단계적으로 옮긴다.

---

## 2. 구분 원칙 (레이어)

| 레이어 | 역할 | 예시 위치 |
|--------|------|-----------|
| **데이터** | 스킬·몬스터·지역 정의, 검증 가능한 규칙 | `js/data.js`, `data/parts/*`, `scripts/validate-game-data.mjs` |
| **전투 규칙 (순수)** | 입력(스탯·효과)·출력(피해·턴 감소)만, DOM/로그 없음 | 신규: `js/engine/battle-logic.js` 또는 `js/battle/` 모듈 |
| **전투 오케스트레이션** | 턴 순서, 스킬 선택, `state.battle` 갱신 | `js/engine/battle.js` (얇게 유지) |
| **표현(UI)** | 로그, 팝업, `renderBattleStatus` 등 | `battle.js` + 필요 시 `game.js`의 일반 UI |
| **탐험/월드** | 필드 몹 선택, 지역 스케일 | `js/engine/explore.js` |

**원칙**: “숫자와 규칙”은 가능하면 **DOM 없는 함수**로 두고, `GameEngine` 메서드는 그 함수를 호출해 상태를 갱신한다.

---

## 3. 무엇을 어떻게 나눌지 (구체)

### 3.1 전투 흐름

- **현재**: `monsterTurn()` 안에 회피 / 보스 버프 / 일반 공격 후 **같은 턴 종료 코드**가 반복된다.
- **구분**:
  - **A. 턴 종료**: “몬스터 행동이 끝난 뒤 플레이어에게 넘긴다” → `finishMonsterPhaseAndStartPlayer()` 같은 **한 메서드**로 통합.
  - **B. 플레이어 물리 피해**: 평타와 공격 스킬의 공통 계산 → `computePlayerPhysicalDamageToMonster(...)` 같은 **순수 함수** (또는 엔진 메서드이지만 UI 호출 없음).

### 3.2 보스 스킬 데이터

- **현재**: `bossActiveSkillIds`가 있으면 `monsterSkillTrees`의 보스 트리는 **런타임에서 선택되지 않음** (이중 정의).
- **구분 (택일)**:
  - **방안 1 (권장, 단순)**: 런타임 소스는 **`bossActive*`만** 인정하고, 트리는 삭제하거나 “에디터/문서용”으로만 남기고 `game` 로드 경로에서 제외하지 않음(용량 작으면 유지 가능).
  - **방안 2**: `monsterSkillTrees`를 단일 소스로 두고, 빌드/내보내기 시 `bossActiveSkillIds`를 **생성**한다.
- **결정 전**: 팀에서 “데이터 편집 워크플로”가 어느 쪽에 맞는지 한 번만 정하면 된다.

### 3.3 지역 티어

- **현재**: 상태이상용 `getRegionAilmentTier`(0~6)와 `enemyPowerTier`(1~7)가 **다른 척도**다.
- **구분**:
  - **문서화**: 두 값의 의미를 주석·이 문서에 고정한다.
  - **선택적 통합**: `regions`에 `enemyPowerTier`만 두고, ailment용 인덱스는 `enemyPowerTier - 1`로 파생하는 등 **한 필드 기준**으로 맞출지 검토한다. (밸런스 재조정이 필요할 수 있음)

**고정 (구현 기준)** — `data/parts/regions.json`의 `enemyPowerTier`만 데이터에 둔다.

| 필드 / 함수 | 의미 | 범위 |
|-------------|------|------|
| `regions[id].enemyPowerTier` | 지역 난이도·보스 스킬 슬롯(`bossSkillSlotCountFromEnemyPowerTier`)·기타 규칙의 기준 | 1~7 |
| `getRegionAilmentTier(regionId)` | 보스 상태이상 보정 등에 쓰는 **파생** 인덱스 | 0~6, `clamp(tier - 1, 0, 6)` (`js/engine/battle.js`) |

### 3.4 검증 스크립트와 게임 규칙

- **현재**: 보스 슬롯 수 공식이 `validate-game-data.mjs`에만 문자열로 존재한다.
- **구분**: 공식을 `js/data/constants.js` 또는 `GAME_DATA.meta`에 두고, 검증 스크립트는 **같은 값을 읽거나** 복제 시 주석으로 “constants와 동기화”를 명시한다.

### 3.5 엔진 코어 (`game.js`)

- **현재**: 파일이 매우 크다.
- **구분**: **당장 전부 쪼개지 않는다.** 우선 전투·탐험 모듈이 안정된 뒤, `ensureStateSchema`, 탭 렌더, 인벤토리 등 **도메인별로 파일 분리**를 후순위로 둔다.

---

## 4. 단계별 실행 순서 (권장)

| 단계 | 내용 | 리스크 | 비고 |
|------|------|--------|------|
| **1** | `monsterTurn` 턴 종료 블록 통합 | 낮음 | 동작 동일 여부만 수동/간단 테스트 |
| **2** | 플레이어 물리 피해 계산 공통화 (`playerAttack` / `useSkill` 공격) | 중간 | 치명·신앙·이중타 순서 유지 주의 |
| **3** | 저HP 스킬 풀 선택 로직 소량 유틸화 (`getMonsterSkillTreePool`) | 낮음 | |
| **4** | 보스 슬롯 공식 상수화 + 검증 연동 | 낮음 | `validate` 재실행 |
| **5** | 보스 스킬 단일 소스 (3.2 방안 1 또는 2) | 중간~높음 | 데이터 마이그레이션 필요 시 별도 커밋 |
| **6** | 지역 티어 정리(3.3 선택) | 중간 | 밸런스 영향 |
| **7** | `game.js` 분할 | 낮음~장기 | `ensureStateSchema`·아이템 스탯·인벤/아바타/보스던전 UI·상점·백업·캐릭터 툴팁 등 → `js/engine/*.js` (코어 `game.js`는 초기화·`updateUI`·드랍/레벨업 등) |

---

## 5. 하지 않을 것 (이번 계획 범위 밖)

- 프레임워크 도입(React 등), 빌드 체인 대개편.
- 전투 수식 자체 변경(난이도 조정은 “리팩터링”과 별도).
- 저장 포맷 변경 없이 `state.battle` 구조만 바꾸는 대규모 변경(필요 시 별도 설계).

---

## 6. 완료 기준

- 각 단계마다: `node scripts/validate-game-data.mjs` 및 `node scripts/verify-data-roundtrip.mjs` 통과.
- 전투: 평타·스킬·보스 버프·도망·자동전투 한 사이클 수동 확인(또는 기존 테스트가 있으면 그에 따름).

---

## 변경 이력

- **1판**: 초안 작성 (리팩터링 구분·단계만 정의).
- **2판 (구현 완료)**:
  - **1~4**: `finishMonsterTurnHandoff`, `BattleLogic`(`js/engine/battle-logic.js`), `applyPlayerPhysicalLayersAfterFaith`, `pickSkillPoolByHpRatio`, `bossSkillSlotCountFromEnemyPowerTier` in `js/data/constants.js` + `validate-game-data.mjs` 연동.
  - **5**: 보스 몬스터에서 `skillTreeId` 제거, 보스 전용 `monsterSkillTrees` 항목 삭제. `st_stone_seraph_boss`는 필드 몬스터(`eden_judicator` 등)용으로 유지.
  - **6**: `getRegionAilmentTier`를 `regions.enemyPowerTier - 1`(클램프 0~6)로 단일 파생.
  - **7**: `game.js` 슬림화 — `item-stats`, `ui-character-tooltip`, `ui-tabs-inventory`, `ui-avatar-equipment`, `ui-boss-dungeon`, `ui-shop`, `ui-backup`, `state-schema` 등으로 분리. `applyRelicPassivesToBonuses`는 `skilltree.js`로 이동. 로드 순서는 `index.html` 주석 없이 파일명 순·의존성: `item-stats` → `skilltree` → UI 모듈들 → `state-schema` → `explore`…
  - **부가**: `GAME_DATA.meta`는 JSON 직렬화 가능 필드만 복사해 `data/parts/meta.json` 라운드트립과 일치.
- **3판**: §3.3 티어 고정 표. **4판**: `game.js`에서 아이템·인벤/아바타·보스던전·상점·백업·툴팁 등을 `js/engine/*.js`로 추가 분리(§4·아래 표 반영).
- **5판 (시설 통합 개선)**:
  - **시설 허브 고도화**: `js/engine/ui-facility-hub.js`를 탭형 허브로 개선하여 상점/성물 소환/대장간을 한 모달에서 전환·진입.
  - **성물 탭 역할 정리**: `js/engine/ui-tabs-inventory.js`에서 `이 지역 성물 상인` UI 및 `buyRelic` 구매 흐름 제거, 장착/정보 확인 전용으로 고정.
  - **데이터 단일화**: `js/data.js`의 `relicShops`를 빈 객체로 정리하고, `data/parts/relicShops.json`도 `{}`로 동기화하여 라운드트립 시 재생성 방지.
  - **연계 문서**: 성물 소환 밸런스 기준은 `Docs/plans/relic_gacha_balance_1.md`를 기준으로 유지.

---

## 구현 후 파일 안내

| 파일 | 역할 |
|------|------|
| `js/engine/battle-logic.js` | DOM 없는 전투 수치 (`calculateDamage`, 풀 선택, 플레이어 물리 배율) |
| `js/data/constants.js` | `bossSkillSlotCountFromEnemyPowerTier` (검증·데이터 규칙 단일 공식) |
| `js/engine/battle.js` | `finishMonsterTurnHandoff`, 상기 로직 호출 |
| `js/engine/state-schema.js` | `ensureStateSchema` — 세이브 호환·player/world 기본값 |
| `js/engine/item-stats.js` | 강화·`getItemComputedBonuses`·`formatShopItemDetails` 등 |
| `js/engine/ui-character-tooltip.js` | 캐릭터 최종 스탯 툴팁 |
| `js/engine/ui-tabs-inventory.js` | 인벤/스킬/성물 탭 |
| `js/engine/ui-avatar-equipment.js` | 아바타·장비 패널 |
| `js/engine/ui-boss-dungeon.js` | 보스 던전 UI·지역 순서 |
| `js/engine/ui-shop.js` | 상점 |
| `js/engine/ui-facility-hub.js` | 시설 허브(상점/성물 소환/대장간 통합 진입) |
| `js/engine/ui-backup.js` | 클라우드/파일 백업 |
