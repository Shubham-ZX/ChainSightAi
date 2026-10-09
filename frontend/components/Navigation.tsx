import React, { useState } from 'react';
import { NavScreen } from '../types';
import { useFirebase } from '@database/FirebaseContext';

interface NavigationProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onOpenScanModal: () => void;
  alertCount: number;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  onOpenScanModal,
  alertCount,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { user, signIn, signOutUser, loading } = useFirebase();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems: { screen: NavScreen; label: string; icon: string; badge?: number }[] = [
    { screen: 'visualizer', label: 'Visualizer', icon: 'hub' },
    { screen: 'audit-history', label: 'Audit History', icon: 'history' },
    { screen: 'scan-history', label: 'Scan History', icon: 'manage_search' },
    { screen: 'alerts', label: 'Alerts', icon: 'crisis_alert', badge: alertCount },
  ];

  return (
    <>
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0a0e14] z-50 flex flex-col pt-5 pb-5 border-r border-[#1c2026] transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('visualizer')}>
            <img
              alt="ChainSight Security Node Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XWjEU8LANttwFjjW1X46GHNq2LB5uysjCUnLS6-RPLtThXSYXHOY9RhacAQVv2FmE2rlIbikv0GoxsrWcwIDkIrk29R6n58y-uybLvSkYCeg2PF676hNGZI2rSyEGPIDCfBVcKf44G9-zxoGVZa6VT36cw3RTQ1buKfkYtv_qhi5BYGljXsWcIEMGKpvGJX3ZSF3tGEvavemK9T2Bz1LtL9STNXo9oTij_Xd5Pec4wG7EcbI9B453wVwTs"
            />
            <span className="font-semibold text-lg text-[#dfe2eb] tracking-tight">ChainSight</span>
          </div>

          <button
            onClick={onToggleMobileMenu}
            className="md:hidden text-[#e4beba] hover:text-[#dfe2eb] p-1 rounded"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* DEFENSE-GRID & FIREBASE Status Indicator */}
        <div className="px-3.5 mb-3.5 flex flex-col gap-1.5">
          <div className="px-2.5 py-1 rounded bg-[#181c22] text-[#4edea3] font-mono text-[10px] font-semibold tracking-wider flex items-center justify-between border border-[#4edea3]/20">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              DEFENSE-GRID: ONLINE
            </span>
            <span className="text-[9px] text-[#7bd0ff]">CLOUD</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#10141a] text-[#8b949e] font-mono text-[10px] flex items-center justify-between border border-[#262a31]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb3ad]"></span>
              Firestore Synced
            </span>
            <span className="text-[9px] text-[#4edea3]">asia-south1</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => {
                  onNavigate(item.screen);
                  if (mobileMenuOpen) onToggleMobileMenu();
                }}
                className={`flex items-center justify-between px-3 py-2 rounded text-[13px] font-mono transition-all text-left ${
                  isActive
                    ? 'bg-[#262a31] text-[#7bd0ff] font-medium shadow-[inset_0_0_0_1px_rgba(123,208,255,0.2)]'
                    : 'text-[#8b949e] hover:bg-[#1c2026] hover:text-[#dfe2eb]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-[#7bd0ff]' : 'text-[#8b949e]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Scan Manifest */}
        <div className="px-3 pt-3 border-t border-[#1c2026]">
          <button
            onClick={onOpenScanModal}
            className="w-full py-2 px-3 rounded bg-[#262a31] font-mono text-[12px] text-[#dfe2eb] hover:bg-[#00a6e0] hover:text-[#001e2c] transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_12px_-2px_rgba(56,189,248,0.35)] cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>Scan Manifest</span>
          </button>
        </div>
      </aside>

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-[#0a0e14]/90 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-6 border-b border-[#1c2026]">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-[#dfe2eb] hover:bg-[#1c2026] rounded"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Top navigation tabs */}
          <nav className="hidden sm:flex items-center gap-4 sm:gap-6">
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className={`font-mono text-[13px] py-1 transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-[#7bd0ff] font-medium'
                      : 'text-[#8b949e] hover:text-[#dfe2eb]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#7bd0ff] shadow-[0_0_8px_#7bd0ff]"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Header Right Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanModal}
            className="sm:hidden px-2.5 py-1 text-xs font-mono bg-[#262a31] text-[#7bd0ff] rounded border border-[#7bd0ff]/30 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Scan</span>
          </button>

          {/* User Authentication area */}
          <div className="relative flex items-center gap-2 pl-2 border-l border-[#1c2026]">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-medium text-[#dfe2eb] truncate max-w-[140px]">
                    {user.displayName || 'Security Engineer'}
                  </div>
                  <div className="text-[10px] font-mono text-[#8b949e] truncate max-w-[140px]">
                    {user.email || 'authenticated'}
                  </div>
                </div>

                <div
                  className="relative flex items-center cursor-pointer"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <img
                    alt={user.displayName || 'User Profile'}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#7bd0ff]/40"
                    src={
                      user.photoURL ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQSzkApOCwClf5cI2QNUPN_PfIPYxaWz135KcXjHJOZ55g52X1fm7SP1J5ouop4EKAaR-7QJ2fD0nP9VAg0zIAhOWkaQYjAaLZ-9o7viQp9PkqWQajImyV-K6zxuz0gNwAL9IzJ7P6UnwkTNN_yH7bFnXrAN07lMxtWL93UXK_M0DATH0pJtYC81dIioCNYSD8ROZDM71PaW7Gyc_E-SepDGRSCnD5ueTQcFbo2omN0XWudN_hz0Nmsg'
                    }
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#0a0e14]"></span>
                </div>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-11 mt-1 w-52 bg-[#181c22] border border-[#262a31] rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1 font-mono text-xs">
                    <div className="px-2 py-1 text-[11px] text-[#8b949e] border-b border-[#262a31]">
                      UID: {user.uid.substring(0, 10)}...
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOutUser();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#262a31] text-[#ffdad7] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signIn}
                disabled={loading}
                className="px-3 py-1.5 rounded bg-[#181c22] hover:bg-[#262a31] text-[#7bd0ff] font-mono text-xs border border-[#7bd0ff]/30 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm text-[#4edea3]">login</span>
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onToggleMobileMenu}
        />
      )}
    </>
  );
};

