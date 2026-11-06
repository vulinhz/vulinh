import React, { useState, useRef, useEffect } from 'react';
import { BaziChart } from '../engine/bazi';
import { MessageSquare, Send, Sparkles, BookOpen, Shield, Bot, User, Compass } from 'lucide-react';

interface BaziChatbotViewProps {
  chart: BaziChart;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  matchedRules?: any[];
  timestamp: string;
}

export const BaziChatbotView: React.FC<BaziChatbotViewProps> = ({ chart }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Chào bạn! Tôi là Trợ lý AI Khảo chứng Bát Tự – Tứ Trụ, vận hành dựa trên 4 pho đại kinh thư: *Uyên Hải Tử Bình*, *Tam Mệnh Thông Hội*, *Địch Thiên Tủy* và *Cùng Thông Bảo Giám*.\n\nTôi đang mở lá số của **${chart.profile.name}** (${chart.profile.gender}), Nhật Chủ **${chart.dayMaster.can}** (${chart.dayMaster.element}), sinh vào mùa ${chart.pillars.month.chi} với Dụng Thần là hành **${chart.dungThanInfo.dungThan}**.\n\nBạn có thể hỏi tôi bất kỳ điều gì về Nhật Chủ, Thập Thần, ngũ hành điều hòa, tiến trình Đại Vận hoặc nhờ trích dẫn thư tịch cổ!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/bazi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, message: text })
      });

      if (!res.ok) throw new Error(`Lỗi máy chủ (${res.status})`);
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Đã ghi nhận câu hỏi.',
        matchedRules: data.matchedRules,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Rất tiếc, đã xảy ra lỗi kết nối: ${err.message}. Vui lòng thử lại.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    `Nhật Chủ ${chart.dayMaster.can} của tôi thuộc Thân Vượng hay Thân Nhược và do đâu?`,
    `Dụng Thần ${chart.dungThanInfo.dungThan} của tôi được xác định theo phương pháp nào?`,
    `Tứ Trụ của tôi có các quan hệ Hợp, Xung hay Tam Hợp nào nổi bật?`,
    `Bước Đại Vận hiện tại của tôi có những đặc điểm gì cần lưu ý?`
  ];

  return (
    <div className="max-w-4xl mx-auto bg-slate-900/90 border border-amber-900/40 rounded-2xl flex flex-col h-[700px] shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-amber-900/30 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-serif flex items-center gap-2">
              Đàm Thoại Bát Tự AI Khảo Chứng
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Đang gắn ngữ cảnh lá số: <strong className="text-amber-300">{chart.profile.name}</strong> • Nhật Chủ {chart.dayMaster.can} ({chart.dayMaster.element})
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Dụng Thần: {chart.dungThanInfo.dungThan}
          </span>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] text-slate-500 whitespace-nowrap pl-1">Gợi ý câu hỏi:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                <Compass className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md space-y-2'
              }`}
            >
              <div className="whitespace-pre-line font-sans">{msg.text}</div>

              {/* Matched Rules Tags */}
              {msg.matchedRules && msg.matchedRules.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-amber-400/90 font-semibold block">
                    Căn cứ thư tịch liên quan ({msg.matchedRules.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.matchedRules.slice(0, 3).map((r: any) => (
                      <span
                        key={r.rule_id}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-mono"
                        title={r.title}
                      >
                        [{r.rule_id}] {r.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] text-right mt-1 ${
                msg.sender === 'user' ? 'text-slate-800 font-mono' : 'text-slate-500 font-mono'
              }`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3.5 bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">AI đang đối chiếu thư tịch Bát Tự...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Hỏi về lá số Bát Tự của ${chart.profile.name}...`}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
