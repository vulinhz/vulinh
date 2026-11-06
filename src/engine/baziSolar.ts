/**
 * Module tính toán Tiết Khí (Solar Terms) và Lịch Can Chi Thiên Văn cho Bát Tự - Tứ Trụ.
 * Dựa trên thuật toán tính kinh độ biểu kiến Mặt Trời (Jean Meeus Astronomical Algorithms)
 * Chuẩn hóa múi giờ Việt Nam (UTC+7) và hỗ trợ mọi múi giờ từ năm 1900 đến 2100.
 */

export interface SolarTermRecord {
  index: number;         // 0 đến 23
  name: string;          // Tên tiết khí (Lập Xuân, Kinh Trập, ...)
  chineseName: string;
  targetLongitude: number; // Kinh độ Mặt Trời (315, 330, 345, 0, 15, ...)
  isMajorTerm: boolean;  // Tiết lệnh (bắt đầu tháng Bát Tự) hay Trung khí
  monthBranchIndex: number; // Chi của tháng (Dần=2, Mão=3, ..., Sửu=1)
  branchName: string;
  jd: number;            // Julian Day Number của thời điểm chính xác
  date: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}

// 24 Tiết Khí bắt đầu từ Xuân Phân (0°) hoặc Lập Xuân (315°)
// Trong Bát Tự, chu kỳ bắt đầu từ Lập Xuân (315°)
export const SOLAR_TERMS_INFO = [
  { name: 'Lập Xuân',  chinese: '立春', deg: 315, isMajor: true,  branchIndex: 2,  branch: 'Dần' },
  { name: 'Vũ Thủy',   chinese: '雨水', deg: 330, isMajor: false, branchIndex: 2,  branch: 'Dần' },
  { name: 'Kinh Trập', chinese: '惊蛰', deg: 345, isMajor: true,  branchIndex: 3,  branch: 'Mão' },
  { name: 'Xuân Phân', chinese: '春分', deg: 0,   isMajor: false, branchIndex: 3,  branch: 'Mão' },
  { name: 'Thanh Minh',chinese: '清明', deg: 15,  isMajor: true,  branchIndex: 4,  branch: 'Thìn' },
  { name: 'Cốc Vũ',    chinese: '谷雨', deg: 30,  isMajor: false, branchIndex: 4,  branch: 'Thìn' },
  { name: 'Lập Hạ',    chinese: '立夏', deg: 45,  isMajor: true,  branchIndex: 5,  branch: 'Tị' },
  { name: 'Tiểu Mãn',  chinese: '小满', deg: 60,  isMajor: false, branchIndex: 5,  branch: 'Tị' },
  { name: 'Mang Chủng',chinese: '芒种', deg: 75,  isMajor: true,  branchIndex: 6,  branch: 'Ngọ' },
  { name: 'Hạ Chí',    chinese: '夏至', deg: 90,  isMajor: false, branchIndex: 6,  branch: 'Ngọ' },
  { name: 'Tiểu Thử',  chinese: '小暑', deg: 105, isMajor: true,  branchIndex: 7,  branch: 'Mùi' },
  { name: 'Đại Thử',   chinese: '大暑', deg: 120, isMajor: false, branchIndex: 7,  branch: 'Mùi' },
  { name: 'Lập Thu',   chinese: '立秋', deg: 135, isMajor: true,  branchIndex: 8,  branch: 'Thân' },
  { name: 'Xử Thử',    chinese: '处暑', deg: 150, isMajor: false, branchIndex: 8,  branch: 'Thân' },
  { name: 'Bạch Lộ',   chinese: '白露', deg: 165, isMajor: true,  branchIndex: 9,  branch: 'Dậu' },
  { name: 'Thu Phân',  chinese: '秋分', deg: 180, isMajor: false, branchIndex: 9,  branch: 'Dậu' },
  { name: 'Hàn Lộ',    chinese: '寒露', deg: 195, isMajor: true,  branchIndex: 10, branch: 'Tuất' },
  { name: 'Sương Giáng',chinese: '霜降', deg: 210, isMajor: false, branchIndex: 10, branch: 'Tuất' },
  { name: 'Lập Đông',  chinese: '立冬', deg: 225, isMajor: true,  branchIndex: 11, branch: 'Hợi' },
  { name: 'Tiểu Tuyết',chinese: '小雪', deg: 240, isMajor: false, branchIndex: 11, branch: 'Hợi' },
  { name: 'Đại Tuyết', chinese: '大雪', deg: 255, isMajor: true,  branchIndex: 0,  branch: 'Tý' },
  { name: 'Đông Chí',  chinese: '冬至', deg: 270, isMajor: false, branchIndex: 0,  branch: 'Tý' },
  { name: 'Tiểu Hàn',  chinese: '小寒', deg: 285, isMajor: true,  branchIndex: 1,  branch: 'Sửu' },
  { name: 'Đại Hàn',   chinese: '大寒', deg: 300, isMajor: false, branchIndex: 1,  branch: 'Sửu' },
];

/**
 * Tính kinh độ biểu kiến Mặt Trời tại một ngày Julian (UT)
 */
export function getApparentSolarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const dr = Math.PI / 180;

  // Kinh độ trung bình L0
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Độ dị thường trung bình M
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  // Phương trình tâm sai C
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * dr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr)
    + 0.000289 * Math.sin(3 * M * dr);

  const trueLongitude = L0 + C;

  // Hiệu chỉnh quang sai và chương động
  const omega = 125.04 - 1934.136 * T;
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * dr);

  let l = apparentLongitude % 360;
  if (l < 0) l += 360;
  return l;
}

/**
 * Chuyển ngày giờ Dương lịch sang số ngày Julian (UT)
 */
export function jdFromCivilDateTime(
  day: number,
  month: number,
  year: number,
  hour = 12,
  minute = 0,
  second = 0,
  timeZone = 7
): number {
  const decimalHourUT = (hour + minute / 60 + second / 3600) - timeZone;
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd - 0.5 + decimalHourUT / 24;
}

/**
 * Chuyển số ngày Julian về ngày giờ dân sự theo múi giờ chỉ định
 */
export function civilDateTimeFromJD(jd: number, timeZone = 7): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const localJD = jd + 0.5 + timeZone / 24;
  const Z = Math.floor(localJD);
  const F = localJD - Z;

  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const totalSeconds = Math.round(F * 86400);
  const hour = Math.floor(totalSeconds / 3600) % 24;
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;

  return { year, month, day, hour, minute, second };
}

/**
 * Tìm chính xác thời điểm Tiết Khí (độ chính xác < 1 phút)
 */
export function findSolarTermInstantJD(targetDeg: number, approxJD: number): number {
  let low = approxJD - 2.5;
  let high = approxJD + 2.5;

  for (let i = 0; i < 45; i++) {
    const mid = (low + high) / 2;
    const l = getApparentSolarLongitude(mid);
    let diff = l - targetDeg;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

/**
 * Ước tính ngày Julian cho tiết khí trong một năm
 */
function getApproximateSolarTermJD(year: number, targetDeg: number): number {
  // Khoảng cách xấp xỉ từ ngày 1/1
  // Lập xuân (315°) ~ Feb 4
  // Mỗi 15° tương ứng ~ 15.22 ngày
  let daysFromJan1 = 34.5; // Feb 4 is approx day 35
  let degDiff = targetDeg - 315;
  if (degDiff < 0) degDiff += 360;
  daysFromJan1 += (degDiff / 360) * 365.2422;

  // JD của Jan 1 năm đó
  const jan1JD = jdFromCivilDateTime(1, 1, year, 0, 0, 0, 0);
  return jan1JD + daysFromJan1;
}

/**
 * Lấy danh sách 24 Tiết Khí cho một năm Dương lịch
 */
export function getYearSolarTerms(solarYear: number, timeZone = 7): SolarTermRecord[] {
  const records: SolarTermRecord[] = [];

  for (let i = 0; i < SOLAR_TERMS_INFO.length; i++) {
    const info = SOLAR_TERMS_INFO[i];
    // Chú ý: Tiểu Hàn (285°) và Đại Hàn (300°) diễn ra vào tháng 1 của năm đó
    // Trong khi Lập Xuân (315°) diễn ra vào đầu tháng 2
    let approxYear = solarYear;
    let approxJD = getApproximateSolarTermJD(approxYear, info.deg);

    // Điều chỉnh nếu tiết khí rơi sang năm trước hoặc sau
    if (info.deg === 285 || info.deg === 300) {
      // Tiểu Hàn và Đại Hàn đầu năm solarYear
      const janApproxJD = jdFromCivilDateTime(10, 1, solarYear, 0, 0, 0, 0);
      approxJD = janApproxJD + (info.deg === 285 ? -4 : 10);
    }

    const exactJD = findSolarTermInstantJD(info.deg, approxJD);
    const date = civilDateTimeFromJD(exactJD, timeZone);

    records.push({
      index: i,
      name: info.name,
      chineseName: info.chinese,
      targetLongitude: info.deg,
      isMajorTerm: info.isMajor,
      monthBranchIndex: info.branchIndex,
      branchName: info.branch,
      jd: exactJD,
      date
    });
  }

  // Sắp xếp theo thứ tự thời gian trong năm
  records.sort((a, b) => a.jd - b.jd);
  return records;
}

/**
 * Lấy Tiết Khí Lập Xuân của một năm
 */
export function getLapXuanInstant(solarYear: number, timeZone = 7): SolarTermRecord {
  const approxJD = jdFromCivilDateTime(4, 2, solarYear, 12, 0, 0, timeZone);
  const jd = findSolarTermInstantJD(315, approxJD);
  const date = civilDateTimeFromJD(jd, timeZone);
  return {
    index: 0,
    name: 'Lập Xuân',
    chineseName: '立春',
    targetLongitude: 315,
    isMajorTerm: true,
    monthBranchIndex: 2,
    branchName: 'Dần',
    jd,
    date
  };
}

/**
 * Xác định chính xác Chi của tháng theo Tiết lệnh và khoảng cách tới Tiết lệnh trước/sau (cho Đại Vận)
 */
export function getBaziMonthSolarTerm(
  day: number,
  month: number,
  year: number,
  hour: number,
  minute: number,
  timeZone = 7
): {
  monthBranch: string;
  monthBranchIndex: number;
  currentTermName: string;
  currentTermDate: { day: number; month: number; year: number; hour: number; minute: number };
  prevMajorTermJD: number;
  nextMajorTermJD: number;
  prevMajorTermName: string;
  nextMajorTermName: string;
  birthJD: number;
  isNearTermBoundary: boolean; // Sinh sát ranh giới tiết khí (< 12 giờ)
} {
  const birthJD = jdFromCivilDateTime(day, month, year, hour, minute, 0, timeZone);

  // Lấy các Tiết lệnh (12 Major Terms) của năm trước, năm hiện tại và năm sau
  const majorTerms: Array<{ name: string; branch: string; branchIndex: number; jd: number }> = [];

  for (const y of [year - 1, year, year + 1]) {
    for (const info of SOLAR_TERMS_INFO) {
      if (!info.isMajor) continue;
      let approxJD = getApproximateSolarTermJD(y, info.deg);
      if (info.deg === 285) {
        approxJD = jdFromCivilDateTime(6, 1, y, 0, 0, 0, 0);
      }
      const exactJD = findSolarTermInstantJD(info.deg, approxJD);
      majorTerms.push({
        name: info.name,
        branch: info.branch,
        branchIndex: info.branchIndex,
        jd: exactJD
      });
    }
  }

  // Sắp xếp tăng dần theo JD
  majorTerms.sort((a, b) => a.jd - b.jd);

  // Tìm Tiết lệnh gần nhất trước thời điểm sinh
  let prevTerm = majorTerms[0];
  let nextTerm = majorTerms[majorTerms.length - 1];

  for (let i = 0; i < majorTerms.length - 1; i++) {
    if (majorTerms[i].jd <= birthJD && birthJD < majorTerms[i + 1].jd) {
      prevTerm = majorTerms[i];
      nextTerm = majorTerms[i + 1];
      break;
    }
  }

  const prevTermDate = civilDateTimeFromJD(prevTerm.jd, timeZone);
  const timeToPrevHours = (birthJD - prevTerm.jd) * 24;
  const timeToNextHours = (nextTerm.jd - birthJD) * 24;
  const isNearTermBoundary = timeToPrevHours < 12 || timeToNextHours < 12;

  return {
    monthBranch: prevTerm.branch,
    monthBranchIndex: prevTerm.branchIndex,
    currentTermName: prevTerm.name,
    currentTermDate: {
      day: prevTermDate.day,
      month: prevTermDate.month,
      year: prevTermDate.year,
      hour: prevTermDate.hour,
      minute: prevTermDate.minute
    },
    prevMajorTermJD: prevTerm.jd,
    nextMajorTermJD: nextTerm.jd,
    prevMajorTermName: prevTerm.name,
    nextMajorTermName: nextTerm.name,
    birthJD,
    isNearTermBoundary
  };
}

/**
 * Tính số tuổi và thời điểm khởi Đại Vận từ khoảng cách thời gian tới Tiết Khí
 * Quy ước truyền thống:
 * 3 ngày = 1 năm (12 tháng)
 * 1 ngày = 4 tháng (120 ngày)
 * 1 giờ = 5 ngày
 * 12 phút = 1 ngày
 */
export function calculateLuckCycleInception(
  birthJD: number,
  targetTermJD: number,
  birthYear: number
): {
  years: number;
  months: number;
  days: number;
  startAge: number; // Tuổi mụ hoặc tuổi thực khởi vận (làm tròn số nguyên hoặc số thập phân)
  calendarYearStart: number;
  directionDescription: string;
} {
  const diffDays = Math.abs(targetTermJD - birthJD);

  // 3 ngày = 1 năm => 1 ngày = 1/3 năm
  const totalYears = diffDays / 3;
  const years = Math.floor(totalYears);
  const remDays = (totalYears - years) * 3; // số ngày dư

  // 1 ngày dư = 4 tháng
  const totalMonths = remDays * 4;
  const months = Math.floor(totalMonths);
  const remFraction = (totalMonths - months) / 4; // phần ngày còn lại

  // 1 ngày = 30 ngày dương lịch
  const days = Math.round(remFraction * 30);

  // Tuổi khởi vận tiêu chuẩn trong Bát Tự thường hiển thị từ 1 đến 10
  const startAge = Math.max(1, Math.min(10, Math.round(totalYears) || 1));
  const calendarYearStart = birthYear + Math.round(totalYears);

  return {
    years,
    months,
    days,
    startAge,
    calendarYearStart,
    directionDescription: `${years} tuổi ${months} tháng ${days} ngày`
  };
}
