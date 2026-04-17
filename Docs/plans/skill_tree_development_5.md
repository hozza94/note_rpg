# 스킬트리 개발 진행 기록 (5)

## 마무리 보강 항목

사용자 요청(마무리 필요 코드 확인)에 따라 감사 스크립트의 마지막 남은 품질 이슈를 보강했다.

## 변경 내용

### 1) `active_unlock` 전용 점수식 도입 (`scripts/audit-pilgrim-skill-tree.mjs`)

- 기존: `grants.activeSkillId`가 있으면 고정 +25 가산.
- 변경: 합성/단일 액티브를 구분해서 **적응형 점수(`adaptive`)** 계산.
  - 단일 스킬: `cost`, `effect`, `scaling` 기반 점수
  - 합성 스킬: 구성 스킬 점수 합 + `mergeProfile(damageMul, buffEffectMul, ppCostRatio)` 반영
- 옵션 추가:
  - `--active-score-mode=legacy` : 기존 고정 +25 방식
  - 기본값은 `adaptive`

효과:
- `--include-active` 모드에서도 액티브 이상치가 전부 동일 점수로 찍히지 않아 해석력이 올라감.

### 2) 실행 스크립트 보강 (`package.json`)

- `skilltree:audit:all` 추가
  - `node scripts/audit-pilgrim-skill-tree.mjs --include-active`

## 검증

- `node scripts/audit-pilgrim-skill-tree.mjs`
- `node scripts/audit-pilgrim-skill-tree.mjs --include-active`
- `node scripts/validate-game-data.mjs`
- 린트 에러 없음

## 상태 요약

- 스킬트리 개편 플로우에서 코드상 미반영으로 남아 있던 감사 품질 이슈는 이번 단계로 정리 완료.
