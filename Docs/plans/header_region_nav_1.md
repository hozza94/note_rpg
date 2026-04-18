# Plan: 헤더 지역 네비 + 캐릭터 패널 정리 (1)

## 목표
- 앱 헤더 중앙: 이전/다음 지역 아이콘 + 지역명 + 탐사 진행률.
- 캐릭터 창에서 지역 이동·중복 탐사 UI 제거, 보스 도전만 유지.

## 작업 항목
1. `index.html`: 헤더에 `btn-header-prev-region` / `btn-header-next-region` 추가, `quest-section` 축소.
2. `style.css`: `.header-region-cluster`, `.header-region-nav` 스타일.
3. `game.js`: 동적 지역 버튼 제거, 헤더 버튼 바인딩, `updateUI`를 `regionData` 기준으로 정리.

## 완료 (반영됨)
- 위 항목 적용: 헤더 `◀` / 지역명·바·% / `▶`, 캐릭터 패널은 보스 버튼만 `char-boss-row`.

## 보완 (2)
- 헤더: 지역명·탐사 % 글자 크기 상향, 지역 이동 버튼 소형화.
- 캐릭터: 골드·달란트를 `숫자 G · 숫자 T` 한 줄 표기(`char-resources-compact`).

## 보완 (3)
- 헤더 탐사 진행 바 가로 영역 확대.
- 설정: 텍스트 제거, 아이콘 버튼만.
- 골드·달란트: 직업·레벨 배지와 같은 줄(`char-meta-badges`, `badge--gold` / `badge--talent`).

## 보완 (4)
- `char-header`에 `--char-header-row-h` 정의, 닉네임 줄(`.char-title-hover-zone`) `min-height`와 설정 버튼 크기를 동일하게 맞춤.
