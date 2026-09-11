import React from 'react';

export default function ProgressBar({ value = 0, max = 100, variant = 'mint', height = 'h-1.5', showGlow = true, className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorVariants = {
    mint: 'bg-[#00f59b] shadow-[0_0_8px_rgba(0,245,155,0.4)]',
    purple: 'bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    gold: 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    red: 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    cyan: 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.4)]'
  };

  return (
    <div className={`w-full bg-[#1e293b]/70 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorVariants[variant] || colorVariants.mint}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
