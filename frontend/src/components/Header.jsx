import React from 'react';
import { GraduationCap } from 'lucide-react';

const Header = ({ backendStatus, activeSection, onNavigate }) => {
  const navItem = (label, section) => (
    <button
      onClick={() => onNavigate(section)}
      className={`text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-200 cursor-pointer ${
        activeSection === section
          ? 'bg-indigo-600 text-white shadow-xs'
          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-0 md:h-[70px] flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-indigo-600 shrink-0" />
            <span className="font-bold text-sm md:text-lg tracking-tight text-slate-900 whitespace-nowrap">
              School Management System
            </span>
          </div>
          {/* Mobile Admin Avatar */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              AD
            </div>
          </div>
        </div>

        {/* Navigation - Always visible but styled for mobile responsiveness */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <nav className="flex gap-1.5">
            {navItem('Dashboard', 'dashboard')}
            {navItem('Students', 'students')}
            {navItem('Analytics', 'analytics')}
          </nav>
          
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Reusable status pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-slate-50 border border-slate-200 shadow-xs">
              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
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
                  ? 'Connected' 
                  : backendStatus === 'disconnected' 
                  ? 'Disconnected' 
                  : 'Connecting...'}
              </span>
            </div>

            {/* Desktop Admin Info */}
            <div className="hidden md:flex items-center gap-3">
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
      </div>
    </header>
  );
};

export default Header;
