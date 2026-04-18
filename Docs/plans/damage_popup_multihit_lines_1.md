# 다단 히트 데미지 팝업 세로 분리 (1)

## 목적
합성 스킬 연속 타·더블스트라이크 등에서 크리 팝업이 같은 위치에 겹쳐 읽기 어려운 문제를 완화한다.

## 구현 요약
- `spawnDamagePopup`에 `line`(0부터)·`lineGap`(기본 60px, 크리 문구 2줄 대비) 옵션: `top`에 `line * lineGap`만큼 위로 배치.
- `line > 0`일 때 가로 지터를 줄여 세로 2줄 느낌을 강조.
- 합성 스킬: `mergedFrom` 인덱스를 `popupLine`으로 넘겨 히트마다 한 줄씩 위로(각 타 크리 시 둘 다 CRITICAL 팝업).
- `computeDoubleStrikeSecondDamage`: 추가 일격은 1타 확정 피해의 56%에 **독립 크리** 판정 → 둘 다 크리면 피해·로그·FX·팝업이 모두 크리로 맞음. 평타·일반 공격 스킬·합성 구성 단독 공격 경로에 적용.

## 관련 파일
- `js/engine/battle.js`
