import assert from "node:assert/strict";
import {
  FULL_REROLL_COST, HIDDEN_WAVE, MAX_ATTACK_SPEED_LEVEL, SELECTED_REROLL_CARD_COST,
  STARTING_GOLD, totalUpgradeCost, upgradeCost, waveIncome,
} from "./game-rules-snapshot.mjs";

const checkpoints = [1, 10, 20, 40, 60, 80, 100, 120, 150, 180, 200, 201];
let gold = STARTING_GOLD;
const rows = [];

for (let wave = 1; wave <= HIDDEN_WAVE; wave++) {
  gold += waveIncome(wave);
  if (checkpoints.includes(wave)) {
    const equalLevels = Math.floor((Math.sqrt(1 + 4 * gold / 5) - 1) / 2);
    rows.push({
      wave,
      cumulativeGold: gold,
      waveIncome: waveIncome(wave),
      fullRerolls: Math.floor(gold / FULL_REROLL_COST),
      equalAttackAndSpeedLevels: equalLevels,
      upgradeSpend: totalUpgradeCost(equalLevels) * 2,
    });
  }
}

console.log("\n[201웨이브 기본 경제 · 판매/징집병 추가골드 제외]");
console.table(rows);
console.log(`시작 ${STARTING_GOLD}G · 일반 처치 1G · 전체 교체 ${FULL_REROLL_COST}G · 선택 교체 카드당 ${SELECTED_REROLL_CARD_COST}G × 교체 배수`);
console.log(`공격 강화 제한 없음 · 공격속도 강화 최대 ${MAX_ATTACK_SPEED_LEVEL}레벨 · 레벨당 +2.5%`);

assert.equal(rows.find(row => row.wave === 1)?.cumulativeGold, 80);
assert.equal(rows.find(row => row.wave === 100)?.cumulativeGold, 2_950);
assert.equal(rows.find(row => row.wave === 200)?.cumulativeGold, 5_850);
assert.equal(rows.at(-1)?.cumulativeGold, 5_870);
assert.equal(upgradeCost(10), 50);
assert.equal(totalUpgradeCost(MAX_ATTACK_SPEED_LEVEL), 2_325);
