import React from 'react';
import { X, Play, Heart } from 'lucide-react';
import { Episode } from '../types';
import { format } from 'date-fns';
import { SafeImage } from './SafeImage';

interface FavoritesModalProps {
  episodes: Episode[];
  favorites: Set<string>;
  onClose: () => void;
  onSelectEpisode: (ep: Episode) => void;
  toggleFavorite: (id: string) => void;
}

export function FavoritesModal({ episodes, favorites, onClose, onSelectEpisode, toggleFavorite }: FavoritesModalProps) {
  const favoriteEpisodes = episodes.filter(ep => favorites.has(ep.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-outline/10 shrink-0">
          <div className="flex items-center gap-2 text-on-surface">
            <Heart className="w-6 h-6 fill-primary text-primary" />
            <h2 className="font-headline-sm text-2xl">收藏集數</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest">
          {favoriteEpisodes.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-body-lg">目前沒有收藏的集數</p>
              <p className="font-body-md mt-2">點擊各集數卡片上的心型圖示即可加入收藏</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {favoriteEpisodes.map(episode => (
                <div key={episode.id} className="flex gap-4 p-4 rounded-xl bg-surface border border-outline/10 hover:border-outline/30 transition-colors group">
                  <div 
                    className="w-24 h-24 shrink-0 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      onClose();
                      onSelectEpisode(episode);
                    }}
                  >
                    <SafeImage src={episode.image} alt={episode.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 
                        className="font-headline-sm text-lg text-on-surface line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          onClose();
                          onSelectEpisode(episode);
                        }}
                      >
                        {episode.title}
                      </h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(episode.id);
                        }}
                        className="text-primary hover:scale-110 transition-transform shrink-0"
                        title="取消收藏"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <p className="font-body-md text-sm text-on-surface-variant line-clamp-1 mb-2">
                      {episode.pubDate ? format(new Date(episode.pubDate), 'yyyy/MM/dd') : ''}
                    </p>
                    <div className="flex gap-4 items-center mt-auto">
                      <a 
                        href={episode.audioUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-secondary hover:text-primary font-label-md text-sm transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="w-4 h-4" /> 收聽
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
