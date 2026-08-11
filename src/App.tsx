import React, { useState, useEffect } from 'react';
import { UserProgress, PhaseId, WordItem, Badge } from './types';
import { DEFAULT_WORD_BANK, ALL_BADGES } from './data/wordBank';
import { Header } from './components/Header';
import { PhaseProgress } from './components/PhaseProgress';
import { Phase1Diagnostic } from './components/phases/Phase1Diagnostic';
import { Phase2Learning } from './components/phases/Phase2Learning';
import { Phase3Practice } from './components/phases/Phase3Practice';
import { Phase4BossBattle } from './components/phases/Phase4BossBattle';
import { Phase5Results } from './components/phases/Phase5Results';
import { TeacherModal } from './components/TeacherModal';
import { CertificateModal } from './components/CertificateModal';
import { AICallAssistant } from './components/AICallAssistant';
import { PhoneCall } from 'lucide-react';

const LOCAL_STORAGE_KEY_PROGRESS = 'spelling_quest_mova_progress_v2';
const LOCAL_STORAGE_KEY_WORDS = 'spelling_quest_mova_words_v2';

const INITIAL_PROGRESS: UserProgress = {
  studentName: '',
  grade: '6° Bachillerato',
  xp: 0,
  streak: 0,
  maxStreak: 0,
  hearts: 3,
  maxHearts: 3,
  currentPhase: 1,
  diagnosticCompleted: false,
  learningMasteredIds: [],
  minigamesCompletedCount: 0,
  bossDefeated: false,
  bossScore: 0,
  mistakesCount: {},
  unlockedBadges: [],
  startTime: Date.now(),
  totalTimeSeconds: 0,
  fontSize: 'normal',
};

export default function App() {
  // Load saved progress from localStorage or default
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
      return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  // Load custom or default word bank
  const [wordBank, setWordBank] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_WORDS);
      return saved ? JSON.parse(saved) : DEFAULT_WORD_BANK;
    } catch {
      return DEFAULT_WORD_BANK;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(ALL_BADGES);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isAICallOpen, setIsAICallOpen] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Save word bank to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORDS, JSON.stringify(wordBank));
    } catch {}
  }, [wordBank]);

  // Unlock badges checking engine
  const checkBadgeUnlocks = (currentP: UserProgress) => {
    const newlyUnlocked: string[] = [...currentP.unlockedBadges];

    // 1. Welcome badge
    if (currentP.studentName && currentP.diagnosticCompleted && !newlyUnlocked.includes('badge_welcome')) {
      newlyUnlocked.push('badge_welcome');
    }
    // 2. Vocab badge
    if (currentP.learningMasteredIds.length >= 5 && !newlyUnlocked.includes('badge_vocab')) {
      newlyUnlocked.push('badge_vocab');
    }
    // 3. Streak 5 badge
    if (currentP.maxStreak >= 5 && !newlyUnlocked.includes('badge_streak_5')) {
      newlyUnlocked.push('badge_streak_5');
    }
    // 4. Boss Hero badge
    if (currentP.bossDefeated && !newlyUnlocked.includes('badge_boss_hero')) {
      newlyUnlocked.push('badge_boss_hero');
    }

    if (newlyUnlocked.length !== currentP.unlockedBadges.length) {
      setProgress((prev) => ({ ...prev, unlockedBadges: newlyUnlocked }));
    }
  };

  const handleUpdateFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setProgress((prev) => ({ ...prev, fontSize: size }));
  };

  const handleUpdateName = (name: string) => {
    setProgress((prev) => {
      const updated = { ...prev, studentName: name };
      checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const handleCompleteDiagnostic = (calibratedScore: number) => {
    setProgress((prev) => {
      const updated: UserProgress = {
        ...prev,
        diagnosticCompleted: true,
        xp: prev.xp + calibratedScore * 20 + 50, // Welcome bonus
        currentPhase: 2,
      };
      checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const handleToggleMastered = (wordId: string) => {
    setProgress((prev) => {
      const isMastered = prev.learningMasteredIds.includes(wordId);
      const newIds = isMastered
        ? prev.learningMasteredIds.filter((id) => id !== wordId)
        : [...prev.learningMasteredIds, wordId];

      const updated: UserProgress = {
        ...prev,
        learningMasteredIds: newIds,
        xp: isMastered ? prev.xp : prev.xp + 10,
      };
      checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const handleCorrectAnswer = (xpEarned: number) => {
    setProgress((prev) => {
      const newStreak = prev.streak + 1;
      const updated: UserProgress = {
        ...prev,
        xp: prev.xp + xpEarned,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
      checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const handleWrongAnswer = () => {
    setProgress((prev) => {
      const newHearts = Math.max(0, prev.hearts - 1);
      return {
        ...prev,
        streak: 0,
        hearts: newHearts === 0 ? 3 : newHearts, // Auto-refill hearts to 3 so student is never stuck
      };
    });
  };

  const handleBossVictory = (bossScoreEarned: number) => {
    setProgress((prev) => {
      const updated: UserProgress = {
        ...prev,
        bossDefeated: true,
        bossScore: bossScoreEarned,
        xp: prev.xp + bossScoreEarned + 100,
        currentPhase: 5,
      };
      checkBadgeUnlocks(updated);
      return updated;
    });
  };

  const handleResetProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROGRESS);
    setProgress(INITIAL_PROGRESS);
  };

  const fontScaleClass =
    progress.fontSize === 'large'
      ? 'text-scale-large'
      : progress.fontSize === 'xlarge'
      ? 'text-scale-xlarge'
      : 'text-scale-normal';

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans ${fontScaleClass}`}>
      
      {/* Header Bar */}
      <Header
        progress={progress}
        onUpdateFontSize={handleUpdateFontSize}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
        onOpenAICall={() => setIsAICallOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Itinerary Phase Bar */}
      <PhaseProgress
        currentPhase={progress.currentPhase}
        onSelectPhase={(phaseId) => setProgress((prev) => ({ ...prev, currentPhase: phaseId }))}
        diagnosticCompleted={progress.diagnosticCompleted}
        bossDefeated={progress.bossDefeated}
      />

      {/* Phase Body Content */}
      <main className="flex-1 py-6 px-2 sm:px-4">
        {progress.currentPhase === 1 && (
          <Phase1Diagnostic
            progress={progress}
            onUpdateName={handleUpdateName}
            onCompleteDiagnostic={handleCompleteDiagnostic}
            wordBank={wordBank}
            soundEnabled={soundEnabled}
          />
        )}

        {progress.currentPhase === 2 && (
          <Phase2Learning
            wordBank={wordBank}
            progress={progress}
            onToggleMastered={handleToggleMastered}
            onNextPhase={() => setProgress((prev) => ({ ...prev, currentPhase: 3 }))}
            soundEnabled={soundEnabled}
          />
        )}

        {progress.currentPhase === 3 && (
          <Phase3Practice
            wordBank={wordBank}
            progress={progress}
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            onNextPhase={() => setProgress((prev) => ({ ...prev, currentPhase: 4 }))}
            soundEnabled={soundEnabled}
          />
        )}

        {progress.currentPhase === 4 && (
          <Phase4BossBattle
            wordBank={wordBank}
            progress={progress}
            onBossVictory={handleBossVictory}
            onNextPhase={() => setProgress((prev) => ({ ...prev, currentPhase: 5 }))}
            soundEnabled={soundEnabled}
          />
        )}

        {progress.currentPhase === 5 && (
          <Phase5Results
            progress={progress}
            badges={badges}
            wordBank={wordBank}
            onOpenCertificate={() => setIsCertificateModalOpen(true)}
            onRestartClass={() => setProgress((prev) => ({ ...prev, currentPhase: 1 }))}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-4 text-center text-xs border-t border-slate-800 no-print">
        <p>
          I.E. MOVA (Medellín) • Sesión de Deletreo en Inglés (Spelling Quest) • Docente Responsable: <strong>José Jorge Muñoz</strong>
        </p>
      </footer>

      {/* Floating Action Call Widget Button */}
      <button
        onClick={() => setIsAICallOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer group animate-bounce"
        title="Hablar con el Profe Virtual IA"
      >
        <div className="relative">
          <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
        </div>
        <span className="text-xs tracking-tight shadow-xs">Llamada IA • Profe MOVA</span>
      </button>

      {/* Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        wordBank={wordBank}
        onUpdateWordBank={setWordBank}
        onResetProgress={handleResetProgress}
      />

      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        progress={progress}
        badges={badges}
      />

      <AICallAssistant
        isOpen={isAICallOpen}
        onClose={() => setIsAICallOpen(false)}
        progress={progress}
        currentWord={wordBank[0]}
      />

    </div>
  );
}
