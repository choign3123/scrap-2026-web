/** 공지 목록과 상세 화면에서 공통으로 사용하는 공지 정보입니다. */
export interface NoticeDTO {
  id: number;
  title: string;
  createdAt: string;
}

/** 공지 상세 화면과 관리자 등록 응답에서 사용하는 본문 포함 정보입니다. */
export interface NoticeDetailDTO extends NoticeDTO {
  content: string;
}

/** 공지 목록 API의 페이지 정보입니다. */
export interface NoticePageMeta {
  totalElement: number;
  numOfElement: number;
  isEnd: boolean;
}

/** GET /auth/notices 응답의 result 형식입니다. */
export interface NoticeListDTO {
  notices: NoticeDTO[];
  meta: NoticePageMeta;
}

/** 목록 조회 시 서버에 전달하는 페이징과 날짜 정렬 조건입니다. */
export interface NoticeListQuery {
  page: number;
  size: number;
  direction: 'ASC' | 'DESC';
}

/** 관리자가 새 공지를 등록할 때 서버에 전달하는 요청 형식입니다. */
export interface CreateNoticeRequest {
  title: string;
  content: string;
}
