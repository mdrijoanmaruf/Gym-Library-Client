"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiFilter, FiLoader, FiImage, FiVideo } from "react-icons/fi";
import GifCard from "@/Components/Gym/GifCard";
import VideoCard from "@/Components/Gym/VideoCard";
import VideoPlayerModal from "@/Components/Gym/VideoPlayerModal";
import SaveExerciseModal, { DayOfWeek } from "@/Components/Gym/SaveExerciseModal";

const STATIC_CATEGORIES = ["All", "Abs", "Arms", "Back", "Chest", "Legs", "Shoulders"];
const DAYS: (DayOfWeek | "All")[] = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MyWorkoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDay, setActiveDay] = useState<DayOfWeek | "All">(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" }) as DayOfWeek;
  });
  
  const [mediaType, setMediaType] = useState<"gif" | "video">("video");
  
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [playingVideoId, setPlayingVideoId] = useState<{ id: string; title: string; streamUrl?: string } | null>(null);
  const [savingMedia, setSavingMedia] = useState<{ id: string; title: string, days: DayOfWeek[] } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchSavedExercises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (activeDay !== "All") params.set("day", activeDay);

      const res = await fetch(`/api/saved-exercises?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setExercises(json.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedExercises();
    }
  }, [activeCategory, activeDay, status]);

  const handleSaveUpdate = (mediaId: string, newDays: DayOfWeek[]) => {
    if (newDays.length === 0) {
      // Removed from saved
      setExercises(prev => prev.filter(e => e.mediaId._id !== mediaId));
    } else {
      // Updated days (we either update it or refetch. Simplest is to just refetch to apply filters correctly)
      fetchSavedExercises();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="h-12 w-64 bg-white/5 rounded"></div>
          <div className="h-16 w-full max-w-4xl bg-white/5 rounded-2xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const filteredExercises = exercises.filter((e) => e.mediaId?.type === mediaType);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[13px] font-semibold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <FiCalendar className="w-4 h-4" /> My Routine
        </p>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          My <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,140,0,0.5)" }}>Workout</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-base max-w-xl">
          Your personal weekly training plan. Filter by day of the week or muscle group to stay on track.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 mb-10 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        
        {/* Days Filter */}
        <div className="space-y-3 flex-1">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wide"><FiCalendar /> Day of Week</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => {
              const active = activeDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 border ${
                    active 
                      ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_15px_rgba(255,140,0,0.4)]" 
                      : "bg-black/20 text-zinc-400 border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-3 flex-1 xl:max-w-xl border-t xl:border-t-0 xl:border-l border-white/10 pt-5 xl:pt-0 xl:pl-6">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 uppercase tracking-wide"><FiFilter /> Muscle Group</h3>
          <div className="flex flex-wrap gap-2">
            {STATIC_CATEGORIES.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 border ${
                    active 
                      ? "bg-white/10 text-white border-white/20" 
                      : "bg-transparent text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* GIF / Video Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0 w-fit xl:border-l border-white/10 xl:pl-6 mt-5 xl:mt-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", height: "fit-content", alignSelf: "center" }}
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
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
      ) : filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4 rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
          <FiCalendar className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No exercises found</h3>
          <p className="text-zinc-500 max-w-sm">
            {activeDay === "All" && activeCategory === "All" 
              ? "You haven't added any exercises to your routine yet. Go to the Gym Library and click the heart icon to save them!"
              : "No exercises match your current filters. Try selecting a different day or muscle group."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredExercises.map((saved) => {
            const item = saved.mediaId;
            if (item.type === "gif") {
              return (
                <GifCard 
                  key={item._id} 
                  id={item._id}
                  title={item.title}
                  category={item.category}
                  streamUrl={item.streamUrl}
                  savedDays={saved.days}
                  onHeartClick={() => setSavingMedia({ id: item._id, title: item.title, days: saved.days })}
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
                  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                  setPlayingVideoId({ id: item._id, title: item.title, streamUrl: `${API_BASE}/media/stream/${item._id}` });
                }}
                savedDays={saved.days}
                onHeartClick={() => setSavingMedia({ id: item._id, title: item.title, days: saved.days })}
              />
            );
          })}
        </div>
      )}

      {playingVideoId && (
        <VideoPlayerModal
          id={playingVideoId.id}
          title={playingVideoId.title}
          streamUrl={playingVideoId.streamUrl}
          onClose={() => setPlayingVideoId(null)}
        />
      )}

      {savingMedia && (
        <SaveExerciseModal
          mediaId={savingMedia.id}
          title={savingMedia.title}
          initialDays={savingMedia.days}
          onClose={() => setSavingMedia(null)}
          onSave={handleSaveUpdate}
        />
      )}
    </div>
  );
}
