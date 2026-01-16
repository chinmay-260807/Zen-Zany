import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Advice, AdviceMood, AdviceState } from './types';
import { FALLBACK_ADVICE } from './constants';
import { generateAdvice } from './services/geminiService';
import AdviceCard from './components/AdviceCard';

const App: React.FC = () => {
  const [state, setState] = useState<AdviceState>(() => {
    const initial = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)];
    return {
      current: initial,
      history: [],
      loading: false,
      error: null,
    };
  });
  
  const [favorites, setFavorites] = useState<Advice[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [purgeArmed, setPurgeArmed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeConfirmation, setThemeConfirmation] = useState(false);
  
  const purgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedFavs = localStorage.getItem('zen_zany_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) { console.error("Failed to parse favorites", e); }
    }

    const storedHistory = localStorage.getItem('zen_zany_history');
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setState(prev => ({ ...prev, history }));
      } catch (e) { console.error("Failed to parse history", e); }
    }

    const storedTheme = localStorage.getItem('zen_zany_theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.style.backgroundColor = '#121212';
    } else {
      document.body.style.backgroundColor = '#f0f0f0';
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_zany_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('zen_zany_history', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    localStorage.setItem('zen_zany_theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f0f0f0';
  }, [isDarkMode]);

  const toggleFavorite = useCallback((advice: Advice) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === advice.id);
      if (exists) {
        return prev.filter(f => f.id !== advice.id);
      }
      return [advice, ...prev];
    });
  }, []);

  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  const handlePurgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!purgeArmed) {
      setPurgeArmed(true);
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
      purgeTimerRef.current = setTimeout(() => {
        setPurgeArmed(false);
      }, 3000);
    } else {
      setFavorites([]);
      setPurgeArmed(false);
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    setThemeConfirmation(true);
    setTimeout(() => setThemeConfirmation(false), 1000);
  };

  const getNewAdvice = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    try {
      const newAdvice = await generateAdvice();
      setState(prev => ({
        ...prev,
        current: newAdvice,
        history: [newAdvice, ...prev.history].slice(0, 10),
        loading: false,
      }));
    } catch (err) {
      const fallback = FALLBACK_ADVICE[Math.floor(Math.random() * FALLBACK_ADVICE.length)];
      setState(prev => ({
        ...prev,
        current: fallback,
        loading: false,
        error: "COMM_ERROR // DATA_RECOVERY_ENGAGED"
      }));
    }
  }, []);

  const isCurrentFavorite = state.current ? favorites.some(f => f.id === state.current?.id) : false;

  const themeClasses = isDarkMode 
    ? 'bg-[#121212] text-white border-white' 
    : 'bg-[#f0f0f0] text-black border-black';

  const subThemeClasses = isDarkMode
    ? 'bg-[#1a1a1a] border-white'
    : 'bg-white border-black';

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ease-in-out ${themeClasses} ${isFlashing ? 'invert duration-75' : ''}`}>
      <nav className={`w-full border-b-[4px] p-4 md:p-6 flex justify-between items-center sticky top-0 z-50 transition-colors duration-700 ${subThemeClasses}`}>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold transition-colors duration-700 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>Z</div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">Zen_X_Zany // v3.02</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={handleThemeToggle}
            className={`relative flex items-center gap-2 px-3 py-1 border-[2px] font-mono text-[10px] font-bold uppercase overflow-hidden transition-all duration-300 active:scale-95 ${themeConfirmation ? 'bg-green-500 border-green-600 text-white' : isDarkMode ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
          >
            {themeConfirmation ? (
              <span className="flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square"><polyline points="20 6 9 17 4 12"/></svg>
                SYNCED
              </span>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-yellow-400' : 'bg-indigo-600'}`} />
                {isDarkMode ? 'MODE_DRK' : 'MODE_LIT'}
              </>
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row relative">
        <div className={`flex-[3] p-6 md:p-12 lg:p-20 flex flex-col justify-center border-b-[4px] md:border-b-0 md:border-r-[4px] transition-colors duration-700 ${isDarkMode ? 'border-white' : 'border-black'}`}>
          <AdviceCard 
            advice={state.current} 
            loading={state.loading} 
            onClick={getNewAdvice} 
            isFavorite={isCurrentFavorite}
            isDarkMode={isDarkMode}
            onToggleFavorite={() => state.current && toggleFavorite(state.current)}
          />
          <div className="mt-12 flex flex-wrap gap-4">
            <button
              onClick={getNewAdvice}
              disabled={state.loading}
              className={`group px-8 py-4 font-bold uppercase tracking-widest active-press transition-all flex items-center gap-4 disabled:opacity-50 ${isDarkMode ? 'bg-white text-black slab-shadow-white' : 'bg-black text-white slab-shadow'}`}
            >
              {state.loading ? 'LOADING...' : 'GENERATE_WISDOM'}
              <span className={`w-4 h-4 block rounded-full group-hover:scale-125 transition-transform ${isDarkMode ? 'bg-black' : 'bg-white'}`} />
            </button>
            <div className={`border-[4px] px-6 py-4 font-mono text-[12px] flex items-center transition-colors duration-700 ${subThemeClasses}`}>
              STATUS: {state.loading ? 'RECALIBRATING' : 'READY_FOR_INPUT'}
            </div>
          </div>
        </div>

        <aside className={`flex-1 p-8 md:p-12 flex flex-col gap-10 overflow-y-auto max-h-[calc(100vh-140px)] transition-colors duration-700 ${subThemeClasses}`}>
          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recent_Output_Log</h3>
              {state.history.length > 0 && (
                <button onClick={clearHistory} className={`font-mono text-[9px] font-bold border px-2 py-0.5 transition-colors ${isDarkMode ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}>WIPE_HISTORY</button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {state.history.length === 0 && <span className="font-mono text-[10px] text-gray-400 italic opacity-50">LOGS_WIPED_CLEAN</span>}
              {state.history.map((h, i) => (
                <div key={h.id || i} className={`font-mono text-[10px] border-l-2 pl-4 py-2 transition-all cursor-pointer ${isDarkMode ? 'border-white text-white hover:bg-white/10' : 'border-black text-black hover:bg-black/5'}`} onClick={() => setState(prev => ({ ...prev, current: h }))}>
                  <span className={isDarkMode ? 'text-[#FF4D00]' : 'text-gray-500'}>[ID_{h.id.slice(0,4)}]</span> {h.text.substring(0, 45)}...
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-mono text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Favorites_Database</h3>
              {favorites.length > 0 && (
                <button onClick={handlePurgeClick} className={`font-mono text-[9px] font-bold border px-2 py-0.5 transition-all duration-200 ${purgeArmed ? 'bg-red-600 text-white border-red-800' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                  {purgeArmed ? 'SURE? CLICK AGAIN' : 'PURGE'}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {favorites.length === 0 && <span className="font-mono text-[10px] text-gray-400 italic opacity-50">NO_DATA_PERSISTED</span>}
              {favorites.map((f, i) => (
                <div key={f.id || i} className={`font-mono text-[10px] border-l-2 pl-4 py-2 transition-all group flex justify-between items-center cursor-pointer ${isDarkMode ? 'border-[#FF4D00] text-white hover:bg-[#FF4D00]/10' : 'border-[#FF4D00] text-black hover:bg-orange-50'}`} onClick={() => setState(prev => ({ ...prev, current: f }))}>
                  <span className="truncate pr-2"><span className="text-[#FF4D00]">[SAVED]</span> {f.text}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(f); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-125 transition-all px-2 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className={`w-full border-t-[4px] p-4 font-mono text-[10px] font-bold uppercase flex justify-between items-center transition-colors duration-700 ${isDarkMode ? 'bg-zinc-900 text-white border-white' : 'bg-[#FF4D00] text-black border-black'}`}>
        <span>© VOID_AESTHETICS // ARCHIVE_2025</span>
        <div className="flex gap-4">
          {state.error && <span className="animate-pulse text-red-500">ERROR: {state.error}</span>}
          <span>ENCRYPTION: {isDarkMode ? 'QUANTUM' : 'ACTIVE'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;