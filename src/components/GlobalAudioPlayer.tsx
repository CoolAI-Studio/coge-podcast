import React from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Play, Pause, X, Music, Rewind, FastForward } from 'lucide-react';
import { Episode } from '../types';
import { SafeImage } from './SafeImage';

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function GlobalAudioPlayer({ episodes }: { episodes: Episode[] }) {
  const { currentEpisodeId, isPlaying, pause, resume, close, seekBy, seekTo, setSpeed, playbackRate, currentTime, duration, pointA, pointB, setPointA, setPointB, clearAB } = useAudioPlayer();

  if (!currentEpisodeId) return null;

  const episode = episodes.find(e => e.id === currentEpisodeId);

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 5];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleABClick = () => {
    if (pointA === null) {
      setPointA(currentTime);
    } else if (pointB === null) {
      if (currentTime > pointA) {
        setPointB(currentTime);
      } else {
        // If B is before A, reset A to current
        setPointA(currentTime);
      }
    } else {
      clearAB();
    }
  };

  const abButtonText = pointA === null ? 'A-B' : pointB === null ? 'A-...' : 'A-B (On)';
  const abButtonClass = pointA !== null ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high border-t border-outline/20 p-2 sm:p-4 shadow-lg backdrop-blur-md bg-opacity-90">
      <div className="max-w-[var(--spacing-container-max)] mx-auto flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center h-4">
            {pointA !== null && (
              <div 
                className="absolute h-1 bg-primary/30 pointer-events-none" 
                style={{ 
                  left: `${(pointA / duration) * 100}%`, 
                  width: pointB !== null ? `${((pointB - pointA) / duration) * 100}%` : `${((currentTime - pointA) / duration) * 100}%` 
                }} 
              />
            )}
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary relative z-10 bg-transparent"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
              {episode?.image ? (
                <SafeImage src={episode.image} alt={episode.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-6 h-6 text-on-surface-variant" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-on-surface font-headline-sm text-xs sm:text-sm truncate">{episode?.title || 'Unknown Episode'}</h4>
              <p className="text-on-surface-variant font-body-md text-[10px] sm:text-xs truncate">正在播放...</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1 shrink-0 px-1 sm:px-4">
            <div className="flex items-center gap-1 sm:gap-3">
              <button onClick={() => seekBy(-30)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center relative w-8 h-8 group" title="-30秒">
                <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -bottom-3 text-[9px] sm:text-[10px] font-bold group-hover:text-primary hidden sm:block">30s</span>
              </button>
              <button onClick={() => seekBy(-10)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center relative w-8 h-8 group" title="-10秒">
                <Rewind className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -bottom-3 text-[9px] sm:text-[10px] font-bold group-hover:text-primary hidden sm:block">10s</span>
              </button>

              <button 
                onClick={isPlaying ? pause : resume}
                className="w-10 h-10 sm:w-12 sm:h-12 mx-1 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />}
              </button>
              
              <button onClick={() => seekBy(10)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center relative w-8 h-8 group" title="+10秒">
                <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -bottom-3 text-[9px] sm:text-[10px] font-bold group-hover:text-primary hidden sm:block">10s</span>
              </button>
              <button onClick={() => seekBy(30)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center relative w-8 h-8 group" title="+30秒">
                <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -bottom-3 text-[9px] sm:text-[10px] font-bold group-hover:text-primary hidden sm:block">30s</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4 shrink-0 flex-1 justify-end min-w-0">
            <button 
              onClick={handleABClick}
              className={`px-1.5 py-1 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-colors ${abButtonClass}`}
              title="A-B 循環播放"
            >
              {abButtonText}
            </button>
            <select 
              value={playbackRate}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-1 py-1 sm:px-2 sm:py-1 bg-surface-variant text-on-surface-variant rounded text-[10px] sm:text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer outline-none"
              title="調整播放速度"
            >
              {speeds.map(s => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
            <button 
              onClick={close}
              className="text-on-surface-variant hover:text-on-surface p-1 sm:p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
