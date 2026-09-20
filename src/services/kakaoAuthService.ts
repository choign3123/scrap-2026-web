import { prepareKakaoLogin } from './api/authService';
import { saveSocialReturnPath } from './socialLoginStorage';

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

/** 카카오 SDK script를 한 번만 불러와 로그인 화면의 초기 로딩을 단순하게 유지합니다. */
function loadKakaoSdk() {
  if (window.Kakao) {
    return Promise.resolve(window.Kakao);
  }

  return new Promise<KakaoSdk>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Kakao) resolve(window.Kakao);
        else reject(new Error('카카오 JavaScript SDK를 초기화하지 못했습니다.'));
      });
      existingScript.addEventListener('error', () =>
        reject(new Error('카카오 JavaScript SDK를 불러오지 못했습니다.')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.dataset.kakaoSdk = 'true';
    script.onload = () => {
      if (window.Kakao) resolve(window.Kakao);
      else reject(new Error('카카오 JavaScript SDK를 초기화하지 못했습니다.'));
    };
    script.onerror = () => reject(new Error('카카오 JavaScript SDK를 불러오지 못했습니다.'));
    document.head.appendChild(script);
  });
}

/** JavaScript 키로 SDK를 초기화합니다. 키는 VITE_ 환경변수로만 주입합니다. */
async function getInitializedKakaoSdk() {
  const javascriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

  if (!javascriptKey) {
    throw new Error('VITE_KAKAO_JAVASCRIPT_KEY 환경변수가 설정되지 않았습니다.');
  }

  const kakao = await loadKakaoSdk();

  if (!kakao.isInitialized()) {
    kakao.init(javascriptKey);
  }

  return kakao;
}

/** 카카오 인증 화면으로 이동합니다. state 생성과 실제 토큰 교환은 백엔드가 담당합니다. */
export async function startKakaoLogin(returnPath: string) {
  const kakao = await getInitializedKakaoSdk();
  const preparation = await prepareKakaoLogin();
  saveSocialReturnPath(returnPath);
  kakao.Auth.authorize({
    redirectUri: preparation.redirectUri,
    state: preparation.state,
  });
}
