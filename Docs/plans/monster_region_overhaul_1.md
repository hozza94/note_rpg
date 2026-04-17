# 로어북 기반 상위 지역/몬스터 확장 계획서 (1)

## 목표
- `Lore Book/Lore Book _ Monster.md`의 상위 악마 계열을 실제 플레이 구간으로 승격한다.
- 후반 성장 동선을 `void_remnant` 이후 3개 지역으로 확장한다.
- 지역 확장과 함께 필드 드랍/보스 전용 드랍/장비 보상을 동시 설계해 파밍 동기를 만든다.

## 확장 범위
- 지역 3개 추가
  - `infernal_pandemonium` (판데모니움 화원)
  - `astral_abyss` (성좌 심연)
  - `fallen_paradise` (타락한 낙원)
- 몬스터/보스 추가
  - 필드: `hellhound`, `imp`, `asmodeus`, `incubus`, `baphomet`, `baal`, `fallen_harbinger`, `eden_corruptor`, `seraph_ruin`
  - 보스: `beelzebub`, `astaroth`, `lucifer`
- 드랍 체계 추가
  - 일반 드랍 테이블 8종
  - 보스 전용 드랍 3종
- 아이템 추가
  - 재료 6종
  - 장비 5종

## 데이터 반영 포인트
- `regions`
  - `void_remnant.nextRegionId`를 `infernal_pandemonium`으로 변경
  - 신규 3지역을 레벨/등급/권장레벨/파워티어와 함께 추가
- `bossDungeon.entries`
  - 신규 보스 3종 재도전 엔트리 추가
- `monsters`
  - 신규 지역의 필드/보스 엔트리 추가
  - 기존 보스 액티브/패시브 스킬 조합을 재사용해 안정성 확보
- `items`
  - 신규 재료/장비 정의 추가
- `dropTables`, `bossExclusiveDropTables`
  - 지역별 필드 파밍/엘리트 파밍/최종 보상 구조를 분리해 설계

## 밸런스 가이드
- 레벨 구간
  - 판데모니움: 54~64
  - 성좌 심연: 62~74
  - 타락한 낙원: 72~90
- 보상 기조
  - 필드: 재료 중심 + 장비 저확률
  - 엘리트: 신규 장비 확률 소폭 상승
  - 보스: 보스 전용 재료 확정 + 상위 장비 희귀 확률

## 검증 체크리스트
- `node scripts/validate-game-data.mjs` 통과
- 신규 드랍 `itemId`가 모두 `items`에 존재하는지 확인
- 신규 지역 `bossId`와 `bossDungeon.entries` 정합성 확인
- 신규 보스가 `bossExclusiveDropTables`를 갖는지 확인

## 후속 작업 제안
- 신규 지역 전용 보스 스킬(`bossOnly`)을 로어 콘셉트에 맞게 별도 추가
- 신규 장비의 강화 기대치가 기존 `Epic` 장비를 과도하게 압도하지 않도록 튜닝
- 지역 해금 연출/문구(탐험 UI) 추가
