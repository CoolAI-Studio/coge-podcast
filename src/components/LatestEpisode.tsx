import { PlayCircle, Sparkles, MessageSquare, CheckCircle2, Heart } from 'lucide-react';
import { Episode } from '../types';
import { SafeImage } from './SafeImage';

export function LatestEpisode({ episode, loading, onSelectEpisode, playedEpisodes, onPlay, favorites, toggleFavorite }: { episode?: Episode; loading: boolean; onSelectEpisode: (ep: Episode) => void; playedEpisodes: Set<string>; onPlay: (id: string) => void; favorites: Set<string>; toggleFavorite: (id: string) => void }) {
  if (loading) {
    return (
      <section id="latest-episode-section" className="py-16 md:py-32 max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="animate-pulse bg-surface-container-high h-[400px] w-full rounded-xl"></div>
      </section>
    );
  }

  if (!episode) return null;

  const isPlayed = playedEpisodes.has(episode.id);

  return (
    <section id="latest-episode-section" className="py-16 md:py-32 max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="bg-surface border border-outline/10 flex flex-col lg:flex-row shadow-sm overflow-hidden rounded-xl">
        <div className="lg:w-1/2 relative min-h-[400px]">
          {isPlayed && (
            <div className="absolute top-6 left-6 bg-primary text-on-primary px-3 py-1.5 rounded-md flex items-center gap-1.5 font-label-md text-sm shadow-md z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span>已收聽</span>
            </div>
          )}
          <SafeImage 
            src={episode.image} 
            alt={episode.title} 
            className={`w-full h-full object-cover ${isPlayed ? 'grayscale-[30%] opacity-90' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
            <div>
              <span className="bg-primary text-on-primary px-3 py-1 font-label-md text-xs mb-2 inline-block uppercase tracking-wider rounded-sm">最新集數</span>
              <h2 className="font-headline-lg text-3xl md:text-4xl text-white line-clamp-2">{episode.title}</h2>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-surface-bright">
          <div className="mb-6">
            <p className="font-body-lg text-lg text-on-surface leading-relaxed mb-6 line-clamp-4">{episode.description}</p>
            <div className="flex gap-4 flex-wrap">
              <button 
                className="bg-primary text-on-primary px-6 py-2 font-label-md text-sm flex items-center gap-2 transition-all hover:bg-primary-container hover:text-on-primary-container rounded"
                onClick={() => onPlay(episode.id)}
              >
                <PlayCircle className="w-5 h-5" /> 立即播放
              </button>
              {episode.chatUrl && (
                <a 
                  href={episode.chatUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-secondary text-on-secondary px-6 py-2 font-label-md text-sm flex items-center gap-2 transition-all hover:bg-on-secondary-container rounded"
                >
                  <Sparkles className="w-5 h-5" /> 時空對話
                </a>
              )}
              <button 
                onClick={() => onSelectEpisode(episode)}
                className="border border-outline text-on-surface px-6 py-2 font-label-md text-sm flex items-center gap-2 transition-all hover:bg-surface-container-high rounded"
              >
                <MessageSquare className="w-5 h-5" /> 留言區
              </button>
              <button 
                onClick={() => toggleFavorite(episode.id)}
                className={`border text-on-surface px-6 py-2 font-label-md text-sm flex items-center gap-2 transition-all rounded ${favorites.has(episode.id) ? 'border-primary text-primary hover:bg-primary/5' : 'border-outline hover:bg-surface-container-high'}`}
              >
                <Heart className={`w-5 h-5 ${favorites.has(episode.id) ? 'fill-current text-primary' : ''}`} /> 
                {favorites.has(episode.id) ? '已收藏' : '收藏'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
