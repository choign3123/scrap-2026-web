/** 토큰 발급 API가 반환하는 필드명을 Swagger 명세 그대로 표현합니다. */
export interface TokenDTO {
  accessToken: string;
  refreshToken: string;
}

/** 화면에서 지원하는 로그인 제공자입니다. 현재 두 버튼 모두 개발용 토큰을 발급합니다. */
export type SocialProvider = 'kakao' | 'naver';
