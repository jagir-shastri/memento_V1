/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { FilterOption, CapturedPhoto } from '../types';
import { audioSynth } from '../utils/audio';

interface CameraScreenProps {
  selectedFilter: FilterOption;
  cameraStream: MediaStream | null;
  onCaptureComplete: (photos: CapturedPhoto[]) => void;
  onCancel: () => void;
  photoCount: number;
}

export default function CameraScreen({
  selectedFilter,
  cameraStream,
  onCaptureComplete,
  onCancel,
  photoCount
}: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const currentPhotoNumber = Math.min(capturedPhotos.length + 1, photoCount);
  const [countdown, setCountdown] = useState(5); // 5 to 0
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);

  // Main capturing flow controller
  useEffect(() => {
    if (!cameraStream) return;

    if (!isIntermission && !isCapturing && capturedPhotos.length < photoCount) {
      setIsCapturing(true);
      setCountdown(5);
    }
  }, [isCapturing, isIntermission, capturedPhotos.length, photoCount, cameraStream]);

  // Countdown ticker effect
  useEffect(() => {
    if (!isCapturing) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
        // Beep sound
        audioSynth.playBeep(countdown === 2 ? 660 : 440, 0.08);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      triggerShutterCapture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapturing, countdown]);

  // Capture frame from stream or render simulated graphics
  const triggerShutterCapture = () => {
    // Shutter sounds and flash animations
    setFlashActive(true);
    audioSynth.playShutter();
    
    setTimeout(() => {
      setFlashActive(false);
    }, 150);

    // Grab frame
    let photoDataUrl = '';
    
    if (videoRef.current && cameraStream) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          
          // Mirror horizontally for natural photo booth feel
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
          
          // Apply active CSS filter on canvas rendering
          if (selectedFilter.cssFilter && selectedFilter.cssFilter !== 'none') {
            context.filter = selectedFilter.cssFilter;
          }
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          photoDataUrl = canvas.toDataURL('image/png');
        }
      } catch (err: any) {
        console.warn("Frame grab fallback to simulated snapshot:", err.message || err);
      }
    }

    // Since we want a production ready application, if cameraStream is not working or active, we do not proceed.
    if (!photoDataUrl) {
      console.error("Camera connection is offline or inaccessible; capture aborted.");
      setIsCapturing(false);
      return;
    }

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}-${capturedPhotos.length + 1}`,
      dataUrl: photoDataUrl,
      timestamp: Date.now()
    };

    const updatedList = [...capturedPhotos, newPhoto];
    setCapturedPhotos(updatedList);
    setIsCapturing(false);

    if (updatedList.length < photoCount) {
      // 2-second intermission so the user can look at their captured photo and prepare for the next one
      setIsIntermission(true);
      setTimeout(() => {
        setIsIntermission(false);
        setCountdown(5);
      }, 2000);
    } else {
      // Completed capturing all! Show quick success and proceed
      setTimeout(() => {
        audioSynth.playSuccessChime();
        onCaptureComplete(updatedList);
      }, 800);
    }
  };

  // Helper: Generates beautiful retro stylized placeholders if webcam is offline
  const generateSimulatedPhoto = (index: number, filter: FilterOption): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Base premium background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (filter.id === 'noir') {
        grad.addColorStop(0, '#18181b');
        grad.addColorStop(1, '#09090b');
      } else if (filter.id === 'vintage-gold') {
        grad.addColorStop(0, '#2d1a04');
        grad.addColorStop(1, '#1c1002');
      } else if (filter.id === 'cyberpunk') {
        grad.addColorStop(0, '#310a24');
        grad.addColorStop(1, '#0e0417');
      } else {
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#030712');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Creative background patterns
      ctx.strokeStyle = filter.id === 'vintage-gold' ? '#f59e0b22' : '#ffffff11';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw elegant camera lens visual
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 140, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b55';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nested gold visual
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Golden flare text
      ctx.fillStyle = '#f59e0b';
      ctx.font = "italic bold 32px 'Georgia', serif";
      ctx.textAlign = 'center';
      ctx.fillText(`MEMENTO PHOTO ${index}`, canvas.width / 2, canvas.height / 2 + 10);

      // Metadata info tag
      ctx.fillStyle = '#78716c';
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillText(`FILTER: ${filter.name.toUpperCase()}  |  CAPTURE_INDEX: 0${index}`, canvas.width / 2, canvas.height / 2 + 50);

      // Add film grain dots
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = filter.id === 'noir' ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.04)';
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Apply CSS Filters on top of fallback
      if (filter.cssFilter && filter.cssFilter !== 'none') {
        ctx.filter = filter.cssFilter;
      }
    }
    return canvas.toDataURL('image/png');
  };

  if (!cameraStream) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center select-none">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 shadow-lg shadow-red-500/5">
          <Camera className="w-10 h-10 animate-pulse" />
        </div>
        <h2 className="text-2xl font-serif text-stone-100 mb-3" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
          Camera Connection Lost
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-md">
          The video stream could not be established or was disconnected. A physical camera input is required to operate the photo booth.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-stone-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
        >
          Return to Setup Screen
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col justify-center min-h-[85vh]">
      {/* White Full Screen Shutter Flash Overlay */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            key="flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left column: Camera viewport inside a premium golden frame */}
        <div className="lg:col-span-8 flex flex-col gap-4 relative">
          
          {/* Header Progress status */}
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-sans tracking-wide text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Recording Active
            </span>
            <span className="text-amber-400 font-mono font-medium text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Photo {currentPhotoNumber} of {photoCount}
            </span>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-950 border-4 border-amber-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.8)]">
            
            {/* Mirroring video stream */}
            {cameraStream ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.srcObject = cameraStream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{ filter: selectedFilter.cssFilter }}
              />
            ) : (
              // Offline studio pattern
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-t-amber-500 border-amber-500/20 rounded-full animate-spin mx-auto mb-4" />
                  <span className="text-stone-400 font-mono text-xs">Awaiting Hardware Pipeline...</span>
                </div>
              </div>
            )}

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

            {/* Big Centered Countdown Number */}
            <AnimatePresence>
              {isCapturing && countdown > 0 && (
                <motion.div
                  key="countdown-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/45 z-10 select-none pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                      {/* Circular Timer progress ring matching reference image */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Gray track ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="2.5"
                          fill="transparent"
                        />
                        {/* Golden indicator arc */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#f59e0b" // amber-500
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray="263.89" // 2 * pi * r (2 * 3.14159 * 42)
                          animate={{ strokeDashoffset: 263.89 * (1 - countdown / 5) }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                      </svg>
                      
                      {/* Stylized Number in Bebas Neue with snappy pop enter/exit */}
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={countdown}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.4, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute text-7xl md:text-8xl font-bebas font-normal tracking-wide text-white drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)] leading-none pt-2"
                        >
                          0{countdown}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    
                    <span className="text-amber-400 font-mono tracking-[0.3em] text-xs font-bold uppercase mt-6 bg-black/60 px-4 py-1.5 rounded-full border border-amber-500/20">
                      Get Ready
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Cheese! text just before snapshot */}
              {isCapturing && countdown === 0 && (
                <motion.div
                  key="cheese"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-amber-500/10 z-10 pointer-events-none"
                >
                  <span className="text-5xl md:text-7xl font-serif font-black tracking-wide text-white bg-amber-500 px-8 py-4 rounded-3xl shadow-2xl uppercase border-2 border-amber-300">
                    SMILE! 📸
                  </span>
                </motion.div>
              )}

              {/* Intermission visual cue */}
              {isIntermission && (
                <motion.div
                  key="intermission"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 z-10 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 animate-ping">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-emerald-400 font-semibold text-lg font-sans">Snapshot Saved!</h4>
                  <p className="text-stone-400 text-xs mt-1">Get ready for pose 0{capturedPhotos.length + 1}...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: Thumbnails strip representing photos already shot */}
        <div className="lg:col-span-4 flex flex-col gap-5 h-full justify-between">
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-stone-300 text-xs font-semibold uppercase tracking-widest font-sans border-b border-zinc-900 pb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-500" /> Captured Slots
            </h3>
            
            {/* Dynamic Photo slots */}
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2.5">
              {Array.from({ length: photoCount }, (_, i) => i).map((slotIdx) => {
                const photo = capturedPhotos[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`aspect-video rounded-xl overflow-hidden border relative flex items-center justify-center ${
                      photo 
                        ? 'border-emerald-500/50 bg-zinc-900' 
                        : slotIdx === capturedPhotos.length 
                          ? 'border-amber-500 bg-amber-500/5 animate-pulse' 
                          : 'border-zinc-800 bg-zinc-950/60'
                    }`}
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo.dataUrl}
                          alt={`Slot ${slotIdx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950">
                          <CheckCircle className="w-3 h-3 text-white fill-emerald-500" />
                        </div>
                      </>
                    ) : (
                      <span className="font-mono text-xs text-stone-600">
                        {slotIdx === capturedPhotos.length && !isIntermission ? 'CAPTURE' : `SLOT 0${slotIdx + 1}`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-red-500/30 text-red-400 font-semibold text-xs tracking-wider uppercase hover:bg-red-500/10 hover:border-red-500 transition-all cursor-pointer text-center"
          >
            Abort Session
          </button>
        </div>
      </div>
    </div>
  );
}
