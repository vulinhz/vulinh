/**
 * CLI Test Runner cho CI/CD và Terminal
 * Chạy lệnh: npx tsx src/engine/runAllTestsCli.ts
 */

import { runComprehensiveQASuite } from './qaTestSuite';

function main() {
  console.log('===============================================================');
  console.log('🚀 BẮT ĐẦU CHẠY BỘ KIỂM THỬ TỰ ĐỘNG TOÀN WEBSITE (QA SUITE)');
  console.log('===============================================================\n');

  const suite = runComprehensiveQASuite();
  const { summary, testCases } = suite;

  // Nhóm kết quả theo Group
  const groups: Record<string, typeof testCases> = {};
  testCases.forEach(tc => {
    if (!groups[tc.group]) groups[tc.group] = [];
    groups[tc.group].push(tc);
  });

  for (const [groupName, tests] of Object.entries(groups)) {
    console.log(`\n--- PHÂN HỆ: [${groupName}] (${tests.length} tests) ---`);
    tests.forEach(t => {
      const icon = t.passed ? '✅ PASS' : '❌ FAIL';
      const sevTag = `[${t.severity}]`;
      console.log(`  ${icon} ${sevTag.padEnd(10)} [${t.id}] ${t.name}`);
      if (!t.passed) {
        console.log(`       Expected: ${t.expected}`);
        console.log(`       Actual:   ${t.actual}`);
        console.log(`       Module:   ${t.module}`);
      }
    });
  }

  console.log('\n===============================================================');
  console.log('📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ:');
  console.log(`   Tổng số ca kiểm thử: ${summary.totalTests}`);
  console.log(`   Số ca vượt qua (PASS): ${summary.passedTests}`);
  console.log(`   Số ca thất bại (FAIL): ${summary.failedTests}`);
  console.log(`   Phân loại: CRITICAL (${summary.criticalCount}), HIGH (${summary.highCount}), MEDIUM (${summary.mediumCount}), LOW (${summary.lowCount})`);
  console.log(`   Critical Passed: ${summary.criticalPassed ? 'YES' : 'NO'}`);
  console.log(`   Trạng thái chung: ${summary.allPassed ? '🎉 TẤT CẢ TEST ĐỀU ĐẠT CHUẨN (100%)' : '⚠️ CÓ TEST THẤT BÀI'}`);
  console.log(`   Thời điểm chạy: ${summary.executedAt}`);
  console.log('===============================================================\n');

  if (!summary.allPassed) {
    process.exit(1);
  }
}

main();
