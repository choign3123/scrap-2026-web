import type { ApiResponse } from '../../types/api/common';
import type {
  AdminInquiryPageDTO,
  AdminInquiryQuery,
  AnswerInquiryRequest,
  CreateInquiryRequest,
  InquiryDTO,
  InquiryListDTO,
} from '../../types/api/inquiry';
import { apiClient } from './apiClient';

/** 로그인한 사용자의 문의 목록을 조회합니다. */
export async function getMyInquiries() {
  const response = await apiClient.get<ApiResponse<InquiryListDTO>>('/auth/inquiries');
  return response.data.result;
}

/** 입력한 문의 종류와 내용을 API 명세 그대로 등록합니다. */
export async function createInquiry(request: CreateInquiryRequest) {
  const response = await apiClient.post<ApiResponse<InquiryDTO>>('/auth/inquiries', request);
  return response.data.result;
}

/** 관리자 권한으로 상태·페이지 조건에 맞는 전체 문의를 조회합니다. */
export async function getAdminInquiries(query: AdminInquiryQuery) {
  const response = await apiClient.get<ApiResponse<AdminInquiryPageDTO>>(
    '/auth/inquiries/admin',
    { params: query },
  );
  return response.data.result;
}

/** 접수된 문의를 처리 중 상태로 변경합니다. */
export async function confirmInquiry(inquiryId: number) {
  await apiClient.patch<ApiResponse<null>>(
    `/auth/inquiries/admin/confirm/${inquiryId}`,
  );
}

/** 처리 중인 문의에 관리자 답변을 등록합니다. */
export async function answerInquiry(request: AnswerInquiryRequest) {
  const response = await apiClient.patch<ApiResponse<InquiryDTO>>(
    '/auth/inquiries/admin/answer',
    request,
  );
  return response.data.result;
}
