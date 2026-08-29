import type { ApiResponse } from '../../types/api/common';
import { apiClient } from './apiClient';

/** 현재 access token이 백엔드에서 유효한지 검사합니다. */
export async function validateToken() {
  await apiClient.get<ApiResponse<null>>('/auth/token/me');
}

/** 서버의 refresh token을 무효화하기 위해 로컬 토큰 삭제 전에 호출합니다. */
export async function requestLogout() {
  await apiClient.patch<ApiResponse<null>>('/auth/logout');
}
