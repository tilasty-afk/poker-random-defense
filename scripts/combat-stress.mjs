import { performance } from "node:perf_hooks";

const enemyCount=200,towerCount=100,ticks=120;
const enemies=Array.from({length:enemyCount},(_,id)=>({id,x:(id*37)%100,y:(id*61)%100,hp:10000}));
const towers=Array.from({length:towerCount},(_,id)=>({id,x:(id*17)%100,y:(id*29)%100,range:18+(id%4)*7,damage:4+(id%12)}));
let checksum=0;
const started=performance.now();
for(let tick=0;tick<ticks;tick++){
  for(const tower of towers){
    let target=null,bestProgress=-1;
    for(const enemy of enemies){
      const dx=tower.x-enemy.x,dy=tower.y-enemy.y;
      if(dx*dx+dy*dy<=tower.range*tower.range&&enemy.id>bestProgress){target=enemy;bestProgress=enemy.id}
    }
    if(target){target.hp-=tower.damage;checksum+=target.id+tower.damage}
  }
  for(const enemy of enemies){enemy.x=(enemy.x+.17)%100;enemy.y=(enemy.y+.11)%100}
}
const elapsed=performance.now()-started;
const operations=enemyCount*towerCount*ticks;
console.log(`[전투 부하 검사] 적 ${enemyCount} · 타워 ${towerCount} · ${ticks}틱`);
console.log(`${operations.toLocaleString()}회 거리 판정 · ${elapsed.toFixed(1)}ms · 틱당 ${(elapsed/ticks).toFixed(2)}ms`);
if(!Number.isFinite(checksum)||checksum<=0)throw new Error("전투 부하 검사 결과가 올바르지 않습니다.");
if(elapsed/ticks>20)console.warn("경고: 현재 환경에서 한 틱 계산이 20ms를 넘었습니다.");
