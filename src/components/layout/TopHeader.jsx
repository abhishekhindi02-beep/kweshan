import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Zap, Menu, User, BookOpen, HelpCircle, Swords, X, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export default function TopHeader({ onOpenMobile }) {
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || { name: 'Scholar', dp: 1840, streak: 7, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };
  const { globalSearch, setAnalyticsQuestionId } = useGame();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ players: [], questions: [], decks: [] });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const res = globalSearch(query);
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
              placeholder="Search arenas, questions, players..."
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
                        <User className="w-3 h-3" /> Players
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
                              <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
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
                  No arenas, questions, or players found for "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: DP Pill Badge & Avatar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131b2e] border border-amber-500/30 text-amber-400">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span className="text-xs font-bold font-mono">{effectiveUser.streak || 7}d</span>
        </div>

        {/* DP Pill Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131b2e] border border-[#1f2d47] text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.15)]">
          <Zap className="w-3.5 h-3.5 fill-[#0df2c9]" />
          <span className="text-xs font-extrabold font-mono tracking-tight text-white">
            {effectiveUser.dp ? effectiveUser.dp.toLocaleString() : '1,840'}
          </span>
          <span className="text-[10px] font-mono uppercase text-[#0df2c9] font-bold">DP</span>
        </div>

        {/* User Avatar -> Profile Route */}
        <Link
          to={`/profile/${effectiveUser.id || 'usr-1'}`}
          className="relative group p-0.5 rounded-full transition-transform active:scale-95"
          title="View Scholar Profile"
        >
          <img
            src={effectiveUser.avatar}
            alt={effectiveUser.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#2a3b5c] group-hover:border-[#0df2c9] transition-colors"
          />
        </Link>
      </div>
    </header>
  );
}
