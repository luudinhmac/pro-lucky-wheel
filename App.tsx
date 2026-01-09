
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import Leaderboard from './components/Leaderboard';
import { AutoConfig, EntryCount, DEFAULT_ENTRIES, DEFAULT_RESULT_TEMPLATE, DEFAULT_AUTO_RESULT_TEMPLATE } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_ENTRIES);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, EntryCount>>({});
  const [autoConfig, setAutoConfig] = useState<AutoConfig>({
    mode: 'none',
    turns: 10,
    targetCount: 3,
    resultTemplate: DEFAULT_RESULT_TEMPLATE,
    autoResultTemplate: DEFAULT_AUTO_RESULT_TEMPLATE,
    removeOnWin: false
  });
  const [showResult, setShowResult] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const internalCountsRef = useRef<Record<string, number>>({});
  const autoSpinState = useRef({
    remainingTurns: 0,
    active: false,
    results: [] as string[]
  });

  const entries = inputText.split('\n').map(s => s.trim()).filter(s => s !== '');

  const startSpin = useCallback(() => {
    if (isSpinning || entries.length === 0) return;
    
    setIsSpinning(true);
    setWinningIndex(null); // Reset highlight when starting new spin
    
    const spinDuration = 12000 + Math.random() * 3000; 
    const extraRotations = 15 + Math.random() * 10;
    const finalAngle = extraRotations * 360 + Math.random() * 360;
    
    const startTime = performance.now();
    const startRotation = rotation;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + finalAngle * ease;
      
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const actualRotation = currentRotation % 360;
        const sliceSize = 360 / entries.length;
        const normalizedAngle = (360 - (actualRotation % 360)) % 360;
        const winnerIndex = Math.floor(normalizedAngle / sliceSize);
        const winner = entries[winnerIndex];

        setWinningIndex(winnerIndex);
        handleSpinResult(winner);
      }
    };

    requestAnimationFrame(animate);
  }, [entries, isSpinning, rotation]);

  const handleSpinResult = (winner: string) => {
    const newCount = (internalCountsRef.current[winner] || 0) + 1;
    internalCountsRef.current[winner] = newCount;

    setCounts(prev => {
      const current = prev[winner] || { name: winner, count: 0 };
      return {
        ...prev,
        [winner]: {
          ...current,
          count: newCount,
          lastWonAt: Date.now(),
          isRemoved: autoConfig.removeOnWin
        }
      };
    });

    if (autoConfig.removeOnWin) {
      // Delay removal slightly so the neon effect can be seen before the slice vanishes
      setTimeout(() => {
        setInputText(prev => prev.split('\n')
          .filter(line => line.trim() !== winner)
          .join('\n')
        );
        setWinningIndex(null);
      }, 2000);
    }

    if (autoSpinState.current.active) {
      autoSpinState.current.results.push(winner);
      
      let shouldContinue = false;
      if (autoConfig.mode === 'turns') {
        autoSpinState.current.remainingTurns--;
        shouldContinue = autoSpinState.current.remainingTurns > 0;
      } else if (autoConfig.mode === 'target') {
        const targetMet = Object.values(internalCountsRef.current).some(c => c >= autoConfig.targetCount);
        shouldContinue = !targetMet;
      }

      if (autoConfig.removeOnWin && entries.length <= 1) {
          shouldContinue = false;
      }

      if (shouldContinue) {
        setTimeout(startSpin, 3000); // Increased delay for auto-spin to show neon effect
      } else {
        autoSpinState.current.active = false;
        finalizeAutoResults();
      }
    } else {
      audioService.playWin();
      const finalMsg = autoConfig.resultTemplate
        .replace('[winner]', `"${winner}"`);
      setShowResult({ open: true, message: finalMsg });
    }
  };

  const finalizeAutoResults = () => {
    const results = autoSpinState.current.results;
    if (results.length === 0) return;

    const freq: Record<string, number> = {};
    results.forEach(res => freq[res] = (freq[res] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const topResult = sorted[0];

    audioService.playWin();
    const finalMsg = autoConfig.autoResultTemplate
      .replace('[winner]', `"${topResult[0]}"`)
      .replace('[count]', topResult[1].toString());

    setShowResult({ open: true, message: finalMsg });
  };

  const handleManualSpinStart = () => {
    if (entries.length === 0) return;
    
    if (autoConfig.mode !== 'none') {
      autoSpinState.current = {
        active: true,
        remainingTurns: autoConfig.mode === 'turns' ? autoConfig.turns : 9999,
        results: []
      };
    } else {
      autoSpinState.current.active = false;
    }
    startSpin();
  };

  const resetLeaderboard = () => {
    setCounts({});
    internalCountsRef.current = {};
    setWinningIndex(null);
  };
  
  const resetText = () => {
    setInputText(DEFAULT_ENTRIES);
    setWinningIndex(null);
  };
  
  const resetAll = () => {
    setInputText(DEFAULT_ENTRIES);
    setCounts({});
    internalCountsRef.current = {};
    setWinningIndex(null);
    setAutoConfig({ 
      mode: 'none', 
      turns: 10, 
      targetCount: 3, 
      resultTemplate: DEFAULT_RESULT_TEMPLATE,
      autoResultTemplate: DEFAULT_AUTO_RESULT_TEMPLATE,
      removeOnWin: false
    });
    setRotation(0);
  };

  return (
    <div className="min-h-screen py-6 md:py-10 px-4 md:px-8 max-w-6xl mx-auto bg-slate-50 text-slate-900">
      <header className="text-center mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tighter uppercase">
          Pro Lucky Wheel
        </h1>
        <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        <div className="lg:col-span-7 flex flex-col items-center">
          <Wheel 
            entries={entries} 
            isSpinning={isSpinning} 
            rotation={rotation}
            winningIndex={winningIndex}
            onSpinStart={handleManualSpinStart}
            onSpinEnd={() => {}}
          />
          
          <div className="mt-8 md:mt-12 text-center min-h-[64px]">
            {isSpinning && autoSpinState.current.active && (
              <div className="inline-flex items-center gap-3 bg-white border border-indigo-200 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl text-indigo-600 animate-pulse">
                <span className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></span>
                {autoConfig.mode === 'turns' 
                  ? `${autoSpinState.current.remainingTurns} lượt còn lại...` 
                  : `Đang quay mục tiêu ${autoConfig.targetCount}...`}
              </div>
            )}
            {!isSpinning && entries.length > 0 && (
              <p className="text-slate-400 font-medium italic">Nhấn nút "QUAY" ở giữa vòng quay!</p>
            )}
            {!isSpinning && entries.length === 0 && (
              <p className="text-red-400 font-medium">Danh sách trống! Vui lòng thêm thành phần.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <Leaderboard data={Object.values(counts)} />
          
          <Controls 
            inputText={inputText}
            setInputText={setInputText}
            autoConfig={autoConfig}
            setAutoConfig={setAutoConfig}
            onResetLeaderboard={resetLeaderboard}
            onResetText={resetText}
            onResetAll={resetAll}
            isSpinning={isSpinning}
          />
        </div>
      </div>

      {showResult.open && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full shadow-2xl text-center transform scale-in-center border border-slate-100">
            <div className="text-6xl md:text-7xl mb-6 select-none drop-shadow-lg animate-bounce">✨</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 whitespace-pre-line leading-tight tracking-tight">
              {showResult.message}
            </h2>
            <button 
              onClick={() => setShowResult({ open: false, message: '' })}
              className="w-full py-4 md:py-5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black rounded-3xl hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 text-lg uppercase tracking-wider"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scale-in-center {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-in-center {
          animation: scale-in-center 0.4s cubic-bezier(0.175, 0.885, 0.320, 1.275) both;
        }
      `}</style>
    </div>
  );
};

export default App;
