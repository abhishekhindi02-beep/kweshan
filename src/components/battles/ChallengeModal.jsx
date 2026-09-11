import React, { useState, useEffect } from 'react';
import { Swords, Search, User, Zap, BookOpen } from 'lucide-react';
import Modal from '../common/Modal';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

export default function ChallengeModal({ isOpen, onClose, targetUser, initialOpponentId }) {
  const { friends, decks, startBattleWith } = useGame();
  const { allUsers } = useAuth();

  const [selectedOpponentId, setSelectedOpponentId] = useState('user_2');
  const [selectedDeckId, setSelectedDeckId] = useState('deck_1');
  const [format, setFormat] = useState('standard'); // 'standard' (5 rounds), 'sudden_death' (3 rounds)
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      const defaultOpponent = targetUser?.id || initialOpponentId || friends[0]?.id || friends[0]?.userId || allUsers[1]?.id || 'user_2';
      setSelectedOpponentId(defaultOpponent);
      setSelectedDeckId(decks[0]?.id || 'deck_1');
      setSearchFilter('');
    }
  }, [isOpen, targetUser, initialOpponentId, friends, allUsers, decks]);

  if (!isOpen) return null;

  const selectableUsers = (allUsers || []).filter((u) =>
    u.name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSendChallenge = () => {
    const deck = decks.find((d) => d.id === selectedDeckId) || decks[0];
    startBattleWith(selectedOpponentId, selectedDeckId, deck ? deck.title : 'Academic Duel');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Challenge to Battle"
      subtitle="Dispatch a 5-round academic duel request"
    >
      <div className="space-y-5">
        {/* Step 1: Select Opponent */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#94a3b8] mb-2 font-bold">
            1. Select Opponent
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 w-3.5 h-3.5 text-[#64748b]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter study circle or search duelist..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#090d16] border border-[#1c273e] focus:border-[#0df2c9]/50 rounded-xl text-xs text-white placeholder-[#64748b] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
            {selectableUsers.slice(0, 6).map((u) => {
              const isSelected = selectedOpponentId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedOpponentId(u.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0df2c9]/15 border-[#0df2c9] text-white'
                      : 'bg-[#101726] border-[#1c273e] text-[#94a3b8] hover:text-white hover:border-[#2a3b5c]'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{u.name}</div>
                    <div className="text-[10px] font-mono text-[#64748b]">Lvl {u.level || 1}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject Deck */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#94a3b8] mb-2 font-bold">
            2. Choose Arena / Deck
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
            {decks.map((deck) => {
              const isSelected = selectedDeckId === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0df2c9]/15 border-[#0df2c9] text-white'
                      : 'bg-[#101726] border-[#1c273e] text-[#94a3b8] hover:text-white hover:border-[#2a3b5c]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{deck.title}</div>
                    <div className="text-[10px] text-[#64748b] truncate">{deck.subtitle || deck.description}</div>
                  </div>
                  <div className="text-xs font-bold font-mono text-[#0df2c9]">{deck.progress || deck.mastery || 0}%</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Format */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#94a3b8] mb-2 font-bold">
            3. Battle Stakes
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('standard')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                format === 'standard' ? 'bg-[#131b2e] border-[#0df2c9] text-white' : 'bg-[#101726] border-[#1c273e] text-[#64748b]'
              }`}
            >
              <div className="text-xs font-bold text-white">Standard Duel</div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">5 Rounds • +120 DP Reward</div>
            </button>
            <button
              onClick={() => setFormat('sudden_death')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                format === 'sudden_death' ? 'bg-[#131b2e] border-[#8b5cf6] text-white' : 'bg-[#101726] border-[#1c273e] text-[#64748b]'
              }`}
            >
              <div className="text-xs font-bold text-white">Sudden Death</div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">Speed Stakes • +180 DP Reward</div>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c273e]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#1f2d47] text-[#94a3b8] hover:text-white hover:bg-[#131b2e] text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSendChallenge}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-black text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-[#0df2c9]/20 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Dispatch Challenge</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
