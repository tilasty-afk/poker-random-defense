"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../seven-card-preview/preview.module.css";

const WIDTH = 360;
const HEIGHT = 640;
const DURATION = 6200;
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SKETCH_PATHS = [1, 3, 4, 2, 5].map(index => `${ASSET_BASE}/effects/saintess-sketch-${index}.png`);

type Locale = "ko" | "en" | "zh" | "ja";
const COPY: Record<Locale, { title: string; seal: string; phase: string; replay: string }> = {
  ko: { title: "THE NOBLE SACRIFICE", seal: "FIVE LIGHTS BECOME THE ETERNAL SEAL", phase: "The saints offer their final light", replay: "REPLAY" },
  en: { title: "THE NOBLE SACRIFICE", seal: "FIVE LIGHTS BECOME THE ETERNAL SEAL", phase: "The saints offer their final light", replay: "REPLAY" },
  zh: { title: "THE NOBLE SACRIFICE", seal: "FIVE LIGHTS BECOME THE ETERNAL SEAL", phase: "The saints offer their final light", replay: "REPLAY" },
  ja: { title: "THE NOBLE SACRIFICE", seal: "FIVE LIGHTS BECOME THE ETERNAL SEAL", phase: "The saints offer their final light", replay: "REPLAY" },
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

function glowLine(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#fff7b0";
  ctx.shadowColor = "#ffd84a";
  ctx.shadowBlur = 16;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function render(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  demon: HTMLImageElement | null,
  sketches: Array<HTMLImageElement | null>,
  locale: Locale,
) {
  const t = elapsed / DURATION;
  const copy = COPY[locale];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const bg = ctx.createRadialGradient(180, 310, 20, 180, 310, 390);
  bg.addColorStop(0, "#273113");
  bg.addColorStop(.42, "#101a12");
  bg.addColorStop(1, "#020403");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < 150; i++) {
    const a = i * 2.399 + elapsed * .00018;
    const radius = 30 + ((i * 47) % 250) * ease(t * 2);
    const x = 180 + Math.cos(a) * radius;
    const y = 315 + Math.sin(a) * radius * 1.35;
    const pulse = .35 + .65 * Math.abs(Math.sin(elapsed * .004 + i));
    ctx.globalAlpha = clamp((t - .05) * 2) * pulse;
    ctx.fillStyle = i % 4 === 0 ? "#ffffff" : i % 3 === 0 ? "#81fff1" : "#ffd75d";
    const size = i % 11 === 0 ? 6 : i % 5 === 0 ? 4 : 2;
    ctx.fillRect(Math.round(x), Math.round(y), size, size);
  }
  ctx.globalAlpha = 1;

  const portraitAlpha = clamp((t - .06) * 4) * clamp(1 - (t - .67) * 4);
  const portraitLayout = [
    { x: -7, y: 174, r: -.15 }, { x: 60, y: 136, r: -.07 }, { x: 127, y: 112, r: 0 },
    { x: 194, y: 136, r: .07 }, { x: 261, y: 174, r: .15 },
  ];
  sketches.forEach((sketch, index) => {
    if (!sketch) return;
    const appear = ease((t - .08 - index * .035) * 5);
    const layout = portraitLayout[index];
    ctx.save();
    ctx.globalAlpha = portraitAlpha * appear * .58;
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "grayscale(1) saturate(0) contrast(1.25) brightness(1.35)";
    ctx.shadowColor = index % 2 ? "#80fff2" : "#ffe17b";
    ctx.shadowBlur = 16;
    ctx.translate(layout.x + 53, layout.y + 78);
    ctx.rotate(layout.r);
    ctx.drawImage(sketch, -53, -78, 106, 158);
    ctx.restore();
  });

  const demonAlpha = clamp(1 - (t - .58) * 4.8);
  if (demon) {
    ctx.save();
    ctx.globalAlpha = demonAlpha;
    ctx.shadowColor = "#ff271c";
    ctx.shadowBlur = 24;
    const shake = t > .42 && t < .72 ? Math.sin(elapsed * .06) * 3 : 0;
    ctx.drawImage(demon, 104 + shake, 225, 152, 152);
    ctx.restore();
  }

  const points = Array.from({ length: 5 }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 5;
    const arrive = ease((t - .08 - index * .035) * 4.2);
    return {
      x: 180 + Math.cos(angle) * 126 * arrive,
      y: 315 + Math.sin(angle) * 126 * arrive,
    };
  });
  const sealAlpha = ease((t - .29) * 4);
  for (let i = 0; i < 5; i++) {
    const a = points[i], outer = points[(i + 1) % 5], star = points[(i + 2) % 5];
    glowLine(ctx, a.x, a.y, outer.x, outer.y, sealAlpha * .72);
    glowLine(ctx, a.x, a.y, star.x, star.y, sealAlpha);
  }
  for (const point of points) {
    ctx.save();
    ctx.globalAlpha = clamp((t - .08) * 5) * clamp(1 - (t - .6) * 4);
    ctx.shadowColor = "#fff19a";
    ctx.shadowBlur = 22;
    ctx.fillStyle = "#fff7b0";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    glowLine(ctx, point.x, point.y, 180, 315, sealAlpha * .9);
  }

  const burst = ease((t - .5) * 5) * clamp(1 - (t - .8) * 4);
  if (burst > 0) {
    const light = ctx.createRadialGradient(180, 315, 0, 180, 315, 190 * burst);
    light.addColorStop(0, `rgba(255,255,255,${burst})`);
    light.addColorStop(.2, `rgba(255,232,126,${burst * .9})`);
    light.addColorStop(1, "rgba(255,212,70,0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 80, WIDTH, 470);
  }

  if (t > .46) {
    const rays = ease((t - .46) * 4) * clamp(1 - (t - .86) * 3);
    ctx.save();
    ctx.translate(180, 315);
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 28; i++) {
      ctx.rotate(Math.PI * 2 / 28);
      const ray = ctx.createLinearGradient(18, 0, 210, 0);
      ray.addColorStop(0, `rgba(255,255,255,${rays * .7})`);
      ray.addColorStop(1, "rgba(255,214,70,0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(12, -2);
      ctx.lineTo(220, -8 - (i % 4) * 3);
      ctx.lineTo(220, 8 + (i % 3) * 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  const titleAlpha = ease((t - .7) * 5);
  ctx.save();
  ctx.globalAlpha = titleAlpha;
  ctx.textAlign = "center";
  ctx.shadowColor = "#ffcf43";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#fff3ad";
  ctx.font = "bold 25px Georgia, serif";
  ctx.fillText("THE NOBLE", 180, 270);
  ctx.font = "bold 34px Georgia, serif";
  ctx.fillText("SACRIFICE", 180, 305);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("HIDDEN ENDING", 180, 332);
  ctx.fillStyle = "#ffe074";
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.fillText(copy.seal, 180, 362);
  ctx.restore();
}

export default function SaintessEndingPreviewPage() {
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
    const sketchImages = SKETCH_PATHS.map(() => new Image());
    let demonReady: HTMLImageElement | null = null;
    const sketchesReady: Array<HTMLImageElement | null> = SKETCH_PATHS.map(() => null);
    demon.onload = () => { demonReady = demon; };
    sketchImages.forEach((image, index) => {
      image.onload = () => { sketchesReady[index] = image; };
      image.src = SKETCH_PATHS[index];
    });
    demon.src = `${ASSET_BASE}/sprites/enemies/hidden-demon-lord.png`;
    let frame = 0;
    const started = performance.now();
    const animate = (now: number) => {
      const elapsed = Math.min(DURATION, now - started);
      render(ctx, elapsed, demonReady, sketchesReady, locale);
      if (elapsed < DURATION) frame = requestAnimationFrame(animate);
      else setFinished(true);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [locale, replay]);

  const copy = COPY[locale];
  return <main className={`${styles.previewPage} ${embedded ? styles.embedded : ""}`}>
    <section className={styles.stage} aria-label={copy.title}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}/>
      <div className={styles.scanlines}/>
      {!embedded && finished && <button className={styles.stageReplay} type="button" onClick={() => { window.location.href = `${ASSET_BASE}/`; }}>PLAY AGAIN?</button>}
    </section>
    {!embedded && <aside className={styles.controls}>
      <span>HIDDEN ENDING · CANVAS SEQUENCE</span>
      <strong>{copy.title}</strong>
      <p>{copy.phase}</p>
      <button type="button" onClick={() => setReplay(value => value + 1)}>{copy.replay}</button>
    </aside>}
  </main>;
}
