import type { ApiResponse } from '../../types/api/common';
import type { MyPageDTO } from '../../types/api/member';
import { apiClient } from './apiClient';

/** 사이드바에 필요한 사용자 이름과 통계를 조회합니다. */
export async function getMyPage() {
  const response = await apiClient.get<ApiResponse<MyPageDTO>>('/auth/mypage');
  return response.data.result;
}
