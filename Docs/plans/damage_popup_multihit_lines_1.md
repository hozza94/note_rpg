# 다단 히트 데미지 팝업 세로 분리 (1)

## 목적
합성 스킬 연속 타·더블스트라이크 등에서 크리 팝업이 같은 위치에 겹쳐 읽기 어려운 문제를 완화한다.

## 구현 요약
- `spawnDamagePopup`에 `line`(0부터)·`lineGap`(기본 52px) 옵션 추가: `top`에 `line * lineGap`만큼 위로 배치.
- `line > 0`일 때 가로 지터를 줄여 세로 2줄 느낌을 강조.
- 합성 스킬: `mergedFrom` 인덱스를 `popupLine`으로 넘겨 히트마다 한 줄씩 위로.
- 평타·단일 공격 스킬의 추가 일격: `line: 1`.

## 관련 파일
- `js/engine/battle.js`
