import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './DashboardPage.module.css';

/** 인증 흐름을 확인하기 위한 임시 대시보드이며 다음 단계에서 실제 화면으로 교체합니다. */
function DashboardPage() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="dashboard-heading">
        <span className={styles.status}>인증 완료</span>
        <h1 id="dashboard-heading">로그인에 성공했습니다</h1>
        <p>
          접근 토큰이 메모리에 저장되었고, 인증이 필요한 API 요청에는 Bearer
          토큰이 자동으로 추가됩니다.
        </p>
        <button
          type="button"
          className={styles.logoutButton}
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          {isLoggingOut ? '로그아웃 중...' : '로그아웃 테스트'}
        </button>
      </section>
    </main>
  );
}

export default DashboardPage;
