import type { ApiResponse } from '../../types/api/common';
import type { AccessTokenDTO, TokenDTO } from '../../types/api/auth';
import { publicApiClient } from './httpClient';

// 소셜 로그인 연결 전 네이버 버튼에서 사용하는 개발용 회원 ID입니다.
const TEST_MEMBER_ID = 10;

/** 소셜 로그인 완성 전까지 memberId 10으로 개발용 토큰을 발급합니다. */
export async function issueTestTokens() {
  // 이 API만 공통 응답 래퍼 없이 TokenDTO를 바로 반환합니다.
  const response = await publicApiClient.get<TokenDTO>('/token/issue', {
    params: { memberId: TEST_MEMBER_ID },
  });

  return response.data;
}

/** HttpOnly refresh token 쿠키로 웹 세션을 생성하거나 재발급합니다. */
export async function requestWebSession() {
  const response = await publicApiClient.post<ApiResponse<AccessTokenDTO>>(
    '/oauth/web/session',
  );

  return response.data.result;
}
