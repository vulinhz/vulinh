/**
 * HỆ THỐNG LỊCH ÂM - DƯƠNG VIỆT NAM (ASTRONOMICAL VIETNAMESE LUNAR CALENDAR)
 * Múi giờ chuẩn: Asia/Ho_Chi_Minh (UTC+7)
 * Thuật toán: Dựa trên mô hình thiên văn Mặt Trời - Mặt Trăng (Hồ Ngọc Đức - Viện Hàn lâm Khoa học)
 * Tích hợp:
 * - Chuyển đổi hai chiều Dương <-> Âm với xác thực tháng thiếu, tháng đủ, tháng nhuận.
 * - Khảo sát các mốc ranh giới lịch sử (VD: Tết Ất Sửu 1985 VN khác TQ).
 * - 24 Tiết Khí thiên văn chính xác theo Hoàng kinh Mặt Trời Jean Meeus.
 * - Can Chi Năm, Tháng, Ngày, Giờ.
 * - 12 Trực (Kiến, Trừ, Mãn...) & Nhị Thập Bát Tú.
 * - Danh mục Ngày lễ truyền thống Âm lịch & Ngày lễ quốc gia Dương lịch Việt Nam.
 */

import {
  jdFromDate,
  jdToDate,
  convertSolarToLunar,
  convertLunarToSolar,
  getCanChiYear,
  getCanChiMonth,
  getCanChiDay,
  getChiHour,
  getCanHour,
  CAN,
  CHI
} from './lunar';
import { getApparentSolarLongitude } from './baziSolar';

// 24 Tiết Khí Việt Nam với Hoàng kinh Mặt Trời tương ứng (0° = Xuân Phân)
export interface SolarTermInfo {
  name: string;
  degree: number; // 0..360
  season: 'Xuân' | 'Hạ' | 'Thu' | 'Đông';
}

export const SOLAR_TERMS_VN: SolarTermInfo[] = [
  { name: 'Xuân Phân', degree: 0, season: 'Xuân' },
  { name: 'Thanh Minh', degree: 15, season: 'Xuân' },
  { name: 'Cốc Vũ', degree: 30, season: 'Xuân' },
  { name: 'Lập Hạ', degree: 45, season: 'Hạ' },
  { name: 'Tiểu Mãn', degree: 60, season: 'Hạ' },
  { name: 'Mang Chủng', degree: 75, season: 'Hạ' },
  { name: 'Hạ Chí', degree: 90, season: 'Hạ' },
  { name: 'Tiểu Thử', degree: 105, season: 'Hạ' },
  { name: 'Đại Thử', degree: 120, season: 'Hạ' },
  { name: 'Lập Thu', degree: 135, season: 'Thu' },
  { name: 'Xử Thử', degree: 150, season: 'Thu' },
  { name: 'Bạch Lộ', degree: 165, season: 'Thu' },
  { name: 'Thu Phân', degree: 180, season: 'Thu' },
  { name: 'Hàn Lộ', degree: 195, season: 'Thu' },
  { name: 'Sương Giáng', degree: 210, season: 'Thu' },
  { name: 'Lập Đông', degree: 225, season: 'Đông' },
  { name: 'Tiểu Tuyết', degree: 240, season: 'Đông' },
  { name: 'Đại Tuyết', degree: 255, season: 'Đông' },
  { name: 'Đông Chí', degree: 270, season: 'Đông' },
  { name: 'Tiểu Hàn', degree: 285, season: 'Đông' },
  { name: 'Đại Hàn', degree: 300, season: 'Đông' },
  { name: 'Lập Xuân', degree: 315, season: 'Xuân' },
  { name: 'Vũ Thủy', degree: 330, season: 'Xuân' },
  { name: 'Kinh Trập', degree: 345, season: 'Xuân' },
];

// 12 Trực
export const TRUC_NAMES = [
  'Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp',
  'Phá', 'Nguy', 'Thành', 'Thâu', 'Khai', 'Bế'
] as const;

// 28 Tú (Nhị Thập Bát Tú)
export const NHI_THAP_BAT_TU = [
  'Giác', 'Cang', 'Đê', 'Phòng', 'Tâm', 'Vĩ', 'Cơ',
  'Đẩu', 'Ngưu', 'Nữ', 'Hư', 'Nguy', 'Thất', 'Bích',
  'Khuê', 'Lâu', 'Vị', 'Mão', 'Tất', 'Chủy', 'Sâm',
  'Tỉnh', 'Quỷ', 'Liễu', 'Tinh', 'Trương', 'Dực', 'Chẩn'
] as const;

// Ngày lễ Dương lịch tại Việt Nam
export const SOLAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Dương Lịch',
  '14-2': 'Lễ Tình Nhân (Valentine)',
  '8-3': 'Ngày Quốc tế Phụ nữ',
  '26-3': 'Ngày Thành lập Đoàn TNCS Hồ Chí Minh',
  '30-4': 'Ngày Giải phóng miền Nam, Thống nhất Đất nước',
  '1-5': 'Ngày Quốc tế Lao động',
  '7-5': 'Ngày Chiến thắng Điện Biên Phủ',
  '19-5': 'Ngày sinh Chủ tịch Hồ Chí Minh',
  '1-6': 'Ngày Quốc tế Thiếu nhi',
  '27-7': 'Ngày Thương binh Liệt sĩ',
  '19-8': 'Ngày Cách mạng Tháng Tám thành công',
  '2-9': 'Ngày Quốc khánh Nước CHXHCN Việt Nam',
  '10-10': 'Ngày Giải phóng Thủ đô Hà Nội',
  '20-10': 'Ngày Phụ nữ Việt Nam',
  '20-11': 'Ngày Nhà giáo Việt Nam',
  '22-12': 'Ngày Thành lập Quân đội Nhân dân Việt Nam',
  '24-12': 'Đêm Giáng Sinh (Noel)',
  '25-12': 'Lễ Giáng Sinh'
};

// Ngày lễ & Lễ hội truyền thống Âm lịch Việt Nam
export const LUNAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Nguyên Đán (Mùng 1 Tết)',
  '2-1': 'Mùng 2 Tết Nguyên Đán',
  '3-1': 'Mùng 3 Tết Nguyên Đán',
  '4-1': 'Mùng 4 Tết',
  '15-1': 'Tết Nguyên Tiêu (Rằm tháng Giêng)',
  '10-3': 'Giỗ Tổ Hùng Vương (10/3 Âm lịch)',
  '15-4': 'Lễ Phật Đản (Rằm tháng Tư)',
  '5-5': 'Tết Đoan Ngọ (Giết sâu bọ)',
  '15-7': 'Lễ Vu Lan Báo Hiếu & Xá Tội Vong Nhân',
  '15-8': 'Tết Trung Thu (Rằm tháng Tám)',
  '9-9': 'Tết Trùng Cửu',
  '10-10': 'Tết Trùng Thập (Tết Thường Tân)',
  '15-10': 'Tết Hạ Nguyên (Rằm tháng Mười)',
  '23-12': 'Tiễn Táo Quân về trời (23 tháng Chạp)'
};

export interface DayCalendarInfo {
  solarDay: number;
  solarMonth: number;
  solarYear: number;
  dayOfWeek: number; // 0 = CN, 1 = T2, ... 6 = T7
  dayOfWeekName: string;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeapMonth: boolean;
  canYear: string;
  chiYear: string;
  canMonth: string;
  chiMonth: string;
  canDay: string;
  chiDay: string;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  tietKhi: string;
  holiday?: string;
  isToday: boolean;
  isFirstDayOfLunarMonth: boolean;
  isFullMoon: boolean; // Rằm
  truc: string;
  sao: string;
  isCurrentMonth: boolean; // Dùng cho grid lịch tháng hiển thị ngày trước/sau
}

/**
 * Tính Trực của ngày dựa trên Tháng Chi và Ngày Chi
 * Khẩu quyết: Tháng nào khởi Trực Kiến tại Chi đó, thuận hành tiếp theo Trừ, Mãn...
 */
export function calculateTruc(monthChi: string, dayChi: string): string {
  const chiOrder = ['Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];
  const mIndex = chiOrder.indexOf(monthChi);
  const dIndex = chiOrder.indexOf(dayChi);
  if (mIndex === -1 || dIndex === -1) return 'Kiến';
  const offset = (dIndex - mIndex + 12) % 12;
  return TRUC_NAMES[offset];
}

/**
 * Tính Nhị Thập Bát Tú (28 sao) theo số ngày Julian
 */
export function calculateNhiThapBatTu(jd: number): string {
  const index = (jd + 16) % 28;
  return NHI_THAP_BAT_TU[(index + 28) % 28];
}

/**
 * Tính Tiết Khí của một thời điểm ngày Dương lịch
 */
export function getSolarTermForDate(solarDay: number, solarMonth: number, solarYear: number, hour = 12): string {
  const jd = jdFromDate(solarDay, solarMonth, solarYear) + (hour - 7) / 24.0;
  const lon = getApparentSolarLongitude(jd);
  // Mỗi tiết khí cách nhau 15 độ
  const termIdx = Math.floor(lon / 15.0) % 24;
  return SOLAR_TERMS_VN[termIdx]?.name || 'Xuân Phân';
}

/**
 * Lấy thông tin chi tiết đầy đủ của một ngày (Dương lịch)
 */
export function getDayDetail(solarDay: number, solarMonth: number, solarYear: number, timeZone = 7): DayCalendarInfo {
  const jd = jdFromDate(solarDay, solarMonth, solarYear);
  const dayOfWeek = (jd + 1) % 7; // 0 = CN, 1 = T2, ...
  const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  const lunar = convertSolarToLunar(solarDay, solarMonth, solarYear, timeZone);
  const yearCanChi = getCanChiYear(lunar.year);
  const monthCanChi = getCanChiMonth(lunar.month, yearCanChi.can);
  const dayCanChi = getCanChiDay(solarDay, solarMonth, solarYear);

  const tietKhi = getSolarTermForDate(solarDay, solarMonth, solarYear);
  const truc = calculateTruc(monthCanChi.chi, dayCanChi.chi);
  const sao = calculateNhiThapBatTu(jd);

  // Kiểm tra ngày lễ
  const solarKey = `${solarDay}-${solarMonth}`;
  const lunarKey = `${lunar.day}-${lunar.month}`;
  let holiday: string | undefined = undefined;

  if (SOLAR_HOLIDAYS[solarKey]) {
    holiday = SOLAR_HOLIDAYS[solarKey];
  } else if (!lunar.isLeap && LUNAR_HOLIDAYS[lunarKey]) {
    holiday = LUNAR_HOLIDAYS[lunarKey];
  }

  // Đêm Giao Thừa (ngày cuối cùng của tháng Chạp)
  if (lunar.month === 12 && (lunar.day === 29 || lunar.day === 30)) {
    // Kiểm tra xem ngày mai có phải mùng 1 tháng Giêng không
    const nextJd = jd + 1;
    const [nextD, nextM, nextY] = jdToDate(nextJd);
    const nextLunar = convertSolarToLunar(nextD, nextM, nextY, timeZone);
    if (nextLunar.day === 1 && nextLunar.month === 1) {
      holiday = 'Đêm Giao Thừa';
    }
  }

  const now = new Date();
  const isToday =
    now.getDate() === solarDay &&
    now.getMonth() + 1 === solarMonth &&
    now.getFullYear() === solarYear;

  return {
    solarDay,
    solarMonth,
    solarYear,
    dayOfWeek,
    dayOfWeekName: dayOfWeekNames[dayOfWeek],
    lunarDay: lunar.day,
    lunarMonth: lunar.month,
    lunarYear: lunar.year,
    isLeapMonth: lunar.isLeap,
    canYear: yearCanChi.can,
    chiYear: yearCanChi.chi,
    canMonth: monthCanChi.can,
    chiMonth: monthCanChi.chi,
    canDay: dayCanChi.can,
    chiDay: dayCanChi.chi,
    canChiDay: dayCanChi.fullName,
    canChiMonth: monthCanChi.fullName,
    canChiYear: yearCanChi.fullName,
    tietKhi,
    holiday,
    isToday,
    isFirstDayOfLunarMonth: lunar.day === 1,
    isFullMoon: lunar.day === 15,
    truc,
    sao,
    isCurrentMonth: true
  };
}

/**
 * Kiểm tra số ngày trong tháng Dương lịch
 */
export function getDaysInSolarMonth(month: number, year: number): number {
  if ([4, 6, 9, 11].includes(month)) return 30;
  if (month === 2) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return 31;
}

/**
 * Sinh lưới dữ liệu 35 hoặc 42 ô ngày cho một tháng Dương lịch
 */
export function generateMonthCalendar(solarMonth: number, solarYear: number, timeZone = 7): DayCalendarInfo[] {
  const daysInMonth = getDaysInSolarMonth(solarMonth, solarYear);
  const firstDayJd = jdFromDate(1, solarMonth, solarYear);
  const firstDayOfWeek = (firstDayJd + 1) % 7; // 0 = CN, 1 = T2, ...

  // Thứ 2 là cột 0, Thứ 3 là cột 1, ..., Chủ Nhật là cột 6
  // Chuyển đổi: CN (0) -> 6, T2 (1) -> 0, T3 (2) -> 1 ...
  const startOffset = (firstDayOfWeek + 6) % 7;

  const result: DayCalendarInfo[] = [];

  // 1. Các ngày của tháng trước bù vào tuần đầu tiên
  if (startOffset > 0) {
    const prevMonth = solarMonth === 1 ? 12 : solarMonth - 1;
    const prevYear = solarMonth === 1 ? solarYear - 1 : solarYear;
    const daysInPrevMonth = getDaysInSolarMonth(prevMonth, prevYear);
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const info = getDayDetail(d, prevMonth, prevYear, timeZone);
      info.isCurrentMonth = false;
      result.push(info);
    }
  }

  // 2. Các ngày trong tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    const info = getDayDetail(d, solarMonth, solarYear, timeZone);
    info.isCurrentMonth = true;
    result.push(info);
  }

  // 3. Các ngày của tháng sau bù vào tuần cuối cùng để đủ bội số của 7 (35 hoặc 42 ô)
  const remainingCells = (7 - (result.length % 7)) % 7;
  const nextMonth = solarMonth === 12 ? 1 : solarMonth + 1;
  const nextYear = solarMonth === 12 ? solarYear + 1 : solarYear;
  for (let d = 1; d <= remainingCells; d++) {
    const info = getDayDetail(d, nextMonth, nextYear, timeZone);
    info.isCurrentMonth = false;
    result.push(info);
  }

  return result;
}

/**
 * Xác định số ngày của một tháng Âm lịch (29 ngày = Thiếu, 30 ngày = Đủ)
 */
export function getLunarMonthDaysCount(lunarMonth: number, lunarYear: number, isLeap = false, timeZone = 7): {
  daysCount: 29 | 30;
  type: 'Tháng Thiếu (29 ngày)' | 'Tháng Đủ (30 ngày)';
  solarStartDate: [number, number, number];
} {
  const [sd1, sm1, sy1] = convertLunarToSolar(1, lunarMonth, lunarYear, isLeap, timeZone);
  const jd1 = jdFromDate(sd1, sm1, sy1);

  // Ngày 30 âm lịch tương ứng với jd1 + 29
  const [sd30, sm30, sy30] = jdToDate(jd1 + 29);
  const lunar30 = convertSolarToLunar(sd30, sm30, sy30, timeZone);

  // Nếu ngày thứ 30 vẫn thuộc cùng tháng âm và cùng cờ nhuận, thì tháng đó có 30 ngày (Tháng đủ)
  if (lunar30.month === lunarMonth && lunar30.isLeap === isLeap) {
    return {
      daysCount: 30,
      type: 'Tháng Đủ (30 ngày)',
      solarStartDate: [sd1, sm1, sy1]
    };
  } else {
    return {
      daysCount: 29,
      type: 'Tháng Thiếu (29 ngày)',
      solarStartDate: [sd1, sm1, sy1]
    };
  }
}

/**
 * Kiểm tra xem một năm Âm lịch có tháng nhuận hay không và nhuận tháng mấy
 */
export function getLeapMonthInLunarYear(lunarYear: number, timeZone = 7): {
  hasLeapMonth: boolean;
  leapMonthNumber: number | null;
  description: string;
} {
  // Lấy danh sách các tháng trong năm âm lịch bằng cách quét qua 12 tháng
  for (let m = 1; m <= 12; m++) {
    try {
      const [sd, sm, sy] = convertLunarToSolar(1, m, lunarYear, true, timeZone);
      const lunar = convertSolarToLunar(sd, sm, sy, timeZone);
      if (lunar.isLeap && lunar.month === m && lunar.year === lunarYear) {
        return {
          hasLeapMonth: true,
          leapMonthNumber: m,
          description: `Năm ${lunarYear} (${getCanChiYear(lunarYear).fullName}) nhuận tháng ${m} Âm lịch.`
        };
      }
    } catch {
      // Bỏ qua nếu tháng nhuận không hợp lệ
    }
  }

  return {
    hasLeapMonth: false,
    leapMonthNumber: null,
    description: `Năm ${lunarYear} (${getCanChiYear(lunarYear).fullName}) là năm thường (không có tháng nhuận).`
  };
}

/**
 * Xác thực việc chuyển đổi ngày Âm sang Dương và thông báo lỗi rõ ràng nếu không hợp lệ
 */
export function safeConvertLunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeap = false,
  timeZone = 7
): {
  success: boolean;
  solarDate?: { day: number; month: number; year: number };
  errorMessage?: string;
  monthDetails?: { daysCount: number; type: string };
} {
  if (lunarYear < 1900 || lunarYear > 2100) {
    return {
      success: false,
      errorMessage: `Năm âm lịch ${lunarYear} nằm ngoài phạm vi hỗ trợ (1900 - 2100).`
    };
  }

  if (lunarMonth < 1 || lunarMonth > 12) {
    return {
      success: false,
      errorMessage: `Tháng âm lịch ${lunarMonth} không hợp lệ (phải từ 1 đến 12).`
    };
  }

  // Kiểm tra tính hợp lệ của tháng nhuận
  if (isLeap) {
    const leapInfo = getLeapMonthInLunarYear(lunarYear, timeZone);
    if (!leapInfo.hasLeapMonth || leapInfo.leapMonthNumber !== lunarMonth) {
      return {
        success: false,
        errorMessage: `Năm ${lunarYear} không có tháng ${lunarMonth} nhuận. ${leapInfo.description}`
      };
    }
  }

  // Kiểm tra số ngày trong tháng âm lịch
  const monthInfo = getLunarMonthDaysCount(lunarMonth, lunarYear, isLeap, timeZone);
  if (lunarDay < 1 || lunarDay > monthInfo.daysCount) {
    return {
      success: false,
      errorMessage: `Tháng ${lunarMonth}${isLeap ? ' nhuận' : ''} năm ${lunarYear} chỉ có tối đa ${monthInfo.daysCount} ngày (${monthInfo.type}). Ngày ${lunarDay} không tồn tại.`
    };
  }

  try {
    const [sd, sm, sy] = convertLunarToSolar(lunarDay, lunarMonth, lunarYear, isLeap, timeZone);
    // Xác minh ngược lại (Round-trip integrity check)
    const backLunar = convertSolarToLunar(sd, sm, sy, timeZone);
    if (backLunar.day !== lunarDay || backLunar.month !== lunarMonth || backLunar.year !== lunarYear || backLunar.isLeap !== isLeap) {
      return {
        success: false,
        errorMessage: 'Lỗi đối chiếu hai chiều: Dữ liệu âm lịch không tương thích thiên văn.'
      };
    }

    return {
      success: true,
      solarDate: { day: sd, month: sm, year: sy },
      monthDetails: { daysCount: monthInfo.daysCount, type: monthInfo.type }
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'Lỗi thuật toán chuyển đổi âm lịch sang dương lịch.'
    };
  }
}

/**
 * Lấy Can Chi của 12 giờ trong ngày theo quy tắc Ngũ Thử Độn
 */
export function get12HoursCanChi(canDay: string): Array<{
  chi: string;
  can: string;
  fullName: string;
  timeRange: string;
  isLateRat?: boolean;
}> {
  const result: Array<{ chi: string; can: string; fullName: string; timeRange: string; isLateRat?: boolean }> = [];
  const hoursChi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const ranges = [
    '23:00 - 00:59',
    '01:00 - 02:59',
    '03:00 - 04:59',
    '05:00 - 06:59',
    '07:00 - 08:59',
    '09:00 - 10:59',
    '11:00 - 12:59',
    '13:00 - 14:59',
    '15:00 - 16:59',
    '17:00 - 18:59',
    '19:00 - 20:59',
    '21:00 - 22:59'
  ];

  for (let i = 0; i < 12; i++) {
    const can = getCanHour(canDay, i);
    result.push({
      chi: hoursChi[i],
      can,
      fullName: `${can} ${hoursChi[i]}`,
      timeRange: ranges[i]
    });
  }
  return result;
}
