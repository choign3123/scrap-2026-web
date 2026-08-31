import type { PageMeta } from './common';

/** Swagger에서 허용하는 정렬 기준과 방향 값입니다. */
export type ScrapSort = 'TITLE' | 'SCRAP_DATE';
export type SortDirection = 'ASC' | 'DESC';

/** 카테고리별 목록·검색 API가 반환하는 스크랩 요약 형식입니다. */
export interface ScrapSummaryDTO {
  scrapId: number;
  title: string;
  scrapURL: string;
  imageURL: string | null;
  isFavorite: boolean;
  scrapDate: string;
}

/** 즐겨찾기 목록 API는 일반 목록과 다른 필드명을 사용하므로 별도 타입으로 보존합니다. */
export interface FavoriteScrapSummaryDTO {
  categoryTitle: string;
  scrapId: number;
  scrapTitle: string;
  scrapURL: string;
  imageURL: string | null;
  scrapDate: string;
}

export interface ScrapPageDTO {
  meta: PageMeta;
  scraps: ScrapSummaryDTO[];
}

export interface FavoriteScrapPageDTO {
  meta: PageMeta;
  scraps: FavoriteScrapSummaryDTO[];
}

export interface ScrapSearchResultDTO {
  total: number;
  scraps: ScrapSummaryDTO[];
}

/** 서로 다른 API 응답을 목록 컴포넌트가 공통으로 표시하기 위한 화면 모델입니다. */
export interface ScrapListItem {
  scrapId: number;
  title: string;
  scrapURL: string;
  imageURL: string | null;
  isFavorite: boolean;
  scrapDate: string;
  categoryTitle?: string;
}

export interface ScrapListPage {
  meta: PageMeta;
  scraps: ScrapListItem[];
}

export interface ScrapSearchResult {
  total: number;
  scraps: ScrapListItem[];
}

export interface ScrapListRequest {
  categoryId?: number;
  sort: ScrapSort;
  direction: SortDirection;
  page: number;
  size: number;
}

export interface ScrapSearchRequest {
  categoryId?: number;
  query: string;
  sort: ScrapSort;
  direction: SortDirection;
}

/** GET /auth/scraps/{scrap-id} API의 result 구조입니다. */
export interface ScrapDetailsDTO {
  scrapId: number;
  title: string;
  scrapURL: string;
  imageURL: string | null;
  description: string;
  memo: string;
  isFavorite: boolean;
}

/** 스크랩 메모 수정 API에 전달하는 요청 본문입니다. */
export interface UpdateScrapMemoRequest {
  memo: string;
}

/** 즐겨찾기 토글 API가 반환하는 result 구조입니다. */
export interface UpdateScrapFavoriteDTO {
  scrapId: number;
  isFavorite: boolean;
}

/** 스크랩을 다른 카테고리로 옮길 때 전달하는 요청 본문입니다. */
export interface MoveScrapRequest {
  moveCategoryId: number;
}
