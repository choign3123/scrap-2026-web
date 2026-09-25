/** 문의 등록·조회 API가 사용하는 문의 종류입니다. */
export type InquiryType = 'GENERAL' | 'BUG' | 'FEATURE_REQUEST' | 'IMPROVEMENT';

/** 백엔드가 문의에 부여하는 처리 상태입니다. */
export type InquiryStatus = 'RECEIVED' | 'PROCESSING' | 'ANSWERED';

/** GET/POST /auth/inquiries의 result.inquiries 및 result 형식입니다. */
export interface InquiryDTO {
  inquiryId: number;
  type: InquiryType;
  status: InquiryStatus;
  content: string;
  createdAt: string;
  answer: string | null;
  answerAt: string | null;
}

/** POST /auth/inquiries에 전달하는 request body입니다. */
export interface CreateInquiryRequest {
  type: InquiryType;
  content: string;
}

/** GET /auth/inquiries의 result 형식입니다. */
export interface InquiryListDTO {
  inquiries: InquiryDTO[];
}

/** GET /auth/inquiries/admin에 전달하는 목록 조회 조건입니다. */
export interface AdminInquiryQuery {
  page: number;
  size: number;
  direction: 'ASC' | 'DESC';
  status?: InquiryStatus;
}

/** 관리자 문의 목록 응답의 페이지 정보입니다. */
export interface InquiryPageMeta {
  totalElement: number;
  numOfElement: number;
  isEnd: boolean;
}

/** GET /auth/inquiries/admin의 result 형식입니다. */
export interface AdminInquiryPageDTO {
  meta: InquiryPageMeta;
  inquiries: InquiryDTO[];
}

/** PATCH /auth/inquiries/admin/answer에 전달하는 request body입니다. */
export interface AnswerInquiryRequest {
  inquiryId: number;
  answer: string;
}
