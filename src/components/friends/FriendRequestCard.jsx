import React from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import Badge from '../common/Badge';

export default function FriendRequestCard({ request, onAccept, onDecline }) {
  return (
    <div className="bg-[#111927] border border-[#22334d] hover:border-[#2e4363] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={request.avatar}
          alt={request.name}
          className="w-11 h-11 rounded-full object-cover border border-[#22334d] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">{request.name}</h4>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">{request.handle}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rank: <span className="text-[#0df2c9] font-medium">{request.rank || 'Master'}</span> • {request.dp?.toLocaleString()} DP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onAccept(request.id)}
          className="px-3 py-1.5 bg-[#0df2c9] hover:bg-[#0df2c9]/90 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#1b273a] hover:bg-rose-500/10 rounded-xl transition-colors"
          title="Decline"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
