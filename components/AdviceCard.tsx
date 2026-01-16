import React, { useState } from 'react';
import { Advice, AdviceMood } from '../types';
import { MOOD_COLORS } from '../constants';

interface AdviceCardProps {
  advice: Advice | null;
  loading: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  isDarkMode?: boolean;
  onToggleFavorite?: () => void;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ advice, loading, onClick, isFavorite, isDarkMode, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const currentMood = advice?.mood || AdviceMood.LIGHTHEARTED;
  const colors = MOOD_COLORS[currentMood];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!advice) return;
    navigator.clipboard.writeText(advice.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!advice) return;
    const shareText = `"${advice.text}" - Zen_X_Zany Advice Engine`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Zen_X_Zany Wisdom', text: shareText, url: window.location.href });
        setShared(true); setTimeout(() => setShared(false), 2000);
      } catch (err) { if (err instanceof Error && err.name !== 'AbortError') fallbackCopy(shareText); }
    } else { fallbackCopy(shareText); }
  };

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShared(true); setTimeout(() => setShared(false), 2000);
    });
  };

  const cardBg = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-white' : 'border-black';
  const cardText = isDarkMode ? 'text-white' : 'text-black';
  const shadowClass = isDarkMode ? 'slab-shadow-white' : 'slab-shadow';

  return (
    <div onClick={onClick} className={`relative w-full transition-all duration-300 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className={`${cardBg} ${cardBorder} border-[4px] md:border-[6px] p-6 sm:p-10 md:p-14 pb-16 sm:pb-20 ${shadowClass} relative overflow-hidden flex flex-col md:flex-row gap-8 transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1`}>
        <div className={`absolute top-0 left-0 w-full h-[10px] ${colors.primary}`} />
        
        <div className="flex-[2] relative min-h-[300px] flex flex-col justify-center">
          <div className="font-mono text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
             <div className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-black'} ${loading ? 'animate-ping' : ''}`} />
             Payload_Archive
          </div>
          
          <div className="relative">
            <h2 className={`text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter uppercase transition-all duration-500 ${cardText}`}>
              {advice?.text}
            </h2>
          </div>
        </div>

        <div className={`flex-1 flex flex-col justify-between border-t-[4px] md:border-t-0 md:border-l-[4px] ${cardBorder} pt-8 md:pt-0 md:pl-10`}>
          <div className="flex flex-row md:flex-col justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase font-bold text-gray-500">Class</span>
              <span className={`text-xl font-bold uppercase ${colors.accent}`}>{currentMood}</span>
            </div>
            <div className="flex flex-col items-end md:items-start">
              <span className="font-mono text-[9px] uppercase font-bold text-gray-500">Sector</span>
              <span className={`font-mono text-[10px] ${cardText}`}>#{advice?.id || 'FB000'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-10">
             <div className="flex gap-2">
               <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }} className={`flex-1 border-[4px] ${cardBorder} p-4 font-mono text-[10px] font-bold uppercase flex items-center justify-center transition-all ${isFavorite ? 'bg-[#FF4D00] text-black border-[#FF4D00]' : isDarkMode ? 'bg-zinc-800 text-white hover:bg-[#FF4D00]' : 'bg-white text-black hover:bg-gray-100'}`}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               </button>
               <button onClick={handleCopy} title="Copy to clipboard" className={`flex-1 border-[4px] ${cardBorder} p-4 font-mono text-[10px] font-bold uppercase flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-800 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}>
                 {copied ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
               </button>
               <button onClick={handleShare} title="Share wisdom" className={`flex-1 border-[4px] ${cardBorder} p-4 font-mono text-[10px] font-bold uppercase flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-800 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}>
                  {shared ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>}
               </button>
             </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-0 w-full flex justify-center pointer-events-none">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500/60">Click for new wisdom</span>
        </div>
      </div>
    </div>
  );
};

export default AdviceCard;
