import React, { useState } from 'react';
import { TUVI_RULES } from '../knowledge/rules';
import { SOURCE_DOCUMENTS } from '../knowledge/sources';
import { BAZI_RULES, BaziRule } from '../knowledge/baziRules';
import { BookOpen, Search, Filter, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Layers, Sparkles, Compass } from 'lucide-react';
import { TuViRule } from '../knowledge/types';

export const KnowledgeExplorer: React.FC = () => {
  const [systemType, setSystemType] = useState<'bazi' | 'tuvi' | 'sources'>('bazi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBaziRule, setSelectedBaziRule] = useState<BaziRule | null>(null);
  const [selectedTuViRule, setSelectedTuViRule] = useState<TuViRule | null>(null);

  // Lọc quy tắc Bát Tự
  const filteredBaziRules = BAZI_RULES.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = r.title.toLowerCase().includes(q) ||
        r.rule_text.toLowerCase().includes(q) ||
        r.modern_interpretation.toLowerCase().includes(q) ||
        r.source_book.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Lọc quy tắc Tử Vi
  const filteredTuViRules = TUVI_RULES.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = r.title.toLowerCase().includes(q) ||
        r.rule_text.toLowerCase().includes(q) ||
        r.stars_involved.some(s => s.toLowerCase().includes(q)) ||
        r.source_excerpt.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-amber-900/40 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Cơ Sở Tri Thức & Dị Bản Thư Tịch
            </span>
            <span className="text-xs text-slate-400">
              Bát Tự ({BAZI_RULES.length} quy tắc) • Tử Vi ({TUVI_RULES.length} quy tắc)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 mt-1">
            Kho Tàng Thư Tịch & Khảo Chứng Cổ Đắc
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hệ thống hóa nguyên văn, số trang, phân định 5 nhóm tri thức và minh bạch các trường phái Tử Bình & Đẩu Số.
          </p>
        </div>

        {/* System switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => {
              setSystemType('bazi');
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              systemType === 'bazi'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bát Tự – Tứ Trụ</span>
          </button>
          <button
            onClick={() => {
              setSystemType('tuvi');
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              systemType === 'tuvi'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tử Vi Đẩu Số</span>
          </button>
          <button
            onClick={() => setSystemType('sources')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              systemType === 'sources'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư Tịch ({SOURCE_DOCUMENTS.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      {systemType !== 'sources' && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                systemType === 'bazi'
                  ? 'Tìm theo tên quy tắc, Thiên Can, Địa Chi, Thập Thần, Địch Thiên Tủy...'
                  : 'Tìm theo tên quy tắc, vị trí sao, nguyên văn, cách cục...'
              }
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Phân loại nhóm:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Tất cả các nhóm</option>
              <option value="A">Nhóm A (Lý thuyết nền tảng)</option>
              <option value="B">Nhóm B (Quy tắc tính toán)</option>
              <option value="C">Nhóm C (Phương pháp luận giải)</option>
              <option value="D">Nhóm D (Dị bản & Trường phái)</option>
              <option value="E">Nhóm E (AI Tổng hợp & Đạo đức)</option>
            </select>
          </div>
        </div>
      )}

      {/* 1. HIỂN THỊ QUY TẮC BÁT TỰ */}
      {systemType === 'bazi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBaziRules.map((rule) => (
              <div
                key={rule.rule_id}
                onClick={() => setSelectedBaziRule(rule)}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {rule.rule_id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Nhóm {rule.category} • {rule.category_name}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 font-serif">
                    {rule.title}
                  </h3>

                  <blockquote className="p-2.5 rounded bg-amber-950/20 border-l-2 border-amber-500 text-xs italic font-serif text-slate-300 line-clamp-3">
                    "{rule.rule_text}"
                  </blockquote>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {rule.modern_interpretation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-amber-300/80">{rule.source_book}</span>
                  <span>{rule.verification_status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal xem chi tiết Bát Tự Rule */}
          {selectedBaziRule && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-900/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      [{selectedBaziRule.rule_id}] Nhóm {selectedBaziRule.category}: {selectedBaziRule.category_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 font-serif mt-0.5">
                      {selectedBaziRule.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedBaziRule(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-1">
                    <span className="font-semibold text-amber-300 block">Nguyên Văn Cổ Điển:</span>
                    <p className="italic font-serif text-slate-200 text-sm">
                      "{selectedBaziRule.rule_text}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-slate-200 block">Diễn giải hiện đại & Ứng dụng:</span>
                    <p className="text-slate-300">{selectedBaziRule.modern_interpretation}</p>
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="font-semibold text-amber-400/90 block">Giới hạn luận giải & Lưu ý:</span>
                    <p className="text-slate-400">{selectedBaziRule.limitations}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between gap-2">
                    <span>Thư tịch: <strong>{selectedBaziRule.source_book}</strong> ({selectedBaziRule.source_author})</span>
                    <span>Chương: <strong>{selectedBaziRule.source_chapter}</strong> (Trang {selectedBaziRule.source_page})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. HIỂN THỊ QUY TẮC TỬ VI */}
      {systemType === 'tuvi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTuViRules.map((rule) => (
              <div
                key={rule.rule_id}
                onClick={() => setSelectedTuViRule(rule)}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {rule.rule_id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Nhóm {rule.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 font-serif">
                    {rule.title}
                  </h3>

                  <blockquote className="p-2.5 rounded bg-amber-950/20 border-l-2 border-amber-500 text-xs italic font-serif text-slate-300 line-clamp-3">
                    "{rule.rule_text}"
                  </blockquote>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-amber-300/80">
                    {SOURCE_DOCUMENTS.find(s => s.source_id === rule.source_id)?.title || 'Tử Vi Đẩu Số Toàn Thư'}
                  </span>
                  <span>Trang {rule.source_page}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal xem chi tiết Tử Vi Rule */}
          {selectedTuViRule && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-900/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      [{selectedTuViRule.rule_id}] Nhóm {selectedTuViRule.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 font-serif mt-0.5">
                      {selectedTuViRule.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTuViRule(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-1">
                    <span className="font-semibold text-amber-300 block">Nguyên Văn Cổ Điển:</span>
                    <p className="italic font-serif text-slate-200 text-sm">
                      "{selectedTuViRule.rule_text}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-slate-200 block">Trích dẫn:</span>
                    <p className="text-slate-300">{selectedTuViRule.source_excerpt}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Thư tịch: <strong>{SOURCE_DOCUMENTS.find(s => s.source_id === selectedTuViRule.source_id)?.title || 'Tử Vi Đẩu Số Toàn Thư'}</strong></span>
                    <span>Chương: <strong>{selectedTuViRule.source_chapter}</strong> (Trang {selectedTuViRule.source_page})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. HIỂN THỊ THƯ TỊCH CỔ ĐIỂN */}
      {systemType === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOURCE_DOCUMENTS.map((src) => (
            <div
              key={src.source_id}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-200 font-serif text-sm">
                  {src.title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {src.verification_status}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <p>Tác giả / Khảo cứu: <strong>{src.author}</strong></p>
                <p>Người dịch / Biên soạn: <strong>{src.translator || 'Vũ Tài Lục'}</strong></p>
                <p>Nhà xuất bản / Đơn vị lưu trữ: <strong>{src.publisher}</strong> ({src.year})</p>
                <p>Mã định danh: <span className="font-mono text-slate-400">{src.identifier || 'Đang cập nhật'}</span></p>
              </div>

              <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
                {src.notes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
