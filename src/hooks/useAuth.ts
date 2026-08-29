import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/** 컴포넌트가 AuthContext를 안전하고 간단하게 읽도록 도와주는 custom hook입니다. */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }

  return context;
}
