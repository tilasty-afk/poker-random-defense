"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../seven-card-preview/preview.module.css";

const WIDTH = 360;
const HEIGHT = 640;
const DURATION = 6000;
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type Locale = "ko" | "en" | "zh" | "ja";
const COPY: Record<Locale, { sub: string; phase: string; replay: string }> = {
  ko: { sub: "DEMON KING VANQUISHED", phase: "The final assault begins", replay: "REPLAY" },
  en: { sub: "DEMON KING VANQUISHED", phase: "The final assault begins", replay: "Replay" },
  zh: { sub: "DEMON KING VANQUISHED", phase: "The final assault begins", replay: "REPLAY" },
  ja: { sub: "DEMON KING VANQUISHED", phase: "The final assault begins", replay: "REPLAY" },
};
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const seeded = (index: number, salt: number) => {
  const value = Math.sin(index * 91.731 + salt * 47.117) * 43758.5453;
  return value - Math.floor(value);
};

function drawProjectile(ctx: CanvasRenderingContext2D, elapsed: number, index: number) {
  const side = Math.floor(seeded(index, 1) * 4);
  const edgePosition = seeded(index, 2);
  const startX = side === 0 ? -30 : side === 1 ? 390 : 25 + edgePosition * 310;
  const startY = side < 2 ? 70 + edgePosition * 490 : side === 2 ? -30 : 670;
  const delay = 100 + (index % 48) * 38 + Math.floor(index / 48) * 260;
  const progress = ease((elapsed - delay) / 900);
  if (progress <= 0 || progress >= 1) return;
  const impactX = 180 + seeded(index, 4) * 55 - 27;
  const impactY = 315 + seeded(index, 5) * 70 - 35;
  const x = startX + (impactX - startX) * progress;
  const y = startY + (impactY - startY) * progress;
  const angle = Math.atan2(impactY - startY, impactX - startX);
  const kind = Math.floor(seeded(index, 3) * 5);
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.sin(progress * Math.PI) * 1.8);
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);
  ctx.imageSmoothingEnabled = false;
  if (kind === 0) {
    // Arrow: wooden shaft, pale fletching and a bright steel point.
    ctx.shadowColor = "#ffe89a"; ctx.shadowBlur = 8;
    ctx.strokeStyle = "#b8782f"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(7, 0); ctx.stroke();
    ctx.fillStyle = "#e8edf0";
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(5, -4); ctx.lineTo(5, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f2eee0";
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-24, -5); ctx.lineTo(-22, 0); ctx.lineTo(-24, 5); ctx.closePath(); ctx.fill();
  } else if (kind === 1) {
    // Thrown spear.
    ctx.shadowColor = "#6fe9ff"; ctx.shadowBlur = 11;
    ctx.strokeStyle = "#86633a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(11, 0); ctx.stroke();
    ctx.fillStyle = "#a8efff";
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(8, -6); ctx.lineTo(8, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.stroke();
  } else if (kind === 2) {
    // Flying sword, rotating slightly while travelling.
    ctx.rotate(elapsed * .012 + index);
    ctx.shadowColor = "#f5f5ff"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#dceaff"; ctx.fillRect(-3, -20, 6, 31);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(-1, -19, 2, 27);
    ctx.fillStyle = "#f2bd4d"; ctx.fillRect(-10, 10, 20, 4); ctx.fillRect(-2, 13, 4, 8);
    ctx.beginPath(); ctx.moveTo(-3, -20); ctx.lineTo(0, -27); ctx.lineTo(3, -20); ctx.closePath(); ctx.fillStyle = "#ffffff"; ctx.fill();
  } else if (kind === 3) {
    // Fireball with a turbulent flame tail.
    ctx.shadowColor = "#ff3b18"; ctx.shadowBlur = 18;
    const flame = ctx.createRadialGradient(3, 0, 1, 3, 0, 13);
    flame.addColorStop(0, "#ffffff"); flame.addColorStop(.25, "#ffe65c"); flame.addColorStop(.62, "#ff6a20"); flame.addColorStop(1, "#9e0810");
    ctx.fillStyle = flame; ctx.beginPath(); ctx.arc(3, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff7a20";
    ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(-29, 0); ctx.lineTo(-7, 9); ctx.lineTo(-15, 0); ctx.closePath(); ctx.fill();
  } else {
    // Fast throwing dagger.
    ctx.rotate(Math.sin(index * 4.1 + elapsed * .018) * .35);
    ctx.shadowColor = "#b9f7ff"; ctx.shadowBlur = 9;
    ctx.fillStyle = "#edfaff";
    ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-5, -4); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#d7a642"; ctx.fillRect(-8, -6, 3, 12);
    ctx.fillStyle = "#6a3d25"; ctx.fillRect(-16, -3, 8, 6);
    ctx.fillStyle = "#f4d36c"; ctx.fillRect(-18, -4, 3, 8);
  }
  ctx.restore();

  if (progress > .82) {
    ctx.save();
    ctx.globalAlpha = (progress - .82) / .18;
    ctx.fillStyle = kind === 3 ? "#ff9b35" : kind === 1 ? "#74efff" : "#fff1a1";
    for (let spark = 0; spark < 4; spark++) {
      const a = index * 1.7 + spark * Math.PI / 2;
      const distance = (progress - .82) * 75;
      ctx.fillRect(impactX + Math.cos(a) * distance, impactY + Math.sin(a) * distance, 2, 2);
    }
    ctx.restore();
  }
}

function render(ctx: CanvasRenderingContext2D, elapsed: number, demon: HTMLImageElement | null, victoryArt: HTMLImageElement | null, locale: Locale) {
  const t = elapsed / DURATION;
  const copy = COPY[locale];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bg.addColorStop(0, "#071317");
  bg.addColorStop(.55, "#14100d");
  bg.addColorStop(1, "#020303");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 70; i++) {
    const x = (i * 89 + elapsed * (.015 + i % 3 * .006)) % 390 - 15;
    const y = (i * 53) % HEIGHT;
    ctx.globalAlpha = .18 + .4 * Math.abs(Math.sin(i + elapsed * .002));
    ctx.fillStyle = i % 4 ? "#2bd5dd" : "#ffb72b";
    ctx.fillRect(x, y, i % 8 === 0 ? 4 : 2, i % 8 === 0 ? 4 : 2);
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 144; i++) drawProjectile(ctx, elapsed, i);
  const hit = clamp((t - .18) * 2.2);
  const defeat = ease((t - .55) * 4);
  if (demon && defeat < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - defeat;
    ctx.translate(180 + Math.sin(elapsed * .07) * hit * 4, 315);
    ctx.scale(1 + hit * .08, 1 - defeat * .42);
    ctx.shadowColor = t < .5 ? "#ff361d" : "#ffffff";
    ctx.shadowBlur = 24 + hit * 34;
    ctx.drawImage(demon, -82, -82, 164, 164);
    ctx.restore();
  }

  if (t > .48) {
    const blast = ease((t - .48) * 5) * clamp(1 - (t - .75) * 4);
    const radial = ctx.createRadialGradient(180, 315, 0, 180, 315, 240 * blast);
    radial.addColorStop(0, `rgba(255,255,255,${blast})`);
    radial.addColorStop(.18, `rgba(255,214,76,${blast})`);
    radial.addColorStop(.52, `rgba(42,218,255,${blast * .65})`);
    radial.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 50, WIDTH, 530);
  }

  if (t > .52) for (let i = 0; i < 48; i++) {
    const angle = i * 2.399;
    const distance = ease((t - .52) * 2.4) * (40 + (i * 31) % 210);
    ctx.globalAlpha = clamp(1 - (t - .78) * 3);
    ctx.fillStyle = i % 3 === 0 ? "#ffffff" : i % 2 ? "#44edff" : "#ffcf49";
    ctx.fillRect(180 + Math.cos(angle) * distance, 315 + Math.sin(angle) * distance, i % 7 === 0 ? 5 : 2, i % 7 === 0 ? 5 : 2);
  }
  ctx.globalAlpha = 1;

  const artReveal = ease((t - .59) * 5);
  if (victoryArt && artReveal > 0) {
    const zoom = 1 + artReveal * .035;
    const drawWidth = WIDTH * zoom, drawHeight = HEIGHT * zoom;
    ctx.save();
    ctx.globalAlpha = artReveal;
    ctx.drawImage(victoryArt, (WIDTH - drawWidth) / 2, (HEIGHT - drawHeight) / 2, drawWidth, drawHeight);
    const titleShade = ctx.createLinearGradient(0, 0, 0, 205);
    titleShade.addColorStop(0, "rgba(2,5,8,.78)");
    titleShade.addColorStop(.58, "rgba(2,5,8,.35)");
    titleShade.addColorStop(1, "rgba(2,5,8,0)");
    ctx.fillStyle = titleShade;
    ctx.fillRect(0, 0, WIDTH, 205);
    ctx.restore();
  }

  const title = ease((t - .7) * 5);
  ctx.save();
  ctx.globalAlpha = title;
  ctx.textAlign = "center";
  ctx.shadowColor = "#ffc83d";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#fff4ba";
  ctx.font = "bold 34px Georgia, serif";
  ctx.fillText("ABSOLUTE", 180, 88);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px Georgia, serif";
  ctx.fillText("TRIUMPH", 180, 136);
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#70edff";
  ctx.font = locale === "en" ? "bold 11px 'Courier New', monospace" : "bold 17px Georgia, serif";
  ctx.fillText(copy.sub, 180, 169);
  ctx.restore();
}

export default function DemonTriumphPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replay, setReplay] = useState(0);
  const [embedded, setEmbedded] = useState(false);
  const [locale, setLocale] = useState<Locale>("ko");
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    setFinished(false);
    const query = new URLSearchParams(window.location.search);
    setEmbedded(query.get("embedded") === "1");
    const requested = query.get("locale") as Locale | null;
    if (requested && requested in COPY) setLocale(requested);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setFinished(false);
    const demon = new Image();
    const victoryArt = new Image();
    let ready: HTMLImageElement | null = null;
    let victoryReady: HTMLImageElement | null = null;
    demon.onload = () => { ready = demon; };
    victoryArt.onload = () => { victoryReady = victoryArt; };
    demon.src = `${ASSET_BASE}/sprites/enemies/hidden-demon-lord.png`;
    victoryArt.src = `${ASSET_BASE}/effects/demon-king-fallen.png`;
    const started = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const elapsed = Math.min(DURATION, now - started);
      render(ctx, elapsed, ready, victoryReady, locale);
      if (elapsed < DURATION) frame = requestAnimationFrame(animate);
      else setFinished(true);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [locale, replay]);
  const copy = COPY[locale];
  return <main className={`${styles.previewPage} ${embedded ? styles.embedded : ""}`}>
    <section className={styles.stage} aria-label={`ABSOLUTE TRIUMPH · ${copy.sub}`}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}/>
      <div className={styles.scanlines}/>
      {!embedded && finished && <button className={styles.stageReplay} type="button" onClick={() => { window.location.href = `${ASSET_BASE}/`; }}>PLAY AGAIN?</button>}
    </section>
    {!embedded && <aside className={styles.controls}>
      <span>DIRECT CLEAR · CANVAS SEQUENCE</span>
      <strong>ABSOLUTE TRIUMPH</strong>
      <p>{copy.phase}</p>
      <button type="button" onClick={() => setReplay(value => value + 1)}>{copy.replay}</button>
    </aside>}
  </main>;
}
