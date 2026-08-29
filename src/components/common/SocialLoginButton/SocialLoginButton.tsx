import type { SocialProvider } from '../../../types/api/auth';
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
      onClick={() => onClick(provider)}
    >
      <span className={styles.icon} aria-hidden="true">
        {provider === 'kakao' ? <KakaoIcon /> : 'N'}
      </span>
      <span>{isLoading ? '로그인 중...' : `${providerLabel} 로그인`}</span>
    </button>
  );
}

/** 외부 아이콘 라이브러리 없이 카카오 말풍선 모양을 표현합니다. */
function KakaoIcon() {
  return (
    <svg viewBox="0 0 28 26" role="presentation">
      <path d="M14 2C7.37 2 2 6.25 2 11.5c0 3.38 2.23 6.35 5.58 8.04l-1.1 4.05c-.1.36.31.65.63.44l4.84-3.14c.67.08 1.36.11 2.05.11 6.63 0 12-4.25 12-9.5S20.63 2 14 2Z" />
    </svg>
  );
}

export default SocialLoginButton;
