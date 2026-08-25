import { FiHeart } from "react-icons/fi";

interface HeartButtonProps {
  isSaved: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export default function HeartButton({ isSaved, onClick, className = "" }: HeartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
        isSaved
          ? "bg-orange-500/90 shadow-[0_0_15px_rgba(255,140,0,0.6)] hover:bg-orange-600"
          : "bg-black/40 hover:bg-black/60 backdrop-blur-md"
      } ${className}`}
      aria-label={isSaved ? "Remove from routine" : "Add to routine"}
    >
      <FiHeart
        className={`w-5 h-5 transition-all duration-300 ${
          isSaved ? "fill-white text-white scale-110" : "text-white"
        }`}
      />
    </button>
  );
}
