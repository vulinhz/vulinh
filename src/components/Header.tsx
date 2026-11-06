import React, { useState } from 'react';
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
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
            onClick={() => handleNav('home')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base lg:text-lg font-bold tracking-wider text-amber-200 uppercase font-serif">
                  Tử Vi & Bát Tự AI
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden xs:inline-block">
                  Khảo Chứng Thư Tịch
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
                Tử Vi Đẩu Số Toàn Thư • Uyên Hải Tử Bình • Địch Thiên Tủy
              </p>
            </div>
          </div>

          {/* 2. Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Trang Chủ */}
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang Chủ</span>
            </button>

            {/* Menu Dropdown: Tử Vi Đẩu Số */}
            <div className="relative">
              <button
                onClick={() => {
                  setTuviDropdownOpen(!tuviDropdownOpen);
                  setBaziDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isTuViActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Tử Vi Đẩu Số</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {tuviDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-52 rounded-xl bg-slate-900 border border-amber-500/30 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setTuviDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNav('tuvi_chart', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'tuvi_chart' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem Lá Số Tử Vi</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_form', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'tuvi_form' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lập Lá Số Tử Vi</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_interpret', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'tuvi_interpret' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luận Giải Tử Vi AI</span>
                  </button>
                  <button
                    onClick={() => handleNav('tuvi_chat', 'tuvi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'tuvi_chat' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Đàm Thoại Tử Vi</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu Dropdown: Bát Tự – Tứ Trụ */}
            <div className="relative">
              <button
                onClick={() => {
                  setBaziDropdownOpen(!baziDropdownOpen);
                  setTuviDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isBaziActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Bát Tự – Tứ Trụ</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {baziDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-sky-500/30 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setBaziDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNav('bazi_chart', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'bazi_chart' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Xem Bát Tự (Bốn Trụ)</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_form', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'bazi_form' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Lập Lá Số Bát Tự</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_analysis', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'bazi_analysis' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Phân Tích Chuyên Sâu</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_interpret', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'bazi_interpret' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Luận Giải Bát Tự AI</span>
                  </button>
                  <button
                    onClick={() => handleNav('bazi_chat', 'bazi')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      activeTab === 'bazi_chat' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Đàm Thoại Bát Tự</span>
                  </button>
                </div>
              )}
            </div>

            {/* Lịch Âm – Dương Việt Nam */}
            <button
              onClick={() => handleNav('lunar_calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lunar_calendar'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-amber-300/90 hover:text-white hover:bg-slate-800/60 border border-amber-500/20'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Lịch Âm – Dương</span>
            </button>

            {/* So Sánh */}
            <button
              onClick={() => handleNav('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>So Sánh</span>
            </button>

            {/* Kho Tri Thức */}
            <button
              onClick={() => handleNav('knowledge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho Tri Thức</span>
            </button>

            {/* Kiểm Thử QA */}
            <button
              onClick={() => handleNav('qa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'qa'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kiểm Thử (QA)</span>
            </button>
          </nav>

          {/* 3. Action Buttons & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Quick Action: Lập Lá Số Tử Vi */}
            <button
              onClick={onNewTuViClick}
              className="hidden sm:flex px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs shadow-md shadow-amber-900/30 border border-amber-400/20 transition-all items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lập Lá Số Tử Vi</span>
            </button>

            {/* Quick Action: Lập Lá Số Bát Tự */}
            <button
              onClick={onNewBaziClick}
              className="hidden md:flex px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-medium text-xs shadow-md shadow-sky-900/30 border border-sky-400/20 transition-all items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lập Lá Số Bát Tự</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 cursor-pointer"
              aria-label="Mở Menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Sub-Navigation Ribbon (Quick links on Tablet/Desktop) */}
        <div className="hidden md:flex lg:hidden items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-2 text-xs no-scrollbar">
          <button
            onClick={() => handleNav('home')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'home' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Trang Chủ
          </button>
          <button
            onClick={() => handleNav('tuvi_chart', 'tuvi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'tuvi_chart' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Xem Lá Số Tử Vi
          </button>
          <button
            onClick={() => handleNav('tuvi_form', 'tuvi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'tuvi_form' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Lập Lá Số Tử Vi
          </button>
          <button
            onClick={() => handleNav('tuvi_interpret', 'tuvi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'tuvi_interpret' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Luận Giải Tử Vi AI
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => handleNav('bazi_chart', 'bazi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'bazi_chart' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'}`}
          >
            Xem Bát Tự
          </button>
          <button
            onClick={() => handleNav('bazi_form', 'bazi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'bazi_form' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'}`}
          >
            Lập Lá Số Bát Tự
          </button>
          <button
            onClick={() => handleNav('bazi_interpret', 'bazi')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'bazi_interpret' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'}`}
          >
            Luận Giải Bát Tự AI
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => handleNav('lunar_calendar')}
            className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${activeTab === 'lunar_calendar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-300 font-medium'}`}
          >
            <Calendar className="w-3 h-3" />
            Lịch Âm – Dương
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => handleNav('comparison')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'comparison' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            So Sánh
          </button>
          <button
            onClick={() => handleNav('qa')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'qa' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
          >
            Kiểm Thử
          </button>
        </div>

        {/* 5. Full Mobile Dropdown Menu (Guarantees all required links are accessible) */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Trang Chủ */}
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
                activeTab === 'home' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Trang Chủ</span>
            </button>

            {/* Phân hệ Tử Vi Đẩu Số */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-xs font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Tử Vi Đẩu Số Toàn Thư</span>
              </div>
              <div className="pl-2 space-y-1">
                <button
                  onClick={() => handleNav('tuvi_chart', 'tuvi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_chart' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Xem Lá Số Tử Vi (12 Cung)</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_form', 'tuvi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_form' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lập Lá Số Tử Vi</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_interpret', 'tuvi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_interpret' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Luận Giải Tử Vi AI (Vũ Tài Lục)</span>
                </button>
                <button
                  onClick={() => handleNav('tuvi_chat', 'tuvi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'tuvi_chat' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đàm Thoại Tử Vi AI</span>
                </button>
              </div>
            </div>

            {/* Phân hệ Bát Tự – Tứ Trụ */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-xs font-bold text-sky-400/90 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Bát Tự – Tứ Trụ (Tử Bình)</span>
              </div>
              <div className="pl-2 space-y-1">
                <button
                  onClick={() => handleNav('bazi_chart', 'bazi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_chart' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Xem Bát Tự (Bốn Trụ)</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_form', 'bazi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_form' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                  <span>Lập Lá Số Bát Tự</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_analysis', 'bazi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_analysis' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Phân Tích Chuyên Sâu Bát Tự</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_interpret', 'bazi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_interpret' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Luận Giải Bát Tự AI</span>
                </button>
                <button
                  onClick={() => handleNav('bazi_chat', 'bazi')}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    activeTab === 'bazi_chat' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Đàm Thoại Bát Tự AI</span>
                </button>
              </div>
            </div>

            {/* Các chức năng chung */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleNav('lunar_calendar')}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  activeTab === 'lunar_calendar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-300 hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Lịch Âm – Dương Việt Nam (Tiết Khí, Can Chi)</span>
              </button>
              <button
                onClick={() => handleNav('comparison')}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  activeTab === 'comparison' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>So Sánh Tử Vi & Bát Tự</span>
              </button>
              <button
                onClick={() => handleNav('knowledge')}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  activeTab === 'knowledge' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Kho Tri Thức Cổ Điển</span>
              </button>
              <button
                onClick={() => handleNav('qa')}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  activeTab === 'qa' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kiểm Thử QA Tự Động (24 Tests)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
