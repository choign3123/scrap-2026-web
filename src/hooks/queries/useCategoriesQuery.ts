import { useQuery } from '@tanstack/react-query';
import { getCategories, getCategorySelection } from '../../services/api/categoryService';

/** 카테고리 관련 query와 mutation이 공유하는 캐시 키입니다. */
export const categoryQueryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryQueryKeys.all, 'list'] as const,
  selection: () => [...categoryQueryKeys.all, 'selection'] as const,
};

/** 카테고리 전체 목록을 조회하고 React Query 캐시에 저장합니다. */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: getCategories,
  });
}

/** 스크랩 이동 팝업이 열렸을 때 선택용 카테고리 목록을 조회합니다. */
export function useCategorySelectionQuery(enabled: boolean) {
  return useQuery({
    queryKey: categoryQueryKeys.selection(),
    queryFn: getCategorySelection,
    enabled,
  });
}
