"use client";

import Link from "next/link";
import {
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiPlayCircle,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { FaTrophy, FaFire } from "react-icons/fa";
import { IoBarbell } from "react-icons/io5";
import { GiBiceps, GiLeg } from "react-icons/gi";

/* ── mockup grid exercises ── */
const MOCKUP_EXERCISES = [
  { name: "Crunch", tag: "Abs", icon: FaFire, color: "text-orange-400" },
  { name: "Bicep Curl", tag: "Arms", icon: GiBiceps, color: "text-amber-400" },
  { name: "Deadlift", tag: "Back", icon: IoBarbell, color: "text-zinc-300" },
  { name: "Push-up", tag: "Chest", icon: FiZap, color: "text-yellow-400" },
  { name: "Squat", tag: "Legs", icon: GiLeg, color: "text-orange-500" },
  { name: "Plank", tag: "Core", icon: FiShield, color: "text-teal-400" },
];

/* ── trust avatars gradient colors ── */
const AVATAR_GRADIENTS = [
  "from-orange-500 to-amber-500",
  "from-yellow-600 to-amber-700",
  "from-zinc-700 to-zinc-800",
  "from-red-500 to-orange-600",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-[78px] overflow-hidden">
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }

        .hero-tag       { animation: heroFadeUp 0.7s ease both; animation-delay: 0.1s; }
        .hero-h1        { animation: heroFadeUp 0.8s ease both; animation-delay: 0.2s; }
        .hero-sub       { animation: heroFadeUp 0.8s ease both; animation-delay: 0.35s; }
        .hero-cta       { animation: heroFadeUp 0.8s ease both; animation-delay: 0.5s; }
        .hero-img       { animation: heroFadeUp 0.9s ease both, floatY 6s ease-in-out 1s infinite; animation-delay: 0.4s, 1s; }

        .animated-gradient {
          background: linear-gradient(270deg, #ff8c00, #ffb347, #ff6600, #ffd700, #ff8c00);
          background-size: 400% 400%;
          animation: gradientShift 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-primary {
          background: linear-gradient(135deg, #ffb347 0%, #ff8c00 50%, #e55a00 100%);
          box-shadow: 0 0 0 1px rgba(255,140,0,0.3), 0 4px 24px rgba(255,140,0,0.45), 0 8px 48px rgba(255,100,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: box-shadow 0.25s, transform 0.15s;
        }
        .cta-primary:hover {
          box-shadow: 0 0 0 1px rgba(255,160,0,0.5), 0 4px 32px rgba(255,140,0,0.7), 0 12px 64px rgba(255,100,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: scale(1.04) translateY(-1px);
        }
        .cta-primary:active { transform: scale(0.97); }

        .cta-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          transition: all 0.2s;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }

        .pulse-ring::before, .pulse-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(255,140,0,0.3);
          animation: pulseRing 2.5s ease-out infinite;
        }
        .pulse-ring::after { animation-delay: 1.2s; }

        .img-frame {
          background: linear-gradient(135deg, rgba(255,140,0,0.15) 0%, rgba(255,100,0,0.08) 50%, rgba(255,200,120,0.12) 100%);
          border: 1px solid rgba(255,140,0,0.2);
          box-shadow: 0 0 60px rgba(255,140,0,0.12), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(2px);
        }
      `}</style>

      {/* ── CONTENT WRAPPER ── */}
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── LEFT: TEXT ─── */}
          <div className="flex flex-col items-start gap-6">

            {/* eyebrow tag */}
            <div className="hero-tag flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 pulse-ring">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400 block" />
              </span>
              <span className="text-[13px] font-semibold tracking-[0.14em] uppercase text-orange-400 px-4 py-1.5 rounded-full"
                style={{ background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.2)" }}>
                The #1 Exercise Reference Platform
              </span>
            </div>

            {/* headline (Reduced text size) */}
            <h1 className="hero-h1 text-[2.2rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.4rem] xl:text-[3.8rem] font-extrabold leading-[1.1] tracking-tight text-white">
              Every Exercise.{" "}
              <span className="animated-gradient block sm:inline">Perfect Form.</span>
              <br />
              <span className="text-white/90">One Library.</span>
            </h1>

            {/* subheadline */}
            <p className="hero-sub text-[1.02rem] sm:text-[1.08rem] text-zinc-400 leading-relaxed max-w-xl">
              Access 500+ exercises with high-quality GIFs and videos, organized by muscle group.
              Train smarter, learn faster, and master your form — all in one place.
            </p>

            {/* CTA buttons */}
            <div className="hero-cta flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="cta-primary group relative px-8 py-3.5 rounded-xl font-bold text-[15px] text-[#1c0a00] tracking-wide overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Start For Free
                  <FiArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/login"
                className="cta-secondary group px-8 py-3.5 rounded-xl font-semibold text-[15px] text-zinc-300 tracking-wide flex items-center gap-2.5"
              >
                <FiPlayCircle className="w-4 h-4 text-orange-400" />
                Log In
              </Link>
            </div>

            {/* trust strip */}
            <div className="hero-cta flex items-center gap-3 mt-1">
              <div className="flex -space-x-2">
                {AVATAR_GRADIENTS.map((gradient, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#060608] bg-gradient-to-br ${gradient}`}
                    style={{ zIndex: 4 - i }}>
                    <FiUser className="w-3.5 h-3.5 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-zinc-500">
                Joined by <span className="text-zinc-300 font-semibold">4,000+</span> athletes
              </span>
            </div>
          </div>

          {/* ─── RIGHT: VISUAL ─── */}
          <div className="hero-img relative flex justify-center lg:justify-end">

            {/* main image frame */}
            <div className="relative">
              {/* outer glow ring */}
              <div className="absolute -inset-8 rounded-3xl opacity-40 blur-2xl"
                style={{ background: "radial-gradient(ellipse, rgba(255,140,0,0.25) 0%, transparent 70%)" }}
              />

              {/* image card */}
              <div className="img-frame relative rounded-2xl overflow-hidden w-full max-w-[480px]">
                {/* header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]
                  bg-black/30">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-zinc-500 mx-auto font-mono">gymlibrary.app / library</span>
                </div>

                {/* preview content */}
                <div className="p-5 space-y-4">
                  {/* category row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {["Abs", "Arms", "Back", "Chest", "Legs"].map((c, i) => (
                      <span key={c} className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          background: i === 0 ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.05)",
                          border: i === 0 ? "1px solid rgba(255,140,0,0.35)" : "1px solid rgba(255,255,255,0.08)",
                          color: i === 0 ? "#ffb347" : "#a1a1aa",
                        }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* exercise grid mockup */}
                  <div className="grid grid-cols-3 gap-3">
                    {MOCKUP_EXERCISES.map((ex, i) => {
                      const MockupIcon = ex.icon;
                      return (
                        <div key={ex.name}
                          className="rounded-xl p-3 flex flex-col gap-2 cursor-default transition-transform duration-200 hover:scale-105"
                          style={{
                            background: i === 0 ? "rgba(255,140,0,0.1)" : "rgba(255,255,255,0.04)",
                            border: i === 0 ? "1px solid rgba(255,140,0,0.25)" : "1px solid rgba(255,255,255,0.06)",
                          }}>
                          <div className="flex items-center justify-center h-12 rounded-lg bg-black/25">
                            <MockupIcon className={`w-5 h-5 ${ex.color}`} />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-zinc-200 leading-tight">{ex.name}</p>
                            <p className="text-[10px] text-zinc-500">{ex.tag}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* bottom bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-[11px] text-zinc-500">Showing 6 of 500+ exercises</span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      style={{ background: "rgba(255,140,0,0.15)", color: "#ffb347", border: "1px solid rgba(255,140,0,0.25)" }}>
                      Browse All <FiArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* floating badge — top right */}
              <div className="absolute -top-4 -right-4 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg
                bg-black/90 border border-orange-500/30 backdrop-blur-md">
                <FaTrophy className="text-orange-400 text-lg shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-orange-400 leading-tight">500+ Exercises</p>
                  <p className="text-[10px] text-zinc-500">With GIFs & Video</p>
                </div>
              </div>

              {/* floating badge — bottom left */}
              <div className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg
                bg-black/90 border border-white/10 backdrop-blur-md">
                <FiCheckCircle className="text-emerald-400 text-lg shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-zinc-200 leading-tight">Perfect Form</p>
                  <p className="text-[10px] text-zinc-500">Expert-verified moves</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── SCROLL HINT ─── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[11px] tracking-widest uppercase text-zinc-500 font-medium">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent" />
      </div>
    </section>
  );
}
