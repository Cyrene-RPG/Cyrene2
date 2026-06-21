import { useEffect, useState } from "react";

export function useTypewriter(text: string, delayMs = 32) {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setCharIndex(0);
  }, [text]);

  useEffect(() => {
    if (charIndex >= text.length) return;
    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), delayMs);
    return () => clearTimeout(timer);
  }, [charIndex, text, delayMs]);

  return {
    displayedText: text.slice(0, charIndex),
    isTyping: charIndex < text.length,
  };
}
