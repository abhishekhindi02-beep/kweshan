import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Building, FileText, Layers, Moon, Sun, 
  LogOut, Check, Sparkles, Users, Edit3, Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, user, allUsers, switchUser, updateUser, logout } = useAuth();
  const { subjects, questions, stats } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();

  const effectiveUser = currentUser || user || {
    id: 'user_1',
    name: 'Dr. Elena Rostova',
    username: 'elena_r',
    email: 'elena@kweshun.edu',
    institution: 'MIT • Theoretical Physics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(effectiveUser.name || '');
  const [institution, setInstitution] = useState(effectiveUser.institution || '');
  const [bio, setBio] = useState(effectiveUser.bio || '');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({
        name: name.trim(),
        institution: institution.trim(),
        bio: bio.trim()
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Curator Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
          Manage your personal information, active academic persona, and repository preferences
        </p>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            src={effectiveUser.avatar}
            alt={effectiveUser.name}
            size="xl"
            className="ring-4 ring-[#0df2c9]/30 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {effectiveUser.name}
                </h2>
                <span className="text-xs sm:text-sm text-[#0df2c9] font-mono font-medium">
                  {effectiveUser.handle || `@${effectiveUser.username || 'scholar'}`}
                </span>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#cbd5e1] hover:text-white text-xs font-semibold border border-[#223252] transition-colors cursor-pointer self-center sm:self-start"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#94a3b8] flex items-center justify-center sm:justify-start gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#64748b]" />
              <span>{effectiveUser.institution || 'Academic Scholar Guild'}</span>
            </p>

            <p className="text-xs sm:text-sm text-[#94a3b8] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#64748b]" />
              <span>{effectiveUser.email || `${effectiveUser.username || 'scholar'}@kweshun.edu`}</span>
            </p>

            {effectiveUser.bio && (
              <p className="text-xs sm:text-sm text-[#cbd5e1] pt-2 border-t border-[#1a253c] leading-relaxed">
                {effectiveUser.bio}
              </p>
            )}
          </div>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#1c273e] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                  Institution / Guild
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Bio / Specialization
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-xl bg-[#152037] text-xs font-semibold text-[#94a3b8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl bg-[#0df2c9] text-slate-950 text-xs font-bold shadow-md shadow-[#0df2c9]/20"
              >
                Save Details
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User's Isolated Repository Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Total Subjects</span>
          <div className="text-2xl font-black text-white mt-1">{subjects.length}</div>
          <p className="text-xs text-[#94a3b8] mt-0.5">Categorized subject domains</p>
        </div>

        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Authored Questions</span>
          <div className="text-2xl font-black text-white mt-1">{questions.length}</div>
          <p className="text-xs text-[#94a3b8] mt-0.5">Stored long-form questions</p>
        </div>

        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Account Status</span>
          <div className="text-lg font-bold text-[#0df2c9] mt-1.5 flex items-center justify-center sm:justify-start gap-1">
            <Shield className="w-4 h-4" />
            <span>Local Vault Active</span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-0.5">Private localStorage sandbox</p>
        </div>
      </div>

      {/* Demo Persona Switcher (Isolated Local Data) */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0df2c9]" />
            <span>Switch Scholar Profile</span>
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Test multi-user isolation by switching between local scholar profiles. Each scholar maintains an independent repository.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(allUsers || []).map((u) => {
            const isSelected = u.id === effectiveUser.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0df2c9]/10 border-[#0df2c9]/50 shadow-sm'
                    : 'bg-[#0f1626] border-[#1f2d47] hover:border-[#2b3d60]'
                }`}
              >
                <Avatar src={u.avatar} alt={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                    <span>{u.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0df2c9]" />}
                  </div>
                  <div className="text-[11px] text-[#94a3b8] truncate">{u.handle || `@${u.username || 'user'}`}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Settings & Sign Out */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#cbd5e1] hover:text-white text-xs font-semibold border border-[#223252] transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
