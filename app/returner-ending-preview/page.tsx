"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./preview.module.css";

const WIDTH = 360;
const HEIGHT = 640;
const DURATION = 6400;
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type Mode = "solo" | "paradox";

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const seeded = (index: number, salt = 0) => {
  const value = Math.sin(index * 83.771 + salt * 31.177) * 43758.5453;
  return value - Math.floor(value);
};
const subscribeToLocation = () => () => undefined;

function drawStudent(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, facing: 1 | -1, sword: number, palette: "blue" | "red") {
  const accent = palette === "blue" ? "#55dbff" : "#ff4f79";
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 13;
  // Legs and shoes.
  ctx.fillStyle = "#111a2b"; ctx.fillRect(-16, 53, 13, 45); ctx.fillRect(5, 53, 13, 45);
  ctx.fillStyle = "#e9edf2"; ctx.fillRect(-20, 94, 18, 7); ctx.fillRect(5, 94, 19, 7);
  // School blazer, shirt and tie.
  ctx.fillStyle = palette === "blue" ? "#263c60" : "#562841";
  ctx.beginPath(); ctx.moveTo(-28, -4); ctx.lineTo(28, -4); ctx.lineTo(23, 61); ctx.lineTo(-24, 61); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f2f5f3"; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(12, -3); ctx.lineTo(5, 37); ctx.lineTo(-4, 37); ctx.closePath(); ctx.fill();
  ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(-3, 4); ctx.lineTo(5, 4); ctx.lineTo(8, 35); ctx.lineTo(0, 43); ctx.lineTo(-5, 35); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#121827"; ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(-24, 1, 48, 58);
  // Head, hair and glasses.
  ctx.fillStyle = "#edc7a4"; ctx.fillRect(-18, -42, 36, 39);
  ctx.fillStyle = "#171b28"; ctx.fillRect(-21, -49, 42, 14); ctx.fillRect(-21, -38, 8, 16); ctx.fillRect(13, -37, 8, 9);
  ctx.strokeStyle = "#d9f5ff"; ctx.lineWidth = 2; ctx.strokeRect(-15, -29, 12, 9); ctx.strokeRect(4, -29, 12, 9);
  ctx.beginPath(); ctx.moveTo(-3, -25); ctx.lineTo(4, -25); ctx.stroke();
  ctx.fillStyle = "#172138"; ctx.fillRect(-10, -26, 3, 3); ctx.fillRect(9, -26, 3, 3);
  // Sword arm and drawn blade.
  const angle = -1.1 + sword * .92;
  ctx.save(); ctx.translate(20, 12); ctx.rotate(angle);
  ctx.fillStyle = "#edc7a4"; ctx.fillRect(-4, 0, 9, 38);
  ctx.fillStyle = "#e8b64b"; ctx.fillRect(-11, 35, 23, 6); ctx.fillStyle = "#554034"; ctx.fillRect(-4, 40, 8, 18);
  ctx.shadowColor = "#e8fbff"; ctx.shadowBlur = 18 + sword * 15;
  const blade = ctx.createLinearGradient(-4, 58, 4, 58); blade.addColorStop(0, accent); blade.addColorStop(.5, "#ffffff"); blade.addColorStop(1, "#c4eeff");
  ctx.fillStyle = blade; ctx.beginPath(); ctx.moveTo(-4, 56); ctx.lineTo(4, 56); ctx.lineTo(2, 142); ctx.lineTo(0, 153); ctx.lineTo(-2, 142); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawReturnerEcho(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, x: number, y: number, alpha: number, tint: string) {
  if (!image || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "screen"; ctx.filter = "grayscale(1) contrast(1.5)";
  ctx.shadowColor = tint; ctx.shadowBlur = 22; ctx.drawImage(image, x - 48, y - 48, 96, 96); ctx.restore();
}

function drawPortal(ctx: CanvasRenderingContext2D, elapsed: number, power: number) {
  ctx.save(); ctx.translate(180, 236); ctx.globalCompositeOperation = "screen";
  for (let ring = 0; ring < 6; ring++) {
    ctx.rotate((ring % 2 ? -1 : 1) * elapsed * .00018);
    ctx.globalAlpha = power * (.9 - ring * .1); ctx.strokeStyle = ring % 2 ? "#7cecff" : "#876dff"; ctx.lineWidth = 5 - ring * .55;
    ctx.beginPath(); ctx.ellipse(0, 0, 58 + ring * 13, 87 + ring * 16, 0, 0, Math.PI * 2); ctx.stroke();
  }
  const core = ctx.createRadialGradient(0, 0, 2, 0, 0, 96); core.addColorStop(0, `rgba(255,255,255,${power})`); core.addColorStop(.3, `rgba(76,224,255,${power * .72})`); core.addColorStop(1, "rgba(64,64,255,0)");
  ctx.fillStyle = core; ctx.fillRect(-120, -145, 240, 290); ctx.restore();
}

function drawAwakeningAura(ctx: CanvasRenderingContext2D, elapsed: number, power: number) {
  if (power <= 0) return;
  const pulse = .82 + Math.sin(elapsed * .006) * .18;
  ctx.save();
  ctx.translate(180, 278);
  ctx.globalCompositeOperation = "screen";
  const halo = ctx.createRadialGradient(0, 0, 12, 0, 0, 150);
  halo.addColorStop(0, `rgba(238,253,255,${power * .88})`);
  halo.addColorStop(.28, `rgba(91,222,255,${power * .42})`);
  halo.addColorStop(.65, `rgba(101,119,255,${power * .2})`);
  halo.addColorStop(1, "rgba(30,54,180,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(-180, -210, 360, 420);
  ctx.strokeStyle = `rgba(145,238,255,${power * .62})`;
  ctx.shadowColor = "#65eaff";
  ctx.shadowBlur = 20;
  for (let ring = 0; ring < 3; ring++) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 5, (72 + ring * 27) * pulse, (118 + ring * 31) * pulse, elapsed * .00008 * (ring % 2 ? -1 : 1), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let ray = 0; ray < 18; ray++) {
    const angle = ray * Math.PI * 2 / 18 + elapsed * .00012;
    const inner = 62 + (ray % 3) * 8;
    const outer = 145 + (ray % 4) * 13;
    ctx.globalAlpha = power * (.22 + (ray % 3) * .11);
    ctx.lineWidth = ray % 4 === 0 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner * 1.28);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer * 1.28);
    ctx.stroke();
  }
  ctx.restore();
}

function background(ctx: CanvasRenderingContext2D, elapsed: number, mode: Mode) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, mode === "solo" ? "#111936" : "#260b22"); gradient.addColorStop(.55, "#07101f"); gradient.addColorStop(1, "#02030a");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = mode === "solo" ? "#5c81ad33" : "#ff4c8838"; ctx.lineWidth = 1;
  for (let x = -HEIGHT; x < WIDTH + HEIGHT; x += 48) { ctx.beginPath(); ctx.moveTo(x + (elapsed * .012) % 48, 0); ctx.lineTo(x - HEIGHT + (elapsed * .012) % 48, HEIGHT); ctx.stroke(); }
  for (let i = 0; i < 75; i++) {
    const x = (seeded(i) * WIDTH + elapsed * (.008 + seeded(i, 2) * .02)) % WIDTH;
    const y = seeded(i, 1) * HEIGHT; ctx.globalAlpha = .2 + .7 * Math.abs(Math.sin(elapsed * .003 + i));
    ctx.fillStyle = i % 5 ? (mode === "solo" ? "#77dcff" : "#ff5687") : "#ffffff"; ctx.fillRect(x, y, i % 11 ? 2 : 4, i % 11 ? 2 : 4);
  }
  ctx.globalAlpha = 1;
}

function drawKnowledgeCircuit(ctx: CanvasRenderingContext2D, elapsed: number, power: number) {
  if (power <= 0) return;
  ctx.save(); ctx.translate(180, 292); ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(92,225,255,${power * .72})`; ctx.fillStyle = `rgba(201,249,255,${power})`; ctx.shadowColor = "#55ddff"; ctx.shadowBlur = 12;
  for (let ring = 0; ring < 4; ring++) {
    const radius = 62 + ring * 29; ctx.lineWidth = ring === 0 ? 3 : 1.5; ctx.setLineDash([5 + ring * 2, 5]); ctx.lineDashOffset = elapsed * .025 * (ring % 2 ? -1 : 1);
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
    for (let node = 0; node < 6 + ring * 2; node++) { const angle = node * Math.PI * 2 / (6 + ring * 2) + elapsed * .00022 * (ring % 2 ? -1 : 1); ctx.fillRect(Math.cos(angle) * radius - 2, Math.sin(angle) * radius - 2, 4, 4); }
  }
  ctx.setLineDash([]);
  for (let line = 0; line < 12; line++) { const angle = line * Math.PI / 6 + elapsed * .00008; ctx.globalAlpha = power * (.35 + (line % 3) * .16); ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 50, Math.sin(angle) * 50); ctx.lineTo(Math.cos(angle) * 168, Math.sin(angle) * 168); ctx.stroke(); }
  ctx.restore();
}

function drawProgressGlyphs(ctx: CanvasRenderingContext2D, elapsed: number, power: number) {
  if (power <= 0) return;
  const glyphs = ["GEAR", "STEEL", "MANA", "ENGINE", "AETHER", "LOGIC"];
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.textAlign = "center"; ctx.font = "bold 8px 'Courier New', monospace";
  glyphs.forEach((glyph, index) => { const angle = index * Math.PI / 3 + elapsed * .00015, radius = 132 + Math.sin(elapsed * .002 + index) * 8, x = 180 + Math.cos(angle) * radius, y = 292 + Math.sin(angle) * radius * .72; ctx.globalAlpha = power * (.55 + .35 * Math.abs(Math.sin(elapsed * .004 + index))); ctx.fillStyle = index % 2 ? "#80ecff" : "#ffffff"; ctx.shadowColor = "#42dfff"; ctx.shadowBlur = 9; ctx.fillText(glyph, x, y); });
  ctx.restore();
}

function renderSolo(ctx: CanvasRenderingContext2D, elapsed: number, image: HTMLImageElement | null) {
  const t = elapsed / DURATION; background(ctx, elapsed, "solo");
  const oldWorld = clamp(1 - (t - .34) * 4);
  ctx.save(); ctx.globalAlpha = oldWorld * .46; ctx.fillStyle = "#243c5d"; ctx.fillRect(32, 352, 296, 118); ctx.fillStyle = "#8edff0";
  for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++) ctx.fillRect(47 + col * 40, 368 + row * 27, 19, 10);
  ctx.fillStyle = "#111a2b"; ctx.beginPath(); ctx.moveTo(18, 353); ctx.lineTo(180, 270); ctx.lineTo(342, 353); ctx.closePath(); ctx.fill(); ctx.restore();
  const arrival = ease((t - .08) * 3.2), invention = ease((t - .3) * 3.8) * clamp(1 - (t - .72) * 5);
  drawKnowledgeCircuit(ctx, elapsed, invention); drawProgressGlyphs(ctx, elapsed, invention);
  const portal = ease((t - .18) * 3.8) * clamp(1 - (t - .76) * 5); drawPortal(ctx, elapsed, portal);
  for (let i = 0; i < 7; i++) drawReturnerEcho(ctx, image, 180 + Math.sin(i * 2.31) * (42 + i * 7), 310 - i * 16, arrival * clamp(1 - (t - .55) * 4) * .2, "#72eaff");
  drawAwakeningAura(ctx, elapsed, ease((t - .14) * 3.1) * clamp(1 - (t - .73) * 5));
  if (image) { const rise = ease((t - .1) * 2.5); ctx.save(); ctx.globalAlpha = arrival; ctx.shadowColor = "#72eaff"; ctx.shadowBlur = 18 + invention * 38; ctx.drawImage(image, 76, 126 - rise * 34, 208, 312); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = invention * .3; ctx.drawImage(image, 72, 122 - rise * 34, 216, 324); ctx.restore(); }
  const revelation = clamp((t - .5) * 13) * clamp(1 - (t - .66) * 8);
  if (revelation > 0) { ctx.save(); ctx.translate(180, 286); ctx.globalCompositeOperation = "screen"; for (let ray = 0; ray < 30; ray++) { const angle = ray * Math.PI * 2 / 30; ctx.globalAlpha = revelation * (.25 + (ray % 4) * .12); ctx.strokeStyle = ray % 3 ? "#74e7ff" : "#ffffff"; ctx.lineWidth = ray % 5 === 0 ? 5 : 2; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * 28, Math.sin(angle) * 28); ctx.lineTo(Math.cos(angle) * (150 + ray % 4 * 12), Math.sin(angle) * (150 + ray % 4 * 12)); ctx.stroke(); } ctx.restore(); }
  const transition = ease((t - .64) * 5); if (transition > 0) { const flash = ctx.createRadialGradient(180, 292, 5, 180, 292, 290); flash.addColorStop(0, `rgba(255,255,255,${transition * .96})`); flash.addColorStop(.36, `rgba(97,225,255,${transition * .7})`); flash.addColorStop(1, `rgba(4,8,22,${transition * .98})`); ctx.fillStyle = flash; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
  drawTitle(ctx, ease((t - .72) * 5), ["THE OTHERWORLDER", "ARRIVES"], "#7ceaff", "MAGIC BECAME SCIENCE - A NEW AGE BEGAN");
}

function renderParadox(ctx: CanvasRenderingContext2D, elapsed: number, image: HTMLImageElement | null) {
  const t = elapsed / DURATION; background(ctx, elapsed, "paradox");
  // Rival timelines split the screen and pull toward a single duel.
  const converge = ease((t - .1) * 2.5);
  ctx.save(); ctx.globalAlpha = .5 * converge; ctx.strokeStyle = "#f5f7ff"; ctx.shadowColor = "#bc6fff"; ctx.shadowBlur = 17;
  for (let i = 0; i < 12; i++) { ctx.lineWidth = i % 3 === 0 ? 3 : 1; ctx.beginPath(); ctx.moveTo(180, 325); ctx.lineTo(i % 2 ? 0 : WIDTH, 40 + i * 51); ctx.stroke(); }
  ctx.restore();
  for (let i = 0; i < 8; i++) drawReturnerEcho(ctx, image, i % 2 ? 70 : 290, 115 + i * 52, clamp((t - .06 - i * .015) * 3) * clamp(1 - (t - .55) * 4) * .24, i % 2 ? "#51dbff" : "#ff3f71");
  const approach = ease((t - .18) * 2.8);
  if (image) {
    const imageScale = .93 + approach * .07;
    const imageWidth = 344 * imageScale;
    const imageHeight = imageWidth * 9 / 16;
    ctx.save();
    ctx.globalAlpha = approach;
    ctx.shadowColor = "#bc6fff";
    ctx.shadowBlur = 22;
    ctx.drawImage(image, 180 - imageWidth / 2, 276 - imageHeight / 2, imageWidth, imageHeight);
    ctx.restore();
  }
  const impact = clamp((t - .52) * 15) * clamp(1 - (t - .72) * 7);
  if (impact > 0) {
    ctx.save(); ctx.translate(180, 276); ctx.globalCompositeOperation = "screen";
    const burst = ctx.createRadialGradient(0, 0, 0, 0, 0, 155 * impact); burst.addColorStop(0, `rgba(255,255,255,${impact})`); burst.addColorStop(.2, `rgba(205,99,255,${impact})`); burst.addColorStop(1, "rgba(70,190,255,0)"); ctx.fillStyle = burst; ctx.fillRect(-180, -180, 360, 360);
    for (let i = 0; i < 32; i++) { const a = i * 2.399; ctx.strokeStyle = i % 2 ? "#48eaff" : "#ff487e"; ctx.globalAlpha = impact; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (50 + impact * 170), Math.sin(a) * (50 + impact * 170)); ctx.stroke(); }
    ctx.restore();
  }
  const split = ease((t - .62) * 5); if (split > 0) { ctx.fillStyle = `rgba(4,3,15,${split * .88})`; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
  drawTitle(ctx, ease((t - .7) * 5), ["OTHERWORLDERS'", "COMPETE"], "#ef6dff", "TWO RIVALS · ONE DESTINY");
}

function drawTitle(ctx: CanvasRenderingContext2D, alpha: number, lines: [string, string], accent: string, caption: string) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = 18; ctx.font = "bold 10px 'Courier New', monospace"; ctx.fillText("SECRET ENDING", 180, 244);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 31px Georgia, serif"; ctx.fillText(lines[0], 180, 289); ctx.font = "bold 39px Georgia, serif"; ctx.fillText(lines[1], 180, 332);
  ctx.shadowBlur = 8; ctx.fillStyle = accent; ctx.font = "bold 9px 'Courier New', monospace"; ctx.fillText(caption, 180, 374); ctx.restore();
}

export default function ReturnerEndingPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const search = useSyncExternalStore(subscribeToLocation, () => window.location.search, () => "");
  const query = new URLSearchParams(search);
  const mode: Mode = query.get("mode") === "paradox" ? "paradox" : "solo";
  const embedded = query.get("embedded") === "1";
  const [replay, setReplay] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    setFinished(false); let frame = 0; let ready: HTMLImageElement | null = null;
    const image = new Image(); image.onload = () => { ready = image; }; image.src = mode === "paradox" ? `${ASSET_BASE}/sprites/endings/otherworlders-compete.png` : `${ASSET_BASE}/sprites/endings/otherworlder-solo.png`;
    const started = performance.now();
    const animate = (now: number) => { const elapsed = Math.min(DURATION, now - started); ctx.clearRect(0, 0, WIDTH, HEIGHT); ctx.imageSmoothingEnabled = false; if (mode === "paradox") renderParadox(ctx, elapsed, ready); else renderSolo(ctx, elapsed, ready); if (elapsed < DURATION) frame = requestAnimationFrame(animate); else setFinished(true); };
    frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame);
  }, [mode, replay]);

  const solo = mode === "solo";
  return <main className={`${styles.previewPage} ${embedded ? styles.embedded : ""}`}>
    <section className={styles.stage} aria-label={solo ? "The Otherworlder Arrives ending preview" : "Otherworlders' Compete rival duel ending preview"}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}/><div className={styles.scanlines}/>
      {!embedded && finished && <button className={styles.stageReplay} type="button" onClick={() => { window.location.href = `${ASSET_BASE}/`; }}>PLAY AGAIN?</button>}
    </section>
    {!embedded && <aside className={styles.controls}><span>SECRET ENDING - CANVAS SEQUENCE</span><strong>{solo ? "THE OTHERWORLDER ARRIVES" : "OTHERWORLDERS' COMPETE"}</strong><p>{solo ? "Knowledge from another world transformed the kingdom. Steel became engines, magic became science, and a new technological age began." : "Two otherworlders remember the same future. Only one will claim it."}</p><button type="button" onClick={() => setReplay(value => value + 1)}>REPLAY</button></aside>}
  </main>;
}
