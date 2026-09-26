import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import backIcon from '../../assets/icons/expand-left-single.svg';
import sidebarOpenIcon from '../../assets/icons/expand-right-double.svg';
import AdminSidebar from '../../components/layout/AdminSidebar/AdminSidebar';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import MarkdownEditor from '../../components/scrap/MarkdownEditor/MarkdownEditor';
import { useAuth } from '../../hooks/useAuth';
import { useNoticeDetailQuery } from '../../hooks/queries/useNoticesQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { checkAdminAuthority } from '../../services/api/authService';
import { toApiError } from '../../utils/apiError';
import styles from './NoticeDetailPage.module.css';

/** URL 값이 양의 정수인 경우에만 공지 상세 API에 사용할 ID로 변환합니다. */
function parseNoticeId(value: string | undefined) {
  const noticeId = Number(value);
  return Number.isInteger(noticeId) && noticeId > 0 ? noticeId : null;
}

/** 공지 등록일을 본문 상단에 읽기 쉬운 날짜로 표시합니다. */
function formatNoticeDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

/** 일반 사용자와 관리자가 함께 사용하는 공지 상세 페이지입니다. */
function NoticeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { noticeId: noticeIdParam } = useParams();
  const noticeId = parseNoticeId(noticeIdParam);
  const isAdminPath = location.pathname.startsWith('/admin/');
  const adminAuthorityQuery = useQuery({
    queryKey: ['admin', 'authority'],
    queryFn: checkAdminAuthority,
    enabled: isAdminPath,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const detailQuery = useNoticeDetailQuery(
    noticeId,
    !isAdminPath || adminAuthorityQuery.isSuccess,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const listDestination = isAdminPath ? '/admin/notices' : '/notices';

  useDocumentTitle(detailQuery.data?.title ?? '공지사항 | 스크랩');

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isAdminPath && adminAuthorityQuery.isPending) {
    return <main className={styles.accessState}>관리자 권한을 확인하고 있습니다.</main>;
  }

  if (isAdminPath && adminAuthorityQuery.isError) {
    return (
      <main className={styles.accessState} role="alert">
        <strong>접근할 수 없는 화면입니다.</strong>
        <p>{toApiError(adminAuthorityQuery.error).status === 403 ? '관리자 계정으로 로그인해 주세요.' : '권한을 확인하지 못했습니다.'}</p>
        <button type="button" onClick={() => navigate('/dashboard', { replace: true })}>사용자 화면으로 돌아가기</button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {isAdminPath ? (
        <AdminSidebar
          isLoggingOut={isLoggingOut}
          activeMenu="notices"
          onBackToService={() => navigate('/dashboard')}
          onLogout={handleLogout}
          onSelectInquiries={() => navigate('/admin')}
          onSelectNotices={() => navigate('/admin/notices')}
        />
      ) : isSidebarOpen && (
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

      {!isAdminPath && isSidebarOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="사이드바 닫기"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <section className={styles.content} aria-label="공지사항 상세">
        <header className={styles.header}>
          {!isAdminPath && !isSidebarOpen && (
            <button
              type="button"
              className={styles.iconButton}
              aria-label="사이드바 열기"
              onClick={() => setIsSidebarOpen(true)}
            >
              <img src={sidebarOpenIcon} alt="" />
            </button>
          )}
          <button
            type="button"
            className={styles.iconButton}
            aria-label="공지 목록으로 돌아가기"
            onClick={() => navigate(listDestination)}
          >
            <img src={backIcon} alt="" />
          </button>
          <h1>공지사항</h1>
        </header>

        <div className={styles.workspace}>
          {detailQuery.isPending && <div className={styles.stateCard}>공지사항을 불러오고 있습니다.</div>}

          {(noticeId === null || detailQuery.isError) && (
            <div className={`${styles.stateCard} ${styles.errorState}`} role="alert">
              <strong>공지사항을 불러오지 못했습니다.</strong>
              <p>{noticeId === null ? '올바르지 않은 공지사항 주소입니다.' : toApiError(detailQuery.error).message}</p>
              {noticeId !== null && (
                <button type="button" onClick={() => detailQuery.refetch()}>다시 시도</button>
              )}
            </div>
          )}

          {detailQuery.data && (
            <article className={styles.noticeArticle}>
              <header>
                <time dateTime={detailQuery.data.createdAt}>{formatNoticeDate(detailQuery.data.createdAt)}</time>
                <h2>{detailQuery.data.title}</h2>
              </header>
              {/* DB에는 Markdown 원문을 유지하고 상세 화면에서는 Tiptap이 읽기 전용으로 렌더링합니다. */}
              <MarkdownEditor
                key={detailQuery.data.id}
                initialMarkdown={detailQuery.data.content}
                onChange={() => undefined}
                ariaLabel="공지사항 본문"
                readOnly
              />
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default NoticeDetailPage;
