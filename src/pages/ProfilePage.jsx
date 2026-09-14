import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Award, Flame, Trophy, TrendingUp, Sparkles, 
  BookOpen, ShieldCheck, Edit3, Check, Calendar, School, Zap, Swords, UserPlus, FileText 
} from 'lucide-react';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Avatar from '../components/common/Avatar';
import ChallengeModal from '../components/battles/ChallengeModal';
import QuestionDetailModal from '../components/questions/QuestionDetailModal';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, currentUser, allUsers, updateUser } = useAuth();
  const effectiveCurrentUser = currentUser || user;
  const { questions, battles, sendFriendRequest } = useGame();
  const { showToast } = useToast();

  // Determine if viewing own profile or another player's profile
  const isSelf = !id || id === effectiveCurrentUser?.id;
  const profileUser = isSelf
    ? effectiveCurrentUser
    : (allUsers?.find(u => u.id === id) || {
        id,
        name: 'Scholar Peer',
        handle: '@scholar',
        institution: 'Academic Guild',
        bio: 'Competitive duel scholar and problem solver.',
        dp: 0,
        streak: 0,
        level: 1,
        rank: 'Scholar Tier',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        wins: 0,
        losses: 0,
        totalBattles: 0
      });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profileUser?.name || 'Dr. Elena Rostova');
  const [handle, setHandle] = useState(profileUser?.handle || (profileUser?.username ? `@${profileUser.username}` : '@scholar'));
  const [institution, setInstitution] = useState(profileUser?.institution || 'MIT • Dept of Theoretical Physics');
  const [bio, setBio] = useState(profileUser?.bio || 'Theoretical mechanics buff & differential equations specialist.');
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [viewingDetailQuestion, setViewingDetailQuestion] = useState(null);

  const authoredQuestions = questions.filter(q => q.authorId === profileUser?.id);
  const avgQuality = authoredQuestions.length > 0
    ? Math.round(authoredQuestions.reduce((acc, q) => acc + (q.qualityScores?.composite || q.qualityScore || 85), 0) / authoredQuestions.length)
    : (profileUser?.dp > 0 ? 92 : 0);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({ name, handle, institution, bio });
    setIsEditing(false);
    if (showToast) showToast('Scholar profile updated successfully!', 'success');
  };

  const handleSendFriend = () => {
    sendFriendRequest(profileUser.username || profileUser.name);
  };

  const winRateFormatted = profileUser?.totalBattles > 0
    ? `${Math.round(((profileUser.wins || 0) / profileUser.totalBattles) * 100)}%`
    : '0%';

  const badges = [
    { name: 'Grandmaster Author', desc: 'Authored questions with 90+ quality score', icon: Sparkles, color: 'text-[#0df2c9]', bg: 'bg-[#0df2c9]/10' },
    { name: 'Lightning Master', desc: 'Participated in Daily Lightning Arena', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Scholar Flame', desc: 'Maintained active daily study streak', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { name: 'Distinction Pioneer', desc: 'Ranked in Distinction Leaderboard', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Profile Header Banner */}
      <div className="bg-[#111927] border border-[#22334d] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#0df2c9]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <Avatar
                src={profileUser?.avatar}
                name={profileUser?.name}
                size="xl"
                className="border-2 border-[#0df2c9] shadow-lg shadow-[#0df2c9]/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                {profileUser?.streak ?? 0}d
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{profileUser?.name}</h1>
                <Badge variant="mint">{profileUser?.rank || profileUser?.tier || 'Scholar Tier'}</Badge>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#0df2c9]">
                {profileUser?.handle || (profileUser?.username ? `@${profileUser.username}` : '@scholar')}
              </p>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                {profileUser?.institution || 'Academic Scholar Guild'}
              </p>
              <p className="text-xs text-slate-400 pt-0.5 max-w-md">
                "{profileUser?.bio || 'Competitive scholar on Kweshun.'}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSelf ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#1b273a] hover:bg-[#25354e] text-slate-200 text-xs font-bold rounded-xl border border-[#2e4363] hover:border-[#0df2c9]/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChallengeOpen(true)}
                  className="px-4 py-2 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  Challenge
                </button>
                <button
                  onClick={handleSendFriend}
                  className="px-3.5 py-2 bg-[#1b273a] hover:bg-[#25354e] text-slate-200 text-xs font-bold rounded-xl border border-[#2e4363] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#0df2c9]" />
                  Add Friend
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditing && isSelf && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#1b273a] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0df2c9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Scholar Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0df2c9]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Academic Institution / Department
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0df2c9]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Academic Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0df2c9]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl text-center">
          <div className="text-slate-400 text-xs font-medium">Distinction Points</div>
          <div className="text-2xl font-black font-mono text-[#0df2c9] mt-1">
            {(profileUser?.dp || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {profileUser?.tier || 'Scholar Tier'}
          </div>
        </div>

        <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl text-center">
          <div className="text-slate-400 text-xs font-medium">Win Rate</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {winRateFormatted}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium font-mono">
            {profileUser?.wins || 0}W / {profileUser?.losses || 0}L
          </div>
        </div>

        <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl text-center">
          <div className="text-slate-400 text-xs font-medium">Questions Authored</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{authoredQuestions.length}</div>
          <div className="text-[10px] text-purple-400 font-medium">Long-Form Items</div>
        </div>

        <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl text-center">
          <div className="text-slate-400 text-xs font-medium">Avg Quality Rating</div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">{avgQuality}/100</div>
          <div className="text-[10px] text-slate-500 font-mono">
            {avgQuality >= 90 ? 'Grade A+' : avgQuality >= 80 ? 'Grade A' : 'Grade B'}
          </div>
        </div>
      </div>

      {/* Authored Questions Repository by this user */}
      <div className="bg-[#111927] border border-[#22334d] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0df2c9]" />
            Authored Academic Questions ({authoredQuestions.length})
          </h3>
          {isSelf && (
            <button
              onClick={() => navigate('/questions/new')}
              className="text-xs font-bold text-[#0df2c9] hover:underline cursor-pointer"
            >
              + Author New Question
            </button>
          )}
        </div>

        {authoredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {authoredQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => setViewingDetailQuestion(q)}
                className="p-4 bg-[#0b101b] border border-[#22334d] hover:border-[#0df2c9]/40 rounded-2xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8b5cf6] font-bold uppercase truncate">
                    {q.topic || q.deckName}
                  </span>
                  <Badge variant={q.status === 'Live' ? 'live' : 'pending'} size="xs">
                    {q.status || 'Live'}
                  </Badge>
                </div>
                <p className="text-xs text-white line-clamp-2 group-hover:text-[#0df2c9] transition-colors leading-relaxed">
                  {q.prompt || q.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#0b101b] rounded-2xl border border-[#1b273a]">
            No questions created yet by this scholar.
          </div>
        )}
      </div>

      {/* Academic Honors & Badges */}
      <div className="bg-[#111927] border border-[#22334d] rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Academic Honors & Distinction Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="bg-[#0b101b] border border-[#22334d] p-4 rounded-2xl flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl ${b.bg} ${b.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{b.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
      />

      <QuestionDetailModal
        isOpen={Boolean(viewingDetailQuestion)}
        onClose={() => setViewingDetailQuestion(null)}
        question={viewingDetailQuestion}
      />
    </div>
  );
}
