import type { SocialProvider } from '../../../types/api/auth';
import kakaoLoginImage from '../../../assets/social-login/kakao_login_large_narrow.png';
import naverLoginImage from '../../../assets/social-login/NAVER_login_Dark_KR_green_narrow_H56.png';
import styles from './SocialLoginButton.module.css';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  isLoading: boolean;
  disabled: boolean;
  onClick: (provider: SocialProvider) => void;
}

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  kakao: '카카오',
  naver: '네이버',
};

/** 카카오와 네이버에서 공통으로 사용하는 소셜 로그인 버튼입니다. */
function SocialLoginButton({
  provider,
  isLoading,
  disabled,
  onClick,
}: SocialLoginButtonProps) {
  const providerLabel = PROVIDER_LABEL[provider];

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[provider]}`}
      disabled={disabled}
      aria-busy={isLoading}
      aria-label={`${providerLabel} 로그인`}
      onClick={() => onClick(provider)}
    >
      <img
        className={styles.buttonImage}
        src={provider === 'kakao' ? kakaoLoginImage : naverLoginImage}
        alt={`${providerLabel} 로그인`}
      />
      {isLoading && <span className={styles.loadingText}>로그인 중...</span>}
    </button>
  );
}

export default SocialLoginButton;
