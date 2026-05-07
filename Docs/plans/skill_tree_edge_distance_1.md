# 스킬트리 장거리 엣지 점검·제거 (1)

## 확인 결과

순례자 트리 `position` 기준 유클리드 거리로 엣지를 정렬했을 때, 다음 **비현실적으로 먼** 직접 연결이 있었음.

| 거리(그리드) | 엣지 | 비고 |
|-------------:|------|------|
| ~26 | `pilgrim_sanct_keystone` ↔ `pilgrim_guard_final` | 서쪽 성역 끝 ↔ 남동 수호 끝 |
| ~25 | `pilgrim_stellar_crown` ↔ `pilgrim_hunt_core` | 북서 천궁 끝 ↔ 동쪽 사냥 코어 |

게임 규칙상 인접 해금만 가능하므로, 이런 연결은 **지도 가독성·직관**에 맞지 않음.

## 조치

- 위 **두 엣지 제거** (`data/parts/skillTrees.json`; `js/data.js`는 해당 엣지가 없는 상태로 이미 일치).
- **해금 경로**: `철벽의 맹세`는 수호 본선(`active_aegis_prayer` 등)으로만 인접. `절대 추적자`는 `hunt_1`…`hunt_3` 및 `valor_final`·`reck_minor` 등 기존 인접으로만 접근.

## 재발 방지

- `scripts/validate-game-data.mjs`: 스킬트리 엣지의 그리드 거리가 **12 초과**이면 **경고** 출력 (오류는 아님, 데이터 튜닝 시 참고).
