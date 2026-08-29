/** 백엔드가 일반 API에서 공통으로 사용하는 응답 구조입니다. */
export interface ApiResponse<T> {
  code: string;
  message: string;
  result: T;
}

/** 무한 스크롤 응답에 포함되는 페이지 정보입니다. */
export interface PageMeta {
  totalElement: number;
  numOfElement: number;
  isEnd: boolean;
}
