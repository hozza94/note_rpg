# 스킬트리 개발 진행 기록 (2)

## 진행 순서 선택 근거

- 이번 턴은 버그 가능성을 줄이기 위해 **P3(데이터 미세조정) → P2(합성 확장)**이 아닌,
  실제 충돌이 적은 **P2(기존 ID 유지 합성 확장) + P3(저레벨 과세팅 완화)**를 한 번에 반영했다.
- 노드/엣지 ID는 유지하고 `activeSkillId` 매핑만 바꿔 세이브 파손 리스크를 최소화했다.

## P2: 합성 액티브 확장

### 신규 합성 스킬

- `merged_holy_judgment`: `holy_wall` + `smite`
- `merged_aegis_dash`: `aegis_prayer` + `light_dash`

### 노드 매핑 변경 (`js/data.js`)

- `pilgrim_active_holy_wall`, `pilgrim_active_smite` → `merged_holy_judgment`
- `pilgrim_active_aegis_prayer`, `pilgrim_active_light_dash` → `merged_aegis_dash`
- 노드명/설명도 합성 기준으로 동기화.

### 세이브 호환 (`js/engine/state-schema.js`)

- `migrateLegacyActiveSkillsToMerged()`에 아래 매핑 추가:
  - `holy_wall` + `smite` → `merged_holy_judgment`
  - `aegis_prayer` + `light_dash` → `merged_aegis_dash`

## P3: 저레벨 밸런스 미세 조정

- `pilgrim_zeal`: 피해 증가 `8% → 6%`
- `pilgrim_resolve`: 치명 확률 `5% → 4%`

의도:
- `L=1` 구간에서 과한 즉시 효율을 낮추고, 중층 노드 투자 가치를 상대적으로 보존.

## 검증

- `node scripts/validate-game-data.mjs` 통과
- `node scripts/audit-pilgrim-skill-tree.mjs` 통과
  - 감사 출력에서 `pilgrim_zeal`, `pilgrim_resolve` score 하향 확인
