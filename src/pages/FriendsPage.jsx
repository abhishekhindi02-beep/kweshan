import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, UserCheck, Inbox, Sparkles, Swords } from 'lucide-react';
import FriendCard from '../components/friends/FriendCard';
import FriendRequestCard from '../components/friends/FriendRequestCard';
import InviteFriendModal from '../components/friends/InviteFriendModal';
import ChallengeModal from '../components/battles/ChallengeModal';
import Badge from '../components/common/Badge';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

export default function FriendsPage() {
  const { friends, friendRequests, acceptFriendRequest, declineFriendRequest, removeFriend } = useGame();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [challengeFriend, setChallengeFriend] = useState(null);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.handle?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q) ||
        f.subject?.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return friendRequests;
    const q = searchQuery.toLowerCase();
    return friendRequests.filter(
      (r) =>
        (r.name || r.senderName)?.toLowerCase().includes(q) ||
        (r.handle || r.username)?.toLowerCase().includes(q) ||
        (r.message || r.senderBio)?.toLowerCase().includes(q)
    );
  }, [friendRequests, searchQuery]);

  const handleAcceptRequest = (reqId) => {
    acceptFriendRequest(reqId);
  };

  const handleDeclineRequest = (reqId) => {
    declineFriendRequest(reqId);
  };

  const handleRemoveFriend = (friendId) => {
    removeFriend(friendId);
  };

  const handleChallenge = (friend) => {
    setChallengeFriend(friend);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#0df2c9]" />
            Peer Academic Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect with classmates, challenge peers to battles, and build your study circle.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 active:scale-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>Invite Peers (+50 DP)</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#22334d] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#0df2c9] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>All Connections ({friends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#0df2c9] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Pending Requests ({friendRequests.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'friends' ? 'Filter by name or handle...' : 'Filter requests...'}
            className="w-full bg-[#111927] border border-[#22334d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
          />
        </div>
      </div>

      {/* Tab Content: All Connections */}
      {activeTab === 'friends' && (
        <div>
          {filteredFriends.length === 0 ? (
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {searchQuery ? `No connections matching "${searchQuery}"` : 'No study circle connections yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Expand your academic network to challenge classmates and compare rankings.
              </p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-[#0df2c9] text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 mt-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[3]" />
                Browse Available Peers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onChallenge={handleChallenge}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Pending Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3 max-w-2xl">
          {filteredRequests.length === 0 ? (
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-12 text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">
                {searchQuery ? `No requests matching "${searchQuery}"` : 'No pending friend requests'}
              </h3>
              <p className="text-xs text-slate-400">
                You're completely up to date with your network invitations.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <FriendRequestCard
                key={req.id}
                request={req}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            ))
          )}
        </div>
      )}

      {/* Invite & Peer Directory Modal */}
      <InviteFriendModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onChallengePeer={(peer) => setChallengeFriend(peer)}
      />

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={Boolean(challengeFriend)}
        onClose={() => setChallengeFriend(null)}
        initialOpponentId={challengeFriend?.id}
        targetUser={challengeFriend}
      />
    </div>
  );
}
