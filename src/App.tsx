import React, { useState } from 'react';
import { calculateTuViChart, TuViChart, Palace } from './engine/tuvi';
import { calculateBaziChart, BaziChart } from './engine/bazi';
import { Header, AppTab } from './components/Header';
import { HomeView } from './components/HomeView';
import { TuViGrid } from './components/TuViGrid';
import { ChartForm } from './components/ChartForm';
import { InterpretationView } from './components/InterpretationView';
import { ChatbotView } from './components/ChatbotView';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { TestRunnerView } from './components/TestRunnerView';
import { PalaceDetailModal } from './components/PalaceDetailModal';
import { BaziForm } from './components/BaziForm';
import { BaziChartGrid } from './components/BaziChartGrid';
import { BaziAnalysisView } from './components/BaziAnalysisView';
import { BaziInterpretationView } from './components/BaziInterpretationView';
import { BaziChatbotView } from './components/BaziChatbotView';
import { ComparisonView } from './components/ComparisonView';
import { LunarCalendarView } from './components/LunarCalendarView';

export function App() {
  // Lá số Tử Vi mặc định - Khởi đầu chuẩn mực cho đương số
  const [tuviChart, setTuviChart] = useState<TuViChart>(() => {
    return calculateTuViChart(
      'Nguyễn Văn An',
      'Nam',
      15,
      8,
      1995,
      10,
      30,
      7,
      'Hà Nội, Việt Nam',
      'Chính xác'
    );
  });

  // Lá số Bát Tự mặc định
  const [baziChart, setBaziChart] = useState<BaziChart>(() => {
    return calculateBaziChart(
      'Nguyễn Văn An',
      'Nam',
      15,
      8,
      1995,
      10,
      30,
      7,
      'Hà Nội, Việt Nam',
      'Chính xác',
      'RatBoundary'
    );
  });

  // Ưu tiên hiển thị Tử Vi Đẩu Số theo đúng trọng tâm của website
  const [currentSystem, setCurrentSystem] = useState<'tuvi' | 'bazi'>('tuvi');
  const [activeTab, setActiveTab] = useState<AppTab>('tuvi_chart');

  // Modal & Navigation State
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [interpretTopic, setInterpretTopic] = useState<string>('Tong_Quan');
  const [interpretPalace, setInterpretPalace] = useState<string | undefined>(undefined);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string>('');
  const [prefilledDate, setPrefilledDate] = useState<{ day: number; month: number; year: number } | null>(null);

  const handleLaunchTuViFromCalendar = (d: number, m: number, y: number) => {
    setPrefilledDate({ day: d, month: m, year: y });
    setCurrentSystem('tuvi');
    setActiveTab('tuvi_form');
  };

  const handleLaunchBaziFromCalendar = (d: number, m: number, y: number) => {
    setPrefilledDate({ day: d, month: m, year: y });
    setCurrentSystem('bazi');
    setActiveTab('bazi_form');
  };

  // Danh sách lá số Tử Vi đã lưu trong LocalStorage
  const [savedTuViCharts, setSavedTuViCharts] = useState<TuViChart[]>(() => {
    try {
      const stored = localStorage.getItem('tuvi_saved_charts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Handler tạo lá số Tử Vi mới
  const handleCreateTuViChart = (params: {
    name: string;
    gender: 'Nam' | 'Nữ';
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    hour: number;
    minute: number;
    timeZone: number;
    birthPlace: string;
    timeAccuracy: string;
  }) => {
    const newTuvi = calculateTuViChart(
      params.name,
      params.gender,
      params.solarDay,
      params.solarMonth,
      params.solarYear,
      params.hour,
      params.minute,
      params.timeZone,
      params.birthPlace,
      params.timeAccuracy
    );

    const newBazi = calculateBaziChart(
      params.name,
      params.gender,
      params.solarDay,
      params.solarMonth,
      params.solarYear,
      params.hour,
      params.minute,
      params.timeZone,
      params.birthPlace,
      params.timeAccuracy,
      'RatBoundary'
    );

    setTuviChart(newTuvi);
    setBaziChart(newBazi);

    setSavedTuViCharts(prev => {
      const exists = prev.some(c => c.profile.name === newTuvi.profile.name && c.profile.solarDate === newTuvi.profile.solarDate);
      const updated = exists ? prev : [newTuvi, ...prev].slice(0, 15);
      try {
        localStorage.setItem('tuvi_saved_charts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setCurrentSystem('tuvi');
    setActiveTab('tuvi_chart');
  };

  // Handler tạo lá số Bát Tự mới
  const handleCreateBaziChart = (params: {
    name: string;
    gender: 'Nam' | 'Nữ';
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    hour: number;
    minute: number;
    timeZone: number;
    birthPlace: string;
    timeAccuracy: string;
    dayBoundaryOption: 'RatBoundary' | 'MidnightBoundary';
  }) => {
    const newBazi = calculateBaziChart(
      params.name,
      params.gender,
      params.solarDay,
      params.solarMonth,
      params.solarYear,
      params.hour,
      params.minute,
      params.timeZone,
      params.birthPlace,
      params.timeAccuracy,
      params.dayBoundaryOption
    );

    const newTuvi = calculateTuViChart(
      params.name,
      params.gender,
      params.solarDay,
      params.solarMonth,
      params.solarYear,
      params.hour,
      params.minute,
      params.timeZone,
      params.birthPlace,
      params.timeAccuracy
    );

    setBaziChart(newBazi);
    setTuviChart(newTuvi);

    setCurrentSystem('bazi');
    setActiveTab('bazi_chart');
  };

  const handleOpenPalaceInterpret = (topic: string, palaceName?: string) => {
    setInterpretTopic(topic);
    setInterpretPalace(palaceName);
    setCurrentSystem('tuvi');
    setActiveTab('tuvi_interpret');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chartName={currentSystem === 'bazi' ? baziChart.profile.name : tuviChart.profile.name}
        onNewTuViClick={() => {
          setCurrentSystem('tuvi');
          setActiveTab('tuvi_form');
        }}
        onNewBaziClick={() => {
          setCurrentSystem('bazi');
          setActiveTab('bazi_form');
        }}
        currentSystem={currentSystem}
        setCurrentSystem={setCurrentSystem}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* 0. TRANG CHỦ TỔNG QUAN */}
        {activeTab === 'home' && (
          <HomeView
            tuviChart={tuviChart}
            baziChart={baziChart}
            onNavigate={tab => setActiveTab(tab)}
          />
        )}

        {/* 1. XEM LÁ SỐ TỬ VI */}
        {activeTab === 'tuvi_chart' && (
          <div className="space-y-4">
            <TuViGrid
              chart={tuviChart}
              onSelectPalace={p => setSelectedPalace(p)}
              selectedPalaceIndex={selectedPalace?.index ?? null}
              onOpenInterpret={handleOpenPalaceInterpret}
            />
          </div>
        )}

        {/* 2. LẬP LÁ SỐ TỬ VI */}
        {activeTab === 'tuvi_form' && (
          <ChartForm
            onSubmit={handleCreateTuViChart}
            savedCharts={savedTuViCharts}
            initialSolarDate={prefilledDate}
            onSelectSavedChart={sc => {
              setTuviChart(sc);
              setActiveTab('tuvi_chart');
            }}
            onDeleteSavedChart={(index) => {
              setSavedTuViCharts(prev => {
                const updated = prev.filter((_, i) => i !== index);
                try {
                  localStorage.setItem('tuvi_saved_charts', JSON.stringify(updated));
                } catch (e) {
                  console.error(e);
                }
                return updated;
              });
            }}
            onImportChart={(importedChart) => {
              setTuviChart(importedChart);
              setActiveTab('tuvi_chart');
            }}
          />
        )}

        {/* 3. LUẬN GIẢI TỬ VI AI */}
        {activeTab === 'tuvi_interpret' && (
          <InterpretationView
            chart={tuviChart}
            initialTopic={interpretTopic}
            initialPalace={interpretPalace}
            onNavigateToChat={(question) => {
              if (question) setChatInitialQuestion(question);
              setActiveTab('tuvi_chat');
            }}
          />
        )}

        {/* 4. ĐÀM THOẠI TỬ VI AI */}
        {activeTab === 'tuvi_chat' && (
          <ChatbotView
            chart={tuviChart}
            initialQuestion={chatInitialQuestion}
          />
        )}

        {/* 5. XEM BÁT TỰ – BỐN TRỤ */}
        {activeTab === 'bazi_chart' && (
          <BaziChartGrid chart={baziChart} />
        )}

        {/* 6. LẬP LÁ SỐ BÁT TỰ */}
        {activeTab === 'bazi_form' && (
          <BaziForm
            onSubmit={handleCreateBaziChart}
            initialSolarDate={prefilledDate}
          />
        )}

        {/* 7. PHÂN TÍCH CHUYÊN SÂU BÁT TỰ */}
        {activeTab === 'bazi_analysis' && (
          <BaziAnalysisView chart={baziChart} />
        )}

        {/* 8. LUẬN GIẢI BÁT TỰ AI */}
        {activeTab === 'bazi_interpret' && (
          <BaziInterpretationView chart={baziChart} />
        )}

        {/* 9. ĐÀM THOẠI BÁT TỰ AI */}
        {activeTab === 'bazi_chat' && (
          <BaziChatbotView chart={baziChart} />
        )}

        {/* 10. LỊCH ÂM – DƯƠNG VIỆT NAM */}
        {activeTab === 'lunar_calendar' && (
          <LunarCalendarView
            onNavigateToTuViForm={handleLaunchTuViFromCalendar}
            onNavigateToBaziForm={handleLaunchBaziFromCalendar}
          />
        )}

        {/* 10. SO SÁNH TỬ VI & BÁT TỰ */}
        {activeTab === 'comparison' && (
          <ComparisonView tuviChart={tuviChart} baziChart={baziChart} />
        )}

        {/* 11. KHO TRI THỨC CỔ ĐIỂN */}
        {activeTab === 'knowledge' && (
          <KnowledgeExplorer />
        )}

        {/* 12. HỆ THỐNG KIỂM THỬ (QA) */}
        {activeTab === 'qa' && (
          <TestRunnerView />
        )}
      </main>

      {/* Tử Vi Palace Detail Modal */}
      {selectedPalace && (
        <PalaceDetailModal
          palace={selectedPalace}
          chart={tuviChart}
          onClose={() => setSelectedPalace(null)}
          onInterpret={handleOpenPalaceInterpret}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-amber-900/30 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300">
            <span className="font-serif font-bold text-amber-300">TỬ VI ĐẨU SỐ TOÀN THƯ & BÁT TỰ TỨ TRỤ</span>
            <span>•</span>
            <span>Tử Vi Đẩu Số Toàn Thư (Vũ Tài Lục)</span>
            <span>•</span>
            <span>Uyên Hải Tử Bình</span>
            <span>•</span>
            <span>Địch Thiên Tủy</span>
            <span>•</span>
            <span>Cùng Thông Bảo Giám</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Kiểm định toán học & thiên văn 24 Tests Pass</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
            Hệ thống phục vụ nghiên cứu học thuật, đối chiếu thư tịch cổ và chiêm nghiệm văn hóa Á Đông. Không đại diện cho dự đoán tương lai tất định hay chân lý khoa học thực nghiệm.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
