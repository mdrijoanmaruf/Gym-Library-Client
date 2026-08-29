"use client";

import Image from "next/image";
import HeartButton from "./HeartButton";
import { DayOfWeek } from "./SaveExerciseModal";

interface GifCardProps {
  id: string;
  title: string;
  category: string;
  streamUrl?: string;
  savedDays?: DayOfWeek[];
  onHeartClick?: () => void;
}

export default function GifCard({ id, title, category, streamUrl, savedDays = [], onHeartClick }: GifCardProps) {
  const isSaved = savedDays.length > 0;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,140,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
      }}
    >
      {/* GIF Image */}
      <div className="relative aspect-square bg-zinc-900 overflow-hidden">
        {/* Lazy-load the gif via the proxy stream route */}
        <img
          src={streamUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-orange-400"
          style={{ background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.25)" }}
        >
          {category}
        </div>
        
        {/* Heart */}
        <HeartButton 
          isSaved={isSaved} 
          onClick={(e) => { e.stopPropagation(); onHeartClick?.(); }} 
          className="top-2 right-2"
        />
      </div>

      {/* Title */}
      <div className="px-4 py-3">
        <p className="text-[13px] font-semibold text-zinc-300 group-hover:text-white transition-colors truncate" title={title}>
          {title}
        </p>
      </div>
    </div>
  );
}
