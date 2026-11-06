import React, { useState, useRef } from 'react';
import { Palace, TuViChart, ElementType } from '../engine/tuvi';
import { Eye, Printer, Sparkles, Compass, Info, LayoutGrid, List, ZoomIn, ZoomOut } from 'lucide-react';

interface TuViGridProps {
  chart: TuViChart;
  onSelectPalace: (palace: Palace) => void;
  selectedPalaceIndex: number | null;
  onOpenInterpret: (topic: string, palaceName?: string) => void;
}

// Màu sắc ngũ hành theo chuẩn học thuật phong thủy Á Đông (độ tương phản cao, dễ đọc)
export const ELEMENT_COLORS: Record<ElementType, { text: string; bg: string; border: string; badge: string }> = {
  Kim: {
    text: 'text-slate-100',
    bg: 'bg-slate-800/90',
    border: 'border-slate-400',
    badge: 'bg-slate-700/80 text-slate-100 border-slate-500'
  },
  Mộc: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-950/70',
    border: 'border-emerald-500',
    badge: 'bg-emerald-900/80 text-emerald-200 border-emerald-600'
  },
  Thủy: {
    text: 'text-sky-300',
    bg: 'bg-sky-950/70',
    border: 'border-sky-500',
    badge: 'bg-sky-900/80 text-sky-200 border-sky-600'
  },
  Hỏa: {
    text: 'text-rose-300',
    bg: 'bg-rose-950/70',
    border: 'border-rose-500',
    badge: 'bg-rose-900/80 text-rose-200 border-rose-600'
  },
  Thổ: {
    text: 'text-amber-300',
    bg: 'bg-amber-950/70',
    border: 'border-amber-500',
    badge: 'bg-amber-900/80 text-amber-200 border-amber-600'
  },
};

export const TuViGrid: React.FC<TuViGridProps> = ({
  chart,
  onSelectPalace,
  selectedPalaceIndex,
  onOpenInterpret
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [textScale, setTextScale] = useState<'normal' | 'large'>('normal');
  const gridRef = useRef<HTMLDivElement>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedPalaceIndex;
  const activePalace = activeIndex !== null ? chart.palaces[activeIndex] : null;

  // Lấy danh sách cung tam phương tứ chính của cung đang active
  const highlightedIndices = React.useMemo(() => {
    if (!activePalace) return [];
    return [
      activePalace.index,
      activePalace.xungChieuIndex,
      ...activePalace.tamHopIndices,
      activePalace.nhiHopIndex
    ];
  }, [activePalace]);

  // Vị trí các cung trên lưới 4x4 (Row, Col)
  // Row 0 (Top): Tị (5), Ngọ (6), Mùi (7), Thân (8)
  // Row 1: Thìn (4), [Trung Cung 2x2], Dậu (9)
  // Row 2: Mão (3), [Trung Cung 2x2], Tuất (10)
  // Row 3 (Bottom): Dần (2), Sửu (1), Tý (0), Hợi (11)
  const cellPositions: { [index: number]: { row: number; col: number } } = {
    5: { row: 0, col: 0 },
    6: { row: 0, col: 1 },
    7: { row: 0, col: 2 },
    8: { row: 0, col: 3 },
    4: { row: 1, col: 0 },
    9: { row: 1, col: 3 },
    3: { row: 2, col: 0 },
    10: { row: 2, col: 3 },
    2: { row: 3, col: 0 },
    1: { row: 3, col: 1 },
    0: { row: 3, col: 2 },
    11: { row: 3, col: 3 }
  };

  const handlePrint = () => {
    window.print();
  };

  // Sắp xếp danh sách 12 cung cho chế độ xem danh sách bắt đầu từ cung Mệnh
  const sortedPalacesForList = React.useMemo(() => {
    const list: Palace[] = [];
    const menhIdx = chart.menhPalaceIndex;
    for (let i = 0; i < 12; i++) {
      const idx = (menhIdx + i) % 12;
      list.push(chart.palaces[idx]);
    }
    return list;
  }, [chart]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Control bar */}
      <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-4 p-2.5 sm:p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 backdrop-blur-sm shadow-md no-print">
        {/* Left: Đương số summary */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Đương số:</span>
          <span className="text-sm font-bold text-amber-300">
            {chart.profile.name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {chart.profile.gender} ({chart.amDuongNamNu})
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-600/40 font-medium">
            {chart.cuc.name} • {chart.menhNguHanh.name}
          </span>
        </div>

        {/* Right: View mode and display controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Bố cục bàn cờ 4x4 truyền thống"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bàn Cờ 4x4</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Xem danh sách 12 cung chữ lớn, không cắt chữ"
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh Sách 12 Cung</span>
            </button>
          </div>

          {/* Text size toggle */}
          <button
            onClick={() => setTextScale(prev => (prev === 'normal' ? 'large' : 'normal'))}
            className={`px-2.5 py-1 text-xs rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer ${
              textScale === 'large'
                ? 'bg-amber-950/60 text-amber-300 border-amber-600'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
            title="Điều chỉnh cỡ chữ hiển thị"
          >
            {textScale === 'large' ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>{textScale === 'large' ? 'Cỡ chữ: Lớn' : 'Cỡ chữ: Chuẩn'}</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="px-2.5 py-1 text-xs rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="In lá số ra giấy hoặc xuất PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>In Lá Số</span>
          </button>
        </div>
      </div>

      {/* View Mode 1: Traditional 4x4 Grid */}
      {viewMode === 'grid' && (
        <div className="w-full max-w-6xl">
          {/* Mobile swipe helper hint */}
          <div className="lg:hidden text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-1.5 mb-2 text-center flex items-center justify-center gap-1.5">
            <span>👉</span>
            <span>Mẹo: Bạn có thể vuốt ngang bàn cờ hoặc bấm <strong>"Danh Sách 12 Cung"</strong> ở trên để đọc chữ to không bị ép khung.</span>
          </div>

          {/* Horizontal scroll wrapper for small devices to guarantee min-width and no text squeeze */}
          <div className="overflow-x-auto pb-3 w-full palace-scrollbar">
            <div
              ref={gridRef}
              className="min-w-[760px] lg:min-w-full bg-slate-950 p-2 sm:p-4 rounded-2xl border border-amber-900/40 shadow-2xl relative select-none"
            >
              {/* The 4x4 Grid */}
              <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 min-h-[720px] lg:min-h-[780px] w-full relative">
                {/* SVG Overlay for Tam Phương Tứ Chính ray connections */}
                {activePalace && cellPositions[activePalace.index] && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-all duration-300"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <filter id="rayGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="0.8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Tam Hợp tam giác */}
                    <polygon
                      points={`
                        ${(cellPositions[activePalace.index].col + 0.5) * 25},${(cellPositions[activePalace.index].row + 0.5) * 25}
                        ${(cellPositions[activePalace.tamHopIndices[0]].col + 0.5) * 25},${(cellPositions[activePalace.tamHopIndices[0]].row + 0.5) * 25}
                        ${(cellPositions[activePalace.tamHopIndices[1]].col + 0.5) * 25},${(cellPositions[activePalace.tamHopIndices[1]].row + 0.5) * 25}
                      `}
                      fill="rgba(56, 189, 248, 0.05)"
                      stroke="#38BDF8"
                      strokeWidth="0.8"
                      strokeDasharray="2.5 1.5"
                      filter="url(#rayGlow)"
                    />

                    {/* Xung Chiếu đường đối đỉnh */}
                    <line
                      x1={(cellPositions[activePalace.index].col + 0.5) * 25}
                      y1={(cellPositions[activePalace.index].row + 0.5) * 25}
                      x2={(cellPositions[activePalace.xungChieuIndex].col + 0.5) * 25}
                      y2={(cellPositions[activePalace.xungChieuIndex].row + 0.5) * 25}
                      stroke="#F87171"
                      strokeWidth="0.9"
                      strokeDasharray="2 1.5"
                      filter="url(#rayGlow)"
                    />

                    {/* Nhị Hợp đường kết nối */}
                    <line
                      x1={(cellPositions[activePalace.index].col + 0.5) * 25}
                      y1={(cellPositions[activePalace.index].row + 0.5) * 25}
                      x2={(cellPositions[activePalace.nhiHopIndex].col + 0.5) * 25}
                      y2={(cellPositions[activePalace.nhiHopIndex].row + 0.5) * 25}
                      stroke="#C084FC"
                      strokeWidth="0.6"
                      strokeDasharray="1.5 1.5"
                    />

                    {/* Điểm nhấn trung tâm */}
                    <circle
                      cx={(cellPositions[activePalace.index].col + 0.5) * 25}
                      cy={(cellPositions[activePalace.index].row + 0.5) * 25}
                      r="1.2"
                      fill="#FBBF24"
                    />
                    <circle
                      cx={(cellPositions[activePalace.xungChieuIndex].col + 0.5) * 25}
                      cy={(cellPositions[activePalace.xungChieuIndex].row + 0.5) * 25}
                      r="1"
                      fill="#F87171"
                    />
                    <circle
                      cx={(cellPositions[activePalace.tamHopIndices[0]].col + 0.5) * 25}
                      cy={(cellPositions[activePalace.tamHopIndices[0]].row + 0.5) * 25}
                      r="1"
                      fill="#38BDF8"
                    />
                    <circle
                      cx={(cellPositions[activePalace.tamHopIndices[1]].col + 0.5) * 25}
                      cy={(cellPositions[activePalace.tamHopIndices[1]].row + 0.5) * 25}
                      r="1"
                      fill="#38BDF8"
                    />
                  </svg>
                )}

                {/* Row 0 (Top) */}
                {renderPalaceCard(chart.palaces[5])}
                {renderPalaceCard(chart.palaces[6])}
                {renderPalaceCard(chart.palaces[7])}
                {renderPalaceCard(chart.palaces[8])}

                {/* Row 1 Left */}
                {renderPalaceCard(chart.palaces[4])}

                {/* Thiên Bàn Trung Cung (Spans 2 cols, 2 rows) */}
                <div className="col-span-2 row-span-2 bg-gradient-to-br from-slate-900/95 via-slate-950/98 to-amber-950/30 rounded-xl border border-amber-500/40 p-3 sm:p-5 flex flex-col justify-between shadow-2xl relative">
                  {/* Background watermark */}
                  <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                    <Compass className="w-56 h-56 text-amber-300" />
                  </div>

                  {/* Header info */}
                  <div className="text-center border-b border-amber-900/50 pb-2">
                    <div className="flex items-center justify-center gap-2">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <h2 className="text-base sm:text-lg font-bold font-serif uppercase tracking-wider text-amber-200">
                        LÁ SỐ TỬ VI ĐẨU SỐ
                      </h2>
                    </div>
                    <p className="text-[11px] text-amber-400/90 mt-0.5">
                      Khảo Chứng: Tử Vi Đẩu Số Toàn Thư (Hi Di Trần Đoàn - Vũ Tài Lục)
                    </p>
                  </div>

                  {/* Profile specifications table */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs my-auto py-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Họ và Tên:</span>
                        <span className="font-bold text-amber-300 break-words max-w-[140px] text-right">{chart.profile.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Giới Tính:</span>
                        <span className="font-semibold text-slate-200">{chart.profile.gender} ({chart.amDuongNamNu})</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Dương Lịch:</span>
                        <span className="text-slate-200">{chart.profile.solarDate} ({chart.profile.solarTime})</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Âm Lịch:</span>
                        <span className="text-amber-200 font-semibold">
                          Ngày {chart.profile.lunarDate.day}/{chart.profile.lunarDate.month}/{chart.profile.lunarDate.year}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Năm Can Chi:</span>
                        <span className="font-bold text-amber-400">
                          {chart.profile.lunarDate.canYear} {chart.profile.lunarDate.chiYear}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Tháng - Ngày - Giờ:</span>
                        <span className="text-slate-300">
                          {chart.profile.lunarDate.canMonth} {chart.profile.lunarDate.chiMonth} • {chart.profile.lunarDate.canHour} {chart.profile.lunarDate.chiHour}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Bản Mệnh:</span>
                        <span className="font-semibold text-rose-300">{chart.menhNguHanh.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-0.5">
                        <span className="text-slate-400">Cục Thế:</span>
                        <span className="font-semibold text-sky-300">{chart.cuc.name} (Số {chart.cuc.number})</span>
                      </div>
                    </div>
                  </div>

                  {/* Special stars & attributes */}
                  <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-[11px] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400">Mệnh Chủ: </span>
                      <span className="text-amber-300 font-semibold">{chart.menhChu}</span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className="text-slate-400">Thân Chủ: </span>
                      <span className="text-amber-300 font-semibold">{chart.thanChu}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Triệt Tại: </span>
                      <span className="text-rose-400 font-bold">{chart.trietPalaces.map(i => chart.palaces[i].chi).join('-')}</span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className="text-slate-400">Tuần Tại: </span>
                      <span className="text-amber-400 font-bold">{chart.tuanPalaces.map(i => chart.palaces[i].chi).join('-')}</span>
                    </div>
                  </div>

                  {/* Highlights pills */}
                  {chart.highlights.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {chart.highlights.map((hl, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        >
                          ★ {hl}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-amber-900/50">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Nhấp vào từng ô cung để chiếu tia Tam Phương Tứ Chính
                    </span>
                    <button
                      onClick={() => onOpenInterpret('Tong_Quan')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-md shadow-md flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Luận Giải Toàn Bản</span>
                    </button>
                  </div>
                </div>

                {/* Row 1 Right */}
                {renderPalaceCard(chart.palaces[9])}

                {/* Row 2 Left */}
                {renderPalaceCard(chart.palaces[3])}

                {/* Row 2 Right */}
                {renderPalaceCard(chart.palaces[10])}

                {/* Row 3 (Bottom) */}
                {renderPalaceCard(chart.palaces[2])}
                {renderPalaceCard(chart.palaces[1])}
                {renderPalaceCard(chart.palaces[0])}
                {renderPalaceCard(chart.palaces[11])}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode 2: Sequential 12 Palaces List View (Perfect for mobile & reading with zero truncation) */}
      {viewMode === 'list' && (
        <div className="w-full max-w-6xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sortedPalacesForList.map(p => {
              const isSelected = selectedPalaceIndex === p.index;
              const doiCung = chart.palaces[p.xungChieuIndex];
              const tamHop1 = chart.palaces[p.tamHopIndices[0]];
              const tamHop2 = chart.palaces[p.tamHopIndices[1]];

              return (
                <div
                  key={p.index}
                  className={`rounded-2xl border p-4 bg-slate-900/80 transition-all ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-sm">
                        {p.chi}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-amber-200">
                            Cung {p.name}
                          </h3>
                          {p.isMenh && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white">
                              MỆNH
                            </span>
                          )}
                          {p.isThan && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-600 text-white">
                              THÂN
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          Can Chi: {p.can} {p.chi}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.hasTriet && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">
                          TRIỆT
                        </span>
                      )}
                      {p.hasTuan && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                          TUẦN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Stars (14 Chính Tinh) */}
                  <div className="mb-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Chính Tinh Tọa Thủ:
                    </span>
                    {p.chinhTinh.length === 0 ? (
                      <span className="text-xs text-slate-400 italic bg-slate-950 px-2 py-1 rounded block">
                        Vô Chính Diệu (mượn chính tinh cung {doiCung.chi} - {doiCung.name})
                      </span>
                    ) : (
                      <div className="space-y-1">
                        {p.chinhTinh.map((star, sIdx) => {
                          const elem = ELEMENT_COLORS[star.element] || ELEMENT_COLORS.Thổ;
                          return (
                            <div
                              key={sIdx}
                              className={`flex items-center justify-between px-2.5 py-1 rounded border ${elem.border} ${elem.bg}`}
                            >
                              <span className={`font-bold text-sm ${elem.text}`}>{star.name}</span>
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-500/40">
                                {star.brightness} ({getBrightnessTitle(star.brightness)})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Minor Stars: Cát Tinh (100% full list, zero slicing) */}
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                      Cát Tinh & Quý Tinh ({p.phuTinhTot.length}):
                    </span>
                    {p.phuTinhTot.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">Không có cát tinh phụ</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.phuTinhTot.map((star, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-xs px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-200 border border-emerald-500/30"
                          >
                            {star.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Minor Stars: Sát Tinh & Hung Tinh (100% full list, zero slicing) */}
                  <div className="mb-2.5">
                    <span className="text-[11px] font-bold text-rose-400 block mb-1">
                      Sát Tinh & Hung Tinh ({p.phuTinhXau.length}):
                    </span>
                    {p.phuTinhXau.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">Thuần tĩnh, không có sát tinh trực tiếp</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.phuTinhXau.map((star, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-xs px-2 py-0.5 rounded bg-rose-950/50 text-rose-200 border border-rose-500/30"
                          >
                            {star.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cycles & Limit Info */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tràng Sinh • Bác Sỹ:</span>
                      <span className="text-slate-200 font-medium">{p.vongTrangSinh} • {p.vongBacSy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thái Tuế:</span>
                      <span className="text-amber-300 font-medium">{p.vongThaiTue}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Đại Hạn (10 năm):</span>
                      <span className="text-amber-400 font-bold">{p.daiHanAge} - {p.daiHanAge + 9} tuổi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiểu Hạn lưu niên:</span>
                      <span className="text-sky-300 font-bold">Năm {p.tieuHanChi}</span>
                    </div>
                  </div>

                  {/* Tam Phương Tứ Chính Info */}
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-3 space-y-0.5">
                    <div>
                      <span className="text-rose-400 font-semibold">Đối Xung ({doiCung.chi} - {doiCung.name}): </span>
                      <span className="text-slate-300">
                        {doiCung.chinhTinh.map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sky-400 font-semibold">Tam Hợp ({tamHop1.chi} & {tamHop2.chi}): </span>
                      <span className="text-slate-300">
                        {[...tamHop1.chinhTinh, ...tamHop2.chinhTinh].map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => onSelectPalace(p)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-sky-400" />
                      <span>Xem toàn bộ</span>
                    </button>
                    <button
                      onClick={() => onOpenInterpret(p.name, p.name)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Luận giải AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Palace Quick Drawer Panel */}
      {activePalace && (
        <div className="w-full max-w-6xl mt-4 bg-slate-900/95 rounded-xl border border-amber-500/40 p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-lg">
              {activePalace.chi}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-amber-200 uppercase font-serif">
                  Cung {activePalace.name} ({activePalace.can} {activePalace.chi})
                </h3>
                {activePalace.isMenh && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                    MỆNH
                  </span>
                )}
                {activePalace.isThan && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                    THÂN
                  </span>
                )}
                {activePalace.hasTriet && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">
                    TRIỆT
                  </span>
                )}
                {activePalace.hasTuan && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                    TUẦN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Chính tinh: {activePalace.chinhTinh.map(s => `${s.name} (${s.brightness})`).join(', ') || 'Vô Chính Diệu'} • Đại hạn: {activePalace.daiHanAge} - {activePalace.daiHanAge + 9} tuổi • Tiểu hạn: Năm {activePalace.tieuHanChi} • {activePalace.vongTrangSinh}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <div className="text-xs text-slate-400 hidden lg:block mr-2">
              Tam Hợp: <span className="text-slate-200 font-semibold">{chart.palaces[activePalace.tamHopIndices[0]].chi} & {chart.palaces[activePalace.tamHopIndices[1]].chi}</span> • Xung: <span className="text-slate-200 font-semibold">{chart.palaces[activePalace.xungChieuIndex].chi}</span>
            </div>
            <button
              onClick={() => onSelectPalace(activePalace)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Xem chi tiết</span>
            </button>
            <button
              onClick={() => onOpenInterpret(activePalace.name, activePalace.name)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Luận giải cung {activePalace.name}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function renderPalaceCard(p: Palace) {
    const isSelected = selectedPalaceIndex === p.index;
    const isHovered = hoveredIndex === p.index;
    const isTamHop = activePalace && activePalace.tamHopIndices.includes(p.index);
    const isXungChieu = activePalace && activePalace.xungChieuIndex === p.index;
    const isNhiHop = activePalace && activePalace.nhiHopIndex === p.index;

    // Viền và hiệu ứng ánh xạ
    let borderClass = 'border-slate-800/80 bg-slate-900/70 hover:bg-slate-900/95';
    if (isSelected || isHovered) {
      borderClass = 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-900 z-20 shadow-xl shadow-amber-500/10';
    } else if (isXungChieu) {
      borderClass = 'border-rose-500/80 ring-1 ring-rose-500/40 bg-rose-950/30';
    } else if (isTamHop) {
      borderClass = 'border-sky-500/80 ring-1 ring-sky-500/40 bg-sky-950/30';
    } else if (isNhiHop) {
      borderClass = 'border-purple-500/70 bg-purple-950/20';
    }

    const titleSize = textScale === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm';
    const mainStarSize = textScale === 'large' ? 'text-xs sm:text-sm' : 'text-xs sm:text-[13px]';
    const minorStarSize = textScale === 'large' ? 'text-[10px] sm:text-xs' : 'text-[9.5px] sm:text-[10.5px]';

    return (
      <div
        key={p.index}
        onClick={() => onSelectPalace(p)}
        onMouseEnter={() => setHoveredIndex(p.index)}
        onMouseLeave={() => setHoveredIndex(null)}
        className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer relative min-h-[195px] sm:min-h-[210px] ${borderClass}`}
      >
        {/* Corner labels for Tuần / Triệt */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
          {p.hasTriet && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-700 text-white shadow-sm border border-rose-500">
              TRIỆT
            </span>
          )}
          {p.hasTuan && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-600 text-white shadow-sm border border-amber-400">
              TUẦN
            </span>
          )}
        </div>

        {/* Header: Palace Name & Branch */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap pr-12">
            <span className={`${titleSize} font-bold text-amber-200 tracking-wide uppercase break-words leading-snug`}>
              {p.name}
            </span>
            {p.isMenh && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                MỆNH
              </span>
            )}
            {p.isThan && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-600 text-white">
                THÂN
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-300 flex-shrink-0">
            {p.can} {p.chi}
          </span>
        </div>

        {/* Content: Main Stars & Minor Stars (Scrollable if many stars, 0% truncation) */}
        <div className="flex-1 my-1.5 space-y-1.5 overflow-y-auto max-h-[160px] sm:max-h-[185px] palace-scrollbar pr-0.5">
          {/* 14 Chính Tinh */}
          <div className="space-y-0.5">
            {p.chinhTinh.length === 0 ? (
              <div className="text-[11px] italic text-slate-400 py-0.5">
                Vô Chính Diệu
              </div>
            ) : (
              p.chinhTinh.map((star, idx) => {
                const elem = ELEMENT_COLORS[star.element] || ELEMENT_COLORS.Thổ;
                return (
                  <div key={idx} className={`flex items-center justify-between ${mainStarSize} font-bold leading-snug`}>
                    <span className={`${elem.text} break-words pr-1`}>{star.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-serif ${getBrightnessBadge(star.brightness)}`}
                      title={`${star.brightness} - ${getBrightnessTitle(star.brightness)}`}
                    >
                      ({star.brightness})
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Phụ Tinh Cát (100% full list, ZERO slicing) */}
          {p.phuTinhTot.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/50">
              {p.phuTinhTot.map((star, idx) => (
                <span
                  key={idx}
                  className={`${minorStarSize} text-emerald-300 font-medium leading-snug bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20`}
                >
                  {star.name}
                </span>
              ))}
            </div>
          )}

          {/* Phụ Tinh Sát / Hung (100% full list, ZERO slicing) */}
          {p.phuTinhXau.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/50">
              {p.phuTinhXau.map((star, idx) => (
                <span
                  key={idx}
                  className={`${minorStarSize} text-rose-300 font-medium leading-snug bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20`}
                >
                  {star.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Tràng Sinh, Bác Sỹ, Thái Tuế & Đại Hạn Tuổi (No truncation) */}
        <div className="border-t border-slate-800/80 pt-1 text-[10px] text-slate-300 flex items-center justify-between gap-1 leading-snug">
          <span className="text-slate-300 font-medium break-words leading-snug">
            {p.vongTrangSinh} • {p.vongBacSy}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
            <span className="text-sky-300 font-medium" title={`Tiểu hạn năm ${p.tieuHanChi}`}>
              {p.tieuHanChi}
            </span>
            <span className="font-bold text-amber-300" title={`Đại hạn ${p.daiHanAge} - ${p.daiHanAge + 9} tuổi`}>
              {p.daiHanAge}
            </span>
          </div>
        </div>
      </div>
    );
  }

  function getBrightnessTitle(b?: string) {
    switch (b) {
      case 'M': return 'Miếu địa';
      case 'V': return 'Vượng địa';
      case 'Đ': return 'Đắc địa';
      case 'B': return 'Bình hòa';
      case 'H': return 'Hãm địa';
      default: return 'Bình hòa';
    }
  }

  function getBrightnessBadge(b?: string) {
    switch (b) {
      case 'M': return 'text-amber-300 font-bold bg-amber-950/60 border border-amber-600/40'; // Miếu
      case 'V': return 'text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-600/40'; // Vượng
      case 'Đ': return 'text-sky-300 font-bold bg-sky-950/60 border border-sky-600/40'; // Đắc
      case 'B': return 'text-slate-300 bg-slate-800 border border-slate-700'; // Bình
      case 'H': return 'text-rose-400 font-bold bg-rose-950/60 border border-rose-600/40'; // Hãm
      default: return 'text-slate-400';
    }
  }
};
