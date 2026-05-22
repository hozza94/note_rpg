# 스킬트리 한눈에 보기 UI 확정·구현 기록 (2)

## 확정 방향

- [`skill_tree_overview_redesign_1.md`](skill_tree_overview_redesign_1.md) **추천안**: 4방향 웨지 + LOD(줌 단계)

## 구현 요약

### 레이아웃 (`getSkillTreeLayout`)

- 기존 전원 방사 링 배치 → **웨지별 각도·반지름** 배치
- 웨지: `faith`(북), `valor`(동), `guard`(남), `agile`(서), `center`(서약·합일), `ext_m/t/r`(말단 연장)
- `CLUSTER_TO_WEDGE` + `RING_NODE_WEDGE` + ID 휴리스틱으로 노드 웨지 할당
- 격자 스냅 + 노드 최소 간격 분리(`snapSkillTreePositions`)

### 시각·LOD

| 줌 | 클래스 | 동작 |
|----|--------|------|
| ≤0.9 | `lod-0` | 웨지 라벨·진행률, 키스톤/액티브/시작만 강조, 이름·완료 숨김, 마이크로 클러스터 라벨 숨김 |
| ≤1.2 | `lod-1` | 이름 소형, 완료 문구 숨김 |
| >1.2 | `lod-2` | 상세(이름·가능 엣지·클러스터 라벨) |

- 기본 줌: **72%** (`defaultOverviewZoom`)
- 「개요」 버튼 = 72% 줌 복귀

### 엣지

- **잠금·완료 엣지**: 기본 비렌더 (완료는 「완료 경로」 체크 시 모달 재오픈으로 표시)
- **가능·학습 중 경로**: `available` / (체크 시) `learned` 만 표시

### UI

- 웨지 섹터 배경 + `해금 n/m (p%)` 진행 텍스트
- 툴바: `완료 경로` 체크박스

## 변경 파일

- `js/engine/skilltree.js`
- `style.css`
- `index.html` (캐시 `v=20260507-9`)

## 검증

```bash
node --check js/engine/skilltree.js
node scripts/validate-game-data.mjs
npm run skilltree:audit
```

## 플레이 테스트 체크

- [ ] 첫 오픈 시 4웨지·진행률이 한눈에 보이는지
- [ ] 줌 인 시 노드 이름·해금 가능 경로가 읽히는지
- [ ] 완료 경로 OFF에서 금색 스파게티가 사라졌는지
- [ ] 말단 연장 3구역이 본 트리와 분리되어 보이는지

## 2차 조정 (확대 가독성)

- **클러스터 부채꼴**: 렌더 제거 (웨지와 겹쳐 곡선·원처럼 보이던 원인)
- **웨지 배경**: `lod-1`·`lod-2`에서 채움·테두리 숨김 (개요 줌에서만 구역 표시)
- **노드 크기**: 코어·링 반경 약 25~30% 축소
- **간격**: `minNodeSepPx` 62, `wedgeStepR` 78, 동일 깊이 최소 각도 간격
- **확대 시**: `lod-1` 0.9×, `lod-2` 0.82× 노드 스케일

## 추후 (선택)

- 웨지 클릭 시 해당 방향으로 줌·패닝
- `requiresAll` 합류 노드 중앙 허브 배치 미세 조정
- 노드 `wedge` 필드를 `data.js`에 명시(휴리스틱 제거)
