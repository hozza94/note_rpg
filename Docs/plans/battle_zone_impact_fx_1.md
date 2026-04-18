# Plan: 전투 구역별 이펙트·몬스터 공격 전용 셋 (1)

## 목표
- **플레이어가 공격할 때**: 몬스터 열(`.battle-actor--enemy`)에만 흔들림·플래시. 전체 `#battle-scene` / `#app`에는 적용하지 않음.
- **몬스터가 플레이어를 공격할 때**: 플레이어 열(`.battle-actor--player`)에만 흔들림·구역 플래시.
- **몬스터 공격·스킬 전용 버스트**: 플레이어 초상 슬롯 내 `battle-mattack-fx-layer` + `battle-mattack-fx--*` (claw/void/fire 등)로 플레이어 스킬 FX와 구분되는 시각 셋.

## 반영 파일
- `js/engine/battle.js`: `clearBattleDuelZoneImpactFx`, `triggerPlayerPhysicalHitFx` / `triggerMonsterImpactFx` 타깃 변경, `ensureMonsterSkillFxLayer` 셀렉터 범위, `ensurePlayerSkillFxLayer`·`spawnMonsterAttackSkillFx`·`emitMonsterAttackFxBursts` 추가.
- `style.css`: `battle-mattack-fx-*`, `zone-m-flash*` 애니메이션.
- `index.html`: `style.css` / `battle.js` 캐시 쿼리 버전.

## 확장 여지
- 몬스터 스킬 id별 `resolveMonsterAttackFxPreset` 분기(보스 전용 시퀀스 등).
