# 스킬트리 개발 진행 기록 (7)

## 목적

- 중단된 스킬트리 UI/레이아웃 변경분을 마무리하고 커밋 가능한 상태로 정리한다.
- 현재 채택 레이아웃(방사형 + 격자 스냅 + 충돌 완화)을 문서화한다.
- 실험 계획 문서와 실제 적용 방향의 차이를 명확히 남긴다.

## 이번 정리에서 확인한 내용

1. 워킹트리에 있던 스킬트리 UI 변경은 아래 축으로 일관된다.
   - `SKILL_TREE_UI` 상수 기반 파라미터 관리
   - 방사형 자동 배치(`getSkillTreeLayout`) 우선
   - 엣지 상태(`locked/available/learned`) 및 깊이 tier 시각화
   - 클러스터 섹터/라벨 오버레이
2. 선행 조건 검사는 `preRequired` + `requiresAll` 통합 방식으로 동작한다.
3. 데이터 엣지 2건(`sanct_keystone→guard_final`, `stellar_crown→hunt_core`) 제거가 반영되어 있다.

## QA/검증 결과

### 코드 점검

- `js/engine/skilltree.js` 문법 오류 1건 수정
  - 원인: `computeSkillTreeLogicalDepth` 내부 `startId` 중복 선언
  - 조치: 하단 중복 `const startId` 제거

### 스크립트 검증

- `node --check js/engine/skilltree.js` 통과
- `node --check js/data.js` 통과
- `node scripts/validate-game-data.mjs` 통과
  - 비표준 등급(`Legendary`, `Mythic`) 경고 6건은 기존과 동일
- `npm run skilltree:audit` 통과
  - `ascent_*` 저효율 경고는 기존 의도 범주 유지

## 레이아웃 채택/미채택 정리

- 채택:
  - 방사형 자동 배치 + 격자 스냅 + 노드 충돌 완화
- 미채택(이번 커밋 기준):
  - 완전 컬럼형 Tiered 자동 배치

## 실험/참고 문서 연결

- `Docs/plans/skill_tree_grid_layout_1.md`
- `Docs/plans/skill_tree_radial_layout_1.md`
- `Docs/plans/skill_tree_radial_layout_fix_2.md`
- `Docs/plans/skill_tree_tiered_layout_1.md`
- `Docs/plans/skill_tree_visual_component_1.md`

위 문서들은 실험 기록으로 유지하고, 이번 적용 기준은 본 문서(7)로 고정한다.
