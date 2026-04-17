# 스킬트리 개발 진행 기록 (6)

## 추가 마무리 실행

사용자 요청에 따라 마지막 보강 코드를 실제 실행·검증까지 마무리했다.

## 실행 항목

- `node scripts/audit-pilgrim-skill-tree.mjs --include-active --active-score-mode=legacy`
- `node scripts/audit-pilgrim-skill-tree.mjs --include-active` (adaptive 기본)
- `node scripts/validate-game-data.mjs`

## 결과

- legacy/adaptive 두 모드 모두 실행 성공
- 데이터 검증 통과 (`validate-game-data`)
- 린트 에러 없음

## 현재 상태

- 감사 스크립트는 아래 3가지 운용이 가능:
  1. 기본: `skilltree:audit` (active 제외 + adaptive)
  2. 전체: `skilltree:audit:all` (active 포함 + adaptive)
  3. 비교: `--active-score-mode=legacy` 추가로 과거 방식 비교

- 스킬트리 개편 관련 잔여 마무리 코드 이슈는 현재 기준으로 없음.
