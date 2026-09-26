import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import addIcon from '../../assets/icons/add-round.svg';
import sortDownIcon from '../../assets/icons/sort-down.svg';
import sortUpIcon from '../../assets/icons/sort-up.svg';
import AdminSidebar from '../../components/layout/AdminSidebar/AdminSidebar';
import NoticeList from '../../components/notice/NoticeList/NoticeList';
import { useAuth } from '../../hooks/useAuth';
import { useNoticesQuery } from '../../hooks/queries/useNoticesQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { checkAdminAuthority } from '../../services/api/authService';
import { toApiError } from '../../utils/apiError';
import styles from './AdminNoticeListPage.module.css';

/** 관리자 권한으로 공지를 확인하고 새 공지 등록 페이지로 이동하는 목록 화면입니다. */
function AdminNoticeListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authorityQuery = useQuery({
    queryKey: ['admin', 'authority'],
    queryFn: checkAdminAuthority,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const noticesQuery = useNoticesQuery(page, direction);

  useDocumentTitle('공지사항 관리 | 스크랩');

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (authorityQuery.isPending) {
    return <main className={styles.accessState}>관리자 권한을 확인하고 있습니다.</main>;
  }

  if (authorityQuery.isError) {
    return (
      <main className={styles.accessState} role="alert">
        <strong>접근할 수 없는 화면입니다.</strong>
        <p>{toApiError(authorityQuery.error).status === 403 ? '관리자 계정으로 로그인해 주세요.' : '권한을 확인하지 못했습니다.'}</p>
        <button type="button" onClick={() => navigate('/dashboard', { replace: true })}>사용자 화면으로 돌아가기</button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <AdminSidebar
        isLoggingOut={isLoggingOut}
        activeMenu="notices"
        onBackToService={() => navigate('/dashboard')}
        onLogout={handleLogout}
        onSelectInquiries={() => navigate('/admin')}
        onSelectNotices={() => navigate('/admin/notices')}
      />

      <section className={styles.content} aria-labelledby="admin-notice-list-title">
        <header className={styles.header}>
          <div>
            <h1 id="admin-notice-list-title">공지사항 관리</h1>
            <p>서비스에 표시되는 공지사항을 등록하고 확인할 수 있습니다.</p>
          </div>
          <div className={styles.headerActions}>
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
            <button type="button" className={styles.createButton} onClick={() => navigate('/admin/notices/new')}>
              <img src={addIcon} alt="" />
              공지 등록
            </button>
          </div>
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
              <p>공지 등록 버튼을 눌러 첫 공지를 작성해 주세요.</p>
            </div>
          ) : (
            <NoticeList
              notices={noticesQuery.data.notices}
              onSelect={(noticeId) => navigate(`/admin/notices/${noticeId}`)}
            />
          )}

          {noticesQuery.data && noticesQuery.data.meta.totalElement > 0 && (
            <nav className={styles.pagination} aria-label="공지 목록 페이지 이동">
              <button type="button" disabled={page === 0 || noticesQuery.isFetching} onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}>이전</button>
              <span><strong>{page + 1}</strong> 페이지</span>
              <button type="button" disabled={noticesQuery.data.meta.isEnd || noticesQuery.isFetching} onClick={() => setPage((currentPage) => currentPage + 1)}>다음</button>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminNoticeListPage;
