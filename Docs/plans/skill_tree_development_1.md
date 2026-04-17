# 스킬트리 개발 진행 기록 (1)

## 이번 작업 요약

계획서 `skill_tree_overhaul_1.md`의 **P1(거리·투자 감사)** 일부와 **플레이어 UI 가독성**을 반영했다.

### 1. BFS 깊이 `L`·방사 `r` 감사 스크립트

- **파일**: `scripts/audit-pilgrim-skill-tree.mjs`
- **내용**: `pilgrim_origin` 기준 무방향 BFS로 최단 엣지 수 `L`, `position`의 `r = hypot(x,y)`, `kind`, 휴리스틱 환산 `score`를 TSV 형태로 출력. 도달 불가 노드·잘못된 엣지 ID가 있으면 exit code 1.
- **실행**: `npm run skilltree:audit` 또는 `node scripts/audit-pilgrim-skill-tree.mjs`  
  JSON이 필요하면 `--json`.

### 2. 스킬트리 모달 상세 패널

- **파일**: `js/engine/skilltree.js`
- **내용**: `buildSkillTreeBfsDepthMap(tree)` 추가. 모달에서 노드 선택 시 **트리 거리 L**·**방사 r**을 메타 줄로 표시해, 기획서의 “투자 대비 위치”를 플레이어가 직관적으로 볼 수 있게 함.

### 3. npm 스크립트

- **파일**: `package.json` — `skilltree:audit` 등록.

## 다음에 할 수 있는 일 (참고)

- 감사 스크립트 출력을 기준으로 `small`/`notable`/`keystone` 구간별 **L 대비 score 이상치** 자동 플래그.
- `skill_tree_overhaul_1.md` P2·P3: 추가 합성 스킬·저층 소노드 데이터 작업.
- `formatPassiveSkillTooltip`에 L 주입(트리 컨텍스트 필요).

## 검증

- `node scripts/validate-game-data.mjs`
- `node scripts/audit-pilgrim-skill-tree.mjs` (exit 0)
