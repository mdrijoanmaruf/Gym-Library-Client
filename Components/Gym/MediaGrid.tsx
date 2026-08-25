"use client";

import { useState, useEffect, useCallback } from "react";
import GifCard from "./GifCard";
import VideoCard from "./VideoCard";
import VideoPlayerModal from "./VideoPlayerModal";
import { FiLoader } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface MediaItem {
  _id: string;
  title: string;
  category: string;
  type: "gif" | "video";
}

interface MediaGridProps {
  category: string;
  mediaType: "gif" | "video";
}

export default function MediaGrid({ category, mediaType }: MediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

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
      if (res.status === 401) {
        signOut({ callbackUrl: "/login" });
        return;
      }
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
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <FiLoader className="w-8 h-8 animate-spin text-orange-400" />
          <span className="text-sm">Loading exercises...</span>
        </div>
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
        {items.map((item) =>
          item.type === "gif" ? (
            <GifCard key={item._id} id={item._id} title={item.title} category={item.category} />
          ) : (
            <VideoCard
              key={item._id}
              id={item._id}
              title={item.title}
              category={item.category}
              onPlay={(id, title) => setActiveVideo({ id, title })}
            />
          )
        )}
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
      {activeVideo && (
        <VideoPlayerModal
          id={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
