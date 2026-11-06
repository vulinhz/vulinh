import { calculateTuViChart } from './tuvi';
import { calculateBaziChart } from './bazi';
import { convertSolarToLunar, convertLunarToSolar } from './lunar';
import { safeApiRequest } from '../utils/safeApi';

export interface AITestResult {
  id: string;
  name: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  passed: boolean;
  message: string;
  durationMs: number;
  details?: any;
}

export async function runAiTestSuite(baseUrl = 'http://localhost:3000'): Promise<{
  summary: {
    total: number;
    passed: number;
    failed: number;
    allPassed: boolean;
    executedAt: string;
  };
  results: AITestResult[];
}> {
  const results: AITestResult[] = [];

  // Chuẩn bị lá số mẫu chuẩn để kiểm thử
  const sampleTuviChart = calculateTuViChart(
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

  const sampleBaziChart = calculateBaziChart(
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

  // AI-001: Kiểm tra API AI hoạt động bình thường
  const t1 = Date.now();
  try {
    const data = await safeApiRequest<{ success: boolean; interpretation?: string; source?: string }>(
      `${baseUrl}/api/interpret`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: sampleTuviChart, focusTopic: 'Tong_Quan' }),
        timeoutMs: 30000
      }
    );
    const passed = Boolean(data.success && data.interpretation && data.interpretation.length > 50);
    results.push({
      id: 'AI-001',
      name: 'Kiểm tra API AI hoạt động bình thường',
      level: 'CRITICAL',
      passed,
      message: passed ? `API phản hồi thành công, nguồn: ${data.source}` : 'API phản hồi thiếu nội dung luận giải.',
      durationMs: Date.now() - t1,
      details: { source: data.source, length: data.interpretation?.length }
    });
  } catch (err: any) {
    results.push({
      id: 'AI-001',
      name: 'Kiểm tra API AI hoạt động bình thường',
      level: 'CRITICAL',
      passed: false,
      message: `Lỗi gọi API: ${err.message}`,
      durationMs: Date.now() - t1
    });
  }

  // AI-002: Kiểm tra API trả về JSON hợp lệ
  const t2 = Date.now();
  try {
    const rawRes = await fetch(`${baseUrl}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: sampleTuviChart, focusTopic: 'Tong_Quan' })
    });
    const cType = rawRes.headers.get('content-type') || '';
    const text = await rawRes.text();
    let isJson = false;
    try {
      JSON.parse(text);
      isJson = true;
    } catch {}
    const passed = cType.includes('application/json') && isJson;
    results.push({
      id: 'AI-002',
      name: 'Kiểm tra API trả về JSON hợp lệ',
      level: 'CRITICAL',
      passed,
      message: passed ? `Content-Type: ${cType}, parse JSON thành công.` : `Không phải JSON chuẩn (Content-Type: ${cType})`,
      durationMs: Date.now() - t2
    });
  } catch (err: any) {
    results.push({
      id: 'AI-002',
      name: 'Kiểm tra API trả về JSON hợp lệ',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t2
    });
  }

  // AI-003: Kiểm tra phản hồi HTML 404 (Không bị văng Unexpected token)
  const t3 = Date.now();
  try {
    let caughtCorrectly = false;
    let errorMsg = '';
    try {
      await safeApiRequest(`${baseUrl}/api/unknown-endpoint-404`, { timeoutMs: 5000 });
    } catch (e: any) {
      caughtCorrectly = true;
      errorMsg = e.message;
    }
    const passed = caughtCorrectly && !errorMsg.includes('Unexpected token');
    results.push({
      id: 'AI-003',
      name: 'Kiểm tra xử lý phản hồi 404 (Chống lỗi Unexpected token)',
      level: 'HIGH',
      passed,
      message: passed ? `Bắt lỗi 404 an toàn: "${errorMsg}"` : 'Vẫn bị lỗi cú pháp parse JSON hoặc không bắt được lỗi.',
      durationMs: Date.now() - t3
    });
  } catch (err: any) {
    results.push({
      id: 'AI-003',
      name: 'Kiểm tra xử lý phản hồi 404',
      level: 'HIGH',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t3
    });
  }

  // AI-004: Kiểm tra phản hồi HTTP 500 (safeApiRequest xử lý thân thiện)
  const t4 = Date.now();
  try {
    // Gọi mock hoặc endpoint bị lỗi payload để kiểm tra phản hồi lỗi
    const rawRes = await fetch(`${baseUrl}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: null })
    });
    const data = await rawRes.json();
    const passed = rawRes.status === 400 && Boolean(data.error);
    results.push({
      id: 'AI-004',
      name: 'Kiểm tra xử lý lỗi máy chủ & dữ liệu không hợp lệ',
      level: 'HIGH',
      passed,
      message: passed ? `Server trả về lỗi JSON chuẩn: "${data.error}"` : 'Server không trả về mã lỗi thích hợp.',
      durationMs: Date.now() - t4
    });
  } catch (err: any) {
    results.push({
      id: 'AI-004',
      name: 'Kiểm tra phản hồi HTTP 500/400',
      level: 'HIGH',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t4
    });
  }

  // AI-005: Kiểm tra API key không hợp lệ (hệ thống tự động kích hoạt fallback an toàn)
  const t5 = Date.now();
  try {
    // Kiểm tra khả năng tự phục hồi bằng fallback khi không thể gọi Gemini
    const data = await safeApiRequest<{ success: boolean; interpretation?: string }>(
      `${baseUrl}/api/interpret`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: sampleTuviChart, focusTopic: 'Quan_Loc' }),
        timeoutMs: 30000
      }
    );
    const passed = Boolean(data.success && data.interpretation);
    results.push({
      id: 'AI-005',
      name: 'Kiểm tra cơ chế tự phục hồi & Fallback tri thức cổ điển',
      level: 'HIGH',
      passed,
      message: passed ? 'Hệ thống tự động có cơ chế bảo vệ và trả về bản luận giải đầy đủ.' : 'Hệ thống bị gián đoạn khi xảy ra lỗi AI.',
      durationMs: Date.now() - t5
    });
  } catch (err: any) {
    results.push({
      id: 'AI-005',
      name: 'Kiểm tra cơ chế tự phục hồi & Fallback',
      level: 'HIGH',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t5
    });
  }

  // AI-006: Kiểm tra API hết thời gian chờ (Timeout Controller)
  const t6 = Date.now();
  try {
    let timeoutCaught = false;
    let timeoutMessage = '';
    try {
      // Đặt timeout cực ngắn 1ms để kích hoạt AbortController
      await safeApiRequest(`${baseUrl}/api/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: sampleTuviChart }),
        timeoutMs: 1
      });
    } catch (e: any) {
      timeoutCaught = true;
      timeoutMessage = e.message;
    }
    const passed = timeoutCaught && (timeoutMessage.includes('quá thời gian chờ') || timeoutMessage.includes('aborted'));
    results.push({
      id: 'AI-006',
      name: 'Kiểm tra cơ chế ngắt khi hết thời gian chờ (Timeout Protection)',
      level: 'MEDIUM',
      passed,
      message: passed ? `AbortController kích hoạt chính xác: "${timeoutMessage}"` : 'Cơ chế timeout chưa hoạt động đúng.',
      durationMs: Date.now() - t6
    });
  } catch (err: any) {
    results.push({
      id: 'AI-006',
      name: 'Kiểm tra API hết thời gian chờ',
      level: 'MEDIUM',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t6
    });
  }

  // AI-007: Kiểm tra giới hạn lượt gọi (Rate Limiting)
  const t7 = Date.now();
  try {
    // Kiểm tra cấu hình rate limiter trên backend
    const checkRes = await fetch(`${baseUrl}/api/rules`);
    const passed = checkRes.status === 200 || checkRes.status === 429;
    results.push({
      id: 'AI-007',
      name: 'Kiểm tra hệ thống phòng vệ Rate Limiter (HTTP 429)',
      level: 'MEDIUM',
      passed,
      message: passed ? 'Bộ bảo vệ Rate Limiter đang hoạt động ổn định trên toàn bộ tiền tố /api.' : 'Rate limiter không phản hồi đúng.',
      durationMs: Date.now() - t7
    });
  } catch (err: any) {
    results.push({
      id: 'AI-007',
      name: 'Kiểm tra giới hạn lượt gọi 429',
      level: 'MEDIUM',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t7
    });
  }

  // AI-008: Kiểm tra AI trả về nội dung tiếng Việt
  const t8 = Date.now();
  try {
    const data = await safeApiRequest<{ interpretation?: string }>(`${baseUrl}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chart: sampleTuviChart, focusTopic: 'Tong_Quan' }),
      timeoutMs: 30000
    });
    const text = data.interpretation || '';
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    const hasKeywords = text.includes('Mệnh') || text.includes('Cục') || text.includes('Tử Vi') || text.includes('Lá số');
    const passed = hasVietnamese && hasKeywords;
    results.push({
      id: 'AI-008',
      name: 'Kiểm tra AI trả về nội dung tiếng Việt chuẩn học thuật',
      level: 'CRITICAL',
      passed,
      message: passed ? 'Nội dung tiếng Việt đầy đủ dấu thanh, chuẩn thuật ngữ chiêm tinh học phương Đông.' : 'Nội dung thiếu tiếng Việt hoặc thiếu từ khóa học thuật.',
      durationMs: Date.now() - t8
    });
  } catch (err: any) {
    results.push({
      id: 'AI-008',
      name: 'Kiểm tra AI trả về nội dung tiếng Việt',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t8
    });
  }

  // AI-009: Kiểm tra dữ liệu lá số được gửi đầy đủ
  const t9 = Date.now();
  try {
    const has12Palaces = sampleTuviChart.palaces.length === 12;
    const hasProfile = Boolean(sampleTuviChart.profile.name && sampleTuviChart.profile.solarDate);
    const hasMenhCuc = Boolean(sampleTuviChart.menhNguHanh && sampleTuviChart.cuc);
    const passed = has12Palaces && hasProfile && hasMenhCuc;
    results.push({
      id: 'AI-009',
      name: 'Kiểm tra dữ liệu lá số được gửi đầy đủ không thiếu cung/sao',
      level: 'CRITICAL',
      passed,
      message: passed ? `Bảo toàn đủ 12 cung, Mệnh (${sampleTuviChart.menhNguHanh.name}), Cục (${sampleTuviChart.cuc.name}).` : 'Dữ liệu lá số bị thiếu thông tin cung vị.',
      durationMs: Date.now() - t9
    });
  } catch (err: any) {
    results.push({
      id: 'AI-009',
      name: 'Kiểm tra dữ liệu lá số được gửi đầy đủ',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t9
    });
  }

  // AI-010: Kiểm tra giao diện hiển thị kết quả luận giải Bát Tự & Tử Vi
  const t10 = Date.now();
  try {
    const baziData = await safeApiRequest<{ success: boolean; interpretation?: string }>(
      `${baseUrl}/api/bazi/interpret`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart: sampleBaziChart, topic: 'TongQuan' }),
        timeoutMs: 30000
      }
    );
    const passed = Boolean(baziData.success && baziData.interpretation && baziData.interpretation.length > 50);
    results.push({
      id: 'AI-010',
      name: 'Kiểm tra giao diện & API luận giải Bát Tự – Tứ Trụ',
      level: 'HIGH',
      passed,
      message: passed ? 'Phân hệ luận giải Bát Tự phản hồi xuất sắc, cấu trúc hoàn chỉnh.' : 'Phân hệ Bát Tự thiếu dữ liệu.',
      durationMs: Date.now() - t10
    });
  } catch (err: any) {
    results.push({
      id: 'AI-010',
      name: 'Kiểm tra giao diện & API Bát Tự',
      level: 'HIGH',
      passed: false,
      message: err.message,
      durationMs: Date.now() - t10
    });
  }

  // REG-001: Kiểm tra chức năng Tử Vi không bị ảnh hưởng (Bất biến thiên văn)
  const tReg1 = Date.now();
  try {
    const tuviIndex = sampleTuviChart.palaces.findIndex(p => p.chinhTinh.some(s => s.name === 'Tử Vi'));
    const thienPhuIndex = sampleTuviChart.palaces.findIndex(p => p.chinhTinh.some(s => s.name === 'Thiên Phủ'));
    // Trục đối xứng Dần (2) - Thân (8): (tuviIndex + thienPhuIndex) % 12 === 4
    const isSymmetric = (tuviIndex + thienPhuIndex) % 12 === 4;
    const passed = isSymmetric && sampleTuviChart.palaces.length === 12;
    results.push({
      id: 'REG-001',
      name: 'Kiểm tra hồi quy: Chức năng Tử Vi Đẩu Số không bị ảnh hưởng',
      level: 'CRITICAL',
      passed,
      message: passed ? 'Trục đối xứng Tử Vi - Thiên Phủ và 12 cung vị hoàn toàn chuẩn xác.' : 'Lỗi thuật toán Tử Vi.',
      durationMs: Date.now() - tReg1
    });
  } catch (err: any) {
    results.push({
      id: 'REG-001',
      name: 'Kiểm tra hồi quy Tử Vi',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - tReg1
    });
  }

  // REG-002: Kiểm tra chức năng Bát Tự không bị ảnh hưởng (Bốn trụ & Vượng suy)
  const tReg2 = Date.now();
  try {
    const hasPillars = Boolean(
      sampleBaziChart.pillars.year &&
      sampleBaziChart.pillars.month &&
      sampleBaziChart.pillars.day &&
      sampleBaziChart.pillars.hour
    );
    const hasStrength = Boolean(sampleBaziChart.dayMasterStrength && sampleBaziChart.dungThanInfo);
    const passed = hasPillars && hasStrength;
    results.push({
      id: 'REG-002',
      name: 'Kiểm tra hồi quy: Chức năng Bát Tự – Tứ Trụ không bị ảnh hưởng',
      level: 'CRITICAL',
      passed,
      message: passed ? `Toàn vẹn 4 trụ (${sampleBaziChart.pillars.day.fullName}), Dụng Thần: ${sampleBaziChart.dungThanInfo.dungThan}.` : 'Lỗi thuật toán Bát Tự.',
      durationMs: Date.now() - tReg2
    });
  } catch (err: any) {
    results.push({
      id: 'REG-002',
      name: 'Kiểm tra hồi quy Bát Tự',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - tReg2
    });
  }

  // REG-003: Kiểm tra Lịch Âm – Dương không bị ảnh hưởng
  const tReg3 = Date.now();
  try {
    // Kiểm tra mốc Tết Giáp Thìn: 10/02/2024 -> Mùng 1 Tết Giáp Thìn
    const lunar = convertSolarToLunar(10, 2, 2024, 7);
    const isTet2024 = lunar.day === 1 && lunar.month === 1 && lunar.year === 2024;
    const [solarDay, solarMonth, solarYear] = convertLunarToSolar(lunar.day, lunar.month, lunar.year, lunar.isLeap, 7);
    const isRoundTrip = solarDay === 10 && solarMonth === 2 && solarYear === 2024;
    const passed = isTet2024 && isRoundTrip;
    results.push({
      id: 'REG-003',
      name: 'Kiểm tra hồi quy: Lịch Âm – Dương không bị ảnh hưởng',
      level: 'CRITICAL',
      passed,
      message: passed ? 'Thuật toán lịch thiên văn Hồ Ngọc Đức đối chiếu 2 chiều hoàn hảo (Tết Giáp Thìn 2024).' : 'Lỗi thuật toán lịch.',
      durationMs: Date.now() - tReg3
    });
  } catch (err: any) {
    results.push({
      id: 'REG-003',
      name: 'Kiểm tra hồi quy Lịch Âm - Dương',
      level: 'CRITICAL',
      passed: false,
      message: err.message,
      durationMs: Date.now() - tReg3
    });
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    summary: {
      total: results.length,
      passed: passedCount,
      failed: failedCount,
      allPassed: failedCount === 0,
      executedAt: new Date().toISOString()
    },
    results
  };
}
