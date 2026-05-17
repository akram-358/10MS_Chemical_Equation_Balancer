import React, { useState } from 'react';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackCTAProps {
  lang: 'en' | 'bn';
}

export default function FeedbackCTA({ lang }: FeedbackCTAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const simulationName = "chemical-reaction-balancer";
  const tallyUrl = `https://tally.so/r/RG87VJ?simulation_name=${simulationName}`;

  return (
    <>
      {/* Floating CTA Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[76px] right-4 sm:bottom-24 sm:right-6 z-[150] bg-white text-[var(--ten-ink)] p-3.5 sm:px-5 sm:py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2.5 hover:bg-gray-50 transition-all border border-[var(--border)] group active:scale-95 cursor-pointer"
      >
        <div className="relative">
          <MessageSquare size={18} className="text-[var(--ten-red)] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--ten-red)] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--ten-red)] rounded-full" />
        </div>
        <span className="hidden sm:inline font-bold text-[13px] tracking-tight bn">
          {lang === 'bn' ? 'তোমার মতামত জানাও' : 'Give Feedback'}
        </span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-[95%] h-[85vh] sm:h-[85vh] max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20"
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center px-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-xl">
                    <MessageSquare size={20} className="text-[var(--ten-red)]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-[var(--ten-ink)] text-sm uppercase tracking-tight bn">
                      {lang === 'bn' ? 'মতামত ফরম' : 'Feedback Form'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bn">
                      {lang === 'bn' ? 'আপনার অভিজ্ঞতা আমাদের জানান' : 'Tell us about your experience'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 bg-gray-50 sm:bg-transparent hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[var(--ten-ink)] active:scale-90 cursor-pointer"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Tally Iframe */}
              <div className="flex-1 relative bg-gray-50/50">
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px] z-10">
                    <div className="relative">
                      <Loader2 className="animate-spin text-[var(--ten-red)]" size={32} />
                      <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full" />
                    </div>
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse bn">
                      {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                    </p>
                  </div>
                )}
                <iframe
                  src={tallyUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Feedback Form"
                  onLoad={() => setLoading(false)}
                  className="w-full h-full"
                />
              </div>

              {/* Footer */}
              <div className="bg-white p-3 border-t border-gray-50 text-center">
                 <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest bn">
                   Powered by Tally & 10 Minute School
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
