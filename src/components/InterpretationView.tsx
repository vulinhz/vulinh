import React, { useState, useEffect } from 'react';
import { TuViChart } from '../engine/tuvi';
import { Sparkles, BookOpen, AlertCircle, Award, CheckCircle2, RefreshCw, Compass, Shield, Copy, Check, MessageSquare } from 'lucide-react';
import { TuViRule } from '../knowledge/types';

interface InterpretationViewProps {
  chart: TuViChart;
  initialTopic?: string;
  initialPalace?: string;
  onNavigateToChat?: (initialQuestion?: string) => void;
}

export const InterpretationView: React.FC<InterpretationViewProps> = ({
  chart,
  initialTopic = 'Tong_Quan',
  initialPalace,
  onNavigateToChat
}) => {
  const [activeTopic, setActiveTopic] = useState<string>(initialTopic);
  const [loading, setLoading] = useState<boolean>(false);
  const [interpretation, setInterpretation] = useState<string>('');
  const [matchedRules, setMatchedRules] = useState<TuViRule[]>([]);
  const [sourceNote, setSourceNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedCitationCategory, setSelectedCitationCategory] = useState<string>('ALL');

  const fetchInterpretation = async (topic: string, palace?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          focusTopic: topic,
          focusPalace: palace
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi gọi API luận giải.');
      }

      setInterpretation(data.interpretation || '');
      setMatchedRules(data.matchedRules || []);
      setSourceNote(data.source || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể lấy bản luận giải.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterpretation(activeTopic, initialPalace);
  }, [chart, activeTopic, initialPalace]);

  const handleCopy = () => {
    if (!interpretation) return;
    navigator.clipboard.writeText(interpretation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topics = [
    { id: 'Tong_Quan', label: 'Tổng Quan Mệnh Thân & Cục', icon: Compass },
    { id: 'Quan_Loc', label: 'Công Danh & Quan Lộc', icon: Award },
    { id: 'Tai_Bach', label: 'Tài Vận & Cung Tài', icon: Sparkles },
    { id: 'Phu_The', label: 'Hôn Nhân & Phu Thê', icon: BookOpen },
    { id: 'Van_Han', label: 'Vận Hạn Đại Hạn 10 Năm', icon: Shield },
  ];

  const filteredCitations = matchedRules.filter(r => {
    if (selectedCitationCategory !== 'ALL' && r.category !== selectedCitationCategory) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-amber-900/40 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Khảo Chứng Thư Tịch Vũ Tài Lục
            </span>
            <span className="text-xs text-slate-400">
              Đương số: <strong className="text-amber-200">{chart.profile.name}</strong> ({chart.amDuongNamNu})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-200 mt-1">
            Luận Giải Có Căn Cứ & Minh Bạch Thư Tịch
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dựa trên Tử Vi Đẩu Số Toàn Thư (Hi Di Trần Đoàn) • Phân biệt 4 nhóm tri thức A, B, C, D
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!interpretation || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sao chép toàn bộ bản luận giải"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          <button
            onClick={() => fetchInterpretation(activeTopic, initialPalace)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Đang Luận Giải...' : 'Tái Luận Giải'}</span>
          </button>
        </div>
      </div>

      {/* Topic Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {topics.map(t => {
          const Icon = t.icon;
          const isActive = activeTopic === t.id && !initialPalace;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTopic(t.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}

        {initialPalace && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Đang chọn cung: {initialPalace}
          </span>
        )}
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area: Interpretation Output & Verified Rules Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Natural Language Interpretation */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-amber-900/40 p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold font-serif text-amber-200 uppercase">
                Văn Bản Luận Giải Chi Tiết
              </h3>
              {sourceNote && (
                <span className="text-[11px] text-slate-400">
                  Bộ máy: <span className="text-amber-400 font-medium">{sourceNote}</span>
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-serif">
                  Đang đối chiếu dữ liệu lá số với các chương mục trong Tử Vi Đẩu Số Toàn Thư...
                </p>
              </div>
            ) : (
              <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {interpretation}
              </div>
            )}
          </div>

          {/* Ask AI further question banner */}
          {onNavigateToChat && !loading && (
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-slate-300">
                  Bạn có thắc mắc thêm về phần luận giải này?
                </span>
              </div>
              <button
                onClick={() => onNavigateToChat(`Hãy giải thích chi tiết hơn về phần luận giải ${activeTopic} của tôi`)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Hỏi Thêm Với Trợ Lý AI</span>
              </button>
            </div>
          )}

          {/* Academic disclaimer */}
          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-400">Minh bạch học thuật & Giới hạn:</div>
            <p className="text-[10px] text-slate-500">
              Luận giải phục vụ nghiên cứu văn hóa truyền thống phương Đông. Không trình bày các diễn giải chiêm tinh như những sự thật khoa học đã được chứng minh hoặc những dự đoán chắc chắn về tương lai.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Citations & Knowledge Base Rules Applied */}
        <div className="space-y-4">
          {/* Rules Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-amber-900/40 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Căn Cứ Thư Tịch Đã Áp Dụng ({matchedRules.length})
              </h3>
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setSelectedCitationCategory('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedCitationCategory === 'ALL' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedCitationCategory('A')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedCitationCategory === 'A' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nhóm A
              </button>
              <button
                onClick={() => setSelectedCitationCategory('B')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedCitationCategory === 'B' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nhóm B
              </button>
              <button
                onClick={() => setSelectedCitationCategory('C')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  selectedCitationCategory === 'C' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nhóm C
              </button>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredCitations.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-200">{r.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      r.category === 'A' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      r.category === 'B' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      r.category === 'C' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      Nhóm {r.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {r.rule_text}
                  </p>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[10px] space-y-0.5">
                    <div className="text-slate-400 truncate">
                      <strong>Nguồn:</strong> {r.source_chapter} (Trang {r.source_page})
                    </div>
                    <div className="text-amber-400/90 italic line-clamp-1">
                      "{r.source_excerpt}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Mã: {r.rule_id}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {r.verification_status}
                    </span>
                  </div>
                </div>
              ))}

              {filteredCitations.length === 0 && (
                <div className="text-[11px] text-slate-500 italic py-4 text-center">
                  Không có căn cứ thuộc nhóm được chọn.
                </div>
              )}
            </div>
          </div>

          {/* 4 Groups Explanation Card */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-[11px] space-y-2 text-slate-400">
            <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Quy chuẩn 4 Nhóm Tri Thức:
            </div>
            <div>
              <strong className="text-amber-300">Nhóm A:</strong> Trích từ sách nền tảng *Tử Vi Đẩu Số Toàn Thư (Vũ Tài Lục)*.
            </div>
            <div>
              <strong className="text-sky-300">Nhóm B:</strong> Đối chiếu độc lập (*Tử Vi Áo Bí, Triệu Thị Minh Lý*).
            </div>
            <div>
              <strong className="text-purple-300">Nhóm C:</strong> Dị bản và khác biệt trường phái (Khâm Thiên, Trung Châu).
            </div>
            <div>
              <strong className="text-emerald-300">Nhóm D:</strong> Ngôn ngữ tự nhiên do AI tổng hợp từ quy tắc và dữ liệu lá số.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
