# 순례자 연장 노드(ascent) 허브 구조·엣지 표시 개선 (1)

## 배경

- **난광의 미세** 등 연장 노드가 한 줄로만 이어져, 핵심 코어에서 멀어질수록 짧은 선으로 이어지는데도 SP·진행 체감이 손해처럼 느껴짐.
- 지도상 멀리 떨어진 노드 사이 **점선(long-hop)** 연결이 어색해 보임.

## 설계

1. **그래프**: 순교(m)·십일조(t)·광휘(r) 연장 각각 **핵심 노드에서 모든 단계로 직접 엣지** (허브).
   - `pilgrim_martyr_keystone` → `pilgrim_ascent_m_1` … `_10`
   - `pilgrim_tithe_ep_4` → `pilgrim_ascent_t_1` … `_10`
   - `pilgrim_active_radiant_volley` → `pilgrim_ascent_r_1` … `_10`
2. **진행 순서 유지**: II 이상에 `requiresAll: [직전 단계 id]` 부여 → SP 총량·선행 순서는 기존과 동일, 인접 해금만 코어와 연결.
3. **좌표**: 각 코어 주변에 이중 반경 부채꼴로 배치해 겹침·장거리 직선 체인 완화.
4. **표시**: `long-hop` 임계값을 `unit * 6.2`로 스케일, CSS는 **점선 제거**·실선만 약간 흐리게.

## 변경 파일

- `data/parts/skillTrees.json` — edges, 노드 position·requiresAll
- `js/data.js` — 동기화
- `js/engine/skilltree.js` — `getSkillTreeLayout`에 `unit` 반환, long-hop 계산
- `style.css` — `.skill-web-edge.long-hop`

## 비고

- 수치 밸런스(단계별 스탯 상향)는 이번 범위에서 제외. 필요 시 별도 밸런스 문서에서 조정.
