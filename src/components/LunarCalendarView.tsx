import React, { useState } from 'react';
import {
  generateMonthCalendar,
  DayCalendarInfo,
  getLeapMonthInLunarYear,
  safeConvertLunarToSolar,
  getDayDetail,
  getSolarTermForDate
} from '../engine/lunarCalendar';
import {
  convertSolarToLunar,
  getCanChiYear,
  getCanChiMonth,
  getCanChiDay
} from '../engine/lunar';
import { DayDetailModal } from './DayDetailModal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  Sparkles,
  Compass,
  ArrowRightLeft,
  CalendarDays,
  Info,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LunarCalendarViewProps {
  onNavigateToTuViForm: (d: number, m: number, y: number) => void;
  onNavigateToBaziForm: (d: number, m: number, y: number) => void;
}

export const LunarCalendarView: React.FC<LunarCalendarViewProps> = ({
  onNavigateToTuViForm,
  onNavigateToBaziForm
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarSubTab, setCalendarSubTab] = useState<'month' | 'year' | 'convert'>('month');
  const [selectedDayInfo, setSelectedDayInfo] = useState<DayCalendarInfo | null>(null);

  // Tra cứu tháng nhuận state
  const [lookupYear, setLookupYear] = useState(today.getFullYear());
  const leapInfo = getLeapMonthInLunarYear(lookupYear);

  // State cho bộ chuyển đổi Dương -> Âm
  const [solarInputDay, setSolarInputDay] = useState(today.getDate());
  const [solarInputMonth, setSolarInputMonth] = useState(today.getMonth() + 1);
  const [solarInputYear, setSolarInputYear] = useState(today.getFullYear());
  const [solarConvertResult, setSolarConvertResult] = useState<DayCalendarInfo>(() =>
    getDayDetail(today.getDate(), today.getMonth() + 1, today.getFullYear())
  );

  // State cho bộ chuyển đổi Âm -> Dương
  const [lunarInputDay, setLunarInputDay] = useState(1);
  const [lunarInputMonth, setLunarInputMonth] = useState(1);
  const [lunarInputYear, setLunarInputYear] = useState(today.getFullYear());
  const [lunarInputIsLeap, setLunarInputIsLeap] = useState(false);
  const [lunarConvertError, setLunarConvertError] = useState<string | null>(null);
  const [lunarConvertSuccess, setLunarConvertSuccess] = useState<{ day: number; month: number; year: number } | null>(null);

  // Tạo lưới ngày trong tháng hiện tại
  const monthDays = generateMonthCalendar(currentMonth, currentYear);
  const currentMonthYearCanChi = getCanChiYear(currentYear);

  // Điều hướng tháng/năm
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  const handleToday = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  // Xử lý chuyển đổi Dương -> Âm
  const handleConvertSolarToLunar = (e: React.FormEvent) => {
    e.preventDefault();
    const res = getDayDetail(solarInputDay, solarInputMonth, solarInputYear);
    setSolarConvertResult(res);
  };

  // Xử lý chuyển đổi Âm -> Dương
  const handleConvertLunarToSolar = (e: React.FormEvent) => {
    e.preventDefault();
    setLunarConvertError(null);
    setLunarConvertSuccess(null);

    const validation = safeConvertLunarToSolar(
      lunarInputDay,
      lunarInputMonth,
      lunarInputYear,
      lunarInputIsLeap
    );

    if (!validation.success) {
      setLunarConvertError(validation.errorMessage || 'Ngày âm lịch không hợp lệ.');
    } else if (validation.solarDate) {
      setLunarConvertSuccess(validation.solarDate);
    }
  };

  const todayInfo = getDayDetail(today.getDate(), today.getMonth() + 1, today.getFullYear());

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-4">
      {/* 1. Header Banner & Today Overview */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/30 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span>Hệ Thống Lịch Âm – Dương Việt Nam (UTC+7)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100">
              Lịch Vạn Niên & Tiết Khí Thiên Văn
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Định vị thiên văn chuẩn xác theo tọa độ Việt Nam, tính toán tháng nhuận, 24 tiết khí, Can Chi và ngày lễ truyền thống.
            </p>
          </div>

          {/* Today Widget */}
          <div className="bg-slate-950/80 rounded-2xl border border-amber-900/40 p-3.5 sm:p-4 text-xs space-y-1.5 shadow-inner min-w-[280px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Hôm Nay: {todayInfo.dayOfWeekName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Dương {todayInfo.solarDay}/{todayInfo.solarMonth}/{todayInfo.solarYear}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Âm lịch:</span>
              <span className="font-bold text-amber-200">
                Mùng {todayInfo.lunarDay} Tháng {todayInfo.lunarMonth} ({todayInfo.canChiYear})
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Can Chi Ngày:</span>
              <span className="font-semibold text-slate-100">{todayInfo.canChiDay}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Tiết Khí:</span>
              <span className="font-bold text-emerald-400">{todayInfo.tietKhi}</span>
            </div>
            {todayInfo.holiday && (
              <div className="pt-1 text-[11px] text-amber-300 font-bold border-t border-slate-800/60 truncate">
                ★ {todayInfo.holiday}
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setCalendarSubTab('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              calendarSubTab === 'month'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch Tháng</span>
          </button>

          <button
            onClick={() => setCalendarSubTab('year')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              calendarSubTab === 'year'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Xem 12 Tháng Trong Năm</span>
          </button>

          <button
            onClick={() => setCalendarSubTab('convert')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              calendarSubTab === 'convert'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Quy Đổi Âm – Dương</span>
          </button>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ XEM 1: LỊCH THÁNG (MONTH CALENDAR VIEW) */}
      {calendarSubTab === 'month' && (
        <div className="bg-slate-900/90 rounded-3xl border border-amber-900/40 p-4 sm:p-6 shadow-2xl space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Left Month & Year Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevYear}
                title="Năm trước"
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrevMonth}
                title="Tháng trước"
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[150px]">
                <span className="text-sm font-bold text-amber-200 block uppercase font-serif">
                  Tháng {currentMonth} Năm {currentYear}
                </span>
                <span className="text-[10px] text-slate-400">
                  Năm {currentMonthYearCanChi.fullName}
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                title="Tháng tiếp"
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextYear}
                title="Năm tiếp"
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="ml-2 px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                Hôm Nay
              </button>
            </div>

            {/* Quick Month & Year Dropdown Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={e => setCurrentMonth(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>

              <input
                type="number"
                min={1900}
                max={2100}
                value={currentYear}
                onChange={e => setCurrentYear(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono text-center focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="w-full overflow-x-auto palace-scrollbar">
            <div className="min-w-[680px] w-full">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-xs font-bold uppercase tracking-wider">
                <div className="py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">Thứ Hai</div>
                <div className="py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">Thứ Ba</div>
                <div className="py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">Thứ Tư</div>
                <div className="py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">Thứ Năm</div>
                <div className="py-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">Thứ Sáu</div>
                <div className="py-2 rounded-xl bg-slate-950 text-sky-400 border border-slate-800">Thứ Bảy</div>
                <div className="py-2 rounded-xl bg-slate-950 text-rose-400 border border-slate-800">Chủ Nhật</div>
              </div>

              {/* 35 or 42 Days Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map((day, idx) => {
                  const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
                  const isCurrent = day.isCurrentMonth;

                  let cellClass = 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900';
                  if (!isCurrent) {
                    cellClass = 'bg-slate-950/30 border-slate-900/60 opacity-40 hover:opacity-80';
                  } else if (day.isToday) {
                    cellClass = 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-400/40 shadow-lg shadow-amber-900/20';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDayInfo(day)}
                      className={`p-2 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[92px] sm:min-h-[105px] relative group ${cellClass}`}
                    >
                      {/* Top row: Solar day + Badges */}
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-base sm:text-lg font-bold leading-none ${
                            day.dayOfWeek === 0 ? 'text-rose-400' : isWeekend ? 'text-sky-400' : 'text-slate-100'
                          }`}
                        >
                          {day.solarDay}
                        </span>

                        {/* Special Badges (Mùng 1, Rằm, Lễ) */}
                        <div className="flex flex-col items-end gap-0.5">
                          {day.holiday && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-bold truncate max-w-[65px]" title={day.holiday}>
                              Lễ
                            </span>
                          )}
                          {day.isLeapMonth && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold">
                              Nhuận
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle row: Tiết Khí hint if current month */}
                      <div className="text-[10px] text-slate-500 truncate mt-1">
                        {day.tietKhi}
                      </div>

                      {/* Bottom row: Lunar Date + Can Chi Ngày */}
                      <div className="flex items-end justify-between border-t border-slate-800/40 pt-1 mt-1">
                        <span className="text-[9.5px] text-slate-400 truncate max-w-[50px] sm:max-w-[65px]">
                          {day.canDay} {day.chiDay}
                        </span>

                        {/* Lunar day highlight */}
                        <span
                          className={`text-xs font-bold ${
                            day.isFirstDayOfLunarMonth
                              ? 'text-rose-400 font-black'
                              : day.isFullMoon
                              ? 'text-amber-300 font-black'
                              : 'text-amber-200/90'
                          }`}
                          title={`Âm lịch: ${day.lunarDay}/${day.lunarMonth}`}
                        >
                          {day.lunarDay === 1 ? `${day.lunarDay}/${day.lunarMonth}` : day.lunarDay}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Legend & Tips */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Mùng 1 Âm lịch</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Ngày Rằm (15 Âm)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Ngày Lễ / Sự kiện</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 italic">
              Nhấp vào bất kỳ ô ngày nào để xem chi tiết 12 canh giờ, Tiết khí, Trực và liên kết lập lá số.
            </div>
          </div>
        </div>
      )}

      {/* 3. CHẾ ĐỘ XEM 2: XEM 12 THÁNG TRONG NĂM (YEAR OVERVIEW) */}
      {calendarSubTab === 'year' && (
        <div className="bg-slate-900/90 rounded-3xl border border-amber-900/40 p-5 sm:p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevYear}
                className="p-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold font-serif text-amber-200">
                Toàn Cảnh Năm {currentYear} ({currentMonthYearCanChi.fullName})
              </h2>
              <button
                onClick={handleNextYear}
                className="p-2 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {leapInfo.description}
            </span>
          </div>

          {/* 12 Months Mini Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const miniDays = generateMonthCalendar(m, currentYear).filter(d => d.isCurrentMonth);
              return (
                <div
                  key={m}
                  onClick={() => {
                    setCurrentMonth(m);
                    setCalendarSubTab('month');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-bold text-xs text-amber-300 uppercase font-serif group-hover:text-amber-200">
                      Tháng {m}
                    </span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300">
                      Xem chi tiết →
                    </span>
                  </div>

                  {/* Mini Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-slate-500 font-bold mb-1">
                    <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span className="text-rose-400">CN</span>
                  </div>

                  {/* Mini Days Cells */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                    {miniDays.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className={`p-0.5 rounded leading-tight ${
                          d.isToday
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : d.dayOfWeek === 0
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }`}
                        title={`Dương: ${d.solarDay}/${d.solarMonth} - Âm: ${d.lunarDay}/${d.lunarMonth}`}
                      >
                        {d.solarDay}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CHẾ ĐỘ XEM 3: QUY ĐỔI ÂM – DƯƠNG & TRA CỨU THÁNG NHUẬN */}
      {calendarSubTab === 'convert' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tool A: Dương lịch -> Âm lịch */}
          <div className="bg-slate-900/90 rounded-3xl border border-amber-900/40 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold font-serif text-base text-amber-200 uppercase">
                  Dương Lịch Sang Âm Lịch
                </h3>
                <p className="text-[11px] text-slate-400">Nhập ngày dương để tra cứu ngày âm, can chi và tiết khí</p>
              </div>
            </div>

            <form onSubmit={handleConvertSolarToLunar} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ngày (Dương)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={solarInputDay}
                    onChange={e => setSolarInputDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tháng (Dương)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={solarInputMonth}
                    onChange={e => setSolarInputMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Năm (Dương)</label>
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={solarInputYear}
                    onChange={e => setSolarInputYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra Cứu Âm Lịch</span>
              </button>
            </form>

            {/* Result Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Ngày Âm Lịch Tương Ứng:</span>
                <span className="font-bold text-amber-300">
                  Ngày {solarConvertResult.lunarDay} Tháng {solarConvertResult.lunarMonth} {solarConvertResult.isLeapMonth ? '(Nhuận)' : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Năm Âm Lịch:</span>
                <span className="font-semibold text-slate-200">{solarConvertResult.lunarYear}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Can Chi Ngày:</span>
                <span className="font-semibold text-amber-200">{solarConvertResult.canChiDay}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Can Chi Tháng - Năm:</span>
                <span className="text-slate-300">{solarConvertResult.canChiMonth} • {solarConvertResult.canChiYear}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Tiết Khí Thiên Văn:</span>
                <span className="font-bold text-emerald-400">{solarConvertResult.tietKhi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trực & Nhị Thập Bát Tú:</span>
                <span className="text-slate-300">Trực {solarConvertResult.truc} • Sao {solarConvertResult.sao}</span>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateToTuViForm(solarConvertResult.solarDay, solarConvertResult.solarMonth, solarConvertResult.solarYear)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Lập Tử Vi</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToBaziForm(solarConvertResult.solarDay, solarConvertResult.solarMonth, solarConvertResult.solarYear)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lập Bát Tự</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tool B: Âm lịch -> Dương lịch (kèm kiểm tra hợp lệ nghiêm ngặt) */}
          <div className="bg-slate-900/90 rounded-3xl border border-sky-900/40 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Moon className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="font-bold font-serif text-base text-sky-200 uppercase">
                  Âm Lịch Sang Dương Lịch
                </h3>
                <p className="text-[11px] text-slate-400">Xác thực chính xác tháng thiếu, tháng đủ và tháng nhuận</p>
              </div>
            </div>

            <form onSubmit={handleConvertLunarToSolar} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ngày (Âm)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={lunarInputDay}
                    onChange={e => setLunarInputDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tháng (Âm)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={lunarInputMonth}
                    onChange={e => setLunarInputMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Năm (Âm)</label>
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={lunarInputYear}
                    onChange={e => setLunarInputYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold text-center focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="convertIsLeapCheck"
                  checked={lunarInputIsLeap}
                  onChange={e => setLunarInputIsLeap(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                />
                <label htmlFor="convertIsLeapCheck" className="text-xs text-slate-300">
                  Tháng Nhuận (nếu ngày sinh rơi vào tháng nhuận)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra Cứu Dương Lịch</span>
              </button>
            </form>

            {/* Error Message */}
            {lunarConvertError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lỗi xác thực âm lịch: </span>
                  <span>{lunarConvertError}</span>
                </div>
              </div>
            )}

            {/* Success Result Box */}
            {lunarConvertSuccess && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs border-b border-slate-800 pb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác thực thành công đối ứng thiên văn</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Ngày Dương Lịch Tương Ứng:</span>
                  <span className="font-bold text-sky-300 text-sm">
                    {lunarConvertSuccess.day} / {lunarConvertSuccess.month} / {lunarConvertSuccess.year}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Năm Can Chi:</span>
                  <span className="font-semibold text-amber-200">
                    {getCanChiYear(lunarInputYear).fullName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Can Chi Ngày Dương:</span>
                  <span className="text-slate-300">
                    {getCanChiDay(lunarConvertSuccess.day, lunarConvertSuccess.month, lunarConvertSuccess.year).fullName}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToTuViForm(lunarConvertSuccess.day, lunarConvertSuccess.month, lunarConvertSuccess.year)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Lập Tử Vi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToBaziForm(lunarConvertSuccess.day, lunarConvertSuccess.month, lunarConvertSuccess.year)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lập Bát Tự</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Day */}
      {selectedDayInfo && (
        <DayDetailModal
          dayInfo={selectedDayInfo}
          onClose={() => setSelectedDayInfo(null)}
          onSelectForTuVi={(d, m, y) => onNavigateToTuViForm(d, m, y)}
          onSelectForBazi={(d, m, y) => onNavigateToBaziForm(d, m, y)}
        />
      )}
    </div>
  );
};
