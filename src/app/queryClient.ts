import { QueryClient } from '@tanstack/react-query';

/** 서버에서 조회한 데이터의 캐시와 재요청 정책을 관리합니다. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      // 생성·수정·삭제는 중복 실행 위험이 있어 자동으로 재시도하지 않습니다.
      retry: false,
    },
  },
});
