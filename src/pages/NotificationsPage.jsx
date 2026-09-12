import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Swords, Award, Sparkles, Flame, CheckCircle, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import Badge from '../components/common/Badge';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage({ onNavigate, onStartBattle }) {
  const navigate = useNavigate();
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    decks,
    friends,
    battles,
    startBattleWith,
    playDailyLightning
  } = useGame();
  const { showToast } = useToast();

  const [filter, setFilter] = useState('all'); // all, unread

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    showToast('All notifications marked as read', 'info');
  };

  const handleAction = (notif) => {
    markNotificationAsRead(notif.id);

    const titleLower = (notif.title || '').toLowerCase();
    const msgLower = (notif.message || '').toLowerCase();
    const type = notif.type || '';

    // Check if it's a battle, duel, or challenge alert
    const isBattleAlert = 
      type === 'battle' || 
      type === 'battle_challenge' || 
      type === 'battle_invite' || 
      type === 'challenge_dispatched' ||
      titleLower.includes('challenge') || 
      titleLower.includes('duel') || 
      titleLower.includes('battle') ||
      msgLower.includes('challenged') || 
      msgLower.includes('duel') ||
      msgLower.includes('vs');

    if (isBattleAlert) {
      // 1. Resolve deck
      let matchedDeck = null;
      if (notif.metadata?.deckId) {
        matchedDeck = (decks || []).find((d) => d.id === notif.metadata.deckId);
      }
      if (!matchedDeck && notif.message) {
        matchedDeck = (decks || []).find((d) => 
          msgLower.includes((d.title || '').toLowerCase()) || 
          (d.subject && msgLower.includes((d.subject || '').toLowerCase()))
        );
      }
      if (!matchedDeck) {
        matchedDeck = (decks || [])[0] || { id: 'deck_1', title: 'Academic Duel' };
      }

      // 2. Resolve opponent info
      let opponentName = notif.metadata?.challengerName || notif.metadata?.opponentName;
      let opponentAvatar = notif.metadata?.challengerAvatar || notif.metadata?.opponentAvatar;
      let opponentId = notif.metadata?.challengerId || notif.metadata?.opponentId;
      let opponentRank = notif.metadata?.opponentRank || 'Master Duelist';
      let opponentLevel = notif.metadata?.opponentLevel || 12;

      if (!opponentName && notif.message) {
        const matchedFriend = (friends || []).find((f) => msgLower.includes(f.name.toLowerCase()));
        if (matchedFriend) {
          opponentName = matchedFriend.name;
          opponentAvatar = matchedFriend.avatar;
          opponentId = matchedFriend.id;
          opponentRank = matchedFriend.rank || opponentRank;
          opponentLevel = matchedFriend.level || opponentLevel;
        } else {
          const challengeMatch = notif.message.match(/^([^]+?)\s+challenged\s+you/i);
          if (challengeMatch && challengeMatch[1]) {
            opponentName = challengeMatch[1].trim();
          }
        }
      }

      opponentName = opponentName || 'Alfonso Lubin';

      showToast(`Entering battle arena against ${opponentName}!`, 'success');

      // 3. Trigger Battle Launch
      if (typeof onStartBattle === 'function') {
        onStartBattle(matchedDeck.id, {
          opponentId,
          opponentName,
          opponentAvatar: opponentAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          opponentRank,
          opponentLevel,
          subject: matchedDeck.title || 'Academic Face-Off'
        });
      } else if (typeof startBattleWith === 'function') {
        startBattleWith(opponentId || 'user_2', matchedDeck.id, matchedDeck.title || 'Academic Duel');
      }
      return;
    }

    // Check if it's Lightning Arena event
    const isLightning = 
      type === 'lightning' || 
      type === 'daily_lightning' || 
      titleLower.includes('lightning') || 
      msgLower.includes('lightning');

    if (isLightning) {
      if (typeof playDailyLightning === 'function') {
        playDailyLightning();
      } else {
        navigate('/');
      }
      return;
    }

    // Check if it's Question / Review / Reward notification
    const isQuestionAlert = 
      type === 'reward' || 
      type === 'question_approved' || 
      type === 'review_request' || 
      type === 'question' ||
      titleLower.includes('question') ||
      msgLower.includes('question');

    if (isQuestionAlert) {
      navigate('/questions');
      return;
    }

    // Fallback navigation or toast
    if (notif.link) {
      navigate(notif.link);
    } else if (typeof onNavigate === 'function') {
      onNavigate(notif.type);
    } else {
      showToast(notif.message, 'info');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'battle':
      case 'battle_challenge':
      case 'battle_invite':
        return <Swords className="w-5 h-5 text-[#0df2c9]" />;
      case 'question_approved':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'dp_earned':
      case 'reward':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'streak_milestone':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'lightning':
      case 'event':
        return <Zap className="w-5 h-5 text-[#0df2c9]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#8b5cf6]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#0df2c9]" />
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay updated with battle challenges, quality review verdicts, and distinction milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-[#1b273a] hover:bg-[#25354e] text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-[#2e4363] self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#0df2c9]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#22334d] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#0df2c9] text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-[#0df2c9] text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No notifications</h3>
          <p className="text-xs text-slate-400">
            {filter === 'unread' ? "You've read all your alerts!" : 'No recent notifications recorded.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'bg-[#111927] border-[#0df2c9]/40 shadow-sm shadow-[#0df2c9]/5'
                  : 'bg-[#0b101b] border-[#22334d]/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#1b273a] border border-[#2e4363] flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#0df2c9] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono inline-block pt-1">
                    {notif.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(notif)}
                  className="px-3 py-1.5 bg-[#0df2c9]/15 hover:bg-[#0df2c9] text-[#0df2c9] hover:text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-[#0df2c9]/30"
                >
                  Action
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
