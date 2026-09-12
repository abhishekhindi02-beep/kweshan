import React, { useState } from 'react';
import { Users, Swords, UserPlus, Search, CheckCircle2, Flame, Trophy, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import dataStore from '../../services/dataStore';

export default function InviteFriendModal({ isOpen, onClose, onChallengePeer }) {
  const { friends, decks, startBattleWith } = useGame();
  const { allUsers, currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  if (!isOpen) return null;

  // Filter out the current logged-in user
  const effectiveUserId = currentUser?.id || 'user_1';
  const peerList = (allUsers || []).filter((u) => u.id !== effectiveUserId);

  const filteredPeers = peerList.filter((peer) => {
    const matchesSearch =
      peer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.tier?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === 'all' ||
      peer.subject?.toLowerCase().includes(selectedSubject.toLowerCase());

    return matchesSearch && matchesSubject;
  });

  const isFriend = (peerId) => friends.some((f) => f.id === peerId);

  const handleConnect = (peer) => {
    if (isFriend(peer.id)) return;

    const newFriend = {
      id: peer.id,
      name: peer.name,
      username: peer.username,
      handle: peer.handle || `@${peer.username}`,
      avatar: peer.avatar,
      level: peer.level || 12,
      onlineStatus: 'online',
      subject: peer.subject || 'STEM General',
      relationshipTag: peer.relationshipTag || 'Guild Mate',
      rank: peer.tier || peer.rank || 'Master Duelist',
      dp: peer.dp || 2600,
      streak: peer.streak || 5,
      winRate: peer.winRate || '75%',
      difficulty: peer.difficulty || 'medium',
      personality: peer.personality || 'Tactical Scholar'
    };

    if (!dataStore.friends.some((f) => f.id === newFriend.id)) {
      dataStore.friends.push(newFriend);
    }

    dataStore.addActivity(
      effectiveUserId,
      'friend_connected',
      'Study Circle Expanded',
      `Connected with ${peer.name} (${newFriend.handle}).`,
      '#8b5cf6',
      'Users'
    );

    dataStore.addNotification(effectiveUserId, {
      type: 'friend_accepted',
      category: 'friends',
      title: 'Connection Accepted',
      message: `You are now connected with ${peer.name}.`,
      metadata: { friendId: peer.id }
    });

    dataStore.saveState();
    dataStore.notify();

    showToast(`Connected with ${peer.name}! Added to your study circle.`, 'success');
  };

  const handleChallenge = (peer) => {
    if (onChallengePeer) {
      onClose();
      onChallengePeer(peer);
    } else {
      // Find default deck for peer's subject or deck_1
      const matchedDeck = decks.find((d) => d.title.toLowerCase().includes((peer.subject || '').toLowerCase())) || decks[0];
      startBattleWith(peer.id, matchedDeck.id, matchedDeck.title, 'standard');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite & Challenge Available Peers"
      subtitle="Select a scholar from the active network to duel or connect"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#111927] via-[#162032] to-[#111927] border border-[#22334d] p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0df2c9]/15 border border-[#0df2c9]/30 flex items-center justify-center text-[#0df2c9] flex-shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Peer Academic Directory</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch an academic duel or recruit verified scholars into your study circle.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0df2c9]/10 border border-[#0df2c9]/30 text-[#0df2c9] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>9 Scholars Available</span>
          </div>
        </div>

        {/* Search & Discipline Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject, or tier..."
              className="w-full bg-[#111927] border border-[#22334d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Physics', 'Calculus', 'Chemistry', 'Biology'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-[#0df2c9] text-slate-950'
                    : 'bg-[#111927] border border-[#22334d] text-slate-400 hover:text-white'
                }`}
              >
                {subj === 'all' ? 'All Disciplines' : subj}
              </button>
            ))}
          </div>
        </div>

        {/* Available Peers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredPeers.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-400 text-xs">
              No matching peers found for "{searchQuery}".
            </div>
          ) : (
            filteredPeers.map((peer) => {
              const connected = isFriend(peer.id);
              const winRate = peer.winRate || `${Math.round((peer.wins / (peer.totalBattles || 1)) * 100)}%`;

              return (
                <div
                  key={peer.id}
                  className="p-4 rounded-2xl bg-[#0b101b] border border-[#22334d] hover:border-[#0df2c9]/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={peer.avatar}
                          name={peer.name}
                          size="lg"
                          showStatus={true}
                          status="online"
                          className="group-hover:border-[#0df2c9] transition-colors"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#0df2c9] transition-colors">
                            {peer.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">Lvl {peer.level || 10}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {peer.subject || 'STEM General'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant={peer.tier?.toLowerCase().includes('apex') || peer.tier?.toLowerCase().includes('grandmaster') ? 'mint' : 'purple'}>
                            {peer.tier || 'Scholar'}
                          </Badge>
                          {peer.personality && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {peer.personality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-[#111927] border border-[#1b273a] text-center text-[11px]">
                    <div>
                      <div className="text-[9px] font-mono uppercase text-slate-400">DP</div>
                      <div className="text-white font-bold font-mono">{peer.dp?.toLocaleString()}</div>
                    </div>
                    <div className="border-x border-[#1b273a]">
                      <div className="text-[9px] font-mono uppercase text-slate-400">Streak</div>
                      <div className="text-amber-400 font-bold font-mono flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        {peer.streak || 3}d
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono uppercase text-slate-400">Win Rate</div>
                      <div className="text-emerald-400 font-bold font-mono">{winRate}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleChallenge(peer)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] hover:shadow-md hover:shadow-[#0df2c9]/20 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Challenge</span>
                    </button>

                    <button
                      onClick={() => handleConnect(peer)}
                      disabled={connected}
                      className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                        connected
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                          : 'bg-[#1b273a] hover:bg-[#22334d] border-[#22334d] text-slate-200 hover:text-white active:scale-95'
                      }`}
                    >
                      {connected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 text-[#0df2c9]" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
