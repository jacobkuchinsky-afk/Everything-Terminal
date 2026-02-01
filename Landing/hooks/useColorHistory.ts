'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HistoryColor {
  h: number;
  s: number;
  l: number;
  a: number;
  hex: string;
}

const COOKIE_NAME = 'color-picker-history';
const MAX_HISTORY = 12;
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// Cookie helper functions
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function useColorHistory() {
  const [history, setHistory] = useState<HistoryColor[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from cookies on mount
  useEffect(() => {
    try {
      const stored = getCookie(COOKIE_NAME);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load color history:', err);
    }
    setIsLoaded(true);
  }, []);

  // Save history to cookies when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        if (history.length > 0) {
          setCookie(COOKIE_NAME, JSON.stringify(history), COOKIE_MAX_AGE);
        } else {
          deleteCookie(COOKIE_NAME);
        }
      } catch (err) {
        console.error('Failed to save color history:', err);
      }
    }
  }, [history, isLoaded]);

  const addColor = useCallback((color: HistoryColor) => {
    setHistory((prev) => {
      // Check if this color already exists (by hex)
      const exists = prev.some((c) => c.hex === color.hex);
      if (exists) {
        // Move existing color to front
        return [color, ...prev.filter((c) => c.hex !== color.hex)].slice(0, MAX_HISTORY);
      }
      // Add new color to front
      return [color, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addColor,
    clearHistory,
    isLoaded,
  };
}
