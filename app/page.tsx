"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createGameAudio, type AttackSound, type GameSound } from "./game-audio";
import HiddenWaveIntro from "./hidden-wave-intro";
import { LOCALE_LABEL, LOCALE_ORDER, MONSTER_NAMES, TRAITS, TUTORIALS, UI, roleCopy, term, type Locale } from "./i18n";
type Suit = "spade" | "heart" | "diamond" | "club";
type Category = "high" | "pair" | "twoPair" | "triple" | "straight" | "flush" | "fullHouse" | "fourKind" | "straightFlush" | "royalFlush" | "fiveKind" | "sixKind" | "sevenKind";
type Tier = 1 | 2 | 3;
type Card = {
    id: string;
    rank: number;
    suit: Suit;
    joker?: "black" | "color" | "invert";
};
type Result = {
    category: Category;
    label: string;
    job: string;
    image: string;
    tier: Tier | null;
    tierLabel: string;
    powerRank: number;
    damage: number;
    range: number;
    speed: number;
    effect: "single" | "alchemy" | "globalDot" | "purge" | "jackpot" | "ending";
    bestCardIds: string[];
};
type Unit = Result & {
    id: string;
};
type Tower = Unit & {
    slot: number;
};
type Enemy = {
    id: number;
    progress: number;
    hp: number;
    maxHp: number;
    boss: boolean;
    bossRank?: number;
    bossDeadline?: number;
    hidden?: boolean;
    image?: string;
    kind: number;
    palette: number;
    name: string;
    color: string;
    speed: number;
    reward: number;
    marked?: boolean;
    markExpiresAt?: number;
    slowed?: boolean;
    cursed?: boolean;
    hitPulse?: boolean;
    hitKind?: "direct" | "alchemyDot" | "fateDot";
};
type HitFx = {
    id: string;
    x: number;
    y: number;
    amount: number;
    critical: boolean;
};
type AttackFx = {
    id: string;
    towerId: string;
    expiresAt: number;
    category: Category;
    x: number;
    y: number;
    tx: number;
    ty: number;
    radius: number;
};
type AlchemyPool = {
    id: string;
    x: number;
    y: number;
    radius: number;
    expiresAt: number;
    damage: number;
    slow: number;
};
const T_BASE = {
    brand: "\uD3EC\uCEE4 \uB79C\uB364 \uB514\uD39C\uC2A4", high: "\uD558\uC774 \uCE74\uB4DC", pair: "\uC6D0 \uD398\uC5B4", twoPair: "\uD22C \uD398\uC5B4", triple: "\uD2B8\uB9AC\uD50C", straight: "\uC2A4\uD2B8\uB808\uC774\uD2B8", flush: "\uD50C\uB7EC\uC2DC", fullHouse: "\uD480\uD558\uC6B0\uC2A4", fourKind: "\uD3EC\uCE74\uB4DC", straightFlush: "\uC2A4\uD2B8\uB808\uC774\uD2B8 \uD50C\uB7EC\uC2DC", royalFlush: "\uB85C\uC5F4 \uD50C\uB7EC\uC2DC", fiveKind: "\uD30C\uC774\uBE0C \uCE74\uB4DC", sixKind: "식스 카드", sevenKind: "세븐 카드",
    beginner: "\uCD08\uAE09", middle: "\uC911\uAE09", elite: "\uC815\uC608", legend: "\uC804\uC124", transcendent: "\uCD08\uC6D4", unique: "\uD2B9\uC218",
    conscript: "\uC9D5\uC9D1\uBCD1", rogue: "\uB3C4\uC801", warrior: "\uC804\uC0AC", mage: "\uB9C8\uB3C4\uC0AC", elf: "\uAD81\uC218", priest: "\uC0AC\uC81C", alchemist: "\uC5F0\uAE08\uC220\uC0AC", royal: "\uC655\uC2E4 \uAE30\uC0AC", dragoon: "\uC6A9\uAE30\uC0AC", fate: "\uC6B4\uBA85\uC220\uC0AC", saintess: "\uC131\uB140", jackpot: "황금 잭팟", mystery: "???",
    hand: "\uC6B4\uBA85\uC758 \uC190\uD328", hint: "\uAD50\uCCB4\uD560 \uCE74\uB4DC\uB97C \uC120\uD0DD\uD558\uC138\uC694", recruit: "\uC871\uBCF4 \uD655\uC815 & \uC18C\uD658", redraw: "\uC120\uD0DD \uCE74\uB4DC \uAD50\uCCB4", start: "\uC6E8\uC774\uBE0C \uC2DC\uC791", pause: "\uC77C\uC2DC \uC815\uC9C0", noSelection: "\uAD50\uCCB4\uD560 \uCE74\uB4DC\uB97C \uC120\uD0DD\uD558\uC138\uC694", noGold: "\uACE8\uB4DC\uAC00 \uBD80\uC871\uD569\uB2C8\uB2E4", full: "\uC804\uC7A5\uC774 \uAC00\uB4DD \uCC3C\uC2B5\uB2C8\uB2E4", summoned: " \uC18C\uD658 \uC644\uB8CC", rerolled: "\uC120\uD0DD\uD55C \uCE74\uB4DC\uB97C \uAD50\uCCB4\uD588\uC2B5\uB2C8\uB2E4",
    next: "\uB2E4\uC74C \uC2B5\uACA9 \uB300\uAE30 \uC911", raiding: "\uD574\uACE8 \uC57D\uD0C8\uB300 \uC9C4\uACA9 \uC911", kills: "\uCC98\uCE58", attack: "\uACF5\uACA9", range: "\uBC94\uC704", speed: "\uC18D\uB3C4", alchemyEffect: "\uBC94\uC704 \uACF5\uACA9 + \uAC15\uB825\uD55C \uC2AC\uB85C\uC6B0 + \uC7A5\uD310 \uC9C0\uC18D \uD53C\uD574", fateEffect: "\uB9F5 \uC804\uCCB4 \uC9C0\uC18D \uD53C\uD574", purgeEffect: "\uC18C\uD658 \uC989\uC2DC \uBAA8\uB4E0 \uC801 \uC18C\uBA78", guide: "\uC871\uBCF4\uBCC4 \uC18C\uD658 \uC9C1\uC5C5", open: "\uD3BC\uCCD0 \uBCF4\uAE30", gameOver: "\uC131\uCC44 \uD568\uB77D", retry: "\uB2E4\uC2DC \uBC29\uC5B4\uD558\uAE30", enemies: "\uBA85\uC758 \uC57D\uD0C8\uC790\uB97C \uCC98\uCE58\uD588\uC2B5\uB2C8\uB2E4.",
};
let activeLocale: Locale = "ko";
const T = new Proxy(T_BASE, { get(target, property: keyof typeof T_BASE) { return term(activeLocale, target[property]); } });
const SUITS: Suit[] = ["spade", "heart", "diamond", "club"];
const SYMBOL: Record<Suit, string> = { spade: "\u2660", heart: "\u2665", diamond: "\u2666", club: "\u2663" };
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PIP_POSITIONS: Record<number, Array<[number, number]>> = {
    1: [[2, 2]], 2: [[1, 2], [4, 2]], 3: [[1, 2], [2, 2], [4, 2]],
    4: [[1, 1], [1, 3], [4, 1], [4, 3]], 5: [[1, 1], [1, 3], [2, 2], [4, 1], [4, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [4, 1], [4, 3]], 7: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 2], [4, 1], [4, 3]],
    8: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3], [4, 1], [4, 3]],
    9: [[1, 1], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 3], [4, 1], [4, 3]],
    10: [[1, 1], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3], [4, 1], [4, 3]],
};
const RANGE_PER_CELL = 100 / 12;
const ALCHEMY_POOL_RADIUS = 10;
const MAGE_BLAST_RADIUS = RANGE_PER_CELL * 2.5;
function cardCenter(card: Card) { if (card.joker)
    return <img className={`court-art joker-art joker-art-${card.joker}`} src={`${ASSET_BASE}/sprites/royal-jester.png`} alt={card.joker === "color" ? "컬러 광대" : card.joker === "invert" ? "반전 광대" : "흑백 광대"}/>; if (card.rank >= 11 && card.rank <= 13) {
    const filename = card.rank === 11 ? "jack" : card.rank === 12 ? "queen" : "king";
    const courtName = card.rank === 11 ? "Jack" : card.rank === 12 ? "Queen" : "King";
    return <><img className={`court-art court-${card.suit}`} src={`${ASSET_BASE}/sprites/cards/${filename}.png`} alt={`${SYMBOL[card.suit]} ${courtName}`}/><i className={`court-suit ${card.suit === "heart" || card.suit === "diamond" ? "red-pips" : ""}`} aria-hidden="true">{SYMBOL[card.suit]}</i></>;
} const pipCount = card.rank === 14 ? 1 : card.rank, positions = PIP_POSITIONS[pipCount] || PIP_POSITIONS[1]; return <span className={`pip-layout ${card.suit === "heart" || card.suit === "diamond" ? "red-pips" : ""}`}>{positions.map(([row, column], index) => <i key={index} style={{ gridRow: row, gridColumn: column }}>{SYMBOL[card.suit]}</i>)}</span>; }
const JOBS: Record<Category, {
    label: string;
    job: string;
    image: string;
    base: [
        number,
        number,
        number
    ];
}> = {
    high: { label: T.high, job: T.conscript, image: `${ASSET_BASE}/sprites/units/2.png`, base: [3, RANGE_PER_CELL * 3, 1] }, pair: { label: T.pair, job: T.rogue, image: `${ASSET_BASE}/sprites/units/3.png`, base: [5, RANGE_PER_CELL * 3, 1.35] }, twoPair: { label: T.twoPair, job: T.warrior, image: `${ASSET_BASE}/sprites/units/4.png`, base: [16, RANGE_PER_CELL * 2, 1.05] }, triple: { label: T.triple, job: T.mage, image: `${ASSET_BASE}/sprites/units/10.png`, base: [257.4, RANGE_PER_CELL * 4, .1] }, straight: { label: T.straight, job: T.elf, image: `${ASSET_BASE}/sprites/units/7.png`, base: [46.8, RANGE_PER_CELL * 6, .5] }, flush: { label: T.flush, job: T.alchemist, image: `${ASSET_BASE}/sprites/units/6.png`, base: [110, RANGE_PER_CELL * 2, .5] }, fullHouse: { label: T.fullHouse, job: T.priest, image: `${ASSET_BASE}/sprites/units/Q.png`, base: [65.76, RANGE_PER_CELL * 4, .65] }, fourKind: { label: T.fourKind, job: T.royal, image: `${ASSET_BASE}/sprites/units/K.png`, base: [71.775, RANGE_PER_CELL * 3, 1.15] }, straightFlush: { label: T.straightFlush, job: T.dragoon, image: `${ASSET_BASE}/sprites/units/A.png`, base: [224.4, RANGE_PER_CELL * 5, .732] }, royalFlush: { label: T.royalFlush, job: T.fate, image: `${ASSET_BASE}/sprites/units/J.png`, base: [140, 100, 1.4] }, fiveKind: { label: T.fiveKind, job: T.saintess, image: `${ASSET_BASE}/sprites/units/Joker.png`, base: [0, 0, 0] }, sixKind: { label: T.sixKind, job: T.jackpot, image: `${ASSET_BASE}/sprites/units/Jackpot.png`, base: [0, 0, 0] }, sevenKind: { label: T.sevenKind, job: T.mystery, image: `${ASSET_BASE}/sprites/units/Joker.png`, base: [0, 0, 0] },
};
const UNIT_GLYPH: Record<Category, string> = {
    high: "징", pair: "도", twoPair: "전", triple: "마", straight: "궁", flush: "연", fullHouse: "사",
    fourKind: "왕", straightFlush: "용", royalFlush: "운", fiveKind: "성", sixKind: "$", sevenKind: "?",
};
const GRID_SIZE = 12;
const VISIBLE_MAX_WAVE = 200;
const HIDDEN_WAVE = 201;
const MAX_WAVE = HIDDEN_WAVE;
const HIDDEN_BOSS_HP = 5000000;
const HIDDEN_BOSS_IMAGE = `${ASSET_BASE}/sprites/enemies/hidden-demon-lord.png`;
const MAX_MONSTER_HP_MULTIPLIER = 2;
const NORMAL_MONSTER_HP_MULTIPLIER = 1.5;
const MAX_ATTACK_SPEED_LEVEL = 30;
const APP_VERSION = "v0.2011";
const BALANCE = { baseHp: 100, hpPerWave: .04, hpGrowth: 1.028, baseSpeed: .76, speedPerWave: .003, maxSpeed: 1.55, damageScale: .24, bossMoveScale: .58, spawnInterval: 600 } as const;
const NORMAL_HP_DIFFICULTY_STEPS = [[10, 1.3983], [20, 1.601], [30, 1.9387], [40, 2.4891], [50, 3.2002], [60, 3.7484], [70, 4.1104], [80, 4.2995], [90, 4.2814], [100, 4.1578], [110, 4.9272], [120, 5.0028], [130, 5.0434], [140, 5.0998], [150, 5.1259], [160, 5.1645], [170, 5.1768], [180, 5.1671], [190, 5.0801], [200, 4.9316]] as const;
const BOSS_HP_BY_WAVE: Record<number, number> = { 10: 27000, 20: 48000, 30: 85000, 40: 145000, 50: 233000, 60: 336000, 70: 440000, 80: 556000, 90: 708000, 100: 996000, 110: 1080000, 120: 1160000, 130: 1250000, 140: 1370000, 150: 1500000, 160: 1600000, 170: 1700000, 180: 1800000, 190: 1900000, 200: 2000000 };
const SLOTS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({ x: ((index % GRID_SIZE) + .5) / GRID_SIZE * 100, y: (Math.floor(index / GRID_SIZE) + .5) / GRID_SIZE * 100 }));
function priestBuffStacks(_tower: Tower, towers: Tower[]) {
    return towers.filter(priest => priest.category === "fullHouse").length;
}
function priestAttackBuff(towers: Tower[]) {
    return towers.reduce((total, priest) => priest.category !== "fullHouse" ? total : total + (priest.tier === 1 ? .15 : priest.tier === 2 ? .25 : .4), 0);
}
function conscriptBuffStacks(tower: Tower, towers: Tower[]) {
    if (tower.category !== "high")
        return 0;
    return Math.max(0, towers.filter(unit => unit.category === "high").length - 1);
}
const PATH = [{ x: 50, y: 12.5 }, { x: 87.5, y: 12.5 }, { x: 87.5, y: 87.5 }, { x: 12.5, y: 87.5 }, { x: 12.5, y: 12.5 }, { x: 50, y: 12.5 }];
function isPathSlot(index: number) { const row = Math.floor(index / GRID_SIZE), col = index % GRID_SIZE; return (row === 1 || row === 10) && col >= 1 && col <= 10 || (col === 1 || col === 10) && row >= 1 && row <= 10; }
const MONSTERS = [
    { name: "이끼 슬라임", hp: 1, speed: .85 }, { name: "동굴 박쥐", hp: .7, speed: 1.25 }, { name: "고블린 정찰병", hp: .9, speed: 1.05 }, { name: "해골 병사", hp: 1.1, speed: .9 }, { name: "검은 늑대", hp: .8, speed: 1.3 },
    { name: "독버섯", hp: 1.45, speed: .65 }, { name: "불꽃 임프", hp: .85, speed: 1.2 }, { name: "복면 도적", hp: 1, speed: 1.1 }, { name: "철갑 오크", hp: 1.55, speed: .72 }, { name: "창백한 유령", hp: 1.1, speed: 1 },
    { name: "거대 거미", hp: .9, speed: 1.28 }, { name: "늪지 리자드맨", hp: 1.35, speed: .82 }, { name: "보물 미믹", hp: 1.8, speed: .62 }, { name: "석상 가고일", hp: 1.7, speed: .68 }, { name: "가면 교단원", hp: 1.15, speed: 1.02 },
    { name: "룬 골렘", hp: 2, speed: .52 }, { name: "미노타우로스", hp: 2, speed: .68 }, { name: "흑기사", hp: 2, speed: .6 }, { name: "어린 와이번", hp: 1.5, speed: 1.05 }, { name: "뿔 달린 악마", hp: 2, speed: .58 },
].map(monster => ({ ...monster, 0: monster.name, 1: "transparent" }));
function monsterKindForWave(wave: number) { const completedBosses = Math.floor((wave - 1) / 10), normalOrdinal = wave - 1 - completedBosses; return ((normalOrdinal % MONSTERS.length) + MONSTERS.length) % MONSTERS.length; }
function monsterPaletteForWave(wave: number) { const completedBosses = Math.floor((wave - 1) / 10), normalOrdinal = Math.max(0, wave - 1 - completedBosses); return Math.floor(normalOrdinal / MONSTERS.length) % 8; }
function monsterTrait(monster: (typeof MONSTERS)[number] & { locale?: Locale }) { const traits = TRAITS[monster.locale || "ko"]; return monster.hp >= 1.6 ? traits.heavy : monster.speed >= 1.18 ? traits.fast : monster.hp >= 1.3 ? traits.tough : monster.speed <= .7 ? traits.slow : traits.balanced; }
function hpDifficultyForWave(wave: number) { const upperIndex = NORMAL_HP_DIFFICULTY_STEPS.findIndex(([endWave]) => wave <= endWave); if (upperIndex < 0) return NORMAL_HP_DIFFICULTY_STEPS[NORMAL_HP_DIFFICULTY_STEPS.length - 1][1]; if (upperIndex === 0) return NORMAL_HP_DIFFICULTY_STEPS[0][1]; const [lowerWave, lowerMultiplier] = NORMAL_HP_DIFFICULTY_STEPS[upperIndex - 1], [upperWave, upperMultiplier] = NORMAL_HP_DIFFICULTY_STEPS[upperIndex]; const progress = (wave - lowerWave) / (upperWave - lowerWave); return lowerMultiplier + (upperMultiplier - lowerMultiplier) * progress; }
function baseHpForWave(wave: number) { const earlyGrowthWaves = Math.min(wave, 100) - 1, lateGrowthWaves = Math.max(0, wave - 100); return BALANCE.baseHp * (1 + wave * BALANCE.hpPerWave) * Math.pow(BALANCE.hpGrowth, earlyGrowthWaves) * Math.pow(1.005, lateGrowthWaves) * hpDifficultyForWave(wave); }
function normalMonsterHpScaleForWave(wave: number) { return wave >= 90 ? .9 : 1; }
function lateNormalMonsterHpScaleForWave(wave: number) { const progress = Math.max(0, Math.min(1, (wave - 101) / (199 - 101))); return 1 + 2 * Math.pow(progress, 1.15); }
function bossHpScaleForWave(wave: number) { return wave < 50 ? 1 : 1 + 2 * Math.min(1, (wave - 50) / (HIDDEN_WAVE - 50)); }
function lateBossHpScaleForWave(wave: number) { const progress = Math.max(0, Math.min(1, (wave - 101) / (HIDDEN_WAVE - 101))); return 1 + .2 * Math.pow(progress, 1.35); }
function bossHpForWave(wave: number) { const baseHp = wave === HIDDEN_WAVE ? HIDDEN_BOSS_HP : BOSS_HP_BY_WAVE[wave] ?? BOSS_HP_BY_WAVE[VISIBLE_MAX_WAVE]; return Math.round(baseHp * bossHpScaleForWave(wave) * lateBossHpScaleForWave(wave)); }
function spawnIntervalForWave(_wave: number) { return BALANCE.spawnInterval; }
function goldPerKillForWave(_wave: number) { return 1; }
function formatTimer(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
const SELL_VALUES: Record<Category, [
    number,
    number,
    number
] | number> = { high: [2, 3, 4], pair: [3, 5, 7], twoPair: [5, 8, 11], triple: [10, 13, 15], straight: [15, 17, 20], flush: [20, 30, 40], fullHouse: [25, 35, 50], fourKind: 100, straightFlush: 200, royalFlush: 350, fiveKind: 500, sixKind: 0, sevenKind: 0 };
function sellValue(unit: Result) { const value = SELL_VALUES[unit.category]; return typeof value === "number" ? value : value[(unit.tier || 1) - 1]; }
const STARTING_HAND: Card[] = [{ id: "s1", rank: 2, suit: "spade" }, { id: "s2", rank: 2, suit: "heart" }, { id: "s3", rank: 5, suit: "diamond" }, { id: "s4", rank: 5, suit: "club" }, { id: "s5", rank: 9, suit: "spade" }, { id: "s6", rank: 11, suit: "diamond" }, { id: "s7", rank: 13, suit: "club" }];
function rankLabel(rank: number) { return rank === 15 ? "JOKER" : rank === 14 ? "A" : rank === 13 ? "K" : rank === 12 ? "Q" : rank === 11 ? "J" : String(rank); }
function shuffled<T>(items: T[]) { const result = [...items]; for (let index = result.length - 1; index > 0; index--) { const swapIndex = Math.floor(Math.random() * (index + 1)); [result[index], result[swapIndex]] = [result[swapIndex], result[index]]; } return result; }
function cardKey(card: Card) { return card.rank === 15 ? `joker-${card.joker}` : `${card.rank}-${card.suit}`; }
function buildDeck(prefix = "deck") { const deck: Card[] = []; for (let rank = 2; rank <= 14; rank++)
    for (const suit of SUITS)
        deck.push({ id: `${prefix}-${rank}-${suit}`, rank, suit }); deck.push({ id: `${prefix}-joker-black`, rank: 15, suit: "spade", joker: "black" }, { id: `${prefix}-joker-color`, rank: 15, suit: "heart", joker: "color" }, { id: `${prefix}-joker-invert`, rank: 15, suit: "diamond", joker: "invert" }); return deck; }
function dealHand(): Card[] { return shuffled(buildDeck(`deal-${Date.now()}`)).slice(0, 7).map((card, index) => ({ ...card, id: `${card.id}-${index}-${Math.random().toString(36).slice(2)}` })); }
function drawFromDeck(count: number, kept: Card[]) { const excluded = new Set(kept.map(cardKey)); return shuffled(buildDeck(`draw-${Date.now()}`).filter(card => !excluded.has(cardKey(card)))).slice(0, count).map((card, index) => ({ ...card, id: `${card.id}-${index}-${Math.random().toString(36).slice(2)}` })); }
function pointOnPath(progress: number) { const loop = ((progress % 1) + 1) % 1, p = loop * (PATH.length - 1), i = Math.min(PATH.length - 2, Math.floor(p)), t = p - i; return { x: PATH[i].x + (PATH[i + 1].x - PATH[i].x) * t, y: PATH[i].y + (PATH[i + 1].y - PATH[i].y) * t }; }
function tierFor(category: Category, power: number): Tier | null { if (category === "royalFlush" || category === "fiveKind" || category === "sixKind" || category === "sevenKind")
    return null; if (category === "fourKind" || category === "straightFlush")
    return 3; const first = category === "high" ? 8 : 6, second = category === "high" ? 11 : 10; return power <= first ? 1 : power <= second ? 2 : 3; }
function baseEvaluation(cards: Card[]): {
    category: Category;
    power: number;
    score: number;
} {
    const ranks = cards.map(c => c.rank).sort((a, b) => a - b), countsMap = ranks.reduce<Record<number, number>>((m, r) => ({ ...m, [r]: (m[r] || 0) + 1 }), {}), groups = Object.entries(countsMap).map(([rank, count]) => ({ rank: Number(rank), count })).sort((a, b) => b.count - a.count || b.rank - a.rank), flush = cards.every(c => c.suit === cards[0].suit), straight = new Set(ranks).size === 5 && (ranks[4] - ranks[0] === 4 || ranks.join(",") === "2,3,4,5,14"), straightHigh = ranks.join(",") === "2,3,4,5,14" ? 5 : ranks[4];
    let category: Category = "high", power = ranks[4], weight = 0;
    if (flush && straight) {
        category = straightHigh === 14 && ranks[0] === 10 ? "royalFlush" : "straightFlush";
        power = straightHigh;
        weight = category === "royalFlush" ? 9 : 8;
    }
    else if (groups[0].count === 4) {
        category = "fourKind";
        power = groups[0].rank;
        weight = 7;
    }
    else if (groups[0].count === 3 && groups[1]?.count === 2) {
        category = "fullHouse";
        power = groups[0].rank;
        weight = 6;
    }
    else if (flush) {
        category = "flush";
        weight = 5;
    }
    else if (straight) {
        category = "straight";
        power = straightHigh;
        weight = 4;
    }
    else if (groups[0].count === 3) {
        category = "triple";
        power = groups[0].rank;
        weight = 3;
    }
    else if (groups[0].count === 2 && groups[1]?.count === 2) {
        category = "twoPair";
        power = Math.max(groups[0].rank, groups[1].rank);
        weight = 2;
    }
    else if (groups[0].count === 2) {
        category = "pair";
        power = groups[0].rank;
        weight = 1;
    }
    return { category, power, score: weight * 1000000 + power * 10000 + ranks.reduce((s, r) => s + r, 0) };
}
function evaluateFive(cards: Card[]) { const jokers = cards.filter(card => card.rank === 15), normal = cards.filter(card => card.rank !== 15), counts = normal.reduce<Record<number, number>>((map, card) => ({ ...map, [card.rank]: (map[card.rank] || 0) + 1 }), {}), fiveRank = Object.entries(counts).find(([, count]) => count + jokers.length >= 5); if (fiveRank)
    return { category: "fiveKind" as Category, power: Number(fiveRank[0]), score: 10000000 + Number(fiveRank[0]) }; if (jokers.length === 3) {
    const sameSuit = normal.length > 0 && normal.every(card => card.suit === normal[0].suit), ranks = new Set(normal.map(card => card.rank)), royal = [10, 11, 12, 13, 14];
    if (sameSuit && [...ranks].every(rank => royal.includes(rank)))
        return { category: "royalFlush" as Category, power: 14, score: 9014000 };
    const windows = [[14, 2, 3, 4, 5], ...Array.from({ length: 9 }, (_, start) => Array.from({ length: 5 }, (__, offset) => start + offset + 2))], straightHigh = sameSuit ? windows.map((window, index) => ({ window, high: index === 0 ? 5 : window[4] })).filter(({ window }) => [...ranks].every(rank => window.includes(rank))).sort((a, b) => b.high - a.high)[0]?.high : undefined;
    if (straightHigh)
        return { category: "straightFlush" as Category, power: straightHigh, score: 8000000 + straightHigh * 10000 };
    const power = Math.max(...normal.map(card => card.rank));
    return { category: "fourKind" as Category, power, score: 7000000 + power * 10000 };
} if (!jokers.length)
    return baseEvaluation(cards); let best: {
    category: Category;
    power: number;
    score: number;
} = { category: "high", power: 2, score: 0 }; const replacements: Card[] = []; function search(index: number) { if (index === jokers.length) {
    const candidate = baseEvaluation([...normal, ...replacements]);
    if (candidate.score > best.score)
        best = candidate;
    return;
} for (let rank = 2; rank <= 14; rank++)
    for (const suit of SUITS) {
        replacements[index] = { id: `wild-${index}`, rank, suit };
        search(index + 1);
    } } search(0); return best; }
function fiveCardSets(cards: Card[]) { const sets: Card[][] = []; for (let a = 0; a < cards.length - 4; a++)
    for (let b = a + 1; b < cards.length - 3; b++)
        for (let c = b + 1; c < cards.length - 2; c++)
            for (let d = c + 1; d < cards.length - 1; d++)
                for (let e = d + 1; e < cards.length; e++)
                    sets.push([cards[a], cards[b], cards[c], cards[d], cards[e]]); return sets; }
function evaluate(cards: Card[]): Result {
    const jokers = cards.filter(card => card.rank === 15), rankCounts = cards.filter(card => card.rank !== 15).reduce<Record<number, number>>((map, card) => ({ ...map, [card.rank]: (map[card.rank] || 0) + 1 }), {}), sevenEntry = jokers.length === 3 ? Object.entries(rankCounts).find(([, count]) => count === 4) : undefined, sixEntry = sevenEntry ? undefined : Object.entries(rankCounts).find(([, count]) => count + jokers.length >= 6);
    let best: {
        category: Category;
        power: number;
        score: number;
    } = { category: "high", power: 2, score: 0 }, bestCards = cards.slice(0, 5);
    if (sevenEntry) {
        best = { category: "sevenKind", power: Number(sevenEntry[0]), score: 12000000 + Number(sevenEntry[0]) };
        bestCards = cards.filter(card => card.rank === 15 || card.rank === best.power);
    }
    else if (sixEntry) {
        best = { category: "sixKind", power: Number(sixEntry[0]), score: 11000000 + Number(sixEntry[0]) };
        bestCards = cards.filter(card => card.rank === 15 || card.rank === best.power);
    }
    else
        for (const subset of fiveCardSets(cards)) {
            const candidate = evaluateFive(subset);
            if (candidate.score > best.score) {
                best = candidate;
                bestCards = subset;
            }
        }
    const job = JOBS[best.category], tier = tierFor(best.category, best.power), damageMult = best.category === "triple" ? tier === 1 ? .765 : tier === 2 ? 1 : tier === 3 ? 1.39 : 1 : tier === 1 ? .85 : tier === 2 ? 1 : tier === 3 ? 1.25 : 1, fixedUtility = best.category === "triple" || best.category === "flush" || best.category === "fullHouse", speedMult = fixedUtility ? 1 : tier === 1 ? .9 : tier === 2 ? 1 : tier === 3 ? 1.12 : 1, legendary = best.category === "fourKind" || best.category === "straightFlush", transcendent = best.category === "royalFlush" || best.category === "fiveKind", tierLabel = legendary ? T.legend : transcendent ? T.transcendent : tier === 1 ? T.beginner : tier === 2 ? T.middle : tier === 3 ? T.elite : T.unique, effect = best.category === "flush" ? "alchemy" : best.category === "royalFlush" ? "globalDot" : best.category === "fiveKind" ? "purge" : best.category === "sixKind" ? "jackpot" : best.category === "sevenKind" ? "ending" : "single";
    return { category: best.category, label: job.label, job: job.job, image: job.image, tier, tierLabel, powerRank: best.power, damage: Math.max(job.base[0] > 0 ? 1 : 0, Math.round(job.base[0] * damageMult)), range: Number(job.base[1].toFixed(2)), speed: Number((job.base[2] * speedMult).toFixed(2)), effect, bestCardIds: bestCards.map(card => card.id) };
}
function roleDescription(unit: Result, locale: Locale = activeLocale) { if (locale !== "ko")
    return roleCopy(locale, unit.category, unit.tier || 3); switch (unit.category) {
    case "high": return "적 처치 시 1G 추가 · 다른 징집병 1기당 공격력 33% 증가";
    case "pair": return "2초간 받는 피해 100% 추가 표식을 남긴다";
    case "twoPair": return "사거리 내 체력이 가장 낮은 적 우선 공격";
    case "triple": return "5초마다 강력한 공격 · 사거리 4칸 · 2.5칸 범위 폭발";
    case "straight": return "장거리 · 치명타 확률 50% · 치명타 피해 5배 · 보스 추가피해 50%";
    case "flush": return "슬로우 및 중독 장판";
    case "fullHouse": return `모든 아군 공격력 ${unit.tier === 1 ? 15 : unit.tier === 2 ? 25 : 40}% 증가`;
    case "fourKind": return "보스 100% 추가피해 · 사거리 3칸";
    case "straightFlush": return "매우 강한 단일 피해 · 사거리 5칸";
    case "royalFlush": return "전역 지속 피해";
    case "fiveKind": return "배치시 전체 적 소멸";
    case "sixKind": return "소환 즉시 5,000G 획득";
    case "sevenKind": return "???";
} }
export default function Home() {
    const [selectedRerollCount, setSelectedRerollCount] = useState(0);
    const [hand, setHand] = useState<Card[]>(STARTING_HAND), [selected, setSelected] = useState<string[]>([]), [inventory, setInventory] = useState<Unit[]>([]), [selectedInventory, setSelectedInventory] = useState<string | null>(null), [towers, setTowers] = useState<Tower[]>([]), [selectedTower, setSelectedTower] = useState<string | null>(null), [saleConfirmId, setSaleConfirmId] = useState<string | null>(null), [enemies, setEnemies] = useState<Enemy[]>([]), [hitFx, setHitFx] = useState<HitFx[]>([]), [attackFx, setAttackFx] = useState<AttackFx[]>([]), [alchemyPools, setAlchemyPools] = useState<AlchemyPool[]>([]), [running, setRunning] = useState(false), [gameOver, setGameOver] = useState(false), [won, setWon] = useState(false), [gold, setGold] = useState(50), [attackLevel, setAttackLevel] = useState(0), [attackSpeedLevel, setAttackSpeedLevel] = useState(0), [wave, setWave] = useState(1), [kills, setKills] = useState(0), [spawned, setSpawned] = useState(0), [cooldown, setCooldown] = useState(0), [message, setMessage] = useState(T.hint), [waveCue, setWaveCue] = useState<string | null>(null), [tutorialStep, setTutorialStep] = useState(0), [soundOn, setSoundOn] = useState(true), [bgmOn, setBgmOn] = useState(false), [settingsOpen, setSettingsOpen] = useState(false), [locale, setLocale] = useState<Locale>("ko"), [languageChosen, setLanguageChosen] = useState(false);
    const [endingActive, setEndingActive] = useState(false), [saintessEndingActive, setSaintessEndingActive] = useState(false), [directEndingActive, setDirectEndingActive] = useState(false), [hiddenIntroActive, setHiddenIntroActive] = useState(false), [gameStarted, setGameStarted] = useState(false), [showMonsterImages, setShowMonsterImages] = useState(true);
    activeLocale = locale;
    const result = useMemo(() => evaluate(hand), [hand, locale]), attackMultiplier = 1 + attackLevel * .025, attackSpeedMultiplier = 1 + attackSpeedLevel * .025, upgradeCost = (attackLevel + 1) * 5, speedUpgradeCost = (attackSpeedLevel + 1) * 5, initialDealRef = useRef(false), lastFxAt = useRef(0), gameAudioRef = useRef<ReturnType<typeof createGameAudio> | null>(null), alchemyPoolsRef = useRef<AlchemyPool[]>([]), alchemyLastCastRef = useRef<Map<string, number>>(new Map()), lastAttackAtRef = useRef<Map<string, number>>(new Map()), selectedPlaced = towers.find(t => t.id === selectedTower);
    const [gameSpeed, setGameSpeed] = useState<1 | 2 | 3>(1), [playbackPaused, setPlaybackPaused] = useState(false), [bossWaveHold, setBossWaveHold] = useState(0), gameClockRef = useRef(0), lastTickAtRef = useRef(0), bossWaveReleaseRef = useRef(0);
    const baseCopy = UI[locale], copy = { ...baseCopy, start: wave === 1 && spawned === 0 ? baseCopy.begin : baseCopy.start, selectedReroll: `${baseCopy.selectedReroll} · ×${selectedRerollCount + 1}`, placeHint: selectedPlaced ? roleDescription(selectedPlaced, locale) : baseCopy.placeHint };
    const selectedInventoryUnit = inventory.find(unit => unit.id === selectedInventory), livingEnemies = enemies.filter(enemy => enemy.hp > 0), liveEnemyCount = livingEnemies.length, activeBosses = livingEnemies.filter(enemy => enemy.boss), population = livingEnemies.reduce((total, enemy) => total + (enemy.boss ? 20 : 1), 0);
    const priestStacks = (tower: Tower) => priestBuffStacks(tower, towers), isPriestBuffed = (tower: Tower) => priestStacks(tower) > 0, selectedPriestStacks = selectedPlaced ? priestStacks(selectedPlaced) : 0;
    const isHiddenWave = wave === HIDDEN_WAVE, waveTarget = isHiddenWave || wave % 10 === 0 ? 1 : 30, remainingToSpawn = Math.max(0, waveTarget - spawned), isBossWave = isHiddenWave || wave % 10 === 0, monsterAppearanceWave = isBossWave ? Math.max(1, Math.min(wave, VISIBLE_MAX_WAVE) - 1) : wave, monsterKind = monsterKindForWave(monsterAppearanceWave), monsterPalette = monsterPaletteForWave(monsterAppearanceWave), monsterBase = MONSTERS[monsterKind];
    const monster = useMemo(() => ({ ...monsterBase, 0: MONSTER_NAMES[locale][monsterKind], locale }), [monsterBase, monsterKind, locale]);
    useEffect(() => { if (initialDealRef.current)
        return; initialDealRef.current = true; setHand(dealHand()); }, []);
    useEffect(() => { document.documentElement.lang = locale; if (languageChosen)
        setMessage(copy.pausedRecruit); }, [locale, languageChosen, copy.pausedRecruit]);
    useEffect(() => { if (!running || gameOver || spawned >= waveTarget || wave > MAX_WAVE)
        return; const timer = window.setInterval(() => { const bossSpawn = isBossWave && spawned === 0, hiddenSpawn = isHiddenWave && bossSpawn, baseMonsterHp = Math.round(baseHpForWave(wave) * Math.min(monster.hp, MAX_MONSTER_HP_MULTIPLIER) * normalMonsterHpScaleForWave(wave) * NORMAL_MONSTER_HP_MULTIPLIER * lateNormalMonsterHpScaleForWave(wave)), hp = bossSpawn ? bossHpForWave(wave) : baseMonsterHp, speed = Math.min(BALANCE.maxSpeed, (BALANCE.baseSpeed + wave * BALANCE.speedPerWave) * monster.speed), reward = goldPerKillForWave(wave) * (bossSpawn ? 20 : 1); if (bossSpawn) {
        bossWaveReleaseRef.current = gameClockRef.current + 60000;
        setBossWaveHold(60);
        gameAudioRef.current?.play("boss");
    } setEnemies(v => [...v, { id: Date.now(), progress: 0, hp, maxHp: hp, boss: bossSpawn, bossRank: bossSpawn ? (hiddenSpawn ? 21 : wave / 10) : undefined, bossDeadline: bossSpawn ? gameClockRef.current + 180000 : undefined, hidden: hiddenSpawn, image: hiddenSpawn ? HIDDEN_BOSS_IMAGE : undefined, kind: monsterKind, palette: monsterPalette, name: hiddenSpawn ? "???" : monster.name, color: "transparent", speed, reward }]); setSpawned(v => v + 1); }, spawnIntervalForWave(wave) / gameSpeed); return () => window.clearInterval(timer); }, [running, wave, gameOver, spawned, waveTarget, isBossWave, isHiddenWave, monster, monsterKind, monsterPalette, gameSpeed]);
    useEffect(() => { if (!running || spawned < waveTarget || wave >= MAX_WAVE || hiddenIntroActive || (isBossWave && bossWaveHold > 0 && wave !== VISIBLE_MAX_WAVE) || (wave === VISIBLE_MAX_WAVE && liveEnemyCount > 0))
        return; if (wave === VISIBLE_MAX_WAVE) { setHiddenIntroActive(true); setMessage(baseCopy.demonArrival); return; } setWave(v => v + 1); setSpawned(0); setMessage(`WAVE ${wave + 1}`); }, [running, spawned, wave, waveTarget, isBossWave, bossWaveHold, liveEnemyCount, hiddenIntroActive, baseCopy.demonArrival]);
    useEffect(() => { if (!hiddenIntroActive)
        return; const timer = window.setTimeout(() => { setWave(HIDDEN_WAVE); setSpawned(0); setHiddenIntroActive(false); }, 1800); return () => window.clearTimeout(timer); }, [hiddenIntroActive]);
    useEffect(() => { if (!running)
        return; setWaveCue(isHiddenWave ? baseCopy.demonArrival : isBossWave ? `BOSS WAVE ${wave}` : `WAVE ${wave}`); const timer = window.setTimeout(() => setWaveCue(null), 1400 / gameSpeed); return () => window.clearTimeout(timer); }, [wave, running, isBossWave, isHiddenWave, gameSpeed, baseCopy.demonArrival]);
    useEffect(() => { document.documentElement.style.setProperty("--game-speed", String(gameSpeed)); document.documentElement.style.setProperty("--enemy-atlas", `url("${ASSET_BASE}/sprites/enemies/monster-atlas.png")`); return () => { document.documentElement.style.setProperty("--game-speed", "1"); document.documentElement.style.removeProperty("--enemy-atlas"); }; }, [gameSpeed]);
    useEffect(() => { document.documentElement.style.setProperty("--selected-priest-stacks", `"✦ ×${selectedPriestStacks}"`); }, [selectedPriestStacks]);
    useEffect(() => { gameAudioRef.current?.setMuted(!soundOn); }, [soundOn]);
    useEffect(() => {
        document.documentElement.classList.toggle("enemy-images-off", !showMonsterImages);
        document.documentElement.style.setProperty("--enemy-wave", `"${wave}"`);
        return () => {
            document.documentElement.classList.remove("enemy-images-off");
            document.documentElement.style.removeProperty("--enemy-wave");
        };
    }, [showMonsterImages, wave]);
    useEffect(() => () => { void gameAudioRef.current?.dispose(); }, []);
    useEffect(() => { if (!running || wave !== HIDDEN_WAVE || spawned < waveTarget || liveEnemyCount > 0 || saintessEndingActive)
        return; setWon(true); setRunning(false); setPlaybackPaused(true); setDirectEndingActive(true); setMessage("ABSOLUTE TRIUMPH"); }, [running, wave, spawned, waveTarget, liveEnemyCount, saintessEndingActive]);
    useEffect(() => { const saintesses = inventory.filter(unit => unit.effect === "purge"); if (wave !== HIDDEN_WAVE || saintesses.length < 5 || saintessEndingActive)
        return; const consumed = new Set(saintesses.slice(0, 5).map(unit => unit.id)); setInventory(units => units.filter(unit => !consumed.has(unit.id))); setSelectedInventory(null); setEnemies([]); setRunning(false); setPlaybackPaused(true); setWon(true); setSaintessEndingActive(true); setMessage("성녀 5기가 마왕을 봉인했습니다"); playSound("saintess"); }, [inventory, wave, saintessEndingActive]);
    useEffect(() => { if (population < 200 || gameOver)
        return; setGameOver(true); setRunning(false); }, [population, gameOver]);
    useEffect(() => {
        if (!running)
            return;
        lastTickAtRef.current = performance.now();
        const timer = window.setInterval(() => setEnemies(current => {
            const realNow = performance.now(), elapsed = Math.min(250, realNow - lastTickAtRef.current), now = gameClockRef.current + elapsed * gameSpeed;
            lastTickAtRef.current = realNow;
            gameClockRef.current = now;
            if (bossWaveReleaseRef.current > 0) {
                const holdRemaining = Math.max(0, bossWaveReleaseRef.current - now);
                setBossWaveHold(Math.ceil(holdRemaining / 1000));
                if (holdRemaining <= 0)
                    bossWaveReleaseRef.current = 0;
            }
            const expiredBoss = current.find(enemy => enemy.boss && enemy.bossDeadline !== undefined && enemy.bossDeadline <= now);
            if (expiredBoss) {
                setMessage(`BOSS TIME OVER · RANK ${expiredBoss.bossRank}`);
                setGameOver(true);
                setRunning(false);
                return current;
            }
            const activePools = alchemyPoolsRef.current.filter(pool => pool.expiresAt > now);
            if (activePools.length !== alchemyPoolsRef.current.length) {
                alchemyPoolsRef.current = activePools;
                setAlchemyPools(activePools);
            }
            let defeated = 0, bossDefeated = 0, earnedGold = 0, bossGold = 0;
            const damageMap = new Map<number, number>(), hitKinds = new Map<number, "direct" | "alchemyDot" | "fateDot">(), slowMap = new Map<number, number>(), criticalHits = new Set<number>(), cursedHits = new Set<number>(), positions = new Map(current.map(enemy => [enemy.id, pointOnPath(enemy.progress)])), enemyHp = new Map(current.map(enemy => [enemy.id, enemy.hp])), conscriptKillBonuses = new Map<number, number>(), markExpirations = new Map(current.filter(enemy => (enemy.markExpiresAt || 0) > now).map(enemy => [enemy.id, enemy.markExpiresAt!])), attackCandidates: AttackFx[] = [];
            const add = (id: number, damage: number, kind: "direct" | "alchemyDot" | "fateDot" = "direct", ownMultiplier = 1, source?: Category) => { const markedMultiplier = markExpirations.has(id) ? 2 : 1, previousDamage = damageMap.get(id) || 0, appliedDamage = damage * markedMultiplier * ownMultiplier; damageMap.set(id, previousDamage + appliedDamage); if (source === "high" && previousDamage < (enemyHp.get(id) || 0) && previousDamage + appliedDamage >= (enemyHp.get(id) || 0)) conscriptKillBonuses.set(id, 1); if (kind === "direct" || !hitKinds.has(id))
                hitKinds.set(id, kind); };
            for (const pool of activePools)
                for (const enemy of current) {
                    const p = positions.get(enemy.id)!;
                    if (Math.hypot(p.x - pool.x, p.y - pool.y) <= pool.radius) {
                        add(enemy.id, pool.damage, "alchemyDot");
                        slowMap.set(enemy.id, Math.min(slowMap.get(enemy.id) || 1, pool.slow));
                    }
                }
            const supportBuff = (tower: Tower) => {
                const priestDamageBuff = priestAttackBuff(towers), conscriptStacks = conscriptBuffStacks(tower, towers);
                return { damage: priestDamageBuff + conscriptStacks * .33, speed: 0 };
            };
            const activeTowerIds = new Set(towers.map(tower => tower.id));
            for (const id of lastAttackAtRef.current.keys())
                if (!activeTowerIds.has(id))
                    lastAttackAtRef.current.delete(id);
            for (const tower of towers) {
                const slot = SLOTS[tower.slot], buff = supportBuff(tower), attackRate = tower.speed * attackSpeedMultiplier * (1 + buff.speed), attackInterval = 500 / Math.max(.01, attackRate), lastAttackAt = lastAttackAtRef.current.get(tower.id) || 0, baseDamage = tower.damage * attackMultiplier * (1 + buff.damage), inRange = current.filter(enemy => { const p = positions.get(enemy.id)!; return Math.hypot(slot.x - p.x, slot.y - p.y) <= tower.range; }).sort((a, b) => b.progress - a.progress);
                if (now - lastAttackAt < attackInterval)
                    continue;
                if (tower.category === "royalFlush") {
                    if (!current.length)
                        continue;
                    lastAttackAtRef.current.set(tower.id, now);
                    const visual = positions.get(current.slice().sort((a, b) => b.progress - a.progress)[0].id)!;
                    attackCandidates.push({ id: `attack-${tower.id}-${now}`, towerId: tower.id, expiresAt: now + 320, category: tower.category, x: slot.x, y: slot.y, tx: visual.x, ty: visual.y, radius: 45 });
                    for (const enemy of current) {
                        add(enemy.id, baseDamage * .82, "fateDot");
                        cursedHits.add(enemy.id);
                    }
                    continue;
                }
                if (!inRange.length)
                    continue;
                lastAttackAtRef.current.set(tower.id, now);
                const visual = positions.get(inRange[0].id)!;
                attackCandidates.push({ id: `attack-${tower.id}-${now}`, towerId: tower.id, expiresAt: now + 320, category: tower.category, x: slot.x, y: slot.y, tx: visual.x, ty: visual.y, radius: tower.category === "triple" ? MAGE_BLAST_RADIUS : tower.category === "flush" ? ALCHEMY_POOL_RADIUS : 5 });
                if (tower.category === "pair") {
                    const target = inRange[0];
                    markExpirations.set(target.id, now + 2000);
                    add(target.id, baseDamage);
                    continue;
                }
                if (tower.category === "twoPair") {
                    const target = inRange.slice().sort((a, b) => a.hp - b.hp || b.progress - a.progress)[0], targetPosition = positions.get(target.id)!;
                    attackCandidates[attackCandidates.length - 1] = { ...attackCandidates[attackCandidates.length - 1], tx: targetPosition.x, ty: targetPosition.y };
                    add(target.id, baseDamage);
                    continue;
                }
                if (tower.category === "triple") {
                    const target = inRange[0], center = positions.get(target.id)!, radius = MAGE_BLAST_RADIUS;
                    for (const enemy of current) {
                        const p = positions.get(enemy.id)!;
                        if (Math.hypot(p.x - center.x, p.y - center.y) <= radius)
                            add(enemy.id, baseDamage);
                    }
                    continue;
                }
                if (tower.category === "straight") {
                    const target = inRange.slice().sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)[0], critical = Math.random() < .5;
                    const targetPosition = positions.get(target.id)!;
                    attackCandidates[attackCandidates.length - 1] = { ...attackCandidates[attackCandidates.length - 1], tx: targetPosition.x, ty: targetPosition.y };
                    add(target.id, baseDamage * (critical ? 5 : 1) * (target.boss ? 1.5 : 1));
                    if (critical)
                        criticalHits.add(target.id);
                    continue;
                }
                if (tower.category === "flush") {
                    const target = inRange[0], center = positions.get(target.id)!;
                    add(target.id, baseDamage * .45);
                    const pool: AlchemyPool = { id: `pool-${tower.id}-${now}`, x: center.x, y: center.y, radius: ALCHEMY_POOL_RADIUS, expiresAt: now + 2000, damage: baseDamage * attackRate * BALANCE.damageScale * .14, slow: .5 }, nextPools = [...alchemyPoolsRef.current, pool];
                    alchemyPoolsRef.current = nextPools;
                    setAlchemyPools(nextPools);
                    continue;
                }
                if (tower.category === "fourKind") {
                    const target = inRange.slice().sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)[0];
                    const targetPosition = positions.get(target.id)!;
                    attackCandidates[attackCandidates.length - 1] = { ...attackCandidates[attackCandidates.length - 1], tx: targetPosition.x, ty: targetPosition.y };
                    add(target.id, baseDamage * (target.boss ? 2 : 1));
                    continue;
                }
                const target = inRange[0];
                add(target.id, baseDamage, "direct", 1, tower.category);
            }
            if (attackCandidates.length || now - lastFxAt.current > 360) {
                lastFxAt.current = now;
                setHitFx([...damageMap.entries()].filter(([, damage]) => damage > .25).slice(0, 10).map(([id, damage], index) => { const p = positions.get(id)!; return { id: `${now}-${id}-${index}`, x: p.x, y: p.y, amount: Math.max(1, Math.round(damage)), critical: criticalHits.has(id) }; }));
            }
            setAttackFx(existing => { const active = existing.filter(fx => fx.expiresAt > now), nextFx = [...active, ...attackCandidates].slice(-160); return nextFx.length === existing.length && !attackCandidates.length ? existing : nextFx; });
            const next = current.map(enemy => { const slow = slowMap.get(enemy.id) || 1, pace = .0046 * enemy.speed * slow * (enemy.boss ? BALANCE.bossMoveScale : 1), damage = damageMap.get(enemy.id) || 0, hitKind = damage > 0 ? (hitKinds.get(enemy.id) || "direct") : undefined, markExpiresAt = markExpirations.get(enemy.id); return { ...enemy, markExpiresAt, marked: !!markExpiresAt && markExpiresAt > now, slowed: slowMap.has(enemy.id), cursed: cursedHits.has(enemy.id), hitKind, hitPulse: hitKind === "direct" ? !enemy.hitPulse : enemy.hitPulse, progress: (enemy.progress + pace) % 1, hp: enemy.hp - damage }; }).filter(enemy => { if (enemy.hp <= 0) {
                defeated++;
                const killBonus = conscriptKillBonuses.get(enemy.id) || 0;
                earnedGold += enemy.reward + killBonus;
                if (enemy.boss) {
                    bossDefeated++;
                    bossGold += enemy.reward + killBonus;
                }
                return false;
            } return true; });
            if (defeated) {
                setGold(v => v + earnedGold);
                setKills(v => v + defeated);
                if (bossDefeated) {
                    setMessage(`BOSS CLEAR +${bossGold}G`);
                }
            }
            return next;
        }), Math.max(30, 120 / gameSpeed));
        return () => { window.clearInterval(timer); lastTickAtRef.current = 0; };
    }, [running, towers, attackMultiplier, attackSpeedMultiplier, gameSpeed]);
    useEffect(() => { if (running)
        return; const timer = window.setTimeout(() => { setHitFx([]); setAttackFx([]); }, 0); return () => window.clearTimeout(timer); }, [running]);
    useEffect(() => { if (!running || !attackFx.length || !soundOn)
        return; const priority: AttackSound[] = ["royalFlush", "straightFlush", "fourKind", "flush", "triple", "straight", "twoPair", "pair", "high", "fullHouse"], category = priority.find(kind => attackFx.some(fx => fx.category === kind)) || "high"; gameAudioRef.current?.playAttack(category); gameAudioRef.current?.play("hit"); }, [attackFx, running, soundOn]);
    useEffect(() => { if (cooldown <= 0 || playbackPaused)
        return; const timer = window.setTimeout(() => { if (cooldown === 1) {
        setHand(dealHand());
        setSelectedRerollCount(0);
        setCooldown(0);
        setMessage(T.hint);
    }
    else
        setCooldown(v => v - 1); }, 1000 / gameSpeed); return () => window.clearTimeout(timer); }, [cooldown, gameSpeed, playbackPaused]);
    function gameAudio() { const audio = gameAudioRef.current || createGameAudio(); gameAudioRef.current = audio; audio.setMuted(!soundOn); return audio; }
    function playSound(sound: GameSound) { if (!soundOn)
        return; const audio = gameAudio(); void audio.unlock().then(unlocked => { if (unlocked)
        audio.play(sound); }); }
    function unlockAudio() { if (!soundOn)
        return; void gameAudio().unlock(); }
    function toggleSound() { const next = !soundOn; setSoundOn(next); const audio = gameAudioRef.current || createGameAudio(); gameAudioRef.current = audio; audio.setMuted(!next); if (next)
        void audio.unlock().then(unlocked => { if (unlocked)
            audio.play("summon"); }); }
    function toggleRunning() { const next = !running; unlockAudio(); setPlaybackPaused(!next); setRunning(next); if (next) {
        setGameStarted(true);
        setMessage("방어전 시작");
    } }
    function cyclePlayback() { unlockAudio(); if (gameOver || won)
        return; if (!gameStarted)
        return; if (playbackPaused || !running) {
        setPlaybackPaused(false); setGameSpeed(1); setRunning(true); setMessage("방어전 시작"); return;
    } if (gameSpeed === 3) {
        setPlaybackPaused(true); setRunning(false); return;
    } setGameSpeed(gameSpeed === 1 ? 2 : 3); }
    function toggle(id: string) { if (cooldown > 0)
        return; setSelected(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]); }
    function redraw() { if (!gameStarted || cooldown > 0)
        return; if (!selected.length) {
        setMessage(T.noSelection);
        return;
    } const cost = selected.length * 5 * (selectedRerollCount + 1); if (gold < cost) {
        setMessage(T.noGold);
        return;
    } const selectedIndexes = hand.flatMap((card, index) => selected.includes(card.id) ? [index] : []), kept = hand.filter(card => !selected.includes(card.id)), replacements = drawFromDeck(selected.length, kept); let replacementIndex = 0; const next = hand.map(card => selected.includes(card.id) ? replacements[replacementIndex++] : card); setGold(v => v - cost); setHand(next); setSelected(selectedIndexes.map(index => next[index].id)); setSelectedRerollCount(v => v + 1); setMessage(T.rerolled); playSound("reroll"); }
    function redrawAll() { if (!gameStarted || cooldown > 0)
        return; if (gold < 10) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - 10); setHand(dealHand()); setSelected([]); setSelectedRerollCount(0); setMessage("전체 손패를 교체했습니다. 선택 카드 교체 비용이 1회차로 초기화되었습니다."); playSound("reroll"); }
    function recruit() { if (!gameStarted || cooldown > 0)
        return; if (!running && !playbackPaused) {
        setMessage("웨이브 진행 중에 다음 유닛을 소환할 수 있습니다");
        return;
    } if (result.effect === "ending") {
        setSelected([]);
        setRunning(false);
        setPlaybackPaused(true);
        setWon(true);
        setEndingActive(true);
        setMessage("???");
        playSound("jackpot");
        return;
    } if (result.effect === "jackpot") {
        setGold(v => v + 5000);
        setMessage("식스 카드 잭팟 +5,000G");
        setSelected([]);
        setCooldown(5);
        playSound("jackpot");
        return;
    } const unit: Unit = { ...result, id: `unit-${Date.now()}` }; setInventory(v => [...v, unit]); setMessage(`${term(locale, result.tierLabel)} ${term(locale, result.job)} 인벤토리 보관`); setSelected([]); setCooldown(5); playSound(result.effect === "purge" ? "saintess" : "summon"); }
    function chooseInventory(id: string) { setSelectedInventory(v => v === id ? null : id); setSelectedTower(null); setSaleConfirmId(null); }
    function confirmRareSale(unit: Unit | Tower) { const protectedUnit = ["fourKind", "straightFlush", "royalFlush", "fiveKind"].includes(unit.category); if (protectedUnit && saleConfirmId !== unit.id) {
        setSaleConfirmId(unit.id);
        setMessage(`${term(locale, unit.job)}은 희귀 유닛입니다. 판매 버튼을 다시 누르면 판매됩니다`);
        return false;
    } setSaleConfirmId(null); return true; }
    function sellInventoryUnit() { if (!selectedInventoryUnit || playbackPaused)
        return; if (!running && wave === 1 && spawned === 0) {
        setMessage("첫 웨이브를 시작한 뒤 유닛을 판매할 수 있습니다");
        return;
    } if (!confirmRareSale(selectedInventoryUnit))
        return; const value = sellValue(selectedInventoryUnit); setInventory(v => v.filter(unit => unit.id !== selectedInventoryUnit.id)); setSelectedInventory(null); setGold(v => v + value); setMessage(`${term(locale, selectedInventoryUnit.job)} ${copy.sell} +${value}G`); playSound("sell"); }
    function useSlot(slot: number) { if (isPathSlot(slot))
        return; const target = towers.find(t => t.slot === slot); if (selectedInventory) {
        const unit = inventory.find(u => u.id === selectedInventory);
        if (!unit) {
            setSelectedInventory(null);
            return;
        }
        if (unit.effect === "purge") {
            if (wave === HIDDEN_WAVE) {
                setSelectedInventory(null);
                setMessage("성녀 한 기의 힘으로는 ???를 소멸시킬 수 없습니다");
                playSound("saintess");
                return;
            }
            const removed = enemies.length, reward = enemies.reduce((sum, enemy) => sum + enemy.reward, 0);
            setEnemies([]);
            setAlchemyPools([]);
            alchemyPoolsRef.current = [];
            setKills(v => v + removed);
            setGold(v => v + reward);
            setInventory(v => v.filter(u => u.id !== unit.id));
            setSelectedInventory(null);
            setMessage(`${term(locale, unit.job)}: ${term(locale, T.purgeEffect)} +${reward}G`);
            playSound("saintess");
            return;
        }
        setTowers(v => [...v.filter(t => t.id !== target?.id), { ...unit, slot }]);
        setInventory(v => [...v.filter(u => u.id !== unit.id), ...(target ? [(({ slot: _, ...stored }) => stored)(target)] : [])]);
        setSelectedInventory(null);
        setMessage(`${term(locale, unit.job)} 배치 완료`);
        return;
    } if (!selectedTower) {
        if (target) {
            setSelectedTower(target.id);
            setMessage(`${term(locale, target.job)} 선택 · 이동할 칸을 고르세요`);
        }
        return;
    } const moving = towers.find(t => t.id === selectedTower); if (!moving) {
        setSelectedTower(null);
        return;
    } if (target?.id === moving.id) {
        setSelectedTower(null);
        setMessage(`${term(locale, moving.job)} 선택 해제`);
        return;
    } setTowers(v => v.map(t => t.id === moving.id ? { ...t, slot } : target && t.id === target.id ? { ...t, slot: moving.slot } : t)); setSelectedTower(null); setMessage(target ? `${term(locale, moving.job)} ↔ ${term(locale, target.job)} 위치 교체` : `${term(locale, moving.job)} 배치 이동`); }
    function recallTower() { const tower = towers.find(t => t.id === selectedTower); if (!tower)
        return; const { slot: _, ...unit } = tower; setTowers(v => v.filter(t => t.id !== tower.id)); setInventory(v => [...v, unit]); setSelectedTower(null); setMessage(`${term(locale, tower.job)} ${copy.recall}`); }
    function sellTower() { const tower = towers.find(t => t.id === selectedTower); if (!tower || playbackPaused)
        return; if (!running && wave === 1 && spawned === 0) {
        setMessage("첫 웨이브를 시작한 뒤 유닛을 판매할 수 있습니다");
        return;
    } if (!confirmRareSale(tower))
        return; const value = sellValue(tower); setTowers(v => v.filter(t => t.id !== tower.id)); setSelectedTower(null); setGold(v => v + value); setMessage(`${term(locale, tower.job)} ${copy.sell} +${value}G`); playSound("sell"); }
    function upgradeAttack() { if (!gameStarted)
        return; if (gold < upgradeCost) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - upgradeCost); setAttackLevel(v => v + 1); setMessage(`전체 공격력 LV.${attackLevel + 1} 강화 완료`); playSound("upgrade"); }
    function upgradeAttackSpeed() { if (!gameStarted)
        return; if (attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL) {
        setMessage("전체 공격속도는 LV.30이 최대입니다.");
        return;
    } if (gold < speedUpgradeCost) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - speedUpgradeCost); setAttackSpeedLevel(v => v + 1); setMessage(`전체 공격속도 LV.${attackSpeedLevel + 1} 강화 완료`); playSound("upgrade"); }
    function restart() { setHand(dealHand()); setSelected([]); setSelectedRerollCount(0); setInventory([]); setSelectedInventory(null); setTowers([]); setSelectedTower(null); setSaleConfirmId(null); setEnemies([]); setHitFx([]); setAttackFx([]); setAlchemyPools([]); alchemyPoolsRef.current = []; alchemyLastCastRef.current.clear(); lastAttackAtRef.current.clear(); lastFxAt.current = 0; gameClockRef.current = 0; lastTickAtRef.current = 0; bossWaveReleaseRef.current = 0; setBossWaveHold(0); setGameSpeed(1); setPlaybackPaused(false); setRunning(false); setGameStarted(false); setGameOver(false); setWon(false); setEndingActive(false); setSaintessEndingActive(false); setDirectEndingActive(false); setHiddenIntroActive(false); setSettingsOpen(false); setGold(50); setAttackLevel(0); setAttackSpeedLevel(0); setWave(1); setKills(0); setSpawned(0); setCooldown(0); setMessage(T.hint); }
    useEffect(() => {
        function handleGameShortcut(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input,textarea,select,[contenteditable='true']"))
                return;
            if (!languageChosen || settingsOpen || tutorialStep < TUTORIALS[locale].length || gameOver || won || endingActive || saintessEndingActive || directEndingActive || hiddenIntroActive)
                return;
            const digit = /^Digit([1-7])$/.exec(event.code);
            if (digit) {
                if (!gameStarted || cooldown > 0)
                    return;
                event.preventDefault();
                toggle(hand[Number(digit[1]) - 1].id);
                return;
            }
            if (!gameStarted)
                return;
            if (event.code === "Space") {
                event.preventDefault();
                recruit();
            }
            else if (event.code === "KeyR") {
                event.preventDefault();
                redrawAll();
            }
            else if (event.code === "KeyD") {
                event.preventDefault();
                if (selectedTower)
                    sellTower();
                else if (selectedInventory)
                    sellInventoryUnit();
            }
            else if (event.code === "BracketLeft") {
                event.preventDefault();
                upgradeAttack();
            }
            else if (event.code === "BracketRight") {
                event.preventDefault();
                upgradeAttackSpeed();
            }
        }
        window.addEventListener("keydown", handleGameShortcut);
        return () => window.removeEventListener("keydown", handleGameShortcut);
    }, [gameStarted, cooldown, hand, languageChosen, settingsOpen, tutorialStep, locale, gameOver, won, endingActive, saintessEndingActive, directEndingActive, hiddenIntroActive, selectedTower, selectedInventory, gold, playbackPaused, running, selected, selectedRerollCount, attackLevel, attackSpeedLevel]);
    const guide: [
        [
            Category,
            string
        ],
        ...Array<[
            Category,
            string
        ]>
    ] = [["high", T.conscript], ["pair", T.rogue], ["twoPair", T.warrior], ["triple", T.mage], ["straight", T.elf], ["flush", T.alchemist], ["fullHouse", T.priest], ["fourKind", T.royal], ["straightFlush", T.dragoon], ["royalFlush", T.fate], ["fiveKind", T.saintess], ["sixKind", T.jackpot], ["sevenKind", T.mystery]];
    const tutorials = TUTORIALS[locale];
    return <main className="game-shell"><section className={`game-frame ${selectedPlaced ? "unit-command-open" : ""}`} aria-label={term(locale, T.brand)}><header className="topbar"><div className="brand-mark">{SYMBOL.spade}</div><div className="brand-copy"><strong>{term(locale, T.brand)}</strong><span>POKER RANDOM DEFENSE</span></div><div className="spawn-counter"><span>{locale === "ko" ? "남은 진입" : locale === "en" ? "TO SPAWN" : locale === "zh" ? "剩余进场" : "残り出現"}</span><b>{remainingToSpawn}</b><i>·</i><span>{locale === "ko" ? "몬스터" : locale === "en" ? "MONSTERS" : locale === "zh" ? "怪物" : "モンスター"}</span><strong>{population}/200</strong>{liveEnemyCount > 0 && <><i>·</i><em className="monster-brief"><span>{isHiddenWave ? "???" : isBossWave ? "BOSS WAVE" : monster[0]}</span><small>{isHiddenWave ? "HIDDEN" : isBossWave ? `RANK ${wave / 10}` : monsterTrait(monster)}</small></em></>}</div><div className="wave-chip"><span>WAVE</span><strong>{isHiddenWave ? "???" : String(wave).padStart(3, "0")}</strong></div><div className="resources"><span className="gold-resource" aria-label={`${gold.toLocaleString()} 골드`}><i className="topbar-coin" aria-hidden="true"/><b>{gold.toLocaleString()}G</b></span><button className="settings-toggle" aria-label="Settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(true)}>⚙</button></div></header>
    <div className="battle-wrap"><div className="battlefield"><div className="forest-noise"/><div className="loop-segment loop-top"/><div className="loop-segment loop-right"/><div className="loop-segment loop-bottom"/><div className="loop-segment loop-left"/><div className="inner-ground"><span>DEFENSE<br />ZONE</span></div>{activeBosses.map(boss => { const p = pointOnPath(boss.progress), secondsLeft = Math.max(0, Math.ceil(((boss.bossDeadline ?? gameClockRef.current) - gameClockRef.current) / 1000)); return <div key={`boss-hud-${boss.id}`} className="boss-health" style={{ left: `${p.x}%`, top: `${p.y}%` }}><em className="boss-timer">BOSS {formatTimer(secondsLeft)}</em><span>RANK {boss.bossRank} · {boss.name}</span><i><b style={{ width: `${Math.max(0, boss.hp / boss.maxHp) * 100}%` }}/></i><strong>{Math.ceil(boss.hp).toLocaleString()}</strong></div>; })}{SLOTS.map((slot, index) => { const tower = towers.find(t => t.slot === index), blocked = isPathSlot(index), targetState = !blocked && (selectedInventory || selectedTower) && tower?.id !== selectedTower ? (tower ? "swap-target" : "move-target") : ""; return <button type="button" key={index} disabled={blocked} aria-label={blocked ? "몬스터 이동로" : tower ? `${tower.job} 배치칸` : `${index + 1}번 빈 배치칸`} onClick={() => useSlot(index)} className={`grid-slot ${blocked ? "blocked" : ""} ${tower ? "tower-slot occupied" : ""} ${tower?.effect || ""} ${tower?.category === "fullHouse" ? "priest-aura" : ""} ${tower && isPriestBuffed(tower) ? "priest-buffed" : ""} ${tower?.id === selectedTower ? "selected" : ""} ${tower && attackFx.some(fx => fx.towerId === tower.id) ? "attacking" : ""} ${targetState}`} style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>{tower ? <><img src={attackFx.some(fx => fx.towerId === tower.id) ? tower.image.replace("/units/", "/units/attack/") : `${tower.image}?idle=1`} alt=""/><span className="unit-glyph" aria-hidden="true">{UNIT_GLYPH[tower.category]}</span><span className={`tier-dot tier-${tower.tier || 3}`}>{term(locale, tower.tierLabel)}</span></> : !blocked && <span className="slot-plus">+</span>}</button>; })}{selectedPlaced && <div className="range-preview" style={{ left: `${SLOTS[selectedPlaced.slot].x}%`, top: `${SLOTS[selectedPlaced.slot].y}%`, width: `${selectedPlaced.range * 2}%` }}/>}{alchemyPools.map(pool => <span key={pool.id} className="alchemy-pool" style={{ left: `${pool.x}%`, top: `${pool.y}%`, width: `${pool.radius * 2}%` }}/>)}{attackFx.map(fx => { const dx = fx.tx - fx.x, dy = fx.ty - fx.y, length = Math.hypot(dx, dy), angle = Math.atan2(dy, dx) * 180 / Math.PI; return <span key={fx.id} className={`attack-fx attack-${fx.category}`}><i className="attack-trace" style={{ left: `${fx.x}%`, top: `${fx.y}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }}/><b className="attack-impact" style={{ left: `${fx.tx}%`, top: `${fx.ty}%`, width: `${fx.radius * 2}%` }}/></span>; })}{enemies.map(e => { const p = pointOnPath(e.progress); return <div key={e.id} title={`${e.boss ? "보스 · " : ""}${e.name} · HP ${Math.ceil(e.hp)}`} className={`enemy palette-${e.palette} ${e.boss ? `boss boss-rank-${e.bossRank}` : ""} ${e.hidden ? "hidden-boss" : ""} ${e.marked ? "marked" : ""} ${e.slowed ? "slowed" : ""} ${e.cursed ? "cursed" : ""} ${e.hitPulse ? "hit-flash-a" : "hit-flash-b"}`} style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: e.color }}>{e.image && <img className="enemy-special-image" src={e.image} alt=""/>}<span className="enemy-face">{e.boss ? "B" : String(e.kind + 1).padStart(2, "0")}</span>{e.boss && <b className="boss-badge">BOSS</b>}{e.marked && <b className="status-mark">!</b>}{e.slowed && <b className="status-slow">*</b>}{e.cursed && <b className="status-curse">◆</b>}<i style={{ width: `${Math.max(0, e.hp / e.maxHp) * 100}%` }}/></div>; })}{hitFx.map(fx => <span key={fx.id} className={`hit-number ${fx.critical ? "critical" : ""}`} style={{ left: `${fx.x}%`, top: `${fx.y}%` }}>{fx.critical ? "CRIT " : "-"}{fx.amount}</span>)}{waveCue && <div className={`wave-cue ${isBossWave ? "boss-cue" : ""}`}>{waveCue}<small>{isBossWave ? copy.bossEquivalent : "30 ENEMIES INCOMING"}</small></div>}{gameStarted && !selectedPlaced && <div className="battle-message" aria-live="polite">{cooldown > 0 ? `NEXT HAND ${cooldown}s` : selectedInventory ? "배치할 칸을 선택하세요" : message}</div>}{selectedPlaced && <aside className="field-unit-actions" aria-label={`${selectedPlaced.job} 조작창`}><button className="command-close" onClick={() => setSelectedTower(null)} aria-label="유닛 선택 해제">×</button><div className="command-unit"><img src={selectedPlaced.image} alt=""/><span><small>{term(locale, selectedPlaced.tierLabel)} · #{selectedPlaced.slot + 1}</small><strong>{term(locale, selectedPlaced.job)}</strong>{isPriestBuffed(selectedPlaced) && <em>사제 버프 적용 중</em>}</span></div><div className="command-stats"><span><small>{copy.attack}</small><b>{Math.round(selectedPlaced.damage * attackMultiplier * 10) / 10}</b></span><span><small>{copy.range}</small><b>{selectedPlaced.range}</b></span><span><small>{copy.speed}</small><b>{(selectedPlaced.speed * attackSpeedMultiplier).toFixed(2)}</b></span></div><p>{copy.placeHint}</p><div className="command-actions"><button onClick={recallTower}>{copy.recall}</button><button className="sell" onClick={sellTower}>{copy.sell} <b>+{sellValue(selectedPlaced)}G</b></button></div></aside>}</div></div>
    <div className={`unit-dock ${selectedInventoryUnit ? "has-selection" : ""}`}><section className={`unit-inventory ${selectedInventoryUnit ? "has-selection" : ""}`}><div className="inventory-title"><strong>{copy.inventory}</strong><span>{inventory.length}</span></div><div className="inventory-list">{inventory.length === 0 ? <p>{copy.emptyInventory}</p> : inventory.map(unit => <button key={unit.id} onClick={() => chooseInventory(unit.id)} className={selectedInventory === unit.id ? "active" : ""}><img src={unit.image} alt=""/><span className="inventory-unit-label">{term(locale, unit.job)} / {unit.effect === "purge" ? copy.use : term(locale, unit.tierLabel)}</span></button>)}</div>{selectedInventoryUnit && <div className="inventory-selection"><img src={selectedInventoryUnit.image} alt=""/><div><strong>{term(locale, selectedInventoryUnit.job)}</strong><small>{term(locale, selectedInventoryUnit.tierLabel)} · {copy.sell} {sellValue(selectedInventoryUnit)}G</small></div><span>{copy.placeHint}</span><button onClick={sellInventoryUnit} aria-label={`${selectedInventoryUnit.job} ${sellValue(selectedInventoryUnit)}골드에 판매`}>{copy.sell} <b>+{sellValue(selectedInventoryUnit)}G</b></button></div>}</section><section className="upgrade-panel" aria-label={`${copy.totalAttack} / ${copy.totalSpeed}`}><strong className="upgrade-title">{copy.totalAttack} / {copy.totalSpeed}</strong><div className="army-upgrade"><div className="upgrade-row"><div><span>{copy.totalAttack}</span><strong>LV.{attackLevel} · +{attackLevel * 2.5}%</strong></div><button disabled={!gameStarted || gold < upgradeCost} onClick={upgradeAttack}><span className="upgrade-action-main">{copy.attackUp} <b>{upgradeCost}G</b></span><small className="upgrade-action-level">LV.{attackLevel} · +{attackLevel * 2.5}%</small></button></div><div className="upgrade-row speed-row"><div><span>{copy.totalSpeed}</span><strong>LV.{attackSpeedLevel} · +{attackSpeedLevel * 2.5}%</strong></div><button disabled={!gameStarted || attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL || gold < speedUpgradeCost} onClick={upgradeAttackSpeed}><span className="upgrade-action-main">{copy.speedUp} <b>{attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL ? "MAX" : `${speedUpgradeCost}G`}</b></span><small className="upgrade-action-level">LV.{attackSpeedLevel} · +{attackSpeedLevel * 2.5}%</small></button></div></div></section>
    </div>
    <div className="playback-control field-playback"><button className={playbackPaused ? "paused" : ""} aria-label={copy.playback} onClick={cyclePlayback}>{playbackPaused ? "Ⅱ" : `${gameSpeed}×`}</button></div>
    <div className="monster-image-control"><button className={showMonsterImages ? "on" : "off"} aria-label="Monster images on or off" aria-pressed={!showMonsterImages} onClick={() => setShowMonsterImages(value => !value)}>{showMonsterImages ? "IMG ON" : "IMG OFF"}</button></div>
    <section className="hand-panel">
      <div className="section-title"><div className="hand-heading"><span>{copy.hand}</span></div><div className={`hand-glance ${gameStarted ? "" : "prestart-hidden"}`}>{gameStarted && <><img src={result.image} alt=""/><div className="hand-glance-copy"><div className="hand-glance-name"><i className={`tier-badge tier-${result.tier || 3}`}>{term(locale, result.tierLabel)}</i><b>{term(locale, result.job)}</b><em>/ {term(locale, result.label)}</em></div><div className="hand-glance-stats"><span>{copy.attack} {result.damage}</span><span>{copy.range} {result.range}</span><span>{copy.speed} {result.speed}</span></div><small>{roleDescription(result, locale)}</small></div></>}</div><div className="hand-wallet" aria-label={`${gold.toLocaleString()} 골드`}><i className="wallet-coin" aria-hidden="true"/><b>{gold.toLocaleString()}G</b></div></div>
      <div className={`cards ${cooldown > 0 ? "cooling" : ""}`}>{gameStarted ? hand.map(card => { const state = selected.includes(card.id) ? "change" : result.bestCardIds.includes(card.id) ? "best" : "keep"; return <div key={card.id} className="card-slot"><button disabled={cooldown > 0} onClick={() => toggle(card.id)} className={`poker-card ${result.bestCardIds.includes(card.id) ? "best" : ""} ${selected.includes(card.id) ? "active" : ""}`} aria-pressed={selected.includes(card.id)} aria-label={card.rank === 15 ? `${card.joker === "color" ? "컬러" : card.joker === "invert" ? "반전" : "흑백"} 조커` : undefined}><span className={`${card.suit === "heart" || card.suit === "diamond" ? "red-suit" : ""} ${card.joker ? `joker-${card.joker}` : ""}`}>{card.rank === 15 ? (card.joker === "color" ? "C-J" : card.joker === "invert" ? "I-J" : "B-J") : rankLabel(card.rank)}<small>{card.rank === 15 ? "★" : SYMBOL[card.suit]}</small></span><b className="card-center">{cardCenter(card)}</b></button><em className={`card-state ${state}`}>{state === "change" ? copy.change : state === "best" ? copy.best : copy.keep}</em></div>; }) : hand.map(card => <div key={card.id} className="card-slot"><button type="button" disabled className="poker-card concealed" aria-label="숨겨진 카드"><b>?</b></button><em className="card-state prestart-state" aria-hidden="true"/></div>)}</div>
      <div className="actions">
        <button className="primary-action" disabled={!gameStarted || cooldown > 0} onClick={recruit}>{cooldown > 0 ? `${cooldown}s` : copy.recruit}</button>
        <button className="selected-reroll-action" disabled={!gameStarted || cooldown > 0 || selected.length === 0} onClick={redraw}><span>{baseCopy.selectedReroll}</span><em>×{selectedRerollCount + 1}</em><b>{selected.length * 5 * (selectedRerollCount + 1)}G</b></button>
        <button disabled={!gameStarted || cooldown > 0} onClick={redrawAll}><span>{copy.fullReroll}</span><b>10G</b></button>
        <button className={running ? "pause" : "start"} onClick={toggleRunning}>{running ? `II ${copy.pause}` : `\u25B6 ${copy.start}`}</button>
      </div>
    </section>
    <details className="poker-guide" data-locale={locale}><summary>{copy.guide}<span>{copy.open}</span></summary><div className="guide-grid job-guide" tabIndex={0} onWheel={event => event.stopPropagation()}>{guide.map(([category, job]) => <span key={category}><b>{term(locale, JOBS[category].label)}</b><small>{term(locale, job)}{category === "fourKind" || category === "straightFlush" ? ` / ${term(locale, T.legend)}` : category === "royalFlush" || category === "fiveKind" ? ` / ${term(locale, T.transcendent)}` : category !== "sixKind" && category !== "sevenKind" ? ` / ${term(locale, T.beginner)} ${term(locale, T.middle)} ${term(locale, T.elite)}` : ""}</small></span>)}</div><button className="tutorial-reopen" onClick={() => setTutorialStep(0)}>{copy.tutorialAgain}</button></details>
    {!languageChosen && <div className="language-start"><div><strong>CHOOSE YOUR LANGUAGE</strong><div>{LOCALE_ORDER.map(language => <button key={language} onClick={() => { setLocale(language); setLanguageChosen(true); setTutorialStep(0); }}>{LOCALE_LABEL[language]}</button>)}</div></div></div>}
    {languageChosen && tutorialStep < tutorials.length && <div className="tutorial-overlay"><div className="tutorial-card"><small>QUICK GUIDE · {tutorialStep + 1}/{tutorials.length}</small><strong>{tutorials[tutorialStep].title}</strong><p>{tutorials[tutorialStep].body}</p><div><button onClick={() => setTutorialStep(tutorials.length)}>{copy.skip}</button><button className="next" onClick={() => setTutorialStep(v => v + 1)}>{tutorialStep === tutorials.length - 1 ? copy.begin : copy.next}</button></div></div></div>}
    {settingsOpen && <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Settings" onClick={() => setSettingsOpen(false)}><section className="settings-panel" onClick={event => event.stopPropagation()}><button className="settings-close" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>×</button><strong>SETTINGS</strong><button className={bgmOn ? "on" : "off"} onClick={() => setBgmOn(value => !value)}><span>BGM</span><b>{bgmOn ? "ON" : "OFF"}</b></button><button className={soundOn ? "on" : "off"} onClick={toggleSound}><span>{locale === "ko" ? "환경 소리" : locale === "en" ? "SFX" : locale === "zh" ? "环境音效" : "環境音"}</span><b>{soundOn ? "ON" : "OFF"}</b></button><button className="settings-restart" onClick={restart}>{copy.retry}</button></section></div>}
    {gameOver && <div className="game-over"><div><span>{T.gameOver}</span><strong>WAVE {wave}</strong><p>{kills}{copy.defeated}</p><button onClick={restart}>{T.retry}</button></div></div>}
    <HiddenWaveIntro active={hiddenIntroActive} label={baseCopy.demonArrival} className="hidden-wave-intro"/>
    {won && !endingActive && !saintessEndingActive && !directEndingActive && <div className="game-over victory"><div><span>{copy.victory}</span><strong>{copy.clear}</strong><p>{kills}{copy.defeated}</p><button onClick={restart}>{T.retry}</button></div></div>}
    {endingActive && <div className="seven-card-ending-overlay"><iframe title="Seven Card Hidden Ending" src={`${ASSET_BASE}/seven-card-preview/?embedded=1`}/><button type="button" onClick={restart}>PLAY AGAIN?</button></div>}
    {saintessEndingActive && <div className="seven-card-ending-overlay long-ending-overlay"><iframe title="Saintess Hidden Ending" src={`${ASSET_BASE}/saintess-ending-preview/?embedded=1&locale=${locale}`}/><button type="button" onClick={restart}>PLAY AGAIN?</button></div>}
    {directEndingActive && <div className="seven-card-ending-overlay long-ending-overlay"><iframe title="ABSOLUTE TRIUMPH" src={`${ASSET_BASE}/demon-triumph-preview/?embedded=1&locale=${locale}`}/><button type="button" onClick={restart}>PLAY AGAIN?</button></div>}
    <footer className="creator-credit">Made by Arlandstrm with AI · {APP_VERSION}</footer>
  </section></main>;
}
