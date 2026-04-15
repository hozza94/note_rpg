# 성물 가챠 밸런스 기준표 1

본 문서는 성물 가챠 관련 재화(달란트) 수급·소모의 1차 기준을 기록한다.

## 1) 소환 비용 기준

- 일반 소환: **1회 1000G**
- 고급 소환: **1회 10 달란트**, **10회 100 달란트**

데이터 위치:
- `js/data.js` → `GAME_DATA.relicGacha.normal.goldCost`
- `js/data.js` → `GAME_DATA.relicGacha.premium.tokenCost`
- `js/data.js` → `GAME_DATA.relicGacha.premium.tenPullTokenCost`

## 2) 일반 몬스터 달란트 수급

- 드랍 확률: 티어별 극악 확률 (`chanceByTier`)
- 드랍량 범위: **0.01 ~ 0.1 달란트**

데이터 위치:
- `js/data.js` → `GAME_DATA.relicGacha.talentDrop.field`

| enemyPowerTier | 드랍 확률 |
|---|---:|
| 1 | 0.0030 |
| 2 | 0.0045 |
| 3 | 0.0060 |
| 4 | 0.0075 |
| 5 | 0.0090 |
| 6 | 0.0105 |
| 7 | 0.0120 |

## 3) 보스 몬스터 달란트 수급

- 기준: 최상위 보스(티어 7) = **1.0**
- 티어 1~7을 0.1~1.0 구간으로 배치

데이터 위치:
- `js/data.js` → `GAME_DATA.relicGacha.talentDrop.boss.amountByTier`

| enemyPowerTier | 지급 달란트 |
|---|---:|
| 1 | 0.10 |
| 2 | 0.25 |
| 3 | 0.40 |
| 4 | 0.55 |
| 5 | 0.70 |
| 6 | 0.85 |
| 7 | 1.00 |

## 4) 튜닝 메모

- 일반 몬스터 체감이 너무 낮으면 `chanceByTier`를 소폭(예: +0.001) 상향한다.
- 고급 소환 접근성이 낮으면 `tokenCost`를 10 → 8로 조정하는 방안을 우선 검토한다.
- 보스 파밍 효율이 과하면 `amountByTier`의 상단(5~7) 구간만 부분 하향한다.

## 5) 획득 경로 정책 (시설 통합)

- 지역별 성물 상인 구매 경로는 제거하고, 성물 획득은 **시설 > 성물 소환** 경로로 일원화한다.
- 성물 탭은 장착/정보 확인 전용으로 유지하며, 소환 기능은 제공하지 않는다.

