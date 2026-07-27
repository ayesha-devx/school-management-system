import React from 'react';
import { GraduationCap } from 'lucide-react';

const Header = ({ backendStatus, activeSection, onNavigate }) => {
  const navItem = (label, section) => (
    <button
      onClick={() => onNavigate(section)}
      className={`text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 ${
        activeSection === section
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <span className="font-bold text-lg tracking-tight text-slate-900">
            School Management System
          </span>
        </div>
        <nav className="hidden md:flex gap-2">
          {navItem('Dashboard', 'dashboard')}
          {navItem('Students', 'students')}
          {navItem('Analytics', 'analytics')}
        </nav>
        <div className="flex items-center gap-4">
          {/* Reusable status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' 
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' 
                : backendStatus === 'disconnected' 
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                : 'bg-amber-500 animate-bounce'
            }`}></span>
            <span className={
              backendStatus === 'connected' 
                ? 'text-emerald-700' 
                : backendStatus === 'disconnected' 
                ? 'text-rose-700' 
                : 'text-amber-700'
            }>
              {backendStatus === 'connected' 
                ? 'Backend Connected' 
                : backendStatus === 'disconnected' 
                ? 'Backend Disconnected' 
                : 'Connecting...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
              AD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-tight">Admin User</span>
              <span className="text-xs text-slate-500">Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
