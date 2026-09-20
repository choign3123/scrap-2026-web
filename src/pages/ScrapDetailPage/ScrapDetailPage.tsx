import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import copyIcon from '../../assets/icons/copy.svg';
import folderIcon from '../../assets/icons/folder.svg';
import scrapIcon from '../../assets/icons/scrap-clip.svg';
import sidebarOpenIcon from '../../assets/icons/sidebar-open.svg';
import starFillIcon from '../../assets/icons/star-fill.svg';
import starOutlineIcon from '../../assets/icons/star-outline.svg';
import trashIcon from '../../assets/icons/trash.svg';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import MoveScrapModal from '../../components/scrap/MoveScrapModal/MoveScrapModal';
import MarkdownEditor from '../../components/scrap/MarkdownEditor/MarkdownEditor';
import {
  useDeleteScrapMutation,
  useMoveScrapMutation,
  useToggleScrapFavoriteMutation,
  useUpdateScrapMemoMutation,
} from '../../hooks/mutations/useScrapMutations';
import { useScrapDetailsQuery } from '../../hooks/queries/useScrapsQuery';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { toApiError } from '../../utils/apiError';
import styles from './ScrapDetailPage.module.css';

type DetailModal = 'move' | 'delete' | null;

/** URL 파라미터가 양의 정수일 때만 API 호출에 사용할 ID로 변환합니다. */
function parseScrapId(value: string | undefined) {
  const scrapId = Number(value);
  return Number.isInteger(scrapId) && scrapId > 0 ? scrapId : null;
}

/** 이전 목록 위치를 쿼리 파라미터에서 복원해 뒤로가기·삭제 후 이동에 사용합니다. */
function getDashboardDestination(searchParams: URLSearchParams) {
  if (searchParams.get('from') === 'favorites') {
    return '/dashboard?view=favorites';
  }

  const categoryId = Number(searchParams.get('fromCategory'));
  return Number.isInteger(categoryId) && categoryId > 0
    ? `/dashboard?category=${categoryId}`
    : '/dashboard';
}

interface SlidingTitleProps {
  title: string;
}

/** 제목이 실제 표시 폭을 넘을 때만 천천히 흐르는 제목을 만듭니다. */
function SlidingTitle({ title }: SlidingTitleProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const measurement = measurementRef.current;
    if (!viewport || !measurement) {
      return;
    }

    const updateOverflow = () => {
      setIsOverflowing(measurement.scrollWidth > viewport.clientWidth);
    };
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(viewport);
    observer.observe(measurement);
    updateOverflow();

    return () => observer.disconnect();
  }, [title]);

  return (
    <div ref={viewportRef} className={styles.titleViewport}>
      <span ref={measurementRef} className={styles.titleMeasurement} aria-hidden="true">
        {title}
      </span>
      {isOverflowing ? (
        <div className={styles.marqueeTrack} title={title}>
          <span>{title}</span>
          <span aria-hidden="true">{title}</span>
        </div>
      ) : (
        <h1>{title}</h1>
      )}
    </div>
  );
}

/** 스크랩 원문 정보, 메모와 관리 기능을 한 화면에서 제공하는 상세 페이지입니다. */
function ScrapDetailPage() {
  const navigate = useNavigate();
  const { scrapId: scrapIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const scrapId = parseScrapId(scrapIdParam);
  const detailQuery = useScrapDetailsQuery(scrapId);
  const updateMemoMutation = useUpdateScrapMemoMutation();
  const favoriteMutation = useToggleScrapFavoriteMutation();
  const moveMutation = useMoveScrapMutation();
  const deleteMutation = useDeleteScrapMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const [memo, setMemo] = useState('');
  const [hasImageError, setHasImageError] = useState(false);
  const [activeModal, setActiveModal] = useState<DetailModal>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMemoSaved, setIsMemoSaved] = useState(false);
  const dashboardDestination = getDashboardDestination(searchParams);
  const sourceCategoryId = Number(searchParams.get('fromCategory')) || null;
  const isFromFavorites = searchParams.get('from') === 'favorites';

  // 상세 화면은 스크랩 제목을 탭 제목으로 사용해 여러 탭을 구분하기 쉽게 합니다.
  useDocumentTitle(detailQuery.data?.title ?? '스크랩 상세');

  useEffect(() => {
    if (detailQuery.data) {
      setMemo(detailQuery.data.memo ?? '');
      setHasImageError(false);
    }
  }, [detailQuery.data]);

  useEffect(() => {
    setIsMemoSaved(false);
  }, [memo]);

  function navigateToCategory(categoryId: number) {
    navigate(`/dashboard?category=${categoryId}`);
  }

  async function handleCopyUrl() {
    if (!detailQuery.data) {
      return;
    }

    try {
      await navigator.clipboard.writeText(detailQuery.data.scrapURL);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  async function handleSaveMemo() {
    if (scrapId === null) {
      return;
    }

    setActionError(null);
    try {
      await updateMemoMutation.mutateAsync({ scrapId, memo });
      setIsMemoSaved(true);
    } catch (error) {
      setActionError(toApiError(error).message);
    }
  }

  async function handleToggleFavorite() {
    if (scrapId === null) {
      return;
    }

    setActionError(null);
    try {
      await favoriteMutation.mutateAsync(scrapId);
    } catch (error) {
      setActionError(toApiError(error).message);
    }
  }

  async function handleMove(categoryId: number) {
    if (scrapId === null) {
      return;
    }

    await moveMutation.mutateAsync({ scrapId, moveCategoryId: categoryId });
    setActiveModal(null);
    navigate(`/dashboard?category=${categoryId}`);
  }

  async function handleDelete() {
    if (scrapId === null) {
      return;
    }

    await deleteMutation.mutateAsync(scrapId);
    setActiveModal(null);
    navigate(dashboardDestination, { replace: true });
  }

  const scrap = detailQuery.data;
  const isMemoDirty = scrap ? memo !== (scrap.memo ?? '') : false;

  return (
    <main className={styles.page}>
      {isSidebarOpen && (
        <div className={styles.sidebarLayer}>
          <Sidebar
            selectedCategoryId={sourceCategoryId}
            isFavoritesSelected={isFromFavorites}
            onSelectCategory={navigateToCategory}
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

      <section className={styles.content} aria-label="스크랩 상세 정보">
        <header className={styles.header}>
          {!isSidebarOpen && (
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
            className={styles.backButton}
            onClick={() => navigate(dashboardDestination)}
          >
            <span aria-hidden="true">←</span>
            목록으로
          </button>
          <div className={styles.headerTitle}>
            {scrap && <SlidingTitle title={scrap.title || '제목 없음'} />}
          </div>
        </header>

        <div className={styles.scroller}>
          {detailQuery.isLoading && (
            <div className={styles.detailSkeleton} aria-label="스크랩 상세 불러오는 중">
              <span className={styles.imageSkeleton} />
              <div>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {(scrapId === null || detailQuery.isError) && (
            <div className={styles.statePanel} role="alert">
              <span>!</span>
              <h1>스크랩을 불러오지 못했습니다</h1>
              <p>
                {scrapId === null
                  ? '올바르지 않은 스크랩 주소입니다.'
                  : toApiError(detailQuery.error).message}
              </p>
              {scrapId !== null && (
                <button type="button" onClick={() => detailQuery.refetch()}>
                  다시 시도
                </button>
              )}
            </div>
          )}

          {scrap && (
            <div className={styles.detailContainer}>
              <section className={styles.heroGrid}>
                <a
                  className={styles.imagePanel}
                  href={scrap.scrapURL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="스크랩 원본 링크 열기"
                >
                  {scrap.imageURL && !hasImageError ? (
                    <>
                      {/* 같은 이미지를 확대한 블러 배경으로 사용해 여백을 원본 색감으로 채웁니다. */}
                      <span className={styles.imageBackdrop} aria-hidden="true">
                        <img src={scrap.imageURL} alt="" />
                      </span>
                      <img
                        className={styles.imageContent}
                        src={scrap.imageURL}
                        alt=""
                        onError={() => setHasImageError(true)}
                      />
                    </>
                  ) : (
                    <span className={styles.imageFallback}>
                      <img src={scrapIcon} alt="" />
                      <strong>미리보기 이미지가 없습니다</strong>
                      <small>클릭하면 원문 페이지로 이동합니다.</small>
                    </span>
                  )}
                  <span className={styles.openLabel}>원문 열기 ↗</span>
                </a>

                <div className={styles.informationPanel}>
                  <div className={styles.sectionHeading}>
                    <h2>링크 정보</h2>
                  </div>

                  <div className={styles.urlBox}>
                    <div>
                      <span>URL</span>
                      <a href={scrap.scrapURL} target="_blank" rel="noreferrer">
                        {scrap.scrapURL}
                      </a>
                    </div>
                    <button
                      type="button"
                      aria-label="URL 복사"
                      title={copyState === 'copied' ? '복사 완료' : 'URL 복사'}
                      onClick={handleCopyUrl}
                    >
                      {copyState === 'idle' ? (
                        <img src={copyIcon} alt="" />
                      ) : copyState === 'copied' ? '✓' : '!'}
                    </button>
                  </div>

                  <div className={styles.descriptionBox}>
                    <span>설명</span>
                    <p>{scrap.description || '저장된 설명이 없습니다.'}</p>
                  </div>
                </div>
              </section>

              <section className={styles.memoSection}>
                <div className={styles.memoHeader}>
                  <div>
                    <h2>메모</h2>
                  </div>
                  <div className={styles.saveArea}>
                    {isMemoSaved && !isMemoDirty && <span>저장되었습니다</span>}
                    <button
                      type="button"
                      disabled={!isMemoDirty || updateMemoMutation.isPending}
                      onClick={handleSaveMemo}
                    >
                      {updateMemoMutation.isPending ? '저장 중...' : '메모 저장'}
                    </button>
                  </div>
                </div>

                {/* 입력한 Markdown 단축 문법이 같은 편집 화면에서 즉시 서식으로 바뀝니다. */}
                <div className={styles.memoWorkspace}>
                  <MarkdownEditor
                    key={scrap.scrapId}
                    initialMarkdown={scrap.memo ?? ''}
                    onChange={setMemo}
                  />
                </div>
              </section>

              {actionError && (
                <p className={styles.actionError} role="alert">
                  {actionError}
                </p>
              )}
            </div>
          )}
        </div>

        {scrap && (
          <nav className={styles.actionDock} aria-label="스크랩 관리">
            <button
              type="button"
              className={styles.deleteAction}
              onClick={() => setActiveModal('delete')}
            >
              <img src={trashIcon} alt="" />
              삭제
            </button>
            <span className={styles.actionDivider} />
            <button type="button" onClick={() => setActiveModal('move')}>
              <img src={folderIcon} alt="" />
              카테고리 이동
            </button>
            <button
              type="button"
              className={scrap.isFavorite ? styles.favoriteAction : undefined}
              disabled={favoriteMutation.isPending}
              onClick={handleToggleFavorite}
            >
              <img src={scrap.isFavorite ? starFillIcon : starOutlineIcon} alt="" />
              {scrap.isFavorite ? '즐겨찾기됨' : '즐겨찾기'}
            </button>
          </nav>
        )}
      </section>

      {activeModal === 'move' && (
        <MoveScrapModal onMove={handleMove} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'delete' && scrap && (
        <ConfirmModal
          title="스크랩을 삭제할까요?"
          description={`‘${scrap.title || '제목 없음'}’ 스크랩을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`}
          confirmLabel="삭제"
          onConfirm={handleDelete}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}

export default ScrapDetailPage;
