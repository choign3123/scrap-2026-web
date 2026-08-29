import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import sidebarOpenIcon from '../../assets/icons/sidebar-open.svg';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import styles from './DashboardPage.module.css';

/** URL에서 유효한 카테고리 ID만 숫자로 변환합니다. */
function parseCategoryId(categoryIdValue: string | null) {
  if (!categoryIdValue) {
    return null;
  }

  const categoryId = Number(categoryIdValue);
  return Number.isFinite(categoryId) ? categoryId : null;
}

/** 사이드바와 이후 스크랩 목록이 함께 배치되는 대시보드 페이지입니다. */
function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 769px)').matches,
  );
  const categoriesQuery = useCategoriesQuery();
  const isFavoritesSelected = searchParams.get('view') === 'favorites';
  const selectedCategoryId = isFavoritesSelected
    ? null
    : parseCategoryId(searchParams.get('category'));

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

  const selectedCategory = categoriesQuery.data?.categories.find(
    (category) => category.categoryId === selectedCategoryId,
  );
  const pageTitle = isFavoritesSelected
    ? '즐겨찾기'
    : selectedCategory?.categoryTitle ?? '스크랩';

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
            <span>SCRAP COLLECTION</span>
            <h1 id="dashboard-heading">{pageTitle}</h1>
          </div>
        </header>

        {/* 이번 단계는 사이드바 구현 범위이므로 목록 영역은 다음 작업을 위한 자리만 확보합니다. */}
        <div className={styles.bodyPlaceholder}>
          <span>사이드바 구성이 완료되었습니다</span>
          <p>선택한 분류의 스크랩 목록은 다음 단계에서 이 영역에 표시됩니다.</p>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
