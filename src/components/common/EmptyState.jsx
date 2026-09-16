import React from 'react';
import { FolderPlus, FilePlus, Search, BookOpen, Sparkles } from 'lucide-react';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = FolderPlus,
  variant = 'default'
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[#1f2d47] bg-[#0d1322]/50 my-6">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#152037] border border-[#223252] flex items-center justify-center text-[#0df2c9] mb-4 shadow-lg shadow-black/40">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <ActionIcon className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
