import React from 'react';
import { Play, Clock, Zap, Swords, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

export default function BattleCard({ battle, onPlay }) {
  const isMatchPoint = battle.stateLabel === 'Match Point Risk' || battle.stateLabel === 'Action Required';
  const isTieBreaker = battle.stateLabel === 'Tie-breaker Active';

  let badgeVariant = 'mint';
  if (isMatchPoint) badgeVariant = 'red';
  else if (isTieBreaker) badgeVariant = 'gold';

  return (
    <div className="bg-[#131b2e] border border-[#1f2d47] hover:border-[#2a3b5c] rounded-2xl p-5 transition-all flex flex-col justify-between group">
      <div>
        {/* Header with Opponent and Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={battle.opponentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={battle.opponentName}
                className="w-11 h-11 rounded-full object-cover border border-[#2a3b5c]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00f59b] border-2 border-[#131b2e]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#00f59b] transition-colors">
                {battle.opponentName}
              </h4>
              <p className="text-[11px] font-mono text-[#64748b]">
                Duelist Lvl {battle.opponentLevel || 12} • {battle.subject}
              </p>
            </div>
          </div>

          <Badge variant={badgeVariant} size="xs">
            {battle.stateLabel || 'Your Turn'}
          </Badge>
        </div>

        {/* Score and Round Indicator */}
        <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-[#0d1322] border border-[#18233a] my-4 text-center">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">You</div>
            <div className="text-lg font-black text-white">{battle.userScore}</div>
          </div>
          <div className="border-x border-[#1a253d] flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Round</div>
            <div className="text-xs font-bold text-[#00f59b] font-mono">{battle.currentRound} / {battle.maxRounds}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Opponent</div>
            <div className="text-lg font-black text-[#94a3b8]">{battle.opponentScore}</div>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-2 flex items-center justify-between border-t border-[#1a253d]">
        <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>{battle.timeRemainingSeconds || 15}s / turn</span>
        </div>

        <button
          onClick={() => onPlay(battle.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f59b] text-[#090d16] font-bold text-xs hover:bg-[#00f59b]/90 mint-glow-sm active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-[#090d16]" />
          <span>Play Round {battle.currentRound}</span>
        </button>
      </div>
    </div>
  );
}
