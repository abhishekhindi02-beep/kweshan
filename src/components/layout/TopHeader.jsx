import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Zap, Menu, User, BookOpen, HelpCircle, Swords, X, Flame, ChevronDown, LogOut, Check } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export default function TopHeader({ onOpenMobile }) {
  const { currentUser, user, allUsers, switchUser, logout } = useAuth();
  const effectiveUser = currentUser || user || { 
    id: 'user_1',
    name: 'Dr. Elena Rostova', 
    dp: 2840, 
    streak: 7, 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' 
  };
  const { globalSearch } = useGame();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ players: [], questions: [], decks: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const res = globalSearch ? globalSearch(query) : { players: [], questions: [], decks: [] };
      setResults(res);
      setIsOpen(true);
    } else {
      setResults({ players: [], questions: [], decks: [] });
      setIsOpen(false);
    }
  }, [query, globalSearch]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results.players?.length > 0 || results.questions?.length > 0 || results.decks?.length > 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090d16]/85 backdrop-blur-md border-b border-[#162035] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#131b2e] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Field */}
        <div ref={searchRef} className="relative w-full max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search arenas, questions, scholars..."
              className="w-full pl-10 pr-9 py-2 bg-[#101726]/90 border border-[#1e293b] focus:border-[#0df2c9]/60 rounded-full text-xs sm:text-sm text-white placeholder-[#64748b] focus:outline-none transition-all focus:ring-1 focus:ring-[#0df2c9]/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-[#64748b] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#101726] border border-[#1f2d47] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {hasResults ? (
                <div className="p-3 space-y-4">
                  {results.players?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Scholars
                      </div>
                      <div className="space-y-1">
                        {results.players.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              navigate(`/profile/${p.id}`);
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1a233a] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Avatar src={p.avatar} name={p.name} size="xs" />
                              <div>
                                <div className="text-xs font-semibold text-white">{p.name}</div>
                                <div className="text-[10px] text-[#64748b] font-mono">{p.handle || `@${p.username}`}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-[#0df2c9] bg-[#0df2c9]/10 px-2 py-0.5 rounded-full font-bold">
                              {p.dp?.toLocaleString()} DP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.decks?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Decks
                      </div>
                      <div className="space-y-1">
                        {results.decks.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              navigate('/decks');
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1a233a] cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-semibold text-white">{d.title}</div>
                              <div className="text-[10px] text-[#94a3b8]">{d.subtitle || d.description}</div>
                            </div>
                            <span className="text-xs font-bold text-[#0df2c9]">{d.mastery || d.progress || 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.questions?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 mb-1.5 flex items-center gap-1.5">
                        <HelpCircle className="w-3 h-3" /> Questions
                      </div>
                      <div className="space-y-1">
                        {results.questions.slice(0, 4).map((q) => (
                          <div
                            key={q.id}
                            onClick={() => {
                              navigate('/questions');
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="p-2 rounded-xl hover:bg-[#1a233a] cursor-pointer transition-colors"
                          >
                            <div className="text-xs font-medium text-white truncate">{q.topic || q.deckName}</div>
                            <div className="text-[11px] text-[#64748b] truncate mt-0.5">{q.text || q.prompt}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#64748b]">
                  No arenas, questions, or scholars found for "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: DP Pill Badge & Avatar Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131b2e] border border-amber-500/30 text-amber-400">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-xs font-bold font-mono">{effectiveUser.streak ?? 0}d</span>
        </div>

        {/* DP Pill Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131b2e] border border-[#1f2d47] text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.15)]">
          <Zap className="w-3.5 h-3.5 fill-[#0df2c9]" />
          <span className="text-xs font-extrabold font-mono tracking-tight text-white">
            {typeof effectiveUser.dp === 'number' ? effectiveUser.dp.toLocaleString() : '0'}
          </span>
          <span className="text-[10px] font-mono uppercase text-[#0df2c9] font-bold">DP</span>
        </div>

        {/* User Avatar with Profile Dropdown Menu */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#131b2e] transition-colors cursor-pointer group"
          >
            <Avatar
              src={effectiveUser.avatar}
              name={effectiveUser.name}
              size="sm"
              className="group-hover:border-[#0df2c9] transition-colors"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#101726] border border-[#1f2d47] rounded-2xl shadow-2xl p-3 z-50 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-3 p-2 bg-[#090d16] rounded-xl border border-[#18233a]">
                <Avatar src={effectiveUser.avatar} name={effectiveUser.name} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{effectiveUser.name}</div>
                  <div className="text-[10px] font-mono text-[#0df2c9] truncate">
                    {effectiveUser.tier || 'Scholar'} • {effectiveUser.dp} DP
                  </div>
                </div>
              </div>

              {/* Demo Accounts Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 py-1 flex items-center justify-between">
                  <span>Switch Scholar Profile</span>
                  <span className="text-[#0df2c9] font-bold">5 Demos</span>
                </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                  {(allUsers || []).map((u) => {
                    const isActive = u.id === effectiveUser.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#0df2c9]/20 text-[#0df2c9] font-bold border border-[#0df2c9]/40'
                            : 'text-slate-300 hover:bg-[#1a233a] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar src={u.avatar} name={u.name} size="xs" />
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{u.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{u.tier || 'Scholar'}</div>
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#0df2c9] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#18233a] space-y-1">
                <Link
                  to={`/profile/${effectiveUser.id || 'usr-1'}`}
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#1a233a] flex items-center gap-2 font-semibold transition-colors"
                >
                  <User className="w-4 h-4 text-[#0df2c9]" />
                  <span>My Profile & Stats</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
