import assert from "node:assert/strict";
import { HIDDEN_WAVE, VISIBLE_MAX_WAVE, bossHpForWave, waveTarget } from "./game-rules-snapshot.mjs";

const speeds = [1, 2, 3];
const nextWaveGameSeconds = 60;
const bossDeadlineGameSeconds = 180;

console.log("\n[보스 진행 규칙]");
for (const speed of speeds) {
  const nextWaveRealSeconds = nextWaveGameSeconds / speed;
  const gameOverRealSeconds = bossDeadlineGameSeconds / speed;
  assert.ok(nextWaveRealSeconds < gameOverRealSeconds);
  console.log(`${speed}배속 · 다음 일반 웨이브 ${nextWaveRealSeconds}초 · 보스 제한 ${gameOverRealSeconds}초`);
}

const spawnedAt = [0, 100, 220];
const deadlines = spawnedAt.map(seconds => seconds + bossDeadlineGameSeconds);
assert.deepEqual(deadlines, [180, 280, 400]);
assert.deepEqual(deadlines.filter(deadline => deadline <= 181), [180]);
assert.equal(waveTarget(VISIBLE_MAX_WAVE), 1);
assert.equal(waveTarget(HIDDEN_WAVE), 1);
assert.equal(bossHpForWave(HIDDEN_WAVE), 18_000_000);

console.log(`200웨이브 보스 ${bossHpForWave(VISIBLE_MAX_WAVE).toLocaleString()} HP 전멸 후 201웨이브 히든 보스 ${bossHpForWave(HIDDEN_WAVE).toLocaleString()} HP가 별도 등장합니다.`);
console.log("각 보스는 등장 시점부터 180초를 독립 계산합니다.");
