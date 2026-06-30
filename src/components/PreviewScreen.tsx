/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Printer, RotateCcw, Sparkles, Check, Share2, Loader2 } from 'lucide-react';
import { CapturedPhoto, StripTheme, GridLayout } from '../types';
import { audioSynth } from '../utils/audio';

interface PreviewScreenProps {
  photos: CapturedPhoto[];
  selectedTheme: StripTheme;
  selectedLayout: GridLayout;
  onReset: () => void;
}

export default function PreviewScreen({ photos, selectedTheme, selectedLayout, onReset }: PreviewScreenProps) {
  const [highResUrl, setHighResUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Generate the pristine high-resolution printable PNG
  useEffect(() => {
    const generateHighResStrip = () => {
      const canvas = document.createElement('canvas');
      const isGrid = selectedLayout.id === 'grid-2x2';
      
      // Kiosk-standard high DPI canvas resolution
      if (isGrid) {
        canvas.width = 1000;
        canvas.height = 1100;
      } else {
        canvas.width = 800;
        canvas.height = 2354;
      }
      
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // 1. Draw Solid Background (Midnight Obsidian, Ivory Cream, etc.)
      ctx.fillStyle = selectedTheme.primaryColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Premium Border Outer Outline
      ctx.strokeStyle = selectedTheme.secondaryColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

      // Assemble list of images to load sequentially
      let loadedCount = 0;
      const loadedImages: HTMLImageElement[] = [];

      const assembleFinalStrip = () => {
        let brandY = 2074;

        if (isGrid) {
          // 2x2 grid card rendering
          const pw = 420; // width of each cell
          const ph = 280; // height of each cell (3:2 ratio)
          const startX = 60;
          const startY = 60;
          const gapX = 40;
          const gapY = 40;

          loadedImages.forEach((img, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = startX + col * (pw + gapX);
            const y = startY + row * (ph + gapY);

            ctx.save();
            
            // Outer shadow/border around each cell
            ctx.strokeStyle = selectedTheme.secondaryColor + '35'; // transparent tint
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 1, y - 1, pw + 2, ph + 2);

            // Clip image to perfect 3:2 rectangle
            ctx.beginPath();
            ctx.rect(x, y, pw, ph);
            ctx.clip();

            // Horizontal 16:9 webcam stream center crop to 3:2 portrait
            const sWidth = img.width;
            const sHeight = img.height;
            const targetRatio = 3 / 2;
            const currentRatio = sWidth / sHeight;

            let sx = 0;
            let sy = 0;
            let sWidthCrop = sWidth;
            let sHeightCrop = sHeight;

            if (currentRatio > targetRatio) {
              sWidthCrop = sHeight * targetRatio;
              sx = (sWidth - sWidthCrop) / 2;
            } else {
              sHeightCrop = sWidth / targetRatio;
              sy = (sHeight - sHeightCrop) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidthCrop, sHeightCrop, x, y, pw, ph);
            ctx.restore();
          });

          brandY = 740;
        } else if (selectedLayout.id === 'minimal-3') {
          // Elegant 3-Cut layout rendering
          const ph = 560; // larger 3:2 height cropped standard
          const pw = 700; // 3:2 width
          const margin = 50;
          const gap = 50;

          loadedImages.forEach((img, idx) => {
            const y = margin + idx * (ph + gap);

            ctx.save();
            
            // Outer shadow/border around each cell
            ctx.strokeStyle = selectedTheme.secondaryColor + '35'; // transparent tint
            ctx.lineWidth = 3;
            ctx.strokeRect(margin - 1, y - 1, pw + 2, ph + 2);

            // Clip image to perfect 3:2 rectangle
            ctx.beginPath();
            ctx.rect(margin, y, pw, ph);
            ctx.clip();

            // Horizontal 16:9 webcam stream center crop to 3:2 portrait
            const sWidth = img.width;
            const sHeight = img.height;
            const targetRatio = 3 / 2;
            const currentRatio = sWidth / sHeight;

            let sx = 0;
            let sy = 0;
            let sWidthCrop = sWidth;
            let sHeightCrop = sHeight;

            if (currentRatio > targetRatio) {
              sWidthCrop = sHeight * targetRatio;
              sx = (sWidth - sWidthCrop) / 2;
            } else {
              sHeightCrop = sWidth / targetRatio;
              sy = (sHeight - sHeightCrop) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidthCrop, sHeightCrop, margin, y, pw, ph);
            ctx.restore();
          });

          brandY = 1920;
        } else {
          // Classic 4-Cut layout rendering (vertical-4)
          const ph = 466; // 3:2 height cropped standard
          const pw = 700; // 3:2 width
          const margin = 50;
          const gap = 38;

          loadedImages.forEach((img, idx) => {
            const y = margin + idx * (ph + gap);

            ctx.save();
            
            // Outer shadow/border around each cell
            ctx.strokeStyle = selectedTheme.secondaryColor + '35'; // transparent tint
            ctx.lineWidth = 3;
            ctx.strokeRect(margin - 1, y - 1, pw + 2, ph + 2);

            // Clip image to perfect 3:2 rectangle
            ctx.beginPath();
            ctx.rect(margin, y, pw, ph);
            ctx.clip();

            // Horizontal 16:9 webcam stream center crop to 3:2 portrait
            const sWidth = img.width;
            const sHeight = img.height;
            const targetRatio = 3 / 2;
            const currentRatio = sWidth / sHeight;

            let sx = 0;
            let sy = 0;
            let sWidthCrop = sWidth;
            let sHeightCrop = sHeight;

            if (currentRatio > targetRatio) {
              sWidthCrop = sHeight * targetRatio;
              sx = (sWidth - sWidthCrop) / 2;
            } else {
              sHeightCrop = sWidth / targetRatio;
              sy = (sHeight - sHeightCrop) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidthCrop, sHeightCrop, margin, y, pw, ph);
            ctx.restore();
          });

          brandY = 2074;
        }

        // 3. Draw Branding Banner at the bottom
        // Horizontal Accent Lines
        ctx.strokeStyle = selectedTheme.secondaryColor + '55';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, brandY + 40);
        ctx.lineTo(canvas.width - 140, brandY + 40);
        ctx.stroke();

        // Tiny minimalist camera icon above MEMENTO
        ctx.strokeStyle = selectedTheme.secondaryColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width / 2 - 20, brandY + 12, 40, 24);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, brandY + 24, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = selectedTheme.secondaryColor;
        ctx.fillRect(canvas.width / 2 - 12, brandY + 7, 10, 5);

        // Primary Brand Text "MEMENTO"
        ctx.fillStyle = selectedTheme.secondaryColor;
        ctx.font = "bold 60px 'Playfair Display', 'Georgia', serif";
        ctx.textAlign = 'center';
        ctx.fillText("MEMENTO", canvas.width / 2, brandY + 115);

        ctx.strokeStyle = selectedTheme.secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(260, brandY + 142);
        ctx.lineTo(canvas.width - 260, brandY + 142);
        ctx.stroke();

        // Tagline - Changed to "CREATE MEMORIES" with wide modern sans spacing
        ctx.fillStyle = selectedTheme.secondaryColor + 'e8'; 
        ctx.font = "bold 16px 'JetBrains Mono', monospace";
        ctx.fillText("C R E A T E   M E M O R I E S", canvas.width / 2, brandY + 185);

        // Date Stamp
        const dateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        ctx.fillStyle = selectedTheme.secondaryColor + '75';
        ctx.font = "14px 'JetBrains Mono', monospace";
        ctx.fillText(dateStr.toUpperCase(), canvas.width / 2, brandY + 230);

        // Save URL
        const dataUrl = canvas.toDataURL('image/png');
        setHighResUrl(dataUrl);
        setIsGenerating(false);
      };

      photos.forEach((photo) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === photos.length) {
            assembleFinalStrip();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === photos.length) {
            assembleFinalStrip();
          }
        };
        img.src = photo.dataUrl;
        loadedImages.push(img);
      });
    };

    if (photos.length > 0) {
      generateHighResStrip();
    }
  }, [photos, selectedTheme, selectedLayout]);

  const handleDownload = () => {
    if (!highResUrl) return;
    audioSynth.playBeep(520, 0.05);
    
    const link = document.createElement('a');
    link.download = `memento-strip-${Date.now()}.png`;
    link.href = highResUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePrint = () => {
    audioSynth.playBeep(580, 0.08);
    setIsPrinting(true);
    
    // Trigger native printing. CSS handles hiding everything except print-layout elements
    setTimeout(() => {
      window.print();
      
      // Standalone kiosk simulation: sound cue then auto-reset
      audioSynth.playSuccessChime();
      const interval = setInterval(() => {
        audioSynth.playBeep(420, 0.05);
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        onReset();
      }, 5000);
    }, 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-8">
      {/* Print-only container */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:m-0 print:p-0">
        {highResUrl ? (
          <img 
            src={highResUrl} 
            alt="Memento Print Strip" 
            className="w-full h-full object-contain m-0 p-0"
            style={{ maxHeight: '100vh', maxWidth: '100vw' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center p-20 text-zinc-900">Generating Print Layout...</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Photorealistic 3D floating preview of the strip */}
        <div className="md:col-span-6 flex flex-col items-center">
          <h2 className="text-stone-400 font-sans tracking-widest text-xs uppercase mb-6 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" /> Finished Memory Strip
          </h2>

          <div className="relative group max-w-xs w-full flex justify-center">
            {/* Elegant wood/dark backplate frame shadow */}
            <div className="absolute inset-x-4 -inset-y-4 rounded-3xl bg-zinc-950/40 blur-2xl pointer-events-none group-hover:bg-zinc-950/60 transition-all duration-500" />
            
            {isGenerating ? (
              <div className="w-[280px] h-[820px] bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-2xl relative z-10">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-stone-400 text-xs font-mono">Stitching High-Res Strip...</span>
              </div>
            ) : (
              // 3D Rotated Floating Strip (interactive with framer/motion)
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                whileHover={{ rotateY: 0, scale: 1.02 }}
                className={`${selectedLayout.id === 'grid-2x2' ? 'w-[320px]' : 'w-[270px]'} rounded-2xl p-4 border relative z-10 shadow-[0_15px_45px_rgba(0,0,0,0.9)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] transition-all duration-300 overflow-hidden ${selectedTheme.bgClass} ${selectedTheme.borderClass}`}
              >
                {/* Glossy Photo Paper reflection highlight overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.05] to-white/[0.15] z-20" />
                
                {selectedLayout.id === 'grid-2x2' ? (
                  /* 2x2 Grid card preview */
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((photo, index) => (
                      <div 
                        key={photo.id}
                        className={`aspect-[3/2] w-full rounded-lg overflow-hidden border relative shadow-inner ${selectedTheme.borderClass}`}
                      >
                        <img 
                          src={photo.dataUrl} 
                          alt={`Capture ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Vertical strip preview (classic or trio) */
                  <div className="flex flex-col gap-3">
                    {photos.map((photo, index) => (
                      <div 
                        key={photo.id}
                        className={`aspect-[3/2] w-full rounded-lg overflow-hidden border relative shadow-inner ${selectedTheme.borderClass}`}
                      >
                        <img 
                          src={photo.dataUrl} 
                          alt={`Capture ${index + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Vertical Strip bottom branding */}
                <div className="pt-6 pb-4 text-center select-none flex flex-col items-center">
                  <div className={`w-3/5 h-[1px] mb-3 opacity-40 ${selectedTheme.textClass} bg-current`} />
                  <span 
                    className={`text-2xl font-bold tracking-tight font-serif ${selectedTheme.textClass}`}
                    style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                  >
                    MEMENTO
                  </span>
                  <div className={`w-1/3 h-[1px] mt-2 mb-2 opacity-25 ${selectedTheme.textClass} bg-current`} />
                  <span className={`text-[8px] tracking-[0.2em] font-mono opacity-60 ${selectedTheme.textClass}`}>
                    MEMORIES CAPTURED FOREVER
                  </span>
                  <span className={`text-[7px] font-mono tracking-wider mt-1 opacity-40 ${selectedTheme.textClass}`}>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive control actions */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-amber-400 font-serif text-2xl md:text-3xl mb-2">Beautiful Memory!</h3>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 font-sans">
              Your Memento photo strip is ready. You can print directly onto a connected photo/thermal printer or save the high-resolution file to your device.
            </p>

            <div className="flex flex-col gap-3">
              
              {/* Print Action */}
              <button
                id="print-strip-btn"
                onClick={handlePrint}
                disabled={isGenerating || isPrinting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-zinc-950 font-bold tracking-wider text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                {isPrinting ? "Sending dispatch to printer..." : "Print Strip Now"}
              </button>

              {/* Download Action */}
              <button
                id="download-strip-btn"
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-stone-200 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                {isSaved ? "Saved to local PC!" : "Download High-Res PNG"}
              </button>

              <div className="border-t border-zinc-900 my-4 pt-4">
                <span className="text-[10px] text-stone-500 font-mono block uppercase tracking-widest text-center mb-4">
                  Print Format: 2" x 6" Photo Strip • 300 DPI High Resolution
                </span>
                
                {/* Reset session action */}
                <button
                  id="reset-booth-btn"
                  onClick={() => {
                    audioSynth.playBeep(380, 0.08);
                    onReset();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-transparent border border-amber-500/20 text-amber-400 font-semibold text-xs tracking-wider uppercase hover:bg-amber-500/5 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Session / Start Over
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Printing Simulation Overlay */}
      <AnimatePresence>
        {isPrinting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-[99999] flex flex-col items-center justify-center text-center select-none no-print"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md px-6 py-10 rounded-3xl border border-amber-500/25 bg-zinc-900/80 shadow-[0_20px_50px_rgba(245,158,11,0.15)] flex flex-col items-center"
            >
              {/* Rotating glowing mechanism */}
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <Printer className="w-10 h-10 text-amber-500" />
              </div>
              
              <h2 className="text-amber-400 font-serif text-3xl mb-3">Printing Strip...</h2>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                Your high-resolution "Memento" strip is being sent to the printer. Collecting memories, framing them forever.
              </p>

              {/* Progress Bar simulation */}
              <div className="w-64 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-2">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-500"
                />
              </div>
              <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase animate-pulse">
                Auto-resetting booth in 5s
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
