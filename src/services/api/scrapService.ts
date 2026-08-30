import type { ApiResponse } from '../../types/api/common';
import type {
  FavoriteScrapPageDTO,
  ScrapListItem,
  ScrapListPage,
  ScrapListRequest,
  ScrapPageDTO,
  ScrapSearchRequest,
  ScrapSearchResult,
  ScrapSearchResultDTO,
} from '../../types/api/scrap';
import { apiClient } from './apiClient';

/** 일반 스크랩 요약을 UI 공통 모델로 복사합니다. */
function toScrapListItem(scrap: ScrapPageDTO['scraps'][number]): ScrapListItem {
  return { ...scrap };
}

/** 필드명이 다른 즐겨찾기 응답을 UI 공통 모델로 변환합니다. */
function toFavoriteScrapListItem(
  scrap: FavoriteScrapPageDTO['scraps'][number],
): ScrapListItem {
  return {
    scrapId: scrap.scrapId,
    title: scrap.scrapTitle,
    scrapURL: scrap.scrapURL,
    imageURL: scrap.imageURL,
    isFavorite: true,
    scrapDate: scrap.scrapDate,
    categoryTitle: scrap.categoryTitle,
  };
}

/** 선택한 카테고리의 스크랩 한 페이지를 조회합니다. */
export async function getCategoryScraps({
  categoryId,
  sort,
  direction,
  page,
  size,
}: ScrapListRequest): Promise<ScrapListPage> {
  const response = await apiClient.get<ApiResponse<ScrapPageDTO>>('/auth/scraps', {
    params: { category: categoryId, sort, direction, page, size },
  });

  return {
    meta: response.data.result.meta,
    scraps: response.data.result.scraps.map(toScrapListItem),
  };
}

/** 즐겨찾기된 스크랩 한 페이지를 조회합니다. */
export async function getFavoriteScraps({
  sort,
  direction,
  page,
  size,
}: ScrapListRequest): Promise<ScrapListPage> {
  const response = await apiClient.get<ApiResponse<FavoriteScrapPageDTO>>(
    '/auth/scraps/favorite',
    { params: { sort, direction, page, size } },
  );

  return {
    meta: response.data.result.meta,
    scraps: response.data.result.scraps.map(toFavoriteScrapListItem),
  };
}

/** 특정 카테고리 검색은 서버 명세대로 페이지 파라미터 없이 전체 결과를 받습니다. */
export async function searchCategoryScraps({
  categoryId,
  query,
  sort,
  direction,
}: ScrapSearchRequest): Promise<ScrapSearchResult> {
  const response = await apiClient.get<ApiResponse<ScrapSearchResultDTO>>(
    `/auth/scraps/search/${categoryId}`,
    { params: { q: query, sort, direction } },
  );

  return {
    total: response.data.result.total,
    scraps: response.data.result.scraps.map(toScrapListItem),
  };
}

/** 즐겨찾기 검색 역시 별도 검색 API를 사용하며 결과는 한 번에 전체 조회합니다. */
export async function searchFavoriteScraps({
  query,
  sort,
  direction,
}: ScrapSearchRequest): Promise<ScrapSearchResult> {
  const response = await apiClient.get<ApiResponse<ScrapSearchResultDTO>>(
    '/auth/scraps/search/favorite',
    { params: { q: query, sort, direction } },
  );

  return {
    total: response.data.result.total,
    scraps: response.data.result.scraps.map(toScrapListItem),
  };
}
