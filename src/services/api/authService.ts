import type { ApiResponse } from '../../types/api/common';
import type { KakaoLoginPrepareDTO } from '../../types/api/auth';
import { apiClient } from './apiClient';
import { publicApiClient } from './httpClient';

/** 현재 access token이 백엔드에서 유효한지 검사합니다. */
export async function validateToken() {
  await apiClient.get<ApiResponse<null>>('/auth/token/me');
}

/** 서버의 refresh token을 무효화하기 위해 로컬 토큰 삭제 전에 호출합니다. */
export async function requestLogout() {
  await apiClient.patch<ApiResponse<null>>('/auth/logout');
}

/** 회원탈퇴 확인 후 사용자 계정과 서버 데이터를 삭제합니다. */
export async function requestSignout() {
  await apiClient.delete<ApiResponse<null>>('/auth/signout');
}

/** 백엔드에서 카카오 state와 고정 callback 주소를 받아옵니다. */
export async function prepareKakaoLogin() {
  const response = await publicApiClient.post<ApiResponse<KakaoLoginPrepareDTO>>(
    '/oauth/web/kakao/prepare',
  );

  return response.data.result;
}
