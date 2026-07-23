import { useState, useEffect } from 'react';
import { Episode } from '../types';

export function usePodcastFeed() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [channelTitle, setChannelTitle] = useState('Co哥世界人文探索');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}episodes.json`);
        if (!response.ok) throw new Error('Failed to fetch episodes data');
        
        const data = await response.json();
        
        let fetchedEpisodes: Episode[] = data.episodes || [];
        // Sort by pubDate descending (newest first)
        fetchedEpisodes.sort((a, b) => {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
        
        setEpisodes(fetchedEpisodes);
        if (data.channelTitle) {
          setChannelTitle(data.channelTitle);
        }
      } catch (err) {
        console.error(err);
        setError('無法連線至伺服器，請稍後再試。');
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  return { episodes, channelTitle, loading, error };
}
