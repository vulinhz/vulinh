import React from 'react';
import { Palace, TuViChart } from '../engine/tuvi';
import { ELEMENT_COLORS } from './TuViGrid';
import { X, Sparkles, Compass, ShieldAlert, Award, BookOpen } from 'lucide-react';
import { findMatchingRules } from '../knowledge/rules';

interface PalaceDetailModalProps {
  palace: Palace | null;
  chart: TuViChart;
  onClose: () => void;
  onInterpret: (topic: string, palaceName: string) => void;
}

export const PalaceDetailModal: React.FC<PalaceDetailModalProps> = ({
  palace,
  chart,
  onClose,
  onInterpret
}) => {
  if (!palace) return null;

  const doiCung = chart.palaces[palace.xungChieuIndex];
  const tamHop1 = chart.palaces[palace.tamHopIndices[0]];
  const tamHop2 = chart.palaces[palace.tamHopIndices[1]];
  const nhiHop = chart.palaces[palace.nhiHopIndex];

  const palaceStars = [
    ...palace.chinhTinh.map(s => s.name),
    ...palace.phuTinhTot.map(s => s.name),
    ...palace.phuTinhXau.map(s => s.name)
  ];

  const matchedRules = findMatchingRules(undefined, palaceStars, palace.name);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-lg font-bold text-amber-300">
              {palace.chi}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-amber-200 font-serif uppercase">
                  Cung {palace.name} ({palace.can} {palace.chi})
                </h3>
                {palace.isMenh && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                    MỆNH CHỦ
                  </span>
                )}
                {palace.isThan && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                    THÂN CHỦ
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Đại hạn {palace.daiHanAge} - {palace.daiHanAge + 9} tuổi • Tiểu hạn năm {palace.tieuHanChi} • Vòng Tràng Sinh: {palace.vongTrangSinh}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Tuần / Triệt alerts */}
          {(palace.hasTuan || palace.hasTriet) && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-amber-200">
                {palace.hasTriet && <span className="font-bold text-rose-400 mr-2">[TRIỆT KHÔNG ĐÓNG CUNG]</span>}
                {palace.hasTuan && <span className="font-bold text-amber-400 mr-2">[TUẦN KHÔNG ĐÓNG CUNG]</span>}
                Ảnh hưởng làm biến đổi tính chất hung cát, cát tinh giảm nhẹ, hung tinh tiêu tán.
              </div>
            </div>
          )}

          {/* 14 Chính Tinh */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Chính Tinh Tọa Thủ
            </h4>
            {palace.chinhTinh.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 italic">
                Cung này Vô Chính Diệu (không có chính tinh thủ cung). Cần mượn chính tinh của cung đối xung ({doiCung.chi} - {doiCung.name}) để luận giải.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {palace.chinhTinh.map((s, idx) => {
                  const elem = ELEMENT_COLORS[s.element] || ELEMENT_COLORS.Thổ;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border ${elem.border} ${elem.bg} flex items-center justify-between`}
                    >
                      <div>
                        <span className="font-bold text-sm text-slate-100">{s.name}</span>
                        <div className="text-[11px] text-slate-400">
                          Ngũ hành: {s.element} • Đắc hãm: ({s.brightness})
                        </div>
                      </div>
                      <span className="text-xs font-serif font-bold px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30">
                        {s.brightness === 'M' ? 'Miếu địa' : s.brightness === 'V' ? 'Vượng địa' : s.brightness === 'Đ' ? 'Đắc địa' : s.brightness === 'B' ? 'Bình hòa' : 'Hãm địa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phụ Tinh Cát & Sát */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Cát Tinh & Quý Tinh ({palace.phuTinhTot.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {palace.phuTinhTot.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Sát Tinh & Bại Tinh ({palace.phuTinhXau.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {palace.phuTinhXau.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Không có sát tinh trực tiếp</span>
                ) : (
                  palace.phuTinhXau.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/20"
                    >
                      {s.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tam Phương Tứ Chính */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-400" />
              Tam Phương Tứ Chính & Nhị Hợp
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Đối Xung (180°):</span>
                <span className="font-bold text-rose-300">{doiCung.chi} - {doiCung.name}</span>
                <p className="text-[11px] text-slate-300 break-words font-medium mt-0.5">
                  {doiCung.chinhTinh.map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                </p>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tam Hợp 1 (120°):</span>
                <span className="font-bold text-sky-300">{tamHop1.chi} - {tamHop1.name}</span>
                <p className="text-[11px] text-slate-300 break-words font-medium mt-0.5">
                  {tamHop1.chinhTinh.map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                </p>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tam Hợp 2 (240°):</span>
                <span className="font-bold text-sky-300">{tamHop2.chi} - {tamHop2.name}</span>
                <p className="text-[11px] text-slate-300 break-words font-medium mt-0.5">
                  {tamHop2.chinhTinh.map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                </p>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Nhị Hợp:</span>
                <span className="font-bold text-purple-300">{nhiHop.chi} - {nhiHop.name}</span>
                <p className="text-[11px] text-slate-300 break-words font-medium mt-0.5">
                  {nhiHop.chinhTinh.map(s => s.name).join(', ') || 'Vô Chính Diệu'}
                </p>
              </div>
            </div>
          </div>

          {/* Quy tắc thư tịch liên quan */}
          {matchedRules.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Quy Tắc Thư Tịch Toàn Thư Liên Quan ({matchedRules.length})
              </h4>
              <div className="space-y-2">
                {matchedRules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-amber-900/30 text-xs">
                    <div className="flex items-center justify-between font-semibold text-amber-200">
                      <span>[{rule.rule_id}] {rule.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Nhóm {rule.category}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{rule.rule_text}</p>
                    <div className="mt-1.5 text-[11px] text-slate-400 italic">
                      Nguồn: {rule.source_chapter}, Trang {rule.source_page}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-amber-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onInterpret(palace.name, palace.name);
            }}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luận Giải Cung {palace.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
