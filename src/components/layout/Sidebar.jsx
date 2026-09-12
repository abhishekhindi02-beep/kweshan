import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  FileEdit,
  Swords,
  Users,
  Trophy,
  Bell,
  BookOpen,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { currentUser, user, switchUser, allUsers, logout } = useAuth();
  const effectiveUser = currentUser || user || { name: 'Scholar', level: 1, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' };
  const { unreadNotificationsCount } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/questions', label: 'My Questions', icon: FileEdit },
    { to: '/battles', label: 'Battles', icon: Swords },
    { to: '/decks', label: 'Decks', icon: BookOpen },
    { to: '/friends', label: 'Friends', icon: Users },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount }
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
              <span className="text-lg font-extrabold text-white tracking-tight group-hover:text-[#0df2c9] transition-colors">
                Kweshun
              </span>
            </Link>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a233a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with NavLink */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#152037] text-[#0df2c9] border border-[#0df2c9]/30 font-semibold shadow-sm shadow-[#0df2c9]/5'
                        : 'text-[#94a3b8] hover:text-white hover:bg-[#111827]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#0df2c9]' : 'text-[#64748b]'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#8b5cf6] text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area */}
        <div className="p-4 border-t border-[#162035] space-y-3">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#111827] border border-[#1c273e]">
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#94a3b8]">
              {isDarkMode ? <Moon className="w-4 h-4 text-[#0df2c9]" /> : <Sun className="w-4 h-4 text-[#f59e0b]" />}
              <span className="font-semibold">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark / Light Mode"
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                isDarkMode ? 'bg-[#0df2c9]' : 'bg-[#cbd5e1]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform duration-200 ${
                  isDarkMode ? 'bg-[#090d16] translate-x-5' : 'bg-white translate-x-0 shadow-sm'
                }`}
              />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131b2e] border border-[#1f2d47]">
            <Link
              to={`/profile/${effectiveUser.id || 'usr-1'}`}
              onClick={onCloseMobile}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={effectiveUser.avatar}
                  alt={effectiveUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#2a3b5c] group-hover:border-[#0df2c9] transition-colors"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#0df2c9] border-2 border-[#131b2e]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#0df2c9] transition-colors">
                  {effectiveUser.name}
                </div>
                <div className="text-[10px] font-mono tracking-wide text-[#64748b]">
                  {effectiveUser.rank || `Lvl ${effectiveUser.level || 1}`}
                </div>
              </div>
            </Link>

            {/* Quick Demo Profile Switcher & Logout */}
            <div className="flex items-center gap-1">
              <div className="relative group">
                <button
                  title="Switch profile"
                  className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0df2c9] hover:bg-[#1a233a] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#101726] border border-[#1f2d47] rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] px-2 py-1">
                    Switch Account
                  </div>
                  {allUsers?.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        u.id === effectiveUser.id ? 'bg-[#0df2c9]/20 text-[#0df2c9] font-bold' : 'text-[#94a3b8] hover:bg-[#1a233a] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{u.name}</span>
                      <span className="text-[10px] font-mono text-[#64748b]">Lvl {u.level || 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out"
                className="p-1.5 rounded-lg text-[#64748b] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Public Site Link */}
          <Link
            to="/"
            onClick={onCloseMobile}
            className="w-full text-left text-[11px] font-mono tracking-widest uppercase text-[#64748b] hover:text-[#0df2c9] transition-colors flex items-center justify-between px-1"
          >
            <span>VIEW DASHBOARD</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
}
