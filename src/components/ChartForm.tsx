import React, { useState, useEffect, useRef } from 'react';
import { convertSolarToLunar, convertLunarToSolar, getChiHour } from '../engine/lunar';
import { Compass, Sparkles, AlertCircle, History, Calendar, Clock, User, Trash2, Download, Upload } from 'lucide-react';
import { TuViChart } from '../engine/tuvi';

interface ChartFormProps {
  onSubmit: (params: {
    name: string;
    gender: 'Nam' | 'Nữ';
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    hour: number;
    minute: number;
    timeZone: number;
    birthPlace: string;
    timeAccuracy: string;
  }) => void;
  savedCharts: TuViChart[];
  onSelectSavedChart: (chart: TuViChart) => void;
  onDeleteSavedChart?: (chartIndex: number) => void;
  onImportChart?: (chart: TuViChart) => void;
  initialSolarDate?: { day: number; month: number; year: number } | null;
}

export const ChartForm: React.FC<ChartFormProps> = ({
  onSubmit,
  savedCharts,
  onSelectSavedChart,
  onDeleteSavedChart,
  onImportChart,
  initialSolarDate
}) => {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [name, setName] = useState('Đương Số Khảo Nghiệm');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');

  // Dương lịch
  const [solarDay, setSolarDay] = useState(initialSolarDate?.day ?? 15);
  const [solarMonth, setSolarMonth] = useState(initialSolarDate?.month ?? 8);
  const [solarYear, setSolarYear] = useState(initialSolarDate?.year ?? 1995);

  // Âm lịch
  const [lunarDay, setLunarDay] = useState(20);
  const [lunarMonth, setLunarMonth] = useState(7);
  const [lunarYear, setLunarYear] = useState(1995);
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // Giờ sinh
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(30);
  const [timeZone, setTimeZone] = useState(7);
  const [birthPlace, setBirthPlace] = useState('Hà Nội, Việt Nam');
  const [timeAccuracy, setTimeAccuracy] = useState('Chính xác theo giấy khai sinh');
  const [dateError, setDateError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSolarDate) {
      setSolarDay(initialSolarDate.day);
      setSolarMonth(initialSolarDate.month);
      setSolarYear(initialSolarDate.year);
      setCalendarType('solar');
    }
  }, [initialSolarDate]);

  // Kiểm tra tính hợp lệ của ngày trong tháng Dương lịch
  const getMaxDaysInMonth = (m: number, y: number) => {
    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) {
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      return isLeap ? 29 : 28;
    }
    return 31;
  };

  // Đồng bộ khi đổi ngày Dương lịch -> Âm lịch
  useEffect(() => {
    if (calendarType === 'solar') {
      const maxDays = getMaxDaysInMonth(solarMonth, solarYear);
      if (solarDay > maxDays) {
        setDateError(`Tháng ${solarMonth} năm ${solarYear} chỉ có tối đa ${maxDays} ngày.`);
      } else {
        setDateError(null);
        try {
          const l = convertSolarToLunar(solarDay, solarMonth, solarYear, timeZone);
          setLunarDay(l.day);
          setLunarMonth(l.month);
          setLunarYear(l.year);
          setIsLeapMonth(l.isLeap);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [solarDay, solarMonth, solarYear, calendarType, timeZone]);

  // Đồng bộ khi đổi ngày Âm lịch -> Dương lịch
  const handleLunarChange = (d: number, m: number, y: number, leap: boolean) => {
    setLunarDay(d);
    setLunarMonth(m);
    setLunarYear(y);
    setIsLeapMonth(leap);
    setDateError(null);
    try {
      const [sd, sm, sy] = convertLunarToSolar(d, m, y, leap, timeZone);
      setSolarDay(sd);
      setSolarMonth(sm);
      setSolarYear(sy);
    } catch (e) {
      console.error(e);
    }
  };

  const hourInfo = getChiHour(hour, minute);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxDays = getMaxDaysInMonth(solarMonth, solarYear);
    if (calendarType === 'solar' && solarDay > maxDays) {
      setDateError(`Ngày sinh không hợp lệ: Tháng ${solarMonth} năm ${solarYear} chỉ có tối đa ${maxDays} ngày.`);
      return;
    }
    onSubmit({
      name: name.trim() || 'Vô Danh',
      gender,
      solarDay,
      solarMonth,
      solarYear,
      hour,
      minute,
      timeZone,
      birthPlace,
      timeAccuracy
    });
  };

  // Xử lý nhập file JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.profile && parsed.palaces && onImportChart) {
          onImportChart(parsed);
        } else {
          alert('Tệp JSON không đúng định dạng lá số Tử Vi.');
        }
      } catch {
        alert('Không thể đọc tệp JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Các lá số mẫu kinh điển
  const presets = [
    {
      title: 'Tử Vi Cư Ngọ (Cực Hướng Ly Minh)',
      desc: 'Mẫu đế tinh đắc địa tối thượng, uy quyền hiển hách',
      params: { name: 'Mẫu Cực Hướng Ly Minh', gender: 'Nam' as const, d: 2, m: 2, y: 1984, h: 0, min: 30 }
    },
    {
      title: 'Sát Phá Tham (Võ Tướng Khai Phá)',
      desc: 'Cách cục tiên phong biến động, năng động quả cảm',
      params: { name: 'Mẫu Sát Phá Tham', gender: 'Nam' as const, d: 15, m: 6, y: 1990, h: 8, min: 30 }
    },
    {
      title: 'Cơ Nguyệt Đồng Lương (Trí Thức Văn Uyển)',
      desc: 'Cách cục công chức, học thuật, quản lý tham mưu',
      params: { name: 'Mẫu Cơ Nguyệt Đồng Lương', gender: 'Nữ' as const, d: 20, m: 11, y: 1993, h: 14, min: 15 }
    },
    {
      title: 'Mệnh Vô Chính Diệu (Khảo chứng Tam Không)',
      desc: 'Cách cục không có chính tinh, mượn chính tinh cung đối',
      params: { name: 'Mẫu Vô Chính Diệu', gender: 'Nam' as const, d: 10, m: 4, y: 1998, h: 22, min: 0 }
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
          <Compass className="w-4 h-4 text-amber-400" />
          Hệ Thống Lập Lá Số Khảo Chứng
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
          Lập Lá Số Tử Vi Đẩu Số
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Thuật toán độc lập xác thực theo <span className="text-amber-300 font-semibold">Tử Vi Đẩu Số Toàn Thư</span> (Hi Di Trần Đoàn - Vũ Tài Lục), xử lý chính xác tiết khí, tháng nhuận và ranh giới canh giờ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-slate-900/90 rounded-2xl border border-amber-900/40 p-5 sm:p-6 shadow-xl space-y-5">
          {/* Họ tên & Giới tính */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Họ và Tên đương số
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nhập họ tên hoặc biệt danh..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Giới tính quy ước
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Nam')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    gender === 'Nam'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Nam (Dương)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Nữ')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    gender === 'Nữ'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Nữ (Âm)
                </button>
              </div>
            </div>
          </div>

          {/* Chọn Loại Lịch: Dương Lịch hay Âm Lịch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Ngày Tháng Năm Sinh
              </label>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCalendarType('solar')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    calendarType === 'solar'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dương Lịch
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarType('lunar')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    calendarType === 'lunar'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Âm Lịch
                </button>
              </div>
            </div>

            {/* Input Controls for Date */}
            {calendarType === 'solar' ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Ngày (Dương)</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={solarDay}
                    onChange={e => setSolarDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Tháng (Dương)</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={solarMonth}
                    onChange={e => setSolarMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Năm (Dương)</span>
                  <input
                    type="number"
                    min={1900}
                    max={2099}
                    value={solarYear}
                    onChange={e => setSolarYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Ngày (Âm)</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={lunarDay}
                      onChange={e => handleLunarChange(Number(e.target.value), lunarMonth, lunarYear, isLeapMonth)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Tháng (Âm)</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={lunarMonth}
                      onChange={e => handleLunarChange(lunarDay, Number(e.target.value), lunarYear, isLeapMonth)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Năm (Âm)</span>
                    <input
                      type="number"
                      min={1900}
                      max={2099}
                      value={lunarYear}
                      onChange={e => handleLunarChange(lunarDay, lunarMonth, Number(e.target.value), isLeapMonth)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="leapMonthCheck"
                    checked={isLeapMonth}
                    onChange={e => handleLunarChange(lunarDay, lunarMonth, lunarYear, e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="leapMonthCheck" className="text-xs text-slate-300">
                    Tháng Nhuận (nếu rơi vào tháng nhuận của năm âm lịch)
                  </label>
                </div>
              </div>
            )}

            {/* Error message */}
            {dateError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{dateError}</span>
              </div>
            )}

            {/* Chú giải chuyển đổi ngày */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                <span className="text-slate-500">Đối ứng Âm Lịch: </span>
                <span className="text-amber-300 font-semibold">
                  Ngày {lunarDay} tháng {lunarMonth}{isLeapMonth ? ' (Nhuận)' : ''} năm {lunarYear}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Đối ứng Dương Lịch: </span>
                <span className="text-slate-300 font-mono">
                  {solarDay}/{solarMonth}/{solarYear}
                </span>
              </div>
            </div>
          </div>

          {/* Giờ sinh & Canh giờ */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Giờ & Phút Sinh
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Giờ (0 - 23)</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={e => setHour(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Phút (0 - 59)</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={e => setMinute(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-500 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-400 block mb-1">Canh giờ Tử Vi tương ứng</span>
                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-between">
                  <span>Giờ {hourInfo.chi}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {hourInfo.isLateRat ? 'Tý muộn (trước 24h)' : hourInfo.isEarlyRat ? 'Tý sớm (sau 00h)' : 'Canh chuẩn'}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning for boundary hours */}
            {(hour === 23 || hour === 0 || minute >= 55 || minute <= 5) && (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Cảnh báo ranh giới giờ sinh: </span>
                  Thời điểm sinh sát ranh giới canh giờ ({hour}:{minute.toString().padStart(2, '0')}). Hãy kiểm tra kỹ giấy chứng sinh hoặc đối chiếu các sự kiện lớn để xác định chính xác cung Mệnh Thân.
                </div>
              </div>
            )}
          </div>

          {/* Múi giờ, Nơi sinh & Độ chính xác */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Múi giờ</span>
              <select
                value={timeZone}
                onChange={e => setTimeZone(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value={7}>UTC+7 (Việt Nam, Thái Lan, Jakarta)</option>
                <option value={8}>UTC+8 (Singapore, Bắc Kinh, Đài Loan)</option>
                <option value={9}>UTC+9 (Tokyo, Seoul)</option>
                <option value={0}>UTC+0 (London, GMT chuẩn)</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Nơi sinh</span>
              <input
                type="text"
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                placeholder="VD: Hà Nội, TP.HCM..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Độ chính xác</span>
              <select
                value={timeAccuracy}
                onChange={e => setTimeAccuracy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="Chính xác theo giấy khai sinh">Chính xác (khai sinh)</option>
                <option value="Người thân nhớ chính xác">Gia đình nhớ rõ</option>
                <option value="Ước lượng trong khoảng nửa tiếng">Ước lượng ±30p</option>
                <option value="Không rõ phút">Chỉ nhớ khoảng giờ</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-serif text-sm uppercase tracking-wider shadow-lg shadow-amber-900/40 border border-amber-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Tiến Hành Khảo Lập Lá Số</span>
            </button>
          </div>
        </form>

        {/* Right 1 Col: Presets & Saved charts */}
        <div className="space-y-4">
          {/* Presets */}
          <div className="bg-slate-900/90 rounded-2xl border border-amber-900/40 p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Lá Số Khảo Sát Điển Hình
            </h3>
            <p className="text-[11px] text-slate-400">
              Chọn mẫu có sẵn để khảo chứng các cách cục danh tiếng trong cổ thư:
            </p>
            <div className="space-y-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setName(preset.params.name);
                    setGender(preset.params.gender);
                    setSolarDay(preset.params.d);
                    setSolarMonth(preset.params.m);
                    setSolarYear(preset.params.y);
                    setHour(preset.params.h);
                    setMinute(preset.params.min);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Charts History & Backup */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Hồ Sơ Đã Lưu ({savedCharts.length})
              </h3>

              {/* Import button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Nhập hồ sơ lá số từ tệp JSON"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>Nhập</span>
                </button>
              </div>
            </div>

            {savedCharts.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic py-2 text-center">
                Chưa có lá số nào được lưu vào danh sách.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {savedCharts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSavedChart(sc)}
                      className="text-left flex-1 truncate cursor-pointer"
                    >
                      <span className="font-semibold text-slate-200 block truncate max-w-[130px]">{sc.profile.name}</span>
                      <span className="text-[10px] text-slate-500">{sc.profile.solarDate} ({sc.profile.gender})</span>
                    </button>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {sc.cuc.name}
                      </span>
                      {onDeleteSavedChart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Bạn có chắc muốn xóa lá số của "${sc.profile.name}"?`)) {
                              onDeleteSavedChart(idx);
                            }
                          }}
                          className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Xóa hồ sơ lá số này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
