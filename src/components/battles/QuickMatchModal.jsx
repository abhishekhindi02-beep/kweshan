import React, { useState, useEffect } from 'react';
import { Swords, Zap, Loader2, Sparkles, UserCheck, Flame, Trophy, Award } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import dataStore from '../../services/dataStore';

const AI_OPPONENTS = [
  {
    id: 'user_2',
    name: 'Abram Mango',
    username: 'abram_m',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: 12,
    tier: 'MASTER DUELIST',
    deckId: 'deck_1',
    subject: 'AP Physics 1: Mechanics',
    winRate: '68%',
    accuracy: 72
  },
  {
    id: 'user_3',
    name: 'Alfonso Lubin',
    username: 'alfonso_l',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: 15,
    tier: 'MASTER DUELIST',
    deckId: 'deck_2',
    subject: 'AP Calculus AB & BC',
    winRate: '74%',
    accuracy: 78
  },
  {
    id: 'user_7',
    name: 'Lucas Meyer',
    username: 'lucas_m',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    level: 13,
    tier: 'MASTER DUELIST',
    deckId: 'deck_3',
    subject: 'AP Chemistry',
    winRate: '71%',
    accuracy: 75
  },
  {
    id: 'user_4',
    name: 'Maren Gouse',
    username: 'maren_g',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: 9,
    tier: 'VETERAN SCHOLAR',
    deckId: 'deck_4',
    subject: 'Science & Molecular Biology',
    winRate: '64%',
    accuracy: 67
  },
  {
    id: 'user_8',
    name: 'Nadia Okonjo',
    username: 'nadia_o',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    level: 16,
    tier: 'APEX MASTER',
    deckId: 'deck_4',
    subject: 'Science & Molecular Biology',
    winRate: '82%',
    accuracy: 85
  },
  {
    id: 'user_5',
    name: 'James C.',
    username: 'james_c',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    level: 14,
    tier: 'MASTER DUELIST',
    deckId: 'deck_1',
    subject: 'AP Physics 1: Mechanics',
    winRate: '70%',
    accuracy: 74
  }
];

export default function QuickMatchModal({ isOpen, onClose, onLaunchBattle }) {
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || dataStore.getCurrentUser();
  const { decks } = useGame();

  const [matchState, setMatchState] = useState('searching'); // 'searching' | 'found'
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [scanningIndex, setScanningIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMatchState('searching');
      setSelectedOpponent(null);
      setCountdown(3);
      return;
    }

    setMatchState('searching');
    setCountdown(3);

    // Avatar cycling effect
    const cycleInterval = setInterval(() => {
      setScanningIndex((prev) => (prev + 1) % AI_OPPONENTS.length);
    }, 280);

    // Matchmaking timer (found after 2.2s)
    const matchTimer = setTimeout(() => {
      clearInterval(cycleInterval);
      const chosen = AI_OPPONENTS[Math.floor(Math.random() * AI_OPPONENTS.length)];
      setSelectedOpponent(chosen);
      setMatchState('found');
    }, 2200);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(matchTimer);
    };
  }, [isOpen]);

  // Countdown timer when found
  useEffect(() => {
    if (matchState !== 'found' || !selectedOpponent) return;

    if (countdown <= 0) {
      handleStartBattle();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [matchState, countdown, selectedOpponent]);

  const handleStartBattle = () => {
    if (!selectedOpponent) return;
    onClose();
    if (onLaunchBattle) {
      onLaunchBattle(selectedOpponent.deckId, {
        id: `battle_${Date.now()}`,
        opponentId: selectedOpponent.id,
        opponentName: selectedOpponent.name,
        opponentAvatar: selectedOpponent.avatar,
        opponentRank: selectedOpponent.tier,
        opponentLevel: selectedOpponent.level,
        subject: selectedOpponent.subject,
        deckId: selectedOpponent.deckId,
        accuracy: selectedOpponent.accuracy
      });
    }
  };

  if (!isOpen) return null;

  const currentScanned = AI_OPPONENTS[scanningIndex] || AI_OPPONENTS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={matchState === 'searching' ? 'Matchmaking Arena' : 'Opponent Locked!'}
      subtitle={
        matchState === 'searching'
          ? 'Scanning academic division for active duelists...'
          : 'Connecting to synchronized 5-round battle...'
      }
    >
      <div className="space-y-6 py-2 text-center animate-fadeIn">
        {/* State 1: Searching Animation */}
        {matchState === 'searching' && (
          <div className="space-y-6">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              {/* Radar Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-[#0df2c9]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-[#0df2c9]/40 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-[#111927] border-2 border-[#0df2c9] flex items-center justify-center overflow-hidden shadow-lg shadow-[#0df2c9]/20">
                <Avatar
                  src={currentScanned.avatar}
                  name={currentScanned.name}
                  size="xl"
                  border={false}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono text-[#0df2c9] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Searching Academic Guilds...
              </div>
              <h3 className="text-base font-bold text-white">
                Scanning for peers in STEM Divisions
              </h3>
              <p className="text-xs text-slate-400">
                Filtering by Distinction Rank ({effectiveUser?.tier || 'Scholar'}).
              </p>
            </div>

            <div className="bg-[#111927] border border-[#22334d] p-3 rounded-xl flex items-center justify-around text-xs text-slate-400">
              <span>Avg Queue: <strong>&lt; 3s</strong></span>
              <span className="h-3 w-px bg-slate-700" />
              <span>Format: <strong>5 Rounds</strong></span>
              <span className="h-3 w-px bg-slate-700" />
              <span>Reward: <strong>+120 DP</strong></span>
            </div>
          </div>
        )}

        {/* State 2: Opponent Found */}
        {matchState === 'found' && selectedOpponent && (
          <div className="space-y-5 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase">
              <UserCheck className="w-3.5 h-3.5" />
              Duelist Matched
            </div>

            {/* Duelist Face-off Card */}
            <div className="bg-[#111927] border border-[#22334d] p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-center gap-6">
                {/* User */}
                <div className="flex flex-col items-center">
                  <Avatar
                    src={effectiveUser?.avatar}
                    name={effectiveUser?.name}
                    size="xl"
                    className="border-2 border-[#0df2c9] shadow-md shadow-[#0df2c9]/20"
                  />
                  <span className="text-xs font-bold text-white mt-1.5 max-w-[90px] truncate">{effectiveUser?.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">You</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#1b273a] border border-[#2e4363] flex items-center justify-center text-amber-400 font-black text-xs">
                  VS
                </div>

                {/* Opponent */}
                <div className="flex flex-col items-center">
                  <Avatar
                    src={selectedOpponent.avatar}
                    name={selectedOpponent.name}
                    size="xl"
                    className="border-2 border-[#8b5cf6] shadow-md shadow-[#8b5cf6]/20"
                  />
                  <span className="text-xs font-bold text-white mt-1.5 max-w-[90px] truncate">{selectedOpponent.name}</span>
                  <span className="text-[10px] text-[#8b5cf6] font-mono">Lvl {selectedOpponent.level}</span>
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1b273a] text-center">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Subject</div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">{selectedOpponent.subject.split(':')[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Win Rate</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{selectedOpponent.winRate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Tier</div>
                  <div className="text-xs font-bold text-[#8b5cf6] mt-0.5">{selectedOpponent.tier.split(' ')[0]}</div>
                </div>
              </div>
            </div>

            {/* Starting In Counter */}
            <div className="pt-2">
              <button
                onClick={handleStartBattle}
                className="w-full py-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Entering Arena ({countdown}s)...</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
