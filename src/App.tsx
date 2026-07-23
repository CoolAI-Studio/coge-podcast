/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { usePodcastFeed } from './hooks/usePodcastFeed';
import { usePlayedEpisodes } from './hooks/usePlayedEpisodes';
import { useFavorites } from './hooks/useFavorites';
import { useDarkMode } from './hooks/useDarkMode';
import { AudioPlayerProvider, useAudioPlayer } from './hooks/useAudioPlayer';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PodcastMap } from './components/PodcastMap';
import { LatestEpisode } from './components/LatestEpisode';
import { Archive } from './components/Archive';
import { Footer } from './components/Footer';
import { EpisodeModal } from './components/EpisodeModal';
import { FavoritesModal } from './components/FavoritesModal';
import { Episode } from './types';
import { trackEvent } from './lib/tracking';

function AppContent({
  episodes, channelTitle, loading, playedEpisodes, favorites, toggleFavorite, isDarkMode, toggleDarkMode
}: any) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const { playEpisode } = useAudioPlayer();

  const latestEpisode = episodes.length > 0 ? episodes[0] : undefined;

  useEffect(() => {
    trackEvent('page_view', 'global');
  }, []);

  useEffect(() => {
    if (episodes.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const epId = params.get('episode');
      if (epId) {
        const ep = episodes.find((e: Episode) => e.id === epId);
        if (ep) {
          setSelectedEpisode(ep);
        }
      }
    }
  }, [episodes]);

  const handleCloseModal = () => {
    setSelectedEpisode(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('episode');
    window.history.pushState({}, '', url.toString());
  };

  const handlePlay = (id: string) => {
    const ep = episodes.find((e: Episode) => e.id === id);
    if (ep && ep.audioUrl) {
      trackEvent('play_clicked', id);
      playEpisode(id, ep.audioUrl);
    }
  };

  return (
    <div className="font-body-md bg-surface text-on-surface min-h-screen pb-20">
      <Navbar title={channelTitle} onShowFavorites={() => setShowFavorites(true)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main>
        <Hero />
        <PodcastMap episodes={episodes} onSelectEpisode={setSelectedEpisode} loading={loading} playedEpisodes={playedEpisodes} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />
        <LatestEpisode episode={latestEpisode} loading={loading} onSelectEpisode={setSelectedEpisode} playedEpisodes={playedEpisodes} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />
        <Archive episodes={episodes} loading={loading} onSelectEpisode={setSelectedEpisode} playedEpisodes={playedEpisodes} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />
      </main>
      <Footer title={channelTitle} />
      
      {selectedEpisode && (
        <EpisodeModal episode={selectedEpisode} onClose={handleCloseModal} playedEpisodes={playedEpisodes} onPlay={handlePlay} favorites={favorites} toggleFavorite={toggleFavorite} />
      )}
      
      {showFavorites && (
        <FavoritesModal episodes={episodes} favorites={favorites} onClose={() => setShowFavorites(false)} onSelectEpisode={setSelectedEpisode} toggleFavorite={toggleFavorite} />
      )}
      
      <GlobalAudioPlayer episodes={episodes} />
    </div>
  );
}

export default function App() {
  const { episodes, channelTitle, loading } = usePodcastFeed();
  const { playedEpisodes, markAsPlayed } = usePlayedEpisodes();
  const { favorites, toggleFavorite } = useFavorites();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleProgress = (id: string, progress: number) => {
    if (progress >= 0.8) {
      markAsPlayed(id);
    }
  };

  return (
    <AudioPlayerProvider onProgress={handleProgress}>
      <AppContent
        episodes={episodes}
        channelTitle={channelTitle}
        loading={loading}
        playedEpisodes={playedEpisodes}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </AudioPlayerProvider>
  );
}
