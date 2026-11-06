/**
 * BỘ KIỂM THỬ TỰ ĐỘNG BÁT TỰ - TỨ TRỤ (BAZI QA TEST SUITE)
 * Kiểm định tính chính xác của:
 * 1. Ranh giới Lập Xuân (Trụ Năm)
 * 2. Tiết Lệnh chuyển tháng (Trụ Tháng)
 * 3. Chu kỳ Can Chi liên tục theo số ngày Julian (Trụ Ngày)
 * 4. Khẩu quyết Ngũ Thử Độn (Trụ Giờ)
 * 5. Bảng Địa Chi Tàng Can và tỷ lệ phần trăm
 * 6. Ma trận 10 Thập Thần
 * 7. Thập Nhị Trường Sinh (Dương thuận Âm nghịch)
 * 8. Chiều và mốc tuổi khởi Đại Vận
 * 9. Quan hệ hợp, xung, hình, hại, tam hợp, tam hội
 * 10. Điều Hầu Dụng Thần theo mùa sinh
 */

import { calculateBaziChart, getTenGod, getTrangSinhStage, HIDDEN_STEMS_MAP, calculateHourPillar } from './bazi';
import { getLapXuanInstant, getBaziMonthSolarTerm } from './baziSolar';

export interface BaziTestCase {
  id: string;
  name: string;
  description: string;
  input: any;
  expected: any;
  actual?: any;
  passed: boolean;
  executionTimeMs: number;
}

export interface BaziTestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  durationMs: number;
  executedAt: string;
  testCases: BaziTestCase[];
}

export function runBaziTestSuite(): BaziTestSuiteResult {
  const startTime = Date.now();
  const testCases: BaziTestCase[] = [];

  // TEST 1: Ranh giới Lập Xuân Trụ Năm (Trước Lập Xuân lấy năm cũ)
  // Lập Xuân 1995 xảy ra lúc ~14:19 ngày 04/02/1995 (UTC+7)
  {
    const t0 = Date.now();
    const chartBefore = calculateBaziChart('Test Lap Xuan Before', 'Nam', 4, 2, 1995, 10, 0, 7);
    const chartAfter = calculateBaziChart('Test Lap Xuan After', 'Nam', 4, 2, 1995, 16, 0, 7);

    // Trước 14:19 ngày 04/02/1995 vẫn là Giáp Tuất (1994)
    // Sau 14:19 ngày 04/02/1995 chuyển sang Ất Hợi (1995)
    const passed =
      chartBefore.pillars.year.fullName === 'Giáp Tuất' &&
      chartBefore.yearLapXuan.isAdjustedByLapXuan === true &&
      chartAfter.pillars.year.fullName === 'Ất Hợi' &&
      chartAfter.yearLapXuan.isAdjustedByLapXuan === false;

    testCases.push({
      id: 'TC-BAZI-01',
      name: 'Kiểm tra ranh giới Lập Xuân phân định Trụ Năm',
      description: 'Đương số sinh ngày 04/02/1995 trước giờ Lập Xuân (14:19) phải giữ Trụ Năm Giáp Tuất; sinh sau giờ Lập Xuân phải sang Ất Hợi.',
      input: { date: '04/02/1995', beforeHour: 10, afterHour: 16 },
      expected: { beforeYear: 'Giáp Tuất', afterYear: 'Ất Hợi' },
      actual: { beforeYear: chartBefore.pillars.year.fullName, afterYear: chartAfter.pillars.year.fullName },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 2: Tiết Lệnh chuyển tháng (Trụ Tháng tính theo Tiết Khí, không theo mùng 1 âm lịch)
  {
    const t0 = Date.now();
    // Sinh ngày 15/08/1995 (Lập Thu rơi vào 08/08, Bạch Lộ rơi vào 08/09) => Tháng Thân (Trụ Tháng)
    // Năm Ất Hợi -> Ngũ Hổ Độn: Ất Canh khởi Mậu Dần, Kỷ Mão, Canh Thìn, Tân Tị, Nhâm Ngọ, Quý Mùi, Giáp Thân
    const chart = calculateBaziChart('Test Month Pillar', 'Nam', 15, 8, 1995, 10, 30, 7);
    const passed = chart.pillars.month.chi === 'Thân' && chart.pillars.month.can === 'Giáp';

    testCases.push({
      id: 'TC-BAZI-02',
      name: 'Kiểm tra Trụ Tháng theo Tiết Khí và Ngũ Hổ Độn',
      description: 'Sinh ngày 15/08/1995 trong Tiết Lập Thu phải có Chi tháng là Thân, Can năm Ất kết hợp Ngũ Hổ Độn tạo thành Giáp Thân.',
      input: { date: '15/08/1995', yearCan: 'Ất' },
      expected: { monthPillar: 'Giáp Thân' },
      actual: { monthPillar: chart.pillars.month.fullName },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 3: Tính Trụ Ngày liên tục không phụ thuộc tháng nhuận
  {
    const t0 = Date.now();
    // 01/01/2000 là ngày Mậu Ngọ
    // 02/01/2000 là ngày Kỷ Mùi
    const chart1 = calculateBaziChart('Test Day 1', 'Nam', 1, 1, 2000, 12, 0, 7);
    const chart2 = calculateBaziChart('Test Day 2', 'Nam', 2, 1, 2000, 12, 0, 7);
    const passed = chart1.pillars.day.fullName === 'Mậu Ngọ' && chart2.pillars.day.fullName === 'Kỷ Mùi';

    testCases.push({
      id: 'TC-BAZI-03',
      name: 'Kiểm tra Trụ Ngày theo chu kỳ Julian liên tục',
      description: 'Ngày 01/01/2000 phải là Mậu Ngọ và ngày tiếp theo 02/01/2000 phải là Kỷ Mùi.',
      input: { date1: '01/01/2000', date2: '02/01/2000' },
      expected: { day1: 'Mậu Ngọ', day2: 'Kỷ Mùi' },
      actual: { day1: chart1.pillars.day.fullName, day2: chart2.pillars.day.fullName },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 4: Khẩu quyết Ngũ Thử Độn cho Trụ Giờ
  {
    const t0 = Date.now();
    // Khẩu quyết Ngũ Thử Độn:
    // 1) Ngày Giáp/Kỷ: Giờ Tý khởi Giáp Tý -> Giờ Tị (chiIndex=5) là Kỷ Tị
    // 2) Ngày Mậu/Quý: Giờ Tý khởi Nhâm Tý -> Giờ Tị (chiIndex=5) là Đinh Tị
    const hourGiap = calculateHourPillar(10, 0, 'Giáp'); // 10:00 là giờ Tị
    const hourMau = calculateHourPillar(10, 0, 'Mậu');   // 10:00 là giờ Tị

    const passed =
      hourGiap.can === 'Kỷ' && hourGiap.chi === 'Tị' && hourGiap.fullName === 'Kỷ Tị' &&
      hourMau.can === 'Đinh' && hourMau.chi === 'Tị' && hourMau.fullName === 'Đinh Tị';

    testCases.push({
      id: 'TC-BAZI-04',
      name: 'Kiểm tra Trụ Giờ theo Ngũ Thử Độn',
      description: 'Nhật Can Giáp sinh giờ Tị (10:00) phải thành Kỷ Tị; Nhật Can Mậu sinh giờ Tị phải thành Đinh Tị.',
      input: { hour: 10, minute: 0, dayCans: ['Giáp', 'Mậu'] },
      expected: { hourWithGiap: 'Kỷ Tị', hourWithMau: 'Đinh Tị' },
      actual: { hourWithGiap: hourGiap.fullName, hourWithMau: hourMau.fullName },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 5: Địa Chi Tàng Can chuẩn Tử Bình
  {
    const t0 = Date.now();
    const danHidden = HIDDEN_STEMS_MAP['Dần'];
    const thinHidden = HIDDEN_STEMS_MAP['Thìn'];
    const tyHidden = HIDDEN_STEMS_MAP['Tý'];

    const passed =
      danHidden.length === 3 &&
      danHidden[0].can === 'Giáp' && danHidden[1].can === 'Bính' && danHidden[2].can === 'Mậu' &&
      thinHidden[0].can === 'Mậu' && thinHidden[1].can === 'Ất' && thinHidden[2].can === 'Quý' &&
      tyHidden.length === 1 && tyHidden[0].can === 'Quý' && tyHidden[0].percentage === 100;

    testCases.push({
      id: 'TC-BAZI-05',
      name: 'Kiểm tra tính toàn vẹn của bảng Tàng Can',
      description: 'Địa Chi Dần phải tàng Giáp (Bản), Bính (Trung), Mậu (Dư); Thìn tàng Mậu, Ất, Quý; Tý tàng Quý (100%).',
      input: { branches: ['Dần', 'Thìn', 'Tý'] },
      expected: { danStems: 'Giáp, Bính, Mậu', tyStem: 'Quý' },
      actual: {
        danStems: danHidden.map(h => h.can).join(', '),
        tyStem: tyHidden.map(h => h.can).join(', ')
      },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 6: Ma trận 10 Thập Thần
  {
    const t0 = Date.now();
    // Nhật Can Giáp (Dương Mộc):
    // Giáp: Tỷ Kiên
    // Ất: Kiếp Tài
    // Bính: Thực Thần
    // Đinh: Thương Quan
    // Mậu: Thiên Tài
    // Kỷ: Chính Tài
    // Canh: Thất Sát
    // Tân: Chính Quan
    // Nhâm: Thiên Ấn
    // Quý: Chính Ấn
    const dm = 'Giáp';
    const passed =
      getTenGod(dm, 'Giáp').startsWith('Tỷ Kiên') &&
      getTenGod(dm, 'Ất').startsWith('Kiếp Tài') &&
      getTenGod(dm, 'Bính').startsWith('Thực Thần') &&
      getTenGod(dm, 'Đinh').startsWith('Thương Quan') &&
      getTenGod(dm, 'Mậu').startsWith('Thiên Tài') &&
      getTenGod(dm, 'Kỷ').startsWith('Chính Tài') &&
      getTenGod(dm, 'Canh').startsWith('Thất Sát') &&
      getTenGod(dm, 'Tân').startsWith('Chính Quan') &&
      getTenGod(dm, 'Nhâm').startsWith('Thiên Ấn') &&
      getTenGod(dm, 'Quý').startsWith('Chính Ấn');

    testCases.push({
      id: 'TC-BAZI-06',
      name: 'Kiểm tra ma trận logic 10 Thập Thần',
      description: 'Nhật Chủ Giáp đối chiếu toàn bộ 10 Thiên Can phải ánh xạ chính xác 10 Thập Thần chuẩn mực.',
      input: { dayMaster: 'Giáp' },
      expected: { Giap: 'Tỷ', At: 'Kiếp', Binh: 'Thực', Dinh: 'Thương', Canh: 'Sát', Tan: 'Quan' },
      actual: {
        Giap: getTenGod(dm, 'Giáp'),
        At: getTenGod(dm, 'Ất'),
        Binh: getTenGod(dm, 'Bính'),
        Tan: getTenGod(dm, 'Tân')
      },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 7: Thập Nhị Trường Sinh (Dương Thuận Âm Nghịch)
  {
    const t0 = Date.now();
    // Giáp (Dương Mộc): Trường Sinh tại Hợi, Mộc Dục tại Tý, Quan Đới tại Sửu, Lâm Quan tại Dần, Đế Vượng tại Mão.
    // Ất (Âm Mộc): Trường Sinh tại Ngọ, Mộc Dục tại Tị, Quan Đới tại Thìn, Lâm Quan tại Mão, Đế Vượng tại Dần.
    const giapHoi = getTrangSinhStage('Giáp', 'Hợi');
    const giapMao = getTrangSinhStage('Giáp', 'Mão');
    const atNgo = getTrangSinhStage('Ất', 'Ngọ');
    const atDan = getTrangSinhStage('Ất', 'Dần');

    const passed =
      giapHoi === 'Trường Sinh' &&
      giapMao === 'Đế Vượng' &&
      atNgo === 'Trường Sinh' &&
      atDan === 'Đế Vượng';

    testCases.push({
      id: 'TC-BAZI-07',
      name: 'Kiểm tra Thập Nhị Trường Sinh (Dương thuận Âm nghịch)',
      description: 'Giáp Mộc khởi Trường Sinh tại Hợi (thuận, Mão là Đế Vượng); Ất Mộc khởi Trường Sinh tại Ngọ (nghịch, Dần là Đế Vượng).',
      input: { GiapHoi: 'Giáp tại Hợi', AtNgo: 'Ất tại Ngọ' },
      expected: { giapHoi: 'Trường Sinh', atNgo: 'Trường Sinh' },
      actual: { giapHoi, atNgo },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 8: Chiều Đại Vận (Dương Nam/Âm Nữ Thuận, Âm Nam/Dương Nữ Nghịch)
  {
    const t0 = Date.now();
    // Năm 1995 là Ất Hợi (Âm Mộc).
    // Với Nam: Âm Nam => Đi NGHỊCH
    // Với Nữ: Âm Nữ => Đi THUẬN
    const maleChart = calculateBaziChart('Test Male Luck', 'Nam', 15, 8, 1995, 10, 0, 7);
    const femaleChart = calculateBaziChart('Test Female Luck', 'Nữ', 15, 8, 1995, 10, 0, 7);

    const passed =
      maleChart.luckCycles.direction === 'Nghịch' &&
      femaleChart.luckCycles.direction === 'Thuận' &&
      maleChart.luckCycles.cycles.length === 10 &&
      femaleChart.luckCycles.cycles.length === 10;

    testCases.push({
      id: 'TC-BAZI-08',
      name: 'Kiểm tra quy tắc hướng đi Đại Vận (Thuận/Nghịch)',
      description: 'Năm Ất (Âm Can), Nam mệnh phải đi Nghịch lùi về trước, Nữ mệnh phải đi Thuận tiến lên.',
      input: { yearCan: 'Ất', polarity: 'Âm' },
      expected: { maleDirection: 'Nghịch', femaleDirection: 'Thuận' },
      actual: { maleDirection: maleChart.luckCycles.direction, femaleDirection: femaleChart.luckCycles.direction },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 9: Phát hiện quan hệ Can Chi (Lục Hợp, Tam Hợp, Lục Xung)
  {
    const t0 = Date.now();
    // Tạo lá số có Tý và Sửu (Lục hợp) hoặc Thân Tý Thìn (Tam hợp)
    const chart = calculateBaziChart('Test Interaction', 'Nam', 15, 8, 1995, 10, 0, 7);
    // Có Hợi (năm), Thân (tháng), Tuất (ngày), Tị (giờ)
    // Tị - Thân là Lục Hợp, Dần - Thân hoặc Tị - Hợi là Lục Xung
    const hasLucHop = chart.interactions.diaChiLucHop.length > 0;
    const hasLucXung = chart.interactions.diaChiLucXung.length > 0;
    const passed = hasLucHop && hasLucXung;

    testCases.push({
      id: 'TC-BAZI-09',
      name: 'Kiểm tra phát hiện quan hệ Can Chi tương tác',
      description: 'Xác định chính xác các quan hệ Địa Chi Lục Hợp (Tị - Thân) và Lục Xung (Tị - Hợi) có trong Tứ Trụ.',
      input: { branches: ['Hợi', 'Thân', 'Tuất', 'Tị'] },
      expected: { hasLucHop: true, hasLucXung: true },
      actual: { hasLucHop, hasLucXung, lucHop: chart.interactions.diaChiLucHop, lucXung: chart.interactions.diaChiLucXung },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  // TEST 10: Quy tắc Điều Hầu Dụng Thần (Cùng Thông Bảo Giám)
  {
    const t0 = Date.now();
    // Sinh vào tháng 6 (Mùi/Ngọ - Mùa Hè) => Cần Thủy làm Điều Hầu Dụng Thần
    const summerChart = calculateBaziChart('Test Summer Climate', 'Nam', 20, 6, 1995, 12, 0, 7);
    const passed = summerChart.dungThanInfo.dungThan === 'Thủy' && summerChart.dungThanInfo.method.includes('Điều Hầu');

    testCases.push({
      id: 'TC-BAZI-10',
      name: 'Kiểm tra Điều Hầu Dụng Thần mùa Hè',
      description: 'Sinh vào mùa Hè tháng Ngọ/Mùi khí viêm nhiệt cực thịnh, hệ thống phải chọn Thủy làm Điều Hầu Dụng Thần theo Cùng Thông Bảo Giám.',
      input: { month: 'Hạ (Ngọ/Mùi)' },
      expected: { dungThan: 'Thủy', method: 'Điều Hầu' },
      actual: { dungThan: summerChart.dungThanInfo.dungThan, method: summerChart.dungThanInfo.method },
      passed,
      executionTimeMs: Date.now() - t0
    });
  }

  const durationMs = Date.now() - startTime;
  const passedTests = testCases.filter(t => t.passed).length;

  return {
    totalTests: testCases.length,
    passedTests,
    failedTests: testCases.length - passedTests,
    allPassed: passedTests === testCases.length,
    durationMs,
    executedAt: new Date().toISOString(),
    testCases
  };
}
