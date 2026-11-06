/**
 * BỘ MÁY LẬP LÁ SỐ TỬ VI ĐẨU SỐ TOÀN THƯ
 * Căn cứ: Tử Vi Đẩu Số Toàn Thư (Hi Di Trần Đoàn - Vũ Tài Lục dịch và chú giải)
 * Tính toán thuần túy toán học, độc lập, có thể kiểm thử hồi quy 100%.
 */

import {
  CAN,
  CHI,
  NAP_AM,
  getFullLunarInfo,
  LunarDate
} from './lunar';

export type Brightness = 'M' | 'V' | 'Đ' | 'B' | 'H'; // Miếu, Vượng, Đắc, Bình, Hãm
export type StarType = 'CHINH_TINH' | 'LUC_CAT' | 'LUC_SAT' | 'TU_HOA' | 'THAI_TUE' | 'TRANG_SINH' | 'BAC_SY' | 'PHU_TINH';
export type ElementType = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export interface Star {
  id: string;
  name: string;
  element: ElementType;
  type: StarType;
  brightness?: Brightness;
  meaning?: string;
  isGood?: boolean;
}

export interface Palace {
  index: number;          // 0 = Tý, 1 = Sửu, ... 11 = Hợi
  chi: string;            // 'Tý', 'Sửu', ...
  can: string;            // 'Giáp', 'Ất', ...
  name: string;           // 'Mệnh', 'Phụ Mẫu', ...
  isMenh: boolean;
  isThan: boolean;
  daiHanAge: number;      // Tuổi bắt đầu đại hạn
  tieuHanChi: string;     // Chi của năm lưu tiểu hạn
  chinhTinh: Star[];
  phuTinhTot: Star[];
  phuTinhXau: Star[];
  vongTrangSinh: string;
  vongBacSy: string;
  vongThaiTue: string;
  hasTuan: boolean;
  hasTriet: boolean;
  tamHopIndices: number[]; // 2 cung tam hợp
  xungChieuIndex: number;  // 1 cung đối
  nhiHopIndex: number;     // 1 cung nhị hợp
}

export interface TuViChart {
  profile: {
    name: string;
    gender: 'Nam' | 'Nữ';
    solarDate: string;
    solarTime: string;
    lunarDate: LunarDate;
    timeZone: number;
    birthPlace?: string;
    timeAccuracy?: string;
  };
  cuc: {
    name: string;
    number: number;
    element: ElementType;
  };
  menhNguHanh: {
    name: string;
    element: ElementType;
  };
  amDuongNamNu: 'Dương Nam' | 'Âm Nam' | 'Dương Nữ' | 'Âm Nữ';
  menhChu: string;
  thanChu: string;
  palaces: Palace[]; // 12 cung từ Tý đến Hợi
  menhPalaceIndex: number;
  thanPalaceIndex: number;
  tuanPalaces: number[];
  trietPalaces: number[];
  highlights: string[];
}

// Bảng Miếu Vượng Đắc Bình Hãm của 14 Chính Tinh theo 12 Cung (Tý=0 đến Hợi=11)
// Căn cứ: Tử Vi Đẩu Số Toàn Thư - Vũ Tài Lục, Chương Vị Trí Miếu Hãm
export const CHINH_TINH_BRIGHTNESS: Record<string, Brightness[]> = {
  //                  Tý   Sửu  Dần  Mão  Thìn  Tị   Ngọ  Mùi  Thân Dậu  Tuất Hợi
  'Tử Vi':           ['B', 'Đ', 'M', 'B', 'V', 'Đ', 'M', 'Đ', 'V', 'B', 'V', 'B'],
  'Liêm Trinh':      ['B', 'Đ', 'V', 'H', 'V', 'H', 'B', 'Đ', 'V', 'H', 'M', 'H'],
  'Thiên Đồng':      ['V', 'H', 'Đ', 'B', 'H', 'H', 'H', 'H', 'B', 'H', 'Đ', 'V'],
  'Vũ Khúc':         ['V', 'M', 'V', 'Đ', 'M', 'B', 'V', 'M', 'V', 'Đ', 'M', 'B'],
  'Thái Dương':      ['H', 'H', 'V', 'M', 'M', 'V', 'M', 'Đ', 'B', 'B', 'H', 'H'],
  'Thiên Cơ':        ['M', 'Đ', 'V', 'M', 'B', 'B', 'M', 'Đ', 'V', 'M', 'B', 'B'],
  'Thiên Phủ':       ['M', 'M', 'M', 'B', 'M', 'Đ', 'V', 'M', 'M', 'B', 'M', 'Đ'],
  'Thái Âm':         ['V', 'Đ', 'B', 'H', 'H', 'H', 'H', 'B', 'B', 'M', 'M', 'M'],
  'Tham Lang':       ['H', 'M', 'B', 'H', 'M', 'H', 'H', 'M', 'B', 'H', 'M', 'H'],
  'Cự Môn':          ['B', 'H', 'M', 'M', 'H', 'H', 'V', 'H', 'M', 'M', 'H', 'H'],
  'Thiên Tướng':     ['V', 'M', 'M', 'H', 'V', 'Đ', 'V', 'M', 'M', 'H', 'V', 'Đ'],
  'Thiên Lương':     ['V', 'V', 'M', 'M', 'V', 'H', 'M', 'V', 'H', 'H', 'V', 'H'],
  'Thất Sát':        ['M', 'M', 'M', 'H', 'M', 'B', 'M', 'M', 'M', 'H', 'M', 'B'],
  'Phá Quân':        ['M', 'V', 'H', 'H', 'M', 'B', 'M', 'V', 'H', 'H', 'M', 'B'],
};

// Ngũ hành của 14 Chính Tinh
export const CHINH_TINH_ELEMENTS: Record<string, ElementType> = {
  'Tử Vi': 'Thổ',
  'Liêm Trinh': 'Hỏa',
  'Thiên Đồng': 'Thủy',
  'Vũ Khúc': 'Kim',
  'Thái Dương': 'Hỏa',
  'Thiên Cơ': 'Mộc',
  'Thiên Phủ': 'Thổ',
  'Thái Âm': 'Thủy',
  'Tham Lang': 'Thủy',
  'Cự Môn': 'Thủy',
  'Thiên Tướng': 'Thủy',
  'Thiên Lương': 'Thổ',
  'Thất Sát': 'Kim',
  'Phá Quân': 'Thủy'
};

// Bảng An Sao Tử Vi theo Cục và Ngày sinh (1 đến 30)
// Kết quả là vị trí Địa Chi (0 = Tý, 1 = Sửu, ... 11 = Hợi)
// Căn cứ chuẩn Toàn Thư Trần Đoàn
const TU_VI_TABLE: Record<number, number[]> = {
  // Thủy Nhị Cục (2)
  2: [
    1, 2, 2, 3, 3, 4, 4, 5, 5, 6,
    6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
    11, 0, 0, 1, 1, 2, 2, 3, 3, 4
  ],
  // Mộc Tam Cục (3)
  3: [
    4, 1, 2, 2, 3, 3, 5, 2, 3, 3,
    4, 4, 6, 3, 4, 4, 5, 5, 7, 4,
    5, 5, 6, 6, 8, 5, 6, 6, 7, 7
  ],
  // Kim Tứ Cục (4)
  4: [
    11, 4, 1, 2, 2, 3, 0, 5, 2, 3,
    3, 4, 1, 6, 3, 4, 4, 5, 2, 7,
    4, 5, 5, 6, 3, 8, 5, 6, 6, 7
  ],
  // Thổ Ngũ Cục (5)
  5: [
    6, 11, 4, 1, 2, 7, 0, 5, 2, 3,
    8, 1, 6, 3, 4, 9, 2, 7, 4, 5,
    10, 3, 8, 5, 6, 11, 4, 9, 6, 7
  ],
  // Hỏa Lục Cục (6)
  6: [
    9, 6, 11, 4, 1, 2, 10, 7, 0, 5,
    2, 3, 11, 8, 1, 6, 3, 4, 0, 9,
    2, 7, 4, 5, 1, 10, 3, 8, 5, 6
  ]
};

// Tứ Hóa theo Can Năm
// Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ
export const TU_HOA_TABLE: Record<string, { loc: string; quyen: string; khoa: string; ky: string }> = {
  'Giáp': { loc: 'Liêm Trinh', quyen: 'Phá Quân', khoa: 'Vũ Khúc', ky: 'Thái Dương' },
  'Ất':   { loc: 'Thiên Cơ', quyen: 'Thiên Lương', khoa: 'Tử Vi', ky: 'Thái Âm' },
  'Bính': { loc: 'Thiên Đồng', quyen: 'Thiên Cơ', khoa: 'Văn Xương', ky: 'Liêm Trinh' },
  'Đinh': { loc: 'Thái Âm', quyen: 'Thiên Đồng', khoa: 'Thiên Cơ', ky: 'Cự Môn' },
  'Mậu':  { loc: 'Tham Lang', quyen: 'Thái Âm', khoa: 'Hữu Bật', ky: 'Thiên Cơ' },
  'Kỷ':   { loc: 'Vũ Khúc', quyen: 'Tham Lang', khoa: 'Thiên Lương', ky: 'Văn Khúc' },
  'Canh': { loc: 'Thái Dương', quyen: 'Vũ Khúc', khoa: 'Thái Âm', ky: 'Thiên Đồng' }, // Dị bản: Đồng/Tướng
  'Tân':  { loc: 'Cự Môn', quyen: 'Thái Dương', khoa: 'Văn Khúc', ky: 'Văn Xương' },
  'Nhâm': { loc: 'Thiên Lương', quyen: 'Tử Vi', khoa: 'Tả Phù', ky: 'Vũ Khúc' },
  'Quý':  { loc: 'Phá Quân', quyen: 'Cự Môn', khoa: 'Thái Âm', ky: 'Tham Lang' },
};

// Vị trí Lộc Tồn theo Can Năm
const LOC_TON_POS: Record<string, number> = {
  'Giáp': 2, // Dần
  'Ất': 3,   // Mão
  'Bính': 5, // Tị
  'Đinh': 6, // Ngọ
  'Mậu': 5,  // Tị
  'Kỷ': 6,   // Ngọ
  'Canh': 8, // Thân
  'Tân': 9,  // Dậu
  'Nhâm': 11,// Hợi
  'Quý': 0   // Tý
};

// Vị trí Thiên Khôi - Thiên Việt theo Can Năm
const KHOI_VIET_POS: Record<string, { khoi: number; viet: number }> = {
  'Giáp': { khoi: 1, viet: 7 }, // Sửu - Mùi
  'Ất':   { khoi: 0, viet: 8 }, // Tý - Thân
  'Bính': { khoi: 11, viet: 9 },// Hợi - Dậu
  'Đinh': { khoi: 11, viet: 9 },// Hợi - Dậu
  'Mậu':  { khoi: 1, viet: 7 }, // Sửu - Mùi
  'Kỷ':   { khoi: 0, viet: 8 }, // Tý - Thân
  'Canh': { khoi: 6, viet: 2 }, // Ngọ - Dần
  'Tân':  { khoi: 6, viet: 2 }, // Ngọ - Dần
  'Nhâm': { khoi: 3, viet: 5 }, // Mão - Tị
  'Quý':  { khoi: 3, viet: 5 }  // Mão - Tị
};

// 12 Sao Vòng Thái Tuế
const VONG_THAI_TUE = [
  'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm',
  'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức',
  'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'
];

// 12 Sao Vòng Bác Sỹ (khởi từ Lộc Tồn)
const VONG_BAC_SY = [
  'Bác Sỹ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao',
  'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần',
  'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'
];

// 12 Sao Vòng Tràng Sinh
const VONG_TRANG_SINH = [
  'Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan',
  'Đế Vượng', 'Suy', 'Bệnh', 'Tử',
  'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
];

// Khởi Tràng Sinh theo Cục
const TRANG_SINH_START: Record<number, number> = {
  2: 8,  // Thủy nhị cục: Thân
  3: 11, // Mộc tam cục: Hợi
  4: 5,  // Kim tứ cục: Tị
  5: 8,  // Thổ ngũ cục: Thân
  6: 2   // Hỏa lục cục: Dần
};

// Cung Mệnh theo Âm Dương của Can năm
export function isDuongYear(canYear: string): boolean {
  return ['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm'].includes(canYear);
}

// 12 Cung chức danh truyền thống
const PALACE_NAMES = [
  'Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch',
  'Quan Lộc', 'Nô Bộc', 'Thiên Di', 'Tật Ách',
  'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'
];

/**
 * Tính Cục dựa vào Can năm sinh và vị trí Cung Mệnh
 */
export function determineCuc(canYear: string, menhChiIndex: number): { name: string; number: number; element: ElementType } {
  // Lấy can của cung Dần từ can năm sinh
  let startCanIndex = 0;
  switch (canYear) {
    case 'Giáp': case 'Kỷ': startCanIndex = 2; break; // Bính
    case 'Ất': case 'Canh': startCanIndex = 4; break; // Mậu
    case 'Bính': case 'Tân': startCanIndex = 6; break; // Canh
    case 'Đinh': case 'Nhâm': startCanIndex = 8; break; // Nhâm
    case 'Mậu': case 'Quý': startCanIndex = 0; break; // Giáp
  }
  // Can của cung Mệnh: từ Dần (index 2)
  const stepsFromDan = (menhChiIndex - 2 + 12) % 12;
  const canMenhIndex = (startCanIndex + stepsFromDan) % 10;
  const canMenh = CAN[canMenhIndex];
  const chiMenh = CHI[menhChiIndex];
  const hoaGiapName = `${canMenh} ${chiMenh}`;
  const napAm = NAP_AM[hoaGiapName];

  if (!napAm) {
    return { name: 'Thủy Nhị Cục', number: 2, element: 'Thủy' };
  }

  switch (napAm.element) {
    case 'Thủy': return { name: 'Thủy Nhị Cục', number: 2, element: 'Thủy' };
    case 'Mộc':  return { name: 'Mộc Tam Cục', number: 3, element: 'Mộc' };
    case 'Kim':  return { name: 'Kim Tứ Cục', number: 4, element: 'Kim' };
    case 'Thổ':  return { name: 'Thổ Ngũ Cục', number: 5, element: 'Thổ' };
    case 'Hỏa':  return { name: 'Hỏa Lục Cục', number: 6, element: 'Hỏa' };
  }
}

/**
 * Tính Mệnh Chủ và Thân Chủ
 */
export function getMenhChuThanChu(chiYear: string): { menhChu: string; thanChu: string } {
  const menhChuMap: Record<string, string> = {
    'Tý': 'Tham Lang', 'Sửu': 'Cự Môn', 'Dần': 'Lộc Tồn', 'Mão': 'Văn Khúc',
    'Thìn': 'Liêm Trinh', 'Tị': 'Vũ Khúc', 'Ngọ': 'Phá Quân', 'Mùi': 'Vũ Khúc',
    'Thân': 'Liêm Trinh', 'Dậu': 'Văn Khúc', 'Tuất': 'Lộc Tồn', 'Hợi': 'Cự Môn'
  };

  const thanChuMap: Record<string, string> = {
    'Tý': 'Linh Tinh', 'Sửu': 'Thiên Tướng', 'Dần': 'Thiên Lương', 'Mão': 'Thiên Đồng',
    'Thìn': 'Văn Xương', 'Tị': 'Thiên Cơ', 'Ngọ': 'Hỏa Tinh', 'Mùi': 'Thiên Tướng',
    'Thân': 'Thiên Lương', 'Dậu': 'Thiên Đồng', 'Tuất': 'Văn Xương', 'Hợi': 'Thiên Cơ'
  };

  return {
    menhChu: menhChuMap[chiYear] || 'Tử Vi',
    thanChu: thanChuMap[chiYear] || 'Thiên Tướng'
  };
}

/**
 * Xác định vị trí Tuần Không và Triệt Không
 */
export function getTuanTriet(canYear: string, chiYear: string): { tuan: number[]; triet: number[] } {
  // Triệt Không theo Can năm:
  // Giáp, Kỷ: Thân - Dậu (8, 9)
  // Ất, Canh: Ngọ - Mùi (6, 7)
  // Bính, Tân: Thìn - Tị (4, 5)
  // Đinh, Nhâm: Dần - Mão (2, 3)
  // Mậu, Quý: Tý - Sửu (0, 1)
  let triet: number[] = [];
  switch (canYear) {
    case 'Giáp': case 'Kỷ': triet = [8, 9]; break;
    case 'Ất': case 'Canh': triet = [6, 7]; break;
    case 'Bính': case 'Tân': triet = [4, 5]; break;
    case 'Đinh': case 'Nhâm': triet = [2, 3]; break;
    case 'Mậu': case 'Quý': triet = [0, 1]; break;
  }

  // Tuần Không theo Tuần Giáp:
  // Tìm hiệu giữa Can index và Chi index
  const canIdx = CAN.indexOf(canYear as any);
  const chiIdx = CHI.indexOf(chiYear as any);
  // Cung Giáp = (chiIdx - canIdx + 12) % 12
  const giapChiIdx = (chiIdx - canIdx + 12) % 12;
  // Hai cung trống trước cung Giáp là Tuần Không:
  // Tuần Không ở (giapChiIdx + 10) % 12 và (giapChiIdx + 11) % 12
  const tuan = [(giapChiIdx + 10) % 12, (giapChiIdx + 11) % 12];

  return { tuan, triet };
}

/**
 * HÀM CỐT LÕI: TÍNH TOÁN TOÀN BỘ LÁ SỐ TỬ VI
 */
export function calculateTuViChart(
  name: string,
  gender: 'Nam' | 'Nữ',
  solarDay: number,
  solarMonth: number,
  solarYear: number,
  hour: number,
  minute = 0,
  timeZone = 7,
  birthPlace = 'Việt Nam',
  timeAccuracy = 'Chính xác'
): TuViChart {
  const lunar = getFullLunarInfo(solarDay, solarMonth, solarYear, hour, minute);
  const hourChiIdx = CHI.indexOf(lunar.chiHour as any);
  const yearChiIdx = CHI.indexOf(lunar.chiYear as any);
  const isYearDuong = isDuongYear(lunar.canYear);

  // Âm Dương Nam Nữ:
  // Dương Nam, Âm Nữ: Đi thuận
  // Âm Nam, Dương Nữ: Đi nghịch
  const isThuan = (gender === 'Nam' && isYearDuong) || (gender === 'Nữ' && !isYearDuong);
  const amDuongNamNu = isYearDuong
    ? (gender === 'Nam' ? 'Dương Nam' : 'Dương Nữ')
    : (gender === 'Nam' ? 'Âm Nam' : 'Âm Nữ');

  // 1. Tìm vị trí Cung Mệnh và Cung Thân
  // Khởi từ Dần (index 2) là tháng 1:
  // Cung Mệnh: Thuận đến tháng sinh, nghịch đến giờ sinh
  const menhPalaceIndex = (2 + (lunar.month - 1) - hourChiIdx + 12) % 12;
  // Cung Thân: Thuận đến tháng sinh, thuận đến giờ sinh
  const thanPalaceIndex = (2 + (lunar.month - 1) + hourChiIdx) % 12;

  // 2. Xác định Cục
  const cuc = determineCuc(lunar.canYear, menhPalaceIndex);

  // 3. Mệnh Chủ và Thân Chủ
  const { menhChu, thanChu } = getMenhChuThanChu(lunar.chiYear);

  // 4. Tuần & Triệt
  const { tuan, triet } = getTuanTriet(lunar.canYear, lunar.chiYear);

  // 5. Khởi tạo 12 Cung
  const palaces: Palace[] = [];
  // Can khởi từ Dần
  let startCanIndex = 0;
  switch (lunar.canYear) {
    case 'Giáp': case 'Kỷ': startCanIndex = 2; break;
    case 'Ất': case 'Canh': startCanIndex = 4; break;
    case 'Bính': case 'Tân': startCanIndex = 6; break;
    case 'Đinh': case 'Nhâm': startCanIndex = 8; break;
    case 'Mậu': case 'Quý': startCanIndex = 0; break;
  }

  // Khởi Tiểu Hạn theo Chi năm sinh:
  // Dần Ngọ Tuất khởi Thìn (4), Thân Tý Thìn khởi Tuất (10), Tị Dậu Sửu khởi Mùi (7), Hợi Mão Mùi khởi Sửu (1)
  let tieuHanStart = 4;
  if ([2, 6, 10].includes(yearChiIdx)) tieuHanStart = 4;
  else if ([8, 0, 4].includes(yearChiIdx)) tieuHanStart = 10;
  else if ([5, 9, 1].includes(yearChiIdx)) tieuHanStart = 7;
  else tieuHanStart = 1;

  for (let i = 0; i < 12; i++) {
    // Can của cung i (i tính từ 0=Tý)
    const stepsFromDan = (i - 2 + 12) % 12;
    const canIndex = (startCanIndex + stepsFromDan) % 10;
    const canCung = CAN[canIndex];
    const chiCung = CHI[i];

    // Cung chức năng: Mệnh tại menhPalaceIndex, Phụ Mẫu tại +1,...
    const palaceNameIndex = (i - menhPalaceIndex + 12) % 12;
    const nameCung = PALACE_NAMES[palaceNameIndex];

    // Đại Hạn: Bắt đầu từ số Cục tại cung Mệnh
    // Nếu đi thuận: cung i cách Mệnh bước = (i - menhPalaceIndex + 12) % 12
    // Nếu đi nghịch: cung i cách Mệnh bước = (menhPalaceIndex - i + 12) % 12
    const daiHanStep = isThuan
      ? (i - menhPalaceIndex + 12) % 12
      : (menhPalaceIndex - i + 12) % 12;
    const daiHanAge = cuc.number + daiHanStep * 10;

    // Tiểu Hạn: Nam thuận Nữ nghịch
    const tieuHanStep = gender === 'Nam'
      ? (i - tieuHanStart + 12) % 12
      : (tieuHanStart - i + 12) % 12;
    const tieuHanChi = CHI[(yearChiIdx + tieuHanStep) % 12];

    // Tam hợp: Chi cách nhau 4 vị trí (i + 4) % 12 và (i + 8) % 12
    const tamHopIndices = [(i + 4) % 12, (i + 8) % 12];
    // Xung chiếu: Đối diện cách 6 vị trí
    const xungChieuIndex = (i + 6) % 12;
    // Nhị hợp: Tý - Sửu (0-1), Dần - Hợi (2-11), Mão - Tuất (3-10), Thìn - Dậu (4-9), Tị - Thân (5-8), Ngọ - Mùi (6-7)
    const nhiHopMap: Record<number, number> = {
      0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6
    };
    const nhiHopIndex = nhiHopMap[i];

    palaces.push({
      index: i,
      chi: chiCung,
      can: canCung,
      name: nameCung,
      isMenh: i === menhPalaceIndex,
      isThan: i === thanPalaceIndex,
      daiHanAge,
      tieuHanChi,
      chinhTinh: [],
      phuTinhTot: [],
      phuTinhXau: [],
      vongTrangSinh: '',
      vongBacSy: '',
      vongThaiTue: '',
      hasTuan: tuan.includes(i),
      hasTriet: triet.includes(i),
      tamHopIndices,
      xungChieuIndex,
      nhiHopIndex
    });
  }

  // 6. An sao Tử Vi
  const tuViDayIdx = Math.min(Math.max(lunar.day, 1), 30) - 1;
  const tuViPos = TU_VI_TABLE[cuc.number][tuViDayIdx];

  // 7. An hệ Tử Vi (nghịch hành)
  const heTuVi = [
    { name: 'Tử Vi', pos: tuViPos },
    { name: 'Thiên Cơ', pos: (tuViPos - 1 + 12) % 12 },
    { name: 'Thái Dương', pos: (tuViPos - 3 + 12) % 12 },
    { name: 'Vũ Khúc', pos: (tuViPos - 4 + 12) % 12 },
    { name: 'Thiên Đồng', pos: (tuViPos - 5 + 12) % 12 },
    { name: 'Liêm Trinh', pos: (tuViPos - 8 + 12) % 12 },
  ];

  // 8. An hệ Thiên Phủ (đối xứng trục Dần - Thân: TP = (4 - TV + 12) % 12)
  const thienPhuPos = (4 - tuViPos + 12) % 12;
  const heThienPhu = [
    { name: 'Thiên Phủ', pos: thienPhuPos },
    { name: 'Thái Âm', pos: (thienPhuPos + 1) % 12 },
    { name: 'Tham Lang', pos: (thienPhuPos + 2) % 12 },
    { name: 'Cự Môn', pos: (thienPhuPos + 3) % 12 },
    { name: 'Thiên Tướng', pos: (thienPhuPos + 4) % 12 },
    { name: 'Thiên Lương', pos: (thienPhuPos + 5) % 12 },
    { name: 'Thất Sát', pos: (thienPhuPos + 6) % 12 },
    { name: 'Phá Quân', pos: (thienPhuPos + 10) % 12 },
  ];

  // Đưa 14 Chính Tinh vào Cung
  [...heTuVi, ...heThienPhu].forEach(s => {
    const brightness = CHINH_TINH_BRIGHTNESS[s.name][s.pos];
    const element = CHINH_TINH_ELEMENTS[s.name];
    palaces[s.pos].chinhTinh.push({
      id: s.name,
      name: s.name,
      element,
      type: 'CHINH_TINH',
      brightness,
      isGood: true
    });
  });

  // 9. An Tứ Hóa
  const tuHoa = TU_HOA_TABLE[lunar.canYear];
  if (tuHoa) {
    const hoaStars = [
      { name: 'Hóa Lộc', starTarget: tuHoa.loc, isGood: true, element: 'Mộc' as ElementType },
      { name: 'Hóa Quyền', starTarget: tuHoa.quyen, isGood: true, element: 'Mộc' as ElementType },
      { name: 'Hóa Khoa', starTarget: tuHoa.khoa, isGood: true, element: 'Thủy' as ElementType },
      { name: 'Hóa Kỵ', starTarget: tuHoa.ky, isGood: false, element: 'Thủy' as ElementType },
    ];
    hoaStars.forEach(h => {
      // Tìm cung có sao đích
      for (const p of palaces) {
        if (p.chinhTinh.some(st => st.name === h.starTarget)) {
          const starObj: Star = {
            id: h.name,
            name: `${h.name} (${h.starTarget})`,
            element: h.element,
            type: 'TU_HOA',
            isGood: h.isGood
          };
          if (h.isGood) {
            p.phuTinhTot.push(starObj);
          } else {
            p.phuTinhXau.push(starObj);
          }
          break;
        }
      }
    });
  }

  // 10. Lục Cát Tinh
  // Tả Phù: Thìn (4) thuận tháng
  const taPhuPos = (4 + (lunar.month - 1)) % 12;
  palaces[taPhuPos].phuTinhTot.push({ id: 'TaPhu', name: 'Tả Phù', element: 'Thổ', type: 'LUC_CAT', isGood: true });

  // Hữu Bật: Tuất (10) nghịch tháng
  const huuBatPos = (10 - (lunar.month - 1) + 12) % 12;
  palaces[huuBatPos].phuTinhTot.push({ id: 'HuuBat', name: 'Hữu Bật', element: 'Thổ', type: 'LUC_CAT', isGood: true });

  // Văn Xương: Tuất (10) nghịch giờ
  const vanXuongPos = (10 - hourChiIdx + 12) % 12;
  palaces[vanXuongPos].phuTinhTot.push({ id: 'VanXuong', name: 'Văn Xương', element: 'Kim', type: 'LUC_CAT', isGood: true });

  // Văn Khúc: Thìn (4) thuận giờ
  const vanKhucPos = (4 + hourChiIdx) % 12;
  palaces[vanKhucPos].phuTinhTot.push({ id: 'VanKhuc', name: 'Văn Khúc', element: 'Thủy', type: 'LUC_CAT', isGood: true });

  // Thiên Khôi & Thiên Việt
  const khoiViet = KHOI_VIET_POS[lunar.canYear];
  if (khoiViet) {
    palaces[khoiViet.khoi].phuTinhTot.push({ id: 'ThienKhoi', name: 'Thiên Khôi', element: 'Hỏa', type: 'LUC_CAT', isGood: true });
    palaces[khoiViet.viet].phuTinhTot.push({ id: 'ThienViet', name: 'Thiên Việt', element: 'Hỏa', type: 'LUC_CAT', isGood: true });
  }

  // 11. Lục Sát Tinh
  // Lộc Tồn:
  const locTonPos = LOC_TON_POS[lunar.canYear];
  palaces[locTonPos].phuTinhTot.push({ id: 'LocTon', name: 'Lộc Tồn', element: 'Thổ', type: 'BAC_SY', isGood: true });

  // Kình Dương: Tiền Kình (trước Lộc Tồn 1 cung)
  const kinhDuongPos = (locTonPos + 1) % 12;
  palaces[kinhDuongPos].phuTinhXau.push({ id: 'KinhDuong', name: 'Kình Dương', element: 'Kim', type: 'LUC_SAT', isGood: false, brightness: ['Thìn', 'Tuất', 'Sửu', 'Mùi'].includes(CHI[kinhDuongPos]) ? 'Đ' : 'H' });

  // Đà La: Hậu Đà (sau Lộc Tồn 1 cung)
  const daLaPos = (locTonPos - 1 + 12) % 12;
  palaces[daLaPos].phuTinhXau.push({ id: 'DaLa', name: 'Đà La', element: 'Kim', type: 'LUC_SAT', isGood: false, brightness: ['Thìn', 'Tuất', 'Sửu', 'Mùi'].includes(CHI[daLaPos]) ? 'Đ' : 'H' });

  // Địa Không & Địa Kiếp: khởi từ Hợi (11)
  const diaKiepPos = (11 + hourChiIdx) % 12;
  palaces[diaKiepPos].phuTinhXau.push({ id: 'DiaKiep', name: 'Địa Kiếp', element: 'Hỏa', type: 'LUC_SAT', isGood: false, brightness: ['Tị', 'Hợi', 'Dần', 'Thân'].includes(CHI[diaKiepPos]) ? 'Đ' : 'H' });

  const diaKhongPos = (11 - hourChiIdx + 12) % 12;
  palaces[diaKhongPos].phuTinhXau.push({ id: 'DiaKhong', name: 'Địa Không', element: 'Hỏa', type: 'LUC_SAT', isGood: false, brightness: ['Tị', 'Hợi', 'Dần', 'Thân'].includes(CHI[diaKhongPos]) ? 'Đ' : 'H' });

  // Hỏa Tinh & Linh Tinh:
  // Dần Ngọ Tuất khởi Sửu (Hỏa tinh thuận, Linh tinh nghịch)
  // Thân Tý Thìn khởi Dần (Hỏa tinh thuận, Linh tinh nghịch)
  // Tị Dậu Sửu khởi Mão
  // Hợi Mão Mùi khởi Dậu
  let hoaTinhStart = 1;
  let linhTinhStart = 3;
  if ([2, 6, 10].includes(yearChiIdx)) { // Dần Ngọ Tuất
    hoaTinhStart = 1; linhTinhStart = 3; // Sửu, Mão
  } else if ([8, 0, 4].includes(yearChiIdx)) { // Thân Tý Thìn
    hoaTinhStart = 2; linhTinhStart = 10; // Dần, Tuất
  } else if ([5, 9, 1].includes(yearChiIdx)) { // Tị Dậu Sửu
    hoaTinhStart = 3; linhTinhStart = 10; // Mão, Tuất
  } else { // Hợi Mão Mùi
    hoaTinhStart = 9; linhTinhStart = 10; // Dậu, Tuất
  }

  const hoaTinhPos = (hoaTinhStart + hourChiIdx) % 12;
  palaces[hoaTinhPos].phuTinhXau.push({ id: 'HoaTinh', name: 'Hỏa Tinh', element: 'Hỏa', type: 'LUC_SAT', isGood: false });

  const linhTinhPos = (linhTinhStart - hourChiIdx + 12) % 12;
  palaces[linhTinhPos].phuTinhXau.push({ id: 'LinhTinh', name: 'Linh Tinh', element: 'Hỏa', type: 'LUC_SAT', isGood: false });

  // 12. Vòng Thái Tuế (khởi từ Chi năm)
  for (let k = 0; k < 12; k++) {
    const pos = (yearChiIdx + k) % 12;
    palaces[pos].vongThaiTue = VONG_THAI_TUE[k];
    if (['Thái Tuế', 'Bạch Hổ', 'Quan Phù', 'Tang Môn'].includes(VONG_THAI_TUE[k])) {
      if (['Bạch Hổ', 'Tang Môn'].includes(VONG_THAI_TUE[k])) {
        palaces[pos].phuTinhXau.push({ id: VONG_THAI_TUE[k], name: VONG_THAI_TUE[k], element: 'Kim', type: 'THAI_TUE', isGood: false });
      } else {
        palaces[pos].phuTinhTot.push({ id: VONG_THAI_TUE[k], name: VONG_THAI_TUE[k], element: 'Hỏa', type: 'THAI_TUE', isGood: true });
      }
    }
  }

  // 13. Vòng Bác Sỹ (khởi từ Lộc Tồn, thuận nếu Dương Nam Âm Nữ, nghịch nếu Âm Nam Dương Nữ)
  for (let k = 0; k < 12; k++) {
    const pos = isThuan ? (locTonPos + k) % 12 : (locTonPos - k + 12) % 12;
    palaces[pos].vongBacSy = VONG_BAC_SY[k];
    if (['Thanh Long', 'Tấu Thư', 'Hỷ Thần'].includes(VONG_BAC_SY[k])) {
      palaces[pos].phuTinhTot.push({ id: VONG_BAC_SY[k], name: VONG_BAC_SY[k], element: 'Thủy', type: 'BAC_SY', isGood: true });
    } else if (['Tiểu Hao', 'Đại Hao', 'Phục Binh', 'Bệnh Phù'].includes(VONG_BAC_SY[k])) {
      palaces[pos].phuTinhXau.push({ id: VONG_BAC_SY[k], name: VONG_BAC_SY[k], element: 'Hỏa', type: 'BAC_SY', isGood: false });
    }
  }

  // 14. Vòng Tràng Sinh (khởi theo Cục, thuận nếu Dương Nam Âm Nữ, nghịch nếu Âm Nam Dương Nữ)
  const tsStart = TRANG_SINH_START[cuc.number];
  for (let k = 0; k < 12; k++) {
    const pos = isThuan ? (tsStart + k) % 12 : (tsStart - k + 12) % 12;
    palaces[pos].vongTrangSinh = VONG_TRANG_SINH[k];
  }

  // 15. Các Phụ Tinh Nổi Bật Khác:
  // Thiên Mã (theo Tam Hợp Chi năm):
  // Dần Ngọ Tuất mã tại Thân (8)
  // Thân Tý Thìn mã tại Dần (2)
  // Tị Dậu Sửu mã tại Hợi (11)
  // Hợi Mão Mùi mã tại Tị (5)
  let thienMaPos = 8;
  if ([2, 6, 10].includes(yearChiIdx)) thienMaPos = 8;
  else if ([8, 0, 4].includes(yearChiIdx)) thienMaPos = 2;
  else if ([5, 9, 1].includes(yearChiIdx)) thienMaPos = 11;
  else thienMaPos = 5;
  palaces[thienMaPos].phuTinhTot.push({ id: 'ThienMa', name: 'Thiên Mã', element: 'Hỏa', type: 'PHU_TINH', isGood: true });

  // Đào Hoa (theo Tam Hợp Chi năm):
  // Dần Ngọ Tuất đào tại Mão (3)
  // Thân Tý Thìn đào tại Dậu (9)
  // Tị Dậu Sửu đào tại Ngọ (6)
  // Hợi Mão Mùi đào tại Tý (0)
  let daoHoaPos = 3;
  if ([2, 6, 10].includes(yearChiIdx)) daoHoaPos = 3;
  else if ([8, 0, 4].includes(yearChiIdx)) daoHoaPos = 9;
  else if ([5, 9, 1].includes(yearChiIdx)) daoHoaPos = 6;
  else daoHoaPos = 0;
  palaces[daoHoaPos].phuTinhTot.push({ id: 'DaoHoa', name: 'Đào Hoa', element: 'Mộc', type: 'PHU_TINH', isGood: true });

  // Hồng Loan & Hỷ Thần (Hồng Loan khởi Mão nghịch Chi năm, Hỷ Thần đối xung)
  const hongLoanPos = (3 - yearChiIdx + 12) % 12;
  const thienHyPos = (hongLoanPos + 6) % 12;
  palaces[hongLoanPos].phuTinhTot.push({ id: 'HongLoan', name: 'Hồng Loan', element: 'Thủy', type: 'PHU_TINH', isGood: true });
  palaces[thienHyPos].phuTinhTot.push({ id: 'ThienHy', name: 'Thiên Hỷ', element: 'Thủy', type: 'PHU_TINH', isGood: true });

  // Thiên Khốc & Thiên Hư (Ngọ 6, Khốc nghịch, Hư thuận theo Chi năm)
  const thienKhocPos = (6 - yearChiIdx + 12) % 12;
  const thienHuPos = (6 + yearChiIdx) % 12;
  palaces[thienKhocPos].phuTinhXau.push({ id: 'ThienKhoc', name: 'Thiên Khốc', element: 'Thủy', type: 'PHU_TINH', isGood: false });
  palaces[thienHuPos].phuTinhXau.push({ id: 'ThienHu', name: 'Thiên Hư', element: 'Thủy', type: 'PHU_TINH', isGood: false });

  // Long Trì & Phượng Các (Thìn 4 thuận chi năm Long Trì, Tuất 10 nghịch chi năm Phượng Các)
  const longTriPos = (4 + yearChiIdx) % 12;
  const phuongCacPos = (10 - yearChiIdx + 12) % 12;
  palaces[longTriPos].phuTinhTot.push({ id: 'LongTri', name: 'Long Trì', element: 'Thủy', type: 'PHU_TINH', isGood: true });
  palaces[phuongCacPos].phuTinhTot.push({ id: 'PhuongCac', name: 'Phượng Các', element: 'Mộc', type: 'PHU_TINH', isGood: true });

  // Thiên Hình & Thiên Diêu (Dậu 9 thuận tháng sinh Thiên Hình, Sửu 1 thuận tháng sinh Thiên Diêu)
  const thienHinhPos = (9 + (lunar.month - 1)) % 12;
  const thienDieuPos = (1 + (lunar.month - 1)) % 12;
  palaces[thienHinhPos].phuTinhXau.push({ id: 'ThienHinh', name: 'Thiên Hình', element: 'Hỏa', type: 'PHU_TINH', isGood: false });
  palaces[thienDieuPos].phuTinhXau.push({ id: 'ThienDieu', name: 'Thiên Diêu', element: 'Thủy', type: 'PHU_TINH', isGood: false });

  // Cô Thần & Quả Tú (theo Chi năm)
  // Dần Mão Thìn cô tại Tị (5), quả tại Sửu (1)
  // Tị Ngọ Mùi cô tại Thân (8), quả tại Thìn (4)
  // Thân Dậu Tuất cô tại Hợi (11), quả tại Mùi (7)
  // Hợi Tý Sửu cô tại Dần (2), quả tại Tuất (10)
  let coThanPos = 5;
  let quaTuPos = 1;
  if ([2, 3, 4].includes(yearChiIdx)) { coThanPos = 5; quaTuPos = 1; }
  else if ([5, 6, 7].includes(yearChiIdx)) { coThanPos = 8; quaTuPos = 4; }
  else if ([8, 9, 10].includes(yearChiIdx)) { coThanPos = 11; quaTuPos = 7; }
  else { coThanPos = 2; quaTuPos = 10; }
  palaces[coThanPos].phuTinhXau.push({ id: 'CoThan', name: 'Cô Thần', element: 'Mộc', type: 'PHU_TINH', isGood: false });
  palaces[quaTuPos].phuTinhXau.push({ id: 'QuaTu', name: 'Quả Tú', element: 'Thổ', type: 'PHU_TINH', isGood: false });

  // 16. Phân tích các điểm nhấn Cách Cục
  const highlights: string[] = [];
  const menhPalace = palaces[menhPalaceIndex];
  const menhStars = menhPalace.chinhTinh.map(s => s.name);

  if (menhStars.length === 0) {
    highlights.push('Mệnh Vô Chính Diệu (Không có chính tinh tọa thủ, cần mượn chính tinh cung đối xung Thiên Di)');
  } else {
    if (menhStars.includes('Tử Vi') && menhStars.includes('Thiên Phủ')) {
      highlights.push('Cách Cục Tử Phủ Đồng Cung (Đế tinh hội tụ, chủ phú quý phúc thọ song toàn)');
    }
    if (menhStars.some(s => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(s))) {
      highlights.push('Cách Cục Sát Phá Tham (Chủ tiên phong khai phá, năng động, dám nghĩ dám làm)');
    }
    if (menhStars.some(s => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(s))) {
      highlights.push('Cách Cục Cơ Nguyệt Đồng Lương (Chủ mưu trí, hành chính, học thuật, công chức, ổn định)');
    }
    if (menhStars.includes('Thái Dương') && menhStars.includes('Cự Môn')) {
      highlights.push('Cách Cục Cự Nhật Đồng Cung (Khẩu tài xuất chúng, uy quyền ngoại giao)');
    }
  }

  if (menhPalace.phuTinhTot.some(s => s.name === 'Lộc Tồn') && menhPalace.phuTinhTot.some(s => s.name === 'Thiên Mã')) {
    highlights.push('Cách Cục Lộc Mã Giao Trì (Tài khí dồi dào, phát đạt khi đi xa hoặc kinh doanh buôn bán)');
  }

  if (menhPalace.hasTriet) {
    highlights.push('Mệnh ngộ Triệt Không (Tiền vận trắc trở, hậu vận hanh thông)');
  }
  if (menhPalace.hasTuan) {
    highlights.push('Mệnh ngộ Tuần Không (Chậm mà chắc, nội tâm sâu sắc)');
  }

  const napAmInfo = NAP_AM[`${lunar.canYear} ${lunar.chiYear}`] || { name: 'Chưa rõ', element: 'Thổ' as ElementType };

  return {
    profile: {
      name: name.trim() || 'Vô Danh',
      gender,
      solarDate: `${solarDay.toString().padStart(2, '0')}/${solarMonth.toString().padStart(2, '0')}/${solarYear}`,
      solarTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      lunarDate: lunar,
      timeZone,
      birthPlace,
      timeAccuracy
    },
    cuc,
    menhNguHanh: {
      name: napAmInfo.name,
      element: napAmInfo.element
    },
    amDuongNamNu,
    menhChu,
    thanChu,
    palaces,
    menhPalaceIndex,
    thanPalaceIndex,
    tuanPalaces: tuan,
    trietPalaces: triet,
    highlights
  };
}
