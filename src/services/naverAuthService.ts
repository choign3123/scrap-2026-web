import { prepareNaverLogin } from './api/authService';
import { saveSocialReturnPath } from './socialLoginStorage';

/** 네이버 OAuth 인증 화면으로 이동합니다. 토큰 교환은 callback의 백엔드가 담당합니다. */
export async function startNaverLogin(returnPath: string) {
  const preparation = await prepareNaverLogin();
  saveSocialReturnPath(returnPath);

  // 네이버가 발급한 authorization URL로 같은 탭을 이동해 callback 이후 세션을 유지합니다.
  window.location.assign(preparation.authorizationUrl);
}
