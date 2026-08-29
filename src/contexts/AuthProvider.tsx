import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { queryClient } from '../app/queryClient';
import { issueTestTokens } from '../services/api/tokenService';
import { requestLogout, requestSignout } from '../services/api/authService';
import { refreshSessionTokens } from '../services/api/apiClient';
import { subscribeToSessionExpired } from '../services/authEvents';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../services/tokenStorage';
import type { SocialProvider } from '../types/api/auth';
import { AuthContext, type AuthStatus } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

/** 토큰과 로그인 여부를 앱 전체에 제공하는 인증 상태 관리자입니다. */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');

  const clearSession = useCallback(() => {
    clearTokens();
    queryClient.clear();
    setAuthStatus('unauthenticated');
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Axios에서 재발급 실패를 알리면 React 상태와 서버 데이터 캐시도 함께 정리합니다.
    const unsubscribe = subscribeToSessionExpired(() => {
      if (isMounted) {
        clearSession();
      }
    });

    async function restoreSession() {
      if (getAccessToken()) {
        setAuthStatus('authenticated');
        return;
      }

      if (!getRefreshToken()) {
        setAuthStatus('unauthenticated');
        return;
      }

      try {
        // 새로고침으로 사라진 access token을 저장된 refresh token으로 복구합니다.
        await refreshSessionTokens();

        if (isMounted) {
          setAuthStatus('authenticated');
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clearSession]);

  const login = useCallback(async (provider: SocialProvider) => {
    // 현재는 provider와 관계없이 합의된 테스트 회원(memberId 10) 토큰을 사용합니다.
    // 실제 소셜 로그인 단계에서는 이 값을 /oauth/login의 sns 파라미터로 전달합니다.
    void provider;
    const tokens = await issueTestTokens();
    saveTokens(tokens);
    setAuthStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      // 요구사항에 따라 서버 로그아웃을 먼저 시도한 다음 로컬 토큰을 제거합니다.
      await requestLogout();
    } catch {
      // 서버 요청이 실패해도 사용자가 요청한 로컬 로그아웃은 완료합니다.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const signout = useCallback(async () => {
    // 회원탈퇴 API가 성공한 경우에만 로컬 인증 정보를 제거합니다.
    await requestSignout();
    clearSession();
  }, [clearSession]);

  const contextValue = useMemo(
    () => ({
      authStatus,
      isAuthenticated: authStatus === 'authenticated',
      login,
      logout,
      signout,
    }),
    [authStatus, login, logout, signout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
