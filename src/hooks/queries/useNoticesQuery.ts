import { useQuery } from '@tanstack/react-query';
import { getNotice, getNotices } from '../../services/api/noticeService';

/** 목록·상세·등록 후 갱신 대상을 일관되게 지정하기 위한 공지 Query Key입니다. */
export const noticeQueryKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeQueryKeys.all, 'list'] as const,
  list: (page: number, direction: 'ASC' | 'DESC') =>
    [...noticeQueryKeys.lists(), { page, direction }] as const,
  details: () => [...noticeQueryKeys.all, 'detail'] as const,
  detail: (noticeId: number) => [...noticeQueryKeys.details(), noticeId] as const,
};

/** 공지 등록일 기준으로 정렬된 목록을 10개씩 조회합니다. */
export function useNoticesQuery(page: number, direction: 'ASC' | 'DESC') {
  return useQuery({
    queryKey: noticeQueryKeys.list(page, direction),
    queryFn: () => getNotices({ page, size: 10, direction }),
  });
}

/** 유효한 공지 ID일 때만 상세 API를 호출합니다. */
export function useNoticeDetailQuery(noticeId: number | null, enabled = true) {
  return useQuery({
    queryKey: noticeQueryKeys.detail(noticeId ?? 0),
    queryFn: () => getNotice(noticeId as number),
    enabled: noticeId !== null && enabled,
  });
}
