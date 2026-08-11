import React, { useState } from 'react';
import { WordItem, WordCategory, UserProgress } from '../../types';
import { speakWord, spellWordLetterByLetter, spellLetter } from '../../utils/speech';
import { Volume2, CheckCircle2, Search, Filter, BookOpen, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface Phase2LearningProps {
  wordBank: WordItem[];
  progress: UserProgress;
  onToggleMastered: (wordId: string) => void;
  onNextPhase: () => void;
  soundEnabled: boolean;
}

const CATEGORIES: { id: 'todas' | WordCategory; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todas', icon: '✨' },
  { id: 'colores', label: 'Colores', icon: '🎨' },
  { id: 'animales', label: 'Animales', icon: '🐶' },
  { id: 'familia', label: 'Familia', icon: '👨‍👩‍👧' },
  { id: 'colegio', label: 'Colegio', icon: '🏫' },
  { id: 'números', label: 'Números', icon: '🔢' },
  { id: 'cotidiano', label: 'Cotidiano', icon: '🌟' },
];

export const Phase2Learning: React.FC<Phase2LearningProps> = ({
  wordBank,
  progress,
  onToggleMastered,
  onNextPhase,
  soundEnabled,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'todas' | WordCategory>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSlowAudio, setIsSlowAudio] = useState(false);
  const [activeLetterSpellingId, setActiveLetterSpellingId] = useState<string | null>(null);

  const filteredWords = wordBank.filter((w) => {
    const matchesCat = selectedCategory === 'todas' || w.category === selectedCategory;
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const masteredCount = progress.learningMasteredIds.length;
  const progressPercent = Math.min(100, Math.round((masteredCount / Math.max(1, wordBank.length)) * 100));

  const handleSpeak = (word: string) => {
    if (soundEnabled) {
      speakWord(word, isSlowAudio ? 0.6 : 0.9);
    }
  };

  const handleSpellLetters = async (wordId: string, word: string) => {
    if (!soundEnabled) return;
    setActiveLetterSpellingId(wordId);
    await spellWordLetterByLetter(word, 500);
    setActiveLetterSpellingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 rounded-3xl p-6 sm:p-8 text-white card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-white/20 text-sky-50 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30 shadow-xs">
            Fase 2 de 5 • Aprendizaje Guiado (30 Min)
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Banco de Vocabulario y Deletreo 📚
          </h2>
          <p className="text-sky-100 text-sm max-w-xl font-medium">
            Toca las tarjetas para escuchar la pronunciación y el deletreo letra por letra. Marca las palabras que domines.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[200px] text-center shadow-inner">
          <span className="text-xs font-bold text-sky-100 uppercase tracking-wider">Palabras Aprendidas</span>
          <div className="text-3xl font-black text-amber-300 my-1">
            {masteredCount} / {wordBank.length}
          </div>
          <div className="w-full bg-sky-950/40 rounded-full h-2.5 overflow-hidden border border-sky-400/30">
            <div
              className="bg-amber-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-sky-200 font-bold mt-1">{progressPercent}% Dominado</span>
        </div>
      </div>

      {/* Controls: Search, Categories, Audio Speed */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 card-shadow space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar palabra en inglés o español..."
              className="w-full pl-10 pr-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-xl text-xs font-medium text-sky-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
            />
          </div>

          {/* Audio Speed Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-800">Velocidad Audio:</span>
            <button
              onClick={() => setIsSlowAudio(!isSlowAudio)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSlowAudio
                  ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                  : 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
              }`}
            >
              <span>{isSlowAudio ? '🐢 Despacio (Lento)' : '⚡ Normal'}</span>
            </button>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-xs'
                  : 'bg-sky-50/60 text-sky-800 border-sky-100 hover:bg-sky-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Word Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => {
          const isMastered = progress.learningMasteredIds.includes(item.id);
          const isSpellingThis = activeLetterSpellingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden bg-white ${
                isMastered
                  ? 'border-emerald-300 ring-2 ring-emerald-200/60 shadow-sm'
                  : 'border-sky-100 hover:border-sky-300 card-shadow hover:-translate-y-0.5'
              }`}
            >
              {/* Category Badge & Difficulty */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md">
                  {item.category}
                </span>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    item.difficulty === 'fácil'
                      ? 'bg-emerald-100 text-emerald-900'
                      : item.difficulty === 'medio'
                      ? 'bg-amber-100 text-amber-950'
                      : 'bg-rose-100 text-rose-950'
                  }`}
                >
                  {item.difficulty}
                </span>
              </div>

              {/* Main Word & Audio */}
              <div className="space-y-2 text-center py-2">
                <h3 className="text-3xl font-black text-sky-950 tracking-tight">
                  {item.word}
                </h3>
                <p className="text-base font-bold text-sky-600">
                  {item.translation}
                </p>

                {/* Letter by Letter interactive buttons */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block mb-1">
                    Toca cada letra para oír su nombre:
                  </span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {item.word.split('').map((char, idx) => (
                      <button
                        key={idx}
                        onClick={() => spellLetter(char)}
                        className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-500 hover:text-white font-mono font-black text-sm text-sky-900 border border-sky-200 transition-all cursor-pointer"
                        title={`Oír letra ${char.toUpperCase()}`}
                      >
                        {char.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pronunciation & Spelling Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSpeak(item.word)}
                  className="py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Pronunciar</span>
                </button>

                <button
                  onClick={() => handleSpellLetters(item.id, item.word)}
                  disabled={isSpellingThis}
                  className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-100 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSpellingThis ? 'animate-spin' : ''}`} />
                  <span>{isSpellingThis ? 'Deletreando...' : 'Deletrear'}</span>
                </button>
              </div>

              {/* Example sentence & Hint */}
              <div className="bg-sky-50/60 border border-sky-100 p-3 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-sky-900">💬 "{item.exampleEn}"</p>
                <p className="text-sky-700 italic">({item.exampleEs})</p>
              </div>

              {/* Mastered Checkbox */}
              <button
                onClick={() => onToggleMastered(item.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isMastered
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-50/60'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-white' : 'text-sky-400'}`} />
                <span>{isMastered ? '¡Palabra Aprendida!' : 'Marcar como Aprendida'}</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* Footer Navigation Action */}
      <div className="bg-sky-900 text-white p-6 rounded-3xl shadow-md border border-sky-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-black text-white">¿Listo para ponerte a prueba?</h4>
          <p className="text-xs text-sky-200">
            Has repasado el vocabulario. Pasa a la <strong>Fase 3: Práctica Gamificada</strong> con los 3 mini-juegos.
          </p>
        </div>
        <button
          onClick={onNextPhase}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
        >
          <span>Ir a Fase 3: Práctica Gamificada</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
