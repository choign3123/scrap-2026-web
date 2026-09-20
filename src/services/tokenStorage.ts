import type { TokenDTO } from '../types/api/auth';

// 접근 토큰은 JavaScript 메모리에만 두어 브라우저를 닫으면 자동으로 사라지게 합니다.
let accessToken: string | null = null;

/** Axios 요청 인터셉터가 사용할 현재 접근 토큰을 반환합니다. */
export function getAccessToken() {
  return accessToken;
}

/** 새로 발급된 접근 토큰을 메모리에 저장합니다. */
export function saveAccessToken(token: string) {
  accessToken = token;
}

/** 개발용 토큰 응답에서는 access token만 사용하고 refresh token은 저장하지 않습니다. */
export function saveTokens(tokens: TokenDTO) {
  saveAccessToken(tokens.accessToken);
}

/** 로그아웃이나 인증 만료 시 메모리에 남은 access token을 제거합니다. */
export function clearTokens() {
  accessToken = null;
}
