import { useQuery } from '@tanstack/react-query';
import { getMyPage } from '../../services/api/memberService';

/** 마이페이지 서버 데이터의 캐시 키를 다른 mutation에서도 재사용합니다. */
export const memberQueryKeys = {
  all: ['member'] as const,
  myPage: () => [...memberQueryKeys.all, 'my-page'] as const,
};

/** 사용자 이름과 통계를 조회하고 Loading/Error 상태를 함께 제공합니다. */
export function useMyPageQuery() {
  return useQuery({
    queryKey: memberQueryKeys.myPage(),
    queryFn: getMyPage,
  });
}
