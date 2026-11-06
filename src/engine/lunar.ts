/**
 * Thuật toán chuyển đổi Dương lịch - Âm lịch chuẩn xác cho múi giờ Việt Nam (UTC+7)
 * Dựa trên mô hình tính toán thiên văn Mặt Trăng và Mặt Trời (Hồ Ngọc Đức - Viện Hàn lâm Khoa học).
 * Hỗ trợ chuyển đổi từ 1900 đến 2100 với đầy đủ tháng nhuận, can chi năm, tháng, ngày, giờ.
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canYear: string;
  chiYear: string;
  canMonth: string;
  chiMonth: string;
  canDay: string;
  chiDay: string;
  canHour: string;
  chiHour: string;
  tietKhi: string;
  napAmYear: string;
}

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const;
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const;

export const CAN_NGU_HANH: Record<string, string> = {
  'Giáp': 'Mộc', 'Ất': 'Mộc',
  'Bính': 'Hỏa', 'Đinh': 'Hỏa',
  'Mậu': 'Thổ', 'Kỷ': 'Thổ',
  'Canh': 'Kim', 'Tân': 'Kim',
  'Nhâm': 'Thủy', 'Quý': 'Thủy'
};

export const CHI_NGU_HANH: Record<string, string> = {
  'Tý': 'Thủy', 'Sửu': 'Thổ', 'Dần': 'Mộc', 'Mão': 'Mộc',
  'Thìn': 'Thổ', 'Tị': 'Hỏa', 'Ngọ': 'Hỏa', 'Mùi': 'Thổ',
  'Thân': 'Kim', 'Dậu': 'Kim', 'Tuất': 'Thổ', 'Hợi': 'Thủy'
};

// 60 Lục Thập Hoa Giáp Nạp Âm
export const NAP_AM: Record<string, { name: string; element: 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ' }> = {
  'Giáp Tý': { name: 'Hải Trung Kim', element: 'Kim' },
  'Ất Sửu': { name: 'Hải Trung Kim', element: 'Kim' },
  'Bính Dần': { name: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Đinh Mão': { name: 'Lư Trung Hỏa', element: 'Hỏa' },
  'Mậu Thìn': { name: 'Đại Lâm Mộc', element: 'Mộc' },
  'Kỷ Tị': { name: 'Đại Lâm Mộc', element: 'Mộc' },
  'Canh Ngọ': { name: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Tân Mùi': { name: 'Lộ Bàng Thổ', element: 'Thổ' },
  'Nhâm Thân': { name: 'Kiếm Phong Kim', element: 'Kim' },
  'Quý Dậu': { name: 'Kiếm Phong Kim', element: 'Kim' },
  'Giáp Tuất': { name: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Ất Hợi': { name: 'Sơn Đầu Hỏa', element: 'Hỏa' },
  'Bính Tý': { name: 'Giản Hạ Thủy', element: 'Thủy' },
  'Đinh Sửu': { name: 'Giản Hạ Thủy', element: 'Thủy' },
  'Mậu Dần': { name: 'Thành Đầu Thổ', element: 'Thổ' },
  'Kỷ Mão': { name: 'Thành Đầu Thổ', element: 'Thổ' },
  'Canh Thìn': { name: 'Bạch Lạp Kim', element: 'Kim' },
  'Tân Tị': { name: 'Bạch Lạp Kim', element: 'Kim' },
  'Nhâm Ngọ': { name: 'Dương Liễu Mộc', element: 'Mộc' },
  'Quý Mùi': { name: 'Dương Liễu Mộc', element: 'Mộc' },
  'Giáp Thân': { name: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Ất Dậu': { name: 'Tuyền Trung Thủy', element: 'Thủy' },
  'Bính Tuất': { name: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Đinh Hợi': { name: 'Ốc Thượng Thổ', element: 'Thổ' },
  'Mậu Tý': { name: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Kỷ Sửu': { name: 'Tích Lịch Hỏa', element: 'Hỏa' },
  'Canh Dần': { name: 'Tùng Bách Mộc', element: 'Mộc' },
  'Tân Mão': { name: 'Tùng Bách Mộc', element: 'Mộc' },
  'Nhâm Thìn': { name: 'Trường Lưu Thủy', element: 'Thủy' },
  'Quý Tị': { name: 'Trường Lưu Thủy', element: 'Thủy' },
  'Giáp Ngọ': { name: 'Sa Trung Kim', element: 'Kim' },
  'Ất Mùi': { name: 'Sa Trung Kim', element: 'Kim' },
  'Bính Thân': { name: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Đinh Dậu': { name: 'Sơn Hạ Hỏa', element: 'Hỏa' },
  'Mậu Tuất': { name: 'Bình Địa Mộc', element: 'Mộc' },
  'Kỷ Hợi': { name: 'Bình Địa Mộc', element: 'Mộc' },
  'Canh Tý': { name: 'Bích Thượng Thổ', element: 'Thổ' },
  'Tân Sửu': { name: 'Bích Thượng Thổ', element: 'Thổ' },
  'Nhâm Dần': { name: 'Kim Bạch Kim', element: 'Kim' },
  'Quý Mão': { name: 'Kim Bạch Kim', element: 'Kim' },
  'Giáp Thìn': { name: 'Phú Đăng Hỏa', element: 'Hỏa' },
  'Ất Tị': { name: 'Phú Đăng Hỏa', element: 'Hỏa' },
  'Bính Ngọ': { name: 'Thiên Hà Thủy', element: 'Thủy' },
  'Đinh Mùi': { name: 'Thiên Hà Thủy', element: 'Thủy' },
  'Mậu Thân': { name: 'Đại Trạch Thổ', element: 'Thổ' },
  'Kỷ Dậu': { name: 'Đại Trạch Thổ', element: 'Thổ' },
  'Canh Tuất': { name: 'Thoa Xuyến Kim', element: 'Kim' },
  'Tân Hợi': { name: 'Thoa Xuyến Kim', element: 'Kim' },
  'Nhâm Tý': { name: 'Tang Đố Mộc', element: 'Mộc' },
  'Quý Sửu': { name: 'Tang Đố Mộc', element: 'Mộc' },
  'Giáp Dần': { name: 'Đại Khê Thủy', element: 'Thủy' },
  'Ất Mão': { name: 'Đại Khê Thủy', element: 'Thủy' },
  'Bính Thìn': { name: 'Sa Trung Thổ', element: 'Thổ' },
  'Đinh Tị': { name: 'Sa Trung Thổ', element: 'Thổ' },
  'Mậu Ngọ': { name: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Kỷ Mùi': { name: 'Thiên Thượng Hỏa', element: 'Hỏa' },
  'Canh Thân': { name: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Tân Dậu': { name: 'Thạch Lựu Mộc', element: 'Mộc' },
  'Nhâm Tuất': { name: 'Đại Hải Thủy', element: 'Thủy' },
  'Quý Hợi': { name: 'Đại Hải Thủy', element: 'Thủy' }
};

// 24 Tiết Khí
export const TIET_KHI = [
  'Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng',
  'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
  'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết',
  'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'
];

/**
 * Tính số ngày Julius từ ngày Dương lịch
 */
export function jdFromDate(d: number, m: number, y: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  let jd = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
  if (jd < 2299161) {
    jd = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - 32083;
  }
  return jd;
}

/**
 * Tính ngày Dương lịch từ số ngày Julius
 */
export function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  if (jd > 2299160) {
    const a1 = Math.floor((jd - 1867216.25) / 36524.25);
    a = jd + 1 + a1 - Math.floor(a1 / 4);
  } else {
    a = jd;
  }
  b = a + 1524;
  c = Math.floor((b - 122.1) / 365.25);
  d = Math.floor(365.25 * c);
  e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  if (e < 14) {
    m = e - 1;
  } else {
    m = e - 13;
  }
  let year: number;
  if (m > 2) {
    year = c - 4716;
  } else {
    year = c - 4715;
  }
  return [day, m, year];
}

/**
 * Tìm thời điểm trăng mới (Sóc)
 */
function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);

  let JdNew = Jd1 + C1;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

/**
 * Kinh độ mặt trời (Sun Longitude)
 */
function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr)
    + 0.000289 * Math.sin(3 * M * dr);
  let theta = L0 + C;
  theta = theta * dr;
  theta = theta - Math.PI * 2 * Math.floor(theta / (Math.PI * 2));
  return Math.floor((theta / Math.PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const k = Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

/**
 * Chuyển ngày Dương lịch sang Âm lịch (Việt Nam UTC+7)
 */
export function convertSolarToLunar(dd: number, mm: number, yy: number, timeZone = 7): {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
} {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (dayNumber >= a11) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy + 1, timeZone);
    b11 = getLunarMonth11(yy, timeZone);
  } else {
    lunarYear = yy - 1;
    a11 = getLunarMonth11(yy, timeZone);
    b11 = getLunarMonth11(yy - 1, timeZone);
  }

  const diff = Math.round((monthStart - b11) / 29.530588853);
  let lunarMonth = diff + 11;
  let isLeap = false;

  const totalMonthsBetween = Math.round((a11 - b11) / 29.530588853);
  if (totalMonthsBetween > 12) {
    let leapMonthIndex = 0;
    const kB11 = Math.floor((b11 - 2415021.0769986) / 29.530588853);
    for (let i = 1; i <= 13; i++) {
      const nm1 = getNewMoonDay(kB11 + i - 1, timeZone);
      const nm2 = getNewMoonDay(kB11 + i, timeZone);
      if (getSunLongitude(nm1, timeZone) === getSunLongitude(nm2, timeZone)) {
        leapMonthIndex = i;
        break;
      }
    }
    if (diff >= leapMonthIndex) {
      if (diff === leapMonthIndex) {
        isLeap = true;
        lunarMonth = diff + 10;
      } else {
        lunarMonth = diff + 10;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11) {
    // Tháng 11 hoặc 12 cuối năm
  } else {
    lunarYear = lunarYear + 1;
  }

  const lunarDay = dayNumber - monthStart + 1;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap
  };
}

/**
 * Chuyển ngày Âm lịch sang Dương lịch
 */
export function convertLunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeap = false, timeZone = 7): [number, number, number] {
  let b11: number;
  let a11: number;
  if (lunarMonth >= 11) {
    b11 = getLunarMonth11(lunarYear, timeZone);
    a11 = getLunarMonth11(lunarYear + 1, timeZone);
  } else {
    b11 = getLunarMonth11(lunarYear - 1, timeZone);
    a11 = getLunarMonth11(lunarYear, timeZone);
  }

  const kB11 = Math.floor((b11 - 2415021.0769986) / 29.530588853 + 0.5);
  const totalMonths = Math.round((a11 - b11) / 29.530588853);
  let leapMonthIndex = 0;
  if (totalMonths > 12) {
    for (let i = 1; i <= 13; i++) {
      const nm1 = getNewMoonDay(kB11 + i - 1, timeZone);
      const nm2 = getNewMoonDay(kB11 + i, timeZone);
      if (getSunLongitude(nm1, timeZone) === getSunLongitude(nm2, timeZone)) {
        leapMonthIndex = i;
        break;
      }
    }
  }

  // target diff from b11
  let diff: number;
  if (lunarMonth >= 11) {
    diff = lunarMonth - 11;
  } else {
    diff = lunarMonth + 1; // tháng 1 corresponds to diff 2 if no leap before it
  }

  if (leapMonthIndex > 0) {
    if (isLeap && diff === leapMonthIndex - 1) {
      diff = leapMonthIndex;
    } else if (diff >= leapMonthIndex) {
      diff += 1;
    }
  }

  const monthStart = getNewMoonDay(kB11 + diff, timeZone);
  const targetJd = monthStart + lunarDay - 1;
  return jdToDate(targetJd);
}

/**
 * Tính Can Chi năm
 */
export function getCanChiYear(year: number): { can: string; chi: string; fullName: string } {
  const canIndex = (year + 6) % 10;
  const chiIndex = (year + 8) % 12;
  const can = CAN[(canIndex + 10) % 10];
  const chi = CHI[(chiIndex + 12) % 12];
  return { can, chi, fullName: `${can} ${chi}` };
}

/**
 * Tính Can Chi tháng dựa trên Can Năm và Tháng Âm Lịch
 * Khẩu quyết:
 * Giáp Kỷ chi niên Bính tác thủ (Tháng 1 là Bính Dần)
 * Ất Canh chi tuế Mậu vi đầu (Tháng 1 là Mậu Dần)
 * Bính Tân tiện khởi Canh Dần thượng (Tháng 1 là Canh Dần)
 * Đinh Nhâm Nhâm Dần thuận thủy lưu (Tháng 1 là Nhâm Dần)
 * Mậu Quý tất tòng Giáp Dần cầu (Tháng 1 là Giáp Dần)
 */
export function getCanChiMonth(lunarMonth: number, canYear: string): { can: string; chi: string; fullName: string } {
  // Chi của tháng 1 luôn là Dần (index 2)
  const chiIndex = (lunarMonth + 1) % 12;
  const chi = CHI[chiIndex];

  let startCanMonthIndex = 0; // index of Can cho tháng 1 Dần
  switch (canYear) {
    case 'Giáp':
    case 'Kỷ':
      startCanMonthIndex = 2; // Bính
      break;
    case 'Ất':
    case 'Canh':
      startCanMonthIndex = 4; // Mậu
      break;
    case 'Bính':
    case 'Tân':
      startCanMonthIndex = 6; // Canh
      break;
    case 'Đinh':
    case 'Nhâm':
      startCanMonthIndex = 8; // Nhâm
      break;
    case 'Mậu':
    case 'Quý':
      startCanMonthIndex = 0; // Giáp
      break;
  }

  const canIndex = (startCanMonthIndex + (lunarMonth - 1)) % 10;
  const can = CAN[canIndex];
  return { can, chi, fullName: `${can} ${chi}` };
}

/**
 * Tính Can Chi ngày dựa trên số ngày Julius
 */
export function getCanChiDay(solarDay: number, solarMonth: number, solarYear: number): { can: string; chi: string; fullName: string } {
  const jd = jdFromDate(solarDay, solarMonth, solarYear);
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;
  const can = CAN[canIndex];
  const chi = CHI[chiIndex];
  return { can, chi, fullName: `${can} ${chi}` };
}

/**
 * Tính Chi giờ từ giờ phút sinh
 * Tý: 23:00 - 00:59
 * Sửu: 01:00 - 02:59
 * Dần: 03:00 - 04:59
 * Mão: 05:00 - 06:59
 * Thìn: 07:00 - 08:59
 * Tị: 09:00 - 10:59
 * Ngọ: 11:00 - 12:59
 * Mùi: 13:00 - 14:59
 * Thân: 15:00 - 16:59
 * Dậu: 17:00 - 18:59
 * Tuất: 19:00 - 20:59
 * Hợi: 21:00 - 22:59
 */
export function getChiHour(hour: number, minute = 0): { chi: string; chiIndex: number; isEarlyRat: boolean; isLateRat: boolean } {
  const totalMin = hour * 60 + minute;
  // 23:00 (1380m) to 23:59: Late Rat (Tý muộn)
  // 00:00 to 00:59 (59m): Early Rat (Tý sớm)
  let chiIndex = Math.floor((totalMin + 60) / 120) % 12;
  const isLateRat = totalMin >= 1380;
  const isEarlyRat = totalMin < 60;
  return {
    chi: CHI[chiIndex],
    chiIndex,
    isEarlyRat,
    isLateRat
  };
}

/**
 * Tính Can của giờ từ Can Ngày và Chi Giờ
 * Khẩu quyết ngũ thử độn:
 * Giáp Kỷ hoàn gia Giáp (Giờ Tý khởi Giáp Tý)
 * Ất Canh Bính tác sơ (Giờ Tý khởi Bính Tý)
 * Bính Tân tầm Mậu khởi (Giờ Tý khởi Mậu Tý)
 * Đinh Nhâm Canh Tý cư (Giờ Tý khởi Canh Tý)
 * Mậu Quý hà phương phát, Nhâm Tý thị chân đồ (Giờ Tý khởi Nhâm Tý)
 */
export function getCanHour(canDay: string, chiIndex: number): string {
  let startCanIndex = 0;
  switch (canDay) {
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
  return CAN[canIndex];
}

/**
 * Tổng hợp thông tin lịch và Can Chi trọn vẹn
 */
export function getFullLunarInfo(solarDay: number, solarMonth: number, solarYear: number, hour: number, minute = 0): LunarDate {
  const lunar = convertSolarToLunar(solarDay, solarMonth, solarYear, 7);
  const yearCanChi = getCanChiYear(lunar.year);
  const monthCanChi = getCanChiMonth(lunar.month, yearCanChi.can);
  const dayCanChi = getCanChiDay(solarDay, solarMonth, solarYear);
  const hourInfo = getChiHour(hour, minute);
  const canHour = getCanHour(dayCanChi.can, hourInfo.chiIndex);

  const napAmInfo = NAP_AM[yearCanChi.fullName] || { name: 'Chưa rõ', element: 'Thổ' };

  return {
    day: lunar.day,
    month: lunar.month,
    year: lunar.year,
    isLeap: lunar.isLeap,
    canYear: yearCanChi.can,
    chiYear: yearCanChi.chi,
    canMonth: monthCanChi.can,
    chiMonth: monthCanChi.chi,
    canDay: dayCanChi.can,
    chiDay: dayCanChi.chi,
    canHour,
    chiHour: hourInfo.chi,
    tietKhi: 'Tiết khí chuẩn',
    napAmYear: napAmInfo.name
  };
}
