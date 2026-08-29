import type { ApiResponse } from '../../types/api/common';
import type { TokenDTO } from '../../types/api/auth';
import { publicApiClient } from './httpClient';

const TEST_MEMBER_ID = 10;

/** 소셜 로그인 완성 전까지 memberId 10으로 개발용 토큰을 발급합니다. */
export async function issueTestTokens() {
  // 이 API만 공통 응답 래퍼 없이 TokenDTO를 바로 반환합니다.
  const response = await publicApiClient.get<TokenDTO>('/token/issue', {
    params: { memberId: TEST_MEMBER_ID },
  });

  return response.data;
}

/** 저장된 refresh token으로 새로운 토큰 한 쌍을 발급합니다. */
export async function reissueTokens(refreshToken: string) {
  const response = await publicApiClient.post<ApiResponse<TokenDTO>>(
    '/token',
    undefined,
    {
      // Swagger의 snake_case 쿼리 파라미터 이름을 그대로 사용합니다.
      params: { refresh_token: refreshToken },
    },
  );

  return response.data.result;
}
