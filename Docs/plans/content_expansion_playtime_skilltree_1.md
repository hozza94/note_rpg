# 콘텐츠 확장: 맵·몬스터·스킬트리(레벨/SP 상향) 실행 기록 (1)

## 목표

- 플레이타임 연장을 위해 지역·필드몹 보강 및 에필로그 지역 추가.
- 최대 레벨 60과 스킬트리 포인트 예산 정합 (`(60-1) × 3 = 177` 유료 노드).
- `game.js`와 `state-schema.js`의 SP·레벨캡 수치를 `GAME_DATA_META`와 동기화.

## 수치·정책

| 항목 | 값 |
|------|-----|
| `playerLevelCap` | 60 (`js/data/constants.js` → `window.GAME_DATA_META`) |
| `skillTreePointsPerLevelUp` | 3 |
| 순례자 트리 총 노드 | 178 (시작 1 + 유료 177) |
| 신규 지역 | `twilight_reach` (황혼의 어귀), `fallen_paradise.nextRegionId` 연결 |

## 데이터 변경 요약

1. **상수**: `GAME_DATA_META.playerLevelCap`, `skillTreePointsPerLevelUp`.
2. **레벨업**: `game.js` `checkLevelUp` — 캡 도달 시 레벨업 중단, SP는 메타값 사용.
3. **세이브 보정**: `state-schema.js` — `effectiveLevel = min(level, cap)`으로 목표 누적 SP 계산.
4. **스킬트리**: `pilgrim_ascent_m_*`, `t_*`, `r_*` 각 10노드(총 30), `martyr_keystone`·`tithe_ep_4`·`active_radiant_volley`에서 분기. 클러스터 `ascent_martyr`, `ascent_tithe`, `ascent_radiant`.
5. **맵**: `twilight_reach`, 필드 2·보스 `twilight_arbiter`, `drop_twilight_*`, `bossExclusiveDropTables.twilight_arbiter`, `shops.twilight_reach`, `bossDungeon.entries`.
6. **필드몹 밀도**: 기혼·히데겔·유브라데·에덴·변방에 일반몹 2종씩 추가.
7. **탐험 스케일**: `explore.js` `getRegionFieldStatScale`에 후반 지역·`twilight_reach` 배율 추가.
8. **장비 등급 출처**: `item-stats.js` `twilight_arbiter: 11`.
9. **최초 클리어 보상**: `battle.js` `twilight_arbiter` → `chaos_scripture`.

## 검증

- `node scripts/validate-game-data.mjs` 통과.
- `npm run skilltree:audit` 실행 (신규 연장 노드는 L이 높아 저효율 경고가 뜰 수 있음 — 의도된 말단 연장).

## 관련 파일

- `js/data/constants.js`, `js/data.js`, `game.js`, `js/engine/state-schema.js`, `js/engine/explore.js`, `js/engine/item-stats.js`, `js/engine/battle.js`, `index.html` (캐시 버전)
