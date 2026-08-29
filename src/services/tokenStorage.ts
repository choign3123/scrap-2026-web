import type { TokenDTO } from '../types/api/auth';

const REFRESH_TOKEN_STORAGE_KEY = 'scrap.refreshToken';

// 접근 토큰은 JavaScript 메모리에만 두어 브라우저를 닫으면 자동으로 사라지게 합니다.
let accessToken: string | null = null;

/** Axios 요청 인터셉터가 사용할 현재 접근 토큰을 반환합니다. */
export function getAccessToken() {
  return accessToken;
}

/** 새로 발급된 접근 토큰을 메모리에 저장합니다. */
export function setAccessToken(token: string) {
  accessToken = token;
}

/** 브라우저를 다시 열었을 때 토큰을 재발급할 수 있도록 refresh token만 보관합니다. */
export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

/** 발급 또는 재발급된 토큰 한 쌍을 각 보관 위치에 저장합니다. */
export function saveTokens(tokens: TokenDTO) {
  setAccessToken(tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

/** 로그아웃이나 인증 만료 시 브라우저에 남은 모든 인증 정보를 제거합니다. */
export function clearTokens() {
  accessToken = null;
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
