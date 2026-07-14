import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("포커 랜덤 디펜스의 핵심 게임 화면을 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>포커 랜덤 디펜스<\/title>/);
  assert.match(html, /FORTRESS OF FATE/);
  assert.match(html, /WAVE/);
  assert.match(html, /내 유닛/);
  assert.match(html, /전체 공격력/);
  assert.match(html, /전체 공격속도/);
  assert.match(html, /족보 확정 &amp; 소환/);
});

test("7장 손패와 모바일 전투 조작을 제공한다", async () => {
  const html = await (await render()).text();
  const pokerCards = html.match(/class="[^"]*poker-card[^"]*"/g) ?? [];
  assert.equal(pokerCards.length, 7);
  assert.match(html, /선택 카드 교체/);
  assert.match(html, /전체 손패 교체/);
  assert.match(html, /웨이브 시작/);
  assert.match(html, /52 \+ 2J/);
  assert.match(html, /200/);
});

test("현재 전투·연출·모바일 규칙을 고정한다", async () => {
  const [page, css, audio] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/game-audio.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /elf:\s*"\\uAD81\\uC218"/);
  assert.match(page, /straight:\s*\{[\s\S]*?base:\s*\[15\.6,\s*40,\s*1\.25\]/);
  assert.match(page, /markExpirations\.set\(target\.id,\s*now \+ 2000\)/);
  assert.match(page, /markedMultiplier = markExpirations\.has\(id\) \? 1\.2 : 1/);
  assert.match(page, /장거리 \+ 피해 20% 표식/);
  assert.match(page, /lastAttackAtRef = useRef<Map<string, number>>/);
  assert.match(page, /attackInterval = 500 \/ Math\.max/);
  assert.match(page, /towerId: tower\.id,\s*expiresAt: now \+ 320/);
  assert.match(page, /attackFx\.some\(fx => fx\.towerId === tower\.id\) \? "attacking"/);
  assert.match(page, /fixedUtility = best\.category === "flush" \|\| best\.category === "fullHouse"/);
  assert.match(page, /fullHouse:\s*\{[\s\S]*?base:\s*\[15,\s*35,\s*\.95\]/);
  assert.match(page, /className="inventory-selection"/);
  assert.match(page, /판매가 \{sellValue\(selectedInventoryUnit\)\}G/);
  assert.match(page, /className="field-unit-actions"/);
  assert.match(page, /function sellTower\(\)/);
  assert.match(page, /className="hand-result summon-preview"/);
  assert.match(page, /className=\{`unit-dock/);
  assert.match(page, /className="summon-stats"/);
  assert.match(page, /setHand\(dealHand\(0\)\)/);
  assert.match(page, /initialDealRef\.current = true; setHand\(dealHand\(0\)\)/);
  assert.match(page, /const cost = selected\.length \* 5/);
  assert.match(page, /function redrawAll\(\)/);
  assert.match(page, /setGold\(v => v - 3\); setHand\(dealHand\(saintPity\)\)/);
  assert.match(page, /radius: 12,\s*expiresAt: now \+ 2000,[^}]+slow: \.5/);
  assert.match(page, /cursedHits\.add\(enemy\.id\)/);
  assert.match(page, /isPriestBuffed/);
  assert.match(page, /사제 버프 적용 중/);
  assert.match(page, /범위 35 내 아군 공격 \+20% · 속도 \+20%/);
  assert.match(css, /\.alchemy-pool\s*\{/);
  assert.match(css, /\.enemy\.cursed/);
  assert.match(css, /@keyframes enemy-hit-red/);
  assert.match(css, /@keyframes enemy-alchemy-dot/);
  assert.match(css, /@keyframes enemy-fate-dot/);
  assert.match(css, /@keyframes tower-fire-kick/);
  assert.match(css, /@keyframes projectile-flight/);
  assert.match(css, /\.grid-slot\.priest-buffed/);
  assert.match(page, /className="boss-health"/);
  assert.match(page, /function confirmRareSale/);
  assert.match(page, /희귀 유닛입니다/);
  assert.match(page, /useState<1 \| 2 \| 4 \| 8>\(1\)/);
  assert.match(page, /\(\[1, 2, 4, 8\] as const\)\.map/);
  assert.match(page, /className="speed-controls"/);
  assert.match(page, /elapsed \* gameSpeed/);
  assert.match(page, /enemy\.boss \? 20 : 1/);
  assert.match(page, /wave % 10 === 0 \? 1 : 40/);
  assert.match(page, /bossWaveReleaseRef\.current = gameClockRef\.current \+ 60000/);
  assert.match(page, /NEXT \$\{formatTimer\(bossWaveHold\)\}/);
  assert.match(page, /gameClockRef\.current \+ 120000/);
  assert.match(page, /BOSS TIME OVER/);
  assert.match(page, /completedBosses = Math\.floor\(\(wave - 1\) \/ 10\)/);
  assert.match(page, /강력한 단일 검기/);
  assert.match(css, /@keyframes alchemy-ground/);
  assert.match(css, /\.enemy\[title\*="이끼 슬라임"\]/);
  assert.match(css, /\.enemy\.boss-rank-10/);
  assert.match(css, /background-size:500% 400%/);
  assert.match(css, /grid-template-columns:repeat\(4,40px\) 64px/);
  assert.match(page, /createGameAudio/);
  assert.match(page, /playSound\("reroll"\)/);
  assert.match(page, /playSound\("upgrade"\)/);
  assert.match(audio, /class GameAudioController/);
  assert.match(audio, /playAttack\(category: AttackSound/);
  assert.match(audio, /maxVoices = 14/);
});
