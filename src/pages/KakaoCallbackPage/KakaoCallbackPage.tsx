import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { consumeSocialReturnPath } from '../../services/socialLoginStorage';
import { toApiError } from '../../utils/apiError';
import styles from './KakaoCallbackPage.module.css';

interface SocialCallbackPageProps {
  provider: 'kakao' | 'naver';
}

/** 백엔드 소셜 callback 처리가 끝난 뒤 HttpOnly 쿠키로 웹 세션을 완성합니다. */
function KakaoCallbackPage({ provider }: SocialCallbackPageProps) {
  const { completeSocialLogin } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const providerLabel = provider === 'kakao' ? '카카오' : '네이버';
  useDocumentTitle(`${providerLabel} 로그인 | 스크랩`);

  useEffect(() => {
    // 개발 환경의 StrictMode가 effect를 두 번 실행해도 인가 코드를 한 번만 교환합니다.
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    async function completeLogin() {
      const callbackQuery = new URLSearchParams(window.location.search);
      const result = callbackQuery.get('result');
      const reason = callbackQuery.get('reason');

      // 성공/실패 정보는 한 번 읽은 뒤 주소창에서 제거해 새로고침 시 재처리되지 않게 합니다.
      window.history.replaceState(
        window.history.state,
        document.title,
        `/auth/${provider}/callback`,
      );

      if (result !== 'success') {
        if (reason === 'cancelled') {
          throw new Error(`${providerLabel} 로그인이 취소되었습니다.`);
        }
        throw new Error(`${providerLabel} 로그인에 실패했습니다. 다시 시도해 주세요.`);
      }

      await completeSocialLogin();
      navigate(consumeSocialReturnPath(), { replace: true });
    }

    void completeLogin().catch((error: unknown) => {
      setErrorMessage(toApiError(error).message);
    });
  }, [completeSocialLogin, navigate, provider, providerLabel]);

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-live="polite">
        {errorMessage ? (
          <>
            <strong>{providerLabel} 로그인에 실패했습니다.</strong>
            <p>{errorMessage}</p>
            <button type="button" onClick={() => navigate('/login', { replace: true })}>
              로그인 화면으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <strong>{providerLabel} 로그인 처리 중입니다.</strong>
            <p>잠시만 기다려 주세요.</p>
          </>
        )}
      </section>
    </main>
  );
}

export default KakaoCallbackPage;
