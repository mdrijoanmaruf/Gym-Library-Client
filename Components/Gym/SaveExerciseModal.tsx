import { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SaveExerciseModalProps {
  mediaId: string;
  title: string;
  initialDays: DayOfWeek[];
  onClose: () => void;
  onSave: (mediaId: string, days: DayOfWeek[]) => void;
}

export default function SaveExerciseModal({ mediaId, title, initialDays, onClose, onSave }: SaveExerciseModalProps) {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(initialDays);
  const [loading, setLoading] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-exercises/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, days: selectedDays }),
      });
      if (!res.ok) throw new Error("Failed to save");
      
      onSave(mediaId, selectedDays);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save routine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-md p-6 rounded-2xl shadow-2xl border border-white/[0.08]"
        style={{ background: "linear-gradient(160deg, #18151c 0%, #0d0b0f 100%)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <FiX className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1 pr-8">Add to Routine</h3>
        <p className="text-zinc-400 text-[14px] mb-6">Select the days you want to perform <strong className="text-orange-400 font-semibold">{title}</strong>.</p>

        <div className="flex flex-col gap-2 mb-8">
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? "bg-orange-500/10 border-orange-500/50 text-white" 
                    : "bg-white/[0.03] border-white/[0.05] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="font-medium text-[15px]">{day}</span>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  isSelected ? "bg-orange-500" : "border border-white/20"
                }`}>
                  {isSelected && <FiCheck className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-xl font-semibold text-zinc-300 hover:bg-white/5 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-[#1c0a00] disabled:opacity-50 transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #ffb347 0%, #ff8c00 100%)" }}
          >
            {loading ? "Saving..." : selectedDays.length === 0 ? "Remove from Routine" : "Save Routine"}
          </button>
        </div>
      </div>
    </div>
  );
}
