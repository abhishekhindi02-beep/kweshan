import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swords, Plus, Zap, Trophy, History, Send, Inbox, ShieldCheck } from 'lucide-react';
import BattleCard from '../components/battles/BattleCard';
import ChallengeModal from '../components/battles/ChallengeModal';
import Badge from '../components/common/Badge';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function BattlesPage({ onStartBattle, onStartLightning }) {
  const { battles, battleInvites, acceptBattleInvite, declineBattleInvite, friends } = useGame();
  const { user } = useAuth();
  const { showToast } = useToast();
  const params = useParams();

  const [activeTab, setActiveTab] = useState('active'); // active, invites, history
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Auto-launch battle if route has :id
  useEffect(() => {
    if (params.id && battles.length > 0) {
      const targetBattle = battles.find((b) => b.id === params.id);
      if (targetBattle && onStartBattle) {
        onStartBattle(targetBattle.deckId, targetBattle);
      }
    }
  }, [params.id, battles]);

  const activeBattles = battles.filter((b) => b.status === 'in_progress');
  const finishedBattles = battles.filter((b) => b.status === 'completed');

  const handleAcceptInvite = (inviteId) => {
    const battle = acceptBattleInvite(inviteId);
    showToast('Challenge accepted! Preparing battle arena...', 'success');
    if (battle) {
      onStartBattle(battle.deckId, battle);
    }
  };

  const handleDeclineInvite = (inviteId) => {
    declineBattleInvite(inviteId);
    showToast('Challenge declined.', 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Battles Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-[#0df2c9]" />
            Peer Battle Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Challenge fellow scholars to 5-round head-to-head academic face-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onStartBattle()}
            className="px-4 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Instant Quick Match
          </button>
          <button
            onClick={() => setIsChallengeModalOpen(true)}
            className="px-4 py-2.5 bg-[#1b273a] hover:bg-[#25354e] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#2e4363] hover:border-[#0df2c9]/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#0df2c9]" />
            Challenge Peer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#22334d] pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-[#0df2c9] text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Active Battles ({activeBattles.length})
        </button>

        <button
          onClick={() => setActiveTab('invites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'invites'
              ? 'bg-[#0df2c9] text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Pending Invites ({battleInvites.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#0df2c9] text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Battle History ({finishedBattles.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeBattles.length === 0 ? (
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-12 text-center space-y-3">
              <Swords className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active battles right now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Jump into a quick match against an online peer or challenge someone from your friends list!
              </p>
              <button
                onClick={() => onStartBattle()}
                className="px-4 py-2 bg-[#0df2c9] text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 mt-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Find Match Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBattles.map((battle) => (
                <BattleCard
                  key={battle.id}
                  battle={battle}
                  onPlay={(b) => onStartBattle(b.deckId, b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invites' && (
        <div className="space-y-3 max-w-2xl">
          {battleInvites.length === 0 ? (
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-12 text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No pending challenge invites</h3>
              <p className="text-xs text-slate-400">
                You're all caught up! Challenge a classmate to initiate a new match.
              </p>
            </div>
          ) : (
            battleInvites.map((inv) => (
              <div
                key={inv.id}
                className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={inv.senderAvatar}
                    alt={inv.senderName}
                    className="w-11 h-11 rounded-full object-cover border border-[#22334d]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{inv.senderName}</h4>
                    <p className="text-xs text-slate-400">
                      Challenged you in <span className="text-[#0df2c9] font-medium">{inv.deckName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvite(inv.id)}
                    className="px-4 py-2 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Accept Battle
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(inv.id)}
                    className="px-3 py-2 bg-[#1b273a] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finishedBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onPlay={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Challenge Peer Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      />
    </div>
  );
}
