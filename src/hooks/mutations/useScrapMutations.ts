import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteScrap,
  moveScrap,
  toggleScrapFavorite,
  updateScrapMemo,
} from '../../services/api/scrapService';
import type { ScrapDetailsDTO } from '../../types/api/scrap';
import { categoryQueryKeys } from '../queries/useCategoriesQuery';
import { memberQueryKeys } from '../queries/useMyPageQuery';
import { scrapQueryKeys } from '../queries/useScrapsQuery';

interface UpdateMemoVariables {
  scrapId: number;
  memo: string;
}

interface MoveScrapVariables {
  scrapId: number;
  moveCategoryId: number;
}

/** 메모 저장 후 상세 캐시의 메모도 즉시 맞춰 화면을 안정적으로 유지합니다. */
export function useUpdateScrapMemoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scrapId, memo }: UpdateMemoVariables) =>
      updateScrapMemo(scrapId, memo),
    onSuccess: (_response, { scrapId, memo }) => {
      queryClient.setQueryData<ScrapDetailsDTO>(
        scrapQueryKeys.detail(scrapId),
        (current) => (current ? { ...current, memo } : current),
      );
    },
  });
}

/** 즐겨찾기 전환 결과를 상세에 반영하고 모든 목록을 다시 동기화합니다. */
export function useToggleScrapFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleScrapFavorite,
    onSuccess: async (result) => {
      queryClient.setQueryData<ScrapDetailsDTO>(
        scrapQueryKeys.detail(result.scrapId),
        (current) =>
          current ? { ...current, isFavorite: result.isFavorite } : current,
      );
      await queryClient.invalidateQueries({ queryKey: scrapQueryKeys.all });
    },
  });
}

/** 카테고리 이동 후 스크랩·카테고리 개수·통계를 함께 새로 조회합니다. */
export function useMoveScrapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scrapId, moveCategoryId }: MoveScrapVariables) =>
      moveScrap(scrapId, moveCategoryId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scrapQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.myPage() }),
      ]);
    },
  });
}

/** 스크랩 삭제 후 관련 목록과 사이드바 통계를 갱신합니다. */
export function useDeleteScrapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScrap,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scrapQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.myPage() }),
      ]);
    },
  });
}
