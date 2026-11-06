import React from 'react';
import { BaziChart, PillarData, Element } from '../engine/bazi';
import { Flame, Droplets, Trees, Mountain, Shield, Info, Sparkles } from 'lucide-react';

interface BaziChartGridProps {
  chart: BaziChart;
  onPillarSelect?: (pillarName: string) => void;
}

export const ELEMENT_COLOR_MAP: Record<Element, {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  accent: string;
}> = {
  'Kim': {
    bg: 'bg-amber-100/10',
    border: 'border-amber-300/40',
    text: 'text-amber-200',
    badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
    accent: 'from-amber-400 to-yellow-600'
  },
  'Mộc': {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accent: 'from-emerald-400 to-green-600'
  },
  'Thủy': {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accent: 'from-cyan-400 to-blue-600'
  },
  'Hỏa': {
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accent: 'from-rose-400 to-red-600'
  },
  'Thổ': {
    bg: 'bg-amber-950/40',
    border: 'border-amber-600/40',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    accent: 'from-amber-500 to-yellow-700'
  }
};

const ZODIAC_ANIMALS: Record<string, string> = {
  'Tý': 'Chuột', 'Sửu': 'Trâu', 'Dần': 'Hổ', 'Mão': 'Mèo',
  'Thìn': 'Rồng', 'Tị': 'Rắn', 'Ngọ': 'Ngựa', 'Mùi': 'Dê',
  'Thân': 'Khỉ', 'Dậu': 'Gà', 'Tuất': 'Chó', 'Hợi': 'Lợn'
};

export const BaziChartGrid: React.FC<BaziChartGridProps> = ({ chart }) => {
  const pillarsList: Array<{ key: 'year' | 'month' | 'day' | 'hour'; data: PillarData; subtitle: string; roleTag: string }> = [
    {
      key: 'year',
      data: chart.pillars.year,
      subtitle: 'Tổ Tiên • Gốc Rễ Tiên Thiên',
      roleTag: 'Căn Cơ Tiên Thiên'
    },
    {
      key: 'month',
      data: chart.pillars.month,
      subtitle: 'Cha Mẹ • Nguyệt Lệnh Đương Quyền',
      roleTag: 'Nguyệt Lệnh (Trọng Tâm)'
    },
    {
      key: 'day',
      data: chart.pillars.day,
      subtitle: 'Bản Ngã (Nhật Can) & Phối Ngẫu',
      roleTag: 'Nhật Chủ (Bản Thể)'
    },
    {
      key: 'hour',
      data: chart.pillars.hour,
      subtitle: 'Con Cái • Hậu Vận Quy Túc',
      roleTag: 'Cung Tử Tức • Hậu Vận'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Thông tin hồ sơ lá số */}
      <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-200 font-serif tracking-wide">
                {chart.profile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {chart.profile.gender}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Nhật Chủ: {chart.dayMaster.can} ({chart.dayMaster.element})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sinh ngày: <strong className="text-slate-200">{chart.profile.solarDate}</strong> lúc <strong className="text-slate-200">{chart.profile.solarTime}</strong> • Múi giờ UTC+{chart.profile.timeZone} ({chart.profile.birthPlace})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-500">Tiết Khí:</span>
              <strong className="text-amber-300">{chart.monthSolarTerm.termName}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-500">Thực lực:</span>
              <strong className={`font-semibold ${
                chart.dayMasterStrength.level.includes('Vượng') ? 'text-rose-400'
                : chart.dayMasterStrength.level.includes('Nhược') ? 'text-cyan-400'
                : 'text-emerald-400'
              }`}>
                {chart.dayMasterStrength.level} ({chart.dayMasterStrength.score}/100đ)
              </strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dụng Thần: <strong>{chart.dungThanInfo.dungThan}</strong></span>
            </div>
          </div>
        </div>

        {/* Cảnh báo ranh giới nếu có */}
        {chart.warnings.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Lưu ý ranh giới tính toán Bát Tự:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                {chart.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* BẢNG 4 TRỤ (TỨ TRỤ) CHÍNH DIỆN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarsList.map((p) => {
          const canColors = ELEMENT_COLOR_MAP[p.data.canElement];
          const chiColors = ELEMENT_COLOR_MAP[p.data.chiElement];
          const isDayPillar = p.key === 'day';
          const isMonthPillar = p.key === 'month';

          return (
            <div
              key={p.key}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isDayPillar
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              {/* Pillar Header */}
              <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-serif">
                    {p.data.pillarName}
                    {isDayPillar && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400">{p.subtitle}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isDayPillar
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isMonthPillar
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {p.roleTag}
                </span>
              </div>

              {/* Main Can & Chi Representation */}
              <div className="p-4 space-y-4">
                {/* THIÊN CAN */}
                <div className={`p-3.5 rounded-xl border ${canColors.bg} ${canColors.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold font-serif text-slate-100 tracking-wider">
                      {p.data.can}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Thiên Can {p.data.can}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.data.canPolarity} {p.data.canElement}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${canColors.badgeBg}`}>
                      {isDayPillar ? 'NHẬT CHỦ' : p.data.tenGod}
                    </span>
                  </div>
                </div>

                {/* ĐỊA CHI */}
                <div className={`p-3.5 rounded-xl border ${chiColors.bg} ${chiColors.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold font-serif text-slate-100 tracking-wider">
                      {p.data.chi}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Địa Chi {p.data.chi} ({ZODIAC_ANIMALS[p.data.chi] || ''})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.data.chiPolarity} {p.data.chiElement}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Trường Sinh</span>
                    <span className="text-xs font-bold text-amber-300">
                      {p.data.trangSinh}
                    </span>
                  </div>
                </div>

                {/* NẠP ÂM */}
                <div className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Nạp Âm Hoa Giáp:</span>
                  <span className="font-semibold text-slate-200">
                    {p.data.napAm}
                  </span>
                </div>

                {/* TÀNG CAN (CHI TIẾT VÀ TỶ LỆ LỰC) */}
                <div className="space-y-2 pt-1 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Tàng Can (Ẩn trong {p.data.chi}):</span>
                    <span className="text-[10px] text-slate-500">Bản / Trung / Dư</span>
                  </div>

                  <div className="space-y-1.5">
                    {p.data.hiddenStems.map((stem, sIdx) => {
                      const stemColors = ELEMENT_COLOR_MAP[stem.element];
                      return (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              stem.type === 'Bản khí' ? 'bg-amber-400' : 'bg-slate-500'
                            }`} />
                            <strong className="text-slate-200 font-serif">{stem.can}</strong>
                            <span className="text-[11px] text-slate-400 font-sans">
                              ({stem.element})
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {stem.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-amber-300 font-medium">
                              {stem.tenGod}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {stem.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pillar Footer */}
              <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 text-[11px] text-center text-slate-400">
                {isDayPillar && 'Trục tọa độ xác định Thập Thần và Dụng Thần'}
                {isMonthPillar && `Tiết Lệnh nắm ${chart.elementAnalysis.breakdown[p.data.chiElement]?.percentage}% khí lệnh`}
                {p.key === 'year' && 'Đại diện tổ nghiệp, gốc rễ thời niên thiếu'}
                {p.key === 'hour' && 'Quy túc chung cuộc, sự nghiệp hậu vận'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
