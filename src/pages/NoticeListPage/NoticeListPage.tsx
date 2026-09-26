import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sortDownIcon from '../../assets/icons/sort-down.svg';
import sortUpIcon from '../../assets/icons/sort-up.svg';
import NoticeList from '../../components/notice/NoticeList/NoticeList';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useNoticesQuery } from '../../hooks/queries/useNoticesQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { toApiError } from '../../utils/apiError';
import styles from './NoticeListPage.module.css';

/** 일반 사용자가 날짜순 공지를 조회하고 상세 화면으로 이동하는 페이지입니다. */
function NoticeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const noticesQuery = useNoticesQuery(page, direction);

  useDocumentTitle('공지사항 | 스크랩');

  return (
    <main className={styles.page}>
      {isSidebarOpen && (
        <div className={styles.sidebarLayer}>
          <Sidebar
            selectedCategoryId={null}
            isFavoritesSelected={false}
            onSelectCategory={(categoryId) => navigate(`/dashboard?category=${categoryId}`)}
            onSelectFavorites={() => navigate('/dashboard?view=favorites')}
            onCollapse={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {isSidebarOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="사이드바 닫기"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <section className={styles.content} aria-labelledby="notice-list-title">
        <header className={styles.header}>
          <div>
            <h1 id="notice-list-title">공지사항</h1>
            <p>스크랩 서비스의 새로운 소식과 중요한 안내를 확인해 주세요.</p>
          </div>
          <button
            type="button"
            className={styles.directionButton}
            aria-label={direction === 'DESC' ? '최신순, 오래된순으로 변경' : '오래된순, 최신순으로 변경'}
            onClick={() => {
              setDirection((current) => (current === 'DESC' ? 'ASC' : 'DESC'));
              setPage(0);
            }}
          >
            <img src={direction === 'DESC' ? sortDownIcon : sortUpIcon} alt="" />
            <span>{direction === 'DESC' ? '최신순' : '오래된순'}</span>
          </button>
        </header>

        <div className={styles.workspace}>
          {noticesQuery.isPending ? (
            <div className={styles.stateCard} aria-live="polite">공지사항을 불러오고 있습니다.</div>
          ) : noticesQuery.isError ? (
            <div className={`${styles.stateCard} ${styles.errorState}`} role="alert">
              <strong>공지사항을 불러오지 못했습니다.</strong>
              <p>{toApiError(noticesQuery.error).message}</p>
              <button type="button" onClick={() => noticesQuery.refetch()}>다시 시도</button>
            </div>
          ) : noticesQuery.data.notices.length === 0 ? (
            <div className={styles.stateCard}>
              <strong>등록된 공지사항이 없습니다.</strong>
              <p>새로운 소식이 등록되면 이곳에서 확인할 수 있습니다.</p>
            </div>
          ) : (
            <NoticeList
              notices={noticesQuery.data.notices}
              onSelect={(noticeId) => navigate(`/notices/${noticeId}`)}
            />
          )}

          {noticesQuery.data && noticesQuery.data.meta.totalElement > 0 && (
            <nav className={styles.pagination} aria-label="공지 목록 페이지 이동">
              <button
                type="button"
                disabled={page === 0 || noticesQuery.isFetching}
                onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              >
                이전
              </button>
              <span><strong>{page + 1}</strong> 페이지</span>
              <button
                type="button"
                disabled={noticesQuery.data.meta.isEnd || noticesQuery.isFetching}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                다음
              </button>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}

export default NoticeListPage;
