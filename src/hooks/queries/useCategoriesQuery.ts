import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../services/api/categoryService';

/** 카테고리 관련 query와 mutation이 공유하는 캐시 키입니다. */
export const categoryQueryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryQueryKeys.all, 'list'] as const,
};

/** 카테고리 전체 목록을 조회하고 React Query 캐시에 저장합니다. */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: getCategories,
  });
}
