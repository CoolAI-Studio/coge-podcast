import { useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Episode } from '../types';
import { Play, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

interface PodcastMapProps {
  episodes: Episode[];
  onSelectEpisode: (ep: Episode) => void;
  loading?: boolean;
  playedEpisodes: Set<string>;
  onPlay: (id: string) => void;
  favorites?: Set<string>;
  toggleFavorite?: (id: string) => void;
}

const getThemeColor = (theme: string) => {
  switch (theme) {
    case 'modern_city': return '#3b82f6'; // blue-500
    case 'historical_city': return '#b45309'; // amber-700
    case 'nature_secret': return '#15803d'; // green-700
    case 'resort': return '#ec4899'; // pink-500
    default: return '#64748b'; // slate-500
  }
};

const getThemeName = (theme: string) => {
  switch (theme) {
    case 'modern_city': return '現代都市';
    case 'historical_city': return '歷史古城';
    case 'nature_secret': return '自然秘境';
    case 'resort': return '度假勝地';
    default: return '綜合';
  }
};

export function PodcastMap({ episodes, onSelectEpisode, loading, playedEpisodes, onPlay, favorites, toggleFavorite }: PodcastMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const mapCenter = { lat: 20, lng: 0 };
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const mapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "end start"]
  });
  
  const mapY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const mapOpacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  const episodesWithLocation = episodes.filter(e => e.lat !== undefined && e.lng !== undefined);

  return (
    <section id="map" className="py-16 md:py-32 max-w-[var(--spacing-container-max)] mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-4xl text-primary mb-2">全球人文足跡</h2>
        <p className="font-body-md text-base text-on-surface-variant">點擊地圖上的標記，探索各地的人文故事。系統將自動從 RSS 饋送中偵測地理座標。</p>
      </div>
      
      <motion.div 
        ref={mapRef}
        style={{ y: mapY, opacity: mapOpacity }}
        className="relative bg-surface-container rounded-xl p-2 md:p-4 min-h-[500px] border border-outline/10 shadow-inner overflow-hidden"
      >
        {loading ? (
          <div className="w-full h-[600px] bg-surface-container-high rounded-lg animate-pulse"></div>
        ) : apiKey ? (
          <APIProvider apiKey={apiKey}>
            <div className="w-full h-[600px] rounded-lg overflow-hidden">
              <Map 
                defaultCenter={mapCenter} 
                defaultZoom={2} 
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                mapId="DEMO_MAP_ID"
              >
                {episodesWithLocation.map((episode) => {
                  const theme = episode.theme || 'general';
                  return (
                    <AdvancedMarker
                      key={episode.id}
                      position={{ lat: episode.lat!, lng: episode.lng! }}
                      onClick={() => setSelectedEpisode(episode)}
                    >
                      <Pin background={getThemeColor(theme)} borderColor="#ffffff" glyphColor="#ffffff" />
                    </AdvancedMarker>
                  );
                })}
                
                {selectedEpisode && (
                  <InfoWindow
                    position={{ lat: selectedEpisode.lat!, lng: selectedEpisode.lng! }}
                    onCloseClick={() => setSelectedEpisode(null)}
                  >
                    <div className="p-2 max-w-xs bg-surface text-on-surface relative">
                      {playedEpisodes.has(selectedEpisode.id) && (
                        <div className="absolute top-2 right-2 bg-primary text-on-primary px-1.5 py-0.5 rounded flex items-center gap-1 font-label-md text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>已收聽</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mb-1 text-primary">
                         <span className="font-label-md text-xs uppercase tracking-wider">{selectedEpisode.locationName || 'Unknown Location'}</span>
                      </div>
                      <h4 className="font-headline-sm text-lg text-primary mb-2 leading-tight pr-14">{selectedEpisode.title}</h4>
                      <p className="font-body-md text-sm text-on-surface-variant mb-4 line-clamp-3">{selectedEpisode.description}</p>
                      <button 
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary py-2 px-4 font-label-md text-sm rounded hover:bg-on-secondary-container transition-colors"
                        onClick={() => onPlay(selectedEpisode.id)}
                      >
                        <Play className="w-4 h-4" /> 播放集數
                      </button>
                      <button 
                        onClick={() => onSelectEpisode(selectedEpisode)}
                        className="w-full mt-2 flex items-center justify-center gap-2 border border-outline text-on-surface py-2 px-4 font-label-md text-sm rounded hover:bg-surface-container-high transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> 留言與詳情
                      </button>
                      {selectedEpisode.chatUrl && (
                        <a 
                          href={selectedEpisode.chatUrl} 
                          target="_blank"
                          rel="noreferrer"
                          className="w-full mt-2 flex items-center justify-center gap-2 border border-secondary text-secondary py-2 px-4 font-label-md text-sm rounded hover:bg-secondary/10 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" /> 時空對話
                        </a>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </div>
          </APIProvider>
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center bg-surface-container-high rounded-lg text-on-surface-variant flex-col gap-4">
             <p>地圖需要 Google Maps API Key 才能顯示。</p>
             <p className="text-sm">請在 .env 中設定 VITE_GOOGLE_MAPS_API_KEY</p>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-outline/20 shadow-sm z-10">
          <h4 className="font-label-md text-xs font-bold text-on-surface mb-2">主題分類</h4>
          <div className="flex flex-col gap-2">
            {['modern_city', 'historical_city', 'nature_secret', 'resort', 'general'].map((theme) => (
              <div key={theme} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getThemeColor(theme) }}></span>
                <span className="font-body-md text-xs text-on-surface-variant">{getThemeName(theme)}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* RSS Legend */}
        <div className="absolute bottom-6 left-6 bg-surface/80 backdrop-blur-sm px-3 py-2 rounded border border-outline/20 text-xs text-on-surface-variant z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
            <span>RSS 實時介接中</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
