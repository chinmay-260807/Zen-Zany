import React, { useState, useEffect } from 'react';
import { Advice, AdviceMood } from '../types';
import { MOOD_COLORS } from '../constants';
import { getAdviceBackstory } from '../services/geminiService';

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
  const [backstory, setBackstory] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showBackstory, setShowBackstory] = useState(false);
  const [backstoryError, setBackstoryError] = useState(false);

  const currentMood = advice?.mood || AdviceMood.LIGHTHEARTED;
  const colors = MOOD_COLORS[currentMood];

  useEffect(() => {
    setBackstory(null);
    setShowBackstory(false);
    setBackstoryError(false);
  }, [advice]);

  const handleExplain = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!advice || isExplaining) return;
    if (backstory && !backstoryError) {
      setShowBackstory(!showBackstory);
      return;
    }
    setIsExplaining(true);
    setBackstoryError(false);
    try {
      const explanation = await getAdviceBackstory(advice.text, advice.mood);
      setBackstory(explanation);
      setShowBackstory(true);
    } catch (err) {
      setBackstory("COMM_FAILURE // UNABLE_TO_RETRIEVE_CONTEXT");
      setBackstoryError(true);
      setShowBackstory(true);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!advice) return;
    navigator.clipboard.writeText(advice.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cardBg = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-white' : 'border-black';
  const cardText = isDarkMode ? 'text-white' : 'text-black';
  const shadowClass = isDarkMode ? 'slab-shadow-white' : 'slab-shadow';
  const explanationBg = isDarkMode ? 'bg-zinc-900' : 'bg-white';

  return (
    <div onClick={onClick} className={`relative w-full transition-all duration-300 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className={`${cardBg} ${cardBorder} border-[4px] md:border-[6px] p-6 sm:p-10 md:p-14 pb-16 sm:pb-20 ${shadowClass} relative overflow-hidden flex flex-col md:flex-row gap-8 transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1`}>
        <div className={`absolute top-0 left-0 w-full h-[10px] ${colors.primary}`} />
        
        <div className="flex-[2] relative min-h-[300px] flex flex-col justify-center">
          <div className="font-mono text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
             <div className={`w-2 h-2 ${isDarkMode ? 'bg-white' : 'bg-black'} animate-ping`} />
             Payload_Archive
          </div>
          
          <div className="relative">
            <h2 className={`text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter uppercase transition-all duration-500 ${showBackstory ? 'opacity-0 scale-90 blur-lg' : 'opacity-100 scale-100'} ${cardText}`}>
              {advice?.text}
            </h2>
            
            <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ${showBackstory ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className={`${explanationBg} border-[4px] ${cardBorder} p-6 sm:p-10 ${isDarkMode ? 'shadow-[8px_8px_0px_0px_#ffffff]' : 'shadow-[8px_8px_0px_0px_#000000]'}`}>
                <span className="font-mono text-[10px] font-bold uppercase mb-4 text-[#FF4D00] block tracking-widest">Logic_Backstory</span>
                <p className={`text-xl md:text-2xl font-bold font-mono lowercase ${backstoryError ? 'text-red-500' : cardText}`}>
                  {backstory}
                </p>
                <button onClick={(e) => { e.stopPropagation(); setShowBackstory(false); }} className={`mt-8 font-mono text-[10px] font-bold uppercase px-4 py-2 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>CLOSE_CONTEXT</button>
              </div>
            </div>
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
             <button onClick={handleExplain} className={`p-4 font-mono text-[10px] font-bold uppercase transition-all flex justify-between items-center ${isDarkMode ? 'bg-white text-black hover:bg-[#FF4D00] hover:text-white' : 'bg-black text-white hover:bg-[#FF4D00]'}`}>
               <span>{isExplaining ? 'PROCESS...' : 'EXPLAIN'}</span>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
             </button>
             <div className="flex gap-2">
               <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }} className={`flex-1 border-[4px] ${cardBorder} p-4 font-mono text-[10px] font-bold uppercase flex items-center justify-center transition-all ${isFavorite ? 'bg-[#FF4D00] text-black' : isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               </button>
               <button onClick={handleCopy} className={`flex-1 border-[4px] ${cardBorder} p-4 font-mono text-[10px] font-bold uppercase flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>
                 {copied ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdviceCard;