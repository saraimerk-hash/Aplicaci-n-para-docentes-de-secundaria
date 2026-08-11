import React, { useState, useEffect } from 'react';
import { WordItem, MinigameMode, UserProgress } from '../../types';
import { speakWord, spellWordLetterByLetter } from '../../utils/speech';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Heart, HelpCircle, Check, RefreshCw, Trophy, ArrowRight, Zap, Flame } from 'lucide-react';

interface Phase3PracticeProps {
  wordBank: WordItem[];
  progress: UserProgress;
  onCorrectAnswer: (xpEarned: number) => void;
  onWrongAnswer: () => void;
  onNextPhase: () => void;
  soundEnabled: boolean;
}

export const Phase3Practice: React.FC<Phase3PracticeProps> = ({
  wordBank,
  progress,
  onCorrectAnswer,
  onWrongAnswer,
  onNextPhase,
  soundEnabled,
}) => {
  const [activeMode, setActiveMode] = useState<MinigameMode>('missing');
  const [wordIndex, setWordIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Mode 1: Missing Letters State
  const [missingBlanks, setMissingBlanks] = useState<string[]>([]);
  const [missingIndices, setMissingIndices] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});

  // Mode 2: Scramble State
  const [scrambledTiles, setScrambledTiles] = useState<{ id: string; char: string }[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<{ id: string; char: string }[]>([]);

  // Mode 3: Dictation State
  const [dictationInput, setDictationInput] = useState('');

  const currentWordItem = wordBank[wordIndex % wordBank.length];
  const targetWord = currentWordItem ? currentWordItem.word.toLowerCase() : 'school';

  // Initialize Minigame State whenever activeMode or wordIndex changes
  useEffect(() => {
    if (!currentWordItem) return;

    setShowHint(false);
    setFeedback(null);

    if (activeMode === 'missing') {
      const chars = targetWord.split('');
      // Determine 1 to 3 indices to hide depending on length
      const hideCount = Math.max(1, Math.floor(chars.length / 3));
      const indicesToHide: number[] = [];

      while (indicesToHide.length < hideCount) {
        const rand = Math.floor(Math.random() * chars.length);
        if (!indicesToHide.includes(rand)) {
          indicesToHide.push(rand);
        }
      }

      setMissingIndices(indicesToHide);
      setUserInputs({});
      setMissingBlanks(chars.map((c, i) => (indicesToHide.includes(i) ? '' : c)));

    } else if (activeMode === 'scramble') {
      const chars = targetWord.split('').map((c, idx) => ({ id: `${c}_${idx}_${Math.random()}`, char: c }));
      // Shuffle chars
      const shuffled = [...chars].sort(() => Math.random() - 0.5);
      setScrambledTiles(shuffled);
      setSelectedTiles([]);

    } else if (activeMode === 'dictation') {
      setDictationInput('');
      if (soundEnabled) {
        speakWord(targetWord);
      }
    }
  }, [activeMode, wordIndex, targetWord]);

  const handleNextWord = () => {
    setWordIndex((prev) => prev + 1);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  // Check Mode 1: Missing Letters
  const handleCheckMissing = () => {
    let constructed = '';
    const chars = targetWord.split('');

    for (let i = 0; i < chars.length; i++) {
      if (missingIndices.includes(i)) {
        constructed += (userInputs[i] || '').toLowerCase();
      } else {
        constructed += chars[i];
      }
    }

    if (constructed === targetWord) {
      setFeedback('correct');
      if (soundEnabled) speakWord('Great! ' + targetWord);
      triggerConfetti();
      onCorrectAnswer(25);
      setTimeout(handleNextWord, 1400);
    } else {
      setFeedback('wrong');
      onWrongAnswer();
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  // Check Mode 2: Scramble
  const handleTileClick = (tile: { id: string; char: string }) => {
    setScrambledTiles((prev) => prev.filter((t) => t.id !== tile.id));
    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    // Auto check when all tiles placed
    if (newSelected.length === targetWord.length) {
      const formedWord = newSelected.map((t) => t.char).join('');
      if (formedWord === targetWord) {
        setFeedback('correct');
        if (soundEnabled) speakWord('Awesome! ' + targetWord);
        triggerConfetti();
        onCorrectAnswer(30);
        setTimeout(handleNextWord, 1400);
      } else {
        setFeedback('wrong');
        onWrongAnswer();
        setTimeout(() => setFeedback(null), 1200);
      }
    }
  };

  const handleUnselectTile = (tile: { id: string; char: string }) => {
    setSelectedTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setScrambledTiles((prev) => [...prev, tile]);
  };

  // Check Mode 3: Dictation
  const handleCheckDictation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictationInput.trim()) return;

    if (dictationInput.trim().toLowerCase() === targetWord) {
      setFeedback('correct');
      if (soundEnabled) speakWord('Spot on! ' + targetWord);
      triggerConfetti();
      onCorrectAnswer(35);
      setTimeout(handleNextWord, 1400);
    } else {
      setFeedback('wrong');
      onWrongAnswer();
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white p-6 rounded-3xl card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-sky-50 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30 shadow-xs">
            Fase 3 de 5 • Práctica Gamificada (50 Min)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Mini-Juegos de Deletreo 🎮
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium">
            Selecciona tu modo de juego preferido y gana XP con cada acierto.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/20 shrink-0 shadow-inner">
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-sky-100 block">Puntos</span>
            <span className="font-black text-amber-300 text-lg">+{progress.xp} XP</span>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="text-center px-2">
            <span className="text-[10px] font-bold text-sky-100 block">Racha</span>
            <span className="font-black text-orange-300 text-lg flex items-center justify-center gap-0.5">
              <Flame className="w-4 h-4 fill-orange-300" /> {progress.streak}
            </span>
          </div>
        </div>
      </div>

      {/* Minigame Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-200">
        <button
          onClick={() => setActiveMode('missing')}
          className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'missing'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-sky-800 hover:bg-sky-200/60'
          }`}
        >
          <span className="text-base">🧩</span>
          <span>1. Completa Letras</span>
        </button>

        <button
          onClick={() => setActiveMode('scramble')}
          className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'scramble'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-sky-800 hover:bg-sky-200/60'
          }`}
        >
          <span className="text-base">🔀</span>
          <span>2. Ordena la Palabra</span>
        </button>

        <button
          onClick={() => setActiveMode('dictation')}
          className={`py-3 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'dictation'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-sky-800 hover:bg-sky-200/60'
          }`}
        >
          <span className="text-base">🎧</span>
          <span>3. Dictado Auditivo</span>
        </button>
      </div>

      {/* MAIN GAME BOARD */}
      {currentWordItem && (
        <div className="bg-white rounded-3xl card-shadow border border-sky-100 p-6 sm:p-10 space-y-6 relative overflow-hidden">
          
          {/* Card Top Info */}
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-sky-50 text-sky-800 font-extrabold px-3 py-1 rounded-lg text-xs border border-sky-200">
                Palabra {wordIndex + 1} de {wordBank.length}
              </span>
              <span className="bg-amber-100 text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                {currentWordItem.category}
              </span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showHint ? 'Ocultar Pista' : '💡 Ver Pista'}</span>
            </button>
          </div>

          {/* Hint Area */}
          {showHint && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-amber-950">💡 Significado en Español:</p>
              <p className="text-amber-900 text-sm font-semibold">{currentWordItem.translation}</p>
              <p className="text-amber-800 italic mt-1">Pista: {currentWordItem.hint}</p>
            </div>
          )}

          {/* MODE 1: MISSING LETTERS */}
          {activeMode === 'missing' && (
            <div className="space-y-6 text-center py-4">
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Completa las letras que faltan en la palabra:
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {targetWord.split('').map((char, idx) => {
                  const isHidden = missingIndices.includes(idx);

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      {isHidden ? (
                        <input
                          type="text"
                          maxLength={1}
                          value={userInputs[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserInputs({ ...userInputs, [idx]: val });
                          }}
                          className="w-12 h-14 border-b-4 border-sky-600 bg-sky-50/80 text-center font-mono font-black text-2xl uppercase text-sky-950 focus:bg-white focus:border-amber-500 outline-none rounded-t-xl transition-all"
                        />
                      ) : (
                        <div className="w-12 h-14 bg-sky-100/60 border-b-4 border-sky-300 font-mono font-black text-2xl uppercase text-sky-900 flex items-center justify-center rounded-t-xl">
                          {char}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => speakWord(targetWord)}
                  className="px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Pronunciar
                </button>
                <button
                  onClick={handleCheckMissing}
                  className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-extrabold text-sm shadow-md cursor-pointer"
                >
                  Comprobar Respuesta
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: SCRAMBLE DRAG & DROP / TILE CLICK */}
          {activeMode === 'scramble' && (
            <div className="space-y-6 text-center py-4">
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Toca las fichas de letras en el orden correcto para formar la palabra:
              </p>

              {/* Target Slots / Selected Tiles */}
              <div className="min-h-[70px] bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-2xl p-3 flex flex-wrap justify-center items-center gap-2">
                {selectedTiles.length === 0 ? (
                  <span className="text-xs text-sky-500 font-medium">Toca las letras de abajo para armar la palabra</span>
                ) : (
                  selectedTiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleUnselectTile(tile)}
                      className="w-12 h-12 bg-sky-600 text-white font-mono font-black text-xl rounded-xl shadow-xs hover:bg-rose-600 transition-all uppercase flex items-center justify-center cursor-pointer"
                      title="Quitar esta letra"
                    >
                      {tile.char}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Pool Tiles */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {scrambledTiles.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    className="w-12 h-12 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xl rounded-xl shadow-xs hover:scale-105 transition-all uppercase flex items-center justify-center border-b-4 border-amber-600 cursor-pointer"
                  >
                    {tile.char}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const chars = targetWord.split('').map((c, idx) => ({ id: `${c}_${idx}_${Math.random()}`, char: c }));
                    setScrambledTiles(chars.sort(() => Math.random() - 0.5));
                    setSelectedTiles([]);
                  }}
                  className="px-4 py-2 bg-sky-100/80 text-sky-800 hover:bg-sky-200 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Mezclar Letras
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: AUDIO DICTATION */}
          {activeMode === 'dictation' && (
            <div className="space-y-6 text-center py-4">
              <div className="bg-sky-50/70 border border-sky-100 p-6 rounded-3xl space-y-4 max-w-md mx-auto">
                <button
                  onClick={() => speakWord(targetWord)}
                  className="px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-base rounded-2xl shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span>Escuchar Audio Dictado 🔊</span>
                </button>

                <button
                  onClick={() => spellWordLetterByLetter(targetWord)}
                  className="text-xs font-bold text-sky-700 hover:underline block mx-auto cursor-pointer"
                >
                  🎧 ¿Escuchar Deletreado Letra por Letra?
                </button>
              </div>

              <form onSubmit={handleCheckDictation} className="space-y-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => setDictationInput(e.target.value)}
                  placeholder="Escribe la palabra escuchada..."
                  className="w-full px-5 py-4 border-2 border-sky-200 focus:border-sky-500 text-center rounded-2xl text-xl font-mono font-bold uppercase tracking-widest outline-none bg-sky-50/50 focus:bg-white text-sky-950"
                />

                <button
                  type="submit"
                  disabled={!dictationInput.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:bg-slate-300 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer"
                >
                  Verificar Dictado
                </button>
              </form>
            </div>
          )}

          {/* Visual Feedback Overlays */}
          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/95 text-white flex flex-col items-center justify-center space-y-3 p-6 rounded-3xl z-20 animate-pulse-glow">
              <Check className="w-16 h-16 stroke-[3]" />
              <h3 className="text-3xl font-black">¡Respuesta Correcta! 🎉</h3>
              <p className="text-xl font-mono font-extrabold tracking-widest uppercase">
                {targetWord}
              </p>
              <span className="bg-white text-emerald-900 font-extrabold px-4 py-1.5 rounded-full text-sm">
                +25 XP Obtenidos
              </span>
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-rose-500/95 text-white flex flex-col items-center justify-center space-y-3 p-6 rounded-3xl z-20 animate-shake">
              <span className="text-4xl">💔</span>
              <h3 className="text-2xl font-black">¡Inténtalo de Nuevo!</h3>
              <p className="text-sm">Revisa la pista y escucha con atención.</p>
            </div>
          )}

        </div>
      )}

      {/* Next Phase Prompt Banner */}
      <div className="bg-sky-900 text-white p-6 rounded-3xl shadow-md border border-sky-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-black flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" /> ¿Listo para el Desafío Final?
          </h4>
          <p className="text-xs text-sky-200">
            Pasa a la <strong>Fase 4: Boss Battle</strong> para enfrentarte a la prueba con tiempo y multiplicadores de puntaje.
          </p>
        </div>
        <button
          onClick={onNextPhase}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
        >
          <span>Ir a Fase 4: Boss Battle 🐉</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
