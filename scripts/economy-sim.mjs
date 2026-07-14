import assert from "node:assert/strict";

const goldPerKill=wave=>wave<=40?1:wave<=70?2:wave<=90?3:4;
const waveIncome=wave=>goldPerKill(wave)*(wave%10===0?20:40);
const upgradeCost=level=>5*level;
const totalUpgradeCost=levels=>5*levels*(levels+1)/2;
const checkpoints=[1,10,20,40,60,80,100];

let gold=20;
const rows=[];
for(let wave=1;wave<=100;wave++){
  gold+=waveIncome(wave);
  if(checkpoints.includes(wave)){
    const balancedLevels=Math.floor((Math.sqrt(1+4*gold/5)-1)/2);
    rows.push({
      wave,
      cumulativeGold:gold,
      killGold:goldPerKill(wave),
      fullRerolls:Math.floor(gold/5),
      equalAttackAndSpeedLevels:balancedLevels,
      upgradeSpend:totalUpgradeCost(balancedLevels)*2,
    });
  }
}

console.log("\n[누적 경제 기준표: 소비하지 않았을 때]");
console.table(rows);
console.log("강화 비용: 다음 레벨 5G, 10G, 15G… / 전체 리롤 5G / 한 장 리롤 3G");

assert.equal(rows.find(row=>row.wave===40)?.cumulativeGold,1540);
assert.equal(rows.at(-1)?.cumulativeGold,7620);
assert.equal(upgradeCost(10),50);
