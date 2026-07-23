import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { trackEvent } from '../lib/tracking';

interface AudioPlayerContextType {
  currentEpisodeId: string | null;
  audioUrl: string | null;
  isPlaying: boolean;
  playEpisode: (id: string, url: string) => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
  seekBy: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setSpeed: (rate: number) => void;
  playbackRate: number;
  currentTime: number;
  duration: number;
  pointA: number | null;
  pointB: number | null;
  setPointA: (time: number | null) => void;
  setPointB: (time: number | null) => void;
  clearAB: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children, onProgress }: { children: ReactNode; onProgress: (id: string, progress: number) => void }) {
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackedMilestonesRef = useRef<Set<number>>(new Set());

  // Store A and B in refs for fast access in the event listener
  const pointARef = useRef<number | null>(null);
  const pointBRef = useRef<number | null>(null);

  useEffect(() => {
    pointARef.current = pointA;
  }, [pointA]);

  useEffect(() => {
    pointBRef.current = pointB;
  }, [pointB]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // A-B Loop Logic
      if (pointARef.current !== null && pointBRef.current !== null) {
        if (audio.currentTime >= pointBRef.current) {
          audio.currentTime = pointARef.current;
        }
      }

      if (audio.duration && currentEpisodeId) {
        const progress = audio.currentTime / audio.duration;
        onProgress(currentEpisodeId, progress);

        // Track milestones: 25%, 50%, 75%, 90%
        const milestones = [0.25, 0.5, 0.75, 0.9];
        for (const milestone of milestones) {
          if (progress >= milestone && !trackedMilestonesRef.current.has(milestone)) {
            trackedMilestonesRef.current.add(milestone);
            trackEvent('audio_progress', {
              episode_id: currentEpisodeId,
              progress_percent: Math.round(milestone * 100),
              current_time: Math.round(audio.currentTime),
              duration: Math.round(audio.duration)
            });
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (currentEpisodeId) {
        onProgress(currentEpisodeId, 1);
        trackEvent('audio_complete', {
          episode_id: currentEpisodeId,
          duration: Math.round(audio.duration)
        });
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (currentEpisodeId) {
        trackEvent('audio_play', {
          episode_id: currentEpisodeId,
          current_time: Math.round(audio.currentTime)
        });
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (currentEpisodeId) {
        trackEvent('audio_pause', {
          episode_id: currentEpisodeId,
          current_time: Math.round(audio.currentTime),
          duration: Math.round(audio.duration)
        });
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentEpisodeId, onProgress]);

  const playEpisode = (id: string, url: string) => {
    if (currentEpisodeId === id && isPlaying) {
      return;
    }

    if (currentEpisodeId !== id) {
      setCurrentEpisodeId(id);
      setAudioUrl(url);
      setCurrentTime(0);
      setDuration(0);
      trackedMilestonesRef.current.clear();

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(console.error);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const close = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentEpisodeId(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const seekBy = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setSpeed = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const clearAB = () => {
    setPointA(null);
    setPointB(null);
  };

  return (
    <AudioPlayerContext.Provider value={{ currentEpisodeId, audioUrl, isPlaying, playEpisode, pause, resume, close, seekBy, seekTo, setSpeed, playbackRate, currentTime, duration, pointA, pointB, setPointA, setPointB, clearAB }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
