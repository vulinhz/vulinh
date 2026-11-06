import { SourceDocument } from './types';

export const SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    source_id: 'SRC_TOANTHU_01',
    title: 'Tử Vi Đẩu Số Toàn Thư',
    author: 'Hi Di Trần Đoàn',
    translator: 'Vũ Tài Lục dịch thuật và chú giải',
    publisher: 'NXB Đại Nam tái bản (Nguyên bản Khai Trí Sài Gòn)',
    year: '1973',
    identifier: 'ISBN-VN-TVDSTT-VTL',
    language: 'Tiếng Việt / Chữ Hán đối chiếu',
    source_type: 'Nền tảng',
    verification_status: 'source_verified',
    scope: 'Toàn bộ 14 Chính tinh, hệ thống an sao, miếu hãm, phú luận và luận giải 12 cung chức năng',
    verified_date: '2026-11-01',
    notes: 'Tài liệu nền tảng cốt lõi được người dùng cung cấp và chỉ định cho dự án.'
  },
  {
    source_id: 'SRC_AOBI_02',
    title: 'Tử Vi Áo Bí',
    author: 'Hà Uyên',
    publisher: 'NXB Văn Hóa Thông Tin tái bản',
    year: '1998',
    identifier: 'ISBN-978-604-58',
    language: 'Tiếng Việt',
    source_type: 'Đối chiếu',
    verification_status: 'cross_checked',
    scope: 'Hệ thống đối chiếu tính chất các cách cục và sự tương tác giữa chính diệu và sát tinh',
    verified_date: '2026-11-01',
    notes: 'Sử dụng để đối chiếu các cách cục đặc biệt như Tử Phủ Vũ Tướng, Sát Phá Tham.'
  },
  {
    source_id: 'SRC_MINHLY_03',
    title: 'Triệu Thị Minh Lý Tử Vi Đẩu Số',
    author: 'Triệu Thị (Thời Tống)',
    publisher: 'Bản khắc mộc Tứ Khố Toàn Thư số hóa',
    year: 'Bản cổ Tống - Minh',
    identifier: 'SKQS-TVDS-034',
    language: 'Chữ Hán cổ',
    source_type: 'Nghiên cứu học thuật',
    verification_status: 'cross_checked',
    scope: 'Đối chiếu văn bản gốc các bài phú: Thái Vi Phú, Cốt Tủy Phú, Nữ Mệnh Phú',
    verified_date: '2026-11-01',
    notes: 'Kiểm tra tính chân xác của nguyên văn chữ Hán trong các bài phú Trần Đoàn.'
  },
  {
    source_id: 'SRC_KHAMTHIEN_04',
    title: 'Khâm Thiên Môn Đẩu Số Bí Nghiễn',
    author: 'Khâm Thiên Môn Bắc Phái',
    publisher: 'Học hội Chu Dịch Đài Loan',
    year: '2002',
    identifier: 'KTM-TW-2002',
    language: 'Trung văn',
    source_type: 'Đối chiếu',
    verification_status: 'conflicting',
    scope: 'Trường phái Tứ Hóa phi tinh (khác biệt với Nam Phái về cách an Tứ Hóa Can Canh và Can Nhâm)',
    verified_date: '2026-11-01',
    notes: 'Được ghi nhận tại Nhóm C để phân định dị bản an Hóa Kỵ can Canh (Thiên Đồng vs Thái Âm).'
  }
];
