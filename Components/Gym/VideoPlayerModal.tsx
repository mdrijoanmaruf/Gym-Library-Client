"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiX, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiMinimize, FiRewind, FiFastForward,
} from "react-icons/fi";

interface VideoPlayerModalProps {
  id: string;
  title: string;
  onClose: () => void;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPlayerModal({ id, title, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
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

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
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
      if (e.key === "f" || e.key === "F") toggleFullscreen();
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
        className="relative z-10 w-full max-w-[400px] mx-4 rounded-2xl overflow-hidden flex flex-col"
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
        <div className="relative bg-black aspect-[9/16] group" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={`/api/media/stream/${id}`}
            className="w-full h-full object-contain"
            autoPlay
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
            preload="metadata"
          />

          {/* Play/pause overlay flash */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,140,0,0.25)", backdropFilter: "blur(4px)" }}>
                <FiPlay className="w-9 h-9 text-orange-400 ml-1" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-5 py-4 space-y-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
              onChange={(e) => {
                const t = parseFloat(e.target.value);
                if (videoRef.current) videoRef.current.currentTime = t;
                setCurrentTime(t);
              }}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ff8c00 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 0%)`,
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

            <div className="flex items-center gap-2">
              {/* Speed */}
              <button
                onClick={changeSpeed}
                className="px-2.5 py-1 rounded-lg text-[12px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.07]"
              >
                {speed}×
              </button>
              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                {fullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
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
