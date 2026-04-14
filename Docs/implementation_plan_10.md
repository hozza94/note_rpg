# implementation_plan_10: game.js 모듈 분리 1~4단계

## 1) 배경
- `game.js`가 2900+ 라인까지 증가하여 기능 추가/디버깅 시 영향 범위 파악이 어려워졌다.
- 우선 도메인 결합도가 높은 **대장간(강화/분해/제작)** 영역부터 분리해 파일 구조를 단계적으로 정리한다.

## 2) 목표
- 1단계: 대장간 관련 메서드를 `js/engine/smithing.js`로 분리한다.
- 2단계: 전투 관련 메서드를 `js/engine/battle.js`로 분리한다.
- 3단계: 스킬트리/토스트 관련 메서드를 `js/engine/skilltree.js`로 분리한다.
- 4단계: 탐험/자동진행/예배 관련 메서드를 `js/engine/explore.js`로 분리한다.
- 기존 저장 데이터/동작/화면(UI)을 깨지 않고 동일하게 유지한다.
- 이후 단계(전투/탐험/스킬트리 분리)를 위한 패턴을 고정한다.

## 3) 설계 원칙
- 현재는 번들러 없이 `<script>` 로딩 기반이므로, 클래스 상속/ESM 전환 대신 **prototype 주입 방식**을 사용한다.
- `game.js`는 코어 상태/공통 유틸을 유지하고, 도메인 메서드는 별도 파일에서 `GameEngine.prototype`에 주입한다.
- 분리 단계마다 "동작 동일성"을 우선한다. (리팩토링 + 기능 변경 동시 진행 금지)

## 4) 적용 범위 (1~4단계)
- 이동 대상:
  - `openBlacksmithModal`
  - `renderBlacksmithEnhanceBody`
  - `renderBlacksmithSalvageBody`
  - `renderBlacksmithCraftBody`
  - `getEnhancePreviewText`
  - `getSalvageReward`
  - `tryEnhanceItem`
  - `salvageItem`
  - `craftRecipe`
- 로딩 순서:
  - `game.js`에서 `window.GameEngine` 노출
  - `index.html`에 `js/engine/*.js` 추가 로드

### 2단계(전투)
- `js/engine/battle.js` 생성
- 전투 렌더/턴 처리/몬스터 스킬 선택/도주/스킬 사용 관련 메서드 이관

### 3단계(스킬트리/토스트)
- `js/engine/skilltree.js` 생성
- 스킬트리 데이터/해금/렌더/SVG 상호작용/토스트 메서드 이관

### 4단계(탐험/자동진행)
- `js/engine/explore.js` 생성
- 자동전투/자동순례 제어, 탐험/보스도전/지역이동, 예배/휴식 관련 메서드 이관

## 5) 기대 효과
- 대장간 관련 변경 시 탐색 범위가 `smithing.js` 중심으로 축소된다.
- `game.js`의 책임이 줄어들어 다음 분리(전투/스킬트리/탐험)가 수월해진다.

## 6) 리스크 및 대응
- 리스크: 스크립트 로드 순서 문제로 prototype 주입 실패 가능
  - 대응: `window.GameEngine`를 명시 노출하고, `smithing.js`는 `game.js` 뒤에서 로드
- 리스크: 분리 과정에서 메서드 참조 누락
  - 대응: 대장간 버튼 진입, 강화/분해/제작 탭 실동작으로 수동 회귀 확인

## 7) 후속 계획
- 2단계 후보: `battle.js` 분리
- 3단계 후보: `skilltree.js` 분리
- 4단계 후보: `explore.js` + `ui.js` 분리
- 주의: 장비 인스턴스화(UID 단위 강화)는 **Task 5 이후 별도**로 진행
