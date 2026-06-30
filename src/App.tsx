/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-stone-400 text-[10px] font-mono uppercase tracking-wider select-none">
            <span className={`w-2 h-2 rounded-full ${appState === 'CAPTURING' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'} mr-1`} />
            {appState === 'CAPTURING' ? 'CAPTURE MODE' : 'SYSTEM READY'}
          </div>
        </div>
      </header>

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
      </footer>
    </div>
  );
}
