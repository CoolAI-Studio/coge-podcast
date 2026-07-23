import { useState, useEffect, useCallback } from 'react';

export function usePlayedEpisodes() {
  const [playedEpisodes, setPlayedEpisodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('playedEpisodes');
    if (stored) {
      try {
        setPlayedEpisodes(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse playedEpisodes', e);
      }
    }
  }, []);

  const markAsPlayed = useCallback((id: string) => {
    setPlayedEpisodes(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem('playedEpisodes', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  return { playedEpisodes, markAsPlayed };
}
