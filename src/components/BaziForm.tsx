import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, User, AlertCircle, Compass } from 'lucide-react';

interface BaziFormProps {
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
    dayBoundaryOption: 'RatBoundary' | 'MidnightBoundary';
  }) => void;
  isLoading?: boolean;
  initialSolarDate?: { day: number; month: number; year: number } | null;
}

export const BaziForm: React.FC<BaziFormProps> = ({ onSubmit, isLoading, initialSolarDate }) => {
  const [name, setName] = useState('Nguyễn Văn An');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [solarDay, setSolarDay] = useState(initialSolarDate?.day ?? 15);
  const [solarMonth, setSolarMonth] = useState(initialSolarDate?.month ?? 8);
  const [solarYear, setSolarYear] = useState(initialSolarDate?.year ?? 1995);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(30);
  const [timeZone, setTimeZone] = useState(7);
  const [birthPlace, setBirthPlace] = useState('Hà Nội, Việt Nam');
  const [timeAccuracy, setTimeAccuracy] = useState('Chính xác');
  const [dayBoundaryOption, setDayBoundaryOption] = useState<'RatBoundary' | 'MidnightBoundary'>('RatBoundary');

  useEffect(() => {
    if (initialSolarDate) {
      setSolarDay(initialSolarDate.day);
      setSolarMonth(initialSolarDate.month);
      setSolarYear(initialSolarDate.year);
    }
  }, [initialSolarDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      gender,
      solarDay: Number(solarDay),
      solarMonth: Number(solarMonth),
      solarYear: Number(solarYear),
      hour: Number(hour),
      minute: Number(minute),
      timeZone: Number(timeZone),
      birthPlace,
      timeAccuracy,
      dayBoundaryOption
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-amber-900/30 pb-4 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-amber-100 font-serif">Lập Lá Số Bát Tự – Tứ Trụ</h2>
          <p className="text-xs text-slate-400">
            Tính toán theo Thiên Văn Mặt Trời (Jean Meeus), Lập Xuân và Tiết Khí chuẩn mực Tử Bình
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Họ tên & Giới tính */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Họ và tên (Tùy chọn)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên hoặc biệt danh..."
              className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Giới tính</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('Nam')}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  gender === 'Nam'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Nam
              </button>
              <button
                type="button"
                onClick={() => setGender('Nữ')}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  gender === 'Nữ'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Nữ
              </button>
            </div>
          </div>
        </div>

        {/* Ngày tháng năm sinh (Dương lịch chuẩn thiên văn) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Ngày sinh (Dương lịch)
            </span>
            <span className="text-[11px] text-amber-400/80">Bộ máy sẽ tự động tính Tiết Khí & Lập Xuân</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                min="1"
                max="31"
                value={solarDay}
                onChange={(e) => setSolarDay(Number(e.target.value))}
                placeholder="Ngày"
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-500/60"
                required
              />
              <span className="block text-[10px] text-slate-500 text-center mt-1">Ngày (1-31)</span>
            </div>
            <div>
              <input
                type="number"
                min="1"
                max="12"
                value={solarMonth}
                onChange={(e) => setSolarMonth(Number(e.target.value))}
                placeholder="Tháng"
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-500/60"
                required
              />
              <span className="block text-[10px] text-slate-500 text-center mt-1">Tháng (1-12)</span>
            </div>
            <div>
              <input
                type="number"
                min="1900"
                max="2100"
                value={solarYear}
                onChange={(e) => setSolarYear(Number(e.target.value))}
                placeholder="Năm"
                className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-500/60"
                required
              />
              <span className="block text-[10px] text-slate-500 text-center mt-1">Năm (1900-2100)</span>
            </div>
          </div>
        </div>

        {/* Giờ và phút sinh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Giờ & Phút sinh (24 giờ)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-500/60"
                required
              />
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-center text-slate-100 focus:outline-none focus:border-amber-500/60"
                required
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 px-2">
              <span>Giờ (0-23)</span>
              <span>Phút (0-59)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Nơi sinh & Múi giờ
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Tỉnh/Thành phố..."
                className="col-span-2 bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60"
              />
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-2 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value={7}>UTC+7</option>
                <option value={8}>UTC+8</option>
                <option value={9}>UTC+9</option>
                <option value={0}>UTC+0</option>
                <option value={-5}>UTC-5</option>
                <option value={-8}>UTC-8</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tùy chọn chuyên sâu & Ranh giới Giờ Tý */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Quy ước tính toán Bát Tự chuyên sâu
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Ranh giới đổi ngày (Giờ Tý):</label>
              <select
                value={dayBoundaryOption}
                onChange={(e) => setDayBoundaryOption(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="RatBoundary">Khởi ngày mới từ Giờ Tý (23:00) - Tử Bình Chuẩn</option>
                <option value="MidnightBoundary">Khởi ngày mới từ Nửa đêm (00:00) - Dân sự</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Độ chính xác giờ sinh:</label>
              <select
                value={timeAccuracy}
                onChange={(e) => setTimeAccuracy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="Chính xác">Chính xác (có giấy khai sinh / gia đình nhớ rõ)</option>
                <option value="Ước lượng theo canh">Ước lượng theo khoảng canh giờ</option>
                <option value="Không chắc chắn">Không chắc chắn (cần đối chiếu thực tế)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Đang tính toán Tiết Khí và Bốn Trụ...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              Lập Lá Số Bát Tự – Tứ Trụ
            </>
          )}
        </button>
      </form>
    </div>
  );
};
