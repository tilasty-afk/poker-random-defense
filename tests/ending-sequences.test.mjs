import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [seven, saintess, triumph, intro, i18n] = await Promise.all([
  readFile(new URL("../app/seven-card-preview/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/saintess-ending-preview/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/demon-triumph-preview/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/hidden-wave-intro.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
]);

test("세 엔딩은 임베디드 상태 확정 전 검은 전환 프레임만 렌더링한다", () => {
  for (const page of [seven, saintess, triumph]) {
    assert.match(page, /useState<boolean \| null>\(null\)/);
    assert.match(page, /if \(embedded === null\) return <main className=\{`\$\{styles\.previewPage\} \$\{styles\.embedded\}`\} aria-hidden="true"\/>/);
  }
});

test("세 엔딩은 필요한 이미지가 준비된 뒤 0초부터 애니메이션을 시작한다", () => {
  assert.match(seven, /art\.onload = \(\) => start\(art\)/);
  assert.doesNotMatch(seven, /frame = requestAnimationFrame\(animate\);\s*return \(\) => cancelAnimationFrame/);
  assert.match(saintess, /Promise\.all\(\[/);
  assert.match(saintess, /\.\.\.SKETCH_PATHS\.map\(loadImage\)/);
  assert.match(triumph, /Promise\.all\(\[/);
  assert.match(triumph, /demon-king-fallen\.png/);
});

test("히든 보스 등장 연출은 물음표 대신 언어별 등장 문구를 사용한다", () => {
  assert.match(intro, /<div className=\{styles\.unknown\}>\{label\}<\/div>/);
  assert.doesNotMatch(intro, />\?\?\?</);
  assert.match(i18n, /demonArrival:"대마왕 등장!"/);
  assert.match(i18n, /demonArrival:"THE DEMON KING APPEARS!"/);
  assert.match(i18n, /demonArrival:"大魔王降临！"/);
  assert.match(i18n, /demonArrival:"大魔王、出現！"/);
});
