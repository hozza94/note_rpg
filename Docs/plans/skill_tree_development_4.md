# 스킬트리 개발 진행 기록 (4)

## 이번 단계 목표

- 이전 단계(3) 메모의 미완 항목 처리:
  1. `active_unlock` 이상치 노이즈 제어
  2. 패시브 툴팁에 거리 메타(`L`, `r`) 반영

## 반영 내용

### 1) 감사 스크립트 노이즈 제어 (`scripts/audit-pilgrim-skill-tree.mjs`)

- 기본 동작에서 `active_unlock`을 이상치 판정 대상에서 제외.
- 필요 시 `--include-active` 옵션으로 다시 포함 가능.
- 도움말 주석 및 출력 말미 안내 문구 추가.

효과:
- 기본 보고서에서 액티브 노드 고정점수(25) 때문에 발생하던 경고 스팸이 줄어,
  `small`/`notable`/`keystone` 밸런스 이슈에 집중 가능.

### 2) 패시브 툴팁 거리 메타 (`js/engine/skilltree.js`)

- `getSkillNodeGraphMeta(node, depthById)` 헬퍼 추가:
  - BFS 거리 `L`
  - 방사 거리 `r`
- `formatPassiveSkillTooltip(node)`에 아래 줄 추가:
  - `트리 거리: L=...`
  - `방사 거리: r=...`
- 모달 상세(`fillInfoForNode`)도 동일 헬퍼를 쓰도록 중복 계산 정리.

## 검증

- `node scripts/audit-pilgrim-skill-tree.mjs` (기본 모드)
- `node scripts/audit-pilgrim-skill-tree.mjs --include-active` (확장 모드)
- `node scripts/validate-game-data.mjs`
- 린트 에러 없음

## 후속 후보

- `active_unlock` 전용 점수식(현재는 제외/포함 2모드만 제공)
- 감사 결과를 기준으로 `small/notable/keystone`별 목표 구간 테이블 자동 리포트
