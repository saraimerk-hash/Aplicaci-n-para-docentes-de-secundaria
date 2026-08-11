import React, { useState } from 'react';
import { WordItem, UserProgress } from '../../types';
import { speakWord } from '../../utils/speech';
import { Sparkles, Play, CheckCircle2, Volume2, ArrowRight, HelpCircle, Trophy } from 'lucide-react';

interface Phase1DiagnosticProps {
  progress: UserProgress;
  onUpdateName: (name: string) => void;
  onCompleteDiagnostic: (calibratedScore: number) => void;
  wordBank: WordItem[];
  soundEnabled: boolean;
}

export const Phase1Diagnostic: React.FC<Phase1DiagnosticProps> = ({
  progress,
  onUpdateName,
  onCompleteDiagnostic,
  wordBank,
  soundEnabled,
}) => {
  const [inputName, setInputName] = useState(progress.studentName || '');
  const [step, setStep] = useState<'welcome' | 'test' | 'done'>(
    progress.diagnosticCompleted ? 'done' : 'welcome'
  );

  // Pick 5 diagnostic words
  const diagnosticWords = wordBank.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentWord = diagnosticWords[currentIndex];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      alert('Por favor escribe tu nombre para comenzar la aventura.');
      return;
    }
    onUpdateName(inputName.trim());
    setStep('test');
    if (soundEnabled && currentWord) {
      speakWord(currentWord.word);
    }
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentWord) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
      if (soundEnabled) speakWord('Good job! ' + currentWord.word);
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      if (currentIndex + 1 < diagnosticWords.length) {
        setCurrentIndex((prev) => prev + 1);
        if (soundEnabled) {
          speakWord(diagnosticWords[currentIndex + 1].word);
        }
      } else {
        setStep('done');
        onCompleteDiagnostic(score + (isCorrect ? 1 : 0));
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* WELCOME STEP */}
      {step === 'welcome' && (
        <div className="bg-white rounded-3xl card-shadow border border-sky-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white p-6 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl"></div>
            
            <span className="inline-block bg-white/20 text-sky-50 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-widest border border-white/30 mb-3 shadow-xs">
              Fase 1 de 5 • Bienvenida (10 Min)
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
              ¡Bienvenido a Spelling Quest! 🔤
            </h2>
            <p className="text-sky-100 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Institución Educativa MOVA • Clase del Docente <strong className="text-amber-300 font-bold">José Jorge Muñoz</strong>
            </p>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl">
                <span className="text-2xl mb-1 block">⏱️</span>
                <h4 className="font-bold text-xs text-sky-950 uppercase">2 Horas de Clase</h4>
                <p className="text-xs text-sky-700 mt-1">Avanza a tu ritmo por los 5 niveles pedagógicos.</p>
              </div>
              <div className="bg-amber-50/80 border border-amber-100 p-4 rounded-2xl">
                <span className="text-2xl mb-1 block">🏆</span>
                <h4 className="font-bold text-xs text-amber-950 uppercase">Gana Puntos XP</h4>
                <p className="text-xs text-amber-800 mt-1">Acumula puntos e insignias con cada acierto.</p>
              </div>
              <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl">
                <span className="text-2xl mb-1 block">📜</span>
                <h4 className="font-bold text-xs text-emerald-950 uppercase">Certificado Final</h4>
                <p className="text-xs text-emerald-800 mt-1">Obtén tu diploma impreso al completar la sesión.</p>
              </div>
            </div>

            {/* Name Input Form */}
            <form onSubmit={handleStart} className="max-w-md mx-auto space-y-4">
              <div className="space-y-1 text-left">
                <label className="block text-sm font-bold text-sky-950">
                  Escribe tu Nombre Completo:
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="ej. Santiago Rodríguez"
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-2xl text-base font-bold bg-sky-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all outline-none text-sky-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Comenzar Diagnóstico Inicial</span>
                <Play className="w-5 h-5 fill-white group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC TEST STEP */}
      {step === 'test' && currentWord && (
        <div className="bg-white rounded-3xl card-shadow border border-sky-100 p-6 sm:p-10 space-y-6">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Mini-Reto Diagnóstico ({currentIndex + 1} de {diagnosticWords.length})
              </span>
              <h3 className="text-xl font-black text-sky-950">
                Escribe la palabra que escuchas o ves la pista:
              </h3>
            </div>
            <div className="bg-sky-50 text-sky-700 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-sky-200">
              Puntaje: {score}
            </div>
          </div>

          <div className="bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <button
              onClick={() => speakWord(currentWord.word)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5" /> Escuchar Pronunciación 🔊
            </button>

            <div className="text-sky-800 text-sm font-semibold max-w-md mx-auto">
              💡 <strong>Pista en Español:</strong> {currentWord.translation} ({currentWord.hint})
            </div>
          </div>

          <form onSubmit={handleCheckAnswer} className="space-y-4 max-w-md mx-auto">
            <div>
              <input
                type="text"
                autoFocus
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escribe la palabra en inglés..."
                className={`w-full px-5 py-4 border-2 text-center rounded-2xl text-xl font-mono tracking-widest font-bold uppercase transition-all ${
                  feedback === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                    : feedback === 'incorrect'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 animate-shake'
                    : 'border-sky-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sky-900'
                }`}
              />
            </div>

            {feedback === 'correct' && (
              <p className="text-center font-bold text-emerald-600 text-sm animate-bounce">
                ¡Excelente! Correcto 🎉
              </p>
            )}
            {feedback === 'incorrect' && (
              <p className="text-center font-bold text-rose-600 text-sm">
                Casi... La palabra era: <strong className="underline">{currentWord.word}</strong>
              </p>
            )}

            {!feedback && (
              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Comprobar Respuesta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* COMPLETED STEP */}
      {step === 'done' && (
        <div className="bg-white rounded-3xl card-shadow border border-sky-100 p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
              ¡Diagnóstico Completado!
            </span>
            <h3 className="text-3xl font-black text-sky-950">
              ¡Buen trabajo, {progress.studentName}! 🎉
            </h3>
            <p className="text-sky-800 text-sm max-w-md mx-auto">
              Has respondido correctamente <strong>{score} de 5</strong> palabras de calibración. Has obtenido tu primera insignia: <strong className="text-sky-600">Explorador MOVA 🚀</strong>.
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl max-w-sm mx-auto text-left flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-sky-950 uppercase">Siguiente Paso</div>
              <div className="text-xs text-sky-700">
                Pasa a la <strong>Fase 2: Aprendizaje Guiado</strong> para explorar las fichas interactivas de vocabulario.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
