import styles from './FullPageLoader.module.css';

interface FullPageLoaderProps {
  message?: string;
}

/** 앱 시작 시 로그인 복구가 끝날 때까지 전체 화면에 표시하는 Loading UI입니다. */
function FullPageLoader({ message = '로그인 정보를 확인하고 있습니다.' }: FullPageLoaderProps) {
  return (
    <main className={styles.page} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{message}</p>
    </main>
  );
}

export default FullPageLoader;
