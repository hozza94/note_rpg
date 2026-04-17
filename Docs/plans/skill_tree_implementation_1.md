# 스킬트리 개편 구현 기록 (1)

## 반영된 수치 (확정)
- `GAME_DATA.skillMergeDefaults`: `damageMul` 0.88, `buffEffectMul` 0.88, `ppCostRatio` 0.85  
- 합성 스킬 PP = `ceil(구성 스킬 PP 합 × 0.85)`

## 코드 변경 요약
- **`js/data.js`**: `skillMergeDefaults`, 합성 스킬 ID, 순례자 **링 노드**·엣지 보강. (직업 분기용 별도 `skillTrees` / `classSkillDefaults`는 **제거** — 빌드는 **핵심·특성 클러스터**로만 분기.)
- **`js/engine/skilltree.js`**: `getMergedSkillPpCost`, `getSkillMergeProfile`, `getActiveSkills`, `syncUnlockedActiveSkills`, 툴팁.
- **`js/engine/battle.js`**: `applyPartialPlayerSkillForBattle`, `useSkill` 합성 분기.
- **`js/engine/state-schema.js`**: `sanitizePilgrimSkillTreeUnlocks`, `migrateLegacyActiveSkillsToMerged`, `classId`는 항상 `pilgrim`.
- **`scripts/validate-game-data.mjs`**: `relicGacha.gradeRates` 합산을 **등급 키 전체**로 수정, `poolByGrade` 검사도 동적 키.

## 순례자 트리에서 합성으로 묶인 액티브
- 광휘 난사 + 잔화 인장 → `merged_volley_ember`
- 자비의 숨 + 새벽 피난처 → `merged_mercy_dawn`
- 에덴의 창 + 심판의 전류 → `merged_lance_reckoning`

## 미완·여지
- 다른 액티브 노드(거룩한 방벽·심판의 강타 등)는 아직 단일 스킬 유지. 추가 합성은 동일 패턴으로 확장 가능.
- `validate-game-data.mjs`의 성물 가챠 비율 합 오류는 본 작업과 무관(기존).
