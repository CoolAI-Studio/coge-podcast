import { format } from 'date-fns';
import { Share2, Play, Sparkles, CheckCircle2, Heart, Globe } from 'lucide-react';
import { Episode } from '../types';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

function ParallaxEpisodeCard({ episode, isPlayed, isFavorite, onSelect, onPlay, toggleFavorite }: any) {
  const ref = useRef(null);
  const [imageError, setImageError] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.article 
      ref={ref}
      style={{ opacity }}
      className="bg-surface border border-outline/10 overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-xl cursor-pointer relative" 
      onClick={() => onSelect(episode)}
    >
      <button 
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(episode.id);
        }}
      >
        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-primary text-primary' : 'text-white'}`} />
      </button>
      {isPlayed && (
        <div className="absolute top-4 left-4 bg-primary text-on-primary px-2 py-1 rounded-md flex items-center gap-1 font-label-md text-xs shadow-md z-10">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>已收聽</span>
        </div>
      )}
      <div className={`aspect-[16/10] overflow-hidden bg-surface-container-high relative ${isPlayed ? 'opacity-80' : ''}`}>
        {!episode.image || imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-surface-container to-surface-container-high border-b border-outline/10 p-6 text-center select-none">
            <Globe className="w-10 h-10 text-primary opacity-60 mb-2 animate-pulse" />
            <span className="font-headline-sm text-xs text-on-surface-variant font-medium tracking-tight line-clamp-2 px-2">
              {episode.title}
            </span>
          </div>
        ) : (
          <motion.img 
            src={episode.image} 
            alt={episode.title}
            style={{ y, scale: 1.15 }}
            className={`w-full h-full object-cover group-hover:scale-[1.2] transition-transform duration-700 ${isPlayed ? 'grayscale-[30%]' : ''}`}
            onError={() => {
              console.warn(`Parallax image failed to load: ${episode.image}`);
              setImageError(true);
            }}
          />
        )}
      </div>
      <div className={`p-6 ${isPlayed ? 'opacity-90' : ''} bg-surface relative z-10`}>
        <div className="flex gap-2 mb-3">
          <span className="bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-[10px] px-2 py-0.5 tracking-tighter uppercase rounded-sm">
            {episode.pubDate ? format(new Date(episode.pubDate), 'yyyy/MM/dd') : 'Unknown Date'}
          </span>
        </div>
        <h3 className="font-headline-sm text-xl text-on-surface mb-3 line-clamp-2">{episode.title}</h3>
        <p className="font-body-md text-sm text-on-surface-variant mb-6 line-clamp-3">{episode.description}</p>
        
        <div className="flex items-center justify-between border-t border-outline/10 pt-4">
          <div className="flex gap-3">
            <button 
              className="text-on-surface-variant hover:text-secondary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="w-5 h-5" />
            </button>
            {episode.chatUrl && (
              <a 
                href={episode.chatUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                 <Sparkles className="w-4 h-4" />
                 <span className="font-label-md text-xs">時空對話</span>
              </a>
            )}
          </div>
          <button
            className="flex items-center gap-1 text-primary font-label-md text-sm hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(episode.id);
            }}
          >
            <Play className="w-4 h-4" /> 收聽
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function Archive({ episodes, loading, onSelectEpisode, playedEpisodes, onPlay, favorites, toggleFavorite }: { episodes: Episode[]; loading: boolean; onSelectEpisode: (ep: Episode) => void; playedEpisodes: Set<string>; onPlay: (id: string) => void; favorites: Set<string>; toggleFavorite: (id: string) => void }) {
  return (
    <section id="archive" className="py-16 md:py-32 bg-surface-container-low">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-outline/20 pb-4 gap-4">
          <div>
            <h2 className="font-headline-lg text-4xl text-on-surface">集數存檔</h2>
            <p className="font-body-md text-base text-on-surface-variant">Co哥跨文化航行的完整合集。</p>
          </div>
          <div className="flex gap-4">
            <select className="font-label-md text-sm text-primary border border-primary px-4 py-2 hover:bg-primary/5 transition-colors bg-transparent rounded focus:outline-none">
              <option>依地區篩選</option>
              <option>全部</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="bg-surface border border-outline/10 overflow-hidden rounded-xl animate-pulse">
                <div className="aspect-[16/10] bg-surface-container-high"></div>
                <div className="p-6">
                  <div className="h-4 w-16 bg-surface-container-high rounded mb-4"></div>
                  <div className="h-6 w-full bg-surface-container-high rounded mb-3"></div>
                  <div className="h-6 w-3/4 bg-surface-container-high rounded mb-6"></div>
                  <div className="h-4 w-full bg-surface-container-high rounded mb-2"></div>
                  <div className="h-4 w-full bg-surface-container-high rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-surface-container-high rounded mb-6"></div>
                  <div className="flex justify-between border-t border-outline/10 pt-4">
                    <div className="flex gap-3">
                      <div className="h-5 w-5 bg-surface-container-high rounded"></div>
                      <div className="h-5 w-16 bg-surface-container-high rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-surface-container-high rounded"></div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            episodes.map(episode => (
              <ParallaxEpisodeCard 
                key={episode.id}
                episode={episode}
                isPlayed={playedEpisodes.has(episode.id)}
                isFavorite={favorites.has(episode.id)}
                onSelect={onSelectEpisode}
                onPlay={onPlay}
                toggleFavorite={toggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
