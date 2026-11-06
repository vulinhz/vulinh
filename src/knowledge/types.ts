/**
 * ĐỊNH NGHĨA DỮ LIỆU CƠ SỞ TRI THỨC TỬ VI ĐẨU SỐ
 * Tuân thủ nghiêm ngặt 4 nhóm tri thức (A, B, C, D) và trạng thái kiểm chứng.
 */

export type KnowledgeCategory =
  | 'A' // Nhóm A: Nội dung từ tài liệu nền tảng (Toàn Thư - Vũ Tài Lục)
  | 'B' // Nhóm B: Nội dung đối chiếu độc lập (Áo Bí, Triệu Thị Minh Lý,...)
  | 'C' // Nhóm C: Dị bản hoặc quan điểm trường phái khác biệt
  | 'D'; // Nhóm D: Nội dung AI tổng hợp từ dữ liệu và quy tắc

export type VerificationStatus =
  | 'source_verified' // Đã kiểm tra nguồn và vị trí trích dẫn cụ thể
  | 'cross_checked'   // Đã đối chiếu với nguồn độc lập khác
  | 'conflicting'     // Có mâu thuẫn hoặc dị bản cần lưu ý
  | 'rejected'        // Không đủ căn cứ hoặc xác định có sai sót
  | 'needs_review'    // Cần chuyên gia xem xét thêm
  | 'pending';        // Chưa kiểm tra

export type TopicType =
  | 'Menh_Than'
  | 'Quan_Loc'
  | 'Tai_Bach'
  | 'Phu_The'
  | 'Tu_Tuc'
  | 'Tat_Ach'
  | 'Thien_Di'
  | 'No_Boc'
  | 'Dien_Trach'
  | 'Phuc_Duc'
  | 'Phu_Mau'
  | 'Huynh_De'
  | 'Cach_Cuc'
  | 'Van_Han';

export interface SourceDocument {
  source_id: string;
  title: string;
  author: string;
  translator?: string;
  publisher?: string;
  year?: string;
  identifier?: string;
  language: string;
  source_type: 'Nền tảng' | 'Đối chiếu' | 'Nghiên cứu học thuật';
  verification_status: VerificationStatus;
  scope: string;
  verified_date: string;
  notes: string;
}

export interface TuViRule {
  rule_id: string;
  title: string;
  topic: TopicType;
  school: string;
  rule_type: 'interpretation' | 'placement' | 'interaction' | 'combination' | 'timing';
  category: KnowledgeCategory;
  rule_text: string;
  source_id: string;
  source_chapter: string;
  source_page: number | string;
  source_excerpt: string;
  verification_status: VerificationStatus;
  conflicting_rules: string[];
  review_notes: string;
  stars_involved: string[];
  palaces_involved?: string[];
  created_at: string;
  updated_at: string;
}
