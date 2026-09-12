import React from 'react';
import { Check, X, Clock, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export default function FriendRequestCard({ request, onAccept, onDecline }) {
  const name = request.name || request.senderName || 'Scholar';
  const avatar = request.avatar || request.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const handle = request.handle || `@${request.username || (request.name || request.senderName || 'scholar').toLowerCase().replace(/\s+/g, '_')}`;
  const level = request.level || request.senderLevel || 10;
  const rank = request.rank || request.tier || 'Scholar';
  const dp = request.dp || 2450;
  const message = request.message || request.senderBio || 'Wants to connect after your recent AP Physics battle.';
  const time = request.timeAgo || request.time || '2h ago';

  return (
    <div className="bg-[#111927] border border-[#22334d] hover:border-[#0df2c9]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm">
      <div className="flex items-start gap-3.5 min-w-0">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-2xl object-cover border border-[#22334d] flex-shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white truncate">{name}</h4>
            <span className="text-xs text-slate-400 font-mono">{handle}</span>
            <Badge variant={rank.toLowerCase().includes('grandmaster') || rank.toLowerCase().includes('apex') ? 'mint' : 'purple'}>
              {rank} • Lvl {level}
            </Badge>
          </div>
          <p className="text-xs text-slate-300 italic bg-[#0b101b] px-2.5 py-1 rounded-lg border border-[#1b273a] inline-block">
            "{message}"
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="text-[#0df2c9] font-bold">{dp.toLocaleString()} DP</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {time}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
        <button
          onClick={() => onAccept(request.id)}
          className="px-4 py-2 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] hover:shadow-md hover:shadow-[#0df2c9]/20 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Accept</span>
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-3 py-2 text-slate-400 hover:text-rose-400 bg-[#1b273a] hover:bg-rose-500/10 border border-[#22334d] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          title="Ignore / Decline"
        >
          <X className="w-3.5 h-3.5" />
          <span>Ignore</span>
        </button>
      </div>
    </div>
  );
}
