import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { calculateTuViChart, TuViChart, Palace } from './src/engine/tuvi';
import { TUVI_RULES, findMatchingRules } from './src/knowledge/rules';
import { SOURCE_DOCUMENTS } from './src/knowledge/sources';
import { runFullTestSuite } from './src/engine/testSuite';
import { calculateBaziChart, BaziChart } from './src/engine/bazi';
import { BAZI_RULES, findMatchingBaziRules } from './src/knowledge/baziRules';
import { runBaziTestSuite } from './src/engine/baziTestSuite';
import { runComprehensiveQASuite } from './src/engine/qaTestSuite';
import {
  generateMonthCalendar,
  safeConvertLunarToSolar,
  getDayDetail,
  getLeapMonthInLunarYear
} from './src/engine/lunarCalendar';
import { convertSolarToLunar } from './src/engine/lunar';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// 1. Lightweight in-memory rate limiter để bảo vệ API khỏi request flooding
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const RATE_LIMIT_MAX_REQUESTS = 60;     // Tối đa 60 requests/phút

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Quá nhiều yêu cầu trong thời gian ngắn. Vui lòng đợi 1 phút trước khi thử lại.'
    });
  }

  entry.count++;
  next();
}

app.use('/api', rateLimiter);

// 2. Client Google GenAI trên server-side với cơ chế khởi tạo linh hoạt và fallback thông minh
function getGenAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.startsWith('MY_')) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err: any) {
    console.warn('Failed to initialize GoogleGenAI client:', err.message);
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Yêu cầu AI quá thời gian chờ sau ' + timeoutMs + 'ms')), timeoutMs)
    )
  ]);
}

/**
 * Hàm gọi Gemini AI với cơ chế dự phòng: Thử gemini-3.8-flash, nếu quá tải hoặc lỗi thì tự động chuyển sang gemini-3.1-flash-lite
 */
async function generateGroundedInterpretation({
  contents,
  systemInstruction,
  primaryTimeoutMs = 7000,
  fallbackTimeoutMs = 15000
}: {
  contents: string;
  systemInstruction: string;
  primaryTimeoutMs?: number;
  fallbackTimeoutMs?: number;
}): Promise<{ text: string; modelUsed: string } | null> {
  const client = getGenAIClient();
  if (!client) return null;

  // 1. Thử model chính gemini-3.8-flash (với timeout ngắn nếu server Google đang quá tải)
  try {
    const response = await withTimeout(
      client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: { systemInstruction }
      }),
      primaryTimeoutMs
    );
    if (response.text && response.text.trim()) {
      return { text: response.text.trim(), modelUsed: 'Gemini 3.8 Flash' };
    }
  } catch (primaryErr: any) {
    console.warn('Primary model gemini-3.8-flash failed/timed out, switching to resilient gemini-3.1-flash-lite:', primaryErr.message || primaryErr);
  }

  // 2. Thử model dự phòng cực nhanh: gemini-3.1-flash-lite (< 1 giây)
  try {
    const response = await withTimeout(
      client.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: { systemInstruction }
      }),
      fallbackTimeoutMs
    );
    if (response.text && response.text.trim()) {
      return { text: response.text.trim(), modelUsed: 'Gemini 3.1 Flash Lite (Resilient Fallback)' };
    }
  } catch (fallbackErr: any) {
    console.warn('Fallback model gemini-3.1-flash-lite failed:', fallbackErr.message || fallbackErr);
  }

  return null;
}

// 3. API Lập lá số Tử Vi (có kiểm tra dữ liệu đầu vào nghiêm ngặt)
app.post('/api/charts', (req: Request, res: Response) => {
  try {
    const {
      name,
      gender,
      solarDay,
      solarMonth,
      solarYear,
      hour,
      minute = 0,
      timeZone = 7,
      birthPlace = 'Việt Nam',
      timeAccuracy = 'Chính xác'
    } = req.body;

    const day = Number(solarDay);
    const month = Number(solarMonth);
    const year = Number(solarYear);
    const h = Number(hour);
    const m = Number(minute || 0);
    const tz = Number(timeZone !== undefined ? timeZone : 7);

    // Xác thực phạm vi ngày tháng năm
    if (isNaN(day) || day < 1 || day > 31 || isNaN(month) || month < 1 || month > 12 || isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'Ngày, tháng hoặc năm sinh không hợp lệ (hỗ trợ từ năm 1900 đến 2100).' });
    }

    // Xác thực giờ phút
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      return res.status(400).json({ error: 'Giờ hoặc phút sinh không hợp lệ (Giờ: 0-23, Phút: 0-59).' });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Vô Danh';
    const cleanGender = gender === 'Nữ' ? 'Nữ' : 'Nam';
    const cleanPlace = typeof birthPlace === 'string' ? birthPlace.trim().slice(0, 100) : 'Việt Nam';
    const cleanAccuracy = typeof timeAccuracy === 'string' ? timeAccuracy.trim().slice(0, 100) : 'Chính xác';

    const chart = calculateTuViChart(
      cleanName,
      cleanGender,
      day,
      month,
      year,
      h,
      m,
      tz,
      cleanPlace,
      cleanAccuracy
    );

    res.json({ success: true, chart });
  } catch (error: any) {
    console.error('Error generating chart:', error);
    res.status(500).json({ error: error.message || 'Không thể lập lá số do lỗi dữ liệu.' });
  }
});

// 4. API Tra cứu quy tắc tri thức
app.get('/api/rules', (req: Request, res: Response) => {
  try {
    const { topic, star, category, status } = req.query;
    let filtered = [...TUVI_RULES];

    if (topic && typeof topic === 'string') {
      filtered = filtered.filter(r => r.topic.toLowerCase() === topic.toLowerCase());
    }
    if (star && typeof star === 'string') {
      filtered = filtered.filter(r => r.stars_involved.some(s => s.toLowerCase().includes((star as string).toLowerCase())));
    }
    if (category && typeof category === 'string') {
      filtered = filtered.filter(r => r.category === category);
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter(r => r.verification_status === status);
    }

    res.json({ success: true, count: filtered.length, rules: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. API Tra cứu danh mục tài liệu nguồn
app.get('/api/sources', (_req: Request, res: Response) => {
  res.json({ success: true, sources: SOURCE_DOCUMENTS });
});



// 7. API Luận giải AI có căn cứ tri thức (Grounding with Gemini 3.8 Flash)
app.post('/api/interpret', async (req: Request, res: Response) => {
  try {
    const { chart, focusTopic = 'Tong_Quan', focusPalace } = req.body as {
      chart: TuViChart;
      focusTopic?: string;
      focusPalace?: string;
    };

    if (!chart || !chart.palaces || chart.palaces.length !== 12) {
      return res.status(400).json({ error: 'Dữ liệu lá số không hợp lệ hoặc thiếu 12 cung.' });
    }

    const menhPalace = chart.palaces[chart.menhPalaceIndex];

    // Xác định cung mục tiêu cụ thể nếu người dùng yêu cầu luận một cung
    let targetPalace: Palace | null = null;
    if (focusPalace) {
      targetPalace = chart.palaces.find(
        p => p.name.toLowerCase() === focusPalace.toLowerCase() || p.chi.toLowerCase() === focusPalace.toLowerCase()
      ) || null;
    }

    // Tập hợp các sao liên quan
    let relevantStars: string[] = [];
    let palaceContextText = '';

    if (targetPalace) {
      const doiCung = chart.palaces[targetPalace.xungChieuIndex] || chart.palaces[0];
      const tamHop1 = chart.palaces[targetPalace.tamHopIndices?.[0] ?? 0] || chart.palaces[0];
      const tamHop2 = chart.palaces[targetPalace.tamHopIndices?.[1] ?? 0] || chart.palaces[0];

      relevantStars = [
        ...(targetPalace.chinhTinh || []).map(s => s.name),
        ...(targetPalace.phuTinhTot || []).map(s => s.name),
        ...(targetPalace.phuTinhXau || []).map(s => s.name),
        ...(doiCung?.chinhTinh || []).map(s => s.name),
        ...(tamHop1?.chinhTinh || []).map(s => s.name),
        ...(tamHop2?.chinhTinh || []).map(s => s.name),
      ];

      palaceContextText = `
CUNG TRỌNG TÂM ĐƯỢC CHỈ ĐỊNH: Cung ${targetPalace.name} (${targetPalace.can} ${targetPalace.chi})
- Chính tinh: ${(targetPalace.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu (Mượn chính tinh cung đối)'}
- Cát tinh: ${(targetPalace.phuTinhTot || []).map(s => s.name).join(', ') || 'Không có'}
- Hung sát tinh: ${(targetPalace.phuTinhXau || []).map(s => s.name).join(', ') || 'Không có'}
- Vòng Tràng Sinh: ${targetPalace.vongTrangSinh || 'N/A'} | Bác Sỹ: ${targetPalace.vongBacSy || 'N/A'} | Thái Tuế: ${targetPalace.vongThaiTue || 'N/A'}
- Tuần / Triệt: ${targetPalace.hasTuan ? 'Có Tuần Không' : ''} ${targetPalace.hasTriet ? 'Có Triệt Không' : ''}
- Đại hạn: ${targetPalace.daiHanAge || 0} - ${(targetPalace.daiHanAge || 0) + 9} tuổi • Tiểu hạn năm: ${targetPalace.tieuHanChi || 'N/A'}
- Tam Phương Tứ Chính:
  + Đối cung (${doiCung.chi} - ${doiCung.name}): ${(doiCung.chinhTinh || []).map(s => s.name).join(', ') || 'Vô Chính Diệu'}
  + Tam hợp 1 (${tamHop1.chi} - ${tamHop1.name}): ${(tamHop1.chinhTinh || []).map(s => s.name).join(', ') || 'Vô Chính Diệu'}
  + Tam hợp 2 (${tamHop2.chi} - ${tamHop2.name}): ${(tamHop2.chinhTinh || []).map(s => s.name).join(', ') || 'Vô Chính Diệu'}
`;
    } else {
      const quanPalace = chart.palaces.find(p => p.name === 'Quan Lộc') || menhPalace;
      const taiPalace = chart.palaces.find(p => p.name === 'Tài Bạch') || menhPalace;
      const phuPalace = chart.palaces.find(p => p.name === 'Phu Thê') || menhPalace;

      relevantStars = [
        ...(menhPalace.chinhTinh || []).map(s => s.name),
        ...(menhPalace.phuTinhTot || []).map(s => s.name),
        ...(menhPalace.phuTinhXau || []).map(s => s.name),
        ...(quanPalace?.chinhTinh || []).map(s => s.name),
        ...(taiPalace?.chinhTinh || []).map(s => s.name),
        ...(phuPalace?.chinhTinh || []).map(s => s.name)
      ];

      palaceContextText = `
CÁC CUNG TRỤ CỘT CỦA LÁ SỐ:
- Cung Mệnh tại ${menhPalace.chi}: ${(menhPalace.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu'}
- Cung Quan Lộc tại ${quanPalace?.chi || 'N/A'}: ${(quanPalace?.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu'}
- Cung Tài Bạch tại ${taiPalace?.chi || 'N/A'}: ${(taiPalace?.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu'}
- Cung Phu Thê tại ${phuPalace?.chi || 'N/A'}: ${(phuPalace?.chinhTinh || []).map(s => `${s.name} (${s.brightness || 'B'})`).join(', ') || 'Vô Chính Diệu'}
`;
    }

    // Truy xuất quy tắc trong Knowledge Base theo các sao và cung liên quan
    const matchedRules = findMatchingRules(
      targetPalace ? undefined : (focusTopic !== 'Tong_Quan' ? focusTopic : undefined),
      relevantStars,
      targetPalace?.name
    );

    // Chuẩn bị System Prompt và User Prompt nghiêm ngặt
    const promptContext = `
DỮ LIỆU LÁ SỐ THỰC TẾ ĐÃ ĐƯỢC TÍNH TOÁN (TUYỆT ĐỐI KHÔNG ĐƯỢC THAY ĐỔI VỊ TRÍ SAO):
- Họ tên: ${chart.profile.name}
- Giới tính: ${chart.profile.gender} (${chart.amDuongNamNu})
- Dương lịch: ${chart.profile.solarDate} lúc ${chart.profile.solarTime}
- Âm lịch: Ngày ${chart.profile.lunarDate.day}/${chart.profile.lunarDate.month}/${chart.profile.lunarDate.year} (Năm ${chart.profile.lunarDate.canYear} ${chart.profile.lunarDate.chiYear})
- Bản Mệnh: ${chart.menhNguHanh.name} (Hành ${chart.menhNguHanh.element})
- Cục: ${chart.cuc.name} (Số ${chart.cuc.number}, Hành ${chart.cuc.element})
- Mệnh Chủ: ${chart.menhChu} | Thân Chủ: ${chart.thanChu}
${palaceContextText}

QUY TẮC TRUY XUẤT TỪ CƠ SỞ TRI THỨC ĐÃ KIỂM CHỨNG (Tử Vi Đẩu Số Toàn Thư - Vũ Tài Lục dịch):
${matchedRules.length > 0 ? matchedRules.map(r => `[${r.rule_id}] [Nhóm ${r.category}] ${r.title}
- Nội dung: ${r.rule_text}
- Nguồn: ${r.source_chapter}, Trang ${r.source_page}
- Nguyên văn: "${r.source_excerpt}"
- Trạng thái kiểm chứng: ${r.verification_status}`).join('\n\n') : 'Chưa có quy tắc riêng biệt trong bộ dữ liệu ban đầu cho tổ hợp này. AI chỉ được diễn giải dựa trên ngũ hành, cung vị và độ sáng miếu hãm chuẩn.'}

YÊU CẦU ĐỊNH DẠNG BẢN LUẬN GIẢI:
Hãy xây dựng bản luận giải chi tiết theo đúng cấu trúc chuẩn:
1. **Chủ đề luận giải**: ${focusPalace ? `Luận giải Cung ${focusPalace}` : (focusTopic === 'Tong_Quan' ? 'Tổng quan Mệnh Thân và Cục' : focusTopic)}
2. **Dữ liệu lá số liên quan**: Phân tích đúng các sao thực tế có trong cung và thế tam hợp.
3. **Quy tắc thư tịch áp dụng**: Tóm tắt các quy tắc từ Tử Vi Đẩu Số Toàn Thư (Vũ Tài Lục).
4. **Căn cứ trích dẫn rõ ràng**: Ghi rõ tên sách, chương, số trang tương ứng.
5. **Phân biệt 4 nhóm tri thức**: Ghi rõ nhận định nào thuộc Nhóm A (sách Toàn Thư), Nhóm B (đối chiếu), Nhóm C (dị bản), Nhóm D (AI tổng hợp).
6. **Mâu thuẫn hoặc dị bản (nếu có)**: Trình bày khách quan.
7. **Giới hạn và tính nhân văn**: Khẳng định đây là tri thức văn hóa phương Đông để định hướng phát triển bản thân, không phải kết luận số mệnh khoa học định kiến.
`;

    // Gọi Gemini API thông qua cơ chế dự phòng có căn cứ tri thức
    const aiResult = await generateGroundedInterpretation({
      contents: promptContext,
      systemInstruction: 'Bạn là chuyên gia khảo chứng Tử Vi Đẩu Số học thuật, dựa trên nguyên bản Tử Vi Đẩu Số Toàn Thư của Hi Di Trần Đoàn do học giả Vũ Tài Lục biên dịch và chú giải. Bạn tuyệt đối không được bịa đặt vị trí sao, không bịa quy tắc hay số trang sách. Hãy đưa ra luận giải sâu sắc, trung thực, khoa học và minh bạch nguồn gốc.',
      primaryTimeoutMs: 7000,
      fallbackTimeoutMs: 15000
    });

    if (aiResult && aiResult.text) {
      return res.json({
        success: true,
        interpretation: aiResult.text,
        matchedRules,
        source: `${aiResult.modelUsed} (Grounding via Knowledge Base)`
      });
    }

    // Fallback nếu chưa có key: Tổng hợp trực tiếp từ Knowledge Base
    const palaceName = targetPalace ? targetPalace.name : 'Mệnh';
    const fallbackPalace = targetPalace || menhPalace;

    const fallbackInterpretation = `### BẢN LUẬN GIẢI KHẢO CHỨNG TỬ VI ĐẨU SỐ TOÀN THƯ
*(Biên soạn dựa trên cơ sở tri thức đã kiểm chứng - Vũ Tài Lục dịch thuật & chú giải)*

#### 1. Chủ đề luận giải
Luận giải chi tiết **Cung ${palaceName}** của đương số **${chart.profile.name}**.

#### 2. Dữ liệu lá số liên quan
- **Cung tọa thủ**: Cung ${fallbackPalace.chi} (${fallbackPalace.can} ${fallbackPalace.chi})
- **Bản Mệnh / Cục**: ${chart.menhNguHanh.name} • ${chart.cuc.name}
- **Chính diệu tọa thủ**: ${(fallbackPalace.chinhTinh || []).map(s => `${s.name} [Độ sáng: ${s.brightness || 'B'}]`).join(', ') || 'Cung Vô Chính Diệu (mượn chính tinh cung đối xung)'}
- **Hội tụ sao cát**: ${(fallbackPalace.phuTinhTot || []).map(s => s.name).join(', ') || 'Thuần tĩnh'}
- **Sát tinh hội chiếu**: ${(fallbackPalace.phuTinhXau || []).map(s => s.name).join(', ') || 'Không bị sát tinh hãm địa trực tiếp xâm phạm'}
- **Vòng Tràng Sinh**: ${fallbackPalace.vongTrangSinh || 'N/A'} | **Vòng Bác Sỹ**: ${fallbackPalace.vongBacSy || 'N/A'} | **Vòng Thái Tuế**: ${fallbackPalace.vongThaiTue || 'N/A'}
- **Đại hạn**: ${fallbackPalace.daiHanAge || 0} - ${(fallbackPalace.daiHanAge || 0) + 9} tuổi • **Tiểu hạn**: Năm ${fallbackPalace.tieuHanChi || 'N/A'}

#### 3. Quy tắc thư tịch và phân tích có căn cứ
${matchedRules.length > 0 ? matchedRules.slice(0, 3).map(r => `
- **Quy tắc [${r.rule_id}] - ${r.title} (Nhóm ${r.category})**:
  + *Nội dung*: ${r.rule_text}
  + *Căn cứ thư tịch*: ${r.source_chapter}, Trang ${r.source_page} (Sách *Tử Vi Đẩu Số Toàn Thư* - Vũ Tài Lục dịch).
  + *Nguyên văn*: "${r.source_excerpt}"
  + *Ứng dụng vào lá số*: Sự tương tác giữa các tinh đẩu tại ${fallbackPalace.chi} tạo nên trường khí chủ đạo cho phương diện này của đương số.
`).join('\n') : `
- Tinh đẩu tại cung ${fallbackPalace.chi} phản ánh trường năng lượng tự nhiên. Khi gặp Tuần Không hoặc Triệt Không (${fallbackPalace.hasTuan ? 'Có Tuần' : ''} ${fallbackPalace.hasTriet ? 'Có Triệt' : 'Không có'}), tính chất sẽ có sự gia giảm, tiền vận trầm lắng hậu vận quang minh.`}

#### 4. Phân định Nhóm tri thức & Dị bản
- **Nhóm A (Tài liệu nền tảng Toàn Thư)**: Vị trí miếu hãm và an sao tuân thủ chuẩn Hi Di Trần Đoàn do Vũ Tài Lục khảo chứng.
- **Nhóm C (Dị bản cần lưu ý)**: Có sự khác biệt giữa các trường phái về cách tính Tứ Hóa Can Canh (Thiên Đồng vs Thái Âm Hóa Kỵ).

#### 5. Giới hạn luận giải
Bản luận giải dựa trên hệ thống biểu tượng chiêm tinh học cổ truyền Á Đông nhằm mục đích chiêm nghiệm, hoàn thiện tính cách và thấu hiểu bản thân; không phải định mệnh bất biến hay sự thật khoa học thực nghiệm.`;

    res.json({
      success: true,
      interpretation: fallbackInterpretation,
      matchedRules,
      source: 'Cơ sở tri thức chuẩn thư tịch Vũ Tài Lục (Offline Verified)'
    });
  } catch (error: any) {
    console.error('Error during interpretation:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý luận giải.' });
  }
});

// 8. API Trò chuyện AI với ngữ cảnh lá số (Grounded Chatbot)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { chart, message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    const cleanMessage = message.trim().slice(0, 1000);

    // Tìm kiếm các quy tắc liên quan đến câu hỏi
    const matchedRules = TUVI_RULES.filter(r => {
      const lower = cleanMessage.toLowerCase();
      return r.title.toLowerCase().includes(lower) ||
        r.stars_involved.some(s => lower.includes(s.toLowerCase())) ||
        (r.palaces_involved && r.palaces_involved.some(p => lower.includes(p.toLowerCase())));
    });

    const menhPalace = chart?.palaces?.[chart?.menhPalaceIndex];
    const chatContext = `
Bạn là Trợ lý AI Khảo chứng Tử Vi Đẩu Số, dựa vào sách "Tử Vi Đẩu Số Toàn Thư" (Hi Di Trần Đoàn - Vũ Tài Lục biên dịch).
THÔNG TIN LÁ SỐ ĐANG MỞ:
- Họ tên: ${chart?.profile?.name || 'Đương số'} (${chart?.profile?.gender || 'Nam'} - ${chart?.amDuongNamNu || ''})
- Cung Mệnh: tại ${menhPalace?.chi || 'Dần'} (Can ${menhPalace?.can || ''}), Chính tinh: ${menhPalace?.chinhTinh?.map((s: any) => s.name).join(', ') || 'Vô Chính Diệu'}
- Cục: ${chart?.cuc?.name || 'Thủy Nhị Cục'}, Bản Mệnh: ${chart?.menhNguHanh?.name || 'Kim'}
- Triệt tại: ${chart?.trietPalaces?.map((i: number) => chart.palaces[i]?.chi).join('-') || ''} | Tuần tại: ${chart?.tuanPalaces?.map((i: number) => chart.palaces[i]?.chi).join('-') || ''}
- Các quy tắc thư tịch liên quan trích từ cơ sở tri thức:
${matchedRules.map(r => `* [${r.rule_id}][Nhóm ${r.category}] ${r.title}: ${r.rule_text} (Trích: ${r.source_chapter}, Trang ${r.source_page})`).join('\n')}

QUY TẮC TRẢ LỜI NGHIÊM NGẶT:
1. Tuyệt đối không bịa đặt sao không có trong lá số.
2. Dẫn chứng chính xác tên sách, chương, trang nếu có quy tắc.
3. Nếu không tìm thấy căn cứ phù hợp, trả lời thẳng thắn: "Chưa tìm thấy đủ căn cứ trong cơ sở tri thức hiện có để đưa ra luận giải đáng tin cậy cho câu hỏi này."
4. Luôn giữ thái độ nhã nhặn, khách quan và minh bạch.
`;

    const aiResult = await generateGroundedInterpretation({
      contents: `${chatContext}\n\nNgười dùng hỏi: ${cleanMessage}`,
      systemInstruction: 'Bạn là Trợ lý AI Khảo chứng Tử Vi Đẩu Số, dựa vào sách Tử Vi Đẩu Số Toàn Thư (Hi Di Trần Đoàn - Vũ Tài Lục biên dịch). Tuyệt đối không bịa đặt sao không có trong lá số.',
      primaryTimeoutMs: 7000,
      fallbackTimeoutMs: 15000
    });

    if (aiResult && aiResult.text) {
      return res.json({
        success: true,
        reply: aiResult.text,
        matchedRules,
        source: aiResult.modelUsed
      });
    }

    // Phản hồi nếu không có API key
    res.json({
      success: true,
      reply: `Dựa trên cơ sở tri thức *Tử Vi Đẩu Số Toàn Thư (Vũ Tài Lục)*: Đối với câu hỏi "${cleanMessage}" trên lá số của đương số ${chart?.profile?.name || ''}, hệ thống đã tra cứu các yếu tố tinh đẩu liên quan. Để kích hoạt đàm thoại tương tác với Gemini 3.8 Flash, vui lòng gắn API Key tại Settings.`,
      matchedRules
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý câu hỏi.' });
  }
});

// ==========================================
// PHÂN HỆ API BÁT TỰ - TỨ TRỤ (BAZI SUBSYSTEM)
// ==========================================

// 9. API Lập lá số Bát Tự - Tứ Trụ
app.post('/api/bazi/charts', (req: Request, res: Response) => {
  try {
    const {
      name,
      gender,
      solarDay,
      solarMonth,
      solarYear,
      hour,
      minute = 0,
      timeZone = 7,
      birthPlace = 'Việt Nam',
      timeAccuracy = 'Chính xác',
      dayBoundaryOption = 'RatBoundary'
    } = req.body;

    const day = Number(solarDay);
    const month = Number(solarMonth);
    const year = Number(solarYear);
    const h = Number(hour);
    const m = Number(minute || 0);
    const tz = Number(timeZone !== undefined ? timeZone : 7);

    // Xác thực phạm vi ngày tháng năm
    if (isNaN(day) || day < 1 || day > 31 || isNaN(month) || month < 1 || month > 12 || isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'Ngày, tháng hoặc năm sinh không hợp lệ (hỗ trợ từ năm 1900 đến 2100).' });
    }

    // Xác thực giờ phút
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      return res.status(400).json({ error: 'Giờ hoặc phút sinh không hợp lệ (Giờ: 0-23, Phút: 0-59).' });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Vô Danh';
    const cleanGender = gender === 'Nữ' ? 'Nữ' : 'Nam';

    const baziChart = calculateBaziChart(
      cleanName,
      cleanGender,
      day,
      month,
      year,
      h,
      m,
      tz,
      typeof birthPlace === 'string' ? birthPlace.slice(0, 100) : 'Việt Nam',
      typeof timeAccuracy === 'string' ? timeAccuracy : 'Chính xác',
      dayBoundaryOption === 'MidnightBoundary' ? 'MidnightBoundary' : 'RatBoundary'
    );

    res.json({
      success: true,
      chart: baziChart
    });
  } catch (error: any) {
    console.error('Error calculating Bazi chart:', error);
    res.status(500).json({ error: error.message || 'Lỗi tính toán Bát Tự.' });
  }
});

// 10. API Luận giải Bát Tự AI (có dẫn nguồn thư tịch kinh điển)
app.post('/api/bazi/interpret', async (req: Request, res: Response) => {
  try {
    const { chart, topic = 'TongQuan', yearSelected } = req.body as {
      chart: BaziChart;
      topic?: string;
      yearSelected?: number;
    };

    if (!chart || !chart.pillars || !chart.dayMaster) {
      return res.status(400).json({ error: 'Dữ liệu lá số Bát Tự không hợp lệ.' });
    }

    // Truy xuất quy tắc Bát Tự liên quan
    const queryTerm = topic === 'TinhCach' ? 'Nhật Chủ'
      : topic === 'CongDanh' ? 'Quan Sát'
      : topic === 'TaiChinh' ? 'Tài Tinh'
      : topic === 'TinhDuyen' ? 'Thê Cung'
      : topic === 'DaiVan' ? 'Đại Vận'
      : topic === 'LuuNien' ? 'Lưu Niên'
      : 'Dụng Thần';

    const matchedRules = findMatchingBaziRules(queryTerm);

    const baziContextText = `
DỮ LIỆU BÁT TỰ - TỨ TRỤ ĐÃ ĐƯỢC TÍNH TOÁN THEO THIÊN VĂN (TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT CAN CHI):
- Đương số: ${chart.profile.name} (${chart.profile.gender}), Sinh ngày: ${chart.profile.solarDate} lúc ${chart.profile.solarTime} (Múi giờ UTC+${chart.profile.timeZone})
- BỐN TRỤ (TỨ TRỤ):
  + Trụ Năm: ${chart.pillars.year.fullName} (Can: ${chart.pillars.year.can} [${chart.pillars.year.canElement} ${chart.pillars.year.canPolarity}] - Chi: ${chart.pillars.year.chi} [${chart.pillars.year.chiElement}], Nạp Âm: ${chart.pillars.year.napAm}, Thập Thần: ${chart.pillars.year.tenGod})
  + Trụ Tháng: ${chart.pillars.month.fullName} (Can: ${chart.pillars.month.can} [${chart.pillars.month.canElement}] - Chi: ${chart.pillars.month.chi} [Nguyệt Lệnh], Nạp Âm: ${chart.pillars.month.napAm}, Thập Thần: ${chart.pillars.month.tenGod})
  + Trụ Ngày: ${chart.pillars.day.fullName} (Nhật Can: ${chart.pillars.day.can} [Bản thể ${chart.dayMaster.element} ${chart.dayMaster.polarity}] - Nhật Chi: ${chart.pillars.day.chi}, Nạp Âm: ${chart.pillars.day.napAm})
  + Trụ Giờ: ${chart.pillars.hour.fullName} (Can: ${chart.pillars.hour.can} - Chi: ${chart.pillars.hour.chi}, Nạp Âm: ${chart.pillars.hour.napAm}, Thập Thần: ${chart.pillars.hour.tenGod})
- NHẬT CHỦ: ${chart.dayMaster.can} (${chart.dayMaster.element} ${chart.dayMaster.polarity}), Tính chất: ${chart.dayMaster.nature}
- ĐÁNH GIÁ THỰC LỰC NHẬT CHỦ: ${chart.dayMasterStrength.level} (${chart.dayMasterStrength.score}/100đ). Đắc Lệnh: ${chart.dayMasterStrength.dacLenh}, Đắc Địa: ${chart.dayMasterStrength.dacDia}, Đắc Thế: ${chart.dayMasterStrength.dacThe}
- NGŨ HÀNH TOÀN CỤC:
  + Kim: ${chart.elementAnalysis.breakdown['Kim'].percentage}% (${chart.elementAnalysis.breakdown['Kim'].points}đ)
  + Mộc: ${chart.elementAnalysis.breakdown['Mộc'].percentage}% (${chart.elementAnalysis.breakdown['Mộc'].points}đ)
  + Thủy: ${chart.elementAnalysis.breakdown['Thủy'].percentage}% (${chart.elementAnalysis.breakdown['Thủy'].points}đ)
  + Hỏa: ${chart.elementAnalysis.breakdown['Hỏa'].percentage}% (${chart.elementAnalysis.breakdown['Hỏa'].points}đ)
  + Thổ: ${chart.elementAnalysis.breakdown['Thổ'].percentage}% (${chart.elementAnalysis.breakdown['Thổ'].points}đ)
  + Mạnh nhất: ${chart.elementAnalysis.strongestElement} | Yếu nhất: ${chart.elementAnalysis.weakestElement}
- DỤNG THẦN & HỶ THẦN (Theo ${chart.dungThanInfo.sourceBook}):
  + Phương pháp: ${chart.dungThanInfo.method}
  + Dụng Thần: ${chart.dungThanInfo.dungThan} | Hỷ Thần: ${chart.dungThanInfo.hyThan.join(', ')} | Kỵ Thần: ${chart.dungThanInfo.kyThan.join(', ')}
  + Luận chứng: ${chart.dungThanInfo.rationale}
- ĐẠI VẬN: Hướng đi ${chart.luckCycles.direction} (${chart.luckCycles.directionRule}), khởi vận lúc ${chart.luckCycles.inceptionAge} tuổi (${chart.luckCycles.inceptionDateDescription}).
- CẢNH BÁO / LƯU Ý: ${chart.warnings.length > 0 ? chart.warnings.join('; ') : 'Không có bất thường ranh giới.'}
`;

    if (getGenAIClient()) {
      const systemInstruction = `
Bạn là Chuyên gia Khảo chứng Bát Tự – Tứ Trụ Cấp cao, nắm vững 4 pho đại thư tịch:
1. 《渊海子平》 (Uyên Hải Tử Bình - Từ Đại Thăng)
2. 《滴天髓》 (Địch Thiên Tủy - Lưu Bá Ôn / Nhậm Thiết Tiều)
3. 《三命通会》 (Tam Mệnh Thông Hội - Vạn Dân Anh)
4. 《穷通宝鉴》 (Cùng Thông Bảo Giám - Dư Xuân Thai)

NGUYÊN TẮC LUẬN GIẢI NGHIÊM NGẶT:
1. KHÔNG tự bịa đặt hay thay đổi Can Chi, Thập Thần hoặc Dụng Thần đã được tính toán.
2. Căn cứ trực tiếp vào Tứ Trụ, Thân Cường/Nhược, Ngũ Hành và Dụng Thần được cung cấp.
3. Trình bày rõ ràng:
   - Dữ liệu Bát Tự liên quan
   - Quy tắc cổ điển áp dụng (dẫn tên sách, chương nếu có)
   - Phân tích chi tiết và các góc nhìn đa trường phái nếu có khác biệt
   - Lời khuyên tu dưỡng, định hướng nghề nghiệp, rèn luyện tính cách khách quan, thực tế
   - Tuyên bố giới hạn: Bát Tự là mô hình triết học biểu tượng cổ xưa, không phải định mệnh tiền định khoa học.
4. KHÔNG võ đoán tương lai chắc chắn xảy ra, KHÔNG khuyên đầu tư tài chính may rủi, KHÔNG phán xét hôn nhân chia lìa tiêu cực.
`;

      const userPrompt = `
Hãy lập bản luận giải Bát Tự chuyên sâu cho chuyên mục: [${topic}] ${yearSelected ? `(Năm khảo sát: ${yearSelected})` : ''}
${baziContextText}

CÁC QUY TẮC CỔ ĐIỂN CÓ THỂ THAM KHẢO TỪ KNOWLEDGE BASE:
${matchedRules.map(r => `* [${r.rule_id}][Nhóm ${r.category}] ${r.title}: ${r.rule_text} (Nguồn: ${r.source_book}, ${r.source_chapter})`).join('\n')}
`;

      const aiResult = await generateGroundedInterpretation({
        contents: `${systemInstruction}\n\n${userPrompt}`,
        systemInstruction,
        primaryTimeoutMs: 7000,
        fallbackTimeoutMs: 15000
      });

      if (aiResult && aiResult.text) {
        return res.json({
          success: true,
          interpretation: aiResult.text,
          matchedRules,
          source: `${aiResult.modelUsed} (Grounded in Bazi Classical Canons)`
        });
      }
    }

    // Fallback luận giải tiền định chuẩn mực theo thư tịch cổ
    const dm = chart.dayMaster;
    const dt = chart.dungThanInfo;
    const st = chart.dayMasterStrength;

    const fallbackInterpretation = `### Bản Luận Giải Bát Tự Khảo Chứng: ${topic === 'TongQuan' ? 'Tổng Quan Tứ Trụ' : topic}
*Đương số: ${chart.profile.name} (${chart.profile.gender}) • Ngày sinh: ${chart.profile.solarDate} lúc ${chart.profile.solarTime}*

---

#### 1. Dữ liệu Bát Tự & Khí Tượng Tiên Thiên
- **Bốn Trụ:** Năm **${chart.pillars.year.fullName}** (${chart.pillars.year.napAm}) • Tháng **${chart.pillars.month.fullName}** • Ngày **${chart.pillars.day.fullName}** • Giờ **${chart.pillars.hour.fullName}**
- **Nhật Chủ (Bản Thể):** **${dm.can}** (${dm.element} ${dm.polarity})
- **Khí Thế Địch Thiên Tủy:** *"${dm.nature}"*
- **Thực Lực Thân Thể:** **${st.level}** (Đạt ${st.score}/100 điểm khí lực).
  ${st.factors.map(f => `- ${f}`).join('\n  ')}

#### 2. Dụng Thần & Hỷ Kỵ Thần (*${dt.sourceBook}*)
- **Dụng Thần Tối Ưu:** Hành **${dt.dungThan}** (${dt.method})
- **Hỷ Thần Trợ Vận:** **${dt.hyThan.join(', ')}**
- **Kỵ Thần Cần Tiết Chế:** **${dt.kyThan.join(', ')}**
- **Căn Cứ Thư Tịch:** *"${dt.classicalCitation}"*
- **Luận Giải Ứng Dụng:** ${dt.rationale}

#### 3. Phân Tích Cân Bằng Ngũ Hành
${chart.elementAnalysis.explanation}
- Hành vượng nhất: **${chart.elementAnalysis.strongestElement}** (${chart.elementAnalysis.breakdown[chart.elementAnalysis.strongestElement].percentage}%)
- Hành nhược nhất: **${chart.elementAnalysis.weakestElement}** (${chart.elementAnalysis.breakdown[chart.elementAnalysis.weakestElement].percentage}%)

#### 4. Tiến Trình Đại Vận
- Đại Vận vận hành theo chiều **${chart.luckCycles.direction}** (${chart.luckCycles.directionRule}).
- Khởi vận vào mốc **${chart.luckCycles.inceptionAge} tuổi** (${chart.luckCycles.inceptionDateDescription}).
- Chu kỳ chuyển vận đầu tiên mở ra tại năm **${chart.luckCycles.startYear}** với bước vận **${chart.luckCycles.cycles[0]?.fullName || ''}** (${chart.luckCycles.cycles[0]?.tenGod || ''}).

#### 5. Khuyến Cáo Học Thuật & Đạo Đức
Bản luận giải dựa trên mô hình nhị nguyên âm dương ngũ hành cổ truyền phương Đông, hướng tới mục tiêu hiểu rõ ưu - khuyết điểm tiên thiên để bồi đắp tri thức, kiên trì trau dồi đạo đức và chủ động làm chủ vận mệnh bản thân; không đại diện cho dự đoán tương lai tất định.`;

    res.json({
      success: true,
      interpretation: fallbackInterpretation,
      matchedRules,
      source: 'Cơ sở tri thức Bát Tự cổ điển (Uyên Hải Tử Bình & Địch Thiên Tủy - Offline Verified)'
    });
  } catch (error: any) {
    console.error('Error in Bazi interpretation:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý luận giải Bát Tự.' });
  }
});

// 11. API Đàm thoại AI Bát Tự (Grounded Chatbot)
app.post('/api/bazi/chat', async (req: Request, res: Response) => {
  try {
    const { chart, message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    const cleanMessage = message.trim().slice(0, 1000);

    // Tra cứu quy tắc liên quan
    const matchedRules = findMatchingBaziRules(cleanMessage, chart);

    if (getGenAIClient()) {
      const dm = chart?.dayMaster;
      const chatContext = `
Bạn là Chuyên gia Khảo chứng Bát Tự - Tứ Trụ, am hiểu sâu sắc 《Uyên Hải Tử Bình》, 《Tam Mệnh Thông Hội》, 《Địch Thiên Tủy》 và 《Cùng Thông Bảo Giám》.
THÔNG TIN LÁ SỐ BÁT TỰ ĐANG MỞ:
- Họ tên: ${chart?.profile?.name || 'Đương số'} (${chart?.profile?.gender || 'Nam'}) - Sinh ngày: ${chart?.profile?.solarDate} ${chart?.profile?.solarTime}
- Tứ Trụ: Năm ${chart?.pillars?.year?.fullName} | Tháng ${chart?.pillars?.month?.fullName} | Ngày ${chart?.pillars?.day?.fullName} | Giờ ${chart?.pillars?.hour?.fullName}
- Nhật Chủ: ${dm?.can} (${dm?.element} ${dm?.polarity}) - Trạng thái: ${chart?.dayMasterStrength?.level}
- Dụng Thần: ${chart?.dungThanInfo?.dungThan} (Phương pháp ${chart?.dungThanInfo?.method}) - Hỷ Thần: ${chart?.dungThanInfo?.hyThan?.join(', ')} - Kỵ Thần: ${chart?.dungThanInfo?.kyThan?.join(', ')}
- Đại Vận: Hướng ${chart?.luckCycles?.direction}, Khởi vận ${chart?.luckCycles?.inceptionAge} tuổi

QUY TẮC CỔ ĐIỂN TƯƠNG ỨNG:
${matchedRules.map(r => `* [${r.rule_id}][Nhóm ${r.category}] ${r.title}: ${r.rule_text} (Nguồn: ${r.source_book})`).join('\n')}

QUY TẮC PHẢN HỒI:
1. Tuyệt đối không thay đổi Can Chi hay Thập Thần trong lá số của người dùng.
2. Dẫn giải rõ ràng căn cứ cổ thư nếu có quy tắc.
3. Luôn giữ thái độ nhã nhặn, tôn trọng khách quan và khuyến khích tự lực, không mê tín dị đoan.
`;

      const aiResult = await generateGroundedInterpretation({
        contents: `${chatContext}\n\nNgười dùng hỏi: ${cleanMessage}`,
        systemInstruction: 'Bạn là Chuyên gia Khảo chứng Bát Tự – Tứ Trụ, dựa trên 4 pho đại thư tịch cổ điển.',
        primaryTimeoutMs: 7000,
        fallbackTimeoutMs: 15000
      });

      if (aiResult && aiResult.text) {
        return res.json({
          success: true,
          reply: aiResult.text,
          matchedRules,
          source: aiResult.modelUsed
        });
      }
    }

    res.json({
      success: true,
      reply: `Dựa trên cơ sở tri thức Bát Tự cổ điển (*Uyên Hải Tử Bình* & *Địch Thiên Tủy*): Đối với câu hỏi "${cleanMessage}" trên lá số của đương số ${chart?.profile?.name || ''} (Nhật Chủ ${chart?.dayMaster?.can || ''} ${chart?.dayMaster?.element || ''}), hệ thống đã tra cứu các tương tác ngũ hành và thập thần liên quan. Dụng thần của đương số là hành ${chart?.dungThanInfo?.dungThan || 'Cần xác định'}, giúp quân bình khí thế mệnh cục.`,
      matchedRules
    });
  } catch (error: any) {
    console.error('Error in Bazi chat:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý câu hỏi Bát Tự.' });
  }
});

// 12. API Tra cứu quy tắc Bát Tự
app.get('/api/bazi/rules', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let list = BAZI_RULES;

    if (typeof category === 'string' && category.trim()) {
      list = list.filter(r => r.category === category.trim());
    }

    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.rule_text.toLowerCase().includes(q) ||
        r.modern_interpretation.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      total: list.length,
      rules: list
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi tra cứu quy tắc Bát Tự.' });
  }
});

// 13. API Chạy Bộ Kiểm thử Toàn diện (QA Engine cho cả Tử Vi, Bát Tự và Lịch Âm)
app.get('/api/test-suite', (_req: Request, res: Response) => {
  try {
    const tuviResult = runFullTestSuite();
    const baziResult = runBaziTestSuite();
    const qaSuite = runComprehensiveQASuite();

    res.json({
      success: true,
      summary: {
        allPassed: tuviResult.failedCount === 0 && baziResult.allPassed && qaSuite.summary.allPassed,
        totalTests: tuviResult.total + baziResult.totalTests + qaSuite.summary.totalTests,
        passedTests: tuviResult.passedCount + baziResult.passedTests + qaSuite.summary.passedTests,
        failedTests: tuviResult.failedCount + baziResult.failedTests + qaSuite.summary.failedTests,
        executedAt: new Date().toISOString()
      },
      qaSuite,
      tuvi: tuviResult,
      bazi: baziResult
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi thực thi bộ kiểm thử QA.' });
  }
});

// 14. API Lịch Âm - Dương: Lấy thông tin tháng
app.get('/api/lunar/month', (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month) || (new Date().getMonth() + 1);
    const year = Number(req.query.year) || new Date().getFullYear();
    const calendar = generateMonthCalendar(month, year);
    const leapInfo = getLeapMonthInLunarYear(year);
    res.json({
      success: true,
      month,
      year,
      calendar,
      leapInfo
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi tạo lịch âm dương.' });
  }
});

// 15. API Lịch Âm - Dương: Chi tiết ngày
app.get('/api/lunar/day', (req: Request, res: Response) => {
  try {
    const day = Number(req.query.day) || new Date().getDate();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);
    const year = Number(req.query.year) || new Date().getFullYear();
    const detail = getDayDetail(day, month, year);
    res.json({ success: true, detail });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi tra cứu ngày.' });
  }
});

// 16. API Lịch Âm - Dương: Chuyển đổi an toàn hai chiều
app.post('/api/lunar/convert', (req: Request, res: Response) => {
  try {
    const { direction, day, month, year, isLeap } = req.body;
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if (direction === 'lunar2solar') {
      const result = safeConvertLunarToSolar(d, m, y, Boolean(isLeap), 7);
      if (!result.success || !result.solarDate) {
        return res.status(400).json({ success: false, error: result.errorMessage || 'Ngày không hợp lệ.' });
      }
      const dayDetail = getDayDetail(result.solarDate.day, result.solarDate.month, result.solarDate.year);
      return res.json({ success: true, result, dayDetail });
    } else {
      const lunar = convertSolarToLunar(d, m, y, 7);
      const dayDetail = getDayDetail(d, m, y);
      return res.json({ success: true, lunar, dayDetail });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi chuyển đổi lịch.' });
  }
});

// 17. Chặn 404 cho toàn bộ endpoint /api/* (Tuyệt đối không trả về HTML index.html cho các route API)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: `Cổng API ${req.method} ${req.path} không tồn tại trên máy chủ.`,
    path: req.path,
    method: req.method
  });
});

// 18. Middleware xử lý lỗi nội bộ cho toàn bộ phân hệ /api/*
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({
    error: err.message || 'Lỗi xử lý nội bộ máy chủ API.'
  });
});

// Setup Vite dev server hoặc Serve static files trong Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
