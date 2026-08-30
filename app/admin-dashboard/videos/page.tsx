"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminMediaGrid from "@/Components/Gym/AdminMediaGrid";
import { FiImage, FiVideo } from "react-icons/fi";

const STATIC_CATEGORIES = ["All", "Abs", "Arms", "Back", "Chest", "Legs", "Shoulders"];

type MediaType = "gif" | "video";

export default function AdminVideosPage() {
  const { status } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const [mediaType, setMediaType] = useState<MediaType>("video");
  
  const [categories, setCategories] = useState<{name: string, count: number}[]>(
    STATIC_CATEGORIES.map(c => ({ name: c, count: 0 }))
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE}/media/categories?type=${mediaType}`);
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    };
    fetchCategories();
  }, [mediaType]);

  // Optionally protect the page
  if (status === "loading") {
    return <div className="p-8 text-zinc-400">Loading...</div>;
  }

  return (
    <div className="max-w-[1600px] w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
          Manage Videos
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Edit titles, change sort ordering, and toggle featured status for all gym library assets. Changes are saved automatically.
        </p>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => {
            const active = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className="cursor-pointer px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border flex items-center gap-1.5"
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
                {cat.name} <span className="opacity-60 text-[11px]">({cat.count})</span>
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
                className="cursor-pointer flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
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
      <AdminMediaGrid category={activeCategory} mediaType={mediaType} />
    </div>
  );
}
