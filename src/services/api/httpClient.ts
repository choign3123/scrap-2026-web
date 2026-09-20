import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.');
}

/** 토큰 발급처럼 Authorization 헤더가 필요 없는 요청에 사용하는 Axios 인스턴스입니다. */
export const publicApiClient = axios.create({
  baseURL: apiBaseUrl,
  // 백엔드의 HttpOnly refresh token과 OAuth state 쿠키를 요청에 포함합니다.
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Scrap-Web-Client': 'scrap-web',
  },
  timeout: 10_000,
});
