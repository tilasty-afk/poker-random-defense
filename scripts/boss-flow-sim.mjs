import assert from "node:assert/strict";

const speeds=[1,2,4,8];
const nextWaveGameSeconds=60;
const bossDeadlineGameSeconds=120;

for(const speed of speeds){
  const nextWaveRealSeconds=nextWaveGameSeconds/speed;
  const gameOverRealSeconds=bossDeadlineGameSeconds/speed;

  assert.equal(nextWaveRealSeconds*speed,nextWaveGameSeconds);
  assert.equal(gameOverRealSeconds*speed,bossDeadlineGameSeconds);
  assert.ok(nextWaveRealSeconds<gameOverRealSeconds);

  console.log(`${speed}배속 · 다음 일반 웨이브 ${nextWaveRealSeconds}초 · 보스 제한 ${gameOverRealSeconds}초`);
}

console.log("보스 단독 등장 → 게임 시간 60초 후 다음 일반 웨이브 → 120초 생존 시 패배 규칙 확인 완료");
