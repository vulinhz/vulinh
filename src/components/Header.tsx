import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Layers,
  PlusCircle,
  Home,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Calendar
} from 'lucide-react';

export type AppTab =
  | 'home'
  | 'tuvi_chart'
  | 'tuvi_form'
  | 'tuvi_interpret'
  | 'tuvi_chat'
  | 'bazi_chart'
  | 'bazi_form'
  | 'bazi_analysis'
  | 'bazi_interpret'
  | 'bazi_chat'
  | 'lunar_calendar'
  | 'comparison'
  | 'knowledge'
  | 'qa';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  chartName?: string;
  onNewTuViClick: () => void;
  onNewBaziClick: () => void;
  currentSystem: 'tuvi' | 'bazi';
  setCurrentSystem: (sys: 'tuvi' | 'bazi') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  chartName,
  onNewTuViClick,
  onNewBaziClick,
  currentSystem,
  setCurrentSystem
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tuviDropdownOpen, setTuviDropdownOpen] = useState(false);
  const [baziDropdownOpen, setBaziDropdownOpen] = useState(false);

  const tuviDropdownRef = useRef<HTMLDivElement>(null);
  const baziDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tuviDropdownRef.current &&
        !tuviDropdownRef.current.contains(event.target as Node)
      ) {
        setTuviDropdownOpen(false);
      }
      if (
        baziDropdownRef.current &&
        !baziDropdownRef.current.contains(event.target as Node)
      ) {
        setBaziDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNav = (tab: AppTab, sys?: 'tuvi' | 'bazi') => {
    if (sys) setCurrentSystem(sys);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setTuviDropdownOpen(false);
    setBaziDropdownOpen(false);
  };

  const isTuViActive = activeTab.startsWith('tuvi');
  const isBaziActive = activeTab.startsWith('bazi');

  return (
    <header className="w-full bg-slate-950/95 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-50 transition-all shadow-lg shadow-black/40">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8">
        {/* Main Header Container: Auto height (min-h-[4rem]), wraps cleanly into 2 balanced rows on tablet, 1 row on desktop >= 1280px */}
        <div className="min-h-[4rem] py-2 sm:py-2.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 xl:gap-4">
          {/* Top Row on Tablet/Mobile: Logo on Left, Action buttons & Hamburger on Right */}
          <div className="flex items-center justify-between gap-3 w-full xl:w-auto flex-shrink-0">
            {/* 1. Logo & Brand */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-shrink-0 group"
              onClick={() => handleNav('home')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wider text-amber-200 uppercase font-serif whitespace-nowrap">
                    Tử Vi & Bát Tự AI
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    Khảo Chứng
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans hidden sm:block whitespace-nowrap">
                  Tử Vi Đẩu Số Toàn Thư • Uyên Hải Tử Bình • Địch Thiên Tủy
                </p>
              </div>
            </div>

            {/* Quick Actions & Hamburger (Visible on < 1280px screen) */}
            <div className="flex items-center gap-2 xl:hidden flex-shrink-0">
              {/* Nút 8: Lập Lá Số Tử Vi (Tablet) */}
              <button
                onClick={onNewTuViClick}
                className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-950/40 border border-amber-400/30 whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                title="Lập lá số Tử Vi mới"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-200" />
                <span>Lập Lá Số Tử Vi</span>
              </button>

              {/* Nút 9: Lập Lá Số Bát Tự (Tablet) */}
              <button
                onClick={onNewBaziClick}
                className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-950/40 border border-sky-400/30 whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                title="Lập lá số Bát Tự (Tứ Trụ) mới"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                <span>Lập Lá Số Bát Tự</span>
              </button>

              {/* Mobile Hamburger Button (< 768px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                aria-label="Mở Menu điều hướng"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop & Tablet Navigation Menu (Mục 1 đến Mục 7 + Nút 8, 9 trên màn hình >= 1280px) */}
          <nav className="hidden md:flex items-center justify-center xl:justify-end gap-1.5 lg:gap-2 flex-wrap xl:flex-nowrap w-full xl:w-auto pt-1 xl:pt-0 border-t border-slate-800/60 xl:border-t-0">
            {/* 1. Trang Chủ */}
            <button
              onClick={() => handleNav('home')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850 hover:bg-slate-800/70'
              }`}
            >
              <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>Trang Chủ</span>
            </button>

            {/* 2. Tử Vi Đẩu Số (Dropdown) */}
            <div className="relative flex-shrink-0" ref={tuviDropdownRef}>
              <button
                onClick={() => {
                  setTuviDropdownOpen(!tuviDropdownOpen);
                  setBaziDropdownOpen(false);
                }}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isTuViActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Compass className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 flex-shrink-0" />
                <span>Tử Vi Đẩu Số</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    tuviDropdownOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {tuviDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900/98 backdrop-blur-md border border-amber-500/40 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => handleNav('tuvi_chart', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'tuvi_chart'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Xem Lá Số Tử Vi</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_form', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'tuvi_form'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Lập Lá Số Tử Vi</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_interpret', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'tuvi_interpret'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Luận Giải Tử Vi AI</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_chat', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'tuvi_chat'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Đàm Thoại Tử Vi</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Tứ Trụ (Dropdown) */}
            <div className="relative flex-shrink-0" ref={baziDropdownRef}>
              <button
                onClick={() => {
                  setBaziDropdownOpen(!baziDropdownOpen);
                  setTuviDropdownOpen(false);
                }}
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isBaziActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 ring-1 ring-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sky-400 flex-shrink-0" />
                <span>Tứ Trụ</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    baziDropdownOpen ? 'rotate-180 text-sky-400' : ''
                  }`}
                />
              </button>

              {baziDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-xl bg-slate-900/98 backdrop-blur-md border border-sky-500/40 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => handleNav('bazi_chart', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'bazi_chart'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Xem Bát Tự (Bốn Trụ)</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_form', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'bazi_form'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Lập Lá Số Bát Tự</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_analysis', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'bazi_analysis'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Phân Tích Chuyên Sâu</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_interpret', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'bazi_interpret'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Luận Giải Bát Tự AI</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_chat', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      activeTab === 'bazi_chat'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-sky-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>Đàm Thoại Bát Tự</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Lịch Âm – Dương */}
            <button
              onClick={() => handleNav('lunar_calendar')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                activeTab === 'lunar_calendar'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                  : 'text-amber-300/90 hover:text-white hover:bg-slate-800/70 border border-amber-500/20'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 flex-shrink-0" />
              <span>Lịch Âm – Dương</span>
            </button>

            {/* 5. So Sánh */}
            <button
              onClick={() => handleNav('comparison')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                activeTab === 'comparison'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span>So Sánh</span>
            </button>

            {/* 6. Kho Tri Thức */}
            <button
              onClick={() => handleNav('knowledge')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                activeTab === 'knowledge'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 flex-shrink-0" />
              <span>Kho Tri Thức</span>
            </button>

            {/* 7. Kiểm Thử (QA) */}
            <button
              onClick={() => handleNav('qa')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                activeTab === 'qa'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/45 ring-1 ring-emerald-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400 flex-shrink-0" />
              <span>Kiểm Thử (QA)</span>
            </button>

            {/* Desktop Separation & Action Buttons (Visible on screens >= 1280px) */}
            <div className="hidden xl:flex items-center gap-2 pl-2 ml-1 border-l border-slate-800 flex-shrink-0">
              {/* 8. Nút Lập Lá Số Tử Vi */}
              <button
                onClick={onNewTuViClick}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 lg:py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs lg:text-sm shadow-md shadow-amber-950/40 border border-amber-400/30 whitespace-nowrap transition-all cursor-pointer flex-shrink-0 hover:scale-[1.02]"
                title="Lập lá số Tử Vi mới"
              >
                <PlusCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-200 flex-shrink-0" />
                <span>Lập Lá Số Tử Vi</span>
              </button>

              {/* 9. Nút Lập Lá Số Bát Tự */}
              <button
                onClick={onNewBaziClick}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 lg:py-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold text-xs lg:text-sm shadow-md shadow-sky-950/40 border border-sky-400/30 whitespace-nowrap transition-all cursor-pointer flex-shrink-0 hover:scale-[1.02]"
                title="Lập lá số Bát Tự (Tứ Trụ) mới"
              >
                <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sky-200 flex-shrink-0" />
                <span>Lập Lá Số Bát Tự</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Navigation Drawer (< 768px) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {/* Quick Action Buttons for Mobile */}
            <div className="grid grid-cols-2 gap-2 px-1">
              <button
                onClick={() => {
                  onNewTuViClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs border border-amber-400/30 shadow-md shadow-amber-950/40 cursor-pointer text-center"
              >
                <PlusCircle className="w-4 h-4 text-amber-200 flex-shrink-0" />
                <span className="whitespace-nowrap">Lập Lá Số Tử Vi</span>
              </button>
              <button
                onClick={() => {
                  onNewBaziClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 text-white font-semibold text-xs border border-sky-400/30 shadow-md shadow-sky-950/40 cursor-pointer text-center"
              >
                <Sparkles className="w-4 h-4 text-sky-200 flex-shrink-0" />
                <span className="whitespace-nowrap">Lập Lá Số Bát Tự</span>
              </button>
            </div>

            {/* 1. Trang Chủ */}
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Trang Chủ</span>
            </button>

            {/* 2. Phân hệ Tử Vi Đẩu Số */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-amber-900/20">
              <div className="px-2 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Tử Vi Đẩu Số</span>
              </div>
              <div className="pl-2 space-y-1">
                <button
                  onClick={() => handleNav('tuvi_chart', 'tuvi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_chart'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Xem Lá Số Tử Vi (Bàn Cờ 12 Cung)</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_form', 'tuvi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_form'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Lập Lá Số Tử Vi</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_interpret', 'tuvi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_interpret'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Luận Giải Tử Vi AI</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_chat', 'tuvi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_chat'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Đàm Thoại Tử Vi</span>
                </button>
              </div>
            </div>

            {/* 3. Phân hệ Tứ Trụ (Bát Tự) */}
            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-sky-900/20">
              <div className="px-2 py-1 text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Tứ Trụ (Bát Tự)</span>
              </div>
              <div className="pl-2 space-y-1">
                <button
                  onClick={() => handleNav('bazi_chart', 'bazi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_chart'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Xem Bát Tự (Bốn Trụ)</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_form', 'bazi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_form'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Lập Lá Số Bát Tự</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_analysis', 'bazi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_analysis'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Phân Tích Chuyên Sâu</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_interpret', 'bazi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_interpret'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Luận Giải Bát Tự AI</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_chat', 'bazi')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_chat'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Đàm Thoại Bát Tự</span>
                </button>
              </div>
            </div>

            {/* Các chức năng khác */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              {/* 4. Lịch Âm – Dương */}
              <button
                onClick={() => handleNav('lunar_calendar')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                  activeTab === 'lunar_calendar'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-amber-300 hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Lịch Âm – Dương</span>
              </button>

              {/* 5. So Sánh */}
              <button
                onClick={() => handleNav('comparison')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                  activeTab === 'comparison'
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>So Sánh</span>
              </button>

              {/* 6. Kho Tri Thức */}
              <button
                onClick={() => handleNav('knowledge')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                  activeTab === 'knowledge'
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Kho Tri Thức</span>
              </button>

              {/* 7. Kiểm Thử (QA) */}
              <button
                onClick={() => handleNav('qa')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
                  activeTab === 'qa'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kiểm Thử (QA)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
