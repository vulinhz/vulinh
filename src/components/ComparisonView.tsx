import React from 'react';
import { TuViChart } from '../engine/tuvi';
import { BaziChart } from '../engine/bazi';
import { Compass, Sparkles, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComparisonViewProps {
  tuviChart: TuViChart;
  baziChart: BaziChart;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ tuviChart, baziChart }) => {
  const menhPalace = tuviChart.palaces[tuviChart.menhPalaceIndex];
  const thanPalace = tuviChart.palaces[tuviChart.thanPalaceIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                So Sánh Đối Chiếu Hệ Thống
              </span>
              <span className="text-xs text-slate-400">
                Hồ sơ: <strong className="text-slate-200">{tuviChart.profile.name}</strong> ({tuviChart.profile.gender})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-serif mt-1">
              Đối Chiếu Tử Vi Đẩu Số & Bát Tự – Tứ Trụ
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Hai hệ thống chiêm nghiệm cổ truyền phương Đông độc lập: Tử Vi chú trọng tinh đẩu trên 12 cung chức năng; Bát Tự chú trọng quy luật khí số ngũ hành sinh khắc của Tứ Trụ.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="text-slate-500 block text-[10px]">Tử Vi:</span>
              <strong className="text-amber-300">Mệnh tại {menhPalace.chi}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <span className="text-slate-500 block text-[10px]">Bát Tự:</span>
              <strong className="text-cyan-300">Nhật Chủ {baziChart.dayMaster.can} ({baziChart.dayMaster.element})</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HỆ THỐNG 1: TỬ VI ĐẨU SỐ */}
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-amber-900/30 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                Hệ Thống Tử Vi Đẩu Số
              </h3>
              <span className="text-[11px] text-slate-400">
                Thư tịch: Tử Vi Đẩu Số Toàn Thư (Hi Di Trần Đoàn)
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Bản thể */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block">
                1. Bản Thể & Tâm Lý (Cung Mệnh & Thân)
              </span>
              <p className="text-slate-300">
                - Cung Mệnh tọa tại <strong>{menhPalace.chi}</strong>: Chính tinh: <strong className="text-amber-200">{(menhPalace.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu'}</strong>.
              </p>
              <p className="text-slate-300">
                - Cung Thân cư <strong>{thanPalace.name}</strong> (tại {thanPalace.chi}): Định hình hành vi và hậu vận sau 30 tuổi.
              </p>
              <p className="text-slate-400 text-[11px]">
                Mô hình hóa nhân cách thông qua các biểu tượng sao chính diệu và bầy phụ tinh cát hung.
              </p>
            </div>

            {/* 2. Cục & Năng Lượng */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block">
                2. Năng Lượng Môi Trường (Cục)
              </span>
              <p className="text-slate-300">
                - Cục: <strong>{tuviChart.cuc.name}</strong> • Bản mệnh: <strong>{tuviChart.menhNguHanh.name}</strong>.
              </p>
              <p className="text-slate-300">
                - Tương quan: Mệnh Cục {tuviChart.menhNguHanh.element === tuviChart.cuc.element ? 'Đồng hành hòa hợp' : 'Có sự tương sinh/khắc theo ngũ hành'}.
              </p>
              <p className="text-slate-400 text-[11px]">
                Cục định vị tuổi khởi Đại Hạn (từ 2 đến 6 tuổi) và tốc độ nhập thế của đương số.
              </p>
            </div>

            {/* 3. Cứu Cánh & Động Lực */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block">
                3. Động Lực Biến Động (Tứ Hóa)
              </span>
              <p className="text-slate-300">
                - Tứ Hóa Can {tuviChart.profile.solarDate ? tuviChart.profile.solarDate : ''}: Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ phân bố theo can năm sinh.
              </p>
              <p className="text-slate-400 text-[11px]">
                Tứ Hóa đóng vai trò chất xúc tác khởi động các biến cố thành bại cụ thể trong cuộc đời.
              </p>
            </div>

            {/* 4. Vận Trình */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] block">
                4. Tiến Trình Vận Hạn (10 Năm Chuyển Cung)
              </span>
              <p className="text-slate-300">
                - Đại Hạn tuần tự chuyển cung qua 12 cung chức năng theo chiều {tuviChart.amDuongNamNu.includes('Thuận') ? 'Thuận' : 'Nghịch'}.
              </p>
              <p className="text-slate-400 text-[11px]">
                Mỗi 10 năm kiểm tra hội tụ của các sao tại cung Đại Hạn và Tam Phương Tứ Chính.
              </p>
            </div>
          </div>
        </div>

        {/* HỆ THỐNG 2: BÁT TỰ - TỨ TRỤ */}
        <div className="bg-slate-900/90 border border-cyan-900/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-cyan-900/30 pb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cyan-200 font-serif">
                Hệ Thống Bát Tự – Tứ Trụ
              </h3>
              <span className="text-[11px] text-slate-400">
                Thư tịch: Uyên Hải Tử Bình, Địch Thiên Tủy, Cùng Thông Bảo Giám
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Bản thể */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] block">
                1. Bản Thể & Khí Chất (Nhật Can / Nhật Chủ)
              </span>
              <p className="text-slate-300">
                - Nhật Chủ: <strong className="text-cyan-200">{baziChart.dayMaster.can}</strong> ({baziChart.dayMaster.element} {baziChart.dayMaster.polarity}).
              </p>
              <p className="text-slate-300">
                - Nhật Chi: <strong>{baziChart.pillars.day.chi}</strong> (Tọa hạ cung phối ngẫu và gốc rễ thể chất).
              </p>
              <p className="text-slate-400 text-[11px]">
                Đo lường trực tiếp năng lượng tiên thiên của một trong 10 Thiên Can theo khí chất vũ trụ.
              </p>
            </div>

            {/* 2. Cục & Năng Lượng */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] block">
                2. Năng Lượng Nguyệt Lệnh & Thực Lực
              </span>
              <p className="text-slate-300">
                - Nguyệt Lệnh tại <strong>{baziChart.pillars.month.chi}</strong> ({baziChart.monthSolarTerm.termName}).
              </p>
              <p className="text-slate-300">
                - Thực lực Nhật Chủ: <strong className="text-cyan-300">{baziChart.dayMasterStrength.level}</strong> ({baziChart.dayMasterStrength.score}/100đ).
              </p>
              <p className="text-slate-400 text-[11px]">
                Xét tam đắc: Đắc Lệnh (thời tiết), Đắc Địa (gốc rễ địa chi), Đắc Thế (trợ lực thiên can).
              </p>
            </div>

            {/* 3. Cứu Cánh & Động Lực */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] block">
                3. Điều Hòa Khí Cục (Dụng Thần)
              </span>
              <p className="text-slate-300">
                - Dụng Thần: <strong className="text-amber-300 font-bold">Hành {baziChart.dungThanInfo.dungThan}</strong> ({baziChart.dungThanInfo.method}).
              </p>
              <p className="text-slate-300">
                - Hỷ Thần: {baziChart.dungThanInfo.hyThan.join(', ')} • Kỵ Thần: {baziChart.dungThanInfo.kyThan.join(', ')}.
              </p>
              <p className="text-slate-400 text-[11px]">
                Dụng Thần là chiếc chìa khóa quân bình âm dương, hóa giải thiên lệch của Tứ Trụ.
              </p>
            </div>

            {/* 4. Vận Trình */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] block">
                4. Tiến Trình Đại Vận (Khởi Từ Tiết Khí)
              </span>
              <p className="text-slate-300">
                - Đại Vận vận hành theo Can Chi độc lập ({baziChart.luckCycles.directionRule}), khởi từ {baziChart.luckCycles.inceptionAge} tuổi.
              </p>
              <p className="text-slate-400 text-[11px]">
                Mỗi 10 năm là một tổ hợp Can Chi mới tương tác trực tiếp với Nhật Chủ và Dụng Thần.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Insight Note */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          Khuyến Cáo Kết Hợp Tham Khảo Hai Hệ Thống
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Tử Vi Đẩu Số và Bát Tự – Tứ Trụ là hai lăng kính riêng biệt cùng soi chiếu vào một đời sống con người:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <strong className="text-amber-300 block mb-1">Khi xem xét thiên hướng và tính cách:</strong>
            Đối chiếu hình tượng chính tinh ở cung Mệnh của Tử Vi với thuộc tính âm dương ngũ hành của Nhật Chủ trong Bát Tự. Sự tương đồng thường khẳng định nét tính cách cốt lõi sâu sắc nhất của đương số.
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <strong className="text-cyan-300 block mb-1">Khi xem xét thời điểm hành động:</strong>
            Nếu cả Đại Hạn Tử Vi gặp cát tinh đắc cách và Đại Vận Bát Tự tiến vào cung Hỷ Thần / Dụng Thần, đây là giai đoạn thiên thời địa lợi nhân hòa hội tụ để phát huy tối đa năng lực bản thân.
          </div>
        </div>
      </div>
    </div>
  );
};
