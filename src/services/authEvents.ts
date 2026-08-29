type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

/** Axios 계층에서 감지한 인증 만료를 React의 AuthContext에 전달합니다. */
export function notifySessionExpired() {
  sessionExpiredListeners.forEach((listener) => listener());
}

/** AuthContext가 인증 만료 알림을 구독하고, unmount 시 구독을 해제하게 합니다. */
export function subscribeToSessionExpired(listener: SessionExpiredListener) {
  sessionExpiredListeners.add(listener);

  return () => {
    sessionExpiredListeners.delete(listener);
  };
}
