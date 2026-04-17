# 메인 레이아웃 스크롤 힌트 적용 (1)

## 목적
모달(상점·대장간 등)에만 있던 하단 그라데이션·삼각형 스크롤 힌트를, 메인 화면의 스크롤 영역에도 동일하게 적용한다.

## 대상 영역
- 좌측 캐릭터 패널 (`.character-pane-scroll-body`)
- 중앙 전투 로그 (`#game-log`, 부모 `.log-scroll-wrap`)
- 우측 탭 본문 — 소지품 / 스킬 / 성물 (`.tab-scroll-body`)

## 구현 요약
- `index.html`: 각 영역을 `modal-scroll-wrap` + `modal-scroll-body` + `modal-scroll-hint` 구조로 감쌈.
- `style.css`: 패널·로그·탭 래퍼에 `flex: 1`, `min-height: 0` 등으로 그리드 내 스크롤 높이 확보; 스크롤은 내부 바디에만 부여.
- `js/engine/ui-facility-hub.js`: `bindMainLayoutScrollHints`, `refreshScrollHint` (기존 `bindModalScrollHint` 재사용).
- `game.js`: 인증 통과 직후 `bindMainLayoutScrollHints()` 호출(이어하기 로그 이전에 바인딩); 초기 렌더 후 캐릭터·탭 힌트 갱신; `log` / `logHtml`에서 스크롤 후 힌트 갱신.
- `ui-tabs-inventory.js` / `ui-avatar-equipment.js`: 탭·장비 패널 재렌더 후 `refreshScrollHint` 호출.

## 확인 사항
- 각 영역에서 내용이 뷰포트보다 길 때만 하단 힌트 표시, 맨 아래 스크롤 시 힌트 숨김.
- 로그 자동 스크롤 시에도 힌트 상태가 맞는지.
