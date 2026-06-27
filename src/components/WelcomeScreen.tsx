/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Sparkles, CheckCircle2, ArrowRight, Smartphone, Coins } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface WelcomeScreenProps {
  onProceed: () => void;
}

export default function WelcomeScreen({ onProceed }: WelcomeScreenProps) {
  const [paymentState, setPaymentState] = useState<'IDLE' | 'SCANNING' | 'CONFIRMING' | 'SUCCESS'>('IDLE');

  const startPaymentSimulation = () => {
    audioSynth.playBeep(520, 0.1);
    setPaymentState('SCANNING');
    
    // Simulate scanner detecting/initiating UPI payment
    setTimeout(() => {
      setPaymentState('CONFIRMING');
      audioSynth.playBeep(650, 0.15);
      
      // Simulate banking network confirmation
      setTimeout(() => {
        setPaymentState('SUCCESS');
        audioSynth.playSuccessChime();
        
        // Auto-proceed to photo configuration
        setTimeout(() => {
          onProceed();
        }, 1800);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center select-none">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full flex flex-col items-center"
      >
        {/* Luxury Badge */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium tracking-widest uppercase mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Kiosk Edition
        </motion.div>

        {/* Brand Logo Header */}
        <h1 
          id="memento-logo-header"
          className="text-6xl md:text-8xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.15)] select-none mb-4"
          style={{ fontFamily: "'Playfair Display', 'Didot', serif" }}
        >
          MEMENTO
        </h1>
        
        <p className="text-stone-400 font-sans tracking-wide text-lg md:text-xl mb-12 max-w-md">
          Welcome. Let’s capture a memory.
        </p>

        {/* Interactive Payment Gateway Box */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-full bg-zinc-950/80 border border-amber-500/25 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          {/* Subtle gold border glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

          <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
            <div className="text-left">
              <span className="text-stone-500 text-xs uppercase tracking-widest block font-mono">Service Fee</span>
              <span className="text-2xl font-semibold text-stone-100 tracking-tight">₹200 <span className="text-xs text-amber-400 font-mono font-medium">per print strip</span></span>
            </div>
            <div className="flex gap-2 text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {paymentState === 'IDLE' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                {/* Simulated QR Code Canvas Placeholder */}
                <div className="relative p-4 bg-white rounded-xl mb-6 shadow-lg border border-amber-500/20 group">
                  <div className="w-40 h-40 flex items-center justify-center bg-stone-50 relative">
                    {/* Nested SVG QR code design */}
                    <svg className="w-36 h-36 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="6" height="6" />
                      <rect x="2" y="16" width="6" height="6" />
                      <rect x="16" y="2" width="6" height="6" />
                      <rect x="9" y="9" width="6" height="6" />
                      <path d="M9 2h3M13 2h1M13 6h1M9 16h2M13 16h1M2 13h4M16 13h6M19 16h3M16 20h2" />
                    </svg>
                    {/* Tiny golden lock in center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-amber-500 border-2 border-white flex items-center justify-center shadow-md">
                      <QrCode className="w-4.5 h-4.5 text-zinc-950" />
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-widest text-center">
                    Scan using any UPI App
                  </div>
                </div>

                <p className="text-stone-400 text-sm mb-6 flex items-center gap-1.5 justify-center">
                  <Smartphone className="w-4 h-4 text-amber-500" /> Use GPay, PhonePe, or Paytm to pay
                </p>

                <button
                  id="simulate-payment-btn"
                  onClick={startPaymentSimulation}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-zinc-950 font-semibold tracking-wide hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_24px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  Pay to Start Strip 
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {paymentState === 'SCANNING' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-6" />
                <h3 className="text-amber-400 font-semibold text-lg mb-2">Simulating Mobile Scan...</h3>
                <p className="text-stone-400 text-sm max-w-xs font-sans">
                  Awaiting payment authentication from banking terminal.
                </p>
              </motion.div>
            )}

            {paymentState === 'CONFIRMING' && (
              <motion.div
                key="confirming"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
                <h3 className="text-emerald-400 font-semibold text-lg mb-2">Confirming Transaction...</h3>
                <p className="text-stone-400 text-sm max-w-xs font-sans">
                  Processing deposit and preparing high-speed printing queue.
                </p>
              </motion.div>
            )}

            {paymentState === 'SUCCESS' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ times: [0, 0.6, 1], duration: 0.4 }}
                  className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h3 className="text-emerald-400 font-bold text-xl mb-1">Payment Successful!</h3>
                <p className="text-stone-400 text-sm">
                  Preparing your Memento session. Look at the camera!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer info for hardware test */}
        <div className="mt-8 text-[11px] text-stone-600 font-mono uppercase tracking-widest">
          Hardware Interface: Simulated PC Loop • Port 3000 Ingress OK
        </div>
      </motion.div>
    </div>
  );
}
