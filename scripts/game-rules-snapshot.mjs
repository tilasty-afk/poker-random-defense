export const VISIBLE_MAX_WAVE = 200;
export const HIDDEN_WAVE = 201;
export const HIDDEN_BOSS_HP = 5_000_000;
export const NORMAL_MONSTER_HP_MULTIPLIER = 1.5;
export const MAX_MONSTER_HP_MULTIPLIER = 2;
export const MAX_ATTACK_SPEED_LEVEL = 30;
export const STARTING_GOLD = 50;
export const FULL_REROLL_COST = 10;
export const SELECTED_REROLL_CARD_COST = 5;

export const BALANCE = {
  baseHp: 100,
  hpPerWave: .04,
  hpGrowth: 1.028,
  lateHpGrowth: 1.005,
  spawnInterval: 600,
};

export const NORMAL_HP_DIFFICULTY_STEPS = [
  [10, 1.3983], [20, 1.601], [30, 1.9387], [40, 2.4891], [50, 3.2002],
  [60, 3.7484], [70, 4.1104], [80, 4.2995], [90, 4.2814], [100, 4.1578],
  [110, 4.9272], [120, 5.0028], [130, 5.0434], [140, 5.0998], [150, 5.1259],
  [160, 5.1645], [170, 5.1768], [180, 5.1671], [190, 5.0801], [200, 4.9316],
];

export const BOSS_HP_BY_WAVE = {
  10: 27_000, 20: 48_000, 30: 85_000, 40: 145_000, 50: 233_000,
  60: 336_000, 70: 440_000, 80: 556_000, 90: 708_000, 100: 996_000,
  110: 1_080_000, 120: 1_160_000, 130: 1_250_000, 140: 1_370_000,
  150: 1_500_000, 160: 1_600_000, 170: 1_700_000, 180: 1_800_000,
  190: 1_900_000, 200: 2_000_000,
};

export const UNIT_BASES = [
  { unit: "징집병", category: "high", damage: 3, speed: 1, role: "처치 +1G · 다른 징집병당 공격력 +33%" },
  { unit: "도적", category: "pair", damage: 5, speed: 1.35, role: "2초간 받는 피해 +100% 표식" },
  { unit: "전사", category: "twoPair", damage: 16, speed: 1.05, role: "사거리 내 최저 체력 우선" },
  { unit: "마도사", category: "triple", damage: 257.4, speed: .1, role: "5초 간격 · 반경 2.5칸 폭발" },
  { unit: "궁수", category: "straight", damage: 46.8, speed: .5, role: "치명타 50% · 5배 · 보스 +50%" },
  { unit: "연금술사", category: "flush", damage: 110, speed: .5, role: "슬로우 50% · 2초 중독 장판" },
  { unit: "사제", category: "fullHouse", damage: 65.76, speed: .65, role: "전역 공격력 버프 15/25/40%" },
  { unit: "왕실기사", category: "fourKind", damage: 71.775, speed: 1.15, role: "보스 피해 2배" },
  { unit: "용기사", category: "straightFlush", damage: 224.4, speed: .732, role: "강한 단일 공격" },
  { unit: "운명술사", category: "royalFlush", damage: 140, speed: 1.4, role: "전역 지속 피해" },
];

export function hpDifficultyForWave(wave) {
  const upperIndex = NORMAL_HP_DIFFICULTY_STEPS.findIndex(([endWave]) => wave <= endWave);
  if (upperIndex < 0) return NORMAL_HP_DIFFICULTY_STEPS.at(-1)[1];
  if (upperIndex === 0) return NORMAL_HP_DIFFICULTY_STEPS[0][1];
  const [lowerWave, lowerMultiplier] = NORMAL_HP_DIFFICULTY_STEPS[upperIndex - 1];
  const [upperWave, upperMultiplier] = NORMAL_HP_DIFFICULTY_STEPS[upperIndex];
  return lowerMultiplier + (upperMultiplier - lowerMultiplier) * (wave - lowerWave) / (upperWave - lowerWave);
}

export function baseHpForWave(wave) {
  const earlyGrowthWaves = Math.min(wave, 100) - 1;
  const lateGrowthWaves = Math.max(0, wave - 100);
  return BALANCE.baseHp * (1 + wave * BALANCE.hpPerWave)
    * Math.pow(BALANCE.hpGrowth, earlyGrowthWaves)
    * Math.pow(BALANCE.lateHpGrowth, lateGrowthWaves)
    * hpDifficultyForWave(wave);
}

export const normalMonsterHpScaleForWave = wave => wave >= 90 ? .9 : 1;
export function lateNormalMonsterHpScaleForWave(wave) {
  const progress = Math.max(0, Math.min(1, (wave - 101) / 98));
  return 1 + 2 * Math.pow(progress, 1.15);
}
export function normalMonsterHpForWave(wave, monsterHpMultiplier = 1) {
  return Math.round(baseHpForWave(wave)
    * Math.min(monsterHpMultiplier, MAX_MONSTER_HP_MULTIPLIER)
    * normalMonsterHpScaleForWave(wave)
    * NORMAL_MONSTER_HP_MULTIPLIER
    * lateNormalMonsterHpScaleForWave(wave));
}

export function bossHpScaleForWave(wave) {
  return wave < 50 ? 1 : 1 + 2 * Math.min(1, (wave - 50) / (HIDDEN_WAVE - 50));
}
export function lateBossHpScaleForWave(wave) {
  const progress = Math.max(0, Math.min(1, (wave - 101) / (HIDDEN_WAVE - 101)));
  return 1 + .2 * Math.pow(progress, 1.35);
}
export function bossHpForWave(wave) {
  const baseHp = wave === HIDDEN_WAVE ? HIDDEN_BOSS_HP : (BOSS_HP_BY_WAVE[wave] ?? BOSS_HP_BY_WAVE[VISIBLE_MAX_WAVE]);
  return Math.round(baseHp * bossHpScaleForWave(wave) * lateBossHpScaleForWave(wave));
}

export const waveTarget = wave => wave === HIDDEN_WAVE || wave % 10 === 0 ? 1 : 30;
export const killGold = () => 1;
export const waveIncome = wave => waveTarget(wave) * (wave % 10 === 0 || wave === HIDDEN_WAVE ? 20 : 1);
export const upgradeCost = nextLevel => 5 * nextLevel;
export const totalUpgradeCost = levels => 5 * levels * (levels + 1) / 2;
