import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-[#1a233a] text-[#94a3b8] border border-[#233150]',
    mint: 'bg-[#00f59b]/15 text-[#00f59b] border border-[#00f59b]/30',
    purple: 'bg-[#8b5cf6]/15 text-[#c4b5fd] border border-[#8b5cf6]/30',
    gold: 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30',
    red: 'bg-[#ef4444]/15 text-[#fca5a5] border border-[#ef4444]/30',
    live: 'bg-[#00f59b]/20 text-[#00f59b] border border-[#00f59b]/40',
    pending: 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40',
    draft: 'bg-[#64748b]/20 text-[#cbd5e1] border border-[#64748b]/40'
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase',
    sm: 'px-2 py-0.5 text-xs font-mono tracking-wider uppercase',
    md: 'px-2.5 py-1 text-xs font-mono tracking-wider uppercase',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-colors ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}>
      {children}
    </span>
  );
}
