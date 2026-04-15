# 구현 계획 14 — 게임 데이터 구조화 및 도메인 간 연계

## 1. 목표

- **지역, 몬스터, 드랍, 스킬(플레이어/몬스터), 아이템, 장비, 상점·제련·유물** 등이 각각 **역할이 분명한 데이터 단위**로 정리된다.
- 각 단위는 **안정적인 ID**로 서로 참조하고, **런타임/개발 시 검증**으로 깨진 참조·역전(예: 필드 등급 > 보스 등급)을 빨리 잡을 수 있다.
- **한 번에 전부 갈아엎지 않고**, 현재 `js/data.js` + `GAME_DATA` 로딩 방식을 유지하면서 **점진적 이행**이 가능하다.

---

## 2. 현재 상태 요약 (기준: `js/data.js`)

| 도메인 | 형태 | 타 도메인과의 연결 예 |
|--------|------|------------------------|
| `regions` | 객체 맵 | `bossId` → `monsters.id`, `nextRegionId` 체인 |
| `monsters` | 배열 | `regionId`, `dropTableId`, `skillTreeId`, `grade`, 레벨 조건 |
| `dropTables` / `bossExclusiveDropTables` | id → 항목 배열 | `itemId` → `items` |
| `items` | 단일 맵 (재료·장비 혼재) | `slot`, `stats` 선택 |
| `skills` | 객체 맵 | 플레이어 스킬, `effect`, `scaling` |
| `skillTrees` | 클래스별 노드·엣지 | `activeSkillId` → `skills` |
| `monsterSkillTrees` | id → 풀/가중치 | 몬스터 `skillTreeId` |
| `shops`, `smithing`, `relics`, `relicShops` 등 | 각기 다른 형태 | 대부분 `itemId` 문자열 |

**이슈**: 한 파일에 모든 것이 있어 편집은 쉽지만, **연결 규칙이 코드/머릿속에만** 있고 **스키마·검증이 없음**.

---

## 3. 설계 원칙 (공통)

1. **ID는 전역 유일**: `region.pishon`, `monster.gray_slime`처럼 접두를 두거나, 기존 `snake_case` id를 유지하되 **종류별 네임스페이스 문서화**.
2. **참조는 ID만**: 드랍·상점·레시피는 **항상** `itemId` / `monsterId` / `skillId` 등으로만 가리키고, 표시명은 참조 해석.
3. **도메인별 `kind` 또는 `category`**: `items`는 최소한 `material` | `equipment` | `consumable`(미래) 등으로 구분해 장비 슬롯과 섞이지 않게 함.
4. **지역 메타에 “의도” 명시**: 예) 필드 몬스터 허용 등급 범위, 권장 플레이어 레벨 — 나중에 검증 규칙과 자동 문서화에 사용.
5. **로더 단일 진입**: 최종적으로 `GAME_DATA` 하나로 합치되더라도, **소스는 파일/객체 분리** → `merge` 또는 `build` 한 스텝에서 합성.
6. **검증은 개발 시**: `node scripts/validate-game-data.mjs`로 CI/커밋 전 실행 (선택).

---

## 4. 단계별 계획 (순차 진행)

### Phase 0 — 의존성 그래프·용어 정리

- **산출물**: `Docs/specs/data_model_14.md` (또는 본 문서 부록)에 다음 다이어그램/표:
  - `regions` → `monsters` (regionId, bossId)
  - `monsters` → `dropTables` / `bossExclusiveDropTables`
  - `monsters` → `monsterSkillTrees`
  - `items` ← `dropTables`, `shops`, `smithing`
  - `skills` ← `skillTrees` (노드 `activeSkillId`)
- **목적**: 이후 단계에서 “무엇부터 옮길지” 순서 고정.

---

### Phase 1 — 열거형·공통 상수 정리

- **내용**:
  - 몬스터 **등급** `F`~`S` 순서 상수 (가중치·필터·검증 공용).
  - 아이템 **등급** `Normal`~`Epic` (장비·재료 공통 표기).
  - **장비 슬롯** `weapon`, `armor`, … (이미 사용 중인 값과 동일하게 고정 문서화).
  - `skill` 타입: `attack` | `buff` 등 플레이어 스킬 분류.
- **구현**: `js/data/constants.js` 또는 `GAME_DATA.meta`에 작은 객체로 두고, 검증 스크립트와 게임 코드가 동일 참조 (또는 검증만 상수 복제).
- **완료 기준**: 새 데이터 추가 시 “허용 값 목록”이 한곳에 정의됨.

---

### Phase 2 — 아이템·장비 스키마 분리 (논리적)

- **내용**:
  - `items`를 논리적으로 **`items.materials`**, **`items.equipment`** (또는 `itemKind` 필드 필수화)로 구분.
  - 장비는 공통 필드: `slot`, `stats`, `grade`; 재료는 `slot` 없음.
- **이행**: 기존 키·구조 유지 + 각 항목에 `kind: 'material' | 'equipment'` 추가 → 인벤/장착 코드에서 `kind`로 분기 (기존 동작 유지).
- **완료 기준**: `dropTables`가 실수로 잘못된 슬롯을 넣기 어렵도록 검증 규칙 추가 가능.

---

### Phase 3 — 지역 스키마 강화

- **추가 필드 예시** (기존 필드 유지):
  - `fieldGradeMin` / `fieldGradeMax` (필드 랜덤 풀의 **의도된** 등급 범위)
  - `recommendedPlayerLv: { min, max }` (UI·밸런스용, 선택)
  - `enemyPowerTier` (숫자 1~5 등, 필드 스케일과 연동 시 선택)
- **이행**: `regions` 객체에 필드 추가 → `explore.js` 검증은 **선택적**(기존 로직 유지, 경고만).
- **완료 기준**: 지역 한 줄만 봐도 “이 지역에서 어떤 티어가 나와야 하는지” 데이터에 기록됨.

---

### Phase 4 — 몬스터 정의 표준화

- **필드 정리**: `id`, `regionId`, `grade`, `level`, `minPlayerLv`, `maxPlayerLv`, `stats`, `reward`, `dropTableId`, `skillTreeId`, `isBoss`, `tags`(선택).
- **선택**: `monsterTemplateId` + `regionOverrides` 패턴은 **몬스터 수가 늘어난 뒤** 도입 (과조기 추상화 방지).
- **검증**: 각 몬스터의 `regionId`가 `regions`에 존재; `dropTableId`가 `dropTables` 또는 보스 전용 규칙과 일치; 필드 몬스터는 `isBoss !== true`일 때 `bossId`와 동일하지 않음.

---

### Phase 5 — 드랍 테이블 스키마 정리

- **통일 형식**: 모든 드랍 엔트리는 `{ itemId, chance, minQty?, maxQty? }` (이미 부분적으로 사용 중).
- **분리**: `dropTables`(일반) vs `bossExclusiveDropTables`(보스 전용) 유지하되, **키 규칙** 문서화 (`drop_*` vs 보스 id).
- **검증**: `itemId`가 `items`에 존재; `chance` 범위 0~1; 보스 전용 아이템이 일반 드랍에 없는지(정책에 따라).

---

### Phase 6 — 스킬 (플레이어) 구조화

- **내용**:
  - `skills`에 `id`, `name`, `type`, `cost`, `effect`, `scaling`, `desc`, (선택) `tags`.
  - 스킬트리 노드 `grants.activeSkillId`는 **반드시** `skills`에 존재.
- **검증**: `skillTrees` 전체 순회 후 `activeSkillId` 참조 검사.

---

### Phase 7 — 몬스터 스킬 풀 (`monsterSkillTrees`)

- **내용**: 각 트리 id별로 `defaultPool`, `lowHp`(선택)의 `skillIds`가 **실제 몬스터 스킬** 또는 `skills`의 boss 전용과 연결되는지 명확히.
- **검증**: 풀에 있는 `skillId`가 `GAME_DATA.skills`에 존재.

---

### Phase 8 — 상점·제련·유물·아바타 등 부가 시스템

- **순서**: `shops` → `smithing` → `relics` / `relicShops` → `avatars`
- **각각**: 모든 `itemId`·`cost` 항목이 `items`와 연결되는지, `regionId`가 있으면 `regions`와 일치하는지.
- **완료 기준**: 부가 데이터가 **아이템 단일 소스**를 침범하지 않음.

---

### Phase 9 — 파일 분리 및 빌드 (선택·후반)

- **목표**: `data/regions.json`, `data/monsters.json`, … 또는 `data/*.js` export → `scripts/build-data.mjs`로 `data.bundle.js` 생성, 또는 `game.js`에서 여러 스크립트 순차 로드.
- **주의**: 정적 호스팅·캐시 무효화·`file://` 테스트 환경 고려.
- **완료 기준**: 편집 충돌 감소, PR 단위로 도메인별 diff 분리 가능.

---

### Phase 10 — 검증 도구 + (선택) TypeScript 타입

- **구현**: `scripts/validate-game-data.mjs` — Node로 `GAME_DATA` 로드 또는 JSON 스키마 검사.
- **규칙 예**: 순환 `nextRegionId` 없음; 보스는 `regions[region].bossId`와 쌍방 일치; 드랍·상점 itemId 존재.
- **선택**: `types/game-data.d.ts`로 편집기 자동완성.

---

## 5. 권장 진행 순서 (한 줄 요약)

`Phase 0 → 1 → 2 → 5(드랍 검증) → 4(몬스터) → 3(지역 메타) → 6 → 7 → 8 → 9 → 10`

※ 실제로는 **Phase 2 + 5 검증**을 먼저 하면 데이터 깨짐을 가장 빨리 줄일 수 있음.

---

## 6. 리스크·완화

| 리스크 | 완화 |
|--------|------|
| 대규모 한 번에 리팩터로 버그 | 단계마다 동작 동일 스모크 테스트 (탐험·전투·드랍·장착) |
| 파일 분리로 로딩 순서 버그 | 단일 `GAME_DATA` 병합 지점 유지, 단계 9는 후순위 |
| 과도한 추상화 | 템플릿/상속은 몬스터·아이템 수가 늘어난 뒤 검토 |

---

## 7. 다음 액션 (체크리스트)

- [x] Phase 0: `Docs/specs/data_model_14.md`에 의존성 다이어그램·용어표 작성
- [x] Phase 1: `js/data/constants.js` + `GAME_DATA.meta`에 열거형 정리
- [x] Phase 2: `items`에 `kind: material | equipment` 도입, `inventory.equip`에서 `kind` 확인
- [x] Phase 3: `regions`에 `fieldGradeMin/Max`, `recommendedPlayerLv`, `enemyPowerTier` 추가
- [x] Phase 5: `scripts/validate-game-data.mjs` (드랍·상점·제련·스킬트리·몬스터 스킬 풀·지역-등급 경고 등)
- [x] Phase 4: 몬스터 `tags: ["field"|"boss", regionId]` 표준화 및 검증
- [x] Phase 6~8: 스킬 `tags`, `bossDungeon.entries`, `avatars`, `monsterSkillTrees` 가중치 길이, 유물 등급 경고 등 검증 확장
- [x] Phase 9: `scripts/export-game-data-parts.mjs` → `data/parts/*.json`, `scripts/build-game-data-from-parts.mjs`, `scripts/verify-data-roundtrip.mjs`
- [x] Phase 10: `types/game-data.d.ts` (편집기용 타입), `nextRegionId` 순환 검사 보강

---

## 8. 관련 문서

- 기존 기능/구현 흐름: `Docs/specs/features.md`, `Docs/implementation/implementation_plan_*.md`
- 본 계획은 **데이터 레이어 전반**을 다루며, 이후 세부 작업은 별도 Task/Plan으로 쪼개도 됨.
