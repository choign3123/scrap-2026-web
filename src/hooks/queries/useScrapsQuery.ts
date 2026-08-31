import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getCategoryScraps,
  getFavoriteScraps,
  searchCategoryScraps,
  searchFavoriteScraps,
  getScrapDetails,
} from '../../services/api/scrapService';
import type { ScrapSort, SortDirection } from '../../types/api/scrap';

const SCRAP_PAGE_SIZE = 24;

interface ScrapQueryOptions {
  categoryId: number | null;
  isFavorites: boolean;
  sort: ScrapSort;
  direction: SortDirection;
  enabled: boolean;
}

interface ScrapSearchQueryOptions extends ScrapQueryOptions {
  query: string;
}

/** 스크랩 목록과 mutation이 함께 사용할 query key를 한곳에서 관리합니다. */
export const scrapQueryKeys = {
  all: ['scraps'] as const,
  list: (options: Omit<ScrapQueryOptions, 'enabled'>) =>
    [...scrapQueryKeys.all, 'list', options] as const,
  search: (options: Omit<ScrapSearchQueryOptions, 'enabled'>) =>
    [...scrapQueryKeys.all, 'search', options] as const,
  detail: (scrapId: number) => [...scrapQueryKeys.all, 'detail', scrapId] as const,
};

/** 일반 목록은 서버 페이지 정보를 이용해 끝까지 무한 스크롤합니다. */
export function useScrapsInfiniteQuery({
  categoryId,
  isFavorites,
  sort,
  direction,
  enabled,
}: ScrapQueryOptions) {
  return useInfiniteQuery({
    queryKey: scrapQueryKeys.list({ categoryId, isFavorites, sort, direction }),
    queryFn: ({ pageParam }) => {
      const request = {
        categoryId: categoryId ?? undefined,
        sort,
        direction,
        page: pageParam,
        size: SCRAP_PAGE_SIZE,
      };

      return isFavorites ? getFavoriteScraps(request) : getCategoryScraps(request);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.meta.isEnd ? undefined : allPages.length,
    enabled: enabled && (isFavorites || categoryId !== null),
  });
}

/** URL의 스크랩 ID가 유효할 때만 상세 정보를 조회합니다. */
export function useScrapDetailsQuery(scrapId: number | null) {
  return useQuery({
    queryKey: scrapQueryKeys.detail(scrapId ?? 0),
    queryFn: () => getScrapDetails(scrapId as number),
    enabled: scrapId !== null,
  });
}

/** 검색 결과는 요구사항대로 페이지 없이 한 번에 전체 조회합니다. */
export function useScrapSearchQuery({
  categoryId,
  isFavorites,
  query,
  sort,
  direction,
  enabled,
}: ScrapSearchQueryOptions) {
  return useQuery({
    queryKey: scrapQueryKeys.search({
      categoryId,
      isFavorites,
      query,
      sort,
      direction,
    }),
    queryFn: () => {
      const request = {
        categoryId: categoryId ?? undefined,
        query,
        sort,
        direction,
      };

      return isFavorites
        ? searchFavoriteScraps(request)
        : searchCategoryScraps(request);
    },
    enabled: enabled && query.length > 0 && (isFavorites || categoryId !== null),
  });
}
