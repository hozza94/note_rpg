# 상점·대장간 스크롤 힌트 UI (1차)

## 목적

- 상점·대장간 목록 영역에서 스크롤바를 숨기고, 내용이 넘칠 때만 하단에 아래 방향 삼각형 + 그라데이션 + 깜빡/움직임으로 추가 스크롤 가능함을 안내한다.

## 구현 요약

- `js/engine/ui-facility-hub.js`: `bindModalScrollHint(scrollEl)` — `scroll`·`ResizeObserver`로 `overflow && !atBottom`일 때 부모 `.modal-scroll-wrap`에 `is-scroll-hint-visible` 토글.
- `js/engine/ui-shop.js`: 구매/판매 목록을 `.modal-scroll-wrap` / `.modal-scroll-body` / `.modal-scroll-hint` 구조로 변경 후 힌트 바인딩.
- `js/engine/smithing.js`: `.smith-body`를 동일 래핑, 스크롤 복원 후 `scroll` 이벤트로 힌트 갱신.
- `style.css`: `.modal-scroll-*` 공통 스타일, `@keyframes modalScrollHintBob`.

## 캐시 버전

- `index.html`: `style.css`, `ui-facility-hub.js`, `ui-shop.js`, `smithing.js` 쿼리 버전 갱신.
