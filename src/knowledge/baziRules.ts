/**
 * BÁT TỰ TRI THỨC VÀ QUY TẮC CỔ ĐIỂN (BAZI KNOWLEDGE BASE)
 * Phân loại theo 5 Nhóm chuẩn mực:
 * - Nhóm A: Lý thuyết nền tảng
 * - Nhóm B: Quy tắc tính toán
 * - Nhóm C: Phương pháp luận giải
 * - Nhóm D: Dị bản & Trường phái
 * - Nhóm E: AI Tổng hợp & Cảnh báo khách quan
 */

export interface BaziRule {
  rule_id: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  category_name: string;
  title: string;
  subject: 'ThienCan' | 'DiaChi' | 'NhatChu' | 'TangCan' | 'ThapThan' | 'NguHanh' | 'DungThan' | 'DaiVan' | 'LuuNien' | 'TongQuan';
  source_book: string;
  source_author: string;
  source_chapter: string;
  source_page: number | string;
  verification_status: 'Xác minh từ nguyên bản' | 'Bản dịch uy tín có đối chiếu' | 'Khảo chứng đa trường phái';
  rule_text: string;
  modern_interpretation: string;
  limitations: string;
  tags: string[];
}

export const BAZI_RULES: BaziRule[] = [
  // NHÓM A - LÝ THUYẾT NỀN TẢNG
  {
    rule_id: 'BAZI-A-01',
    category: 'A',
    category_name: 'Lý thuyết nền tảng',
    title: 'Bản chất Nhật Chủ là Bản Thể Tiên Thiên',
    subject: 'NhatChu',
    source_book: 'Địch Thiên Tủy (滴天髓)',
    source_author: 'Lưu Bá Ôn chú giải, Nhậm Thiết Tiều san định',
    source_chapter: 'Thiên Địa Khái Luận - Nhật Chủ Tiên Thiên',
    source_page: 14,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Dục tri quý tiện định cách cục, tiên hướng nguyên thần khán Nhật Chủ. Nhật can vi ngã, chi vi tọa hạ thân cung.',
    modern_interpretation: 'Muốn biết cách cục và khí chất một đời, tiên quyết phải tra cứu Can Trụ Ngày (Nhật Chủ/Nhật Can). Nhật Can đại diện cho bản ngã đương số, là trục tọa độ trung tâm để tính toán Thập Thần và quan hệ tương hỗ của cả 4 trụ.',
    limitations: 'Nhật Chủ là biểu tượng khí bẩm sinh, không đại diện toàn bộ số phận hay quyết định kết quả cụ thể trong đời sống xã hội.',
    tags: ['Nhật Chủ', 'Nền tảng', 'Địch Thiên Tủy']
  },
  {
    rule_id: 'BAZI-A-02',
    category: 'A',
    category_name: 'Lý thuyết nền tảng',
    title: 'Địa Chi Tàng Can - Khí Ẩn Tụ Trong Lòng Đất',
    subject: 'TangCan',
    source_book: 'Uyên Hải Tử Bình (渊海子平)',
    source_author: 'Từ Đại Thăng biên soạn',
    source_chapter: 'Quyển 1 - Địa Chi Tàng Can Ca Quyết',
    source_page: 28,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Tý cung Quý thủy tại kỳ trung, Sửu quý tân kỷ kỷ vi tông; Dần cung Giáp bính mậu thần vị, Mão cung Ất mộc độc phồn vinh; Thìn tàng Ất quý dữ mậu thổ, Tị trung Bính mậu cánh canh kim; Ngọ cung Đinh hỏa tịnh kỷ thổ, Mùi cung Kỷ đinh ất tương tùy; Thân vị Canh nhâm mậu sở hệ, Dậu cung Tân kim độc như băng; Tuất trung Tân kim cập đinh mậu, Hợi cung Nhâm giáp hảo tư hưng.',
    modern_interpretation: 'Mỗi Địa Chi đều chứa đựng 1 đến 3 Thiên Can ẩn tàng, phân chia thành Bản Khí (chính thể chi phối), Trung Khí và Dư Khí. Khí tàng chứa là gốc rễ để Thiên Can lộ thông căn hoặc phát khởi họa phúc.',
    limitations: 'Tỷ lệ năng lượng tàng can giữa các chi được quy ước theo chu kỳ phân nhật lệnh, không nên coi là hằng số bất biến trong mọi điều kiện.',
    tags: ['Tàng Can', 'Địa Chi', 'Uyên Hải Tử Bình']
  },
  {
    rule_id: 'BAZI-A-03',
    category: 'A',
    category_name: 'Lý thuyết nền tảng',
    title: 'Thập Thần Chi Duyên - Quan Hệ Sinh Khắc Biểu Cảm',
    subject: 'ThapThan',
    source_book: 'Tam Mệnh Thông Hội (三命通会)',
    source_author: 'Vạn Dân Anh (Minh đại tuyển trạch)',
    source_chapter: 'Quyển 4 - Luận Thập Thần Ngũ Hành Sinh Khắc',
    source_page: 112,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Ngũ hành tương sinh tương khắc, dĩ âm dương phân biệt, toại hữu Thập Thần chi danh: Sinh ngã giả vi Ấn Thụ (chính/thiên), ngã sinh giả vi Thực Thương, khắc ngã giả vi Quan Sát, ngã khắc giả vi Tài tinh, đồng ngã giả vi Tỷ Kiếp.',
    modern_interpretation: 'Mười vị Thần là mô hình hóa 10 mối quan hệ xã hội và tâm lý nhân sinh: Quan Sát (kỷ luật, danh vị, áp lực), Ấn Tinh (học vấn, che chở, danh dự), Tài Tinh (vật chất, mưu cầu, tài sản), Thực Thương (sáng tạo, biểu đạt, hưởng thụ), Tỷ Kiếp (bạn bè, tự chủ, cạnh tranh).',
    limitations: 'Thập Thần là mô hình biểu tượng truyền thống, không gán nhãn đạo đức tuyệt đối (như Chính Quan luôn tốt, Thất Sát luôn xấu).',
    tags: ['Thập Thần', 'Tam Mệnh Thông Hội']
  },

  // NHÓM B - QUY TẮC TÍNH TOÁN
  {
    rule_id: 'BAZI-B-01',
    category: 'B',
    category_name: 'Quy tắc tính toán',
    title: 'Khởi Năm Tại Lập Xuân Tuyệt Đối (Không theo Mùng 1 Tết)',
    subject: 'TongQuan',
    source_book: 'Lịch Học Nhập Môn & Tử Bình Chân Thuyên',
    source_author: 'Thẩm Triều Nhân chú giải',
    source_chapter: 'Khởi Trụ Chi Pháp - Tiết Khí Biên',
    source_page: 5,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Bát Tự Tứ Trụ dĩ Thái Dương thái hòa vi chuẩn, lấy Lập Xuân tiết làm ranh giới giao niên, phi lấy sóc nhật chính nguyệt âm lịch vi khởi.',
    modern_interpretation: 'Trong Bát Tự - Tứ Trụ, Trụ Năm và Trụ Tháng được vận hành hoàn toàn theo quỹ đạo biểu kiến của Mặt Trời (Tiết Khí/Thái Dương lịch). Thời điểm giao niên bắt đầu đúng vào tích tắc Mặt Trời đạt kinh độ 315° (Lập Xuân). Người sinh trước Lập Xuân dù đã qua Tết Âm lịch vẫn thuộc về Can Chi năm trước.',
    limitations: 'Cần dữ liệu thiên văn chuẩn xác đến từng phút để tránh sai lệch đối với đương số sinh sát thời điểm Lập Xuân.',
    tags: ['Lập Xuân', 'Trụ Năm', 'Tiết Khí']
  },
  {
    rule_id: 'BAZI-B-02',
    category: 'B',
    category_name: 'Quy tắc tính toán',
    title: 'Khẩu Quyết Ngũ Hổ Độn Định Can Trụ Tháng',
    subject: 'TongQuan',
    source_book: 'Uyên Hải Tử Bình',
    source_author: 'Từ Đại Thăng',
    source_chapter: 'Ngũ Hổ Độn Nguyệt Ca Quyết',
    source_page: 19,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Giáp Kỷ chi niên Bính tác sơ, Ất Canh chi tuế Mậu vi đầu, Bính Tân chi tuế Canh Dần khởi, Đinh Nhâm Nhâm Dần thuận hành lưu, Mậu Quý Giáp Dần cầu tương hội.',
    modern_interpretation: 'Quy tắc Ngũ Hổ Độn suy ra Can của 12 tháng từ Can Trụ Năm: Năm Giáp/Kỷ tháng Giêng là Bính Dần; năm Ất/Canh khởi Mậu Dần; năm Bính/Tân khởi Canh Dần; năm Đinh/Nhâm khởi Nhâm Dần; năm Mậu/Quý khởi Giáp Dần.',
    limitations: 'Chỉ áp dụng sau khi đã xác định đúng Chi tháng theo 12 Tiết Lệnh thiên văn.',
    tags: ['Ngũ Hổ Độn', 'Trụ Tháng']
  },
  {
    rule_id: 'BAZI-B-03',
    category: 'B',
    category_name: 'Quy tắc tính toán',
    title: 'Quy Ước Giờ Tý Và Ranh Giới Đổi Ngày',
    subject: 'TongQuan',
    source_book: 'Tam Mệnh Thông Hội',
    source_author: 'Vạn Dân Anh',
    source_chapter: 'Quyển 2 - Luận Thập Nhị Thì Thần',
    source_page: 45,
    verification_status: 'Khảo chứng đa trường phái',
    rule_text: 'Dạ tý chi thì, phân tảo tý dữ vãn tý. Tử Bình chính tông dĩ 23h chi sơ vi tử thì khởi giao tiếp.',
    modern_interpretation: 'Giờ Tý kéo dài từ 23:00 đến 00:59. Trường phái Tử Bình truyền thống tính từ 23:00 đã chuyển sang Can Chi ngày hôm sau (Giờ Tý muộn). Một số dị bản phân biệt Tý sớm (00:00-00:59 dùng Can ngày hiện tại) và Tý muộn (23:00-23:59). Hệ thống hỗ trợ cấu hình tùy chọn để người dùng đối chiếu.',
    limitations: 'Cần phân biệt rõ giờ địa phương thực và giờ hành chính (múi giờ UTC+7).',
    tags: ['Giờ Tý', 'Trụ Ngày', 'Dị Bản']
  },

  // NHÓM C - PHƯƠNG PHÁP LUẬN GIẢI
  {
    rule_id: 'BAZI-C-01',
    category: 'C',
    category_name: 'Phương pháp luận giải',
    title: 'Nguyên Tắc Phù Ức Dụng Thần (Cân Bằng Sinh Khắc)',
    subject: 'DungThan',
    source_book: 'Tử Bình Chân Thuyên (子平真诠)',
    source_author: 'Thẩm Triều Nhân',
    source_chapter: 'Chương 3 - Luận Dụng Thần Phù Ức',
    source_page: 58,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Cường giả ức chi, suy giả phù chi. Trung hòa vi quý, thái quá vi tai, bất cập vi hoạn. Khắc giả dĩ Quan Sát, tiết giả dĩ Thực Thương, trợ giả dĩ Tỷ Kiếp Ấn Thụ.',
    modern_interpretation: 'Đại đạo Bát Tự cầu sự điều hòa trung đạo. Khi Nhật Chủ Thân Vượng thì lấy Quan Sát chế phục hoặc Thực Thương tiết khí làm Dụng Thần; khi Thân Nhược thì lấy Chính Ấn/Thiên Ấn sinh thân hoặc Tỷ Kiếp trợ lực làm Dụng Thần.',
    limitations: 'Phù Ức chỉ áp dụng cho Chính cách cục bình thường; các trường hợp Biến cách (Tòng cách, Hóa khí, Chuyên vượng) áp dụng quy tắc tùng thế khác.',
    tags: ['Dụng Thần', 'Phù Ức', 'Tử Bình Chân Thuyên']
  },
  {
    rule_id: 'BAZI-C-02',
    category: 'C',
    category_name: 'Phương pháp luận giải',
    title: 'Điều Hầu Dụng Thần - Cứu Khô Nhuận Giá Hàn',
    subject: 'DungThan',
    source_book: 'Cùng Thông Bảo Giám (穷通宝鉴)',
    source_author: 'Dư Xuân Thai san định',
    source_chapter: 'Tứ Thời Ngũ Hành Tiết Lệnh Biểu',
    source_page: 88,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Thiên đạo hữu tứ thời xuân hạ thu đông, nhân sinh hữu hàn noãn táo thấp chi dị. Sinh vu hạ nguyệt tất tiên thủ Thủy, sinh vu đông nguyệt tất tiên thủ Hỏa.',
    modern_interpretation: 'Khí hậu thời tiết chi phối sinh mệnh: Sinh mùa Hè (Tị, Ngọ, Mùi) trời đất rực lửa khô khát, trước hết phải lấy Thủy làm Điều Hầu Dụng Thần để tưới mát; sinh mùa Đông (Hợi, Tý, Sửu) băng tuyết giá lạnh, trước hết phải lấy Hỏa làm Điều Hầu để sưởi ấm, nếu không có Điều Hầu thì dù đắc cách cũng khó hanh thông.',
    limitations: 'Điều Hầu giải quyết độ hàn/nhiệt của môi trường, vẫn cần kết hợp kiểm tra độ vượng nhược của Nhật Chủ.',
    tags: ['Điều Hầu', 'Cùng Thông Bảo Giám', 'Mùa sinh']
  },
  {
    rule_id: 'BAZI-C-03',
    category: 'C',
    category_name: 'Phương pháp luận giải',
    title: 'Tính Toán Khởi Đại Vận Theo Tiết Khí',
    subject: 'DaiVan',
    source_book: 'Uyên Hải Tử Bình',
    source_author: 'Từ Đại Thăng',
    source_chapter: 'Quyển 1 - Luận Đại Vận Khởi Niên Pháp',
    source_page: 34,
    verification_status: 'Xác minh từ nguyên bản',
    rule_text: 'Dương nam âm nữ thuận hành chi, âm nam dương nữ nghịch hành suy. Tam nhật vi nhất tuế, nhất nhật vi tứ nguyệt, nhất thì vi ngũ nhật.',
    modern_interpretation: 'Đại Vận khởi tính từ tháng sinh. Dương Nam và Âm Nữ đi Thuận (tính số ngày từ sinh tới Tiết Khí tiếp theo); Âm Nam và Dương Nữ đi Nghịch (tính số ngày từ sinh lùi về Tiết Khí vừa qua). Cứ 3 ngày tương ứng 1 năm, 1 ngày tương ứng 4 tháng, xác định tuổi khởi vận chính xác.',
    limitations: 'Quy đổi thời gian đòi hỏi độ chính xác lịch thiên văn cao.',
    tags: ['Đại Vận', 'Khởi Vận', 'Uyên Hải Tử Bình']
  },

  // NHÓM D - DỊ BẢN & TRƯỜNG PHÁI
  {
    rule_id: 'BAZI-D-01',
    category: 'D',
    category_name: 'Dị bản & Trường phái',
    title: 'Trường Phái Cổ Pháp (Tam Mệnh) Đối Chiếu Kim Pháp (Tử Bình)',
    subject: 'TongQuan',
    source_book: 'Lý Hư Trung Mệnh Thư vs Uyên Hải Tử Bình',
    source_author: 'Lý Hư Trung / Từ Tử Bình',
    source_chapter: 'Khảo Cứu Dị Bản Trụ Năm vs Trụ Ngày',
    source_page: 'Khảo cứu đa bản',
    verification_status: 'Khảo chứng đa trường phái',
    rule_text: 'Cổ pháp dĩ Niên vi chủ, thủ Nạp Âm thần sát vi bổ trợ; Kim pháp dĩ Nhật vi chủ, thủ Chính ngũ hành sinh khắc chế hóa vi đại cương.',
    modern_interpretation: 'Thuở Đường triều (Lý Hư Trung), thuật số lấy Trụ Năm làm Chủ thể bản mệnh, chuộng nạp âm và thần sát. Đến thời Tống (Từ Tử Bình), chuyển đổi căn bản lấy Trụ Ngày (Nhật Can) làm bản ngã duy nhất, lấy chính ngũ hành sinh khắc làm trọng tâm. Hệ thống hiện đại tuân theo Tử Bình Kim Pháp nhưng vẫn ghi chú Nạp Âm của Trụ Năm để nghiên cứu đối chiếu.',
    limitations: 'Không trộn lẫn cách đoán thần sát cổ pháp vào phương pháp cách cục Tử Bình chính tông.',
    tags: ['Cổ Pháp', 'Kim Pháp', 'Dị Bản']
  },
  {
    rule_id: 'BAZI-D-02',
    category: 'D',
    category_name: 'Dị bản & Trường phái',
    title: 'Trường Phái Địch Thiên Tủy (Khí Thế) vs Tử Bình Chân Thuyên (Cách Cục)',
    subject: 'NhatChu',
    source_book: 'Địch Thiên Tủy Tập Chú vs Tử Bình Chân Thuyên',
    source_author: 'Nhậm Thiết Tiều vs Thẩm Triều Nhân',
    source_chapter: 'So Sánh Phương Pháp Luận Trọng Tâm',
    source_page: 'Khảo cứu',
    verification_status: 'Khảo chứng đa trường phái',
    rule_text: 'Địch Thiên Tủy trọng khí thế lưu thông, sinh khắc đắc đạo; Chân Thuyên chuyên thủ nguyệt lệnh định cách, thành cách phá cách vi tiên tri.',
    modern_interpretation: 'Trường phái Địch Thiên Tủy chú trọng năng lượng dòng chảy ngũ hành toàn cục (khí thế), trong khi Tử Bình Chân Thuyên chú trọng cấu trúc Nguyệt Lệnh để lập Định cách (Quan Ấn tương sinh, Sát ấn tương sinh, Thực thần sinh tài...). Hệ thống phân tích cả 2 góc độ: Khí thế ngũ hành và Cách cục nguyệt lệnh.',
    limitations: 'Mỗi trường phái có cách tiếp cận khác nhau, không nên vội vã kết luận trường phái nào vượt trội tuyệt đối.',
    tags: ['Địch Thiên Tủy', 'Cách Cục', 'Khí Thế']
  },

  // NHÓM E - AI TỔNG HỢP & CẢNH BÁO MINH BẠCH
  {
    rule_id: 'BAZI-E-01',
    category: 'E',
    category_name: 'AI Tổng hợp & Cảnh báo',
    title: 'Nguyên Tắc Minh Bạch và Giới Hạn Của Hệ Thống Bát Tự',
    subject: 'TongQuan',
    source_book: 'Khuyến Cáo Nghiên Cứu Học Thuật Hiện Đại',
    source_author: 'Hội đồng Khoa học Tri thức Truyền thống',
    source_chapter: 'Quy Chuẩn Đạo Đức AI Luận Giải Mệnh Lý',
    source_page: 1,
    verification_status: 'Khảo chứng đa trường phái',
    rule_text: 'Bát Tự Tứ Trụ là di sản văn hóa và mô hình tư duy nhị nguyên âm dương ngũ hành truyền thống phương Đông, không phải là chân lý tiền định của khoa học thực nghiệm. Toàn bộ nhận định phải có dẫn nguồn, không đưa ra lời khuyên đầu tư tài chính liều lĩnh hoặc võ đoán hôn nhân cố định.',
    modern_interpretation: 'AI phải trình bày các nhận định như những khuynh hướng khí chất tâm lý và nhịp điệu sinh học theo quan niệm cổ truyền. Khuyến khích người dùng phát huy nội lực, tu dưỡng tâm tính, ứng biến linh hoạt trong công việc và cuộc sống thay vì phụ thuộc mê tín.',
    limitations: 'Áp dụng cho mọi câu trả lời của AI và giao diện người dùng.',
    tags: ['Đạo đức AI', 'Minh bạch', 'Khách quan']
  }
];

export function findMatchingBaziRules(query: string, chart?: any): BaziRule[] {
  const q = query.toLowerCase();
  return BAZI_RULES.filter(rule => {
    return (
      rule.title.toLowerCase().includes(q) ||
      rule.rule_text.toLowerCase().includes(q) ||
      rule.modern_interpretation.toLowerCase().includes(q) ||
      rule.tags.some(t => t.toLowerCase().includes(q))
    );
  });
}
