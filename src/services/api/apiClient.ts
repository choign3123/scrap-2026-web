import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../tokenStorage';
import { notifySessionExpired } from '../authEvents';
import type { TokenDTO } from '../../types/api/auth';
import { publicApiClient } from './httpClient';
import { reissueTokens } from './tokenService';

interface ErrorResponseBody {
  code?: string;
  message?: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  /** 같은 요청이 재발급을 반복하지 않도록 표시하는 프론트엔드 전용 값입니다. */
  hasRetriedAfterRefresh?: boolean;
}

// publicApiClient와 주소/시간 제한을 공유하지만 인증 인터셉터는 별도로 적용합니다.
export const apiClient = axios.create({
  baseURL: publicApiClient.defaults.baseURL,
  timeout: publicApiClient.defaults.timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let tokenRefreshPromise: Promise<TokenDTO> | null = null;

/** 동시에 여러 API가 만료돼도 재발급 API는 한 번만 호출합니다. */
export function refreshSessionTokens() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error('저장된 refresh token이 없습니다.'));
  }

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = reissueTokens(refreshToken)
      .then((tokens) => {
        saveTokens(tokens);
        return tokens;
      })
      .finally(() => {
        tokenRefreshPromise = null;
      });
  }

  return tokenRefreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponseBody>) => {
    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const isExpiredToken =
      error.response?.status === 406 &&
      error.response.data?.code === 'Authorization002';

    if (!requestConfig || !isExpiredToken || requestConfig.hasRetriedAfterRefresh) {
      return Promise.reject(error);
    }

    requestConfig.hasRetriedAfterRefresh = true;

    try {
      const tokens = await refreshSessionTokens();
      requestConfig.headers.Authorization = `Bearer ${tokens.accessToken}`;

      // 원래 실패했던 API를 새 access token으로 한 번만 다시 실행합니다.
      return apiClient.request(requestConfig);
    } catch (refreshError) {
      clearTokens();
      notifySessionExpired();
      return Promise.reject(refreshError);
    }
  },
);
