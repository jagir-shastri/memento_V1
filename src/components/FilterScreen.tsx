/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Layers, Play, LayoutGrid, ChevronDown, Sliders } from 'lucide-react';
import { FilterOption, StripTheme, GridLayout } from '../types';
import { FILTERS, STRIP_THEMES, GRID_LAYOUTS } from '../constants';
import { audioSynth } from '../utils/audio';

interface FilterScreenProps {
  selectedFilter: FilterOption;
  setSelectedFilter: (filter: FilterOption) => void;
  selectedTheme: StripTheme;
  setSelectedTheme: (theme: StripTheme) => void;
  selectedLayout: GridLayout;
  setSelectedLayout: (layout: GridLayout) => void;
  onStartCapture: () => void;
  cameraStream: MediaStream | null;
  setCameraStream: (stream: MediaStream | null) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
}

export default function FilterScreen({
  selectedFilter,
  setSelectedFilter,
  selectedTheme,
  setSelectedTheme,
  selectedLayout,
  setSelectedLayout,
  onStartCapture,
  cameraStream,
  setCameraStream,
  selectedDeviceId,
  setSelectedDeviceId
}: FilterScreenProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Retrieve available camera devices
  const updateDevicesList = async () => {
    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Auto-detect a Canon or EOS camera if present and none is chosen yet
      if (videoDevices.length > 0 && !selectedDeviceId) {
        const canonDevice = videoDevices.find(d => 
          d.label.toLowerCase().includes('canon') || 
          d.label.toLowerCase().includes('eos') || 
          d.label.toLowerCase().includes('utility')
        );
        if (canonDevice) {
          setSelectedDeviceId(canonDevice.deviceId);
        } else {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      }
    } catch (err) {
      console.warn("Failed to enumerate video inputs:", err);
    }
  };

  // Helper: getUserMedia with timeout to prevent infinite hanging in sandboxed frames
  const getUserMediaWithTimeout = async (constraints: MediaStreamConstraints, timeoutMs = 4000) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API not supported in this browser context");
    }
    
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Camera request timed out"));
      }, timeoutMs);
    });

    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        timeoutPromise
      ]);
      return stream;
    } finally {
      clearTimeout(timeoutId!);
    }
  };

  // Initialize camera stream based on selected device ID with robust fallbacks
  const initCamera = async (deviceIdToUse?: string) => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (cameraStream) {
        // Stop current tracks first to release system lock
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const activeId = deviceIdToUse || selectedDeviceId;
      
      // Step 1: Attempt preferred constraints (1080p or device-specific)
      const primaryConstraints: MediaStreamConstraints = {
        video: activeId 
          ? { deviceId: { exact: activeId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
        audio: false
      };

      try {
        const stream = await getUserMediaWithTimeout(primaryConstraints);
        setCameraStream(stream);
        await updateDevicesList();
      } catch (firstErr) {
        console.warn("High-res / exact device constraints rejected, trying fallback constraints...", firstErr);
        
        // Step 2: Try basic resolution with chosen device (or default user camera)
        const fallbackConstraints: MediaStreamConstraints = {
          video: activeId 
            ? { deviceId: activeId } 
            : { facingMode: 'user' },
          audio: false
        };
        
        try {
          const stream = await getUserMediaWithTimeout(fallbackConstraints);
          setCameraStream(stream);
          await updateDevicesList();
        } catch (secondErr) {
          console.warn("Secondary constraints rejected, attempting basic stream...", secondErr);
          
          // Step 3: Absolute fallback (any video stream available)
          const absoluteFallbackConstraints: MediaStreamConstraints = {
            video: true,
            audio: false
          };
          
          const stream = await getUserMediaWithTimeout(absoluteFallbackConstraints);
          setCameraStream(stream);
          await updateDevicesList();
        }
      }
    } catch (err: any) {
      console.warn("Camera initialization warning (using high-fidelity simulation fallback):", err.message || err);
      const reason = err?.name || err?.message || 'Unknown error';
      setCameraError(
        `Camera unavailable: ${reason}. Check that permission is granted, that no other app has the camera open, and that this page is loaded over HTTPS or http://localhost.`
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // Guards against React StrictMode's dev-only double-invoke of this effect.
  // Without this, two concurrent getUserMedia() calls fire on mount, which
  // makes many webcam drivers fail to start the video source for BOTH calls
  // (TrackStartError/NotReadableError) even though the camera is healthy.
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    initCamera();
    return () => {
      // Retain stream active for instant capture transition!
    };
  }, []);

  // Handle device change
  const handleDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    audioSynth.playBeep(480, 0.05);
    await initCamera(newDeviceId);
  };

  const handleFilterSelect = (filter: FilterOption) => {
    audioSynth.playBeep(440, 0.05);
    setSelectedFilter(filter);
  };

  const handleThemeSelect = (theme: StripTheme) => {
    audioSynth.playBeep(480, 0.05);
    setSelectedTheme(theme);
  };

  const handleLayoutSelect = (layout: GridLayout) => {
    audioSynth.playBeep(420, 0.05);
    setSelectedLayout(layout);
  };

  const handleProceed = () => {
    audioSynth.playBeep(600, 0.1);
    onStartCapture();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-8 select-none">
      
      {/* Decorative Gold Glow Banner */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Live Feed Preview and camera source controllers */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif text-stone-100 flex items-center gap-2">
                <Camera className="w-6 h-6 text-amber-500" />
                Live Camera Feed
              </h2>
              <p className="text-xs text-stone-400 mt-1">Configure your camera and verify alignment</p>
            </div>
          </div>

          {/* Premium Glass viewport wrapper */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-950 border-2 border-amber-500/20 shadow-[0_16px_48px_rgba(0,0,0,0.8)] group">
            {/* Real Camera Video Tag */}
            {cameraStream && !cameraError ? (
              <video
                ref={(el) => {
                  if (el) {
                    el.srcObject = cameraStream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1] transition-all duration-300"
                style={{ filter: selectedFilter.cssFilter }}
              />
            ) : (
              // Realistic Premium Mock Video Stream if Web camera is not available
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-950 to-zinc-900 select-none">
                <div className="absolute top-4 left-4 flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Live Booth Simulator
                </div>

                {isInitializing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-2 border-t-amber-500 border-amber-500/20 rounded-full animate-spin mb-4" />
                    <span className="text-stone-400 text-xs font-mono tracking-widest uppercase">Syncing Camera Stream...</span>
                  </div>
                ) : (
                  <div className="max-w-md flex flex-col items-center px-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500/80 mb-4">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-stone-200 font-serif text-lg mb-1.5">Interactive Simulator Mode</h3>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4 max-w-sm">
                      A high-fidelity photo-booth simulation is fully active! You can select filters, configure print styles, and run complete shooting sessions with retro assets.
                    </p>
                    {cameraError && (
                      <p className="text-red-400 text-[11px] font-mono leading-relaxed bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4 max-w-sm">
                        {cameraError}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 items-center w-full">
                      <button 
                        onClick={() => initCamera()}
                        className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-stone-300 text-xs font-bold hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        Retry Camera Connection
                      </button>
                      <p className="text-[10px] text-stone-500 max-w-xs mt-1">
                        💡 Tip: If using the side-by-side preview, open the app in a <strong>New Tab</strong> to grant webcam permissions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Glowing active layout tag */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/90 border border-amber-500/20 text-xs text-amber-400 backdrop-blur-md shadow-lg">
              <LayoutGrid className="w-4 h-4 text-amber-500" />
              <span className="font-mono tracking-wide">{selectedLayout.name} Layout ({selectedLayout.photoCount} Shots)</span>
            </div>

            {/* Active filter display */}
            <div className="absolute top-4 right-4 px-3 py-2 rounded-2xl bg-black/90 border border-zinc-800 text-xs text-stone-200 backdrop-blur-md shadow-lg flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${selectedFilter.previewColor}`} />
              <span className="font-medium font-mono tracking-wide">{selectedFilter.name}</span>
            </div>
          </div>

          {/* Camera hardware switcher dropdown panel */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-stone-300 font-semibold block">Camera Source Settings</span>
                <span className="text-[10px] text-stone-500 font-mono">Select your device from active USB devices</span>
              </div>
            </div>

            <div className="relative shrink-0 w-full sm:w-64">
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-stone-300 text-xs font-mono rounded-xl py-2.5 pl-3 pr-10 appearance-none focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {devices.length === 0 ? (
                  <option value="">Default Camera</option>
                ) : (
                  devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera Device ${idx + 1}`}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Panels */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 1: Photo Filters */}
          <div className="bg-zinc-950/85 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-stone-200 text-xs uppercase tracking-widest font-bold font-mono mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Select Art Filter
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {FILTERS.map((filter) => {
                const isSelected = selectedFilter.id === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter)}
                    className={`p-3.5 text-left rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.15)]' 
                        : 'bg-zinc-900/40 border-zinc-800/80 text-stone-400 hover:bg-zinc-900 hover:border-zinc-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${filter.previewColor} border border-white/10`} />
                      <span className="font-bold text-xs font-sans tracking-wide">{filter.name}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed group-hover:text-stone-400 transition-colors">
                      {filter.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture Trigger */}
          <button
            id="start-capture-btn"
            onClick={cameraStream ? handleProceed : undefined}
            disabled={!cameraStream}
            className={`w-full py-4.5 px-6 rounded-2xl font-bold tracking-widest text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              cameraStream
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 shadow-[0_6px_24px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.4)] cursor-pointer active:scale-98'
                : 'bg-zinc-900 border border-zinc-800 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className={`w-4 h-4 ${cameraStream ? 'fill-zinc-950 text-zinc-950' : 'text-stone-500'}`} />
            {cameraStream ? 'Launch Booth Session' : 'Camera Required to Launch'}
          </button>
        </div>
      </div>
    </div>
  );
}
