"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MediaGrid from "@/Components/Gym/MediaGrid";
import { FiImage, FiVideo } from "react-icons/fi";

const STATIC_CATEGORIES = ["All", "Abs", "Arms", "Back", "Chest", "Legs", "Shoulders"];

type MediaType = "gif" | "video";

export default function GymPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [playingVideoId, setPlayingVideoId] = useState<{ id: string; title: string; streamUrl?: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[13px] font-semibold text-orange-400 uppercase tracking-widest mb-2">
          Exercise Library
        </p>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          GYM <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,140,0,0.5)" }}>Library</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-base max-w-xl">
          Every exercise. Perfect form. Browse by muscle group and switch between animated GIFs and video demonstrations.
        </p>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATIC_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="cursor-pointer px-5 py-2 rounded-xl text-[14px] font-semibold transition-all duration-200 border"
                style={active ? {
                  background: "rgba(255,140,0,0.15)",
                  borderColor: "rgba(255,140,0,0.35)",
                  color: "#ffb347",
                } : {
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#71717a",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* GIF / Video Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0 w-fit"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {([
            { value: "gif", label: "GIFs", icon: FiImage },
            { value: "video", label: "Videos", icon: FiVideo },
          ] as const).map(({ value, label, icon: Icon }) => {
            const active = mediaType === value;
            return (
              <button
                key={value}
                onClick={() => setMediaType(value)}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200"
                style={active ? {
                  background: "linear-gradient(135deg, rgba(255,180,71,0.9), rgba(255,140,0,0.9))",
                  color: "#1c0a00",
                  boxShadow: "0 4px 12px rgba(255,140,0,0.3)",
                } : {
                  color: "#71717a",
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Media Grid ── */}
      <MediaGrid category={activeCategory} mediaType={mediaType} />
    </div>
  );
}
