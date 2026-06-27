/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, Laptop, Camera, HelpCircle as HelpIcon, CheckCircle2 } from 'lucide-react';
import { AppState, FilterOption, StripTheme, CapturedPhoto, GridLayout } from './types';
import { FILTERS, STRIP_THEMES, GRID_LAYOUTS } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import FilterScreen from './components/FilterScreen';
import CameraScreen from './components/CameraScreen';
import PreviewScreen from './components/PreviewScreen';
import { audioSynth } from './utils/audio';

export default function App() {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTERS[1]); // Default: Vintage Gold
  const [selectedTheme, setSelectedTheme] = useState<StripTheme>(STRIP_THEMES[0]); // Default: Royal Gold
  const [selectedLayout, setSelectedLayout] = useState<GridLayout>(GRID_LAYOUTS[0]); // Default: Classic 4-Cut
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showOperatorPanel, setShowOperatorPanel] = useState(false);

  // Stop camera tracks on reset / clear stream
  const releaseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Re-initialise state on reset
  const handleReset = () => {
    releaseCamera();
    setPhotos([]);
    setAppState('WELCOME');
  };

  // Handle Capture Finished
  const handleCaptureComplete = (capturedPhotos: CapturedPhoto[]) => {
    setPhotos(capturedPhotos);
    setAppState('PREVIEW');
    releaseCamera();
  };

  useEffect(() => {
    // Release camera tracks if page is closed/refreshed
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div 
      id="app-container"
      className="min-h-screen bg-black text-stone-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300 overflow-x-hidden relative"
    >
      {/* Background Starry/Glow mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Premium Brand Header */}
      <header className="w-full border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-zinc-950 font-bold font-serif shadow-md select-none">
            M
          </div>
          <div>
            <span 
              className="font-serif text-lg tracking-widest text-amber-400 block"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              MEMENTO
            </span>
            <span className="text-[9px] text-stone-500 font-mono tracking-widest uppercase block -mt-1">
              STUDIO EDITION
            </span>
          </div>
        </div>

        {/* Dynamic State Badges */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-stone-400 text-[10px] font-mono uppercase tracking-wider select-none">
            <span className={`w-2 h-2 rounded-full ${appState === 'CAPTURING' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'} mr-1`} />
            System Status: OK
          </div>

          <button
            onClick={() => {
              audioSynth.playBeep(440, 0.04);
              setShowOperatorPanel(!showOperatorPanel);
            }}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
            title="Kiosk Operators Manual"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Kiosk Operations Overlay */}
      <AnimatePresence>
        {showOperatorPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-amber-500/10 border-b border-amber-500/25 p-5 md:p-6 text-stone-300 text-xs no-print relative z-50 backdrop-blur-md"
          >
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-amber-400 font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4" />
                  Kiosk Mode Settings
                </h4>
                <p className="leading-relaxed text-stone-400">
                  Run browser in <strong>Fullscreen Mode</strong> (press <strong>F11</strong>). This hides address bars and maximizes vertical space, mimicking a premium retail camera enclosure.
                </p>
              </div>
              <div>
                <h4 className="text-amber-400 font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Hardware Cameras
                </h4>
                <p className="leading-relaxed text-stone-400">
                  Connect any standard wide-angle webcam or DSLR virtual stream. If camera access is blocked, check chrome site permissions. High-fidelity generative simulations will run if no hardware is present.
                </p>
              </div>
              <div>
                <h4 className="text-amber-400 font-bold uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Printers & Outputs
                </h4>
                <p className="leading-relaxed text-stone-400">
                  Configure your connected 2x6 photo strip or thermal receipt printer. Disable headers & footers in browser print settings. Layout renders at 300 DPI for pristine glossy prints.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowOperatorPanel(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-amber-400 text-sm font-semibold cursor-pointer"
            >
              × Close Panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center py-6 no-print">
        <AnimatePresence mode="wait">
          {appState === 'WELCOME' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <WelcomeScreen onProceed={() => setAppState('FILTER_SELECT')} />
            </motion.div>
          )}

          {appState === 'FILTER_SELECT' && (
            <motion.div
              key="filter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <FilterScreen
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                selectedTheme={selectedTheme}
                setSelectedTheme={setSelectedTheme}
                selectedLayout={selectedLayout}
                setSelectedLayout={setSelectedLayout}
                onStartCapture={() => setAppState('CAPTURING')}
                cameraStream={cameraStream}
                setCameraStream={setCameraStream}
                selectedDeviceId={selectedDeviceId}
                setSelectedDeviceId={setSelectedDeviceId}
              />
            </motion.div>
          )}

          {appState === 'CAPTURING' && (
            <motion.div
              key="capturing"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <CameraScreen
                selectedFilter={selectedFilter}
                cameraStream={cameraStream}
                onCaptureComplete={handleCaptureComplete}
                onCancel={handleReset}
                photoCount={selectedLayout.photoCount}
              />
            </motion.div>
          )}

          {appState === 'PREVIEW' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <PreviewScreen
                photos={photos}
                selectedTheme={selectedTheme}
                selectedLayout={selectedLayout}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding Bar */}
      <footer className="w-full border-t border-zinc-950 py-5 px-6 text-center text-stone-600 text-[10px] font-mono uppercase tracking-widest no-print select-none">
        <div>© {new Date().getFullYear()} Memento Photo Systems. All rights reserved.</div>
        <div className="text-stone-700 mt-1">Designed for robust local mini PC kiosk deployment</div>
      </footer>
    </div>
  );
}
