import type { ApiResponse } from '../../types/api/common';
import type { KakaoLoginPrepareDTO, NaverLoginPrepareDTO } from '../../types/api/auth';
import { apiClient } from './apiClient';
import { publicApiClient } from './httpClient';

/** 현재 access token이 백엔드에서 유효한지 검사합니다. */
export async function validateToken() {
  await apiClient.get<ApiResponse<null>>('/auth/token/me');
}

/** 현재 로그인한 계정에 관리자 권한이 있는지 백엔드에서 확인합니다. */
export async function checkAdminAuthority() {
  await apiClient.get<ApiResponse<null>>('/auth/admin');

  // TanStack Query v5는 queryFn이 undefined를 반환하면 실패로 처리합니다.
  // 응답 본문이 없는 권한 확인 API이므로 HTTP 요청이 성공하면 true를 반환합니다.
  return true;
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

/** 백엔드에서 네이버 인증 화면 URL과 state를 받아옵니다. */
export async function prepareNaverLogin() {
  const response = await publicApiClient.post<ApiResponse<NaverLoginPrepareDTO>>(
    '/oauth/web/naver/prepare',
  );

  return response.data.result;
}
