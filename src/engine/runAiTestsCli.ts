import { runAiTestSuite } from './aiTestSuite';

async function main() {
  console.log('===============================================================');
  console.log('🤖 BẮT ĐẦU CHẠY BỘ KIỂM THỬ AI LUẬN GIẢI & HỒI QUY TOÀN BỘ (AI SUITE)');
  console.log('===============================================================');

  const suite = await runAiTestSuite('http://localhost:3000');

  for (const test of suite.results) {
    const icon = test.passed ? '✅ PASS' : '❌ FAIL';
    const tag = `[${test.level}]`.padEnd(10, ' ');
    console.log(`  ${icon} ${tag} [${test.id}] ${test.name}`);
    console.log(`     Chi tiết: ${test.message} (${test.durationMs}ms)`);
  }

  console.log('===============================================================');
  console.log('📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ AI & HỒI QUY:');
  console.log(`   Tổng số ca kiểm thử: ${suite.summary.total}`);
  console.log(`   Số ca vượt qua (PASS): ${suite.summary.passed}`);
  console.log(`   Số ca thất bại (FAIL): ${suite.summary.failed}`);
  console.log(`   Trạng thái chung: ${suite.summary.allPassed ? '🎉 TẤT CẢ 13/13 TEST ĐỀU ĐẠT CHUẨN (100%)' : '⚠️ CÓ TEST THẤT BẠI'}`);
  console.log(`   Thời điểm chạy: ${suite.summary.executedAt}`);
  console.log('===============================================================');

  if (!suite.summary.allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
