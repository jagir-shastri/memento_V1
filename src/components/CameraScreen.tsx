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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(1); // 1 to 4
  const [countdown, setCountdown] = useState(5); // 5 to 0
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);

  // Bind stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Main capturing flow controller
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (!isIntermission && !isCapturing && capturedPhotos.length < photoCount) {
      setIsCapturing(true);
      setCountdown(5);
    }

    if (isCapturing && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            triggerShutterCapture();
            return 0;
          }
          // Tick sound
          audioSynth.playBeep(prev === 2 ? 660 : 440, 0.08);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isCapturing, countdown, isIntermission, capturedPhotos.length]);

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
      } catch (err) {
        console.error("Frame grab failure, falling back to simulated snapshot:", err);
      }
    }

    // Fallback placeholder generation (adds retro flair for simulation)
    if (!photoDataUrl) {
      photoDataUrl = generateSimulatedPhoto(currentPhotoIndex, selectedFilter);
    }

    const newPhoto: CapturedPhoto = {
      id: `photo-${Date.now()}-${currentPhotoIndex}`,
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
        setCurrentPhotoIndex((prev) => prev + 1);
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
              Photo {currentPhotoIndex} of {photoCount}
            </span>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-950 border-4 border-amber-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.8)]">
            
            {/* Mirroring video stream */}
            {cameraStream ? (
              <video
                ref={videoRef}
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
            <AnimatePresence mode="wait">
              {isCapturing && countdown > 0 && (
                <motion.div
                  key={`cnt-${countdown}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: [0.6, 1.2, 1], opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.8, times: [0, 0.4, 1] }}
                  className="absolute inset-0 flex items-center justify-center bg-black/35 z-10 select-none pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-9xl md:text-[11rem] font-bold font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                      {countdown}
                    </span>
                    <span className="text-amber-400/80 font-mono tracking-[0.25em] text-sm font-semibold uppercase mt-2">
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
                  <p className="text-stone-400 text-xs mt-1">Get ready for pose 0{currentPhotoIndex + 1}...</p>
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
