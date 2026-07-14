const choose=(n,k)=>{let value=1;for(let i=1;i<=k;i++)value=value*(n-k+i)/i;return value};

const BALANCE={baseHp:100,hpPerWave:.04,hpGrowth:1.028,earlyEaseEnd:40,earlyBlendEnd:55,earlyHpStart:.65,earlyHpEnd:.8,earlySpawnStart:1.2,earlySpawnEnd:1.1,hardRampStart:40,hardRampMax:1.8,baseSpeed:.76,speedPerWave:.003,maxSpeed:1.55,spawnInterval:432,minSpawnInterval:312};
const sampledWaves=[1,10,20,40,60,80,90,100];
const earlyHpMultiplier=wave=>wave<=40?.65+(.8-.65)*(wave-1)/39:wave<55?.8+.2*(wave-40)/15:1;
const earlySpawnMultiplier=wave=>wave<=40?1.2+(1.1-1.2)*(wave-1)/39:wave<55?1.1+(1-1.1)*(wave-40)/15:1;
const baseHpForWave=wave=>{const progress=Math.max(0,(wave-BALANCE.hardRampStart)/(100-BALANCE.hardRampStart));return BALANCE.baseHp*(1+wave*BALANCE.hpPerWave)*Math.pow(BALANCE.hpGrowth,wave-1)*(1+progress*(BALANCE.hardRampMax-1))*earlyHpMultiplier(wave)};
const spawnIntervalForWave=wave=>Math.round((BALANCE.spawnInterval-(BALANCE.spawnInterval-BALANCE.minSpawnInterval)*(wave-1)/99)*earlySpawnMultiplier(wave));
const goldPerKill=wave=>wave<=40?1:wave<=70?2:wave<=90?3:4;

const naturalSaintHands=13*(choose(4,3)*choose(48,2)+choose(4,4)*choose(48,1));
const totalHands=choose(54,7);
const naturalSaintRate=naturalSaintHands/totalHands;
const pityCap=575;
const expectedHandsWithPity=(1-Math.pow(1-naturalSaintRate,pityCap))/naturalSaintRate;
const adjustedSaintRate=1/expectedHandsWithPity;

const units=[
  ["징집병",3,1,"단일"],["도적",5,1.35,"표식"],["전사",8,1.05,"2~4 연쇄"],["마도사",15.6,.6,"범위"],
  ["궁수",15.6,1.25,"치명타"],["연금술사",17.28,.5,"장판"],["사제",21.92,.65,"아군 버프"],["왕실기사",43.5,1.15,"보스 추가 피해"],
  ["용기사",85.5,1.25,"관통"],["운명술사",187.5,.82,"맵 전체 지속 피해"],
];

console.log("\n[웨이브 기준표]");
console.table(sampledWaves.map(wave=>({wave,baseHp:Math.round(baseHpForWave(wave)),earlyHpScale:earlyHpMultiplier(wave).toFixed(2),bossHp:wave%10===0?Math.round(baseHpForWave(wave)*80):"-",spawnMs:spawnIntervalForWave(wave),killGold:goldPerKill(wave),hardRamp:wave<=40?"1.00":(1+(wave-40)/60*.8).toFixed(2)})));
console.log("\n[유닛 기본 단일 대상 환산 DPS: 특수효과 적용 전]");
console.table(units.map(([unit,damage,speed,role])=>({unit,role,baseDps:(damage*speed*2).toFixed(1)})));
console.log("\n[성녀 확률]");
console.table([{natural:`${(naturalSaintRate*100).toFixed(4)}%`,pity:`${(adjustedSaintRate*100).toFixed(4)}%`,averageHands:expectedHandsWithPity.toFixed(1),target:"약 0.2%"}]);

if(Math.abs(1+(100-40)/60*.8-1.8)>1e-9)throw new Error("100웨이브 하드 램프가 1.8배가 아닙니다.");
if(Math.abs(earlyHpMultiplier(1)-.65)>1e-9||Math.abs(earlyHpMultiplier(40)-.8)>1e-9||earlyHpMultiplier(55)!==1)throw new Error("초반 체력 완화 곡선이 잘못되었습니다.");
if(adjustedSaintRate<.0018||adjustedSaintRate>.0021)throw new Error("성녀 보정 확률이 0.2% 범위를 벗어났습니다.");
