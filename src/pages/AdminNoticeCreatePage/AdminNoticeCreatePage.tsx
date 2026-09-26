import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import backIcon from '../../assets/icons/expand-left-single.svg';
import AdminSidebar from '../../components/layout/AdminSidebar/AdminSidebar';
import MarkdownEditor from '../../components/scrap/MarkdownEditor/MarkdownEditor';
import { useCreateNoticeMutation } from '../../hooks/mutations/useNoticeMutations';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { checkAdminAuthority } from '../../services/api/authService';
import { toApiError } from '../../utils/apiError';
import styles from './AdminNoticeCreatePage.module.css';

/** 관리자 전용 공지 작성 페이지이며 본문은 Markdown 원문으로 서버에 저장합니다. */
function AdminNoticeCreatePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authorityQuery = useQuery({
    queryKey: ['admin', 'authority'],
    queryFn: checkAdminAuthority,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const createMutation = useCreateNoticeMutation();

  useDocumentTitle('공지사항 등록 | 스크랩');

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setFormError('공지 제목을 입력해 주세요.');
      return;
    }

    if (!trimmedContent) {
      setFormError('공지 내용을 입력해 주세요.');
      return;
    }

    setFormError('');

    try {
      const notice = await createMutation.mutateAsync({
        title: trimmedTitle,
        content: trimmedContent,
      });
      navigate(`/admin/notices/${notice.id}`, { replace: true });
    } catch (error) {
      setFormError(toApiError(error).message);
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

      <section className={styles.content} aria-labelledby="notice-create-title">
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            aria-label="공지 목록으로 돌아가기"
            onClick={() => navigate('/admin/notices')}
          >
            <img src={backIcon} alt="" />
          </button>
          <div>
            <h1 id="notice-create-title">공지 등록</h1>
            <p>작성한 내용은 모든 사용자에게 공지사항으로 표시됩니다.</p>
          </div>
        </header>

        <form className={styles.workspace} onSubmit={handleSubmit}>
          <div className={styles.formCard}>
            <label htmlFor="notice-title">제목</label>
            <div className={styles.titleInputRow}>
              <input
                id="notice-title"
                type="text"
                value={title}
                maxLength={255}
                disabled={createMutation.isPending}
                placeholder="공지사항 제목을 입력해 주세요."
                onChange={(event) => setTitle(event.target.value)}
              />
              <span>{title.length}/255</span>
            </div>

            <label className={styles.contentLabel}>내용</label>
            <div className={styles.editorArea}>
              {/* 메모 편집기와 같은 Tiptap 기반 Markdown 편집기를 재사용합니다. */}
              <MarkdownEditor
                initialMarkdown=""
                placeholder="공지 내용을 작성해 주세요. Markdown 문법을 사용할 수 있습니다."
                ariaLabel="공지사항 내용 작성"
                onChange={setContent}
              />
            </div>

            {formError && <p className={styles.formError} role="alert">{formError}</p>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} disabled={createMutation.isPending} onClick={() => navigate('/admin/notices')}>취소</button>
            <button type="submit" className={styles.submitButton} disabled={createMutation.isPending}>{createMutation.isPending ? '등록 중...' : '공지 등록'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AdminNoticeCreatePage;
