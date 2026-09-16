import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Layers,
  FileText,
  User,
  Moon,
  Sun,
  LogOut,
  FolderPlus,
  Plus,
  ChevronRight,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { currentUser, user, logout } = useAuth();
  const effectiveUser = currentUser || user || { 
    name: 'Scholar', 
    handle: '@scholar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' 
  };
  const { subjects, questions } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/subjects', label: 'Subjects', icon: Layers, count: subjects.length },
    { to: '/questions', label: 'My Questions', icon: FileText, count: questions.length },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[270px] bg-[#0d121f] border-r border-[#19233a] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#162035]">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0df2c9] to-[#00bfa5] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#0df2c9]/20 group-hover:scale-105 transition-transform">
                K
              </div>
              <div>
                <span className="text-lg font-extrabold text-white tracking-tight group-hover:text-[#0df2c9] transition-colors block leading-none">
                  Kweshun
                </span>
                <span className="text-[10px] font-semibold text-[#64748b] tracking-wider uppercase block mt-1">
                  Question Repository
                </span>
              </div>
            </Link>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a233a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Question Action */}
          <div className="p-4 pb-2">
            <button
              onClick={() => {
                onCloseMobile();
                if (subjects.length > 0) {
                  navigate(`/subjects/${subjects[0].id}/questions/new`);
                } else {
                  navigate('/subjects');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-xs shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Question</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 pt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#121c2e] text-[#0df2c9] font-semibold border-l-2 border-[#0df2c9]'
                        : 'text-[#94a3b8] hover:bg-[#131b2e] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#0df2c9]' : 'text-[#64748b]'}`} />
                        <span>{item.label}</span>
                      </div>

                      {typeof item.count === 'number' && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-[#0df2c9]/15 text-[#0df2c9]'
                            : 'bg-[#1a2438] text-[#64748b]'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Footer Section */}
        <div className="p-4 border-t border-[#162035] space-y-3">
          {/* Quick User Badge */}
          <Link
            to="/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#131b2e] transition-colors group cursor-pointer"
          >
            <Avatar src={effectiveUser.avatar} alt={effectiveUser.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-[#0df2c9] transition-colors truncate">
                {effectiveUser.name}
              </div>
              <div className="text-[10px] text-[#64748b] truncate">
                {effectiveUser.handle || `@${effectiveUser.username || 'user'}`}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-white" />
          </Link>

          {/* Theme & Logout Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#141d30]">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#131b2e] transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
