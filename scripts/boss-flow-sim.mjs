import assert from "node:assert/strict";

const speeds=[1,2,3];
const nextWaveGameSeconds=60;
const bossDeadlineGameSeconds=300;

for(const speed of speeds){
  const nextWaveRealSeconds=nextWaveGameSeconds/speed;
  const gameOverRealSeconds=bossDeadlineGameSeconds/speed;

  assert.equal(nextWaveRealSeconds*speed,nextWaveGameSeconds);
  assert.equal(gameOverRealSeconds*speed,bossDeadlineGameSeconds);
  assert.ok(nextWaveRealSeconds<gameOverRealSeconds);

  console.log(`${speed}배속 · 다음 일반 웨이브 ${nextWaveRealSeconds}초 · 보스 제한 ${gameOverRealSeconds}초`);
}

const spawnedAt=[0,100,220];
const deadlines=spawnedAt.map(seconds=>seconds+bossDeadlineGameSeconds);
assert.deepEqual(deadlines,[300,400,520]);
assert.deepEqual(deadlines.filter(deadline=>deadline<=301),[300]);
assert.deepEqual(deadlines.filter(deadline=>deadline<=401),[300,400]);

console.log("보스마다 등장 시점부터 300초를 독립 계산하고, 먼저 만료된 보스만 판정하는 규칙 확인 완료");
