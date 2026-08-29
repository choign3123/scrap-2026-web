/** Swagger의 마이페이지 회원 정보 필드입니다. */
export interface MemberInfoDTO {
  name: string;
}

/** 사이드바 상단에 표시할 사용자의 카테고리/스크랩 통계입니다. */
export interface MemberStatisticsDTO {
  totalCategory: number;
  totalScrap: number;
}

/** GET /auth/mypage API의 result 구조입니다. */
export interface MyPageDTO {
  memberInfo: MemberInfoDTO;
  statistics: MemberStatisticsDTO;
}
