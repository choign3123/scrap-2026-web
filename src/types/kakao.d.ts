declare global {
  /** 카카오 JavaScript SDK에서 프론트가 사용하는 최소 타입만 정의합니다. */
  interface KakaoSdk {
    init: (javascriptKey: string) => void;
    isInitialized: () => boolean;
    Auth: {
      authorize: (options: { redirectUri: string; state?: string }) => void;
    };
  }

  interface Window {
    Kakao?: KakaoSdk;
  }
}

export {};
