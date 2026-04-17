# 스킬트리 개발 진행 기록 (3)

## 이번 단계

다음 단계 요청에 따라 아래 2가지를 진행했다.

1. 합성 스킬 툴팁/요약 가독성 개선  
2. 감사 스크립트 이상치 자동 경고 추가

## 1) 합성 스킬 툴팁 개선 (`js/engine/skilltree.js`)

- `formatActiveSkillSummary()`:
  - 기존: 기본값 배율만 표시
  - 변경: 스킬별 `mergeProfile` 반영 (`getSkillMergeProfile`) + 문구 분리
  - 표시 예: `합성: A + B · PP n · 공격 0.88x · 강화 0.88x`

- `formatActiveSkillTooltip()`:
  - 합성 스킬일 때 아래 정보 추가:
    - 합성 구성 스킬 목록과 각 PP
    - 합성 배율(공격/강화)
    - PP 계산 규칙 `(합 × ratio) 올림`
  - PP 표시도 `skill.cost` 고정이 아니라 `getMergedSkillPpCost()` 기준으로 표기.

## 2) 감사 스크립트 자동 경고 (`scripts/audit-pilgrim-skill-tree.mjs`)

- kind별 노드 그룹에서 간단한 분위 기반 휴리스틱으로 자동 태깅:
  - `low_efficiency`: L 상위 35% & score 하위 35%
  - `high_efficiency`: L 하위 35% & score 상위 35%
- 콘솔 출력에 `--- 자동 이상치 경고 ---` 섹션 추가.
- `--json` 출력에도 `outliers` 배열 포함.

## 실행 확인

- `node scripts/audit-pilgrim-skill-tree.mjs` 실행 성공
- 후반 섹션에서 자동 이상치 경고 출력 확인
- 린트 에러 없음

## 메모

- 현재 `active_unlock`은 휴리스틱 score를 25 고정 가산하므로, 이상치 경고가 많이 잡힌다.
- 다음 단계에서 `kind === active_unlock` 별도 규칙(또는 제외)로 분리하면 신뢰도가 올라간다.
