import React, { useState, useEffect } from 'react';
import { WordItem, UserProgress } from '../../types';
import { speakWord } from '../../utils/speech';
import confetti from 'canvas-confetti';
import { ShieldAlert, Sword, Volume2, Timer, Zap, Check, Heart, Trophy, ArrowRight } from 'lucide-react';

interface Phase4BossBattleProps {
  wordBank: WordItem[];
  progress: UserProgress;
  onBossVictory: (scoreEarned: number) => void;
  onNextPhase: () => void;
  soundEnabled: boolean;
}

export const Phase4BossBattle: React.FC<Phase4BossBattleProps> = ({
  wordBank,
  progress,
  onBossVictory,
  onNextPhase,
  soundEnabled,
}) => {
  // Filter medium & hard words for boss battle
  const bossWords = wordBank.filter((w) => w.difficulty !== 'fácil').concat(wordBank.slice(0, 5));
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60); // 60s battle
  const [gameActive, setGameActive] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);
  const [totalBossScore, setTotalBossScore] = useState(0);

  const currentWordItem = bossWords[currentIdx % bossWords.length];

  // Timer Countdown
  useEffect(() => {
    if (!gameActive || timeLeft <= 0 || isVictory) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft, isVictory]);

  const handleStartBoss = () => {
    setGameActive(true);
    setIsVictory(false);
    setBossHp(100);
    setTimeLeft(60);
    setTotalBossScore(0);
    setCurrentIdx(0);
    setUserAnswer('');
    if (soundEnabled && currentWordItem) {
      speakWord(currentWordItem.word);
    }
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentWordItem) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentWordItem.word.toLowerCase();

    if (isCorrect) {
      const damage = 20;
      const newHp = Math.max(0, bossHp - damage);
      setBossHp(newHp);
      setTotalBossScore((prev) => prev + 50); // 2X XP (50 XP per boss word)
      setFeedback('hit');

      if (soundEnabled) speakWord('Direct hit! ' + currentWordItem.word);

      if (newHp === 0) {
        setIsVictory(true);
        setGameActive(false);
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {}
        onBossVictory(totalBossScore + 50);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setUserAnswer('');
          const nextIdx = currentIdx + 1;
          setCurrentIdx(nextIdx);
          if (soundEnabled && bossWords[nextIdx % bossWords.length]) {
            speakWord(bossWords[nextIdx % bossWords.length].word);
          }
        }, 1000);
      }

    } else {
      setFeedback('miss');
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white p-6 rounded-3xl card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-sky-400/30">
        <div>
          <span className="bg-white/20 text-sky-50 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30 shadow-xs">
            Fase 4 de 5 • Desafío Final (20 Min)
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-1 flex items-center gap-2 tracking-tight">
            Boss Battle: El Dragón del Deletreo 🐉
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium">
            ¡Ronda cronometrada! Vence al jefe respondiendo las palabras con multiplicador x2 de XP.
          </p>
        </div>

        <div className="bg-sky-950/60 border border-sky-400/40 p-3 rounded-2xl flex items-center gap-3 shrink-0 shadow-inner">
          <Timer className="w-6 h-6 text-amber-300 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-sky-200 uppercase block">Tiempo Restante</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* START SCREEN */}
      {!gameActive && !isVictory && (
        <div className="bg-white rounded-3xl card-shadow border border-sky-100 p-8 sm:p-12 text-center space-y-6">
          <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner border-4 border-sky-200">
            🐉
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-sky-950">
              ¿Estás listo para el reto supremo?
            </h3>
            <p className="text-sky-800 text-sm">
              Tienes <strong>60 segundos</strong> para bajar los <strong>100 HP</strong> del Dragón respondiendo palabras de nivel Medio y Difícil. Cada acierto otorga <strong>+50 XP</strong>.
            </p>
          </div>

          <button
            onClick={handleStartBoss}
            className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-lg rounded-2xl shadow-md hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            <Sword className="w-6 h-6" />
            <span>¡Iniciar Batalla Final!</span>
          </button>
        </div>
      )}

      {/* ACTIVE BATTLE BOARD */}
      {gameActive && currentWordItem && (
        <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border-2 border-rose-900 p-6 sm:p-10 space-y-6 relative overflow-hidden">
          
          {/* Boss Health Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Dragón Lexicón (Jefe Final)
              </span>
              <span className="font-mono text-amber-300">{bossHp} / 100 HP</span>
            </div>
            
            <div className="w-full bg-slate-950 rounded-full h-5 p-1 border border-rose-950 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-600 to-red-500 h-full rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${bossHp}%` }}
              ></div>
            </div>
          </div>

          {/* Current Word Challenge */}
          <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                Puntaje Multiplicado x2
              </span>
              <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                {currentWordItem.category}
              </span>
            </div>

            <button
              onClick={() => speakWord(currentWordItem.word)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md hover:scale-105 transition-all"
            >
              <Volume2 className="w-5 h-5" /> Escuchar Palabra 🔊
            </button>

            <p className="text-slate-300 text-sm font-semibold">
              💡 <strong>Traducción:</strong> {currentWordItem.translation}
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleCheckAnswer} className="space-y-4 max-w-md mx-auto">
            <input
              type="text"
              autoFocus
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe la palabra en inglés..."
              className={`w-full px-5 py-4 border-2 text-center rounded-2xl text-xl font-mono tracking-widest font-bold uppercase transition-all bg-slate-950 text-white ${
                feedback === 'hit'
                  ? 'border-emerald-500 bg-emerald-950 text-emerald-200'
                  : feedback === 'miss'
                  ? 'border-rose-500 bg-rose-950 text-rose-200 animate-shake'
                  : 'border-slate-700 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20'
              }`}
            />

            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:bg-slate-800 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Sword className="w-5 h-5" />
              <span>¡Lanzar Ataque de Deletreo!</span>
            </button>
          </form>

        </div>
      )}

      {/* VICTORY SCREEN */}
      {isVictory && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 text-center space-y-6">
          <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner text-5xl">
            🏆
          </div>

          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3.5 py-1 rounded-full uppercase">
              ¡Batalla Ganada!
            </span>
            <h3 className="text-3xl font-black text-slate-900">
              ¡Has Derrotado al Dragón del Deletreo! 🎉
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Ganaste <strong>+{totalBossScore} XP</strong> adicionales y desbloqueaste la insignia especial <strong className="text-indigo-600">Héroe del Desafío Final 🛡️</strong>.
            </p>
          </div>

          <button
            onClick={onNextPhase}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <span>Ver Resultados Finales y Certificado</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};
