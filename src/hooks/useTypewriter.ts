import { useCallback, useEffect, useState } from "react";

type TypewriterOptions = {
  paragraphPauseMs?: number;
};

function delayBeforeNextChar(
  text: string,
  charIndex: number,
  delayMs: number,
  paragraphPauseMs: number,
): number {
  if (
    paragraphPauseMs > 0 &&
    charIndex >= 2 &&
    text[charIndex - 1] === "\n" &&
    text[charIndex - 2] === "\n"
  ) {
    return delayMs + paragraphPauseMs;
  }
  return delayMs;
}

export function useTypewriter(
  text: string,
  delayMs = 32,
  options: TypewriterOptions = {},
) {
  const { paragraphPauseMs = 0 } = options;
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setCharIndex(0);
  }, [text]);

  useEffect(() => {
    if (charIndex >= text.length) return;
    const delay = delayBeforeNextChar(
      text,
      charIndex,
      delayMs,
      paragraphPauseMs,
    );
    const timer = window.setTimeout(() => setCharIndex((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [charIndex, text, delayMs, paragraphPauseMs]);

  const skip = useCallback(() => {
    setCharIndex(text.length);
  }, [text]);

  return {
    displayedText: text.slice(0, charIndex),
    isTyping: charIndex < text.length,
    skip,
  };
}
