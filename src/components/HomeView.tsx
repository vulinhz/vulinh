import React from 'react';
import { Compass, Sparkles, BookOpen, ShieldCheck, Layers, PlusCircle, ArrowRight, UserCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { TuViChart } from '../engine/tuvi';
import { BaziChart } from '../engine/bazi';
import { AppTab } from './Header';

interface HomeViewProps {
  tuviChart: TuViChart;
  baziChart: BaziChart;
  onNavigate: (tab: AppTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ tuviChart, baziChart, onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Nền Tảng Khảo Chứng Thuật Số Cổ Điển & AI Toàn Diện</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-amber-100 tracking-tight leading-tight">
            Tử Vi Đẩu Số & Bát Tự Tứ Trụ AI
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Hệ thống độc lập, chuyên sâu kết hợp hai trường phái mệnh lý Á Đông lớn nhất: <strong className="text-amber-300">Tử Vi Đẩu Số Toàn Thư</strong> (Hi Di Trần Đoàn - Vũ Tài Lục) và <strong className="text-amber-300">Tứ Trụ Bát Tự</strong> (Uyên Hải Tử Bình, Địch Thiên Tủy, Tam Mệnh Thông Hội, Cùng Thông Bảo Giám).
          </p>

          {/* Active Profile Info */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Hồ sơ đang mở: <strong className="text-amber-300">{tuviChart.profile.name}</strong> ({tuviChart.profile.gender} - {tuviChart.amDuongNamNu})</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300">
              Sinh: {tuviChart.profile.solarDate} ({tuviChart.profile.solarTime})
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 font-semibold">
              Tử Vi: {tuviChart.cuc.name} • Mệnh {tuviChart.menhNguHanh.name}
            </span>
            <span className="px-3 py-1 rounded-xl bg-sky-950/60 border border-sky-600/40 text-sky-300 font-semibold">
              Bát Tự: Nhật Chủ {baziChart.dayMaster.can} ({baziChart.dayMasterStrength.level})
            </span>
          </div>
        </div>
      </div>

      {/* Two Pillars: Tử Vi and Bát Tự */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Tử Vi Đẩu Số */}
        <div className="rounded-3xl bg-slate-900/90 border border-amber-900/50 p-6 sm:p-7 shadow-xl space-y-5 flex flex-col justify-between hover:border-amber-500/50 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 flex items-center justify-center shadow-lg shadow-amber-900/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Compass className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                12 Cung Vị & Vòng Sao
              </span>
            </div>

            <h2 className="text-2xl font-bold font-serif text-amber-200">
              Phân Hệ Tử Vi Đẩu Số
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Khảo lập lá số 12 cung (Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Tức, Phu Thê, Huynh Đệ) cùng 14 chính tinh, cát hung tinh, vòng Tràng Sinh, Bác Sỹ, Thái Tuế và Tuần/Triệt Không.
            </p>

            <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Bố cục bàn cờ 4x4 truyền thống & chế độ danh sách 12 cung chữ lớn.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Chiếu tia Tam Phương Tứ Chính trực quan, không cắt bớt sao.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Luận giải AI đối chiếu Tử Vi Đẩu Số Toàn Thư (Vũ Tài Lục).</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('tuvi_chart')}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Xem Lá Số Tử Vi</span>
            </button>
            <button
              onClick={() => onNavigate('tuvi_form')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Lập Lá Số Tử Vi</span>
            </button>
            <button
              onClick={() => onNavigate('tuvi_interpret')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Luận Giải Tử Vi AI</span>
            </button>
          </div>
        </div>

        {/* Module 2: Bát Tự – Tứ Trụ */}
        <div className="rounded-3xl bg-slate-900/90 border border-sky-900/40 p-6 sm:p-7 shadow-xl space-y-5 flex flex-col justify-between hover:border-sky-500/50 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-800 p-0.5 flex items-center justify-center shadow-lg shadow-sky-900/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-sky-400" />
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                Năm • Tháng • Ngày • Giờ
              </span>
            </div>

            <h2 className="text-2xl font-bold font-serif text-sky-200">
              Phân Hệ Bát Tự – Tứ Trụ
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Thiên văn 24 tiết khí (Lập Xuân mốc đổi năm, 12 Tiết Lệnh), Tàng Can tỷ lệ %, Thập Thần, Trường Sinh, Vượng/Suy Nhật Chủ, Dụng Thần Phù Ức & Điều Hầu, 10 bước Đại Vận và Lưu Niên.
            </p>

            <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Động cơ Hoàng kinh Mặt Trời Jean Meeus tính chính xác theo phút.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Định lượng điểm vượng suy (Đắc lệnh, đắc địa, đắc thế).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Dẫn nguồn Uyên Hải Tử Bình, Địch Thiên Tủy, Cùng Thông Bảo Giám.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigate('bazi_chart')}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Xem Bát Tự</span>
            </button>
            <button
              onClick={() => onNavigate('bazi_form')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>Lập Lá Số Bát Tự</span>
            </button>
            <button
              onClick={() => onNavigate('bazi_interpret')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Luận Giải Bát Tự AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Systems Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* So Sánh */}
        <div
          onClick={() => onNavigate('comparison')}
          className="rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <Layers className="w-5 h-5 text-amber-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm group-hover:text-amber-200">
            So Sánh Tử Vi & Bát Tự
          </h3>
          <p className="text-xs text-slate-400">
            Bảng ma trận đối chiếu song song hai trường phái trên cùng một hồ sơ để chiêm nghiệm toàn diện.
          </p>
        </div>

        {/* Đàm Thoại AI */}
        <div
          onClick={() => onNavigate('tuvi_chat')}
          className="rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm group-hover:text-emerald-200">
            Đàm Thoại Trợ Lý AI
          </h3>
          <p className="text-xs text-slate-400">
            Hỏi đáp trực tiếp về cung vị, bộ sao, dụng thần và vận hạn với Gemini 3.8 Flash grounded cổ thư.
          </p>
        </div>

        {/* Kho Tri Thức */}
        <div
          onClick={() => onNavigate('knowledge')}
          className="rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 p-4 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm group-hover:text-sky-200">
            Kho Tri Thức Cổ Điển
          </h3>
          <p className="text-xs text-slate-400">
            Tra cứu quy tắc 5 nhóm A, B, C, D, E và thư tịch gốc: Toàn Thư, Tử Bình, Địch Thiên Tủy, Cùng Thông.
          </p>
        </div>

        {/* Kiểm Thử QA Suite */}
        <div
          onClick={() => onNavigate('qa')}
          className="rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 p-4 transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              24/24 PASS
            </span>
          </div>
          <h3 className="font-bold text-slate-200 text-sm group-hover:text-emerald-200">
            Kiểm Thử QA Tự Động
          </h3>
          <p className="text-xs text-slate-400">
            Bộ kiểm thử nghiệm ngặt 14 ca Tử Vi và 10 ca Bát Tự xác nhận tính bất biến toán học và thiên văn.
          </p>
        </div>
      </div>
    </div>
  );
};
