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

function renderSolo(ctx: CanvasRenderingContext2D, elapsed: number, image: HTMLImageElement | null) {
  const t = elapsed / DURATION; background(ctx, elapsed, "solo");
  // A modern city/school world dissolves behind him.
  const cityFade = clamp(1 - (t - .45) * 3);
  ctx.globalAlpha = cityFade * .5; ctx.fillStyle = "#284361";
  for (let i = 0; i < 8; i++) { const h = 80 + (i * 47) % 150; ctx.fillRect(i * 49 - 10, 475 - h, 38, h); }
  ctx.globalAlpha = 1;
  const portal = ease((t - .25) * 3.2) * clamp(1 - (t - .79) * 5); drawPortal(ctx, elapsed, portal);
  for (let i = 0; i < 5; i++) drawReturnerEcho(ctx, image, 180 + Math.sin(i * 2.7) * (55 + i * 8), 300 - i * 20, clamp((t - .08) * 4) * (1 - t) * .22, "#72eaff");
  const stride = ease((t - .12) * 2.1);
  if (image) { ctx.save(); ctx.globalAlpha = clamp((t - .08) * 5); ctx.shadowColor = "#72eaff"; ctx.shadowBlur = 25; ctx.drawImage(image, 82, 122 - stride * 34, 196, 294); ctx.restore(); }
  const slash = clamp((t - .49) * 12) * clamp(1 - (t - .62) * 10);
  if (slash > 0) { ctx.save(); ctx.globalAlpha = slash; ctx.strokeStyle = "#eaffff"; ctx.shadowColor = "#65e8ff"; ctx.shadowBlur = 25; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(180, 346, 155, -2.5, .35); ctx.stroke(); ctx.restore(); }
  const depart = ease((t - .62) * 4); if (depart > 0) { ctx.fillStyle = `rgba(216,250,255,${depart * .85})`; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
  drawTitle(ctx, ease((t - .73) * 4.8), ["THE OTHERWORLDER", "AWAKENS"], "#7ceaff", "ONE UNUSED OTHERWORLDER · SECRET ENDING");
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
  if (image) { ctx.save(); ctx.globalAlpha = approach; ctx.shadowColor = "#bc6fff"; ctx.shadowBlur = 22; ctx.drawImage(image, 8, 170, 344, 221); ctx.restore(); }
  const impact = clamp((t - .52) * 15) * clamp(1 - (t - .72) * 7);
  if (impact > 0) {
    ctx.save(); ctx.translate(180, 328); ctx.globalCompositeOperation = "screen";
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
    <section className={styles.stage} aria-label={solo ? "The Otherworlder Awakens ending preview" : "Otherworlders' Compete rival duel ending preview"}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}/><div className={styles.scanlines}/>
      {!embedded && finished && <button className={styles.stageReplay} type="button" onClick={() => { window.location.href = `${ASSET_BASE}/`; }}>PLAY AGAIN?</button>}
    </section>
    {!embedded && <aside className={styles.controls}><span>SECRET ENDING · CANVAS SEQUENCE</span><strong>{solo ? "THE OTHERWORLDER AWAKENS" : "OTHERWORLDERS' COMPETE"}</strong><p>{solo ? "An unused otherworlder draws his sword and crosses from his school life into another world." : "Two otherworlders remember the same future. Only one will claim it."}</p><button type="button" onClick={() => setReplay(value => value + 1)}>REPLAY</button></aside>}
  </main>;
}
