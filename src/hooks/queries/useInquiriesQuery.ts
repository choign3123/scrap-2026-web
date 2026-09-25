import { useQuery } from '@tanstack/react-query';
import { getAdminInquiries, getMyInquiries } from '../../services/api/inquiryService';
import type { InquiryStatus } from '../../types/api/inquiry';

/** 문의 목록을 생성 후 다시 조회할 수 있도록 한곳에서 query key를 관리합니다. */
export const inquiryQueryKeys = {
  all: ['inquiries'] as const,
  mine: () => [...inquiryQueryKeys.all, 'mine'] as const,
  admin: (page: number, status: InquiryStatus | 'ALL') =>
    [...inquiryQueryKeys.all, 'admin', { page, status }] as const,
};

/** 내 문의 목록을 조회하고 React Query 캐시에 보관합니다. */
export function useInquiriesQuery() {
  return useQuery({
    queryKey: inquiryQueryKeys.mine(),
    queryFn: getMyInquiries,
  });
}

/** 관리자 권한 확인 후 최신순으로 10개씩 문의 목록을 조회합니다. */
export function useAdminInquiriesQuery(
  page: number,
  status: InquiryStatus | 'ALL',
  enabled: boolean,
) {
  return useQuery({
    queryKey: inquiryQueryKeys.admin(page, status),
    queryFn: () =>
      getAdminInquiries({
        page,
        size: 10,
        direction: 'DESC',
        status: status === 'ALL' ? undefined : status,
      }),
    enabled,
  });
}
