"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createGameAudio, type AttackSound, type GameSound } from "./game-audio";
import { LOCALE_LABEL, LOCALE_ORDER, MONSTER_NAMES, TRAITS, TUTORIALS, UI, roleCopy, term, type Locale } from "./i18n";
type Suit = "spade" | "heart" | "diamond" | "club";
type Category = "high" | "pair" | "twoPair" | "triple" | "straight" | "flush" | "fullHouse" | "fourKind" | "straightFlush" | "royalFlush" | "fiveKind" | "sixKind";
type Tier = 1 | 2 | 3;
type Card = {
    id: string;
    rank: number;
    suit: Suit;
    joker?: "black" | "color";
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
    effect: "single" | "alchemy" | "globalDot" | "purge" | "jackpot";
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
    kind: number;
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
    brand: "\uD3EC\uCEE4 \uB79C\uB364 \uB514\uD39C\uC2A4", high: "\uD558\uC774 \uCE74\uB4DC", pair: "\uC6D0 \uD398\uC5B4", twoPair: "\uD22C \uD398\uC5B4", triple: "\uD2B8\uB9AC\uD50C", straight: "\uC2A4\uD2B8\uB808\uC774\uD2B8", flush: "\uD50C\uB7EC\uC2DC", fullHouse: "\uD480\uD558\uC6B0\uC2A4", fourKind: "\uD3EC\uCE74\uB4DC", straightFlush: "\uC2A4\uD2B8\uB808\uC774\uD2B8 \uD50C\uB7EC\uC2DC", royalFlush: "\uB85C\uC5F4 \uD50C\uB7EC\uC2DC", fiveKind: "\uD30C\uC774\uBE0C \uCE74\uB4DC", sixKind: "식스 카드",
    beginner: "\uCD08\uAE09", middle: "\uC911\uAE09", elite: "\uC815\uC608", unique: "\uC804\uC124",
    conscript: "\uC9D5\uC9D1\uBCD1", rogue: "\uB3C4\uC801", warrior: "\uC804\uC0AC", mage: "\uB9C8\uB3C4\uC0AC", elf: "\uAD81\uC218", priest: "\uC0AC\uC81C", alchemist: "\uC5F0\uAE08\uC220\uC0AC", royal: "\uC655\uC2E4 \uAE30\uC0AC", dragoon: "\uC6A9\uAE30\uC0AC", fate: "\uC6B4\uBA85\uC220\uC0AC", saintess: "\uC131\uB140", jackpot: "황금 잭팟",
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
function cardCenter(card: Card) { if (card.joker)
    return <img className={`court-art joker-art joker-art-${card.joker}`} src={`${ASSET_BASE}/sprites/royal-jester.png`} alt={card.joker === "color" ? "컬러 광대" : "흑백 광대"}/>; if (card.rank >= 11 && card.rank <= 13) {
    const filename = card.rank === 11 ? "jack" : card.rank === 12 ? "queen" : "king";
    const courtName = card.rank === 11 ? "Jack" : card.rank === 12 ? "Queen" : "King";
    return <img className={`court-art court-${card.suit}`} src={`${ASSET_BASE}/sprites/cards/${filename}.png`} alt={`${SYMBOL[card.suit]} ${courtName}`}/>;
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
    high: { label: T.high, job: T.conscript, image: `${ASSET_BASE}/sprites/units/2.png`, base: [3, 20, 1] }, pair: { label: T.pair, job: T.rogue, image: `${ASSET_BASE}/sprites/units/3.png`, base: [5, 22, 1.35] }, twoPair: { label: T.twoPair, job: T.warrior, image: `${ASSET_BASE}/sprites/units/4.png`, base: [8, 23, 1.05] }, triple: { label: T.triple, job: T.mage, image: `${ASSET_BASE}/sprites/units/10.png`, base: [15.6, 28, .6] }, straight: { label: T.straight, job: T.elf, image: `${ASSET_BASE}/sprites/units/7.png`, base: [15.6, 40, .5] }, flush: { label: T.flush, job: T.alchemist, image: `${ASSET_BASE}/sprites/units/6.png`, base: [17.28, 31, .5] }, fullHouse: { label: T.fullHouse, job: T.priest, image: `${ASSET_BASE}/sprites/units/Q.png`, base: [21.92, 35, .65] }, fourKind: { label: T.fourKind, job: T.royal, image: `${ASSET_BASE}/sprites/units/K.png`, base: [43.5, 30, 1.15] }, straightFlush: { label: T.straightFlush, job: T.dragoon, image: `${ASSET_BASE}/sprites/units/A.png`, base: [85.5, 34, 1.25] }, royalFlush: { label: T.royalFlush, job: T.fate, image: `${ASSET_BASE}/sprites/units/J.png`, base: [187.5, 72, .82] }, fiveKind: { label: T.fiveKind, job: T.saintess, image: `${ASSET_BASE}/sprites/units/Joker.png`, base: [0, 0, 0] }, sixKind: { label: T.sixKind, job: T.jackpot, image: `${ASSET_BASE}/sprites/units/Jackpot.png`, base: [0, 0, 0] },
};
const GRID_SIZE = 12;
const MAX_ATTACK_SPEED_LEVEL = 30;
const BALANCE = { baseHp: 100, hpPerWave: .04, hpGrowth: 1.028, earlyEaseEnd: 40, earlyBlendEnd: 55, earlyHpStart: .65, earlyHpEnd: .8, earlySpawnStart: 1.2, earlySpawnEnd: 1.1, hardRampStart: 40, hardRampMax: 1.8, baseSpeed: .76, speedPerWave: .003, maxSpeed: 1.55, damageScale: .24, bossHpUnits: 80, bossMoveScale: .58, spawnInterval: 432, minSpawnInterval: 312 } as const;
const SLOTS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({ x: ((index % GRID_SIZE) + .5) / GRID_SIZE * 100, y: (Math.floor(index / GRID_SIZE) + .5) / GRID_SIZE * 100 }));
const PATH = [{ x: 50, y: 12.5 }, { x: 87.5, y: 12.5 }, { x: 87.5, y: 87.5 }, { x: 12.5, y: 87.5 }, { x: 12.5, y: 12.5 }, { x: 50, y: 12.5 }];
function isPathSlot(index: number) { const row = Math.floor(index / GRID_SIZE), col = index % GRID_SIZE; return (row === 1 || row === 10) && col >= 1 && col <= 10 || (col === 1 || col === 10) && row >= 1 && row <= 10; }
const MONSTERS = [
    { name: "이끼 슬라임", hp: 1, speed: .85 }, { name: "동굴 박쥐", hp: .7, speed: 1.25 }, { name: "고블린 정찰병", hp: .9, speed: 1.05 }, { name: "해골 병사", hp: 1.1, speed: .9 }, { name: "검은 늑대", hp: .8, speed: 1.3 },
    { name: "독버섯", hp: 1.45, speed: .65 }, { name: "불꽃 임프", hp: .85, speed: 1.2 }, { name: "복면 도적", hp: 1, speed: 1.1 }, { name: "철갑 오크", hp: 1.55, speed: .72 }, { name: "창백한 유령", hp: 1.1, speed: 1 },
    { name: "거대 거미", hp: .9, speed: 1.28 }, { name: "늪지 리자드맨", hp: 1.35, speed: .82 }, { name: "보물 미믹", hp: 1.8, speed: .62 }, { name: "석상 가고일", hp: 1.7, speed: .68 }, { name: "가면 교단원", hp: 1.15, speed: 1.02 },
    { name: "룬 골렘", hp: 2.2, speed: .52 }, { name: "미노타우로스", hp: 2, speed: .68 }, { name: "흑기사", hp: 2.15, speed: .6 }, { name: "어린 와이번", hp: 1.5, speed: 1.05 }, { name: "뿔 달린 악마", hp: 2.4, speed: .58 },
].map(monster => ({ ...monster, 0: monster.name, 1: "transparent" }));
function monsterKindForWave(wave: number) { const completedBosses = Math.floor((wave - 1) / 10), normalOrdinal = wave - 1 - completedBosses; return ((normalOrdinal % MONSTERS.length) + MONSTERS.length) % MONSTERS.length; }
function monsterTrait(monster: (typeof MONSTERS)[number] & { locale?: Locale }) { const traits = TRAITS[monster.locale || "ko"]; return monster.hp >= 1.6 ? traits.heavy : monster.speed >= 1.18 ? traits.fast : monster.hp >= 1.3 ? traits.tough : monster.speed <= .7 ? traits.slow : traits.balanced; }
function earlyHpMultiplier(wave: number) { if (wave <= BALANCE.earlyEaseEnd)
    return BALANCE.earlyHpStart + (BALANCE.earlyHpEnd - BALANCE.earlyHpStart) * (wave - 1) / (BALANCE.earlyEaseEnd - 1); if (wave < BALANCE.earlyBlendEnd)
    return BALANCE.earlyHpEnd + (1 - BALANCE.earlyHpEnd) * (wave - BALANCE.earlyEaseEnd) / (BALANCE.earlyBlendEnd - BALANCE.earlyEaseEnd); return 1; }
function earlySpawnMultiplier(wave: number) { if (wave <= BALANCE.earlyEaseEnd)
    return BALANCE.earlySpawnStart + (BALANCE.earlySpawnEnd - BALANCE.earlySpawnStart) * (wave - 1) / (BALANCE.earlyEaseEnd - 1); if (wave < BALANCE.earlyBlendEnd)
    return BALANCE.earlySpawnEnd + (1 - BALANCE.earlySpawnEnd) * (wave - BALANCE.earlyEaseEnd) / (BALANCE.earlyBlendEnd - BALANCE.earlyEaseEnd); return 1; }
function baseHpForWave(wave: number) { const progress = Math.max(0, (wave - BALANCE.hardRampStart) / (100 - BALANCE.hardRampStart)), hardRamp = 1 + progress * (BALANCE.hardRampMax - 1); return BALANCE.baseHp * (1 + wave * BALANCE.hpPerWave) * Math.pow(BALANCE.hpGrowth, wave - 1) * hardRamp * earlyHpMultiplier(wave); }
function spawnIntervalForWave(wave: number) { const progress = (wave - 1) / 99, baseInterval = BALANCE.spawnInterval - (BALANCE.spawnInterval - BALANCE.minSpawnInterval) * progress; return Math.round(baseInterval * earlySpawnMultiplier(wave)); }
function goldPerKillForWave(wave: number) { return wave <= 40 ? 1 : wave <= 70 ? 2 : wave <= 90 ? 3 : 4; }
function formatTimer(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
const SELL_VALUES: Record<Category, [
    number,
    number,
    number
] | number> = { high: [1, 1, 2], pair: [1, 1, 2], twoPair: [1, 2, 3], triple: [2, 3, 5], straight: [3, 4, 6], flush: [4, 6, 9], fullHouse: [5, 8, 12], fourKind: [10, 15, 22], straightFlush: [20, 30, 45], royalFlush: 80, fiveKind: 120, sixKind: 0 };
function sellValue(unit: Result) { const value = SELL_VALUES[unit.category]; return typeof value === "number" ? value : value[(unit.tier || 1) - 1]; }
const STARTING_HAND: Card[] = [{ id: "s1", rank: 2, suit: "spade" }, { id: "s2", rank: 2, suit: "heart" }, { id: "s3", rank: 5, suit: "diamond" }, { id: "s4", rank: 5, suit: "club" }, { id: "s5", rank: 9, suit: "spade" }, { id: "s6", rank: 11, suit: "diamond" }, { id: "s7", rank: 13, suit: "club" }];
function rankLabel(rank: number) { return rank === 15 ? "JOKER" : rank === 14 ? "A" : rank === 13 ? "K" : rank === 12 ? "Q" : rank === 11 ? "J" : String(rank); }
function shuffled<T>(items: T[]) { return [...items].sort(() => Math.random() - .5); }
function cardKey(card: Card) { return card.rank === 15 ? `joker-${card.joker}` : `${card.rank}-${card.suit}`; }
function buildDeck(prefix = "deck") { const deck: Card[] = []; for (let rank = 2; rank <= 14; rank++)
    for (const suit of SUITS)
        deck.push({ id: `${prefix}-${rank}-${suit}`, rank, suit }); deck.push({ id: `${prefix}-joker-black`, rank: 15, suit: "spade", joker: "black" }, { id: `${prefix}-joker-color`, rank: 15, suit: "heart", joker: "color" }); return deck; }
function forcedSaintessHand() { const rank = 2 + Math.floor(Math.random() * 13), seed = `blessing-${Date.now()}`, kickers = [rank === 14 ? 13 : 14, rank === 2 ? 3 : 2]; return shuffled([{ id: `${seed}-0`, rank, suit: "spade" }, { id: `${seed}-1`, rank, suit: "heart" }, { id: `${seed}-2`, rank, suit: "diamond" }, { id: `${seed}-black`, rank: 15, suit: "spade", joker: "black" }, { id: `${seed}-color`, rank: 15, suit: "heart", joker: "color" }, { id: `${seed}-5`, rank: kickers[0], suit: "club" }, { id: `${seed}-6`, rank: kickers[1], suit: "club" }] as Card[]); }
function dealHand(saintPity: number): Card[] { if (saintPity >= 574)
    return forcedSaintessHand(); return shuffled(buildDeck(`deal-${Date.now()}`)).slice(0, 7).map((card, index) => ({ ...card, id: `${card.id}-${index}-${Math.random().toString(36).slice(2)}` })); }
function drawFromDeck(count: number, kept: Card[]) { const excluded = new Set(kept.map(cardKey)); return shuffled(buildDeck(`draw-${Date.now()}`).filter(card => !excluded.has(cardKey(card)))).slice(0, count).map((card, index) => ({ ...card, id: `${card.id}-${index}-${Math.random().toString(36).slice(2)}` })); }
function pointOnPath(progress: number) { const loop = ((progress % 1) + 1) % 1, p = loop * (PATH.length - 1), i = Math.min(PATH.length - 2, Math.floor(p)), t = p - i; return { x: PATH[i].x + (PATH[i + 1].x - PATH[i].x) * t, y: PATH[i].y + (PATH[i + 1].y - PATH[i].y) * t }; }
function tierFor(category: Category, power: number): Tier | null { if (category === "royalFlush" || category === "fiveKind" || category === "sixKind")
    return null; const first = category === "high" ? 8 : 6, second = category === "high" ? 11 : 10; return power <= first ? 1 : power <= second ? 2 : 3; }
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
    return { category: "fiveKind" as Category, power: Number(fiveRank[0]), score: 10000000 + Number(fiveRank[0]) }; if (!jokers.length)
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
    const jokers = cards.filter(card => card.rank === 15), rankCounts = cards.filter(card => card.rank !== 15).reduce<Record<number, number>>((map, card) => ({ ...map, [card.rank]: (map[card.rank] || 0) + 1 }), {}), sixEntry = jokers.length === 2 ? Object.entries(rankCounts).find(([, count]) => count === 4) : undefined;
    let best: {
        category: Category;
        power: number;
        score: number;
    } = { category: "high", power: 2, score: 0 }, bestCards = cards.slice(0, 5);
    if (sixEntry) {
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
    const job = JOBS[best.category], tier = tierFor(best.category, best.power), damageMult = tier === 1 ? .85 : tier === 2 ? 1 : tier === 3 ? 1.25 : 1, fixedUtility = best.category === "flush" || best.category === "fullHouse", rangeMult = fixedUtility ? 1 : tier === 1 ? .8 : tier === 2 ? 1 : tier === 3 ? 1.2 : 1, speedMult = fixedUtility ? 1 : tier === 1 ? .9 : tier === 2 ? 1 : tier === 3 ? 1.12 : 1, tierLabel = tier === 1 ? T.beginner : tier === 2 ? T.middle : tier === 3 ? T.elite : T.unique, effect = best.category === "flush" ? "alchemy" : best.category === "royalFlush" ? "globalDot" : best.category === "fiveKind" ? "purge" : best.category === "sixKind" ? "jackpot" : "single";
    return { category: best.category, label: job.label, job: job.job, image: job.image, tier, tierLabel, powerRank: best.power, damage: Math.max(job.base[0] > 0 ? 1 : 0, Math.round(job.base[0] * damageMult)), range: Math.round(job.base[1] * rangeMult), speed: Number((job.base[2] * speedMult).toFixed(2)), effect, bestCardIds: bestCards.map(card => card.id) };
}
function roleDescription(unit: Result, locale: Locale = activeLocale) { if (locale !== "ko")
    return roleCopy(locale, unit.category, unit.tier || 3); const tier = (unit.tier || 3) - 1; switch (unit.category) {
    case "high": return "기본 원거리 단일 공격";
    case "pair": return "속사 + 2초간 받는 피해 20% 표식";
    case "twoPair": return `투척 도끼 ${[2, 3, 4][tier]}명 연쇄`;
    case "triple": return `반경 ${[8, 11, 14][tier]} 범위 폭발`;
    case "straight": return "장거리 + 치명타 50% · 피해 5배 + 보스 100% 추가 피해";
    case "flush": return "독 장판 + 이동속도 50% 감소";
    case "fullHouse": return "범위 35 내 아군 공격 +20% · 속도 +20%";
    case "fourKind": return "강력한 단일 검기 + 보스 50% 추가 피해";
    case "straightFlush": return `직선 관통 공격`;
    case "royalFlush": return "초대형 강력한 광역 지속 피해";
    case "fiveKind": return "사용 즉시 전체 적 소멸";
    case "sixKind": return "소환 즉시 2,000G 획득";
} }
export default function Home() {
    const [hand, setHand] = useState<Card[]>(STARTING_HAND), [selected, setSelected] = useState<string[]>([]), [inventory, setInventory] = useState<Unit[]>([]), [selectedInventory, setSelectedInventory] = useState<string | null>(null), [towers, setTowers] = useState<Tower[]>([]), [selectedTower, setSelectedTower] = useState<string | null>(null), [saleConfirmId, setSaleConfirmId] = useState<string | null>(null), [enemies, setEnemies] = useState<Enemy[]>([]), [hitFx, setHitFx] = useState<HitFx[]>([]), [attackFx, setAttackFx] = useState<AttackFx[]>([]), [alchemyPools, setAlchemyPools] = useState<AlchemyPool[]>([]), [running, setRunning] = useState(false), [gameOver, setGameOver] = useState(false), [won, setWon] = useState(false), [gold, setGold] = useState(20), [attackLevel, setAttackLevel] = useState(0), [attackSpeedLevel, setAttackSpeedLevel] = useState(0), [wave, setWave] = useState(1), [kills, setKills] = useState(0), [spawned, setSpawned] = useState(0), [cooldown, setCooldown] = useState(0), [saintPity, setSaintPity] = useState(0), [message, setMessage] = useState(T.hint), [waveCue, setWaveCue] = useState<string | null>(null), [tutorialStep, setTutorialStep] = useState(0), [soundOn, setSoundOn] = useState(true), [locale, setLocale] = useState<Locale>("ko"), [languageChosen, setLanguageChosen] = useState(false);
    activeLocale = locale;
    const result = useMemo(() => evaluate(hand), [hand, locale]), attackMultiplier = 1 + attackLevel * .1, attackSpeedMultiplier = 1 + attackSpeedLevel * .05, upgradeCost = (attackLevel + 1) * 5, speedUpgradeCost = (attackSpeedLevel + 1) * 5, initialDealRef = useRef(false), lastFxAt = useRef(0), gameAudioRef = useRef<ReturnType<typeof createGameAudio> | null>(null), alchemyPoolsRef = useRef<AlchemyPool[]>([]), alchemyLastCastRef = useRef<Map<string, number>>(new Map()), lastAttackAtRef = useRef<Map<string, number>>(new Map()), selectedPlaced = towers.find(t => t.id === selectedTower);
    const [gameSpeed, setGameSpeed] = useState<1 | 2 | 3>(1), [playbackPaused, setPlaybackPaused] = useState(false), [bossTimeLeft, setBossTimeLeft] = useState<number | null>(null), [bossWaveHold, setBossWaveHold] = useState(0), gameClockRef = useRef(0), lastTickAtRef = useRef(0), bossDeadlineRef = useRef(0), bossWaveReleaseRef = useRef(0);
    const copy = UI[locale];
    const selectedInventoryUnit = inventory.find(unit => unit.id === selectedInventory), activeBoss = enemies.find(enemy => enemy.boss), population = enemies.reduce((total, enemy) => total + (enemy.boss ? 20 : 1), 0);
    const isPriestBuffed = (tower: Tower) => towers.some(priest => priest.category === "fullHouse" && priest.id !== tower.id && Math.hypot(SLOTS[tower.slot].x - SLOTS[priest.slot].x, SLOTS[tower.slot].y - SLOTS[priest.slot].y) <= priest.range);
    const waveTarget = wave % 10 === 0 ? 1 : 60, isBossWave = wave % 10 === 0, monsterKind = monsterKindForWave(isBossWave ? Math.max(1, wave - 1) : wave), monsterBase = MONSTERS[monsterKind];
    const monster = useMemo(() => ({ ...monsterBase, 0: MONSTER_NAMES[locale][monsterKind], locale }), [monsterBase, monsterKind, locale]);
    useEffect(() => { if (initialDealRef.current)
        return; initialDealRef.current = true; setHand(dealHand(0)); }, []);
    useEffect(() => { document.documentElement.lang = locale; if (languageChosen)
        setMessage(copy.pausedRecruit); }, [locale, languageChosen, copy.pausedRecruit]);
    useEffect(() => { if (!running || gameOver || spawned >= waveTarget || wave > 100)
        return; const timer = window.setInterval(() => { const bossSpawn = isBossWave && spawned === 0, normalHp = Math.round(baseHpForWave(wave) * monster.hp), hp = bossSpawn ? normalHp * BALANCE.bossHpUnits : normalHp, speed = Math.min(BALANCE.maxSpeed, (BALANCE.baseSpeed + wave * BALANCE.speedPerWave) * monster.speed), reward = goldPerKillForWave(wave) * (bossSpawn ? 20 : 1); if (bossSpawn) {
        bossDeadlineRef.current = gameClockRef.current + 300000;
        bossWaveReleaseRef.current = gameClockRef.current + 60000;
        setBossTimeLeft(120);
        setBossWaveHold(60);
        gameAudioRef.current?.play("boss");
    } setEnemies(v => [...v, { id: Date.now(), progress: 0, hp, maxHp: hp, boss: bossSpawn, bossRank: bossSpawn ? wave / 10 : undefined, kind: monsterKind, name: monster.name, color: "transparent", speed, reward }]); setSpawned(v => v + 1); }, spawnIntervalForWave(wave) / gameSpeed); return () => window.clearInterval(timer); }, [running, wave, gameOver, spawned, waveTarget, isBossWave, monster, monsterKind, gameSpeed]);
    useEffect(() => { if (!running || spawned < waveTarget || wave >= 100 || (isBossWave && bossWaveHold > 0))
        return; setWave(v => v + 1); setSpawned(0); setMessage(`WAVE ${wave + 1}`); }, [running, spawned, wave, waveTarget, isBossWave, bossWaveHold]);
    useEffect(() => { if (!running)
        return; setWaveCue(isBossWave ? `BOSS WAVE ${wave}` : `WAVE ${wave}`); const timer = window.setTimeout(() => setWaveCue(null), 1400 / gameSpeed); return () => window.clearTimeout(timer); }, [wave, running, isBossWave, gameSpeed]);
    useEffect(() => { document.documentElement.style.setProperty("--game-speed", String(gameSpeed)); document.documentElement.style.setProperty("--enemy-atlas", `url("${ASSET_BASE}/sprites/enemies/monster-atlas.png")`); return () => { document.documentElement.style.setProperty("--game-speed", "1"); document.documentElement.style.removeProperty("--enemy-atlas"); }; }, [gameSpeed]);
    useEffect(() => { gameAudioRef.current?.setMuted(!soundOn); }, [soundOn]);
    useEffect(() => () => { void gameAudioRef.current?.dispose(); }, []);
    useEffect(() => { if (!running || wave !== 100 || spawned < waveTarget || enemies.length > 0)
        return; setWon(true); setRunning(false); }, [running, wave, spawned, waveTarget, enemies.length]);
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
            if (bossDeadlineRef.current > 0) {
                const remaining = Math.max(0, bossDeadlineRef.current - now);
                setBossTimeLeft(Math.ceil(remaining / 1000));
                if (remaining <= 0) {
                    bossDeadlineRef.current = 0;
                    setBossTimeLeft(null);
                    setMessage("BOSS TIME OVER");
                    setGameOver(true);
                    setRunning(false);
                    return current;
                }
            }
            const activePools = alchemyPoolsRef.current.filter(pool => pool.expiresAt > now);
            if (activePools.length !== alchemyPoolsRef.current.length) {
                alchemyPoolsRef.current = activePools;
                setAlchemyPools(activePools);
            }
            let defeated = 0, bossDefeated = 0, earnedGold = 0, bossGold = 0;
            const damageMap = new Map<number, number>(), hitKinds = new Map<number, "direct" | "alchemyDot" | "fateDot">(), slowMap = new Map<number, number>(), criticalHits = new Set<number>(), cursedHits = new Set<number>(), positions = new Map(current.map(enemy => [enemy.id, pointOnPath(enemy.progress)])), markExpirations = new Map(current.filter(enemy => (enemy.markExpiresAt || 0) > now).map(enemy => [enemy.id, enemy.markExpiresAt!])), attackCandidates: AttackFx[] = [];
            const add = (id: number, damage: number, kind: "direct" | "alchemyDot" | "fateDot" = "direct", ownMultiplier = 1) => { const markedMultiplier = markExpirations.has(id) ? 1.2 : 1; damageMap.set(id, (damageMap.get(id) || 0) + damage * markedMultiplier * ownMultiplier); if (kind === "direct" || !hitKinds.has(id))
                hitKinds.set(id, kind); }, tierIndex = (tower: Tower) => (tower.tier || 3) - 1;
            for (const pool of activePools)
                for (const enemy of current) {
                    const p = positions.get(enemy.id)!;
                    if (Math.hypot(p.x - pool.x, p.y - pool.y) <= pool.radius) {
                        add(enemy.id, pool.damage, "alchemyDot");
                        slowMap.set(enemy.id, Math.min(slowMap.get(enemy.id) || 1, pool.slow));
                    }
                }
            const priestBuff = (tower: Tower) => { let damage = .0, speed = .0; for (const priest of towers.filter(unit => unit.category === "fullHouse" && unit.id !== tower.id)) {
                const a = SLOTS[tower.slot], b = SLOTS[priest.slot];
                if (Math.hypot(a.x - b.x, a.y - b.y) <= priest.range) {
                    damage = Math.max(damage, .2);
                    speed = Math.max(speed, .2);
                }
            } return { damage, speed }; };
            const activeTowerIds = new Set(towers.map(tower => tower.id));
            for (const id of lastAttackAtRef.current.keys())
                if (!activeTowerIds.has(id))
                    lastAttackAtRef.current.delete(id);
            for (const tower of towers) {
                const slot = SLOTS[tower.slot], i = tierIndex(tower), buff = priestBuff(tower), attackRate = tower.speed * attackSpeedMultiplier * (1 + buff.speed), attackInterval = 500 / Math.max(.01, attackRate), lastAttackAt = lastAttackAtRef.current.get(tower.id) || 0, baseDamage = tower.damage * attackMultiplier * (1 + buff.damage), inRange = current.filter(enemy => { const p = positions.get(enemy.id)!; return Math.hypot(slot.x - p.x, slot.y - p.y) <= tower.range; }).sort((a, b) => b.progress - a.progress);
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
                attackCandidates.push({ id: `attack-${tower.id}-${now}`, towerId: tower.id, expiresAt: now + 320, category: tower.category, x: slot.x, y: slot.y, tx: visual.x, ty: visual.y, radius: tower.category === "flush" ? 12 : tower.category === "triple" ? [8, 11, 14][i] : tower.category === "straightFlush" ? [4, 6, 8][i] : 5 });
                if (tower.category === "pair") {
                    const target = inRange[0];
                    markExpirations.set(target.id, now + 2000);
                    add(target.id, baseDamage);
                    continue;
                }
                if (tower.category === "twoPair") {
                    const primary = inRange[0], p = positions.get(primary.id)!;
                    const chain = inRange.slice().sort((a, b) => { const pa = positions.get(a.id)!, pb = positions.get(b.id)!; return Math.hypot(pa.x - p.x, pa.y - p.y) - Math.hypot(pb.x - p.x, pb.y - p.y); }).slice(0, [2, 3, 4][i]);
                    chain.forEach((enemy, index) => { add(enemy.id, baseDamage * (1 - index * .18)); if (index > 0) {
                        const hit = positions.get(enemy.id)!;
                        attackCandidates.push({ id: `attack-${tower.id}-${now}-chain-${index}`, towerId: tower.id, expiresAt: now + 320, category: tower.category, x: p.x, y: p.y, tx: hit.x, ty: hit.y, radius: 4 });
                    } });
                    continue;
                }
                if (tower.category === "triple") {
                    const target = inRange[0], center = positions.get(target.id)!, radius = [8, 11, 14][i];
                    for (const enemy of current) {
                        const p = positions.get(enemy.id)!;
                        if (Math.hypot(p.x - center.x, p.y - center.y) <= radius)
                            add(enemy.id, baseDamage * .92);
                    }
                    continue;
                }
                if (tower.category === "straight") {
                    const target = inRange.slice().sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)[0], critical = Math.random() < .5;
                    const targetPosition = positions.get(target.id)!;
                    attackCandidates[attackCandidates.length - 1] = { ...attackCandidates[attackCandidates.length - 1], tx: targetPosition.x, ty: targetPosition.y };
                    add(target.id, baseDamage * (critical ? 5 : 1) * (target.boss ? 2 : 1));
                    if (critical)
                        criticalHits.add(target.id);
                    continue;
                }
                if (tower.category === "flush") {
                    const target = inRange[0], center = positions.get(target.id)!;
                    add(target.id, baseDamage * .45);
                    const pool: AlchemyPool = { id: `pool-${tower.id}-${now}`, x: center.x, y: center.y, radius: 10, expiresAt: now + 2000, damage: baseDamage * attackRate * BALANCE.damageScale * .14, slow: .5 }, nextPools = [...alchemyPoolsRef.current, pool];
                    alchemyPoolsRef.current = nextPools;
                    setAlchemyPools(nextPools);
                    continue;
                }
                if (tower.category === "fourKind") {
                    const target = inRange.slice().sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)[0];
                    const targetPosition = positions.get(target.id)!;
                    attackCandidates[attackCandidates.length - 1] = { ...attackCandidates[attackCandidates.length - 1], tx: targetPosition.x, ty: targetPosition.y };
                    add(target.id, baseDamage * (target.boss ? 1.5 : 1));
                    continue;
                }
                if (tower.category === "straightFlush") {
                    const target = inRange[0], end = positions.get(target.id)!, dx = end.x - slot.x, dy = end.y - slot.y, lengthSq = dx * dx + dy * dy, width = [4, 6, 8][i];
                    for (const enemy of current) {
                        const p = positions.get(enemy.id)!, projection = ((p.x - slot.x) * dx + (p.y - slot.y) * dy) / Math.max(1, lengthSq);
                        if (projection < 0 || projection > 1.2)
                            continue;
                        const cx = slot.x + projection * dx, cy = slot.y + projection * dy;
                        if (Math.hypot(p.x - cx, p.y - cy) <= width)
                            add(enemy.id, baseDamage);
                    }
                    continue;
                }
                const target = inRange[0];
                add(target.id, baseDamage);
            }
            if (attackCandidates.length || now - lastFxAt.current > 360) {
                lastFxAt.current = now;
                setHitFx([...damageMap.entries()].filter(([, damage]) => damage > .25).slice(0, 10).map(([id, damage], index) => { const p = positions.get(id)!; return { id: `${now}-${id}-${index}`, x: p.x, y: p.y, amount: Math.max(1, Math.round(damage)), critical: criticalHits.has(id) }; }));
            }
            setAttackFx(existing => { const active = existing.filter(fx => fx.expiresAt > now), nextFx = [...active, ...attackCandidates].slice(-160); return nextFx.length === existing.length && !attackCandidates.length ? existing : nextFx; });
            const next = current.map(enemy => { const slow = slowMap.get(enemy.id) || 1, pace = .0046 * enemy.speed * slow * (enemy.boss ? BALANCE.bossMoveScale : 1), damage = damageMap.get(enemy.id) || 0, hitKind = damage > 0 ? (hitKinds.get(enemy.id) || "direct") : undefined, markExpiresAt = markExpirations.get(enemy.id); return { ...enemy, markExpiresAt, marked: !!markExpiresAt && markExpiresAt > now, slowed: slowMap.has(enemy.id), cursed: cursedHits.has(enemy.id), hitKind, hitPulse: hitKind === "direct" ? !enemy.hitPulse : enemy.hitPulse, progress: (enemy.progress + pace) % 1, hp: enemy.hp - damage }; }).filter(enemy => { if (enemy.hp <= 0) {
                defeated++;
                earnedGold += enemy.reward;
                if (enemy.boss) {
                    bossDefeated++;
                    bossGold += enemy.reward;
                }
                return false;
            } return true; });
            if (defeated) {
                setGold(v => v + earnedGold);
                setKills(v => v + defeated);
                if (bossDefeated) {
                    bossDeadlineRef.current = 0;
                    setBossTimeLeft(null);
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
    useEffect(() => { if (cooldown <= 0)
        return; const timer = window.setTimeout(() => { if (cooldown === 1) {
        setHand(dealHand(saintPity));
        setCooldown(0);
        setMessage(T.hint);
    }
    else
        setCooldown(v => v - 1); }, 1000 / gameSpeed); return () => window.clearTimeout(timer); }, [cooldown, saintPity, gameSpeed]);
    function gameAudio() { const audio = gameAudioRef.current || createGameAudio(); gameAudioRef.current = audio; audio.setMuted(!soundOn); return audio; }
    function playSound(sound: GameSound) { if (!soundOn)
        return; const audio = gameAudio(); void audio.unlock().then(unlocked => { if (unlocked)
        audio.play(sound); }); }
    function unlockAudio() { if (!soundOn)
        return; void gameAudio().unlock(); }
    function toggleSound() { const next = !soundOn; setSoundOn(next); const audio = gameAudioRef.current || createGameAudio(); gameAudioRef.current = audio; audio.setMuted(!next); if (next)
        void audio.unlock().then(unlocked => { if (unlocked)
            audio.play("summon"); }); }
    function toggleRunning() { const next = !running; unlockAudio(); setPlaybackPaused(!next); setRunning(next); if (next)
        setMessage("방어전 시작"); }
    function cyclePlayback() { unlockAudio(); if (gameOver || won)
        return; if (playbackPaused || !running) {
        setPlaybackPaused(false); setGameSpeed(1); setRunning(true); setMessage("방어전 시작"); return;
    } if (gameSpeed === 3) {
        setPlaybackPaused(true); setRunning(false); return;
    } setGameSpeed(gameSpeed === 1 ? 2 : 3); }
    function cycleLocale() { const index = LOCALE_ORDER.indexOf(locale); setLocale(LOCALE_ORDER[(index + 1) % LOCALE_ORDER.length]); }
    function toggle(id: string) { if (cooldown > 0)
        return; setSelected(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]); }
    function redraw() { if (cooldown > 0)
        return; if (!selected.length) {
        setMessage(T.noSelection);
        return;
    } const cost = selected.length * 5; if (gold < cost) {
        setMessage(T.noGold);
        return;
    } const selectedIndexes = hand.flatMap((card, index) => selected.includes(card.id) ? [index] : []), kept = hand.filter(card => !selected.includes(card.id)), replacements = drawFromDeck(selected.length, kept); let replacementIndex = 0; const next = hand.map(card => selected.includes(card.id) ? replacements[replacementIndex++] : card); setGold(v => v - cost); setHand(next); setSelected(selectedIndexes.map(index => next[index].id)); setMessage(T.rerolled); playSound("reroll"); }
    function redrawAll() { if (cooldown > 0)
        return; if (gold < 3) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - 3); setHand(dealHand(saintPity)); setSelected([]); setMessage("전체 손패를 교체했습니다"); playSound("reroll"); }
    function recruit() { if (cooldown > 0)
        return; if (!running && !playbackPaused && !(wave === 1 && spawned === 0 && inventory.length + towers.length === 0)) {
        setMessage("웨이브 진행 중에 다음 유닛을 소환할 수 있습니다");
        return;
    } if (result.effect === "jackpot") {
        setGold(v => v + 2000);
        setSaintPity(v => v + 1);
        setMessage("식스 카드 잭팟 +2,000G");
        setSelected([]);
        setCooldown(5);
        playSound("jackpot");
        return;
    } const unit: Unit = { ...result, id: `unit-${Date.now()}` }; setInventory(v => [...v, unit]); if (result.effect === "purge")
        setSaintPity(0);
    else
        setSaintPity(v => v + 1); setMessage(`${result.tierLabel} ${result.job} 인벤토리 보관`); setSelected([]); setCooldown(5); playSound(result.effect === "purge" ? "saintess" : "summon"); }
    function chooseInventory(id: string) { setSelectedInventory(v => v === id ? null : id); setSelectedTower(null); setSaleConfirmId(null); }
    function confirmRareSale(unit: Unit | Tower) { const protectedUnit = ["fourKind", "straightFlush", "royalFlush", "fiveKind"].includes(unit.category); if (protectedUnit && saleConfirmId !== unit.id) {
        setSaleConfirmId(unit.id);
        setMessage(`${unit.job}은 희귀 유닛입니다. 판매 버튼을 다시 누르면 판매됩니다`);
        return false;
    } setSaleConfirmId(null); return true; }
    function sellInventoryUnit() { if (!selectedInventoryUnit)
        return; if (!running && wave === 1 && spawned === 0) {
        setMessage("첫 웨이브를 시작한 뒤 유닛을 판매할 수 있습니다");
        return;
    } if (!confirmRareSale(selectedInventoryUnit))
        return; const value = sellValue(selectedInventoryUnit); setInventory(v => v.filter(unit => unit.id !== selectedInventoryUnit.id)); setSelectedInventory(null); setGold(v => v + value); setMessage(`${selectedInventoryUnit.job} 판매 +${value}G`); playSound("sell"); }
    function useSlot(slot: number) { if (isPathSlot(slot))
        return; const target = towers.find(t => t.slot === slot); if (selectedInventory) {
        const unit = inventory.find(u => u.id === selectedInventory);
        if (!unit) {
            setSelectedInventory(null);
            return;
        }
        if (unit.effect === "purge") {
            const removed = enemies.length, reward = enemies.reduce((sum, enemy) => sum + enemy.reward, 0);
            setEnemies([]);
            setAlchemyPools([]);
            alchemyPoolsRef.current = [];
            setKills(v => v + removed);
            setGold(v => v + reward);
            setInventory(v => v.filter(u => u.id !== unit.id));
            setSelectedInventory(null);
            setMessage(`${unit.job}: ${T.purgeEffect} +${reward}G`);
            playSound("saintess");
            return;
        }
        setTowers(v => [...v.filter(t => t.id !== target?.id), { ...unit, slot }]);
        setInventory(v => [...v.filter(u => u.id !== unit.id), ...(target ? [(({ slot: _, ...stored }) => stored)(target)] : [])]);
        setSelectedInventory(null);
        setMessage(`${unit.job} 배치 완료`);
        return;
    } if (!selectedTower) {
        if (target) {
            setSelectedTower(target.id);
            setMessage(`${target.job} 선택 · 이동할 칸을 고르세요`);
        }
        return;
    } const moving = towers.find(t => t.id === selectedTower); if (!moving) {
        setSelectedTower(null);
        return;
    } if (target?.id === moving.id) {
        setSelectedTower(null);
        setMessage(`${moving.job} 선택 해제`);
        return;
    } setTowers(v => v.map(t => t.id === moving.id ? { ...t, slot } : target && t.id === target.id ? { ...t, slot: moving.slot } : t)); setSelectedTower(null); setMessage(target ? `${moving.job} ↔ ${target.job} 위치 교체` : `${moving.job} 배치 이동`); }
    function recallTower() { const tower = towers.find(t => t.id === selectedTower); if (!tower)
        return; const { slot: _, ...unit } = tower; setTowers(v => v.filter(t => t.id !== tower.id)); setInventory(v => [...v, unit]); setSelectedTower(null); setMessage(`${tower.job} 인벤토리 회수`); }
    function sellTower() { const tower = towers.find(t => t.id === selectedTower); if (!tower)
        return; if (!running && wave === 1 && spawned === 0) {
        setMessage("첫 웨이브를 시작한 뒤 유닛을 판매할 수 있습니다");
        return;
    } if (!confirmRareSale(tower))
        return; const value = sellValue(tower); setTowers(v => v.filter(t => t.id !== tower.id)); setSelectedTower(null); setGold(v => v + value); setMessage(`${tower.job} 판매 +${value}G`); playSound("sell"); }
    function upgradeAttack() { if (gold < upgradeCost) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - upgradeCost); setAttackLevel(v => v + 1); setMessage(`전체 공격력 LV.${attackLevel + 1} 강화 완료`); playSound("upgrade"); }
    function upgradeAttackSpeed() { if (attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL) {
        setMessage("전체 공격속도는 LV.30이 최대입니다.");
        return;
    } if (gold < speedUpgradeCost) {
        setMessage(T.noGold);
        return;
    } setGold(v => v - speedUpgradeCost); setAttackSpeedLevel(v => v + 1); setMessage(`전체 공격속도 LV.${attackSpeedLevel + 1} 강화 완료`); playSound("upgrade"); }
    function restart() { setHand(dealHand(0)); setSelected([]); setInventory([]); setSelectedInventory(null); setTowers([]); setSelectedTower(null); setSaleConfirmId(null); setEnemies([]); setHitFx([]); setAttackFx([]); setAlchemyPools([]); alchemyPoolsRef.current = []; alchemyLastCastRef.current.clear(); lastAttackAtRef.current.clear(); lastFxAt.current = 0; gameClockRef.current = 0; lastTickAtRef.current = 0; bossDeadlineRef.current = 0; bossWaveReleaseRef.current = 0; setBossTimeLeft(null); setBossWaveHold(0); setGameSpeed(1); setPlaybackPaused(false); setRunning(false); setGameOver(false); setWon(false); setGold(20); setAttackLevel(0); setAttackSpeedLevel(0); setWave(1); setKills(0); setSpawned(0); setCooldown(0); setSaintPity(0); setMessage(T.hint); }
    const guide: [
        [
            Category,
            string
        ],
        ...Array<[
            Category,
            string
        ]>
    ] = [["high", T.conscript], ["pair", T.rogue], ["twoPair", T.warrior], ["triple", T.mage], ["straight", T.elf], ["flush", T.alchemist], ["fullHouse", T.priest], ["fourKind", T.royal], ["straightFlush", T.dragoon], ["royalFlush", T.fate], ["fiveKind", T.saintess], ["sixKind", T.jackpot]];
    const tutorials = TUTORIALS[locale];
    return <main className="game-shell"><section className="game-frame" aria-label={term(locale, T.brand)}><header className="topbar"><div className="brand-mark">{SYMBOL.spade}</div><div className="brand-copy"><strong>{term(locale, T.brand)}</strong><span>FORTRESS OF FATE</span></div><div className="wave-chip"><span>WAVE</span><strong>{String(wave).padStart(3, "0")} / 100</strong></div><div className="resources"><span className="population-resource">{"\u2620"} <b>{population}/200</b></span><span className="gold-resource"><i>GOLD</i><b>{gold.toLocaleString()}</b><small>G</small></span><button className="sound-toggle" aria-label={soundOn ? "Sound off" : "Sound on"} onClick={toggleSound}>{soundOn ? "♪" : "×"}</button></div></header>
    <div className="corner-controls"><button className="language-cycle" aria-label={copy.language} onClick={cycleLocale}>{LOCALE_LABEL[locale]}</button><div className="playback-control"><button className={playbackPaused ? "paused" : ""} aria-label={copy.playback} onClick={cyclePlayback}>{playbackPaused ? "Ⅱ" : `${gameSpeed}×`}</button><output aria-live="polite" className={activeBoss || bossWaveHold > 0 ? "boss-time" : ""}>{activeBoss && bossTimeLeft !== null ? `BOSS ${formatTimer(bossTimeLeft)}${bossWaveHold > 0 ? ` · NEXT ${formatTimer(bossWaveHold)}` : ""}` : bossWaveHold > 0 ? `NEXT ${formatTimer(bossWaveHold)}` : `${spawned}/${waveTarget} · ${population}/200`}</output></div></div>
    <div className="battle-wrap"><div className="battle-header"><div><span className="status-dot"/> {isBossWave ? "BOSS WAVE" : monster[0]} <small>{isBossWave ? `RANK ${wave / 10}` : monsterTrait(monster)}</small></div><strong>{spawned}/{waveTarget} · {population}/200</strong></div><div className="battlefield"><div className="forest-noise"/><div className="loop-segment loop-top"/><div className="loop-segment loop-right"/><div className="loop-segment loop-bottom"/><div className="loop-segment loop-left"/><div className="inner-ground"><span>DEFENSE<br />ZONE</span></div><div className="spawn-gate">SPAWN</div>{activeBoss && <div className="boss-health"><span>RANK {activeBoss.bossRank} · {activeBoss.name}</span><i><b style={{ width: `${Math.max(0, activeBoss.hp / activeBoss.maxHp) * 100}%` }}/></i><strong>{Math.ceil(activeBoss.hp).toLocaleString()}</strong></div>}{SLOTS.map((slot, index) => { const tower = towers.find(t => t.slot === index), blocked = isPathSlot(index), targetState = !blocked && (selectedInventory || selectedTower) && tower?.id !== selectedTower ? (tower ? "swap-target" : "move-target") : ""; return <button type="button" key={index} disabled={blocked} aria-label={blocked ? "몬스터 이동로" : tower ? `${tower.job} 배치칸` : `${index + 1}번 빈 배치칸`} onClick={() => useSlot(index)} className={`grid-slot ${blocked ? "blocked" : ""} ${tower ? "tower-slot occupied" : ""} ${tower?.effect || ""} ${tower?.category === "fullHouse" ? "priest-aura" : ""} ${tower && isPriestBuffed(tower) ? "priest-buffed" : ""} ${tower?.id === selectedTower ? "selected" : ""} ${tower && attackFx.some(fx => fx.towerId === tower.id) ? "attacking" : ""} ${targetState}`} style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>{tower ? <><img src={attackFx.some(fx => fx.towerId === tower.id) ? tower.image.replace("/units/", "/units/attack/") : `${tower.image}?idle=1`} alt=""/><span className={`tier-dot tier-${tower.tier || 3}`}>{term(locale, tower.tierLabel)}</span></> : !blocked && <span className="slot-plus">+</span>}</button>; })}{selectedPlaced && <div className="range-preview" style={{ left: `${SLOTS[selectedPlaced.slot].x}%`, top: `${SLOTS[selectedPlaced.slot].y}%`, width: `${selectedPlaced.range * 2}%` }}/>}{alchemyPools.map(pool => <span key={pool.id} className="alchemy-pool" style={{ left: `${pool.x}%`, top: `${pool.y}%`, width: `${pool.radius * 2}%` }}/>)}{attackFx.map(fx => { const dx = fx.tx - fx.x, dy = fx.ty - fx.y, length = Math.hypot(dx, dy), angle = Math.atan2(dy, dx) * 180 / Math.PI; return <span key={fx.id} className={`attack-fx attack-${fx.category}`}><i className="attack-trace" style={{ left: `${fx.x}%`, top: `${fx.y}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }}/><b className="attack-impact" style={{ left: `${fx.tx}%`, top: `${fx.ty}%`, width: `${fx.radius * 2}%` }}/></span>; })}{enemies.map(e => { const p = pointOnPath(e.progress); return <div key={e.id} title={`${e.boss ? "보스 · " : ""}${e.name} · HP ${Math.ceil(e.hp)}`} className={`enemy ${e.boss ? `boss boss-rank-${e.bossRank}` : ""} ${e.marked ? "marked" : ""} ${e.slowed ? "slowed" : ""} ${e.cursed ? "cursed" : ""} ${e.hitPulse ? "hit-flash-a" : "hit-flash-b"}`} style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: e.color }}><span className="enemy-face">{e.boss ? "B" : String(e.kind + 1).padStart(2, "0")}</span>{e.boss && <b className="boss-badge">BOSS</b>}{e.marked && <b className="status-mark">!</b>}{e.slowed && <b className="status-slow">*</b>}{e.cursed && <b className="status-curse">◆</b>}<i style={{ width: `${Math.max(0, e.hp / e.maxHp) * 100}%` }}/></div>; })}{hitFx.map(fx => <span key={fx.id} className={`hit-number ${fx.critical ? "critical" : ""}`} style={{ left: `${fx.x}%`, top: `${fx.y}%` }}>{fx.critical ? "CRIT " : "-"}{fx.amount}</span>)}{waveCue && <div className={`wave-cue ${isBossWave ? "boss-cue" : ""}`}>{waveCue}<small>{isBossWave ? "강적 1체 · 일반 몬스터 80마리분" : "60 ENEMIES INCOMING"}</small></div>}{!selectedPlaced && <div className="battle-message" aria-live="polite">{cooldown > 0 ? `NEXT HAND ${cooldown}s` : selectedInventory ? "배치할 칸을 선택하세요" : message}</div>}{selectedPlaced && <aside className="field-unit-actions" aria-label={`${selectedPlaced.job} 조작창`}><button className="command-close" onClick={() => setSelectedTower(null)} aria-label="유닛 선택 해제">×</button><div className="command-unit"><img src={selectedPlaced.image} alt=""/><span><small>{term(locale, selectedPlaced.tierLabel)} · #{selectedPlaced.slot + 1}</small><strong>{term(locale, selectedPlaced.job)}</strong>{isPriestBuffed(selectedPlaced) && <em>사제 버프 적용 중</em>}</span></div><div className="command-stats"><span><small>{copy.attack}</small><b>{Math.round(selectedPlaced.damage * attackMultiplier * 10) / 10}</b></span><span><small>{copy.range}</small><b>{selectedPlaced.range}</b></span><span><small>{copy.speed}</small><b>{(selectedPlaced.speed * attackSpeedMultiplier).toFixed(2)}</b></span></div><p>{copy.placeHint}</p><div className="command-actions"><button onClick={recallTower}>{copy.recall}</button><button className="sell" onClick={sellTower}>{copy.sell} <b>+{sellValue(selectedPlaced)}G</b></button></div></aside>}</div></div>
    <div className={`unit-dock ${selectedInventoryUnit ? "has-selection" : ""}`}><section className={`unit-inventory ${selectedInventoryUnit ? "has-selection" : ""}`}><div className="inventory-title"><strong>{copy.inventory}</strong><span>{inventory.length}</span></div><div className="inventory-list">{inventory.length === 0 ? <p>{copy.emptyInventory}</p> : inventory.map(unit => <button key={unit.id} onClick={() => chooseInventory(unit.id)} className={selectedInventory === unit.id ? "active" : ""}><img src={unit.image} alt=""/><span>{term(locale, unit.job)}</span><small>{unit.effect === "purge" ? copy.use : term(locale, unit.tierLabel)}</small></button>)}</div>{selectedInventoryUnit && <div className="inventory-selection"><img src={selectedInventoryUnit.image} alt=""/><div><strong>{term(locale, selectedInventoryUnit.job)}</strong><small>{term(locale, selectedInventoryUnit.tierLabel)} · {copy.sell} {sellValue(selectedInventoryUnit)}G</small></div><span>{copy.placeHint}</span><button onClick={sellInventoryUnit} aria-label={`${selectedInventoryUnit.job} ${sellValue(selectedInventoryUnit)}골드에 판매`}>{copy.sell} <b>+{sellValue(selectedInventoryUnit)}G</b></button></div>}<div className="army-upgrade"><div className="upgrade-row"><div><span>{copy.totalAttack}</span><strong>LV.{attackLevel} · +{attackLevel * 10}%</strong></div><button disabled={gold < upgradeCost} onClick={upgradeAttack} >{copy.attackUp} <b>{upgradeCost}G</b></button></div><div className="upgrade-row speed-row"><div><span>{copy.totalSpeed}</span><strong>LV.{attackSpeedLevel} · +{attackSpeedLevel * 5}%</strong></div><button disabled={attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL || gold < speedUpgradeCost} onClick={upgradeAttackSpeed}>{copy.speedUp} <b>{attackSpeedLevel >= MAX_ATTACK_SPEED_LEVEL ? "MAX" : `${speedUpgradeCost}G`}</b></button></div></div></section>
    <section className="hand-result summon-preview"><div className="summon-portrait"><img src={result.image} alt=""/><i>소환 예정</i></div><div className="summon-copy"><div className="summon-path"><span>현재 족보</span><b>{result.label}</b></div><strong><i className={`tier-badge tier-${result.tier || 3}`}>{result.tierLabel}</i> {result.job}</strong><div className="summon-stats"><span><small>공격</small><b>{result.damage}</b></span><span><small>사거리</small><b>{result.range}</b></span><span><small>공속</small><b>{result.speed}</b></span></div><small className="effect-note">{roleDescription(result)}</small></div></section></div>
    <section className="hand-panel"><div className="section-title"><div className="hand-heading"><span>{T.hand}</span><small>{cooldown > 0 ? `NEXT HAND ${cooldown}s` : copy.handHint}</small></div><div className="hand-glance"><img src={result.image} alt=""/><span><small>{term(locale, result.label)}</small><b>{term(locale, result.job)}</b></span></div><div className="hand-wallet"><small>GOLD</small><b>{gold.toLocaleString()}G</b></div></div><div className={`cards ${cooldown > 0 ? "cooling" : ""}`}>{hand.map(card => <button key={card.id} disabled={cooldown > 0} onClick={() => toggle(card.id)} className={`poker-card ${result.bestCardIds.includes(card.id) ? "best" : ""} ${selected.includes(card.id) ? "active" : ""}`} aria-pressed={selected.includes(card.id)} aria-label={card.rank === 15 ? `${card.joker === "color" ? "컬러" : "흑백"} 조커` : undefined}><span className={`${card.suit === "heart" || card.suit === "diamond" ? "red-suit" : ""} ${card.joker ? `joker-${card.joker}` : ""}`}>{card.rank === 15 ? (card.joker === "color" ? "C-J" : "B-J") : rankLabel(card.rank)}<small>{card.rank === 15 ? "★" : SYMBOL[card.suit]}</small></span><b className="card-center">{cardCenter(card)}</b><em>{selected.includes(card.id) ? copy.change : result.bestCardIds.includes(card.id) ? copy.best : copy.keep}</em></button>)}</div><div className="actions"><button className="primary-action" disabled={cooldown > 0} onClick={recruit}>{cooldown > 0 ? `${cooldown}s` : T.recruit} <b>FREE</b></button><button disabled={cooldown > 0 || selected.length === 0} onClick={redraw}>{"↻"} 선택 카드 교체 ({selected.length}장) <b>{selected.length * 5}</b></button><button disabled={cooldown > 0} onClick={redrawAll}>{"↻"} 전체 손패 교체 <b>3</b></button><button className={running ? "pause" : "start"} onClick={toggleRunning}>{running ? `II ${copy.pause}` : `\u25B6 ${copy.start}`}</button></div></section>
    <details className="poker-guide"><summary>{T.guide}<span>{T.open}</span></summary><div className="guide-grid job-guide">{guide.map(([category, job]) => <span key={category}><b>{term(locale, JOBS[category].label)}</b><small>{term(locale, job)}{category !== "royalFlush" && category !== "fiveKind" && category !== "sixKind" ? ` / ${T.beginner} ${T.middle} ${T.elite}` : ""}</small></span>)}</div><button className="tutorial-reopen" onClick={() => setTutorialStep(0)}>{copy.tutorialAgain}</button></details>
    {!languageChosen && <div className="language-start"><div><small>SELECT LANGUAGE · 언어 선택</small><strong>Choose your language</strong><p>언어를 선택하면 해당 언어로 튜토리얼이 시작됩니다.</p><div>{LOCALE_ORDER.map(language => <button key={language} onClick={() => { setLocale(language); setLanguageChosen(true); setTutorialStep(0); }}>{LOCALE_LABEL[language]}<small>{language === "ko" ? "한국어" : language === "en" ? "English" : language === "zh" ? "中文" : "日本語"}</small></button>)}</div></div></div>}
    {languageChosen && tutorialStep < tutorials.length && <div className="tutorial-overlay"><div className="tutorial-card"><small>QUICK GUIDE · {tutorialStep + 1}/{tutorials.length}</small><strong>{tutorials[tutorialStep].title}</strong><p>{tutorials[tutorialStep].body}</p><div><button onClick={() => setTutorialStep(tutorials.length)}>{copy.skip}</button><button className="next" onClick={() => setTutorialStep(v => v + 1)}>{tutorialStep === tutorials.length - 1 ? copy.begin : copy.next}</button></div></div></div>}
    {gameOver && <div className="game-over"><div><span>{T.gameOver}</span><strong>WAVE {wave}</strong><p>{kills}{copy.defeated}</p><button onClick={restart}>{T.retry}</button></div></div>}
    {won && <div className="game-over victory"><div><span>{copy.victory}</span><strong>{copy.clear}</strong><p>{kills}{copy.defeated}</p><button onClick={restart}>{T.retry}</button></div></div>}
    <footer className="creator-credit">Made by Arlandstrm with AI</footer>
  </section></main>;
}
