/**
 * GAME_DATA 구조 요약 (implementation_plan_14 Phase 10)
 * 런타임은 js/data.js + js/data/constants.js 기준. 편집기 자동완성용.
 */

export type MonsterGrade = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
export type ItemGrade = 'Normal' | 'Uncommon' | 'Rare' | 'Epic';
export type ItemKind = 'material' | 'equipment';
export type MonsterTagRole = 'field' | 'boss';

export interface GameDataMeta {
    monsterGradeOrder: MonsterGrade[];
    itemGrades: ItemGrade[];
    equipmentSlots: string[];
    playerSkillTypes: string[];
    itemKinds: ItemKind[];
    /** 런타임: js/data/constants.js 에만 존재. GAME_DATA.meta JSON에는 미포함 */
    bossSkillSlotCountFromEnemyPowerTier?: (enemyPowerTier: number) => number;
}

export interface RegionDef {
    id: string;
    name: string;
    minLevel: number;
    bossId: string;
    nextRegionId: string | null;
    themeColor?: string;
    description?: string;
    fieldGradeMin?: MonsterGrade;
    fieldGradeMax?: MonsterGrade;
    recommendedPlayerLv?: { min: number; max: number };
    enemyPowerTier?: number;
}

export interface BossDungeonEntry {
    bossId: string;
    regionId: string;
    recommendedLv?: number;
    unlockType?: string;
}

export interface AvatarEntry {
    id: string;
    name: string;
    image?: string;
    [key: string]: unknown;
}

export interface MonsterDef {
    id: string;
    tags: [MonsterTagRole, string];
    regionId: string;
    grade: MonsterGrade;
    name: string;
    level: number;
    minPlayerLv: number;
    maxPlayerLv: number;
    stats: { hp: number; atk: number; def: number; spd: number };
    reward: { exp: number; gold: number };
    dropTableId?: string;
    skillTreeId?: string;
    isBoss?: boolean;
    /** 보스 전용: 패시브 스킬 ID (지역 enemyPowerTier에 따라 2~5개) */
    bossPassiveSkillIds?: string[];
    /** 보스 전용: 액티브 풀 (공격·자기강화 등, 티어에 따라 2~5개) */
    bossActiveSkillIds?: string[];
    bossActiveWeights?: number[];
    bossActiveLowHp?: { threshold: number; skillIds: string[]; weights?: number[] };
}

export interface MonsterCompendiumEntry {
    id: string;
    grade: MonsterGrade;
    name: string;
    type?: string;
    level?: number;
    dropTableId?: string;
    skills?: string[];
}

/** 자동전투 스킬 선택용 메타 (`explore.js` resolveSkillAi / pickAutoBattleSkillAction) */
export interface SkillAutoAi {
    role?: 'cleanse' | 'heal' | 'defense' | 'buff' | 'attack' | 'unknown' | string;
    weight?: number;
    /** 같은 전투에서 이 스킬 id를 쓴 직후 턴까지 최소 간격 */
    cooldownTurns?: number;
    minHpRatio?: number;
    maxHpRatio?: number;
    minEnemyHpRatio?: number;
    maxEnemyHpRatio?: number;
    /** 적 HP 비율이 낮을수록 가산되는 버스트 선호도 */
    burstBonus?: number;
    /** 적·자신 HP가 넉넉할 때 선딜·디버프 등 가산 */
    setupBonus?: number;
    /** 직전 자동 스킬과 같을 때 점수에 곱할 패널티 (0~1) */
    repeatPenalty?: number;
}

export interface SkillDef {
    name: string;
    tags?: string[];
    cost?: number;
    type: string;
    effect?: Record<string, unknown>;
    scaling?: Record<string, unknown>;
    desc?: string;
    bossOnly?: boolean;
    ai?: SkillAutoAi;
    [key: string]: unknown;
}

export interface MonsterSkillPool {
    skillIds: string[];
    weights: number[];
}

export interface MonsterSkillTreeDef {
    defaultPool: MonsterSkillPool;
    lowHp?: MonsterSkillPool & { hpRatioBelow?: number };
}

export interface SkillTreeNodeDef {
    id: string;
    name: string;
    kind: string;
    desc?: string;
    grants?: {
        stats?: Record<string, number>;
        specials?: Record<string, unknown>;
        activeSkillId?: string;
    };
    position?: { x: number; y: number };
}

export interface SkillTreeDef {
    classId: string;
    className: string;
    startNodeId: string;
    clusters: { id: string; name: string; nodeIds: string[] }[];
    nodes: SkillTreeNodeDef[];
    edges?: { from: string; to: string }[];
}

export interface ItemDef {
    id: string;
    name: string;
    kind: ItemKind;
    desc?: string;
    grade?: ItemGrade;
    slot?: string;
    stats?: Record<string, number>;
    /** 보스 전용 장비: 최저 출처 지역 등급(1~). 드랍 시 세이브의 itemEquipTier와 max */
    equipTier?: number;
    [key: string]: unknown;
}

export interface DropRow {
    itemId: string;
    chance: number;
    minQty?: number;
    maxQty?: number;
}

export type RelicGrade = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type RelicGachaGrade = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface RelicDef {
    id: string;
    name: string;
    grade?: RelicGrade;
    desc?: string;
    specials?: Record<string, number>;
}

export interface RelicShopEntry {
    relicId: string;
    price?: number;
    cost?: number;
    goldCost?: number;
}

export interface RelicGachaModeDef {
    goldCost?: number;
    tenPullGoldCost?: number;
    tokenCost?: number;
    tenPullTokenCost?: number;
    gradeRates: Partial<Record<RelicGachaGrade, number>>;
    poolByGrade: Partial<Record<RelicGachaGrade, string[]>>;
    pity?: {
        every: number;
        guaranteedGrade: RelicGachaGrade;
    };
}

export interface RelicGachaDef {
    maxRelicLevel: number;
    talentDrop?: {
        field?: {
            chanceByTier?: Record<string, number>;
            min?: number;
            max?: number;
        };
        boss?: {
            amountByTier?: Record<string, number>;
        };
    };
    levelScaling?: {
        perLevel?: Record<string, number>;
        caps?: Record<string, number>;
    };
    normal: RelicGachaModeDef;
    premium: RelicGachaModeDef;
}

export interface GameData {
    regions: Record<string, RegionDef>;
    bossDungeon?: { entries: BossDungeonEntry[] };
    avatars?: {
        list: AvatarEntry[];
        defaultSelectedId?: string;
        defaultUnlockedIds?: string[];
    };
    monsters: MonsterDef[];
    monsterCompendium?: {
        source?: string;
        archived: MonsterCompendiumEntry[];
    };
    skills: Record<string, SkillDef>;
    monsterSkillTrees: Record<string, MonsterSkillTreeDef>;
    skillTrees: Record<string, SkillTreeDef>;
    items: Record<string, ItemDef>;
    dropTables: Record<string, DropRow[]>;
    bossExclusiveDropTables: Record<string, DropRow[]>;
    worshipVerses: unknown[];
    smithing: Record<string, unknown>;
    relics: Record<string, RelicDef>;
    relicShops: Record<string, RelicShopEntry[]>;
    relicGacha?: RelicGachaDef;
    shops: Record<string, { itemId?: string; goldCost?: number; stock?: number }[]>;
    meta: GameDataMeta;
}

declare global {
    interface Window {
        GAME_DATA: GameData;
        GAME_DATA_META?: GameDataMeta;
    }
}

export {};
