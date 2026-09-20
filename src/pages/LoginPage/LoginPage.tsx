import { useState } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import SocialLoginButton from '../../components/common/SocialLoginButton/SocialLoginButton';
import type { SocialProvider } from '../../types/api/auth';
import { toApiError } from '../../utils/apiError';
import { startKakaoLogin } from '../../services/kakaoAuthService';
import { startNaverLogin } from '../../services/naverAuthService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import scrapLogo from '../../assets/login/scrap-logo.png';
import styles from './LoginPage.module.css';

interface LoginLocationState {
  from?: Location;
}

/** 소셜 버튼을 통해 인증을 시작하는 로그인 페이지입니다. */
function LoginPage() {
  const location = useLocation();
  useDocumentTitle('로그인 | 스크랩');
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(provider: SocialProvider) {
    setLoadingProvider(provider);
    setErrorMessage(null);

    try {
      // 보호 페이지에서 진입한 경우 로그인 후 해당 경로로, 아니면 대시보드로 복귀합니다.
      const locationState = location.state as LoginLocationState | null;
      const from = locationState?.from;
      const returnPath = from
        ? `${from.pathname}${from.search}${from.hash}`
        : '/dashboard';

      if (provider === 'kakao') {
        // 카카오 버튼은 SDK 인증 화면으로 이동하며 callback 페이지에서 로그인을 마무리합니다.
        await startKakaoLogin(returnPath);
        return;
      }

      // 네이버는 백엔드가 조합한 OAuth 인증 URL로 같은 탭을 이동합니다.
      await startNaverLogin(returnPath);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    } finally {
      setLoadingProvider(null);
    }
  }

  const isSubmitting = loadingProvider !== null;

  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="login-heading">
        <img className={styles.logo} src={scrapLogo} alt="스크랩 로고" />

        <h1 id="login-heading" className={styles.heading}>
          스크랩
        </h1>
        <p className={styles.tagline}>링크를 관리하는 가장 간편한 방법</p>

        <div className={styles.loginArea}>
          {/* Figma의 작은 안내 배지를 웹에서 선명하게 보이도록 텍스트로 구성합니다. */}
          <span className={styles.quickStartBadge}>
            3초 만에 시작하기 <span aria-hidden="true">✦</span>
          </span>

          <div className={styles.buttonGroup}>
            <SocialLoginButton
              provider="kakao"
              isLoading={loadingProvider === 'kakao'}
              disabled={isSubmitting}
              onClick={handleLogin}
            />
            <SocialLoginButton
              provider="naver"
              isLoading={loadingProvider === 'naver'}
              disabled={isSubmitting}
              onClick={handleLogin}
            />
          </div>

          {errorMessage && (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
