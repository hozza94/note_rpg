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
    [key: string]: unknown;
}

export interface DropRow {
    itemId: string;
    chance: number;
    minQty?: number;
    maxQty?: number;
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
    skills: Record<string, SkillDef>;
    monsterSkillTrees: Record<string, MonsterSkillTreeDef>;
    skillTrees: Record<string, SkillTreeDef>;
    items: Record<string, ItemDef>;
    dropTables: Record<string, DropRow[]>;
    bossExclusiveDropTables: Record<string, DropRow[]>;
    worshipVerses: unknown[];
    smithing: Record<string, unknown>;
    relics: Record<string, { id: string; name: string; grade?: string; desc?: string; specials?: Record<string, unknown> }>;
    relicShops: Record<string, { relicId: string; cost?: number; goldCost?: number }[]>;
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
