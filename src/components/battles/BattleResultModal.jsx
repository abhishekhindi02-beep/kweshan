import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, Zap, RotateCcw, Check, Flame, ArrowRight } from 'lucide-react';
import Modal from '../common/Modal';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

export default function BattleResultModal({ result, onClose }) {
  const { startBattleWith } = useGame();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (result && result.result === 'victory') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe confetti fallback
      }
    }
  }, [result]);

  if (!result || !result.battle) return null;

  const isVictory = result.result === 'victory';
  const battle = result.battle;
  const dpChange = isVictory ? battle.dpReward : -battle.dpLoss;

  const handleRematch = () => {
    onClose();
    startBattleWith(battle.opponentId, battle.deckId, `${battle.subject} Rematch`);
  };

  return (
    <Modal
      isOpen={!!result}
      onClose={onClose}
      maxWidth="max-w-lg"
      showClose={false}
    >
      <div className="text-center py-4 space-y-6">
        {/* Victory/Defeat Emblem */}
        <div className="flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 border ${
              isVictory
                ? 'bg-[#00f59b]/15 border-[#00f59b]/40 text-[#00f59b] mint-glow'
                : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]'
            }`}
          >
            {isVictory ? <Trophy className="w-10 h-10" /> : <Swords className="w-10 h-10" />}
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            {isVictory ? 'Victory Achieved!' : 'Match Defeat'}
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            {isVictory
              ? `You outmatched ${battle.opponentName} in ${battle.subject}.`
              : `${battle.opponentName} claimed the victory in this sudden death contest.`}
          </p>
        </div>

        {/* DP & Score Card */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#090d16] border border-[#1a253d]">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Final Score</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {battle.userScore} - {battle.opponentScore}
            </div>
          </div>

          <div className="border-x border-[#1a253d]">
            <div className="text-[10px] font-mono uppercase text-[#64748b]">DP Delta</div>
            <div
              className={`text-xl font-extrabold font-mono mt-1 ${
                dpChange >= 0 ? 'text-[#00f59b]' : 'text-[#ef4444]'
              }`}
            >
              {dpChange >= 0 ? `+${dpChange}` : dpChange} DP
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Streak</div>
            <div className="text-xl font-extrabold text-[#fbbf24] flex items-center justify-center gap-1 mt-1">
              <Flame className="w-4 h-4 fill-[#fbbf24]" />
              <span>{currentUser.streak || 7}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRematch}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#1f2d47] text-white hover:bg-[#131b2e] text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4 text-[#8b5cf6]" />
            <span>Rematch</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#00f59b] text-[#090d16] font-extrabold text-xs mint-glow active:scale-95 transition-all"
          >
            <span>Back to Battles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
