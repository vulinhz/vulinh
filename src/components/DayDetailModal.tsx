import React from 'react';
import {
  DayCalendarInfo,
  get12HoursCanChi,
  getLunarMonthDaysCount
} from '../engine/lunarCalendar';
import {
  X,
  Calendar,
  Compass,
  Sparkles,
  Clock,
  Award,
  Sun,
  Moon,
  Info,
  ArrowRight
} from 'lucide-react';

interface DayDetailModalProps {
  dayInfo: DayCalendarInfo | null;
  onClose: () => void;
  onSelectForTuVi: (day: number, month: number, year: number) => void;
  onSelectForBazi: (day: number, month: number, year: number) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dayInfo,
  onClose,
  onSelectForTuVi,
  onSelectForBazi
}) => {
  if (!dayInfo) return null;

  const hours12 = get12HoursCanChi(dayInfo.canDay);
  const monthDaysInfo = getLunarMonthDaysCount(dayInfo.lunarMonth, dayInfo.lunarYear, dayInfo.isLeapMonth);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase leading-none">
                  {dayInfo.dayOfWeekName.replace('Thứ ', 'T.')}
                </span>
                <span className="text-base font-black text-amber-200 leading-none mt-0.5">
                  {dayInfo.solarDay}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-amber-200 font-serif">
                  {dayInfo.dayOfWeekName}, Ngày {dayInfo.solarDay} Tháng {dayInfo.solarMonth} Năm {dayInfo.solarYear}
                </h3>
                {dayInfo.isToday && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    HÔM NAY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Âm Lịch: <strong>Mùng {dayInfo.lunarDay}/{dayInfo.lunarMonth}/{dayInfo.lunarYear}</strong> {dayInfo.isLeapMonth ? '(Tháng Nhuận)' : ''}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{dayInfo.canChiYear}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto palace-scrollbar">
          {/* Holiday Alert if applicable */}
          {dayInfo.holiday && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2.5 text-xs text-amber-200 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Sự kiện / Ngày lễ: </span>
                <span>{dayInfo.holiday}</span>
              </div>
            </div>
          )}

          {/* Dual Solar & Lunar Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dương Lịch Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sun className="w-4 h-4 text-amber-400" />
                  DƯƠNG LỊCH CHUẨN
                </span>
                <span className="text-[11px] text-slate-500">Múi giờ UTC+7</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày Dương:</span>
                  <span className="font-bold text-slate-100">{dayInfo.solarDay} / {dayInfo.solarMonth} / {dayInfo.solarYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thứ trong tuần:</span>
                  <span className="font-semibold text-slate-200">{dayInfo.dayOfWeekName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tiết Khí Thiên Văn:</span>
                  <span className="font-bold text-emerald-400">{dayInfo.tietKhi}</span>
                </div>
              </div>
            </div>

            {/* Âm Lịch Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-900/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span className="flex items-center gap-1.5 text-sky-300">
                  <Moon className="w-4 h-4 text-sky-400" />
                  ÂM LỊCH TRUYỀN THỐNG
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {monthDaysInfo.type}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày Âm Lịch:</span>
                  <span className="font-bold text-amber-300">
                    Ngày {dayInfo.lunarDay} tháng {dayInfo.lunarMonth}{dayInfo.isLeapMonth ? ' (Nhuận)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Năm Âm Lịch:</span>
                  <span className="font-semibold text-slate-200">{dayInfo.lunarYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tuần trăng:</span>
                  <span className="text-slate-300">
                    {dayInfo.isFirstDayOfLunarMonth ? 'Mùng 1 (Đầu tháng Sóc)' : dayInfo.isFullMoon ? 'Ngày Rằm (Trăng tròn)' : 'Ngày thường'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Can Chi 3 Trụ Cột */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              Can Chi Ngày - Tháng - Năm (Dân Sự)
            </h4>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Ngày Can Chi</span>
                <span className="text-sm font-bold text-amber-300 block">{dayInfo.canChiDay}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Tháng Can Chi</span>
                <span className="text-sm font-bold text-sky-300 block">{dayInfo.canChiMonth}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Năm Can Chi</span>
                <span className="text-sm font-bold text-amber-200 block">{dayInfo.canChiYear}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                <span className="text-slate-400">12 Trực:</span>
                <span className="font-semibold text-emerald-300">Trực {dayInfo.truc}</span>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                <span className="text-slate-400">Nhị Thập Bát Tú:</span>
                <span className="font-semibold text-purple-300">Sao {dayInfo.sao}</span>
              </div>
            </div>
          </div>

          {/* 12 Canh Giờ Can Chi Trong Ngày */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Bảng 12 Canh Giờ Can Chi (Quy Tắc Ngũ Thử Độn)
              </h4>
              <span className="text-[10px] text-slate-500">Khởi giờ Tý theo Can {dayInfo.canDay}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hours12.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Giờ {h.fullName}</span>
                    <span className="text-[10px] text-slate-500">{h.chi}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{h.timeRange}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Attribution */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <span>Quy ước thiên văn Mặt Trăng & Mặt Trời áp dụng cho tọa độ Việt Nam múi giờ UTC+7 (Hồ Ngọc Đức - Viện Hàn lâm Khoa học). Độc lập với múi giờ Bắc Kinh UTC+8.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Direct Integration Actions */}
        <div className="bg-slate-950 px-5 py-3.5 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSelectForTuVi(dayInfo.solarDay, dayInfo.solarMonth, dayInfo.solarYear);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-900/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Lập Lá Số Tử Vi với ngày này</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSelectForBazi(dayInfo.solarDay, dayInfo.solarMonth, dayInfo.solarYear);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-900/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lập Bát Tự với ngày này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
