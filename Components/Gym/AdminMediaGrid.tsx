"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FiLoader, FiEdit2, FiX, FiPlay, FiArrowUp } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VideoPlayerModal from "./VideoPlayerModal";

interface MediaItem {
  _id: string;
  title: string;
  category: string;
  type: "gif" | "video";
  featured: boolean;
  order: number;
  thumbnailUrl?: string;
  streamUrl?: string;
}

interface AdminMediaGridProps {
  category: string;
  mediaType: "gif" | "video";
}

export default function AdminMediaGrid({ category, mediaType }: AdminMediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<MediaItem | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

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

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchMedia(1, true);
  }, [category, mediaType, fetchMedia]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage, false);
  }, [page, fetchMedia]);

  const hasMore = items.length < total;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLButtonElement | null) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          handleLoadMore();
        }
      });
      observerRef.current.observe(node);
    }
  }, [loadingMore, hasMore, handleLoadMore]);

  const handleUpdate = async (id: string, updates: Partial<MediaItem>) => {
    try {
      // Optimistically update the UI
      setItems(prev => prev.map(item => item._id === id ? { ...item, ...updates } : item));
      setEditingItem(null);

      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Update failed: ${errData.error || res.statusText || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    }
  };

  // Back to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={`grid gap-4 mt-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-72"></div>
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500 text-sm">
        No {mediaType === "gif" ? "GIFs" : "videos"} found.
      </div>
    );
  }

  return (
    <>
      <p className="text-[13px] text-zinc-500 mb-5">
        Showing <span className="text-zinc-300 font-semibold">{items.length}</span> of{" "}
        <span className="text-zinc-300 font-semibold">{total}</span> {mediaType === "gif" ? "GIFs" : "videos"}
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item._id} className="group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col"
            onClick={() => {
              if (item.type === "video") {
                setPlayingVideo(item);
              }
            }}
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
              {item.type === "gif" && item.streamUrl ? (
                <img 
                  src={item.streamUrl}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : item.thumbnailUrl ? (
                <img 
                  src={item.thumbnailUrl}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
              ) : (
                <div className="text-zinc-700 text-xs font-mono">No thumbnail</div>
              )}
              
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(circle at center, rgba(255,140,0,0.15) 0%, transparent 70%)" }}
              />

              {/* Play Button (for Videos) */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,180,71,0.9) 0%, rgba(255,140,0,0.9) 100%)",
                      boxShadow: "0 0 0 4px rgba(255,140,0,0.2), 0 8px 24px rgba(255,140,0,0.4)",
                    }}
                  >
                    <FiPlay className="w-6 h-6 text-[#1c0a00] ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}

              {/* Category badge */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-orange-400"
                style={{ background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.25)" }}
              >
                {item.category}
              </div>

              {item.featured && (
                <div className="absolute top-2 left-16 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ background: "rgba(255,140,0,0.5)", border: "1px solid rgba(255,140,0,0.5)" }}
                >
                  Featured
                </div>
              )}

              {/* Edit Button */}
              <div className="absolute top-2 right-2 z-30">
                <button
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setEditingItem(item); 
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-orange-500 hover:text-black transition-colors backdrop-blur-md shadow-lg"
                  title="Edit Details"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-[13px] font-semibold text-zinc-300 group-hover:text-white transition-colors truncate" title={item.title}>
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            ref={loadMoreRef}
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
          id={playingVideo._id}
          title={playingVideo.title}
          streamUrl={playingVideo.streamUrl}
          onClose={() => setPlayingVideo(null)}
          isAdmin={true}
          featured={playingVideo.featured}
          order={playingVideo.order}
          onUpdate={async (updates) => {
            // Optimistically update the grid items
            setItems(prev => prev.map(item => item._id === playingVideo._id ? { ...item, ...updates } : item));
            
            // Also optimistically update the currently playing video so the modal reflects the changes immediately
            setPlayingVideo({ ...playingVideo, ...updates });

            try {
              await handleUpdate(playingVideo._id, updates);
            } catch (err) {
              console.error(err);
            }
          }}
          onEditRequest={() => {
            router.push(`/admin-dashboard/video-edit?id=${playingVideo._id}`);
          }}
        />
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(255,140,0,0.4)] hover:bg-orange-400 hover:scale-110 transition-all z-40"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Edit Modal (Transparent Glassmorphic) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Video Details</h3>
              <button onClick={() => setEditingItem(null)} className="text-zinc-400 hover:text-white">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                const orderStr = formData.get("order") as string;
                const featured = formData.get("featured") === "on";
                
                const order = orderStr === "" ? 999999 : Number(orderStr);
                handleUpdate(editingItem._id, { title, order, featured });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider mb-1.5 block">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingItem.title}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider mb-1.5 block">Sort Order</label>
                  <input
                    type="number"
                    name="order"
                    defaultValue={editingItem.order === 999999 ? "" : editingItem.order}
                    placeholder="Auto (End)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-transparent uppercase font-bold tracking-wider mb-1.5 block">Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer bg-black/40 border border-white/10 rounded-xl px-4 py-3 transition-colors hover:bg-white/5 h-[46px]">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={editingItem.featured}
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[13px] font-semibold text-zinc-200">Featured</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 space-y-3">
                {editingItem.type === "video" && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/admin-dashboard/video-edit?id=${editingItem._id}`);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Advanced Video Editor (Trim, Crop, etc)
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-black bg-orange-400 hover:bg-orange-500 transition-colors text-center"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
