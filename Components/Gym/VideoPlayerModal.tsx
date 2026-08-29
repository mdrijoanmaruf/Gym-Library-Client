"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiX, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiRewind, FiFastForward,
} from "react-icons/fi";

interface VideoPlayerModalProps {
  id: string;
  title: string;
  streamUrl?: string;
  onClose: () => void;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPlayerModal({ id, title, streamUrl, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [playing, resetControlsTimer]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const updateBuffered = () => {
    const v = videoRef.current;
    if (v && v.buffered.length > 0) {
      let bufferedEnd = 0;
      for (let i = 0; i < v.buffered.length; i++) {
        // If current time is within this buffered range, or right before it
        if (v.currentTime >= v.buffered.start(i) && v.currentTime <= v.buffered.end(i)) {
          bufferedEnd = v.buffered.end(i);
          break;
        }
      }
      // Fallback to the last buffered range if we just started
      if (bufferedEnd === 0) {
        bufferedEnd = v.buffered.end(v.buffered.length - 1);
      }
      
      setBufferedPercent((bufferedEnd / (v.duration || 1)) * 100);
    }
  };

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  };

  const lastClickRef = useRef<{ time: number, side: 'left' | 'right' | 'center' }>({ time: 0, side: 'center' });
  const [showSkipOverlay, setShowSkipOverlay] = useState<{ side: 'left' | 'right', text: string } | null>(null);

  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>, side: 'left' | 'right' | 'center') => {
    const now = Date.now();
    const last = lastClickRef.current;
    
    // Double tap threshold: 300ms
    if (now - last.time < 300 && last.side === side && side !== 'center') {
      // Double tap!
      seek(side === 'left' ? -5 : 5);
      
      // Show skip animation
      setShowSkipOverlay({ side, text: side === 'left' ? '-5s' : '+5s' });
      setTimeout(() => setShowSkipOverlay(null), 500);
      
      // Reset so 3 taps doesn't trigger 2 double-taps
      lastClickRef.current = { time: 0, side: 'center' };
    } else {
      // Single tap (toggle play after a tiny delay to allow double-tap to cancel it if we wanted, but immediate is fine)
      togglePlay();
      lastClickRef.current = { time: now, side };
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    setShowSpeedMenu(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLButtonElement || document.activeElement instanceof HTMLInputElement) {
        if (e.key === " ") return; // let the button handle spacebar
      }
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowLeft") seek(-5);
      if (e.key === "ArrowRight") seek(5);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-[400px] mx-4 rounded-2xl overflow-visible flex flex-col"
        style={{
          background: "#0a0a0f",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.9)",
        }}
        onMouseMove={resetControlsTimer}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <p className="text-[14px] font-semibold text-zinc-300 truncate max-w-[80%]">{title}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Video */}
        <div className="relative bg-black aspect-[9/16] group overflow-hidden rounded-b-2xl">
          <video
            ref={videoRef}
            src={streamUrl}
            className="w-full h-full object-contain"
            autoPlay
            onTimeUpdate={() => {
              if (!isDragging) {
                setCurrentTime(videoRef.current?.currentTime || 0);
              }
              updateBuffered();
            }}
            onProgress={updateBuffered}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            preload="metadata"
          />

          {/* Invisible Overlay Zones for Tap Detection */}
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/3 h-full" onClick={(e) => handleVideoTap(e, 'left')} />
            <div className="w-1/3 h-full" onClick={(e) => handleVideoTap(e, 'center')} />
            <div className="w-1/3 h-full" onClick={(e) => handleVideoTap(e, 'right')} />
          </div>

          {/* Double Tap Skip Animation Overlay */}
          {showSkipOverlay && (
            <div className={`absolute top-0 bottom-0 w-1/2 flex flex-col items-center justify-center bg-white/10 animate-pulse pointer-events-none z-20 ${showSkipOverlay.side === 'left' ? 'left-0 rounded-r-[100%]' : 'right-0 rounded-l-[100%]'}`}>
              {showSkipOverlay.side === 'left' ? <FiRewind className="w-8 h-8 text-white mb-2" /> : <FiFastForward className="w-8 h-8 text-white mb-2" />}
              <span className="text-white font-bold text-lg">{showSkipOverlay.text}</span>
            </div>
          )}

          {/* Play/pause overlay flash */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,140,0,0.25)", backdropFilter: "blur(4px)" }}>
                <FiPlay className="w-9 h-9 text-orange-400 ml-1" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 px-5 py-4 space-y-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)" }}
        >
          {/* Seek bar */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-zinc-500 w-10 shrink-0">{formatTime(currentTime)}</span>
            <input
              ref={seekBarRef}
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onMouseUp={(e) => {
                setIsDragging(false);
                const t = parseFloat((e.currentTarget as HTMLInputElement).value);
                if (videoRef.current) videoRef.current.currentTime = t;
              }}
              onTouchEnd={(e) => {
                setIsDragging(false);
                const t = parseFloat((e.currentTarget as HTMLInputElement).value);
                if (videoRef.current) videoRef.current.currentTime = t;
              }}
              onChange={(e) => {
                const t = parseFloat(e.target.value);
                setCurrentTime(t);
              }}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #ff8c00 0%, #ff8c00 ${(currentTime / (duration || 1)) * 100}%, 
                  rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${Math.max(bufferedPercent, (currentTime / (duration || 1)) * 100)}%, 
                  rgba(255,255,255,0.1) ${Math.max(bufferedPercent, (currentTime / (duration || 1)) * 100)}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <span className="text-[12px] text-zinc-500 w-10 shrink-0 text-right">{formatTime(duration)}</span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Rewind */}
              <button onClick={() => seek(-5)} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <FiRewind className="w-4 h-4" />
              </button>
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ffb347, #ff8c00)" }}
              >
                {playing
                  ? <FiPause className="w-5 h-5 text-[#1c0a00]" fill="currentColor" />
                  : <FiPlay className="w-5 h-5 text-[#1c0a00] ml-0.5" fill="currentColor" />
                }
              </button>
              {/* Fast Forward */}
              <button onClick={() => seek(5)} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <FiFastForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <button onClick={toggleMute} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all ml-1">
                {muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setMuted(v === 0);
                  if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
                }}
                className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #ff8c00 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 0%)` }}
              />
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Speed Menu */}
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-28 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl py-1 z-[100]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        speed === s 
                          ? "bg-orange-500/10 text-orange-400" 
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {s === 1 ? "Normal" : `${s}x`}
                    </button>
                  ))}
                </div>
              )}

              {/* Speed Toggle */}
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all border ${
                  showSpeedMenu || speed !== 1
                    ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border-white/[0.07]"
                }`}
              >
                {speed}×
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ff8c00;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(255,140,0,0.6);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ff8c00;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
