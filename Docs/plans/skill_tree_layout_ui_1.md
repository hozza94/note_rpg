# 스킬트리 레이아웃·표시 개선 (1)

## 목표

- 노드·라벨이 뭉쳐 보이는 문제 완화(간격·폰트·라벨 길이).
- 플레이어에게 불필요한 **트리 거리 L / 방사 r** 표현 제거(툴팁·상세 패널).

## 변경 요약

| 영역 | 내용 |
|------|------|
| `getSkillTreeLayout` | `unit` 88→118, `padding` 180→220 |
| `getSkillNodeLayoutRadii` | 이름·상태 `tspan` 세로 오프셋 소폭 확대 |
| `formatPassiveSkillTooltip` | L·r 줄 제거 |
| 모달 `fillInfoForNode` | graph 메타 줄 전체 제거 |
| 노드 하단 문구 | `해금 완료`→`완료`, `해금 가능`→`가능` |
| 모달 너비 | 레이아웃 `width`에 맞춰 최대 1120px까지 확장 |
| `style.css` | 노드 이름 11px, 상태 10px |
| `index.html` | `skilltree.js` 쿼리 버전 bump |

## 비고

- `getSkillNodeGraphMeta` / `buildSkillTreeBfsDepthMap`는 내부용으로 유지 가능(향후 디버그·기획 도구). 모달에서는 더 이상 호출하지 않음.
