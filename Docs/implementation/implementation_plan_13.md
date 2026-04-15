# implementation_plan_13: 아바타 확장 구조 1차 준비

## 1) 배경
- 현재 아바타 수는 적지만, 이후 이벤트/드랍/업적 기반으로 신규 아바타를 지속 추가할 계획이다.
- 코드 하드코딩 방식이면 아바타가 늘어날수록 유지보수가 어려워진다.

## 2) 목표
- 아바타 목록/기본 해금/기본 선택을 `js/data.js` 데이터 기반으로 전환한다.
- 세이브 데이터는 `selectedAvatarId`, `unlockedAvatarIds`를 중심으로 유지한다.
- 이후 해금 조건(`unlockType`, `unlockHint`)만 추가해도 UI가 자동 반영되게 만든다.

## 3) 1차 적용 범위
- `js/data.js`
  - `avatars.defaultSelectedId`
  - `avatars.defaultUnlockedIds`
  - `avatars.list[]` (id, label, gender, image, unlockType, unlockHint)
- `game.js`
  - `getAvatarCatalog()`에서 데이터 소스 사용
  - 세이브 로드 시 기본 해금/선택 보정
  - 설정 UI에서 잠금 안내 텍스트(`unlockHint`) 노출

## 4) 설계 원칙
- 신규 아바타 추가 시 **코드 수정 없이** `js/data.js` 항목 추가만으로 동작.
- 구버전 세이브(`avatarGender` 중심)도 자동 마이그레이션.
- 잠금 정책은 2차에서 확장(드랍/업적/상점).

## 5) 후속 과제 (2차)
- 해금 트리거 시스템: `unlockAvatar(avatarId)` 호출 지점 표준화
- 획득처 UI: 카드에 `획득처`, `요구 조건`, `진행도` 표기
- 희귀도별 시각 효과(테두리/광원) 통일
