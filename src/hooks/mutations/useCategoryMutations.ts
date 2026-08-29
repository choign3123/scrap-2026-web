import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  updateCategorySequence,
  updateCategoryTitle,
} from '../../services/api/categoryService';
import type { CategoryListDTO } from '../../types/api/category';
import { categoryQueryKeys } from '../queries/useCategoriesQuery';
import { memberQueryKeys } from '../queries/useMyPageQuery';

interface UpdateTitleVariables {
  categoryId: number;
  newCategoryTitle: string;
}

interface SequenceMutationContext {
  previousCategories?: CategoryListDTO;
}

/** 카테고리 생성 후 목록과 상단 통계를 다시 조회합니다. */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.myPage() }),
      ]);
    },
  });
}

/** 카테고리 이름 변경 후 서버 목록을 다시 동기화합니다. */
export function useUpdateCategoryTitleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, newCategoryTitle }: UpdateTitleVariables) =>
      updateCategoryTitle(categoryId, newCategoryTitle),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
  });
}

/** 카테고리 삭제 후 목록과 사용자 통계를 갱신합니다. */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.myPage() }),
      ]);
    },
  });
}

/** 드래그 결과를 먼저 화면에 반영하고, 실패하면 기존 캐시로 되돌립니다. */
export function useUpdateCategorySequenceMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number[], SequenceMutationContext>({
    mutationFn: updateCategorySequence,
    onMutate: async (categoryIdList) => {
      await queryClient.cancelQueries({ queryKey: categoryQueryKeys.list() });

      const previousCategories = queryClient.getQueryData<CategoryListDTO>(
        categoryQueryKeys.list(),
      );

      if (previousCategories) {
        const categoryMap = new Map(
          previousCategories.categories.map((category) => [category.categoryId, category]),
        );
        const reorderedCategories = categoryIdList
          .map((categoryId, index) => {
            const category = categoryMap.get(categoryId);
            return category ? { ...category, sequence: index } : undefined;
          })
          .filter((category) => category !== undefined);

        queryClient.setQueryData<CategoryListDTO>(categoryQueryKeys.list(), {
          ...previousCategories,
          categories: reorderedCategories,
        });
      }

      return { previousCategories };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryQueryKeys.list(), context.previousCategories);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
  });
}
