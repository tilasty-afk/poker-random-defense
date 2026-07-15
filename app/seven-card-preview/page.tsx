"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./preview.module.css";

type CardKind = "spade" | "diamond" | "jokerBlack" | "jokerColor" | "jokerInvert" | "heart" | "club";

const CARD_ORDER: CardKind[] = ["spade", "diamond", "jokerBlack", "jokerColor", "jokerInvert", "heart", "club"];
const WIDTH = 360;
const HEIGHT = 640;
const DURATION = 4600;
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const EFFECT_ART = `${ASSET_BASE}/effects/seven-card-ending.png`;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const easeInOut = (value: number) => {
  const t = clamp(value);
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

function seeded(index: number) {
  const value = Math.sin(index * 917.37 + 17.13) * 43758.5453;
  return value - Math.floor(value);
}

function polygon(ctx: CanvasRenderingContext2D, points: Array<[number, number]>, fill: string) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawJester(ctx: CanvasRenderingContext2D, kind: CardKind) {
  const palette = kind === "jokerBlack"
    ? { dark: "#15191c", light: "#e7e2d2", accent: "#777c80" }
    : kind === "jokerColor"
      ? { dark: "#6b1d64", light: "#f0c760", accent: "#d53c46" }
      : { dark: "#082f35", light: "#d6edf0", accent: "#19b9ad" };
  ctx.fillStyle = palette.light;
  ctx.fillRect(-5, -3, 10, 10);
  ctx.fillStyle = palette.dark;
  ctx.fillRect(-7, 5, 14, 7);
  polygon(ctx, [[-8, -2], [-4, -14], [0, -5]], palette.dark);
  polygon(ctx, [[0, -5], [5, -15], [8, -1]], palette.accent);
  ctx.fillStyle = palette.light;
  ctx.fillRect(-6, -15, 3, 3);
  ctx.fillRect(4, -16, 3, 3);
  ctx.fillStyle = "#151515";
  ctx.fillRect(-3, 0, 2, 2);
  ctx.fillRect(2, 0, 2, 2);
  ctx.fillRect(-2, 5, 5, 1);
}

function drawCard(ctx: CanvasRenderingContext2D, kind: CardKind, x: number, y: number, rotation: number, scale: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#090b0a88";
  ctx.fillRect(-22, -31, 48, 66);
  ctx.fillStyle = "#fff8dc";
  ctx.fillRect(-24, -34, 48, 66);
  ctx.strokeStyle = kind.startsWith("joker") ? "#e0b758" : "#c89c48";
  ctx.lineWidth = 3;
  ctx.strokeRect(-24, -34, 48, 66);
  ctx.strokeStyle = "#6e582e";
  ctx.lineWidth = 1;
  ctx.strokeRect(-20, -30, 40, 58);
  if (kind.startsWith("joker")) {
    drawJester(ctx, kind);
  } else {
    const symbols: Record<string, string> = { spade: "♠", diamond: "♦", heart: "♥", club: "♣" };
    const red = kind === "diamond" || kind === "heart";
    ctx.fillStyle = red ? "#d52d3a" : "#171817";
    ctx.font = "bold 30px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbols[kind], 0, 0);
  }
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, radius: number, rotation: number, alpha: number) {
  ctx.save();
  ctx.translate(WIDTH / 2, 355);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#f4cc66";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  for (let index = 0; index < 12; index++) {
    const angle = index / 12 * Math.PI * 2;
    const inner = radius - (index % 3 === 0 ? 13 : 7);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

function phaseFor(time: number) {
  if (time < 900) return "카드 집결";
  if (time < 1750) return "운명진 개방";
  if (time < 2650) return "전장 소거";
  if (time < 3400) return "운명 정복";
  return "히든 엔딩";
}

function drawEffectArt(ctx: CanvasRenderingContext2D, art: HTMLImageElement, time: number, endFade: number) {
  const reveal = easeOut(time / 620) * (1 - endFade * .88);
  const zoom = 1.09 - easeOut(time / 1700) * .09;
  const shakePower = easeOut((time - 1150) / 200) * (1 - clamp((time - 2380) / 600)) * 3.2;
  const shakeX = Math.sin(time * .071) * shakePower;
  const shakeY = Math.cos(time * .059) * shakePower;
  const width = WIDTH * zoom, height = HEIGHT * zoom;
  ctx.save();
  ctx.globalAlpha = reveal;
  ctx.filter = `brightness(${.42 + reveal * .7}) saturate(${.65 + reveal * .72}) contrast(1.12)`;
  ctx.drawImage(art, (WIDTH - width) / 2 + shakeX, (HEIGHT - height) / 2 + shakeY, width, height);
  ctx.filter = "none";
  const colorSplit = clamp((time - 1450) / 180) * (1 - clamp((time - 2160) / 350));
  if (colorSplit > 0) {
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = colorSplit * .2;
    ctx.filter = "hue-rotate(125deg) saturate(2)";
    ctx.drawImage(art, -3, 0, WIDTH, HEIGHT);
    ctx.filter = "hue-rotate(-55deg) saturate(2)";
    ctx.drawImage(art, 3, 0, WIDTH, HEIGHT);
  }
  ctx.restore();
}

function drawRadiantBurst(ctx: CanvasRenderingContext2D, time: number) {
  const power = easeOut((time - 980) / 650) * (1 - clamp((time - 2850) / 600));
  if (power <= 0) return;
  ctx.save();
  ctx.translate(WIDTH / 2, 355);
  ctx.globalCompositeOperation = "screen";
  for (let index = 0; index < 28; index++) {
    const angle = index / 28 * Math.PI * 2 + time * (index % 2 ? .00012 : -.00009);
    const length = 80 + power * (100 + seeded(index + 900) * 170);
    ctx.rotate(angle - (index ? (index - 1) / 28 * Math.PI * 2 + time * ((index - 1) % 2 ? .00012 : -.00009) : 0));
    const ray = ctx.createLinearGradient(42, 0, length, 0);
    ray.addColorStop(0, "rgba(255,250,202,0)");
    ray.addColorStop(.25, index % 4 === 0 ? `rgba(73,255,237,${power * .75})` : `rgba(255,197,62,${power * .68})`);
    ray.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = ray;
    ctx.fillRect(42, -1 - index % 3, length, 2 + index % 3);
  }
  for (let ring = 0; ring < 4; ring++) {
    const wave = clamp((time - 1250 - ring * 170) / 700);
    if (wave <= 0 || wave >= 1) continue;
    ctx.globalAlpha = (1 - wave) * .9;
    ctx.strokeStyle = ring % 2 ? "#5ff8e9" : "#ffe28a";
    ctx.lineWidth = 4 - wave * 3;
    ctx.beginPath();
    ctx.arc(0, 0, 38 + wave * 235, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCardGlints(ctx: CanvasRenderingContext2D, time: number) {
  const positions = [[44, 226], [91, 199], [137, 179], [180, 171], [223, 179], [269, 199], [316, 226]];
  positions.forEach(([x, y], index) => {
    const start = 330 + index * 55;
    const localTime = time - start;
    const local = easeOut(localTime / 480) * (1 - clamp((localTime - 1080) / 650));
    if (local <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalCompositeOperation = "screen";
    const jokerBoost = index >= 2 && index <= 4 ? 1.35 : 1;
    const shimmer = .72 + Math.sin(localTime * .012 + index) * .28;
    const haloRadius = (32 + shimmer * 18) * jokerBoost;
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, haloRadius);
    halo.addColorStop(0, `rgba(255,255,246,${local * .92})`);
    halo.addColorStop(.18, index >= 2 && index <= 4 ? `rgba(101,255,236,${local * .58})` : `rgba(255,225,119,${local * .55})`);
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(-haloRadius, -haloRadius, haloRadius * 2, haloRadius * 2);

    for (let sparkle = 0; sparkle < 5; sparkle++) {
      const cycle = ((localTime * (.00075 + sparkle * .00012) + seeded(index * 19 + sparkle) * 1.4) % 1 + 1) % 1;
      const pulse = Math.sin(cycle * Math.PI);
      const angle = seeded(index * 41 + sparkle * 7) * Math.PI * 2 + localTime * .00035;
      const distance = 10 + seeded(index * 53 + sparkle * 11) * 36;
      const sx = Math.cos(angle) * distance;
      const sy = Math.sin(angle) * distance * .72;
      const size = (8 + sparkle * 2.2) * pulse * jokerBoost;
      ctx.globalAlpha = local * pulse;
      ctx.strokeStyle = sparkle % 2 ? "#fff8d2" : index >= 2 && index <= 4 ? "#8bfff2" : "#ffd86b";
      ctx.lineWidth = sparkle === 4 ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(sx - size, sy); ctx.lineTo(sx + size, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy - size); ctx.lineTo(sx, sy + size); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx - size * .45, sy - size * .45); ctx.lineTo(sx + size * .45, sy + size * .45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + size * .45, sy - size * .45); ctx.lineTo(sx - size * .45, sy + size * .45); ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(Math.round(sx - 2), Math.round(sy - 2), 5, 5);
    }
    ctx.restore();
  });
}

function renderFrame(ctx: CanvasRenderingContext2D, time: number, art: HTMLImageElement | null) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const endFade = clamp((time - 2500) / 850);
  const beam = easeInOut((time - 850) / 950) * (1 - clamp((time - 2850) / 500));
  const ringPower = easeOut((time - 650) / 850) * (1 - clamp((time - 2900) / 700));

  const background = ctx.createRadialGradient(180, 360, 15, 180, 360, 360);
  background.addColorStop(0, `rgba(19,76,63,${1 - endFade * .75})`);
  background.addColorStop(.55, "#092a22");
  background.addColorStop(1, "#030706");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (art) drawEffectArt(ctx, art, time, endFade);

  ctx.globalAlpha = .24 * (1 - endFade);
  ctx.strokeStyle = "#2c604b";
  ctx.lineWidth = 1;
  for (let x = 20; x < WIDTH; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 570); ctx.stroke();
  }
  for (let y = 250; y < 590; y += 32) {
    ctx.beginPath(); ctx.moveTo(15, y); ctx.lineTo(WIDTH - 15, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  drawRing(ctx, 76 + ringPower * 10, time * .0008, ringPower);
  drawRing(ctx, 112 + ringPower * 8, -time * .00055, ringPower * .82);
  if (ringPower > 0) {
    ctx.save();
    ctx.translate(WIDTH / 2, 355);
    ctx.rotate(time * .00035);
    ctx.globalAlpha = ringPower * .72;
    ctx.strokeStyle = "#71efe7";
    ctx.lineWidth = 2;
    for (let index = 0; index < 8; index++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(142, 0); ctx.stroke();
    }
    ctx.restore();
  }

  if (!art) CARD_ORDER.forEach((kind, index) => {
    const center = (CARD_ORDER.length - 1) / 2;
    const offset = index - center;
    const targetX = 180 + offset * 47;
    const targetY = 178 + Math.abs(offset) * 12;
    const delay = index * 55;
    const progress = easeOut((time - delay) / 820);
    const startX = index < center ? -60 : index > center ? WIDTH + 60 : 180;
    const startY = index === center ? -90 : 80 + Math.abs(offset) * 40;
    const rotation = mix((index - center) * -.38, offset * .075, progress);
    const vanish = 1 - clamp((time - 2600) / 500);
    drawCard(ctx, kind, mix(startX, targetX, progress), mix(startY, targetY, progress), rotation, .86 + progress * .14, progress * vanish);
  });
  else drawCardGlints(ctx, time);

  if (beam > 0) {
    const glow = ctx.createLinearGradient(135, 0, 225, 0);
    glow.addColorStop(0, "rgba(255,214,91,0)");
    glow.addColorStop(.3, `rgba(255,203,76,${beam * .8})`);
    glow.addColorStop(.5, `rgba(255,255,231,${beam})`);
    glow.addColorStop(.7, `rgba(255,203,76,${beam * .8})`);
    glow.addColorStop(1, "rgba(255,214,91,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(125, 0, 110, HEIGHT);
    ctx.fillStyle = `rgba(255,255,246,${beam})`;
    ctx.fillRect(174, 0, 12, HEIGHT);
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,242,153,${beam * .65})`;
    ctx.fillRect(159, 0, 42, HEIGHT);
    ctx.globalCompositeOperation = "source-over";
  }

  drawRadiantBurst(ctx, time);

  const burst = easeOut((time - 1550) / 900) * (1 - clamp((time - 2850) / 500));
  if (burst > 0) {
    for (let index = 0; index < 190; index++) {
      const angle = seeded(index) * Math.PI * 2;
      const distance = burst * (45 + seeded(index + 300) * 260);
      const x = 180 + Math.cos(angle) * distance;
      const y = 355 + Math.sin(angle) * distance;
      const size = 1 + Math.floor(seeded(index + 600) * 5);
      ctx.fillStyle = index % 11 === 0 ? "#ff4dac" : index % 5 === 0 ? "#54eee0" : index % 3 === 0 ? "#fffbe0" : "#f5c44f";
      ctx.globalAlpha = 1 - burst * .55;
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
    }
    ctx.globalAlpha = 1;
  }

  const flash = clamp((time - 2250) / 300) * (1 - clamp((time - 2670) / 420));
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,240,${flash * .94})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  const strobe = Math.max(0, Math.sin((time - 1180) * .018)) * clamp((time - 1180) / 180) * (1 - clamp((time - 2050) / 500));
  if (strobe > 0) {
    ctx.fillStyle = `rgba(255,246,205,${strobe * .18})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  const title = easeOut((time - 2920) / 700);
  if (title > 0) {
    ctx.fillStyle = `rgba(3,7,6,${title * .88})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = title;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f8e5a5";
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillText("HIDDEN ENDING", 180, 252);
    ctx.fillStyle = "#fff6cf";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("SEVEN CARD", 180, 292);
    ctx.fillStyle = "#58e7d8";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText("GAME CONQUERED", 180, 326);
    ctx.fillStyle = "#c9b87e";
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillText("ABSOLUTELY", 180, 368);
    ctx.fillStyle = "#fff0a8";
    ctx.shadowColor = "#ffc12f";
    ctx.shadowBlur = 14;
    ctx.font = "bold 25px Georgia, serif";
    ctx.fillText("EXCELLENT", 180, 397);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

export default function SevenCardPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replay, setReplay] = useState(0);
  const [phase, setPhase] = useState("카드 집결");
  const [embedded, setEmbedded] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setEmbedded(new URLSearchParams(window.location.search).get("embedded") === "1");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setFinished(false);
    let frame = 0;
    let startedAt = performance.now();
    let latestPhase = "";
    const art = new Image();
    let loadedArt: HTMLImageElement | null = null;
    art.onload = () => { loadedArt = art; startedAt = performance.now(); };
    art.src = EFFECT_ART;
    const animate = (now: number) => {
      const elapsed = Math.min(DURATION, now - startedAt);
      renderFrame(ctx, elapsed, loadedArt);
      const nextPhase = phaseFor(elapsed);
      if (nextPhase !== latestPhase) {
        latestPhase = nextPhase;
        setPhase(nextPhase);
      }
      if (elapsed < DURATION) frame = requestAnimationFrame(animate);
      else setFinished(true);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [replay]);

  return <main className={`${styles.previewPage} ${embedded ? styles.embedded : ""}`}>
    <section className={styles.stage} aria-label="세븐 카드 히든 엔딩 Canvas 미리보기">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}/>
      <div className={styles.scanlines}/>
      {!embedded && finished && <button className={styles.stageReplay} type="button" onClick={() => { window.location.href = `${ASSET_BASE}/`; }}>PLAY AGAIN?</button>}
    </section>
    {!embedded && <aside className={styles.controls}>
      <span>CANVAS SEQUENCE</span>
      <strong>{phase}</strong>
      <p>♠ → ♦ → 흑백 조커 → 컬러 조커 → 반전 조커 → ♥ → ♣</p>
      <button type="button" onClick={() => setReplay(value => value + 1)}>↻ 다시 보기</button>
    </aside>}
  </main>;
}
