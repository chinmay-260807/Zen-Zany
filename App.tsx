import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Advice, AdviceMood, AdviceState } from './types';
import { FALLBACK_ADVICE } from './constants';
import { generateAdvice } from './services/geminiService';
import AdviceCard from './components/AdviceCard';

const App: React.FC = () => {
  const [state, setState] = useState<AdviceState>(() => {
    const initial = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)];
    let storedHistory: Advice[] = [];
    try {
      const saved = localStorage.getItem('zen_zany_history');
      if (saved) storedHistory = JSON.parse(saved);
    } catch (e) { console.error("History recovery error", e); }

    return {
      current: { ...initial, id: 'INIT-' + initial.id },
      history: storedHistory,
      loading: false,
      error: null,
    };
  });
  
  const [favorites, setFavorites] = useState<Advice[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [purgeArmed, setPurgeArmed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const purgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedFavs = localStorage.getItem('zen_zany_favorites');
    if (storedFavs) {
      try { setFavorites(JSON.parse(storedFavs)); } catch (e) {}
    }
    const storedTheme = localStorage.getItem('zen_zany_theme');
    if (storedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_zany_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('zen_zany_history', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    localStorage.setItem('zen_zany_theme', isDarkMode ? 'dark' : 'light');
    document.body.className = isDarkMode ? 'dark' : 'light';
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f0f0f0';
  }, [isDarkMode]);

  const toggleFavorite = useCallback((advice: Advice) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.text === advice.text);
      if (exists) return prev.filter(f => f.text !== advice.text);
      return [advice, ...prev];
    });
  }, []);

  const getNewAdvice = useCallback(async () => {
    if (state.loading) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    try {
      const newAdvice = await generateAdvice();
      setState(prev => {
        // Strict deduplication by text content
        const combined = [newAdvice, ...prev.history];
        const uniqueHistory = combined.filter((v, i, a) => 
          a.findIndex(t => t.text === v.text) === i
        ).slice(0, 15);
        
        return {
          ...prev,
          current: newAdvice,
          history: uniqueHistory,
          loading: false,
        };
      });
    } catch (err) {
      console.error("API Error, using fallback:", err);
      const randomFallback = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)];
      const fallbackWithId = { ...randomFallback, id: 'FB-' + Date.now().toString(16).substring(8) };
      
      setState(prev => {
        const combined = [fallbackWithId, ...prev.history];
        const uniqueHistory = combined.filter((v, i, a) => 
          a.findIndex(t => t.text === v.text) === i
        ).slice(0, 15);

        return {
          ...prev,
          current: fallbackWithId,
          history: uniqueHistory,
          loading: false,
          error: "COMM_SYNC_ISSUE // OFFLINE_CACHE_ACTIVE"
        };
      });
    }
  }, [state.loading, state.history]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handlePurgeClick = useCallback(() => {
    if (purgeArmed) {
      setFavorites([]);
      setPurgeArmed(false);
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
    } else {
      setPurgeArmed(true);
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
      purgeTimerRef.current = setTimeout(() => setPurgeArmed(false), 3000);
    }
  }, [purgeArmed]);

  const isCurrentFavorite = state.current ? favorites.some(f => f.text === state.current?.text) : false;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${isDarkMode ? 'bg-[#121212] text-white border-white' : 'bg-[#f0f0f0] text-black border-black'} ${isFlashing ? 'glitch-flash' : ''}`}>
      <nav className={`w-full border-b-[4px] p-4 md:p-6 flex justify-between items-center sticky top-0 z-50 transition-colors ${isDarkMode ? 'bg-[#1a1a1a] border-white' : 'bg-white border-black'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>Z</div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">Zen_X_Zany // v3.03</h1>
        </div>
        <button onClick={handleThemeToggle} className={`flex items-center gap-2 px-3 py-1 border-[2px] font-mono text-[10px] font-bold uppercase transition-all ${isDarkMode ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>
          <span className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-yellow-400' : 'bg-indigo-600'}`} />
          {isDarkMode ? 'MODE_DRK' : 'MODE_LIT'}
        </button>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className={`flex-[3] p-6 md:p-12 lg:p-20 flex flex-col justify-center border-b-[4px] md:border-b-0 md:border-r-[4px] ${isDarkMode ? 'border-white' : 'border-black'}`}>
          <AdviceCard 
            advice={state.current} 
            loading={state.loading} 
            onClick={getNewAdvice} 
            isFavorite={isCurrentFavorite}
            isDarkMode={isDarkMode}
            onToggleFavorite={() => state.current && toggleFavorite(state.current)}
          />
          <div className="mt-12 flex flex-wrap gap-4">
            <button onClick={getNewAdvice} disabled={state.loading} className={`px-8 py-4 font-bold uppercase tracking-widest active-press transition-all flex items-center gap-4 ${isDarkMode ? 'bg-white text-black slab-shadow-white' : 'bg-black text-white slab-shadow'} disabled:opacity-50`}>
              {state.loading ? 'ANALYZING...' : 'GENERATE_WISDOM'}
              <span className={`w-4 h-4 rounded-full ${isDarkMode ? 'bg-black' : 'bg-white'}`} />
            </button>
          </div>
        </div>

        <aside className={`flex-1 p-8 md:p-12 flex flex-col gap-10 overflow-y-auto max-h-[calc(100vh-140px)] ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Recent_Output_Log</h3>
              <button onClick={() => setState(p => ({ ...p, history: [] }))} className={`font-mono text-[9px] font-bold border px-2 py-0.5 ${isDarkMode ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>WIPE</button>
            </div>
            <div className="flex flex-col gap-3">
              {state.history.length === 0 && <span className="font-mono text-[10px] text-gray-500 italic">EMPTY_LOGS</span>}
              {state.history.map((h, i) => (
                <div key={`${h.id}-${i}`} className={`font-mono text-[10px] border-l-2 pl-4 py-2 cursor-pointer transition-all ${isDarkMode ? 'border-[#FF4D00] text-gray-200 hover:bg-white/5' : 'border-[#FF4D00] text-black hover:bg-black/5'}`} onClick={() => setState(p => ({ ...p, current: h }))}>
                  <span className="text-[#FF4D00] font-bold">[ID_{h.id?.substring(0,4)}]</span> {h.text.substring(0, 45)}...
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Favorites_Database</h3>
              <button onClick={handlePurgeClick} className={`font-mono text-[9px] font-bold border px-2 py-0.5 ${purgeArmed ? 'bg-red-600 text-white border-red-800' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}>{purgeArmed ? 'SURE?' : 'PURGE'}</button>
            </div>
            <div className="flex flex-col gap-3">
              {favorites.length === 0 && <span className="font-mono text-[10px] text-gray-500 italic">NO_SAVED_DATA</span>}
              {favorites.map((f, i) => (
                <div key={`fav-${f.id}-${i}`} className={`font-mono text-[10px] border-l-2 pl-4 py-2 flex justify-between items-center group cursor-pointer ${isDarkMode ? 'border-[#FF4D00] text-gray-200 hover:bg-orange-950/20' : 'border-[#FF4D00] text-black hover:bg-orange-50'}`} onClick={() => setState(p => ({ ...p, current: f }))}>
                  <span className="truncate pr-2"><span className="text-[#FF4D00] font-bold">[SAVED]</span> {f.text}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(f); }} className="opacity-0 group-hover:opacity-100 text-red-500 px-2 font-bold transition-all">×</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className={`w-full border-t-[4px] p-4 font-mono text-[10px] font-bold uppercase flex justify-between items-center ${isDarkMode ? 'bg-zinc-900 text-white border-white' : 'bg-[#FF4D00] text-black border-black'}`}>
        <span>© VOID_AESTHETICS // ARCHIVE_2025</span>
        <div className="flex gap-4">
          {state.error && <span className="animate-pulse text-red-500">ERR: {state.error}</span>}
          <span>ENCRYPT: {isDarkMode ? 'QUANTUM' : 'ACTIVE'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;