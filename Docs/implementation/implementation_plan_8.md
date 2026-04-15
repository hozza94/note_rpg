# 구현 계획 8: 순례자 스킬트리 확장 & 보스 전용 스킬 설계

## 1. 순례자 스킬트리 노드 확장 (데이터 반영)

### 1.1 추가된 분기(요약)
| 구역 | 노드 수 | 역할 |
|------|--------|------|
| 수양의 길 | 4 | 시작점에서 좌하 방향, 생존·신앙·받피감 키스톤 |
| 예언의 가지 | 3 | `pilgrim_faith_2`에서 분기, 치명 위주 |
| 전장의 측면 | 2 | `pilgrim_atk_2`에서 분기, 공격·속도 |
| 방패선 | 2 | `pilgrim_def_1`에서 분기, HP·방어 |
| 질주선 | 2 | `pilgrim_spd_1`에서 분기, PP·회피 |
| 천상 상승 | 2 | `pilgrim_zeal_2`에서 상승, 피해량 키스톤 |
| 심연 저항 | 2 | `pilgrim_resolve_2`에서 분기, 저HP 피해·체력 |

### 1.2 밸런스·호환
- 기존 세이브: `unlockedSkillNodes`에 새 ID가 없으면 그대로 동작.
- `damageMul` / `damageTakenMul` / `lowHpDamageMul`는 기존 로직대로 **곱연산** 누적.
- 총 노드 수가 늘어나 레벨업 포인트 대비 트리 완성 난이도는 상승 → **향후** 지역·퀘스트로 추가 포인트를 줄지 별도 검토.

---

## 2. 보스 전용 스킬 + 몬스터 스킬 풀 (`monsterSkillTrees`) — 구현 반영

### 2.1 `bossOnly` 스킬
- `GAME_DATA.skills`에 `bossOnly: true`인 보스 전용 스킬 ID 추가 (원혼·진흙 거인·석화 세라프용).
- 플레이어: `ensureStateSchema` / `syncUnlockedActiveSkills` / `getActiveSkills`에서 제외, `useSkill`에서도 차단.
- 몬스터는 `monsterSkillTrees` 안의 풀에서만 참조.

### 2.2 `monsterSkillTrees` (dropTableId와 동일 패턴)
- 각 몬스터 행은 `skillTreeId: "st_..."` 로 풀을 참조 (구버전 호환: `skills` 배열이 있으면 폴백).
- 구조: `defaultPool: { skillIds, weights }`, 선택: `lowHp: { threshold, skillIds, weights }` (현재 HP 비율이 `threshold` 미만이면 저HP 풀).
- `chooseMonsterSkill` → 가중치 랜덤 (기존 55% 일반 공격 / 45% 스킬 시도 확률 유지).

### 2.3 후속(선택)
- 페이즈별 풀, 쿨다운, 보스 전용 연출 플래그.
- `minGrade` / `tags` 필드는 미사용.

### 2.4 검증 체크리스트
- [x] 플레이어가 보스 전용 스킬을 액티브 목록에 넣을 수 없다.
- [x] 세이브 로드 후 `bossOnly` ID가 제거된다.
- [x] 몬스터는 `skillTreeId` 기준으로 스킬을 고른다.
- [ ] 밸런스·난이도는 플레이 테스트 후 조정.

---

## 3. 관련 파일
- `js/data.js` — `skills`(보스 전용), `monsterSkillTrees`, `monsters[].skillTreeId`
- `game.js` — `pickWeightedSkillId`, `getMonsterSkillTreePool`, `chooseMonsterSkill`, 플레이어 `bossOnly` 필터
- `Docs/specs/features.md` — 전투·몬스터 스킬 풀 요약
