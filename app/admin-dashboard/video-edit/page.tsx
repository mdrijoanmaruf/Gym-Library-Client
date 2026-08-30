"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiRotateCcw, FiRotateCw, FiCrop, FiScissors, FiFastForward, FiVolume2, FiPlay, FiPause } from "react-icons/fi";
import Swal from "sweetalert2";

interface VideoEditState {
  trimStart: number;
  trimEnd: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  speed: number;
  volume: number;
}

function VideoEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<any>(null);
  
  // History state for Undo/Redo
  const [history, setHistory] = useState<VideoEditState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [editState, setEditState] = useState<VideoEditState>({
    trimStart: 0,
    trimEnd: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
    speed: 1,
    volume: 1,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Refs to avoid stale closures in event handlers
  const trimBoundsRef = useRef({ start: 0, end: 0 });
  const historyRef = useRef<VideoEditState[]>([]);
  const historyIndexRef = useRef(-1);
  const editStateRef = useRef(editState);

  // Keep refs in sync with state
  useEffect(() => {
    trimBoundsRef.current = { start: editState.trimStart, end: editState.trimEnd };
    editStateRef.current = editState;
  }, [editState]);

  useEffect(() => {
    if (!videoId) return;
    
    fetch(`/api/media/${videoId}`)
      .then(res => res.json())
      .then(data => {
        setVideoData(data);
        const initialState = {
          trimStart: 0,
          trimEnd: data.durationSeconds || 0, // Will be corrected by onLoadedMetadata
          cropX: 0,
          cropY: 0,
          cropW: 0,
          cropH: 0,
          speed: 1,
          volume: 1,
        };
        setEditState(initialState);
        setHistory([initialState]);
        setHistoryIndex(0);
        historyRef.current = [initialState];
        historyIndexRef.current = 0;
        trimBoundsRef.current = { start: 0, end: initialState.trimEnd };
        editStateRef.current = initialState;
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Error", "Failed to load video details", "error");
        router.back();
      });
  }, [videoId, router]);

  const pushHistory = useCallback((newState: VideoEditState) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(newState);
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditState(newState);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      const newIndex = historyIndexRef.current - 1;
      const state = historyRef.current[newIndex];
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      setEditState(state);
      // Seek to the trimStart of the restored state
      if (videoRef.current) {
        videoRef.current.currentTime = state.trimStart;
      }
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const newIndex = historyIndexRef.current + 1;
      const state = historyRef.current[newIndex];
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      setEditState(state);
      if (videoRef.current) {
        videoRef.current.currentTime = state.trimStart;
      }
    }
  }, []);

  const seekToFrame = useCallback((time: number) => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        setPlaying(false);
      }
      videoRef.current.currentTime = time;
    }
  }, []);

  const updateState = useCallback((key: keyof VideoEditState, value: number, saveHistory: boolean = true) => {
    const currentState = editStateRef.current;
    const maxDur = videoData?.durationSeconds || 100;

    // Clamp trim values so start can never exceed end and vice versa
    let clampedValue = value;
    if (key === 'trimStart') {
      clampedValue = Math.max(0, Math.min(value, currentState.trimEnd - 0.1));
    } else if (key === 'trimEnd') {
      clampedValue = Math.max(currentState.trimStart + 0.1, Math.min(value, maxDur));
    }

    const newState = { ...currentState, [key]: clampedValue };

    if (saveHistory) {
      pushHistory(newState);
    } else {
      setEditState(newState);
    }

    // Seek video to the frame when adjusting trim sliders
    if (key === 'trimStart' || key === 'trimEnd') {
      seekToFrame(clampedValue);
    }
  }, [videoData, pushHistory, seekToFrame]);

  const handleProcess = async () => {
    const confirm = await Swal.fire({
      title: 'Process Video?',
      text: 'This action will permanently overwrite the original video with these edits. It may take a few moments depending on the video length. Do you want to proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Yes, process it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsProcessing(true);
      
      const res = await fetch(`/api/media/${videoId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to process video");
      }

      await Swal.fire({
        title: "Success!",
        text: "Video processed successfully.",
        icon: "success",
        confirmButtonColor: "#f97316"
      });
      router.push("/admin-dashboard/videos");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Processing Error", err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    const confirm = await Swal.fire({
      title: 'Restore Original?',
      text: 'This will delete the currently processed video and revert to the original unmodified video. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Yes, Restore'
    });

    if (!confirm.isConfirmed) return;

    setIsRestoring(true);
    try {
      const res = await fetch(`/api/media/${videoId}/restore`, {
        method: "POST"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to restore video");
      }

      await Swal.fire({
        title: "Restored!",
        text: "The original video has been restored successfully.",
        icon: "success",
        confirmButtonColor: "#f97316"
      });
      // Refresh the page data
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      Swal.fire("Restore Error", err.message, "error");
    } finally {
      setIsRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Edit Video
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">Advanced</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">Editing: {videoData?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <FiRotateCw className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {videoData?.originalR2Key && (
            <button
              onClick={handleRestore}
              disabled={isRestoring || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-zinc-800/80 text-white hover:bg-zinc-700 transition-colors border border-white/10 disabled:opacity-50"
            >
              {isRestoring ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FiRotateCcw className="w-4 h-4 text-red-400" />
              )}
              {isRestoring ? "Restoring..." : "Restore Original"}
            </button>
          )}

          <button
            onClick={handleProcess}
            disabled={isProcessing || isRestoring}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,140,0,0.2)] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
            {isProcessing ? "Processing..." : "Process Video"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
            {videoData?.streamUrl ? (
              <video 
                ref={videoRef}
                src={videoData.streamUrl} 
                className="w-full h-full object-contain"
                controls={false}
                onLoadedMetadata={(e) => {
                  const realDuration = e.currentTarget.duration;
                  if (realDuration && isFinite(realDuration)) {
                    setVideoData((prev: any) => ({ ...prev, durationSeconds: realDuration }));
                    // Only update trimEnd if it's 0 or was using the fallback
                    const currentEnd = editStateRef.current.trimEnd;
                    if (currentEnd === 0 || currentEnd === 100 || currentEnd > realDuration) {
                      const newState = { ...editStateRef.current, trimEnd: realDuration };
                      setEditState(newState);
                      editStateRef.current = newState;
                      trimBoundsRef.current = { start: newState.trimStart, end: realDuration };
                      // Also update history with corrected initial state
                      historyRef.current = [newState];
                      historyIndexRef.current = 0;
                      setHistory([newState]);
                      setHistoryIndex(0);
                    }
                  }
                }}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  const { start, end } = trimBoundsRef.current;
                  if (!v.paused) {
                    if (v.currentTime >= end) {
                      v.pause();
                      v.currentTime = start;
                      setPlaying(false);
                    } else if (v.currentTime < start) {
                      v.currentTime = start;
                    }
                  }
                }}
              />
            ) : (
              <p className="text-zinc-500">No stream URL available</p>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!playing && (
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 transition-transform group-hover:scale-110">
                  <FiPlay className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Click to play/pause */}
            <div 
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => {
                if (videoRef.current) {
                  const { start, end } = trimBoundsRef.current;
                  if (videoRef.current.paused) {
                    if (videoRef.current.currentTime >= end || videoRef.current.currentTime < start) {
                      videoRef.current.currentTime = start;
                    }
                    videoRef.current.play();
                    setPlaying(true);
                  } else {
                    videoRef.current.pause();
                    setPlaying(false);
                  }
                }
              }}
            />
          </div>

          {/* Simple Timeline UI */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiScissors className="text-orange-500" /> Trim Video
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {editState.trimStart.toFixed(1)}s - {editState.trimEnd.toFixed(1)}s
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <span className="text-xs text-zinc-500 w-8">Start</span>
              <input 
                type="range" 
                min={0} 
                max={videoData?.durationSeconds || 100} 
                step={0.1}
                value={editState.trimStart}
                onChange={(e) => updateState('trimStart', parseFloat(e.target.value), false)}
                onMouseUp={(e) => updateState('trimStart', parseFloat(e.currentTarget.value), true)}
                onTouchEnd={(e) => updateState('trimStart', parseFloat(e.currentTarget.value), true)}
                className="flex-1 accent-orange-500"
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs text-zinc-500 w-8">End</span>
              <input 
                type="range" 
                min={0} 
                max={videoData?.durationSeconds || 100} 
                step={0.1}
                value={editState.trimEnd}
                onChange={(e) => updateState('trimEnd', parseFloat(e.target.value), false)}
                onMouseUp={(e) => updateState('trimEnd', parseFloat(e.currentTarget.value), true)}
                onTouchEnd={(e) => updateState('trimEnd', parseFloat(e.currentTarget.value), true)}
                className="flex-1 accent-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="space-y-6">
          
          {/* Crop Control */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <FiCrop className="text-orange-500" /> Crop Area
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Width (px)</label>
                <input 
                  type="number" 
                  value={editState.cropW}
                  onChange={(e) => updateState('cropW', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Height (px)</label>
                <input 
                  type="number" 
                  value={editState.cropH}
                  onChange={(e) => updateState('cropH', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">X Offset (px)</label>
                <input 
                  type="number" 
                  value={editState.cropX}
                  onChange={(e) => updateState('cropX', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 block">Y Offset (px)</label>
                <input 
                  type="number" 
                  value={editState.cropY}
                  onChange={(e) => updateState('cropY', parseInt(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
              Set width/height to 0 to disable cropping. Ensure values stay within the original video resolution.
            </p>
          </div>

          {/* Speed Control */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <FiFastForward className="text-orange-500" /> Playback Speed
            </h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min={0.5} 
                max={2.0} 
                step={0.1}
                value={editState.speed}
                onChange={(e) => updateState('speed', parseFloat(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <div className="w-12 h-8 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-orange-400">
                {editState.speed.toFixed(1)}x
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <FiVolume2 className="text-orange-500" /> Volume adjustment
            </h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min={0} 
                max={2} 
                step={0.1}
                value={editState.volume}
                onChange={(e) => updateState('volume', parseFloat(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <div className="w-12 h-8 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-orange-400">
                {Math.round(editState.volume * 100)}%
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VideoEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading editor...</div>}>
      <VideoEditorContent />
    </Suspense>
  );
}
