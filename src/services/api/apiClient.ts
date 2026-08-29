import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.');
}

/** 모든 백엔드 API 서비스가 공통으로 사용하는 Axios 인스턴스입니다. */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

// 인증 토큰과 재발급 로직은 로그인 기능 구현 단계에서 연결합니다.
