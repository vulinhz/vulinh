import React, { useState } from 'react';
import { BaziChart, Element } from '../engine/bazi';
import { ELEMENT_COLOR_MAP } from './BaziChartGrid';
import {
  Activity,
  Flame,
  Shield,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Compass
} from 'lucide-react';

interface BaziAnalysisViewProps {
  chart: BaziChart;
}

export const BaziAnalysisView: React.FC<BaziAnalysisViewProps> = ({ chart }) => {
  const [subTab, setSubTab] = useState<'strength' | 'elements' | 'gods' | 'interactions' | 'dungthan' | 'luck' | 'annual'>('strength');
  const [selectedAnnualYear, setSelectedAnnualYear] = useState<number>(2025);

  const dm = chart.dayMaster;
  const st = chart.dayMasterStrength;
  const dt = chart.dungThanInfo;
  const ea = chart.elementAnalysis;
  const it = chart.interactions;

  // Tính Can Chi cho năm Lưu Niên được chọn
  const getAnnualPillar = (year: number) => {
    const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const can = CAN[((year - 4) % 10 + 10) % 10];
    const chi = CHI[((year - 4) % 12 + 12) % 12];
    const fullName = `${can} ${chi}`;

    // Kiểm tra tương tác với Trụ Năm (Thái Tuế) và Trụ Ngày (Nhật Chủ)
    const isThaiTue = chi === chart.pillars.year.chi;
    const isXungThaiTue = (
      (chi === 'Tý' && chart.pillars.year.chi === 'Ngọ') || (chi === 'Ngọ' && chart.pillars.year.chi === 'Tý') ||
      (chi === 'Sửu' && chart.pillars.year.chi === 'Mùi') || (chi === 'Mùi' && chart.pillars.year.chi === 'Sửu') ||
      (chi === 'Dần' && chart.pillars.year.chi === 'Thân') || (chi === 'Thân' && chart.pillars.year.chi === 'Dần') ||
      (chi === 'Mão' && chart.pillars.year.chi === 'Dậu') || (chi === 'Dậu' && chart.pillars.year.chi === 'Mão') ||
      (chi === 'Thìn' && chart.pillars.year.chi === 'Tuất') || (chi === 'Tuất' && chart.pillars.year.chi === 'Thìn') ||
      (chi === 'Tị' && chart.pillars.year.chi === 'Hợi') || (chi === 'Hợi' && chart.pillars.year.chi === 'Tị')
    );

    const isXungNhatChi = (
      (chi === 'Tý' && chart.pillars.day.chi === 'Ngọ') || (chi === 'Ngọ' && chart.pillars.day.chi === 'Tý') ||
      (chi === 'Sửu' && chart.pillars.day.chi === 'Mùi') || (chi === 'Mùi' && chart.pillars.day.chi === 'Sửu') ||
      (chi === 'Dần' && chart.pillars.day.chi === 'Thân') || (chi === 'Thân' && chart.pillars.day.chi === 'Dần') ||
      (chi === 'Mão' && chart.pillars.day.chi === 'Dậu') || (chi === 'Dậu' && chart.pillars.day.chi === 'Mão') ||
      (chi === 'Thìn' && chart.pillars.day.chi === 'Tuất') || (chi === 'Tuất' && chart.pillars.day.chi === 'Thìn') ||
      (chi === 'Tị' && chart.pillars.day.chi === 'Hợi') || (chi === 'Hợi' && chart.pillars.day.chi === 'Tị')
    );

    return {
      can,
      chi,
      fullName,
      isThaiTue,
      isXungThaiTue,
      isXungNhatChi
    };
  };

  const annualInfo = getAnnualPillar(selectedAnnualYear);

  return (
    <div className="space-y-6">
      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setSubTab('strength')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'strength'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Nhật Chủ & Thân Cường/Nhược
        </button>

        <button
          onClick={() => setSubTab('elements')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'elements'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Phân Bổ Ngũ Hành
        </button>

        <button
          onClick={() => setSubTab('dungthan')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'dungthan'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Dụng Thần & Hỷ Kỵ
        </button>

        <button
          onClick={() => setSubTab('interactions')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'interactions'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Quan Hệ Can Chi ({it.thienCanHop.length + it.diaChiLucHop.length + it.diaChiTamHop.length + it.diaChiLucXung.length})
        </button>

        <button
          onClick={() => setSubTab('luck')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'luck'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Tiến Trình Đại Vận (10 Năm)
        </button>

        <button
          onClick={() => setSubTab('annual')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            subTab === 'annual'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Lưu Niên ({selectedAnnualYear})
        </button>
      </div>

      {/* 1. TAB NHẬT CHỦ & THÂN CƯỜNG / NHƯỢC */}
      {subTab === 'strength' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột Gauge & Đánh Giá Tổng Thể */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Thực Lực Bản Thể Nhật Chủ
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-2">
              <span className="text-xs text-slate-400 block">Trạng thái xác định</span>
              <div className="text-2xl font-black text-amber-300 font-serif">
                {st.level}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    st.score >= 60 ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : st.score >= 45 ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  }`}
                  style={{ width: `${st.score}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0 (Cực Nhược)</span>
                <span className="text-amber-400 font-bold">{st.score} / 100</span>
                <span>100 (Cực Vượng)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Đắc Lệnh (Nguyệt Lệnh):</span>
                <span className={`font-semibold ${st.dacLenh ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {st.dacLenh ? 'Có (Đắc lệnh)' : 'Không (Thất lệnh)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Đắc Địa (Thông Căn):</span>
                <span className={`font-semibold ${st.dacDia ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {st.dacDia ? 'Có gốc vững chắc' : 'Gốc rễ yếu/phù phiếm'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Đắc Thế (Thiên Can Trợ):</span>
                <span className={`font-semibold ${st.dacThe ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {st.dacThe ? 'Có Tỷ Kiếp / Ấn trợ' : 'Không có trợ lực lộ'}
                </span>
              </div>
            </div>
          </div>

          {/* Cột Chi Tiết Yếu Tố Khí Lệnh */}
          <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Khảo Cứu Khí Thế Địch Thiên Tủy & Gốc Rễ
            </h3>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
              <span className="font-semibold text-amber-300">Khẩu quyết Địch Thiên Tủy cho Can {dm.can}:</span>
              <p className="italic text-slate-300 leading-relaxed font-serif">
                "{dm.nature}"
              </p>
              <p className="text-[11px] text-slate-400">
                Nhật Chủ {dm.can} thuộc hành {dm.element} {dm.polarity}. Gốc rễ thông căn tại các Địa Chi: <strong className="text-amber-300">{dm.rootBranches.length > 0 ? dm.rootBranches.join(', ') : 'Không có gốc rễ trực tiếp'}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Các yếu tố quyết định cấu trúc lực:</span>
              <div className="space-y-2">
                {st.factors.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB PHÂN BỔ NGŨ HÀNH */}
      {subTab === 'elements' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-amber-200 font-serif">
              Biểu Đồ Phân Bổ Ngũ Hành Toàn Cục
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {ea.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as Element[]).map((el) => {
              const b = ea.breakdown[el];
              const colors = ELEMENT_COLOR_MAP[el];
              const isStrongest = el === ea.strongestElement;
              const isWeakest = el === ea.weakestElement;

              return (
                <div
                  key={el}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${colors.bg} ${colors.border}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-slate-100 font-serif">{el}</span>
                      {isStrongest && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Vượng nhất
                        </span>
                      )}
                      {isWeakest && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Nhược nhất
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black text-slate-100 font-mono">
                      {b.percentage}%
                    </div>

                    <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.min(100, b.percentage * 2)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Điểm số:</span>
                      <strong className="text-slate-200 font-mono">{b.points}đ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Can lộ:</span>
                      <strong className="text-slate-200">{b.exposedCount}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tàng can:</span>
                      <strong className="text-slate-200">{b.hiddenCount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB DỤNG THẦN & HỶ KỴ */}
      {subTab === 'dungthan' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Dụng Thần, Hỷ Thần & Kỵ Thần
              </h3>
              <p className="text-xs text-slate-400">
                Phương pháp: <strong className="text-amber-300">{dt.method}</strong> • Nguồn: <strong className="text-slate-300">{dt.sourceBook}</strong>
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {dt.confidence}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dụng Thần */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/40 space-y-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
                Dụng Thần (Tối Thượng)
              </span>
              <div className="text-3xl font-black text-amber-200 font-serif">
                Hành {dt.dungThan}
              </div>
              <p className="text-xs text-slate-300">
                Hành đóng vai trò then chốt điều chỉnh toàn bộ mệnh cục trở về trạng thái cân bằng.
              </p>
            </div>

            {/* Hỷ Thần */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
                Hỷ Thần (Trợ Vận)
              </span>
              <div className="text-2xl font-bold text-emerald-200 font-serif">
                {dt.hyThan.join(', ')}
              </div>
              <p className="text-xs text-slate-400">
                Các ngũ hành tương sinh hoặc phụ trợ đắc lực cho Dụng Thần phát huy công năng.
              </p>
            </div>

            {/* Kỵ Thần */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
              <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider block">
                Kỵ Thần (Cần Tiết Chế)
              </span>
              <div className="text-2xl font-bold text-rose-200 font-serif">
                {dt.kyThan.join(', ')}
              </div>
              <p className="text-xs text-slate-400">
                Các ngũ hành gây xung đột, làm quá vượng hoặc triệt tiêu sinh khí của Dụng Thần.
              </p>
            </div>
          </div>

          {/* Trích dẫn thư tịch cổ & Biện giải */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Khảo Cứu Nguyên Văn Cổ Thư:
            </div>
            <blockquote className="p-3 rounded-lg bg-amber-950/20 border-l-2 border-amber-500 text-xs italic font-serif text-slate-200 leading-relaxed">
              "{dt.classicalCitation}"
            </blockquote>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dt.rationale}
            </p>
          </div>
        </div>
      )}

      {/* 4. TAB QUAN HỆ CAN CHI */}
      {subTab === 'interactions' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-amber-200 font-serif">
              Tương Tác Can Chi Trong Tứ Trụ
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Xét toàn diện quan hệ Hợp, Xung, Hình, Hại, Phá, Tam Hợp, Tam Hội giữa 4 trụ Năm, Tháng, Ngày, Giờ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Can Hợp & Xung */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block text-sm">Thiên Can Tương Tác</span>
              {it.thienCanHop.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-emerald-400 font-semibold">Thiên Can Hợp:</span>
                  {it.thienCanHop.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-emerald-900/40 text-emerald-200">
                      {r}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Không có Thiên Can Hợp.</p>
              )}

              {it.thienCanXung.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] text-rose-400 font-semibold">Thiên Can Trực Xung:</span>
                  {it.thienCanXung.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-rose-900/40 text-rose-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Địa Chi Hợp Cục */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block text-sm">Địa Chi Hợp & Hội</span>
              {it.diaChiLucHop.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-amber-400 font-semibold">Địa Chi Lục Hợp:</span>
                  {it.diaChiLucHop.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-amber-900/40 text-amber-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}
              {it.diaChiTamHop.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-cyan-400 font-semibold">Tam Hợp / Bán Hợp:</span>
                  {it.diaChiTamHop.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-cyan-900/40 text-cyan-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}
              {it.diaChiTamHoi.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-purple-400 font-semibold">Tam Hội Cục:</span>
                  {it.diaChiTamHoi.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-purple-900/40 text-purple-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}
              {it.diaChiLucHop.length === 0 && it.diaChiTamHop.length === 0 && it.diaChiTamHoi.length === 0 && (
                <p className="text-slate-500 italic">Không có Tam Hợp hay Tam Hội cục hình thành.</p>
              )}
            </div>

            {/* Địa Chi Xung & Hình */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block text-sm">Địa Chi Xung & Hình</span>
              {it.diaChiLucXung.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-rose-400 font-semibold">Lục Xung:</span>
                  {it.diaChiLucXung.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-rose-900/40 text-rose-200">
                      {r}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Không có Lục Xung trong Tứ Trụ.</p>
              )}

              {it.diaChiTuongHinh.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] text-amber-400 font-semibold">Tương Hình (Tam Hình / Tự Hình):</span>
                  {it.diaChiTuongHinh.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-amber-900/40 text-amber-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Địa Chi Hại & Phá */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block text-sm">Địa Chi Hại & Phá</span>
              {it.diaChiTuongHai.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-orange-400 font-semibold">Tương Hại (Lục Hại):</span>
                  {it.diaChiTuongHai.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-orange-900/40 text-orange-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}

              {it.diaChiTuongPha.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] text-yellow-400 font-semibold">Tương Phá:</span>
                  {it.diaChiTuongPha.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-yellow-900/40 text-yellow-200">
                      {r}
                    </div>
                  ))}
                </div>
              )}

              {it.diaChiTuongHai.length === 0 && it.diaChiTuongPha.length === 0 && (
                <p className="text-slate-500 italic">Không có Tương Hại hay Tương Phá.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB ĐẠI VẬN (10 NĂM) */}
      {subTab === 'luck' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                Tiến Trình 10 Bước Đại Vận (Thập Niên)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quy luật: <strong className="text-amber-300">{chart.luckCycles.directionRule}</strong>
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              Khởi vận: <strong className="text-amber-400">{chart.luckCycles.inceptionAge} tuổi</strong> ({chart.luckCycles.inceptionDateDescription})
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {chart.luckCycles.cycles.map((c) => (
              <div
                key={c.step}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/80 pb-1.5">
                  <span className="font-mono">Vận {c.step}</span>
                  <span className="font-semibold text-amber-400">{c.ageStart} - {c.ageEnd} tuổi</span>
                </div>

                <div className="text-center py-1">
                  <div className="text-xl font-black text-slate-100 font-serif tracking-wider">
                    {c.fullName}
                  </div>
                  <span className="text-[11px] text-amber-300 font-medium block mt-0.5">
                    {c.tenGod}
                  </span>
                </div>

                <div className="space-y-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <div className="flex justify-between">
                    <span>Năm:</span>
                    <strong className="text-slate-200 font-mono">{c.yearStart}-{c.yearEnd}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tràng Sinh:</span>
                    <strong className="text-slate-300">{c.trangSinh}</strong>
                  </div>
                  <div className="flex justify-between truncate">
                    <span>Nạp Âm:</span>
                    <strong className="text-slate-300 truncate">{c.napAm}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB LƯU NIÊN */}
      {subTab === 'annual' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                Tra Cứu Lưu Niên (Vận Hạn Từng Năm)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem xét Can Chi năm hiện tại đối chiếu với Tứ Trụ và Thái Tuế
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-medium">Chọn năm khảo cứu:</label>
              <select
                value={selectedAnnualYear}
                onChange={(e) => setSelectedAnnualYear(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">
                Lưu Niên Năm {selectedAnnualYear}
              </span>
              <div className="text-3xl font-black text-amber-300 font-serif">
                {annualInfo.fullName}
              </div>
              <p className="text-xs text-slate-300">
                Can: <strong>{annualInfo.can}</strong> • Chi: <strong>{annualInfo.chi}</strong>
              </p>
            </div>

            <div className="md:col-span-2 space-y-3 text-xs">
              <span className="font-semibold text-slate-300 block">Tương tác với bản mệnh:</span>
              <div className="space-y-2">
                {annualInfo.isThaiTue && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Năm Trực Thái Tuế (Trùng Chi với Trụ Năm {chart.pillars.year.chi}): Cần thận trọng trong việc khởi sự lớn, chú ý sức khỏe và bình ổn tâm tính.</span>
                  </div>
                )}
                {annualInfo.isXungThaiTue && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Năm Xung Thái Tuế (Trực xung với Chi Trụ Năm): Dễ có sự chuyển biến về công việc, môi trường sống hoặc di chuyển nhiều.</span>
                  </div>
                )}
                {annualInfo.isXungNhatChi && (
                  <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 text-orange-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>Xung Nhật Chi ({chart.pillars.day.chi}): Năm có sự rung động đối với cung phối ngẫu hoặc nội tâm bản thân.</span>
                  </div>
                )}
                {!annualInfo.isThaiTue && !annualInfo.isXungThaiTue && !annualInfo.isXungNhatChi && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                    Khí tượng năm {selectedAnnualYear} ({annualInfo.fullName}) vận hành điều hòa bình ổn với bản mệnh Tứ Trụ, không gặp trục xung trực tiếp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
