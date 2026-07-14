import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/seven-card-preview/page.tsx", import.meta.url), "utf8");

test("세븐 카드 히든 엔딩 Canvas 시퀀스를 제공한다", () => {
  assert.match(page, /const CARD_ORDER: CardKind\[\] = \["spade", "diamond", "jokerBlack", "jokerColor", "jokerInvert", "heart", "club"\]/);
  assert.match(page, /<canvas ref=\{canvasRef\}/);
  assert.match(page, /requestAnimationFrame\(animate\)/);
  assert.match(page, /HIDDEN ENDING/);
  assert.match(page, /GAME CONQUERED/);
  assert.doesNotMatch(page, /FATE CONQUERED/);
  assert.match(page, /fillText\("ABSOLUTELY", 180, 368\)/);
  assert.match(page, /fillText\("EXCELLENT", 180, 397\)/);
  assert.match(page, /font = "bold 460px Georgia, serif"/);
  assert.match(page, /createRadialGradient\(180, 320, 10, 180, 320, 230\)/);
  assert.match(page, /fillRect\(-50, 90, 460, 460\)/);
  assert.match(page, /fillText\("7", 180, 320\)/);
  assert.match(page, /URLSearchParams\(window\.location\.search\)/);
  assert.match(page, /styles\.embedded/);
  assert.doesNotMatch(page, /THE FORTRESS ENDURES BEYOND DESTINY/);
  assert.match(page, /const shimmer = \.72 \+ Math\.sin/);
  assert.match(page, /for \(let sparkle = 0; sparkle < 5; sparkle\+\+\)/);
  assert.match(page, /↻ 다시 보기/);
});
