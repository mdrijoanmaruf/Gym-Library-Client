"use client";

import { useState, useEffect, useCallback } from "react";
import GifCard from "./GifCard";
import VideoCard from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";
import SaveExerciseModal, { DayOfWeek } from "./SaveExerciseModal";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface MediaItem {
  _id: string;
  title: string;
  category: string;
  type: "gif" | "video";
  streamUrl?: string;
  thumbnailUrl?: string;
}

interface MediaGridProps {
  category: string;
  mediaType: "gif" | "video";
}

export default function MediaGrid({ category, mediaType }: MediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string; streamUrl?: string } | null>(null);

  const { status } = useSession();
  const [savedMap, setSavedMap] = useState<Record<string, DayOfWeek[]>>({});
  const [savingMedia, setSavingMedia] = useState<{ id: string; title: string } | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch saved IDs on mount (only if authenticated)
  useEffect(() => {
    if (status !== "authenticated") return;
    
    fetch("/api/saved-exercises/ids")
      .then(res => res.json())
      .then(json => {
        if (json.data) setSavedMap(json.data);
      })
      .catch(err => console.error("Failed to fetch saved ids", err));
  }, [status]);

  const fetchMedia = useCallback(async (pageNum: number, reset: boolean) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const limit = mediaType === "gif" ? 15 : 12;
      const params = new URLSearchParams({
        type: mediaType,
        limit: String(limit),
        page: String(pageNum),
      });
      if (category !== "All") params.set("category", category);

      const res = await fetch(`/api/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch media");
      const json = await res.json();

      setItems((prev) => (reset ? json.data : [...prev, ...json.data]));
      setTotal(json.total);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, mediaType]);

  // Reset and reload when filters change
  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchMedia(1, true);
  }, [category, mediaType, fetchMedia]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage, false);
  };

  const hasMore = items.length < total;

  if (loading) {
    return (
      <div className={`grid gap-4 mt-5 ${
        mediaType === "gif"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
            <div className={`w-full bg-white/5 ${mediaType === "gif" ? "aspect-square" : "aspect-video"}`}></div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-white/10 rounded-md"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-3 w-1/3 bg-white/5 rounded-md"></div>
                <div className="h-8 w-8 bg-white/10 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 text-sm">
        No {mediaType === "gif" ? "GIFs" : "videos"} found for this category.
      </div>
    );
  }

  return (
    <>
      {/* Count */}
      <p className="text-[13px] text-zinc-500 mb-5">
        Showing <span className="text-zinc-300 font-semibold">{items.length}</span> of{" "}
        <span className="text-zinc-300 font-semibold">{total}</span> {mediaType === "gif" ? "GIFs" : "videos"}
      </p>

      {/* Grid */}
      <div className={`grid gap-4 ${
        mediaType === "gif"
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}>
        {items.map((item) => {
          const savedDays = savedMap[item._id] || [];
            
          if (item.type === "gif") {
            return (
              <GifCard 
                key={item._id} 
                id={item._id}
                title={item.title}
                category={item.category}
                streamUrl={item.streamUrl}
                savedDays={savedDays}
                onHeartClick={() => {
                  if (status === "unauthenticated") {
                    setShowLoginPrompt(true);
                  } else {
                    setSavingMedia({ id: item._id, title: item.title });
                  }
                }}
              />
            );
          }
          return (
            <VideoCard
              key={item._id}
              id={item._id}
              title={item.title}
              category={item.category}
              thumbnailUrl={item.thumbnailUrl}
              onPlay={() => {
                setPlayingVideo({ id: item._id, title: item.title, streamUrl: item.streamUrl });
              }}
              savedDays={savedDays}
              onHeartClick={() => {
                if (status === "unauthenticated") {
                  setShowLoginPrompt(true);
                } else {
                  setSavingMedia({ id: item._id, title: item.title });
                }
              }}
            />
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-[14px] text-[#1c0a00] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #ffb347 0%, #ff8c00 50%, #e55a00 100%)",
              boxShadow: "0 0 0 1px rgba(255,140,0,0.3), 0 4px 20px rgba(255,140,0,0.35)",
            }}
          >
            {loadingMore ? (
              <><FiLoader className="w-4 h-4 animate-spin" /> Loading...</>
            ) : (
              `Load More (${Math.min(mediaType === "gif" ? 15 : 12, total - items.length)} more)`
            )}
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          id={playingVideo.id}
          title={playingVideo.title}
          streamUrl={playingVideo.streamUrl}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Save Exercise Modal */}
      {savingMedia && (
        <SaveExerciseModal
          mediaId={savingMedia.id}
          title={savingMedia.title}
          initialDays={savedMap[savingMedia.id] || []}
          onClose={() => setSavingMedia(null)}
          onSave={(mediaId, days) => {
            setSavedMap(prev => {
              const newMap = { ...prev };
              if (days.length === 0) delete newMap[mediaId];
              else newMap[mediaId] = days;
              return newMap;
            });
          }}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-center mb-4 text-orange-400">
              <FiAlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-center text-white mb-2">Login Required</h3>
            <p className="text-zinc-400 text-center mb-6">
              You need to be logged in to save exercises and create a workout plan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-black bg-orange-400 hover:bg-orange-500 transition-colors text-center"
              >
                Login Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
