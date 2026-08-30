import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  enabled: boolean;
  onLoadMore: () => void;
}

/** 화면 아래 감지 지점이 가까워지면 다음 스크랩 페이지를 불러옵니다. */
export function useInfiniteScroll({ enabled, onLoadMore }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return sentinelRef;
}
