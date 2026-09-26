import type { ApiResponse } from '../../types/api/common';
import type {
  CreateNoticeRequest,
  NoticeDetailDTO,
  NoticeListDTO,
  NoticeListQuery,
} from '../../types/api/notice';
import { apiClient } from './apiClient';

/** 날짜 정렬과 페이지 조건에 맞춰 공지사항 목록을 조회합니다. */
export async function getNotices(query: NoticeListQuery) {
  const response = await apiClient.get<ApiResponse<NoticeListDTO>>('/auth/notices', {
    params: query,
  });

  return response.data.result;
}

/** 공지 ID로 본문을 포함한 상세 정보를 조회합니다. */
export async function getNotice(noticeId: number) {
  const response = await apiClient.get<ApiResponse<NoticeDetailDTO>>(
    `/auth/notices/${noticeId}`,
  );

  return response.data.result;
}

/** 관리자 권한으로 Markdown 원문을 포함한 새 공지를 등록합니다. */
export async function createNotice(request: CreateNoticeRequest) {
  const response = await apiClient.post<ApiResponse<NoticeDetailDTO>>(
    '/auth/notices/admin',
    request,
  );

  return response.data.result;
}
