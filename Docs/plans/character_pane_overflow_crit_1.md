# Plan: 캐릭터 패널 가로 스크롤 방지·남은 포인트 제거·치명타 레이아웃 (1)

## 목표
- 좌측 캐릭터 구역에서 가로 스크롤이 나지 않도록 `min-width: 0`·`overflow-x: hidden`·그리드 `minmax(0,1fr)` 등으로 폭 수축.
- «남은 포인트» UI 제거(보너스 포인트 로직·`+` 버튼은 유지).
- 치명타·치명타 데미지: 라벨 위, 수치 아래 세로 블록.

## 반영 파일
- `index.html`, `style.css`, `game.js`

## 보완: 경험치 표기
- `#exp-label`: `경험치 (N%)` 형식으로 진행률 표시.
- `#exp-text`: `현재 / 필요`만 표시, 숫자는 `toLocaleString('ko-KR')`.

## 보완: 골드·달란트 배지
- `updateUI`: 골드·달란트 `toLocaleString('ko-KR')` (골드는 정수, 달란트는 소수 최대 2자리).
