import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotice } from '../../services/api/noticeService';
import type { CreateNoticeRequest } from '../../types/api/notice';
import { noticeQueryKeys } from '../queries/useNoticesQuery';

/** 새 공지 등록 후 목록 캐시를 갱신해 최신 공지가 바로 보이게 합니다. */
export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateNoticeRequest) => createNotice(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: noticeQueryKeys.lists() });
    },
  });
}
