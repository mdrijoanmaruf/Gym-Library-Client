"use client";

import { useEffect, useRef } from "react";

/* ─── constants ──────────────────────────────────────────────── */
const DOTS        = 80;
const MAX_DIST    = 150;     // line connection distance
const MOUSE_DIST  = 200;     // mouse influence radius
const MOUSE_FORCE = 0.012;   // attraction strength toward mouse
const BASE_SPEED  = 0.35;
const DOT_COLORS  = [
  [255, 140,   0],   // orange
  [255, 179,  71],   // amber
  [255, 100,   0],   // deep orange
  [255, 215,   0],   // gold
  [220, 120,  40],   // warm brown-orange
];

interface Dot {
  x: number; y: number;
  vx: number; vy: number;
  r: number;           // radius
  colorIdx: number;    // which color from palette
  phase: number;       // for pulsing opacity
  speed: number;       // individual speed multiplier
}

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    /* ── resize ── */
    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── mouse tracking ── */
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onMouseLeave = () => { mouse.current.active = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    /* ── init dots ── */
    const dots: Dot[] = Array.from({ length: DOTS }, () => ({
      x:        Math.random() * w,
      y:        Math.random() * h,
      vx:       (Math.random() - 0.5) * BASE_SPEED,
      vy:       (Math.random() - 0.5) * BASE_SPEED,
      r:        0.8 + Math.random() * 1.8,
      colorIdx: Math.floor(Math.random() * DOT_COLORS.length),
      phase:    Math.random() * Math.PI * 2,
      speed:    0.6 + Math.random() * 0.8,
    }));

    /* ── helpers ── */
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const dist2 = (ax: number, ay: number, bx: number, by: number) => {
      const dx = ax - bx, dy = ay - by;
      return dx * dx + dy * dy;
    };

    /* ── draw loop ── */
    let tick = 0;
    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);

      /* motion-blur trail — transparent so no fixed bg color is imposed */
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mActive = mouse.current.active;

      /* ── update dots ── */
      for (const d of dots) {
        /* mouse attraction */
        if (mActive) {
          const ddx = mx - d.x;
          const ddy = my - d.y;
          const dd  = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < MOUSE_DIST && dd > 1) {
            const factor = (1 - dd / MOUSE_DIST) * MOUSE_FORCE * d.speed;
            d.vx += ddx / dd * factor;
            d.vy += ddy / dd * factor;
          }
        }

        /* speed cap */
        const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        const maxSpd = BASE_SPEED * d.speed * 2.5;
        if (spd > maxSpd) {
          d.vx = (d.vx / spd) * maxSpd;
          d.vy = (d.vy / spd) * maxSpd;
        }

        /* gentle damping so they don't clump forever */
        d.vx *= 0.998;
        d.vy *= 0.998;

        /* drift back to base velocity so they never stop */
        const targetV = BASE_SPEED * d.speed * 0.4;
        if (spd < targetV) {
          d.vx += (Math.random() - 0.5) * 0.04;
          d.vy += (Math.random() - 0.5) * 0.04;
        }

        /* move & wrap */
        d.x = (d.x + d.vx + w) % w;
        d.y = (d.y + d.vy + h) % h;
        d.phase += 0.012;
      }

      /* ── draw connections dot ↔ dot ── */
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dist2(dots[i].x, dots[i].y, dots[j].x, dots[j].y);
          if (d2 < MAX_DIST * MAX_DIST) {
            const d    = Math.sqrt(d2);
            const t    = 1 - d / MAX_DIST;
            const [ri, gi, bi] = DOT_COLORS[dots[i].colorIdx];
            const [rj, gj, bj] = DOT_COLORS[dots[j].colorIdx];
            const r = lerp(ri, rj, 0.5);
            const g = lerp(gi, gj, 0.5);
            const b = lerp(bi, bj, 0.5);
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 * t * t})`;
            ctx.lineWidth   = 0.7 * t;
            ctx.stroke();
          }
        }
      }

      /* ── draw connections dot ↔ mouse ── */
      if (mActive) {
        for (const d of dots) {
          const d2 = dist2(d.x, d.y, mx, my);
          if (d2 < MOUSE_DIST * MOUSE_DIST) {
            const dist = Math.sqrt(d2);
            const t    = 1 - dist / MOUSE_DIST;
            const [r, g, b] = DOT_COLORS[d.colorIdx];

            /* gradient line toward cursor */
            const grad = ctx.createLinearGradient(d.x, d.y, mx, my);
            grad.addColorStop(0, `rgba(${r},${g},${b},${0.0})`);
            grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.22 * t})`);
            grad.addColorStop(1, `rgba(255,200,120,${0.35 * t})`);

            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = grad;
            ctx.lineWidth   = 0.8 + t * 1.2;
            ctx.stroke();
          }
        }

        /* mouse cursor glow dot */
        const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 12);
        mouseGlow.addColorStop(0, "rgba(255,160,60,0.7)");
        mouseGlow.addColorStop(0.4, "rgba(255,120,0,0.25)");
        mouseGlow.addColorStop(1, "rgba(255,100,0,0)");
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow;
        ctx.fill();

        /* outer pulse ring */
        const pulseR = 18 + 8 * Math.sin(tick * 0.06);
        ctx.beginPath();
        ctx.arc(mx, my, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,160,60,${0.15 * Math.abs(Math.sin(tick * 0.06))})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* ── draw dots — flat, no glow ── */
      for (const d of dots) {
        const [r, g, b] = DOT_COLORS[d.colorIdx];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.28)`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">

      {/* dot grid */}
      <div className="absolute inset-0 dot-grid opacity-[0.12]" />

      {/* the canvas — pointer-events-none so clicks pass through */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
}
