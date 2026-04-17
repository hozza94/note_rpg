# 로어북 상위 지역 밸런스 수치 보정 계획서 (2)

## 목적
- 지역 전환 난이도 기울기의 급완만/급경사 구간을 완화한다.
- 특히 `eden_core -> periphery`의 정체 구간과 `void_remnant -> infernal_pandemonium`의 급상승 구간을 다듬는다.

## 보정 원칙
- **정체 구간 상향**: `periphery` 필드/보스 레벨·보상을 소폭 상향해 체감 성장 확보
- **급경사 구간 완화**: `infernal_pandemonium` 초입 필드 2종과 엘리트 1종을 소폭 하향해 진입 스트레스 완화
- 지역 콘셉트(등급, 보스 위상)는 유지

## 반영 항목
- `regions.periphery.recommendedPlayerLv`: `38~48 -> 40~50`
- `periphery` 몬스터/보스
  - `periphery_sentinel`: 레벨/보상 상향
  - `periphery_stalker`: 레벨/보상 상향
  - `periphery_harbinger`: 레벨/보상 상향
  - `border_warden`: 레벨/보상 상향
- `infernal_pandemonium` 초입 완충
  - `hellhound`, `imp`: 레벨/보상 하향
  - `asmodeus`: 레벨/보상 소폭 하향

## 기대 효과
- 중후반 흐름에서 `periphery` 구간의 성장 체감이 살아난다.
- 상위 지역 첫 진입 시 장비/세팅 미완성 상태에서도 전환 허들이 과도하게 높지 않다.
- 최종적으로 지역 간 필드/보스 보상 곡선이 더 부드럽게 연결된다.

## 검증
- `node scripts/validate-game-data.mjs`
- 지역별 평균 레벨/경험치 지표 재집계로 구간 기울기 재확인
