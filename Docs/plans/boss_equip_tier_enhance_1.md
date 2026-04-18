# Plan: 보스 전용 장비 등급·강화 세분화 (1)

## 목표
- 동일 **+강화 단계**라도 **초반 보스 드랍**과 **후반 보스 드랍** 장비가 비슷한 스탯이 되지 않도록 분리.
- **장비등급**(1~10): 보스 전용 드랍 테이블(원혼→…→루시퍼) 진행도에 대응.
- **강화**: 보스 전용 `bossEnhanceRates` 누적배율에 `1 + (등급-1) * bossEquipTierEnhanceStep`을 곱해 고등급일수록 강화 효율 상승.

## 데이터
- `GAME_DATA.items.*.equipTier`: 해당 아이템이 **처음** 등장하는 보스 구간 기본값(구세이브·상점 등 보조).
- `GAME_DATA.smithing.bossEquipTierEnhanceStep`: 등급당 강화 배율 가산(기본 0.076).

## 세이브
- `player.itemEquipTier: { [itemId]: number }`: 실제 획득 시 `recordBossDropEquipTier`로 **해당 보스 테이블 등급 이상**만 기록(동일 itemId가 상위 보스에서도 나오면 max).

## 코드
- `js/engine/item-stats.js`: `getItemBossEquipTier`, `getBossEquipTierEnhanceMultiplier`, `recordBossDropEquipTier`, `getItemFinalStats` 보스 전용 분기.
- `js/engine/battle.js`: `applyBossExclusiveDrops` 후 `recordBossDropEquipTier` 호출.
- `js/engine/state-schema.js`: `itemEquipTier` 기본 객체.
- `js/engine/smithing.js`: 강화 탭에 등급·배율 안내 한 줄.
- `types/game-data.d.ts`: `ItemDef.equipTier` 선택 필드.

## 밸런스
- `bossEquipTierEnhanceStep` 조정으로 후반 +30 대비 초반 +30 격차를 미세 조정 가능.

## 보완 (2): PP 보스 전용 장비에 치명타 피해
- `wraith_locket`, `guardian_halo`, `abyss_grimoire`, `astral_circlet`에 `specials.critDamageMul` 부여(등급에 따라 4~8.5%p).
