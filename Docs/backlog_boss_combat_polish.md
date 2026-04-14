# 백로그: 보스 전투·스킬 UX 다듬기 (예약)

나중에 진행할 항목입니다. 구현 시 `implementation_plan` 번호를 붙여 세부 계획을 새로 작성해도 됩니다.

## 1. 페이즈별 스킬 풀
- `monsterSkillTrees`에 HP 구간 외에 **턴 수·페이즈 인덱스** 기반 풀 전환 검토.
- 보스별로 2~3페이즈 연출·난이도 곡선 조정.

## 2. 몬스터·보스 스킬 쿨다운
- 동일 스킬 연속 남용 방지용 **쿨다운 턴** (전투 상태 `battle.monsterSkillCd` 등).
- 데이터에 `cooldown?: number` 선택 필드.

## 3. 보스 전용 로그 문구
- `[보스이름]` + 스킬명 + 톤앤매너 통일 (위협/경고/기도체 등 지역 테마).
- 저HP 진입 시 이미 일부 로그 있음 → 보스 전용 스킬 사용 시 추가 멘트.

## 관련 파일
- `js/data.js` — `monsterSkillTrees`, `skills`
- `game.js` — `monsterTurn`, `chooseMonsterSkill`, `winBattle` 로그
