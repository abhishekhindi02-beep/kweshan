import React, { useState } from 'react';
import { User } from 'lucide-react';

// Default SVG avatar data URL (always loads offline without network dependency)
export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23111927"/><circle cx="50" cy="40" r="20" fill="%230df2c9"/><path d="M20 85c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="%230df2c9" opacity="0.85"/></svg>`;

export function getInitials(name) {
  if (!name) return 'K';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  alt = 'Scholar',
  name = '',
  size = 'md', // sm, md, lg, xl, 2xl or custom class
  className = '',
  showStatus = false,
  status = 'online',
  border = true
}) {
  const [imageError, setImageError] = useState(false);

  // Size preset mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-lg',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const selectedSize = sizeClasses[size] || size;
  const initials = getInitials(name || alt);

  // Decide if we should render fallback
  const hasValidSrc = src && typeof src === 'string' && src.trim() && !imageError;

  return (
    <div className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full select-none ${selectedSize} ${className}`}>
      {hasValidSrc ? (
        <img
          src={src}
          alt="" // Keep empty alt to prevent browser broken alt text overlay on error
          onError={() => setImageError(true)}
          className={`w-full h-full rounded-full object-cover ${border ? 'border border-[#2a3b5c]' : ''}`}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-tr from-[#0df2c9] via-[#22d3ee] to-[#8b5cf6] p-[1.5px] ${
            border ? 'shadow-sm' : ''
          }`}
        >
          <div className="w-full h-full rounded-full bg-[#0b101b] flex items-center justify-center font-black font-mono text-[#0df2c9] tracking-wider">
            {initials}
          </div>
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#131b2e] ${
            status === 'online' ? 'bg-[#0df2c9]' : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
}
