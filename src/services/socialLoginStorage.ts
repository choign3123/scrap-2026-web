const SOCIAL_RETURN_PATH_KEY = 'scrap.social.returnPath';

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
