import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import addFillIcon from '../../assets/icons/add-round-fill.svg';
import addIcon from '../../assets/icons/add-round.svg';
import closeFillIcon from '../../assets/icons/close-round-fill.svg';
import closeIcon from '../../assets/icons/close-round.svg';
import sidebarOpenIcon from '../../assets/icons/expand-right-double.svg';
import questionIcon from '../../assets/icons/question.svg';
import SelectMenu from '../../components/common/SelectMenu/SelectMenu';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useCreateInquiryMutation } from '../../hooks/mutations/useInquiryMutations';
import { useInquiriesQuery } from '../../hooks/queries/useInquiriesQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { InquiryDTO, InquiryStatus, InquiryType } from '../../types/api/inquiry';
import { toApiError } from '../../utils/apiError';
import styles from './CustomerCenterPage.module.css';

const INQUIRY_TYPES: Array<{ value: InquiryType; label: string }> = [
  { value: 'GENERAL', label: '일반 문의' },
  { value: 'BUG', label: '오류 신고' },
  { value: 'FEATURE_REQUEST', label: '기능 요청' },
  { value: 'IMPROVEMENT', label: '개선 요청' },
];

const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  RECEIVED: '접수',
  PROCESSING: '처리 중',
  ANSWERED: '답변 완료',
};

const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  GENERAL: '일반 문의',
  BUG: '오류 신고',
  FEATURE_REQUEST: '기능 요청',
  IMPROVEMENT: '개선 요청',
};

/** 화면에는 날짜와 시각을 한국어 형식으로 표시합니다. */
function formatDate(value: string | null) {
  if (!value) return '날짜 정보 없음';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '날짜 정보 없음'
    : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/** 문의 목록은 100자를 넘으면 말줄임표를 붙여 요약합니다. */
function getInquiryPreview(content: string) {
  const characters = Array.from(content);
  return characters.length > 100 ? `${characters.slice(0, 100).join('')}…` : content;
}

/** 답변이 있는 경우에만 목록에서 접고 펼칠 수 있는 답변 영역을 표시합니다. */
function InquiryItem({ inquiry }: { inquiry: InquiryDTO }) {
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const hasAnswer = Boolean(inquiry.answer?.trim());
  const isContentLong = Array.from(inquiry.content).length > 100;

  return (
    <article className={styles.inquiryCard}>
      <div className={styles.cardHeading}>
        <div className={styles.badges}>
          <span className={styles.typeBadge}>{INQUIRY_TYPE_LABEL[inquiry.type]}</span>
          <span className={`${styles.statusBadge} ${styles[inquiry.status.toLowerCase()]}`}>
            {INQUIRY_STATUS_LABEL[inquiry.status]}
          </span>
        </div>
        <time className={styles.date}>{formatDate(inquiry.createdAt)}</time>
      </div>

      <p className={styles.inquiryContent}>
        {isContentExpanded ? inquiry.content : getInquiryPreview(inquiry.content)}
      </p>

      {isContentLong && (
        <button
          type="button"
          className={styles.contentToggleButton}
          aria-expanded={isContentExpanded}
          onClick={() => setIsContentExpanded((expanded) => !expanded)}
        >
          {isContentExpanded ? '접기' : '더보기'}
        </button>
      )}

      {hasAnswer && (
        <div className={styles.answerArea}>
          <button
            type="button"
            aria-expanded={isAnswerExpanded}
            onClick={() => setIsAnswerExpanded((expanded) => !expanded)}
          >
            {isAnswerExpanded ? '답변 숨기기' : '답변 확인하기'}
            <span aria-hidden="true">{isAnswerExpanded ? '−' : '+'}</span>
          </button>
          {isAnswerExpanded && (
            <div className={styles.answerContent}>
              {inquiry.answerAt && <time>{formatDate(inquiry.answerAt)}</time>}
              <p>{inquiry.answer}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/** 로그인 사용자가 문의를 등록하고 과거 문의와 답변을 확인하는 고객센터입니다. */
function CustomerCenterPage() {
  const navigate = useNavigate();
  const inquiriesQuery = useInquiriesQuery();
  const createMutation = useCreateInquiryMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>('GENERAL');
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  useDocumentTitle('고객센터 | 스크랩');

  useEffect(() => {
    if (!isCreateModalOpen) return undefined;

    // 등록 창이 열렸을 때 Escape 키로도 닫을 수 있게 합니다.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !createMutation.isPending) {
        setIsCreateModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createMutation.isPending, isCreateModalOpen]);

  function openCreateModal() {
    setInquiryType('GENERAL');
    setContent('');
    setSubmitError(null);
    setIsCreateModalOpen(true);
  }

  async function handleCreateInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!content.trim()) {
      setSubmitError('문의 내용을 입력해 주세요.');
      return;
    }

    try {
      await createMutation.mutateAsync({ type: inquiryType, content: content.trim() });
      setIsCreateModalOpen(false);
      setContent('');
    } catch (error) {
      setSubmitError(toApiError(error).message);
    }
  }

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
      {!isSidebarOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="사이드바 닫기"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      <section className={styles.content} aria-labelledby="customer-center-title">
        <header className={styles.header}>
          {!isSidebarOpen && (
            <button
              type="button"
              className={styles.openSidebarButton}
              aria-label="사이드바 열기"
              onClick={() => setIsSidebarOpen(true)}
            >
              <img src={sidebarOpenIcon} alt="" />
            </button>
          )}
          <h1 id="customer-center-title">고객센터</h1>
          <button type="button" className={styles.createButton} onClick={openCreateModal}>
            <span className={styles.iconSwap} aria-hidden="true">
              <img className={styles.defaultIcon} src={addIcon} alt="" />
              <img className={styles.hoverIcon} src={addFillIcon} alt="" />
            </span>
            문의 등록
          </button>
        </header>

        <div className={styles.listArea}>
          {inquiriesQuery.isLoading && (
            <div className={styles.stateCard} role="status">문의 목록을 불러오고 있습니다.</div>
          )}

          {inquiriesQuery.isError && (
            <div className={`${styles.stateCard} ${styles.errorState}`} role="alert">
              <p>{toApiError(inquiriesQuery.error).message}</p>
              <button type="button" onClick={() => inquiriesQuery.refetch()}>다시 시도</button>
            </div>
          )}

          {inquiriesQuery.isSuccess && inquiriesQuery.data.inquiries.length === 0 && (
            <div className={styles.emptyState}>
              <span aria-hidden="true"><img src={questionIcon} alt="" /></span>
              <h2>등록한 문의가 없습니다</h2>
              <p>궁금한 점이나 불편한 점을 남겨주시면 확인 후 답변드릴게요.</p>
              <button type="button" className={styles.createButton} onClick={openCreateModal}>
                <span className={styles.iconSwap} aria-hidden="true">
                  <img className={styles.defaultIcon} src={addIcon} alt="" />
                  <img className={styles.hoverIcon} src={addFillIcon} alt="" />
                </span>
                첫 문의 등록하기
              </button>
            </div>
          )}

          {inquiriesQuery.isSuccess && inquiriesQuery.data.inquiries.length > 0 && (
            <div className={styles.inquiryList}>
              {inquiriesQuery.data.inquiries.map((inquiry) => (
                <InquiryItem key={inquiry.inquiryId} inquiry={inquiry} />
              ))}
            </div>
          )}
        </div>
      </section>

      {isCreateModalOpen && (
        <div className={styles.modalBackdrop} onMouseDown={() => !createMutation.isPending && setIsCreateModalOpen(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <h2 id="inquiry-modal-title">문의 등록</h2>
              <button
                type="button"
                aria-label="닫기"
                disabled={createMutation.isPending}
                onClick={() => setIsCreateModalOpen(false)}
              >
                <span className={styles.iconSwap} aria-hidden="true">
                  <img className={styles.defaultIcon} src={closeIcon} alt="" />
                  <img className={styles.hoverIcon} src={closeFillIcon} alt="" />
                </span>
              </button>
            </header>
            <form className={styles.inquiryForm} onSubmit={handleCreateInquiry}>
              <label htmlFor="inquiry-type">문의 종류</label>
              <SelectMenu
                id="inquiry-type"
                label="문의 종류"
                value={inquiryType}
                options={INQUIRY_TYPES}
                disabled={createMutation.isPending}
                onChange={setInquiryType}
              />

              <label htmlFor="inquiry-content">문의 내용</label>
              <textarea
                id="inquiry-content"
                required
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="문의하실 내용을 입력해 주세요."
                rows={8}
              />
              {submitError && <p className={styles.formError} role="alert">{submitError}</p>}

              <footer className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  disabled={createMutation.isPending}
                  onClick={() => setIsCreateModalOpen(false)}
                >취소</button>
                <button type="submit" className={styles.submitButton} disabled={createMutation.isPending}>
                  {createMutation.isPending ? '등록 중...' : '문의 등록'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default CustomerCenterPage;
