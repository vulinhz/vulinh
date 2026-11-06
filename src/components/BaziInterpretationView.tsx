import React, { useState, useEffect } from 'react';
import { BaziChart } from '../engine/bazi';
import { Sparkles, BookOpen, Shield, RefreshCw, AlertCircle, Bookmark, Compass } from 'lucide-react';
import { safeApiRequest } from '../utils/safeApi';

interface BaziInterpretationViewProps {
  chart: BaziChart;
}

interface InterpretationResponse {
  interpretation: string;
  matchedRules: any[];
  source: string;
}

export const BaziInterpretationView: React.FC<BaziInterpretationViewProps> = ({ chart }) => {
  const [topic, setTopic] = useState<'TongQuan' | 'TinhCach' | 'CongDanh' | 'TaiChinh' | 'TinhDuyen' | 'DaiVan' | 'LuuNien'>('TongQuan');
  const [data, setData] = useState<InterpretationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretation = async (selectedTopic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await safeApiRequest<InterpretationResponse>('/api/bazi/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, topic: selectedTopic }),
        timeoutMs: 35000
      });

      setData(json);
    } catch (err: any) {
      console.error('Error fetching Bazi interpretation:', err);
      setError(err.message || 'Không thể tải bản luận giải.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterpretation(topic);
  }, [topic, chart.profile.name, chart.profile.solarDate]);

  const topicsList = [
    { key: 'TongQuan', label: 'Tổng Quan Bát Tự', desc: 'Tứ Trụ, Thân vượng/nhược & Dụng Thần' },
    { key: 'TinhCach', label: 'Tính Cách & Biểu Tượng', desc: 'Khí chất Nhật Can & Thập Thần tâm lý' },
    { key: 'CongDanh', label: 'Sự Nghiệp & Công Danh', desc: 'Quan Sát, Ấn Tinh & Phương hướng' },
    { key: 'TaiChinh', label: 'Tài Lộc & Quản Trị', desc: 'Chính Tài, Thiên Tài & Tích lũy' },
    { key: 'TinhDuyen', label: 'Tình Cảm & Hôn Nhân', desc: 'Nhật Chi, Thê/Phu Cung & Hòa hợp' },
    { key: 'DaiVan', label: 'Vận Trình Đại Vận', desc: 'Các giai đoạn 10 năm chuyển vận' },
    { key: 'LuuNien', label: 'Lưu Niên Năm Nay', desc: 'Ảnh hưởng Thái Tuế và vận niên' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Topic Navigation */}
      <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/30 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-100 font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Luận Giải Bát Tự – Tứ Trụ Khảo Chứng
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích nghiêm ngặt theo 4 đại thư tịch cổ điển: Uyên Hải Tử Bình, Tam Mệnh Thông Hội, Địch Thiên Tủy, Cùng Thông Bảo Giám
            </p>
          </div>

          <button
            onClick={() => fetchInterpretation(topic)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm Mới Luận Giải
          </button>
        </div>

        {/* Topic Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {topicsList.map(t => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key as any)}
              className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                topic === t.key
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="text-xs font-bold font-serif line-clamp-1">{t.label}</span>
              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200 font-serif">Đang đối chiếu thư tịch và quy tắc Bát Tự...</h4>
            <p className="text-xs text-slate-400">Truy xuất nguyên bản và luận chứng theo Dụng Thần {chart.dungThanInfo.dungThan}</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h4 className="text-sm font-bold text-rose-200">Đã xảy ra lỗi khi tạo bản luận giải</h4>
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={() => fetchInterpretation(topic)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
          >
            Thử lại
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột Trái: Nội dung luận giải Markdown */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Nguồn: <strong className="text-slate-200">{data.source}</strong>
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                Bát Tự Khảo Chứng v2.0
              </span>
            </div>

            <div className="prose prose-invert prose-amber max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans space-y-4">
              {data.interpretation}
            </div>

            {/* Ethical academic disclaimer */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-amber-300 block">Khuyến cáo học thuật & Đạo đức luận giải:</span>
              <p>
                Bát Tự – Tứ Trụ là hệ thống tri thức cổ điển phương Đông sử dụng quy luật nhị nguyên âm dương ngũ hành nhằm giúp con người hiểu rõ các đặc tính tâm lý, thiên hướng và nhịp sinh học tự nhiên. Mọi diễn giải mang tính tham khảo, chiêm nghiệm; vận mệnh chân chính nằm ở sự nỗ lực học tập, tu dưỡng đạo đức và năng lực tự quyết của mỗi cá nhân.
              </p>
            </div>
          </div>

          {/* Cột Phải: Các Quy Tắc Thư Tịch Đã Được Đối Chiếu */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Cơ Sở Tri Thức Khảo Chứng ({data.matchedRules?.length || 0})
              </h3>
              <p className="text-xs text-slate-400">
                Các quy tắc cổ điển được AI trích xuất để làm căn cứ cho bản luận giải:
              </p>

              <div className="space-y-3">
                {data.matchedRules && data.matchedRules.length > 0 ? (
                  data.matchedRules.map((rule: any) => (
                    <div
                      key={rule.rule_id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {rule.rule_id}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Nhóm {rule.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-200">{rule.title}</h4>

                      <blockquote className="p-2 rounded bg-amber-950/20 border-l-2 border-amber-500/60 text-[11px] italic font-serif text-slate-300">
                        "{rule.rule_text}"
                      </blockquote>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                        <span>{rule.source_book}</span>
                        <span>Trang {rule.source_page}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Áp dụng nguyên tắc tổng hợp từ Uyên Hải Tử Bình và Địch Thiên Tủy.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
