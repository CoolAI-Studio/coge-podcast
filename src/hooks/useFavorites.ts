import { useState, useEffect, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('favoriteEpisodes');
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse favoriteEpisodes', e);
      }
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      localStorage.setItem('favoriteEpisodes', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  return { favorites, toggleFavorite };
}
