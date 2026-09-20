import { useEffect } from 'react';

/**
 * 현재 화면의 의미 있는 정보를 브라우저 탭 제목에 반영합니다.
 * 빈 제목은 서비스 기본 이름으로 대체해 빈 탭 제목이 남지 않게 합니다.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title?.trim() || '스크랩';
  }, [title]);
}
