# 스킬트리 초기화·경로 일괄 해금 (1)

## 기능 요약

### 1) 스킬 초기화

- 해금 노드를 **시작 노드만** 남김 (`pilgrim_origin`)
- 사용한 포인트 **전액 환급** (시작 노드 제외, 노드당 기본 1포인트)
- 액티브 스킬은 기본 3종(`meditation`, `praise`, `proclaim`)으로 복구 후 `syncUnlockedActiveSkills`
- UI: 스킬트리 모달 **「스킬 초기화」** → 확인 모달 후 실행

### 2) 경로 일괄 해금

- 선택한 **목표 노드**까지 해금 가능할 때, 선행·연결 조건을 만족하는 중간 노드를 **순서대로 자동 해금**
- 포인트가 부족하면 가능한 만큼만 시뮬레이션 후 **실패 메시지** (부분 해금은 실행 전 계획 단계에서 차단하지 않음 — `unlockSkillPathTo` 중 실패 시 중단)
- UI: 포인트 충분 시 버튼 **「경로 배우기 (N)」**, 1개면 **「배우기」**

## 규칙 (기존과 동일)

- `requiresAll` + `preRequired` 선행 충족
- `edges` 기준 **인접 노드**만 해금 가능
- 노드당 비용: `node.points` 없으면 **1**

## 코드

- `js/engine/skilltree.js`
  - `resetSkillTree`
  - `getSkillTreeUnlockPlanTo` / `unlockSkillPathTo`
  - `canUnlockSkillNodeWithState` (시뮬레이션용)

## 검증

- 초기화 후 `skillTreePoints` = 이전 보유 + 환급분
- 멀리 떨어진 노드 선택 시 중간 노드 순차 해금
- 포인트 부족 시 버튼 비활성 + 툴팁
