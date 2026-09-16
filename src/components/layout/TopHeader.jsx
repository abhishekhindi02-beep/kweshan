import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Menu, User, BookOpen, FileText, X, ChevronDown, LogOut, Plus, Check } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

export default function TopHeader({ onOpenMobile }) {
  const { currentUser, user, logout } = useAuth();
  const effectiveUser = currentUser || user || { 
    id: 'user_1',
    name: 'Abhishek Hindi', 
    handle: '@abhishek',
    username: 'abhishek',
    institution: 'Academic Scholar Guild',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' 
  };
  const { subjects, globalSearch } = useGame();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ subjects: [], questions: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const res = globalSearch ? globalSearch(query) : { subjects: [], questions: [] };
      setResults(res);
      setIsOpen(true);
    } else {
      setResults({ subjects: [], questions: [] });
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

  const hasResults = results.subjects?.length > 0 || results.questions?.length > 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090d16]/90 backdrop-blur-md border-b border-[#162035] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#131b2e] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Repository Search Field */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects, questions, notes..."
              className="w-full pl-10 pr-9 py-2 bg-[#101726]/90 border border-[#1e293b] focus:border-[#0df2c9]/60 rounded-full text-xs sm:text-sm text-white placeholder-[#64748b] focus:outline-none transition-all focus:ring-1 focus:ring-[#0df2c9]/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-[#64748b] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#101726] border border-[#1f2d47] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              {hasResults ? (
                <div className="p-3 space-y-3">
                  {/* Matching Subjects */}
                  {results.subjects?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-[#0df2c9]" /> Subjects
                      </div>
                      <div className="space-y-1">
                        {results.subjects.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              navigate(`/subjects/${s.id}`);
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="p-2 rounded-xl hover:bg-[#152037] flex items-center justify-between cursor-pointer group"
                          >
                            <span className="text-xs font-semibold text-white group-hover:text-[#0df2c9]">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-[#64748b]">Open Subject</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Questions */}
                  {results.questions?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 mb-1 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-[#38bdf8]" /> Questions
                      </div>
                      <div className="space-y-1">
                        {results.questions.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => {
                              navigate(`/subjects/${q.subjectId}/questions/${q.id}`);
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="p-2 rounded-xl hover:bg-[#152037] cursor-pointer group"
                          >
                            <div className="text-xs font-semibold text-white group-hover:text-[#0df2c9] line-clamp-1">
                              {q.questionText}
                            </div>
                            <div className="text-[10px] text-[#64748b] flex items-center gap-2 mt-0.5">
                              <span>{q.subjectName || 'Subject'}</span>
                              <span>•</span>
                              <span>{q.topic || 'Concept'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#94a3b8]">
                  No subjects or questions found matching "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right User Bar & Quick Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (subjects.length > 0) {
              navigate(`/subjects/${subjects[0].id}/questions/new`);
            } else {
              navigate('/subjects');
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#0df2c9] hover:text-white border border-[#0df2c9]/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Question</span>
        </button>

        {/* Profile Menu Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl hover:bg-[#131b2e] border border-transparent hover:border-[#1e293b] transition-all cursor-pointer"
          >
            <Avatar src={effectiveUser.avatar} alt={effectiveUser.name} size="sm" />
            <span className="hidden md:block text-xs font-bold text-white max-w-[100px] truncate">
              {effectiveUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-[#64748b]" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#101726] border border-[#1f2d47] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
              {/* Active Profile Info */}
              <div className="px-3 py-2.5 border-b border-[#1c273e]">
                <div className="text-xs font-bold text-white truncate">{effectiveUser.name}</div>
                <div className="text-[11px] text-[#0df2c9] font-mono">{effectiveUser.handle || `@${effectiveUser.username || 'user'}`}</div>
                <div className="text-[10px] text-[#64748b] truncate mt-0.5">{effectiveUser.institution || 'Academic Scholar Guild'}</div>
              </div>

              {/* Links */}
              <div className="pt-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-white hover:bg-[#131b2e] transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Preferences</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
