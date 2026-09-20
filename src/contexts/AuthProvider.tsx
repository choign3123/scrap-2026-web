import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { queryClient } from '../app/queryClient';
import { issueTestTokens, requestWebSession } from '../services/api/tokenService';
import {
  requestLogout,
  requestSignout,
} from '../services/api/authService';
import { refreshSessionTokens } from '../services/api/apiClient';
import { subscribeToSessionExpired } from '../services/authEvents';
import {
  clearTokens,
  getAccessToken,
  saveAccessToken,
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
      // 카카오 callback 화면은 자체적으로 세션을 한 번만 생성해야 refresh token 중복 회전을 피할 수 있습니다.
      if (window.location.pathname === '/auth/kakao/callback') {
        setAuthStatus('unauthenticated');
        return;
      }

      if (getAccessToken()) {
        setAuthStatus('authenticated');
        return;
      }

      try {
        // HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로 서버에 세션 복구를 직접 요청합니다.
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

  const completeKakaoLogin = useCallback(async () => {
    // 백엔드 callback이 설정한 HttpOnly 쿠키로 access token만 받아 메모리에 보관합니다.
    const session = await requestWebSession();
    saveAccessToken(session.accessToken);
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
      completeKakaoLogin,
      logout,
      signout,
    }),
    [authStatus, completeKakaoLogin, login, logout, signout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
