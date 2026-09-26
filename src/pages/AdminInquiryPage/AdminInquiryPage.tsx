import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../../assets/icons/close-round.svg';
import sortDownIcon from '../../assets/icons/sort-down.svg';
import sortUpIcon from '../../assets/icons/sort-up.svg';
import AdminSidebar from '../../components/layout/AdminSidebar/AdminSidebar';
import SelectMenu from '../../components/common/SelectMenu/SelectMenu';
import {
  useAnswerInquiryMutation,
  useConfirmInquiryMutation,
} from '../../hooks/mutations/useInquiryMutations';
import { useAdminInquiriesQuery } from '../../hooks/queries/useInquiriesQuery';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { checkAdminAuthority } from '../../services/api/authService';
import type {
  AdminInquiryQuery,
  InquiryDTO,
  InquiryStatus,
  InquiryType,
} from '../../types/api/inquiry';
import { toApiError } from '../../utils/apiError';
import styles from './AdminInquiryPage.module.css';

type AdminStatusFilter = InquiryStatus | 'ALL';

const STATUS_OPTIONS: Array<{ value: AdminStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체 상태' },
  { value: 'RECEIVED', label: '접수' },
  { value: 'PROCESSING', label: '처리 중' },
  { value: 'ANSWERED', label: '답변 완료' },
];

const TYPE_LABELS: Record<InquiryType, string> = {
  GENERAL: '일반 문의',
  BUG: '오류 신고',
  FEATURE_REQUEST: '기능 요청',
  IMPROVEMENT: '개선 요청',
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
  RECEIVED: '접수',
  PROCESSING: '처리 중',
  ANSWERED: '답변 완료',
};

/** 서버의 ISO 날짜 문자열을 사용자가 읽기 쉬운 한국 날짜와 시간으로 변환합니다. */
function formatDate(date: string | null) {
  if (!date) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** 관리자 권한이 확인된 계정만 문의를 처리할 수 있는 관리자 고객센터 화면입니다. */
function AdminInquiryPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<AdminStatusFilter>('ALL');
  const [direction, setDirection] = useState<AdminInquiryQuery['direction']>('DESC');
  const [answerTarget, setAnswerTarget] = useState<InquiryDTO | null>(null);
  const [answer, setAnswer] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const adminCheckQuery = useQuery({
    queryKey: ['admin', 'authority'],
    queryFn: checkAdminAuthority,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const inquiriesQuery = useAdminInquiriesQuery(
    page,
    status,
    direction,
    adminCheckQuery.isSuccess,
  );
  const confirmMutation = useConfirmInquiryMutation();
  const answerMutation = useAnswerInquiryMutation();

  useDocumentTitle('고객센터 관리 | 스크랩');

  // 답변 창을 Escape 키로 닫되, 저장 중에는 중복 동작을 막습니다.
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !answerMutation.isPending) {
        setAnswerTarget(null);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [answerMutation.isPending]);

  // 마지막 항목을 처리해 현재 페이지가 비게 되면 앞 페이지로 자연스럽게 이동합니다.
  useEffect(() => {
    if (
      inquiriesQuery.isSuccess
      && inquiriesQuery.data.inquiries.length === 0
      && page > 0
    ) {
      setPage((currentPage) => currentPage - 1);
    }
  }, [inquiriesQuery.data, inquiriesQuery.isSuccess, page]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleConfirm(inquiryId: number) {
    setActionError('');
    confirmMutation.mutate(inquiryId, {
      onError: (error) => setActionError(toApiError(error).message),
    });
  }

  function openAnswerModal(inquiry: InquiryDTO) {
    setActionError('');
    answerMutation.reset();
    setAnswer('');
    setAnswerTarget(inquiry);
  }

  function closeAnswerModal() {
    if (!answerMutation.isPending) {
      setAnswerTarget(null);
      setAnswer('');
    }
  }

  function handleAnswerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answerTarget || !answer.trim()) return;

    answerMutation.mutate(
      { inquiryId: answerTarget.inquiryId, answer: answer.trim() },
      {
        onSuccess: closeAnswerModal,
      },
    );
  }

  const authorityError = adminCheckQuery.error
    ? toApiError(adminCheckQuery.error)
    : null;
  const isDenied = authorityError?.status === 403;

  if (adminCheckQuery.isPending) {
    return (
      <main className={styles.accessPage} aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <h1>관리자 권한을 확인하고 있습니다.</h1>
        <p>잠시만 기다려 주세요.</p>
      </main>
    );
  }

  if (adminCheckQuery.isError) {
    return (
      <main className={styles.accessPage} aria-live="polite">
        <span className={styles.deniedIcon} aria-hidden="true">!</span>
        <h1>{isDenied ? '접근할 수 없는 화면입니다.' : '권한을 확인하지 못했습니다.'}</h1>
        <p>
          {isDenied
            ? '관리자 권한이 있는 계정으로 로그인해 주세요.'
            : authorityError?.message}
        </p>
        <button type="button" onClick={() => navigate('/dashboard', { replace: true })}>
          사용자 화면으로 돌아가기
        </button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <AdminSidebar
        isLoggingOut={isLoggingOut}
        activeMenu="inquiries"
        onBackToService={() => navigate('/dashboard')}
        onLogout={handleLogout}
        onSelectInquiries={() => navigate('/admin')}
        onSelectNotices={() => navigate('/admin/notices')}
      />

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>고객센터 관리</h1>
            <p>사용자가 등록한 문의를 확인하고 답변할 수 있습니다.</p>
          </div>
          <div className={styles.headerControls}>
            <div className={styles.filter}>
              <SelectMenu
                label="문의 상태 필터"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(nextStatus) => {
                  setStatus(nextStatus);
                  setPage(0);
                  setActionError('');
                }}
              />
            </div>
            <button
              type="button"
              className={styles.directionButton}
              aria-label={direction === 'DESC' ? '최신순, 오래된순으로 변경' : '오래된순, 최신순으로 변경'}
              title={direction === 'DESC' ? '최신순' : '오래된순'}
              onClick={() => {
                setDirection((current) => (current === 'DESC' ? 'ASC' : 'DESC'));
                setPage(0);
              }}
            >
              <img src={direction === 'DESC' ? sortDownIcon : sortUpIcon} alt="" />
              <span>{direction === 'DESC' ? '최신순' : '오래된순'}</span>
            </button>
          </div>
        </header>

        <div className={styles.workspace}>
          {inquiriesQuery.data && (
            <div className={styles.listSummary}>
              <span>문의 목록</span>
              <strong>{inquiriesQuery.data.meta.totalElement.toLocaleString()}건</strong>
            </div>
          )}

          {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}

          {inquiriesQuery.isPending ? (
            <div className={styles.stateCard} aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              <p>문의 목록을 불러오고 있습니다.</p>
            </div>
          ) : inquiriesQuery.isError ? (
            <div className={`${styles.stateCard} ${styles.errorState}`} role="alert">
              <strong>문의 목록을 불러오지 못했습니다.</strong>
              <p>{toApiError(inquiriesQuery.error).message}</p>
              <button type="button" onClick={() => inquiriesQuery.refetch()}>다시 시도</button>
            </div>
          ) : inquiriesQuery.data.inquiries.length === 0 ? (
            <div className={styles.stateCard}>
              <strong>해당 상태의 문의가 없습니다.</strong>
              <p>다른 상태를 선택하거나 새로운 문의를 기다려 주세요.</p>
            </div>
          ) : (
            <div className={styles.inquiryList}>
              {inquiriesQuery.data.inquiries.map((inquiry) => (
                <article key={inquiry.inquiryId} className={styles.inquiryCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.badges}>
                      <span className={styles.typeBadge}>{TYPE_LABELS[inquiry.type]}</span>
                      <span
                        className={`${styles.statusBadge} ${styles[inquiry.status.toLowerCase()]}`}
                      >
                        {STATUS_LABELS[inquiry.status]}
                      </span>
                    </div>
                    <time dateTime={inquiry.createdAt}>{formatDate(inquiry.createdAt)}</time>
                  </div>

                  <p className={styles.inquiryContent}>{inquiry.content}</p>

                  {inquiry.status === 'ANSWERED' && inquiry.answer && (
                    <div className={styles.savedAnswer}>
                      <div>
                        <strong>답변</strong>
                        {inquiry.answerAt && (
                          <time dateTime={inquiry.answerAt}>{formatDate(inquiry.answerAt)}</time>
                        )}
                      </div>
                      <p>{inquiry.answer}</p>
                    </div>
                  )}

                  {inquiry.status !== 'ANSWERED' && (
                    <div className={styles.cardActions}>
                      {inquiry.status === 'RECEIVED' ? (
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          disabled={confirmMutation.isPending}
                          onClick={() => handleConfirm(inquiry.inquiryId)}
                        >
                          {confirmMutation.isPending
                            && confirmMutation.variables === inquiry.inquiryId
                            ? '변경 중...'
                            : '처리 시작'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.primaryAction}
                          onClick={() => openAnswerModal(inquiry)}
                        >
                          답변 작성
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {inquiriesQuery.data && inquiriesQuery.data.meta.totalElement > 0 && (
            <nav className={styles.pagination} aria-label="문의 목록 페이지 이동">
              <button
                type="button"
                disabled={page === 0 || inquiriesQuery.isFetching}
                onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              >
                이전
              </button>
              <span><strong>{page + 1}</strong> 페이지</span>
              <button
                type="button"
                disabled={inquiriesQuery.data.meta.isEnd || inquiriesQuery.isFetching}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                다음
              </button>
            </nav>
          )}
        </div>
      </section>

      {answerTarget && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAnswerModal();
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-modal-title"
          >
            <header className={styles.modalHeader}>
              <div>
                <h2 id="answer-modal-title">문의 답변 작성</h2>
                <p>{TYPE_LABELS[answerTarget.type]} · {formatDate(answerTarget.createdAt)}</p>
              </div>
              <button
                type="button"
                aria-label="답변 창 닫기"
                disabled={answerMutation.isPending}
                onClick={closeAnswerModal}
              >
                <img src={closeIcon} alt="" />
              </button>
            </header>

            <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
              <div className={styles.originalInquiry}>
                <strong>문의 내용</strong>
                <p>{answerTarget.content}</p>
              </div>

              <label htmlFor="admin-inquiry-answer">답변 내용</label>
              <textarea
                id="admin-inquiry-answer"
                value={answer}
                placeholder="사용자에게 전달할 답변을 입력해 주세요."
                autoFocus
                disabled={answerMutation.isPending}
                onChange={(event) => setAnswer(event.target.value)}
              />

              {answerMutation.isError && (
                <p className={styles.formError} role="alert">
                  {toApiError(answerMutation.error).message}
                </p>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  disabled={answerMutation.isPending}
                  onClick={closeAnswerModal}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!answer.trim() || answerMutation.isPending}
                >
                  {answerMutation.isPending ? '등록 중...' : '답변 등록'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminInquiryPage;
