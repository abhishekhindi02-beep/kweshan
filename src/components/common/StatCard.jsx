import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, iconColor = 'text-[#00f59b]', subtextColor = 'text-[#94a3b8]', subIcon: SubIcon, className = '' }) {
  return (
    <div className={`bg-[#131b2e] border border-[#1c273e] hover:border-[#2a3b5c] rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono tracking-widest text-[#94a3b8] uppercase font-semibold">
          {label}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-[#1a233a] border border-[#233150] text-[#94a3b8]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
        {SubIcon && <SubIcon className={`w-3.5 h-3.5 ${subtextColor}`} />}
        <span className={subtextColor}>{subtext}</span>
      </div>
    </div>
  );
}
