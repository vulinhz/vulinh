/**
 * BỘ MÁY TÍNH TOÁN BÁT TỰ - TỨ TRỤ (BAZI ENGINE)
 * Thuật toán thiên văn tiền định, không sử dụng suy luận giả lập.
 * Tuân thủ thư tịch kinh điển: Uyên Hải Tử Bình, Tam Mệnh Thông Hội, Địch Thiên Tủy, Cùng Thông Bảo Giám.
 */

import { CAN, CHI, CAN_NGU_HANH, CHI_NGU_HANH, NAP_AM, jdFromDate } from './lunar';
import {
  getBaziMonthSolarTerm,
  calculateLuckCycleInception,
  getLapXuanInstant,
  jdFromCivilDateTime
} from './baziSolar';

export type Element = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
export type Polarity = 'Dương' | 'Âm';

export interface HiddenStemItem {
  can: string;
  element: Element;
  tenGod: string;
  percentage: number; // Tỷ lệ lực (60%, 30%, 10%...)
  type: 'Bản khí' | 'Trung khí' | 'Dư khí';
}

export interface PillarData {
  pillarName: 'Trụ Năm' | 'Trụ Tháng' | 'Trụ Ngày' | 'Trụ Giờ';
  can: string;
  chi: string;
  fullName: string;
  canElement: Element;
  canPolarity: Polarity;
  chiElement: Element;
  chiPolarity: Polarity;
  napAm: string;
  napAmElement: Element;
  tenGod: string; // Thập Thần của Can trụ so với Nhật Chủ
  hiddenStems: HiddenStemItem[];
  trangSinh: string; // Thập Nhị Trường Sinh của Nhật Chủ tại Chi này
}

export interface ElementBreakdown {
  element: Element;
  points: number;       // Điểm trọng số
  percentage: number;   // Tỷ lệ phần trăm %
  exposedCount: number; // Số can lộ
  hiddenCount: number;  // Số tàng can
}

export interface LuckCycleItem {
  step: number;        // 1, 2, 3...
  ageStart: number;    // Ví dụ: 4
  ageEnd: number;      // Ví dụ: 13
  yearStart: number;   // Ví dụ: 1999
  yearEnd: number;     // Ví dụ: 2008
  can: string;
  chi: string;
  fullName: string;
  napAm: string;
  tenGod: string;
  trangSinh: string;
  interactionsWithChart: string[];
}

export interface BaziChart {
  profile: {
    name: string;
    gender: 'Nam' | 'Nữ';
    solarDate: string; // dd/mm/yyyy
    solarTime: string; // hh:mm
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    hour: number;
    minute: number;
    timeZone: number;
    birthPlace: string;
    timeAccuracy: string;
    dayBoundaryOption: 'RatBoundary' | 'MidnightBoundary'; // Giờ Tý đổi ngày hay Nửa đêm 0h
  };
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
  };
  dayMaster: {
    can: string;
    polarity: Polarity;
    element: Element;
    nature: string; // Mô tả tính chất theo Địch Thiên Tủy
    rootBranches: string[]; // Các Chi có gốc của Nhật Can
  };
  monthSolarTerm: {
    termName: string;
    termDate: string;
    prevTermName: string;
    nextTermName: string;
    isNearTermBoundary: boolean;
  };
  yearLapXuan: {
    lapXuanDate: string;
    isAdjustedByLapXuan: boolean;
    warningMessage?: string;
  };
  elementAnalysis: {
    breakdown: Record<Element, ElementBreakdown>;
    strongestElement: Element;
    weakestElement: Element;
    totalPoints: number;
    explanation: string;
  };
  dayMasterStrength: {
    level: 'Cực Nhược' | 'Thân Nhược' | 'Trung Hòa' | 'Thân Vượng' | 'Cực Vượng';
    score: number; // Thang 100
    dacLenh: boolean; // Được Nguyệt Lệnh sinh/trợ
    dacDia: boolean;  // Có gốc ở Địa Chi
    dacThe: boolean;   // Được Thiên Can đồng ngũ hành hoặc Ấn trợ
    factors: string[];
    summary: string;
  };
  dungThanInfo: {
    method: 'Phù Ức (Quân bình ngũ hành)' | 'Điều Hầu (Khí hậu thời tiết)' | 'Thông Quan (Hóa giải xung đột)';
    dungThan: Element;
    hyThan: Element[];
    kyThan: Element[];
    nhanThan: Element[];
    classicalCitation: string;
    sourceBook: string;
    rationale: string;
    confidence: 'Xác minh từ thư tịch' | 'Cần chuyên gia thẩm định';
  };
  interactions: {
    thienCanHop: string[];
    thienCanXung: string[];
    diaChiLucHop: string[];
    diaChiTamHop: string[];
    diaChiTamHoi: string[];
    diaChiLucXung: string[];
    diaChiTuongHinh: string[];
    diaChiTuongHai: string[];
    diaChiTuongPha: string[];
  };
  luckCycles: {
    direction: 'Thuận' | 'Nghịch';
    directionRule: string;
    inceptionAge: number;
    inceptionDateDescription: string;
    startYear: number;
    cycles: LuckCycleItem[];
  };
  algorithmVersion: string;
  calculatedAt: string;
  warnings: string[];
}

// 1. BẢNG TÀNG CAN TRUYỀN THỐNG (CHUẨN TỬ BÌNH)
// Tỷ lệ phân bố lực: Bản khí (60%), Trung khí (30%), Dư khí (10%) hoặc 100% cho Tý, Mão, Dậu
export const HIDDEN_STEMS_MAP: Record<string, Array<{ can: string; type: 'Bản khí' | 'Trung khí' | 'Dư khí'; percentage: number }>> = {
  'Tý':  [{ can: 'Quý', type: 'Bản khí', percentage: 100 }],
  'Sửu': [
    { can: 'Kỷ', type: 'Bản khí', percentage: 60 },
    { can: 'Quý', type: 'Trung khí', percentage: 30 },
    { can: 'Tân', type: 'Dư khí', percentage: 10 }
  ],
  'Dần': [
    { can: 'Giáp', type: 'Bản khí', percentage: 60 },
    { can: 'Bính', type: 'Trung khí', percentage: 30 },
    { can: 'Mậu', type: 'Dư khí', percentage: 10 }
  ],
  'Mão': [{ can: 'Ất', type: 'Bản khí', percentage: 100 }],
  'Thìn': [
    { can: 'Mậu', type: 'Bản khí', percentage: 60 },
    { can: 'Ất', type: 'Trung khí', percentage: 30 },
    { can: 'Quý', type: 'Dư khí', percentage: 10 }
  ],
  'Tị': [
    { can: 'Bính', type: 'Bản khí', percentage: 60 },
    { can: 'Mậu', type: 'Trung khí', percentage: 30 },
    { can: 'Canh', type: 'Dư khí', percentage: 10 }
  ],
  'Ngọ': [
    { can: 'Đinh', type: 'Bản khí', percentage: 70 },
    { can: 'Kỷ', type: 'Trung khí', percentage: 30 }
  ],
  'Mùi': [
    { can: 'Kỷ', type: 'Bản khí', percentage: 60 },
    { can: 'Đinh', type: 'Trung khí', percentage: 30 },
    { can: 'Ất', type: 'Dư khí', percentage: 10 }
  ],
  'Thân': [
    { can: 'Canh', type: 'Bản khí', percentage: 60 },
    { can: 'Nhâm', type: 'Trung khí', percentage: 30 },
    { can: 'Mậu', type: 'Dư khí', percentage: 10 }
  ],
  'Dậu': [{ can: 'Tân', type: 'Bản khí', percentage: 100 }],
  'Tuất': [
    { can: 'Mậu', type: 'Bản khí', percentage: 60 },
    { can: 'Tân', type: 'Trung khí', percentage: 30 },
    { can: 'Đinh', type: 'Dư khí', percentage: 10 }
  ],
  'Hợi': [
    { can: 'Nhâm', type: 'Bản khí', percentage: 70 },
    { can: 'Giáp', type: 'Trung khí', percentage: 30 }
  ]
};

// 2. ÂM DƯƠNG CỦA CAN CHI
export const CAN_POLARITY: Record<string, Polarity> = {
  'Giáp': 'Dương', 'Ất': 'Âm',
  'Bính': 'Dương', 'Đinh': 'Âm',
  'Mậu': 'Dương', 'Kỷ': 'Âm',
  'Canh': 'Dương', 'Tân': 'Âm',
  'Nhâm': 'Dương', 'Quý': 'Âm'
};

export const CHI_POLARITY: Record<string, Polarity> = {
  'Tý': 'Dương', 'Sửu': 'Âm', 'Dần': 'Dương', 'Mão': 'Âm',
  'Thìn': 'Dương', 'Tị': 'Âm', 'Ngọ': 'Dương', 'Mùi': 'Âm',
  'Thân': 'Dương', 'Dậu': 'Âm', 'Tuất': 'Dương', 'Hợi': 'Âm'
};

// 3. THẬP THẦN (QUAN HỆ NHẬT CHỦ VỚI CÁC CAN)
export function getTenGod(dayMasterCan: string, targetCan: string): string {
  if (dayMasterCan === targetCan) return 'Tỷ Kiên (Tỷ)';

  const dmElement = CAN_NGU_HANH[dayMasterCan];
  const targetElement = CAN_NGU_HANH[targetCan];
  const dmPolarity = CAN_POLARITY[dayMasterCan];
  const targetPolarity = CAN_POLARITY[targetCan];
  const samePolarity = dmPolarity === targetPolarity;

  // Cùng hành
  if (dmElement === targetElement) {
    return samePolarity ? 'Tỷ Kiên (Tỷ)' : 'Kiếp Tài (Kiếp)';
  }

  // Nhật Chủ sinh mục tiêu: Thực Thần / Thương Quan
  if (
    (dmElement === 'Mộc' && targetElement === 'Hỏa') ||
    (dmElement === 'Hỏa' && targetElement === 'Thổ') ||
    (dmElement === 'Thổ' && targetElement === 'Kim') ||
    (dmElement === 'Kim' && targetElement === 'Thủy') ||
    (dmElement === 'Thủy' && targetElement === 'Mộc')
  ) {
    return samePolarity ? 'Thực Thần (Thực)' : 'Thương Quan (Thương)';
  }

  // Mục tiêu sinh Nhật Chủ: Chính Ấn / Thiên Ấn
  if (
    (targetElement === 'Mộc' && dmElement === 'Hỏa') ||
    (targetElement === 'Hỏa' && dmElement === 'Thổ') ||
    (targetElement === 'Thổ' && dmElement === 'Kim') ||
    (targetElement === 'Kim' && dmElement === 'Thủy') ||
    (targetElement === 'Thủy' && dmElement === 'Mộc')
  ) {
    return samePolarity ? 'Thiên Ấn (Kiêu)' : 'Chính Ấn (Ấn)';
  }

  // Nhật Chủ khắc mục tiêu: Chính Tài / Thiên Tài
  if (
    (dmElement === 'Mộc' && targetElement === 'Thổ') ||
    (dmElement === 'Hỏa' && targetElement === 'Kim') ||
    (dmElement === 'Thổ' && targetElement === 'Thủy') ||
    (dmElement === 'Kim' && targetElement === 'Mộc') ||
    (dmElement === 'Thủy' && targetElement === 'Hỏa')
  ) {
    return samePolarity ? 'Thiên Tài (Tài)' : 'Chính Tài (Tài)';
  }

  // Mục tiêu khắc Nhật Chủ: Chính Quan / Thất Sát
  if (
    (targetElement === 'Mộc' && dmElement === 'Thổ') ||
    (targetElement === 'Hỏa' && dmElement === 'Kim') ||
    (targetElement === 'Thổ' && dmElement === 'Thủy') ||
    (targetElement === 'Kim' && dmElement === 'Mộc') ||
    (targetElement === 'Thủy' && dmElement === 'Hỏa')
  ) {
    return samePolarity ? 'Thất Sát (Sát)' : 'Chính Quan (Quan)';
  }

  return 'Chưa rõ';
}

// 4. THẬP NHỊ TRƯỜNG SINH CỦA NHẬT CHỦ
const TRANG_SINH_STAGES = [
  'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy',
  'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
];

// Khởi Trường Sinh cho từng Can theo Địa Chi
// Dương can thuận, Âm can nghịch (chuẩn Tử Bình Cổ Pháp)
const TRANG_SINH_START: Record<string, { startBranch: string; direction: 1 | -1 }> = {
  'Giáp': { startBranch: 'Hợi', direction: 1 },  // Dương Mộc sinh Hợi, thuận
  'Bính': { startBranch: 'Dần', direction: 1 },  // Dương Hỏa sinh Dần, thuận
  'Mậu':  { startBranch: 'Dần', direction: 1 },  // Dương Thổ sinh Dần, thuận
  'Canh': { startBranch: 'Tị',  direction: 1 },  // Dương Kim sinh Tị, thuận
  'Nhâm': { startBranch: 'Thân', direction: 1 }, // Dương Thủy sinh Thân, thuận

  'Ất':   { startBranch: 'Ngọ', direction: -1 }, // Âm Mộc sinh Ngọ, nghịch
  'Đinh': { startBranch: 'Dậu', direction: -1 }, // Âm Hỏa sinh Dậu, nghịch
  'Kỷ':   { startBranch: 'Dậu', direction: -1 }, // Âm Thổ sinh Dậu, nghịch
  'Tân':  { startBranch: 'Tý',  direction: -1 }, // Âm Kim sinh Tý, nghịch
  'Quý':  { startBranch: 'Mão', direction: -1 }  // Âm Thủy sinh Mão, nghịch
};

export function getTrangSinhStage(dayMasterCan: string, targetChi: string): string {
  const cfg = TRANG_SINH_START[dayMasterCan];
  if (!cfg) return 'Bình hòa';

  const chiList = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const startChiIndex = chiList.indexOf(cfg.startBranch);
  const targetChiIndex = chiList.indexOf(targetChi);

  let offset = (targetChiIndex - startChiIndex) * cfg.direction;
  while (offset < 0) offset += 12;
  offset = offset % 12;

  return TRANG_SINH_STAGES[offset];
}

// 5. TÍNH TRỤ NĂM (CAN CHI) DỰA TRÊN MỐC LẬP XUÂN
export function calculateYearPillar(
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour: number,
  minute: number,
  timeZone = 7
): {
  can: string;
  chi: string;
  fullName: string;
  isAdjustedByLapXuan: boolean;
  lapXuanTimeStr: string;
} {
  const lapXuan = getLapXuanInstant(solarYear, timeZone);
  const birthJD = jdFromCivilDateTime(solarDay, solarMonth, solarYear, hour, minute, 0, timeZone);

  let effectiveYear = solarYear;
  let isAdjustedByLapXuan = false;

  // Nếu sinh trước Lập Xuân của năm đó, tính sang năm trước
  if (birthJD < lapXuan.jd) {
    effectiveYear = solarYear - 1;
    isAdjustedByLapXuan = true;
  }

  // Can Chi năm: (Năm - 4) % 10 và (Năm - 4) % 12
  const canIndex = (effectiveYear - 4) % 10 >= 0 ? (effectiveYear - 4) % 10 : (effectiveYear - 4) % 10 + 10;
  const chiIndex = (effectiveYear - 4) % 12 >= 0 ? (effectiveYear - 4) % 12 : (effectiveYear - 4) % 12 + 12;

  const can = CAN[canIndex];
  const chi = CHI[chiIndex];
  const lxDate = lapXuan.date;
  const lapXuanTimeStr = `${String(lxDate.day).padStart(2, '0')}/${String(lxDate.month).padStart(2, '0')}/${lxDate.year} ${String(lxDate.hour).padStart(2, '0')}:${String(lxDate.minute).padStart(2, '0')} (UTC+${timeZone})`;

  return {
    can,
    chi,
    fullName: `${can} ${chi}`,
    isAdjustedByLapXuan,
    lapXuanTimeStr
  };
}

// 6. TÍNH TRỤ THÁNG DỰA TRÊN TIẾT KHÍ VÀ KHẨU QUYẾT NGŨ HỔ ĐỘN
export function calculateMonthPillar(
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour: number,
  minute: number,
  yearCan: string,
  timeZone = 7
): {
  can: string;
  chi: string;
  fullName: string;
  termInfo: ReturnType<typeof getBaziMonthSolarTerm>;
} {
  const termInfo = getBaziMonthSolarTerm(solarDay, solarMonth, solarYear, hour, minute, timeZone);
  const monthBranch = termInfo.monthBranch;

  // Ngũ Hổ Độn tính Can tháng từ Can năm
  // Giáp Kỷ niên Bính tác sơ (Tháng 1 Dần là Bính Dần)
  // Ất Canh chi tuế Mậu vi đầu (Tháng 1 Dần là Mậu Dần)
  // Bính Tân chi tuế Canh Dần khởi
  // Đinh Nhâm Nhâm Dần thuận hành lưu
  // Mậu Quý Giáp Dần cầu tương hội
  let startCanIndex = 0;
  switch (yearCan) {
    case 'Giáp':
    case 'Kỷ':
      startCanIndex = 2; // Bính
      break;
    case 'Ất':
    case 'Canh':
      startCanIndex = 4; // Mậu
      break;
    case 'Bính':
    case 'Tân':
      startCanIndex = 6; // Canh
      break;
    case 'Đinh':
    case 'Nhâm':
      startCanIndex = 8; // Nhâm
      break;
    case 'Mậu':
    case 'Quý':
      startCanIndex = 0; // Giáp
      break;
  }

  // Thứ tự tháng tính từ Dần (Dần=0, Mão=1, Thìn=2, ..., Sửu=11)
  const monthOrder = ['Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];
  const offset = monthOrder.indexOf(monthBranch);
  const canIndex = (startCanIndex + offset) % 10;
  const can = CAN[canIndex];

  return {
    can,
    chi: monthBranch,
    fullName: `${can} ${monthBranch}`,
    termInfo
  };
}

// 7. TÍNH TRỤ NGÀY THEO CHU KỲ CAN CHI THIÊN VĂN
export function calculateDayPillar(
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour = 12,
  dayBoundaryOption: 'RatBoundary' | 'MidnightBoundary' = 'RatBoundary'
): {
  can: string;
  chi: string;
  fullName: string;
  isLateRatDayShift: boolean;
} {
  let effectiveDay = solarDay;
  let effectiveMonth = solarMonth;
  let effectiveYear = solarYear;
  let isLateRatDayShift = false;

  // Nếu người dùng chọn quy ước Giờ Tý đổi ngày (23:00 - 23:59 tính sang ngày hôm sau)
  if (dayBoundaryOption === 'RatBoundary' && hour >= 23) {
    const nextDate = new Date(solarYear, solarMonth - 1, solarDay + 1);
    effectiveDay = nextDate.getDate();
    effectiveMonth = nextDate.getMonth() + 1;
    effectiveYear = nextDate.getFullYear();
    isLateRatDayShift = true;
  }

  const jd = jdFromDate(effectiveDay, effectiveMonth, effectiveYear);
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;

  const can = CAN[canIndex];
  const chi = CHI[chiIndex];

  return {
    can,
    chi,
    fullName: `${can} ${chi}`,
    isLateRatDayShift
  };
}

// 8. TÍNH TRỤ GIỜ THEO KHẨU QUYẾT NGŨ THỬ ĐỘN
export function calculateHourPillar(
  hour: number,
  minute: number,
  dayCan: string
): {
  can: string;
  chi: string;
  fullName: string;
  chiIndex: number;
} {
  const totalMin = hour * 60 + minute;
  // Giờ Tý: 23:00 - 00:59
  const chiIndex = Math.floor((totalMin + 60) / 120) % 12;
  const chi = CHI[chiIndex];

  // Ngũ Thử Độn:
  // Giáp Kỷ hoàn gia Giáp (Giáp Tý)
  // Ất Canh Bính tác sơ (Bính Tý)
  // Bính Tân tầm Mậu khởi (Mậu Tý)
  // Đinh Nhâm Canh Tý cư (Canh Tý)
  // Mậu Quý khởi Nhâm Tý
  let startCanIndex = 0;
  switch (dayCan) {
    case 'Giáp':
    case 'Kỷ':
      startCanIndex = 0; // Giáp
      break;
    case 'Ất':
    case 'Canh':
      startCanIndex = 2; // Bính
      break;
    case 'Bính':
    case 'Tân':
      startCanIndex = 4; // Mậu
      break;
    case 'Đinh':
    case 'Nhâm':
      startCanIndex = 6; // Canh
      break;
    case 'Mậu':
    case 'Quý':
      startCanIndex = 8; // Nhâm
      break;
  }

  const canIndex = (startCanIndex + chiIndex) % 10;
  const can = CAN[canIndex];

  return {
    can,
    chi,
    fullName: `${can} ${chi}`,
    chiIndex
  };
}

// 9. QUAN HỆ CAN CHI CHI TIẾT
export function analyzeCanChiInteractions(pillars: {
  year: { can: string; chi: string };
  month: { can: string; chi: string };
  day: { can: string; chi: string };
  hour: { can: string; chi: string };
}) {
  const cans = [pillars.year.can, pillars.month.can, pillars.day.can, pillars.hour.can];
  const chis = [pillars.year.chi, pillars.month.chi, pillars.day.chi, pillars.hour.chi];
  const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

  const thienCanHop: string[] = [];
  const thienCanXung: string[] = [];
  const diaChiLucHop: string[] = [];
  const diaChiTamHop: string[] = [];
  const diaChiTamHoi: string[] = [];
  const diaChiLucXung: string[] = [];
  const diaChiTuongHinh: string[] = [];
  const diaChiTuongHai: string[] = [];
  const diaChiTuongPha: string[] = [];

  // Thiên can hợp & xung từng cặp
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const c1 = cans[i];
      const c2 = cans[j];
      const pair = [c1, c2].sort().join(' - ');

      // Can Hợp
      if (
        (c1 === 'Giáp' && c2 === 'Kỷ') || (c1 === 'Kỷ' && c2 === 'Giáp')
      ) thienCanHop.push(`Giáp - Kỷ hợp (Hóa Thổ) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      else if (
        (c1 === 'Ất' && c2 === 'Canh') || (c1 === 'Canh' && c2 === 'Ất')
      ) thienCanHop.push(`Ất - Canh hợp (Hóa Kim) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      else if (
        (c1 === 'Bính' && c2 === 'Tân') || (c1 === 'Tân' && c2 === 'Bính')
      ) thienCanHop.push(`Bính - Tân hợp (Hóa Thủy) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      else if (
        (c1 === 'Đinh' && c2 === 'Nhâm') || (c1 === 'Nhâm' && c2 === 'Đinh')
      ) thienCanHop.push(`Đinh - Nhâm hợp (Hóa Mộc) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      else if (
        (c1 === 'Mậu' && c2 === 'Quý') || (c1 === 'Quý' && c2 === 'Mậu')
      ) thienCanHop.push(`Mậu - Quý hợp (Hóa Hỏa) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);

      // Can Xung / Khắc mãnh liệt
      if (
        (c1 === 'Giáp' && c2 === 'Canh') || (c1 === 'Canh' && c2 === 'Giáp') ||
        (c1 === 'Ất' && c2 === 'Tân') || (c1 === 'Tân' && c2 === 'Ất') ||
        (c1 === 'Bính' && c2 === 'Nhâm') || (c1 === 'Nhâm' && c2 === 'Bính') ||
        (c1 === 'Đinh' && c2 === 'Quý') || (c1 === 'Quý' && c2 === 'Đinh')
      ) {
        thienCanXung.push(`${c1} - ${c2} trực xung giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }
    }
  }

  // Địa Chi Lục Hợp, Lục Xung, Tương Hại, Tương Phá
  const lucHopPairs: Record<string, string> = {
    'Tý-Sửu': 'Hóa Thổ', 'Dần-Hợi': 'Hóa Mộc', 'Mão-Tuất': 'Hóa Hỏa',
    'Thìn-Dậu': 'Hóa Kim', 'Tị-Thân': 'Hóa Thủy', 'Ngọ-Mùi': 'Hóa Thổ/Nhật Nguyệt'
  };

  const lucXungPairs: Record<string, boolean> = {
    'Tý-Ngọ': true, 'Sửu-Mùi': true, 'Dần-Thân': true,
    'Mão-Dậu': true, 'Thìn-Tuất': true, 'Tị-Hợi': true
  };

  const lucHaiPairs: Record<string, string> = {
    'Tý-Mùi': 'Lục Hại (Bất hòa)', 'Sửu-Ngọ': 'Lục Hại (Tổn thương khí)',
    'Dần-Tị': 'Lục Hại (Tranh đoạt)', 'Mão-Thìn': 'Lục Hại (Thân quyến tương khắc)',
    'Thân-Hợi': 'Lục Hại (Trở ngại)', 'Dậu-Tuất': 'Lục Hại (Đố kỵ)'
  };

  const tuongPhaPairs: Record<string, boolean> = {
    'Tý-Dậu': true, 'Mão-Ngọ': true, 'Thìn-Sửu': true,
    'Mùi-Tuất': true, 'Dần-Hợi': true, 'Tị-Thân': true
  };

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const b1 = chis[i];
      const b2 = chis[j];
      const key1 = `${b1}-${b2}`;
      const key2 = `${b2}-${b1}`;

      if (lucHopPairs[key1] || lucHopPairs[key2]) {
        const hoa = lucHopPairs[key1] || lucHopPairs[key2];
        diaChiLucHop.push(`${b1} - ${b2} Lục Hợp (${hoa}) giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }

      if (lucXungPairs[key1] || lucXungPairs[key2]) {
        diaChiLucXung.push(`${b1} - ${b2} Lục Xung đối nghịch giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }

      if (lucHaiPairs[key1] || lucHaiPairs[key2]) {
        const desc = lucHaiPairs[key1] || lucHaiPairs[key2];
        diaChiTuongHai.push(`${b1} - ${b2} ${desc} giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }

      if (tuongPhaPairs[key1] || tuongPhaPairs[key2]) {
        diaChiTuongPha.push(`${b1} - ${b2} Tương Phá giữa Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }

      // Tự hình
      if (b1 === b2 && ['Thìn', 'Ngọ', 'Dậu', 'Hợi'].includes(b1)) {
        diaChiTuongHinh.push(`${b1} kiến ${b2} Tự Hình tại Trụ ${pNames[i]} và Trụ ${pNames[j]}`);
      }
    }
  }

  // Tam Hợp cục
  const chiSet = new Set(chis);
  if (chiSet.has('Thân') && chiSet.has('Tý') && chiSet.has('Thìn')) {
    diaChiTamHop.push('Thân - Tý - Thìn Tam Hợp Thủy Cục');
  } else if (
    (chiSet.has('Thân') && chiSet.has('Tý')) ||
    (chiSet.has('Tý') && chiSet.has('Thìn'))
  ) {
    diaChiTamHop.push('Bán hợp Thủy cục (có Tý làm chính vị)');
  }

  if (chiSet.has('Dần') && chiSet.has('Ngọ') && chiSet.has('Tuất')) {
    diaChiTamHop.push('Dần - Ngọ - Tuất Tam Hợp Hỏa Cục');
  } else if (
    (chiSet.has('Dần') && chiSet.has('Ngọ')) ||
    (chiSet.has('Ngọ') && chiSet.has('Tuất'))
  ) {
    diaChiTamHop.push('Bán hợp Hỏa cục (có Ngọ làm chính vị)');
  }

  if (chiSet.has('Hợi') && chiSet.has('Mão') && chiSet.has('Mùi')) {
    diaChiTamHop.push('Hợi - Mão - Mùi Tam Hợp Mộc Cục');
  } else if (
    (chiSet.has('Hợi') && chiSet.has('Mão')) ||
    (chiSet.has('Mão') && chiSet.has('Mùi'))
  ) {
    diaChiTamHop.push('Bán hợp Mộc cục (có Mão làm chính vị)');
  }

  if (chiSet.has('Tị') && chiSet.has('Dậu') && chiSet.has('Sửu')) {
    diaChiTamHop.push('Tị - Dậu - Sửu Tam Hợp Kim Cục');
  } else if (
    (chiSet.has('Tị') && chiSet.has('Dậu')) ||
    (chiSet.has('Dậu') && chiSet.has('Sửu'))
  ) {
    diaChiTamHop.push('Bán hợp Kim cục (có Dậu làm chính vị)');
  }

  // Tam Hội cục
  if (chiSet.has('Dần') && chiSet.has('Mão') && chiSet.has('Thìn')) {
    diaChiTamHoi.push('Dần - Mão - Thìn Tam Hội Đông Phương Mộc');
  }
  if (chiSet.has('Tị') && chiSet.has('Ngọ') && chiSet.has('Mùi')) {
    diaChiTamHoi.push('Tị - Ngọ - Mùi Tam Hội Nam Phương Hỏa');
  }
  if (chiSet.has('Thân') && chiSet.has('Dậu') && chiSet.has('Tuất')) {
    diaChiTamHoi.push('Thân - Dậu - Tuất Tam Hội Tây Phương Kim');
  }
  if (chiSet.has('Hợi') && chiSet.has('Tý') && chiSet.has('Sửu')) {
    diaChiTamHoi.push('Hợi - Tý - Sửu Tam Hội Bắc Phương Thủy');
  }

  // Tam hình (Dần Tị Thân, Sửu Tuất Mùi, Tý Mão)
  if (chiSet.has('Dần') && chiSet.has('Tị') && chiSet.has('Thân')) {
    diaChiTuongHinh.push('Dần - Tị - Thân Tam Hình (Vô Ân chi hình)');
  }
  if (chiSet.has('Sửu') && chiSet.has('Tuất') && chiSet.has('Mùi')) {
    diaChiTuongHinh.push('Sửu - Tuất - Mùi Tam Hình (Trì Thế chi hình)');
  }
  if (chiSet.has('Tý') && chiSet.has('Mão')) {
    diaChiTuongHinh.push('Tý - Mão Tương Hình (Vô Lễ chi hình)');
  }

  return {
    thienCanHop,
    thienCanXung,
    diaChiLucHop,
    diaChiTamHop,
    diaChiTamHoi,
    diaChiLucXung,
    diaChiTuongHinh,
    diaChiTuongHai,
    diaChiTuongPha
  };
}

// 10. TÍNH ĐIỂM VÀ TỶ LỆ PHÂN BỔ NGŨ HÀNH (CÓ TRỌNG SỐ TÀNG CAN VÀ NGUYỆT LỆNH)
export function calculateElementDistribution(
  pillars: {
    year: { can: string; chi: string };
    month: { can: string; chi: string };
    day: { can: string; chi: string };
    hour: { can: string; chi: string };
  }
): {
  breakdown: Record<Element, ElementBreakdown>;
  strongestElement: Element;
  weakestElement: Element;
  totalPoints: number;
  explanation: string;
} {
  const points: Record<Element, number> = {
    'Kim': 0,
    'Mộc': 0,
    'Thủy': 0,
    'Hỏa': 0,
    'Thổ': 0
  };

  const exposedCount: Record<Element, number> = {
    'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0
  };

  const hiddenCount: Record<Element, number> = {
    'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0
  };

  const cans = [pillars.year.can, pillars.month.can, pillars.day.can, pillars.hour.can];
  const chis = [pillars.year.chi, pillars.month.chi, pillars.day.chi, pillars.hour.chi];
  const monthBranch = pillars.month.chi;

  // 1. Thiên Can Lộ: Mỗi Can được 10 điểm cơ sở (riêng Can tháng x1.2)
  cans.forEach((can, idx) => {
    const el = CAN_NGU_HANH[can] as Element;
    exposedCount[el]++;
    const weight = idx === 1 ? 12 : 10;
    points[el] += weight;
  });

  // 2. Địa Chi Tàng Can:
  // Nguyệt Lệnh (Chi tháng) có hệ số chỉ huy cao nhất (x1.5 trọng số)
  chis.forEach((chi, idx) => {
    const hiddenList = HIDDEN_STEMS_MAP[chi] || [];
    const chiMultiplier = idx === 1 ? 1.5 : 1.0;

    hiddenList.forEach(item => {
      const el = CAN_NGU_HANH[item.can] as Element;
      hiddenCount[el]++;
      // Bản khí 60% * 10 * mult = 6-9đ; Trung khí 30% = 3-4.5đ; Dư khí 10% = 1-1.5đ
      const stemPoints = (item.percentage / 100) * 10 * chiMultiplier;
      points[el] += stemPoints;
    });
  });

  const totalPoints = Object.values(points).reduce((sum, p) => sum + p, 0);

  const breakdown: Record<Element, ElementBreakdown> = {} as any;
  let strongest: Element = 'Kim';
  let weakest: Element = 'Kim';
  let maxP = -1;
  let minP = 999999;

  (['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as Element[]).forEach(el => {
    const pts = Math.round(points[el] * 10) / 10;
    const pct = totalPoints > 0 ? Math.round((pts / totalPoints) * 100) : 0;

    if (pts > maxP) {
      maxP = pts;
      strongest = el;
    }
    if (pts < minP) {
      minP = pts;
      weakest = el;
    }

    breakdown[el] = {
      element: el,
      points: pts,
      percentage: pct,
      exposedCount: exposedCount[el],
      hiddenCount: hiddenCount[el]
    };
  });

  const explanation = `Điểm số ngũ hành được tính từ 4 Thiên Can lộ (10-12đ/can) kết hợp với các Tàng Can trong 4 Địa Chi (Bản khí 60-100%, Trung khí 30%, Dư khí 10%), trong đó Địa Chi Trụ Tháng nắm quyền lệnh (Nguyệt Lệnh x1.5). Ngũ hành mạnh nhất là ${strongest} (${breakdown[strongest].percentage}%), ngũ hành yếu nhất là ${weakest} (${breakdown[weakest].percentage}%).`;

  return {
    breakdown,
    strongestElement: strongest,
    weakestElement: weakest,
    totalPoints: Math.round(totalPoints * 10) / 10,
    explanation
  };
}

// 11. ĐÁNH GIÁ THÂN VƯỢNG / THÂN NHƯỢC CỦA NHẬT CHỦ
export function assessDayMasterStrength(
  dayMasterCan: string,
  pillars: {
    year: { can: string; chi: string };
    month: { can: string; chi: string };
    day: { can: string; chi: string };
    hour: { can: string; chi: string };
  },
  elementBreakdown: Record<Element, ElementBreakdown>
): {
  level: 'Cực Nhược' | 'Thân Nhược' | 'Trung Hòa' | 'Thân Vượng' | 'Cực Vượng';
  score: number;
  dacLenh: boolean;
  dacDia: boolean;
  dacThe: boolean;
  factors: string[];
  summary: string;
} {
  const dmElement = CAN_NGU_HANH[dayMasterCan] as Element;
  const monthChi = pillars.month.chi;
  const factors: string[] = [];
  let score = 50;

  // 1. ĐẮC LỆNH: Nguyệt Chi sinh hoặc trợ cho Nhật Chủ
  const monthHidden = HIDDEN_STEMS_MAP[monthChi] || [];
  const monthMainStem = monthHidden[0]?.can || '';
  const monthMainElement = CAN_NGU_HANH[monthMainStem];

  let dacLenh = false;
  // Cùng hành (Đồng khí vượng)
  if (monthMainElement === dmElement) {
    dacLenh = true;
    score += 25;
    factors.push(`Đắc Lệnh: Sinh vào tháng ${monthChi} (${monthMainElement}), đồng hành với Nhật Chủ ${dayMasterCan} (${dmElement}), đắc vượng khí tuyệt đối.`);
  } else if (
    // Được tháng sinh (Ấn thụ vượng tướng)
    (monthMainElement === 'Thủy' && dmElement === 'Mộc') ||
    (monthMainElement === 'Mộc' && dmElement === 'Hỏa') ||
    (monthMainElement === 'Hỏa' && dmElement === 'Thổ') ||
    (monthMainElement === 'Thổ' && dmElement === 'Kim') ||
    (monthMainElement === 'Kim' && dmElement === 'Thủy')
  ) {
    dacLenh = true;
    score += 20;
    factors.push(`Đắc Lệnh (Tướng): Sinh vào tháng ${monthChi} (${monthMainElement}), tương sinh Nhật Chủ, khí thế dồi dào.`);
  } else {
    score -= 15;
    factors.push(`Thất Lệnh: Sinh vào tháng ${monthChi} (${monthMainElement}), tiết khí hoặc khắc Nhật Chủ, không nắm nguyệt lệnh.`);
  }

  // 2. ĐẮC ĐỊA: Có gốc rễ vững chắc ở Địa Chi (Lâm Quan, Đế Vượng, Lộc, Kình Dương)
  const rootChiList: string[] = [];
  [pillars.year.chi, pillars.month.chi, pillars.day.chi, pillars.hour.chi].forEach(chi => {
    const hidden = HIDDEN_STEMS_MAP[chi] || [];
    const hasRoot = hidden.some(h => CAN_NGU_HANH[h.can] === dmElement);
    if (hasRoot) rootChiList.push(chi);
  });

  const dacDia = rootChiList.length >= 2;
  if (dacDia) {
    score += 15;
    factors.push(`Đắc Địa: Nhật Chủ thông căn vững chắc tại ${rootChiList.join(', ')} (có gốc rễ ở Địa Chi).`);
  } else if (rootChiList.length === 1) {
    score += 5;
    factors.push(`Hữu Căn: Nhật Chủ có một gốc tại ${rootChiList[0]}, gốc rễ ở mức vừa phải.`);
  } else {
    score -= 15;
    factors.push(`Phù Phiếm Vô Căn: Nhật Chủ không có gốc ở Địa Chi, thể chất và định lực dễ bị lay chuyển.`);
  }

  // 3. ĐẮC THẾ: Có đồng ngũ hành (Tỷ Kiếp) hoặc Ấn Tinh trợ lực trên Thiên Can
  const otherCans = [pillars.year.can, pillars.month.can, pillars.hour.can];
  let helperCount = 0;
  otherCans.forEach(c => {
    const el = CAN_NGU_HANH[c];
    if (el === dmElement) helperCount++; // Tỷ Kiếp
    if (
      (el === 'Thủy' && dmElement === 'Mộc') ||
      (el === 'Mộc' && dmElement === 'Hỏa') ||
      (el === 'Hỏa' && dmElement === 'Thổ') ||
      (el === 'Thổ' && dmElement === 'Kim') ||
      (el === 'Kim' && dmElement === 'Thủy')
    ) helperCount++; // Ấn Tinh
  });

  const dacThe = helperCount >= 2;
  if (dacThe) {
    score += 15;
    factors.push(`Đắc Thế: Được ${helperCount} Thiên Can lộ trợ lực (Tỷ Kiếp hoặc Ấn Tinh phù trợ).`);
  } else if (helperCount === 1) {
    factors.push(`Có phù trợ nhẹ: 1 Thiên Can lộ sinh/trợ cho Nhật Chủ.`);
  } else {
    score -= 10;
    factors.push(`Cô lập thiên can: Không có Tỷ Kiếp hay Ấn lộ trên các trụ còn lại.`);
  }

  // Giới hạn thang điểm 0 - 100
  score = Math.max(5, Math.min(95, score));

  let level: 'Cực Nhược' | 'Thân Nhược' | 'Trung Hòa' | 'Thân Vượng' | 'Cực Vượng' = 'Trung Hòa';
  if (score >= 78) level = 'Cực Vượng';
  else if (score >= 60) level = 'Thân Vượng';
  else if (score >= 45) level = 'Trung Hòa';
  else if (score >= 25) level = 'Thân Nhược';
  else level = 'Cực Nhược';

  const summary = `Nhật Chủ ${dayMasterCan} (${dmElement}) thuộc trạng thái [${level}] (Điểm thực lực: ${score}/100). Đắc Lệnh: ${dacLenh ? 'Có' : 'Không'}, Đắc Địa: ${dacDia ? 'Có' : 'Không'}, Đắc Thế: ${dacThe ? 'Có' : 'Không'}.`;

  return {
    level,
    score,
    dacLenh,
    dacDia,
    dacThe,
    factors,
    summary
  };
}

// 12. XÁC ĐỊNH DỤNG THẦN, HỶ THẦN & KỴ THẦN THEO THƯ TỊCH CỔ ĐIỂN
export function determineDungThan(
  dayMasterCan: string,
  monthChi: string,
  strength: ReturnType<typeof assessDayMasterStrength>,
  elementBreakdown: Record<Element, ElementBreakdown>
): BaziChart['dungThanInfo'] {
  const dmElement = CAN_NGU_HANH[dayMasterCan] as Element;

  // Danh mục quan hệ ngũ hành
  const sinhCho: Record<Element, Element> = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const duocSinhTu: Record<Element, Element> = { 'Mộc': 'Thủy', 'Hỏa': 'Mộc', 'Thổ': 'Hỏa', 'Kim': 'Thổ', 'Thủy': 'Kim' };
  const khacCho: Record<Element, Element> = { 'Mộc': 'Thổ', 'Hỏa': 'Kim', 'Thổ': 'Thủy', 'Kim': 'Mộc', 'Thủy': 'Hỏa' };
  const biKhacBoi: Record<Element, Element> = { 'Mộc': 'Kim', 'Hỏa': 'Thủy', 'Thổ': 'Mộc', 'Kim': 'Hỏa', 'Thủy': 'Thổ' };

  // 1. Kiểm tra Điều Hầu Dụng Thần (Khí hậu thời tiết - Cùng Thông Bảo Giám)
  // Mùa Hè (Tị, Ngọ, Mùi): Khí trời khô nóng cực điểm => Cần Thủy nhuận cục làm Điều Hầu
  // Mùa Đông (Hợi, Tý, Sửu): Khí trời giá lạnh cực điểm => Cần Hỏa sưởi ấm cục làm Điều Hầu
  if (['Tị', 'Ngọ', 'Mùi'].includes(monthChi) && elementBreakdown['Hỏa'].percentage >= 25) {
    const dungThan = 'Thủy';
    const hyThan = ['Kim', 'Thủy'] as Element[];
    const kyThan = ['Hỏa', 'Thổ'] as Element[];
    const nhanThan = ['Mộc'] as Element[];

    return {
      method: 'Điều Hầu (Khí hậu thời tiết)',
      dungThan,
      hyThan,
      kyThan,
      nhanThan,
      sourceBook: 'Cùng Thông Bảo Giám (Lan Đài Diệu Tuyển)',
      classicalCitation: 'Hạ nguyệt sinh nhân, hỏa viêm thổ táo, vạn vật giai khô, tất tiên dụng Thủy dĩ nhuận chi, thứ dụng Kim dĩ sinh Thủy vi phụ.',
      rationale: `Sinh vào mùa Hè tháng ${monthChi}, Hỏa Thổ khí viêm nhiệt cực thịnh. Dù Thân Vượng hay Nhược, điều tối ưu tiên là lấy Thủy làm Điều Hầu Dụng Thần để nhuận trạch, Kim sinh Thủy làm Hỷ Thần. Kỵ thêm Hỏa Thổ làm tăng sự khô khát.`,
      confidence: 'Xác minh từ thư tịch'
    };
  }

  if (['Hợi', 'Tý', 'Sửu'].includes(monthChi) && elementBreakdown['Thủy'].percentage >= 25) {
    const dungThan = 'Hỏa';
    const hyThan = ['Mộc', 'Hỏa'] as Element[];
    const kyThan = ['Thủy', 'Kim'] as Element[];
    const nhanThan = ['Thổ'] as Element[];

    return {
      method: 'Điều Hầu (Khí hậu thời tiết)',
      dungThan,
      hyThan,
      kyThan,
      nhanThan,
      sourceBook: 'Cùng Thông Bảo Giám (Lan Đài Diệu Tuyển)',
      classicalCitation: 'Đông nguyệt sinh nhân, thiên hàn địa đống, vạn vật tàng phục, tất tiên dụng Bính Đinh Hỏa dĩ noãn chi, thứ dụng Mộc dĩ trợ Hỏa sinh phong.',
      rationale: `Sinh vào mùa Đông tháng ${monthChi}, hàn khí ngưng trệ, vạn vật đông giá. Bắt buộc phải có Hỏa chiếu rọi ấm áp làm Điều Hầu Dụng Thần, phối hợp với Mộc sinh Hỏa làm Hỷ Thần. Đại kỵ thêm Kim Thủy làm tăng băng hàn.`,
      confidence: 'Xác minh từ thư tịch'
    };
  }

  // 2. Phương pháp Phù Ức (Tử Bình Chân Thuyên & Tam Mệnh Thông Hội)
  if (strength.level === 'Thân Vượng' || strength.level === 'Cực Vượng') {
    // Thân vượng cần Khắc (Quan Sát), Tiết (Thực Thương) hoặc Hao (Tài Tinh)
    // Ưu tiên: Nếu Quan Sát có lực thì dùng Quan Sát; nếu không thì dùng Thực Thương tiết tú
    let dungThan: Element = khacCho[dmElement]; // Tài Tinh
    if (elementBreakdown[biKhacBoi[dmElement]].points > 10) {
      dungThan = biKhacBoi[dmElement]; // Quan Sát
    } else if (elementBreakdown[sinhCho[dmElement]].points > 10) {
      dungThan = sinhCho[dmElement]; // Thực Thương
    }

    const hyThan: Element[] = [sinhCho[dmElement], khacCho[dmElement], biKhacBoi[dmElement]].filter(e => e !== dungThan);
    const kyThan: Element[] = [dmElement, duocSinhTu[dmElement]];
    const nhanThan: Element[] = [];

    return {
      method: 'Phù Ức (Quân bình ngũ hành)',
      dungThan,
      hyThan,
      kyThan,
      nhanThan,
      sourceBook: 'Tử Bình Chân Thuyên (Thẩm Triều Nhân)',
      classicalCitation: 'Cường giả ức chi, suy giả phù chi. Thân cường tất yếu tiết khí dĩ lưu thông, hoặc Quan Sát khắc chế dĩ thành khí cụ.',
      rationale: `Nhật Chủ ${dayMasterCan} (${dmElement}) ở trạng thái ${strength.level}. Theo nguyên tắc Phù Ức, chân khí quá thịnh cần lấy ${dungThan} để ức chế bớt kiêu khí hoặc tiết khí lưu thông, lấy các hành làm hao tổn nguyên thần làm Hỷ Thần, tránh nạp thêm ${kyThan.join(', ')}.`,
      confidence: 'Xác minh từ thư tịch'
    };
  } else {
    // Thân Nhược hoặc Cực Nhược: Cần Ấn (Sinh ta) hoặc Tỷ Kiếp (Đồng ta) để trợ thân
    const dungThan: Element = duocSinhTu[dmElement]; // Ấn Tinh
    const hyThan: Element[] = [dmElement]; // Tỷ Kiếp
    const kyThan: Element[] = [biKhacBoi[dmElement], khacCho[dmElement]]; // Quan Sát, Tài Tinh
    const nhanThan: Element[] = [sinhCho[dmElement]];

    return {
      method: 'Phù Ức (Quân bình ngũ hành)',
      dungThan,
      hyThan,
      kyThan,
      nhanThan,
      sourceBook: 'Uyên Hải Tử Bình (Từ Tử Bình)',
      classicalCitation: 'Thân nhược thích Ấn thụ sinh thân, cánh hỷ Tỷ Kiếp trợ lực. Tuyệt kỵ Tài Quan quá vượng đoạt khí nguyên thần.',
      rationale: `Nhật Chủ ${dayMasterCan} (${dmElement}) rơi vào trạng thái ${strength.level}. Nguyên tắc Phù Ức xác định lấy Ấn Tinh ${dungThan} làm Dụng Thần tối thượng để nâng đỡ thể trạng, lấy Tỷ Kiếp ${dmElement} làm Hỷ Thần trợ lực. Cực kỳ e ngại ${kyThan.join(', ')} tới công phạt.`,
      confidence: 'Xác minh từ thư tịch'
    };
  }
}

// 13. TÍNH ĐẠI VẬN (LUCK CYCLES)
export function calculateLuckCycles(
  yearCan: string,
  monthPillar: { can: string; chi: string },
  gender: 'Nam' | 'Nữ',
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour: number,
  minute: number,
  dayMasterCan: string,
  timeZone = 7
): BaziChart['luckCycles'] {
  const yearPolarity = CAN_POLARITY[yearCan];
  const isYang = yearPolarity === 'Dương';
  const isMale = gender === 'Nam';

  // Quy ước chiều đại vận:
  // Dương Nam, Âm Nữ: Thuận
  // Âm Nam, Dương Nữ: Nghịch
  const isForward = (isYang && isMale) || (!isYang && !isMale);
  const direction: 'Thuận' | 'Nghịch' = isForward ? 'Thuận' : 'Nghịch';
  const directionRule = isForward
    ? `${yearPolarity} ${gender}: Khởi hành THUẬN (tính tới Tiết Khí tiếp theo)`
    : `${yearPolarity} ${gender}: Khởi hành NGHỊCH (tính lùi về Tiết Khí vừa qua)`;

  const termInfo = getBaziMonthSolarTerm(solarDay, solarMonth, solarYear, hour, minute, timeZone);
  const targetTermJD = isForward ? termInfo.nextMajorTermJD : termInfo.prevMajorTermJD;

  const inception = calculateLuckCycleInception(termInfo.birthJD, targetTermJD, solarYear);

  // Tạo 10 bước Đại Vận (mỗi bước 10 năm)
  const canList = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const chiList = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  let curCanIdx = canList.indexOf(monthPillar.can);
  let curChiIdx = chiList.indexOf(monthPillar.chi);
  const stepDir = isForward ? 1 : -1;

  const cycles: LuckCycleItem[] = [];
  let ageStart = inception.startAge;
  let yearStart = inception.calendarYearStart;

  for (let s = 1; s <= 10; s++) {
    curCanIdx = (curCanIdx + stepDir + 10) % 10;
    curChiIdx = (curChiIdx + stepDir + 12) % 12;

    const can = canList[curCanIdx];
    const chi = chiList[curChiIdx];
    const fullName = `${can} ${chi}`;
    const napAm = NAP_AM[fullName]?.name || 'Chưa rõ';
    const tenGod = getTenGod(dayMasterCan, can);
    const trangSinh = getTrangSinhStage(dayMasterCan, chi);

    const interactionsWithChart: string[] = [];
    if (chi === 'Tý' || chi === 'Ngọ') interactionsWithChart.push('Xung động trục Tý - Ngọ');
    if (chi === 'Dần' || chi === 'Thân') interactionsWithChart.push('Xung động trục Dần - Thân');

    cycles.push({
      step: s,
      ageStart,
      ageEnd: ageStart + 9,
      yearStart,
      yearEnd: yearStart + 9,
      can,
      chi,
      fullName,
      napAm,
      tenGod,
      trangSinh,
      interactionsWithChart
    });

    ageStart += 10;
    yearStart += 10;
  }

  return {
    direction,
    directionRule,
    inceptionAge: inception.startAge,
    inceptionDateDescription: inception.directionDescription,
    startYear: inception.calendarYearStart,
    cycles
  };
}

// 14. HÀM TỔNG HỢP: LẬP LÁ SỐ BÁT TỰ - TỨ TRỤ HOÀN CHỈNH
export function calculateBaziChart(
  name: string,
  gender: 'Nam' | 'Nữ',
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour: number,
  minute = 0,
  timeZone = 7,
  birthPlace = 'Việt Nam',
  timeAccuracy = 'Chính xác',
  dayBoundaryOption: 'RatBoundary' | 'MidnightBoundary' = 'RatBoundary'
): BaziChart {
  const warnings: string[] = [];

  // 1. Tính Trụ Năm theo Lập Xuân
  const yearResult = calculateYearPillar(solarDay, solarMonth, solarYear, hour, minute, timeZone);
  if (yearResult.isAdjustedByLapXuan) {
    warnings.push(`Đương số sinh trước thời điểm Lập Xuân (${yearResult.lapXuanTimeStr}) nên Trụ Năm thuộc về năm trước (${yearResult.fullName}).`);
  }

  // 2. Tính Trụ Tháng theo Tiết Khí và Ngũ Hổ Độn
  const monthResult = calculateMonthPillar(solarDay, solarMonth, solarYear, hour, minute, yearResult.can, timeZone);
  if (monthResult.termInfo.isNearTermBoundary) {
    warnings.push(`Thời điểm sinh gần sát ranh giới tiết khí ${monthResult.termInfo.currentTermName} (< 12 giờ). Cần chuyên gia xác minh giờ sinh.`);
  }

  // 3. Tính Trụ Ngày
  const dayResult = calculateDayPillar(solarDay, solarMonth, solarYear, hour, dayBoundaryOption);
  if (dayResult.isLateRatDayShift) {
    warnings.push('Đương số sinh vào Giờ Tý muộn (sau 23:00), theo quy ước Tử Bình được tính chuyển sang Trụ Ngày hôm sau.');
  }

  // 4. Tính Trụ Giờ theo Ngũ Thử Độn
  const hourResult = calculateHourPillar(hour, minute, dayResult.can);

  const dayMasterCan = dayResult.can;
  const dayMasterPolarity = CAN_POLARITY[dayMasterCan];
  const dayMasterElement = CAN_NGU_HANH[dayMasterCan] as Element;

  // Lắp ráp dữ liệu chi tiết cho từng Trụ
  const createPillarData = (
    pName: PillarData['pillarName'],
    can: string,
    chi: string
  ): PillarData => {
    const fullName = `${can} ${chi}`;
    const napAmData = NAP_AM[fullName] || { name: 'Chưa rõ', element: 'Thổ' as Element };
    const rawHidden = HIDDEN_STEMS_MAP[chi] || [];
    const hiddenStems: HiddenStemItem[] = rawHidden.map(h => ({
      can: h.can,
      element: CAN_NGU_HANH[h.can] as Element,
      tenGod: getTenGod(dayMasterCan, h.can),
      percentage: h.percentage,
      type: h.type
    }));

    return {
      pillarName: pName,
      can,
      chi,
      fullName,
      canElement: CAN_NGU_HANH[can] as Element,
      canPolarity: CAN_POLARITY[can],
      chiElement: CHI_NGU_HANH[chi] as Element,
      chiPolarity: CHI_POLARITY[chi],
      napAm: napAmData.name,
      napAmElement: napAmData.element as Element,
      tenGod: getTenGod(dayMasterCan, can),
      hiddenStems,
      trangSinh: getTrangSinhStage(dayMasterCan, chi)
    };
  };

  const yearPillar = createPillarData('Trụ Năm', yearResult.can, yearResult.chi);
  const monthPillar = createPillarData('Trụ Tháng', monthResult.can, monthResult.chi);
  const dayPillar = createPillarData('Trụ Ngày', dayResult.can, dayResult.chi);
  const hourPillar = createPillarData('Trụ Giờ', hourResult.can, hourResult.chi);

  // Phân tích Can Chi tương tác
  const interactions = analyzeCanChiInteractions({
    year: { can: yearPillar.can, chi: yearPillar.chi },
    month: { can: monthPillar.can, chi: monthPillar.chi },
    day: { can: dayPillar.can, chi: dayPillar.chi },
    hour: { can: hourPillar.can, chi: hourPillar.chi }
  });

  // Phân bổ ngũ hành
  const elementAnalysis = calculateElementDistribution({
    year: { can: yearPillar.can, chi: yearPillar.chi },
    month: { can: monthPillar.can, chi: monthPillar.chi },
    day: { can: dayPillar.can, chi: dayPillar.chi },
    hour: { can: hourPillar.can, chi: hourPillar.chi }
  });

  // Đánh giá sức mạnh Nhật Chủ
  const dayMasterStrength = assessDayMasterStrength(
    dayMasterCan,
    {
      year: { can: yearPillar.can, chi: yearPillar.chi },
      month: { can: monthPillar.can, chi: monthPillar.chi },
      day: { can: dayPillar.can, chi: dayPillar.chi },
      hour: { can: hourPillar.can, chi: hourPillar.chi }
    },
    elementAnalysis.breakdown
  );

  // Xác định Dụng Thần & Hỷ Kỵ
  const dungThanInfo = determineDungThan(
    dayMasterCan,
    monthPillar.chi,
    dayMasterStrength,
    elementAnalysis.breakdown
  );

  // Đại Vận
  const luckCycles = calculateLuckCycles(
    yearPillar.can,
    { can: monthPillar.can, chi: monthPillar.chi },
    gender,
    solarDay,
    solarMonth,
    solarYear,
    hour,
    minute,
    dayMasterCan,
    timeZone
  );

  // Gốc rễ Nhật Chủ
  const rootBranches: string[] = [];
  [yearPillar.chi, monthPillar.chi, dayPillar.chi, hourPillar.chi].forEach(chi => {
    const list = HIDDEN_STEMS_MAP[chi] || [];
    if (list.some(h => CAN_NGU_HANH[h.can] === dayMasterElement)) {
      if (!rootBranches.includes(chi)) rootBranches.push(chi);
    }
  });

  const natureDescriptions: Record<string, string> = {
    'Giáp': 'Giáp Mộc tham thiên, thoát thai yếu Hỏa. Đắc long tắc vinh, tùng mộc hữu căn.',
    'Ất': 'Ất Mộc căn hài, hoài đinh bão bính. Khóa phượng thừa hầu, hư thấu xuân đài.',
    'Bính': 'Bính Hỏa mãnh liệt, khi sương vũ tuyết. Năng đoán canh kim, phùng tân phản khiếp.',
    'Đinh': 'Đinh Hỏa nhu trung, nội tính chiêu dung. Bão ất nhi hiếu, hợp nhâm nhi trung.',
    'Mậu': 'Mậu Thổ cố trọng, ký trung thả chính. Tĩnh hấp động ích, vạn vật tư sinh.',
    'Kỷ': 'Kỷ Thổ ty thấp, trung chính súc tàng. Bất sầu mộc thịnh, bất úy thủy cuồng.',
    'Canh': 'Canh Kim đới sát, cương kiện vi tối. Đắc Hỏa nhi duệ, đắc Thủy nhi thanh.',
    'Tân': 'Tân Kim ôn nhuận, kết anh đãi ngọc. Nhiệt tắc hỷ mẫu, hàn tắc hỷ đinh.',
    'Nhâm': 'Nhâm Thủy thông hà, năng tiết kim khí. Cương trung chi đức, chu lưu bất trệ.',
    'Quý': 'Quý Thủy thuần âm, đới thiên tân dịch. Long thần biến hóa, công hóa tư sinh.'
  };

  return {
    profile: {
      name: name || 'Vô Danh',
      gender,
      solarDate: `${String(solarDay).padStart(2, '0')}/${String(solarMonth).padStart(2, '0')}/${solarYear}`,
      solarTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      solarDay,
      solarMonth,
      solarYear,
      hour,
      minute,
      timeZone,
      birthPlace,
      timeAccuracy,
      dayBoundaryOption
    },
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    },
    dayMaster: {
      can: dayMasterCan,
      polarity: dayMasterPolarity,
      element: dayMasterElement,
      nature: natureDescriptions[dayMasterCan] || 'Khí tượng trung hòa.',
      rootBranches
    },
    monthSolarTerm: {
      termName: monthResult.termInfo.currentTermName,
      termDate: `${String(monthResult.termInfo.currentTermDate.day).padStart(2, '0')}/${String(monthResult.termInfo.currentTermDate.month).padStart(2, '0')}/${monthResult.termInfo.currentTermDate.year} ${String(monthResult.termInfo.currentTermDate.hour).padStart(2, '0')}:${String(monthResult.termInfo.currentTermDate.minute).padStart(2, '0')}`,
      prevTermName: monthResult.termInfo.prevMajorTermName,
      nextTermName: monthResult.termInfo.nextMajorTermName,
      isNearTermBoundary: monthResult.termInfo.isNearTermBoundary
    },
    yearLapXuan: {
      lapXuanDate: yearResult.lapXuanTimeStr,
      isAdjustedByLapXuan: yearResult.isAdjustedByLapXuan,
      warningMessage: yearResult.isAdjustedByLapXuan
        ? `Sinh trước Lập Xuân (${yearResult.lapXuanTimeStr}), lấy năm ${yearResult.fullName}.`
        : undefined
    },
    elementAnalysis,
    dayMasterStrength,
    dungThanInfo,
    interactions,
    luckCycles,
    algorithmVersion: 'Bazi-Astronomical-v2.0 (Solar-Terms-Jean-Meeus)',
    calculatedAt: new Date().toISOString(),
    warnings
  };
}
