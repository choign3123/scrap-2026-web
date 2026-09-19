import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import sidebarOpenIcon from '../../assets/icons/sidebar-open.svg';
import ScrapCard from '../../components/scrap/ScrapCard/ScrapCard';
import ScrapListRow from '../../components/scrap/ScrapListRow/ScrapListRow';
import ScrapSearchDock from '../../components/scrap/ScrapSearchDock/ScrapSearchDock';
import ScrapToolbar, {
  type ScrapViewMode,
} from '../../components/scrap/ScrapToolbar/ScrapToolbar';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import {
  useScrapSearchQuery,
  useScrapsInfiniteQuery,
} from '../../hooks/queries/useScrapsQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { ScrapSort, SortDirection } from '../../types/api/scrap';
import { toApiError } from '../../utils/apiError';
import styles from './DashboardPage.module.css';

/** 사용자가 마지막으로 선택한 스크랩 보기 방식을 브라우저에 저장할 때 사용하는 키입니다. */
const SCRAP_VIEW_MODE_STORAGE_KEY = 'scrap.dashboard.viewMode';

/** URL에서 유효한 카테고리 ID만 숫자로 변환합니다. */
function parseCategoryId(categoryIdValue: string | null) {
  if (!categoryIdValue) {
    return null;
  }

  const categoryId = Number(categoryIdValue);
  return Number.isFinite(categoryId) ? categoryId : null;
}

/** 저장값이 유효할 때만 사용하고, 처음 방문했거나 값이 손상됐으면 격자형을 사용합니다. */
function getInitialViewMode(): ScrapViewMode {
  try {
    const savedViewMode = window.localStorage.getItem(SCRAP_VIEW_MODE_STORAGE_KEY);
    return savedViewMode === 'list' || savedViewMode === 'grid' ? savedViewMode : 'grid';
  } catch {
    // 브라우저 설정으로 저장소를 사용할 수 없는 경우에도 화면은 정상 동작해야 합니다.
    return 'grid';
  }
}

/** 로그인 후 카테고리·즐겨찾기 스크랩을 탐색하는 메인 화면입니다. */
function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const [sort, setSort] = useState<ScrapSort>('SCRAP_DATE');
  const [direction, setDirection] = useState<SortDirection>('DESC');
  const [viewMode, setViewMode] = useState<ScrapViewMode>(getInitialViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 300);
  const categoriesQuery = useCategoriesQuery();
  const isFavoritesSelected = searchParams.get('view') === 'favorites';
  const selectedCategoryId = isFavoritesSelected
    ? null
    : parseCategoryId(searchParams.get('category'));
  const isSearching = debouncedSearchTerm.length > 0;

  const scrapsQuery = useScrapsInfiniteQuery({
    categoryId: selectedCategoryId,
    isFavorites: isFavoritesSelected,
    sort,
    direction,
    enabled: !isSearching,
  });
  const searchQuery = useScrapSearchQuery({
    categoryId: selectedCategoryId,
    isFavorites: isFavoritesSelected,
    query: debouncedSearchTerm,
    sort,
    direction,
    enabled: isSearching,
  });

  useEffect(() => {
    if (isFavoritesSelected || selectedCategoryId !== null || !categoriesQuery.data) {
      return;
    }

    // 처음 진입하면 API가 알려준 기본 카테고리를 자동으로 선택합니다.
    const defaultCategory = categoriesQuery.data.categories.find(
      (category) => category.isDefault,
    );

    if (defaultCategory) {
      setSearchParams({ category: String(defaultCategory.categoryId) }, { replace: true });
    }
  }, [categoriesQuery.data, isFavoritesSelected, selectedCategoryId, setSearchParams]);

  useEffect(() => {
    // 다른 카테고리로 이동하면 이전 범위의 검색어가 남지 않도록 초기화합니다.
    setSearchTerm('');
  }, [isFavoritesSelected, selectedCategoryId]);

  useEffect(() => {
    try {
      // 상세 화면을 다녀오거나 페이지를 새로 열어도 마지막 보기 방식을 유지합니다.
      window.localStorage.setItem(SCRAP_VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // 저장소 접근 실패는 목록 탐색 자체를 막을 오류가 아니므로 현재 상태만 유지합니다.
    }
  }, [viewMode]);

  const scraps = useMemo(
    () =>
      isSearching
        ? (searchQuery.data?.scraps ?? [])
        : (scrapsQuery.data?.pages.flatMap((page) => page.scraps) ?? []),
    [isSearching, scrapsQuery.data?.pages, searchQuery.data?.scraps],
  );
  const totalScraps = isSearching
    ? searchQuery.data?.total
    : scrapsQuery.data?.pages[0]?.meta.totalElement;
  const isInitialLoading = isSearching
    ? searchQuery.isLoading
    : scrapsQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : scrapsQuery.isError;
  const currentError = isSearching ? searchQuery.error : scrapsQuery.error;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = scrapsQuery;

  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const infiniteScrollRef = useInfiniteScroll({
    enabled: !isSearching && Boolean(hasNextPage),
    onLoadMore: loadNextPage,
  });

  function closeMobileSidebarAfterSelection() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      setIsSidebarOpen(false);
    }
  }

  function handleSelectCategory(categoryId: number) {
    setSearchParams({ category: String(categoryId) });
    closeMobileSidebarAfterSelection();
  }

  function handleSelectFavorites() {
    setSearchParams({ view: 'favorites' });
    closeMobileSidebarAfterSelection();
  }

  function handleRetry() {
    if (isSearching) {
      searchQuery.refetch();
    } else {
      scrapsQuery.refetch();
    }
  }

  function handleAddScrap() {
    const categoryQuery = selectedCategoryId ? `?category=${selectedCategoryId}` : '';
    navigate(`/scraps/new${categoryQuery}`);
  }

  const selectedCategory = categoriesQuery.data?.categories.find(
    (category) => category.categoryId === selectedCategoryId,
  );
  const pageTitle = isFavoritesSelected
    ? '즐겨찾기'
    : selectedCategory?.categoryTitle ?? '스크랩';
  const detailSource = isFavoritesSelected
    ? 'from=favorites'
    : `fromCategory=${selectedCategoryId ?? ''}`;

  return (
    <main className={styles.page}>
      {isSidebarOpen && (
        <div className={styles.sidebarLayer}>
          <Sidebar
            selectedCategoryId={selectedCategoryId}
            isFavoritesSelected={isFavoritesSelected}
            onSelectCategory={handleSelectCategory}
            onSelectFavorites={handleSelectFavorites}
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

      <section className={styles.content} aria-labelledby="dashboard-heading">
        <header className={styles.contentHeader}>
          <div className={styles.titleArea}>
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
            <div>
              <div className={styles.titleLine}>
                <h1 id="dashboard-heading">{pageTitle}</h1>
              </div>
            </div>
          </div>

          <ScrapToolbar
            sort={sort}
            direction={direction}
            viewMode={viewMode}
            onChangeSort={setSort}
            onToggleDirection={() =>
              setDirection((currentDirection) =>
                currentDirection === 'ASC' ? 'DESC' : 'ASC',
              )
            }
            onChangeViewMode={setViewMode}
          />
        </header>

        <div className={styles.listScroller}>
          {isSearching && (
            <div className={styles.searchSummary}>
              <span>‘{debouncedSearchTerm}’ 검색 결과</span>
              <strong>{totalScraps ?? 0}개</strong>
            </div>
          )}

          {isInitialLoading && (
            <div
              className={viewMode === 'grid' ? styles.gridSkeleton : styles.listSkeleton}
              aria-label="스크랩 목록 불러오는 중"
            >
              {Array.from({ length: viewMode === 'grid' ? 8 : 6 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          )}

          {isError && (
            <div className={styles.statePanel} role="alert">
              <span className={styles.stateIcon}>!</span>
              <h2>스크랩을 불러오지 못했습니다</h2>
              <p>{toApiError(currentError).message}</p>
              <button type="button" onClick={handleRetry}>
                다시 시도
              </button>
            </div>
          )}

          {!isInitialLoading && !isError && scraps.length === 0 && (
            <div className={styles.statePanel}>
              <span className={styles.emptyIcon}>⌁</span>
              <h2>{isSearching ? '검색 결과가 없습니다' : '아직 저장된 스크랩이 없습니다'}</h2>
              <p>
                {isSearching
                  ? '다른 제목이나 URL로 다시 검색해 보세요.'
                  : '아래 추가 버튼으로 첫 번째 링크를 저장해 보세요.'}
              </p>
            </div>
          )}

          {!isInitialLoading && !isError && scraps.length > 0 && viewMode === 'grid' && (
            <div className={styles.scrapGrid}>
              {scraps.map((scrap) => (
                <ScrapCard
                  key={scrap.scrapId}
                  scrap={scrap}
                  detailHref={`/scraps/${scrap.scrapId}?${detailSource}`}
                />
              ))}
            </div>
          )}

          {!isInitialLoading && !isError && scraps.length > 0 && viewMode === 'list' && (
            <div className={styles.scrapList}>
              <div className={styles.listHeader} aria-hidden="true">
                <span>스크랩 날짜</span>
                <span>제목</span>
                <span>URL</span>
                <span />
              </div>
              {scraps.map((scrap) => (
                <ScrapListRow
                  key={scrap.scrapId}
                  scrap={scrap}
                  detailHref={`/scraps/${scrap.scrapId}?${detailSource}`}
                />
              ))}
            </div>
          )}

          {!isSearching && <div ref={infiniteScrollRef} className={styles.scrollSentinel} />}
          {isFetchingNextPage && (
            <p className={styles.loadingMore}>스크랩을 더 불러오는 중...</p>
          )}
        </div>

        <ScrapSearchDock
          value={searchTerm}
          onChange={setSearchTerm}
          onAddScrap={handleAddScrap}
        />
      </section>
    </main>
  );
}

export default DashboardPage;
