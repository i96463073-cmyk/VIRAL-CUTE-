import React from 'react';
import { Platform } from './types';

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
  showName?: boolean;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  className = '',
  showName = true,
}) => {
  const getDetails = () => {
    switch (platform) {
      case 'TikTok':
        return {
          icon: '🎵',
          bg: 'bg-black/80 text-pink-400 border-pink-500/30',
          gradient: 'from-pink-500 to-cyan-400',
          glow: 'shadow-pink-500/20',
        };
      case 'Instagram':
        return {
          icon: '📸',
          bg: 'bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-amber-900/40 text-pink-300 border-pink-500/30',
          gradient: 'from-purple-500 via-pink-500 to-amber-400',
          glow: 'shadow-purple-500/20',
        };
      case 'YouTube':
        return {
          icon: '▶️',
          bg: 'bg-red-950/60 text-red-400 border-red-500/30',
          gradient: 'from-red-600 to-rose-500',
          glow: 'shadow-red-500/20',
        };
      case 'Twitter':
        return {
          icon: '🐦',
          bg: 'bg-slate-900 text-sky-400 border-sky-500/30',
          gradient: 'from-sky-400 to-blue-500',
          glow: 'shadow-sky-500/20',
        };
      case 'Spotify':
        return {
          icon: '🎧',
          bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
          gradient: 'from-emerald-500 to-teal-400',
          glow: 'shadow-emerald-500/20',
        };
      case 'Telegram':
        return {
          icon: '✈️',
          bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
          gradient: 'from-cyan-400 to-blue-500',
          glow: 'shadow-cyan-500/20',
        };
      case 'Facebook':
        return {
          icon: '👥',
          bg: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
          gradient: 'from-blue-600 to-indigo-600',
          glow: 'shadow-blue-500/20',
        };
      case 'Threads':
        return {
          icon: '🌀',
          bg: 'bg-zinc-900 text-zinc-200 border-zinc-700',
          gradient: 'from-zinc-400 to-zinc-600',
          glow: 'shadow-zinc-500/20',
        };
      case 'Twitch':
        return {
          icon: '🎮',
          bg: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
          gradient: 'from-purple-500 to-violet-600',
          glow: 'shadow-purple-500/20',
        };
    }
  };

  const details = getDetails();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${details.bg} ${details.glow} ${className}`}
    >
      <span>{details.icon}</span>
      {showName && <span>{platform}</span>}
    </span>
  );
};
