import { createContext } from 'react';
import type { SocialProvider } from '../types/api/auth';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

/** 로그인 화면과 보호 페이지가 공통으로 사용하는 인증 상태와 동작입니다. */
export interface AuthContextValue {
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  login: (provider: SocialProvider) => Promise<void>;
  completeSocialLogin: () => Promise<void>;
  logout: () => Promise<void>;
  signout: () => Promise<void>;
}

// Provider 밖에서 잘못 사용하면 바로 알 수 있도록 기본값을 undefined로 둡니다.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
