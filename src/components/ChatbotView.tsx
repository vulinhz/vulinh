import React, { useState, useRef, useEffect } from 'react';
import { TuViChart } from '../engine/tuvi';
import { MessageSquare, Send, Bot, User, Sparkles, BookOpen, AlertCircle, Compass } from 'lucide-react';
import { TuViRule } from '../knowledge/types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedRules?: TuViRule[];
}

interface ChatbotViewProps {
  chart: TuViChart;
  initialQuestion?: string;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ chart, initialQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Xin kính chào đương số **${chart.profile.name}**. Tôi là Trợ lý AI Khảo chứng Tử Vi Đẩu Số, hoạt động dựa trên cơ sở tri thức chính thống từ **Tử Vi Đẩu Số Toàn Thư** (Hi Di Trần Đoàn - bản dịch Vũ Tài Lục).\n\nTôi đã nạp đầy đủ dữ liệu lá số của bạn (Mệnh: **${chart.menhNguHanh.name}**, Cục: **${chart.cuc.name}**, Mệnh tại **${chart.palaces[chart.menhPalaceIndex].chi}**). Bạn có thể đặt câu hỏi về bất kỳ cung vị, bộ sao hoặc vận trình nào cần khảo cứu!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion) {
      setInput(initialQuestion);
    }
  }, [initialQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          message: textToSend.trim(),
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi xử lý phản hồi từ server.');
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'Không có phản hồi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedRules: data.matchedRules
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Đã xảy ra lỗi: ${err.message}. Xin vui lòng thử lại hoặc kiểm tra kết nối hệ thống.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Luận giải cung Mệnh của tôi theo Tử Vi Đẩu Số Toàn Thư',
    'Cung Quan Lộc của tôi cho thấy tiềm năng công danh nghề nghiệp gì?',
    'Trong lá số của tôi, bộ sao nào có tác động then chốt nhất?',
    'Phân tích ảnh hưởng của Tuần / Triệt Không đối với lá số này'
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col h-[calc(100vh-8rem)] min-h-[550px]">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-amber-900/40 p-4 shadow-xl flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-amber-200 font-serif uppercase">
                Trợ Lý AI Luận Giải Khảo Chứng
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grounded via Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Đang tham chiếu lá số: <strong className="text-slate-200">{chart.profile.name}</strong> • Cung Mệnh tại {chart.palaces[chart.menhPalaceIndex].chi}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          Tuyệt đối không bịa đặt sao & quy tắc
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-2 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap leading-relaxed'
              }`}
            >
              <div>{msg.text}</div>

              {/* Matched rules tags if assistant */}
              {msg.matchedRules && msg.matchedRules.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                  <div className="text-amber-400/90 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Căn cứ thư tịch liên quan:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {msg.matchedRules.map((r, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700"
                        title={`${r.source_chapter} - Trang ${r.source_page}`}
                      >
                        [{r.rule_id}] {r.title} (Nhóm {r.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] text-right ${
                  msg.sender === 'user' ? 'text-amber-950/70' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Đang tra cứu cơ sở tri thức và đối chiếu lá số...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested question chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/40 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Hỏi AI về cung Mệnh, Quan Lộc, Tài Bạch của ${chart.profile.name}...`}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-amber-500 focus:outline-none placeholder:text-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gửi</span>
        </button>
      </form>
    </div>
  );
};
