export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const speakWord = (word: string, rate: number = 0.9): Promise<void> => {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // stop current utterance

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = rate; // 0.8 to 1.0 is great for learners
      utterance.pitch = 1.0;

      // Try to select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
};

export const spellLetter = (letter: string): Promise<void> => {
  return speakWord(letter.toUpperCase(), 0.9);
};

export const spellWordLetterByLetter = async (word: string, delayMs = 600): Promise<void> => {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();
  const letters = word.split('');

  for (const char of letters) {
    if (char.trim() === '') continue;
    await speakWord(char, 0.85);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  // Speak full word at the end
  await new Promise((r) => setTimeout(r, 200));
  await speakWord(word, 0.9);
};

export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};
