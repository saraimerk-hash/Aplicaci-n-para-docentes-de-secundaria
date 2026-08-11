import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Minimize2,
  Maximize2,
  Zap,
  ShieldCheck,
  Radio,
  X,
  Activity
} from 'lucide-react';
import { UserProgress, WordItem } from '../types';

interface AICallAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  currentWord?: WordItem;
}

export const AICallAssistant: React.FC<AICallAssistantProps> = ({
  isOpen,
  onClose,
  progress,
  currentWord,
}) => {
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(true); // Continuous AI voice loop
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(12).fill(10));
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastAIReply, setLastAIReply] = useState<string>('');

  const conversationHistoryRef = useRef<{ role: string; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Web Audio API Microphone Real-time Amplitude Visualizer
  const startMicVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map frequencies to 12 visualizer bar heights
        const levels = Array.from({ length: 12 }, (_, i) => {
          const val = dataArray[i * 2] || 0;
          return Math.max(12, Math.min(100, Math.round((val / 255) * 100)));
        });

        setAudioLevel(levels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (err) {
      console.warn('Could not start real microphone visualizer:', err);
    }
  };

  const stopMicVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(Array(12).fill(10));
  };

  // Timer for active call
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Speak AI text response using browser SpeechSynthesis or Web Speech
  const speakResponse = (text: string) => {
    if (!speakerEnabled || !('speechSynthesis' in window)) {
      if (handsFreeMode && callActive && !isMuted) {
        setTimeout(() => startListening(), 500);
      }
      return;
    }

    window.speechSynthesis.cancel(); // stop current audio

    const cleanText = text.replace(/[*_#~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-AR'; // Argentine Spanish locale
    utterance.rate = 0.98;

    // Search browser voice list for Argentine voice or best Spanish voice
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const argentineVoice =
        voices.find(
          (v) =>
            v.lang === 'es-AR' ||
            v.lang.toLowerCase().replace('_', '-').includes('es-ar') ||
            v.name.toLowerCase().includes('argentina') ||
            v.name.toLowerCase().includes('diego') ||
            v.name.toLowerCase().includes('tomas') ||
            v.name.toLowerCase().includes('spanish (argentina)')
        ) || voices.find((v) => v.lang.startsWith('es'));

      if (argentineVoice) {
        utterance.voice = argentineVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (handsFreeMode && callActive && !isMuted) {
        setTimeout(() => startListening(), 400);
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (handsFreeMode && callActive && !isMuted) {
        setTimeout(() => startListening(), 400);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start call session
  const handleStartCall = () => {
    setCallActive(true);
    setIsMinimized(false);
    conversationHistoryRef.current = [];

    startMicVisualizer();

    const initialGreeting = `¡Hola, che! ¿Qué hacés, ${
      progress.studentName || 'estudiante de MOVA'
    }? Soy el Profe Virtual José Jorge Muñoz. Te escucho impecable en esta llamada en vivo. ¿Qué palabra querés deletrear o practicar hoy?`;

    setLastAIReply(initialGreeting);
    conversationHistoryRef.current.push({ role: 'model', text: initialGreeting });

    speakResponse(initialGreeting);
  };

  // End call session
  const handleEndCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopMicVisualizer();
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setCallActive(false);
  };

  // Send audio transcript message to Gemini backend API
  const processVoiceInput = async (userText: string) => {
    if (!userText.trim()) return;

    setLastTranscript(userText);
    conversationHistoryRef.current.push({ role: 'user', text: userText });
    setIsThinking(true);

    try {
      const response = await fetch('/api/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          studentName: progress.studentName,
          currentPhase: progress.currentPhase,
          wordContext: currentWord?.word,
          history: conversationHistoryRef.current,
          voiceName: 'Fenrir',
        }),
      });

      const data = await response.json();
      const reply = data.reply || '¡Muy bien! Sigue practicando tu deletreo en inglés.';

      setLastAIReply(reply);
      conversationHistoryRef.current.push({ role: 'model', text: reply });
      speakResponse(reply);
    } catch (err) {
      console.error('Error in AI Call process:', err);
      const fallbackReply =
        '¡Che, te escucho impecable en la línea! Acordate de deletrear letra por letra en inglés. ¿Qué otra palabra querés consultar?';
      setLastAIReply(fallbackReply);
      speakResponse(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  // Start listening helper
  const startListening = () => {
    if (isListening || isThinking || isSpeaking || isMuted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-CO';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        if (event.results[0].isFinal) {
          processVoiceInput(transcript);
          setIsListening(false);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Toggle speech recognition listening manually
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }
    startListening();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fade-in">
      
      {/* VOICE CALL STUDIO CARD */}
      <div
        className={`bg-slate-900 border border-sky-500/40 text-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col relative ${
          isMinimized
            ? 'w-full max-w-sm'
            : 'w-full max-w-md'
        }`}
      >
        {/* TOP BAR */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 p-4 border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-xl shadow-xs">
                👨‍🏫
              </div>
              {callActive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  Profe Virtual MOVA
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-400/30">
                  VOICE CALL IA
                </span>
              </div>
              <p className="text-xs text-sky-200 flex items-center gap-1.5 font-medium">
                {callActive ? (
                  <>
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Llamada de Voz en Vivo</span>
                    <span className="text-amber-300 font-mono font-bold ml-1">
                      {formatTime(callDuration)}
                    </span>
                  </>
                ) : (
                  <span>Listo para llamada de audio</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-100 transition-colors cursor-pointer"
              title={isMinimized ? 'Maximizar' : 'Minimizar'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                handleEndCall();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-sky-100 transition-colors cursor-pointer"
              title="Cerrar Llamada"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MINIMIZED MODE */}
        {isMinimized ? (
          <div className="p-4 bg-slate-900 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-sky-200">
              {callActive ? `Llamada Activa: ${formatTime(callDuration)}` : 'Llamada Pausada'}
            </span>
            {callActive ? (
              <button
                onClick={handleEndCall}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" /> Colgar
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Llamar
              </button>
            )}
          </div>
        ) : (
          /* FULL VOICE CALL STUDIO SCREEN */
          <div className="p-6 bg-slate-950 flex flex-col items-center justify-between space-y-6 relative overflow-hidden">
            
            {/* Background Atmosphere Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* CALLER AVATAR & RINGS */}
            <div className="flex flex-col items-center space-y-4 py-2 relative z-10">
              <div className="relative">
                {/* Glowing Outer Audio Pulsing Rings */}
                {callActive && (isSpeaking || isListening) && (
                  <div className="absolute -inset-5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-300 opacity-40 animate-ping" />
                )}

                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 p-1.5 shadow-2xl relative border-4 border-sky-400/40 flex items-center justify-center text-6xl">
                  👨‍🏫
                </div>
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-xl font-black text-white tracking-tight">
                  Profe Virtual José Jorge
                </h4>
                <p className="text-xs text-sky-300 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> I.E. MOVA Medellín
                </p>
              </div>

              {/* DYNAMIC CALL STATUS BADGE */}
              <div className="pt-1">
                <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/30 text-xs font-bold text-sky-200 flex items-center gap-2 shadow-inner">
                  {isThinking ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Analizando tu voz...</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Volume2 className="w-4 h-4 text-sky-400 animate-bounce" />
                      <span className="text-sky-300">Profe hablando por voz...</span>
                    </>
                  ) : isListening ? (
                    <>
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-300 font-extrabold">Escuchando tu voz...</span>
                    </>
                  ) : callActive ? (
                    <>
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Conectado en Vivo • Di algo</span>
                    </>
                  ) : (
                    <span>Presiona "Iniciar Llamada de Voz"</span>
                  )}
                </div>
              </div>
            </div>

            {/* REAL-TIME AUDIO EQUALIZER VISUALIZER */}
            <div className="w-full bg-slate-900/80 p-4 rounded-2xl border border-sky-500/20 flex flex-col items-center justify-center space-y-2 relative z-10">
              <div className="flex items-center justify-center gap-1.5 h-12 w-full">
                {audioLevel.map((lvl, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      callActive && (isSpeaking || isListening || isThinking)
                        ? isListening
                          ? 'bg-gradient-to-t from-emerald-500 to-sky-400'
                          : 'bg-gradient-to-t from-amber-400 via-sky-400 to-blue-500'
                        : 'bg-slate-800'
                    }`}
                    style={{
                      height: callActive && (isSpeaking || isListening || isThinking)
                        ? `${Math.max(12, isListening ? lvl : Math.floor(Math.random() * 85 + 15))}px`
                        : '10px',
                    }}
                  />
                ))}
              </div>

              {/* Subtitle / Live Transcript Hint (Voice Only) */}
              {callActive && (lastAIReply || lastTranscript) && (
                <div className="text-[11px] text-slate-300 text-center font-medium line-clamp-2 px-2 italic">
                  "{isListening ? lastTranscript || 'Escuchando tu voz...' : lastAIReply}"
                </div>
              )}
            </div>

            {/* CALL ACTION CONTROLS */}
            <div className="w-full space-y-3 relative z-10 pt-1">
              {!callActive ? (
                <button
                  onClick={handleStartCall}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                  <span>Iniciar Llamada de Voz IA</span>
                </button>
              ) : (
                <div className="space-y-2.5">
                  {/* HANDS-FREE CONTINUOUS VOICE TOGGLE */}
                  <button
                    onClick={() => setHandsFreeMode(!handsFreeMode)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      handsFreeMode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${handsFreeMode ? 'text-emerald-400 animate-pulse' : ''}`} />
                      Modo Manos Libres (Conversación Fluida)
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${handsFreeMode ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {handsFreeMode ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    {/* MUTE MIC BUTTON */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3.5 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isMuted
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-900 text-sky-200 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-sky-400" />}
                      <span>{isMuted ? 'Silenciado' : 'Micro'}</span>
                    </button>

                    {/* SPEAKER BUTTON */}
                    <button
                      onClick={() => setSpeakerEnabled(!speakerEnabled)}
                      className={`p-3.5 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        !speakerEnabled
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-900 text-sky-200 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {!speakerEnabled ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-sky-400" />}
                      <span>{speakerEnabled ? 'Altavoz ON' : 'Silencio'}</span>
                    </button>

                    {/* SPEAK / PTT MIC BUTTON */}
                    <button
                      onClick={toggleListening}
                      className={`p-3.5 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isListening
                          ? 'bg-emerald-500 text-slate-950 font-black animate-pulse shadow-lg scale-105'
                          : 'bg-sky-600 text-white hover:bg-sky-500'
                      }`}
                    >
                      <Radio className="w-5 h-5" />
                      <span>{isListening ? 'Hablando...' : 'Hablar'}</span>
                    </button>
                  </div>

                  {/* END CALL BUTTON */}
                  <button
                    onClick={handleEndCall}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>Finalizar Llamada</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
