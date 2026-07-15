import assert from "node:assert/strict";
import {
  BALANCE, HIDDEN_WAVE, NORMAL_HP_DIFFICULTY_STEPS, UNIT_BASES, VISIBLE_MAX_WAVE,
  bossHpForWave, normalMonsterHpForWave, waveTarget,
} from "./game-rules-snapshot.mjs";

const sampledWaves = [1, 10, 20, 40, 50, 80, 100, 120, 150, 180, 199, 200, 201];

console.log("\n[201웨이브 체력·등장 규칙]");
console.table(sampledWaves.map(wave => ({
  wave,
  type: wave === HIDDEN_WAVE ? "히든 보스" : wave % 10 === 0 ? "보스" : "일반",
  enemies: waveTarget(wave),
  normalHp: wave % 10 === 0 || wave === HIDDEN_WAVE ? "-" : normalMonsterHpForWave(wave),
  heavyHp: wave % 10 === 0 || wave === HIDDEN_WAVE ? "-" : normalMonsterHpForWave(wave, 2),
  bossHp: wave % 10 === 0 || wave === HIDDEN_WAVE ? bossHpForWave(wave) : "-",
  spawnMs: BALANCE.spawnInterval,
})));

console.log("\n[유닛 기본 DPS · 공격력/공속 강화 0 · 등급 보정 전]");
console.table(UNIT_BASES.map(unit => {
  const directDps = unit.damage * unit.speed * 2;
  const expectedDps = unit.category === "straight" ? directDps * 3 : unit.category === "royalFlush" ? directDps * .82 : directDps;
  const bossDps = unit.category === "straight" ? expectedDps * 1.5 : unit.category === "fourKind" ? expectedDps * 2 : expectedDps;
  return { unit: unit.unit, role: unit.role, directDps: directDps.toFixed(1), expectedDps: expectedDps.toFixed(1), bossDps: bossDps.toFixed(1) };
}));

assert.equal(VISIBLE_MAX_WAVE, 200);
assert.equal(HIDDEN_WAVE, 201);
assert.equal(NORMAL_HP_DIFFICULTY_STEPS.length, 20);
assert.equal(waveTarget(1), 30);
assert.equal(waveTarget(200), 1);
assert.equal(waveTarget(201), 1);
assert.equal(BALANCE.spawnInterval, 600);
assert.ok(normalMonsterHpForWave(199) > normalMonsterHpForWave(101));
assert.ok(bossHpForWave(200) > bossHpForWave(100));
assert.equal(bossHpForWave(201), 18_000_000);
