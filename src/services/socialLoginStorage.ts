const SOCIAL_RETURN_PATH_KEY = 'scrap.social.returnPath';
const LAST_SOCIAL_PROVIDER_KEY = 'scrap.auth.lastProvider';

/** 마지막으로 로그인을 완료한 SNS는 민감 정보가 아닌 제공자 구분값만 저장합니다. */
export function saveLastSocialProvider(provider: 'kakao' | 'naver') {
  try {
    window.localStorage.setItem(LAST_SOCIAL_PROVIDER_KEY, provider);
  } catch {
    // 브라우저 저장소가 차단되어도 인증 결과나 화면 이동에는 영향이 없어야 합니다.
  }
}

/** 이전에 성공한 SNS 로그인을 읽고, 손상되거나 알 수 없는 값은 무시합니다. */
export function getLastSocialProvider(): 'kakao' | 'naver' | null {
  try {
    const provider = window.localStorage.getItem(LAST_SOCIAL_PROVIDER_KEY);
    return provider === 'kakao' || provider === 'naver' ? provider : null;
  } catch {
    // 브라우저 저장소가 차단된 환경에서는 최근 로그인 표시만 생략합니다.
    return null;
  }
}

/** 소셜 인증 화면을 다녀온 뒤 복귀할 앱 내부 경로를 보관합니다. */
export function saveSocialReturnPath(path: string) {
  sessionStorage.setItem(SOCIAL_RETURN_PATH_KEY, path);
}

/** callback 처리 후 복귀 경로를 한 번만 사용하고 즉시 제거합니다. */
export function consumeSocialReturnPath() {
  const path = sessionStorage.getItem(SOCIAL_RETURN_PATH_KEY) || '/dashboard';
  sessionStorage.removeItem(SOCIAL_RETURN_PATH_KEY);
  return path;
}
