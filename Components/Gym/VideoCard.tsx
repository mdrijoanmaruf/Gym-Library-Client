"use client";

import { FiPlay } from "react-icons/fi";
import HeartButton from "./HeartButton";
import { DayOfWeek } from "./SaveExerciseModal";
import { useEffect, useRef, useState } from "react";

interface VideoCardProps {
  id: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
  savedDays?: DayOfWeek[];
  onPlay: (id: string, title: string) => void;
  onHeartClick?: () => void;
}

export default function VideoCard({ id, title, category, thumbnailUrl, savedDays = [], onPlay, onHeartClick }: VideoCardProps) {
  const isSaved = savedDays.length > 0;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
      onClick={() => onPlay(id, title)}
    >
      {/* Video thumbnail using the generated thumbnail image */}
      <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center opacity-60">
            <FiPlay className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, rgba(255,140,0,0.15) 0%, transparent 70%)" }}
        />
        {/* Play Button */}
        <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, rgba(255,180,71,0.9) 0%, rgba(255,140,0,0.9) 100%)",
            boxShadow: "0 0 0 4px rgba(255,140,0,0.2), 0 8px 24px rgba(255,140,0,0.4)",
          }}
        >
          <FiPlay className="w-6 h-6 text-[#1c0a00] ml-0.5" fill="currentColor" />
        </div>

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
