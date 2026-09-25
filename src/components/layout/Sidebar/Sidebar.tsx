import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import categoryAddIcon from '../../../assets/icons/category-add.svg';
import folderIcon from '../../../assets/icons/folder.svg';
import questionIcon from '../../../assets/icons/question-duotone-line.svg';
import scrapIcon from '../../../assets/icons/scrap-clip.svg';
import sidebarCollapseIcon from '../../../assets/icons/sidebar-collapse.svg';
import starIcon from '../../../assets/icons/star-fill.svg';
import userIcon from '../../../assets/icons/user.svg';
import CategoryFormModal from '../../common/CategoryFormModal/CategoryFormModal';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategorySequenceMutation,
  useUpdateCategoryTitleMutation,
} from '../../../hooks/mutations/useCategoryMutations';
import { useCategoriesQuery } from '../../../hooks/queries/useCategoriesQuery';
import { useMyPageQuery } from '../../../hooks/queries/useMyPageQuery';
import { useAuth } from '../../../hooks/useAuth';
import { checkAdminAuthority } from '../../../services/api/authService';
import type { CategoryDTO } from '../../../types/api/category';
import { toApiError } from '../../../utils/apiError';
import CategoryList from './CategoryList';
import styles from './Sidebar.module.css';

// 1280×720에서도 하단 회원 메뉴와 겹치지 않는 안전한 기본 노출 개수입니다.
const COLLAPSED_CATEGORY_LIMIT = 5;

type ActiveModal =
  | { type: 'create' }
  | { type: 'edit'; category: CategoryDTO }
  | { type: 'delete'; category: CategoryDTO }
  | { type: 'signout' }
  | null;

interface SidebarProps {
  selectedCategoryId: number | null;
  isFavoritesSelected: boolean;
  onSelectCategory: (categoryId: number) => void;
  onSelectFavorites: () => void;
  onCollapse: () => void;
}

/** 대시보드와 스크랩 상세 화면에서 재사용하는 왼쪽 공통 사이드바입니다. */
function Sidebar({
  selectedCategoryId,
  isFavoritesSelected,
  onSelectCategory,
  onSelectFavorites,
  onCollapse,
}: SidebarProps) {
  const { logout, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const myPageQuery = useMyPageQuery();
  const categoriesQuery = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateTitleMutation = useUpdateCategoryTitleMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const updateSequenceMutation = useUpdateCategorySequenceMutation();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isCategoryListExpanded, setIsCategoryListExpanded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const adminHoldTimerRef = useRef<number | null>(null);
  const didTriggerAdminHoldRef = useRef(false);

  useEffect(() => () => {
    // 사이드바가 화면에서 사라질 때 아직 대기 중인 길게 누르기 타이머를 정리합니다.
    if (adminHoldTimerRef.current !== null) {
      window.clearTimeout(adminHoldTimerRef.current);
    }
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...(categoriesQuery.data?.categories ?? [])].sort(
        (first, second) => first.sequence - second.sequence,
      ),
    [categoriesQuery.data?.categories],
  );
  const visibleCategories = isCategoryListExpanded
    ? sortedCategories
    : sortedCategories.slice(0, COLLAPSED_CATEGORY_LIMIT);
  const hasHiddenCategories = sortedCategories.length > COLLAPSED_CATEGORY_LIMIT;

  function closeModal() {
    setActiveModal(null);
  }

  async function handleCreateCategory(categoryTitle: string) {
    const previousCategoryIds = new Set(
      sortedCategories.map((category) => category.categoryId),
    );

    await createCategoryMutation.mutateAsync(categoryTitle);
    const refreshedCategories = await categoriesQuery.refetch();
    const newCategory = refreshedCategories.data?.categories.find(
      (category) => !previousCategoryIds.has(category.categoryId),
    );

    closeModal();
    setIsCategoryListExpanded(true);

    if (newCategory) {
      onSelectCategory(newCategory.categoryId);
    }
  }

  async function handleUpdateCategoryTitle(categoryTitle: string) {
    if (activeModal?.type !== 'edit') {
      return;
    }

    await updateTitleMutation.mutateAsync({
      categoryId: activeModal.category.categoryId,
      newCategoryTitle: categoryTitle,
    });
    closeModal();
  }

  async function handleDeleteCategory() {
    if (activeModal?.type !== 'delete') {
      return;
    }

    const deletedCategoryId = activeModal.category.categoryId;
    const fallbackCategory = sortedCategories.find(
      (category) => category.categoryId !== deletedCategoryId && category.isDefault,
    );

    await deleteCategoryMutation.mutateAsync(deletedCategoryId);
    closeModal();

    if (selectedCategoryId === deletedCategoryId && fallbackCategory) {
      onSelectCategory(fallbackCategory.categoryId);
    }
  }

  async function handleReorder(sourceCategoryId: number, targetCategoryId: number) {
    const reorderedCategories = [...sortedCategories];
    const sourceIndex = reorderedCategories.findIndex(
      (category) => category.categoryId === sourceCategoryId,
    );
    const targetIndex = reorderedCategories.findIndex(
      (category) => category.categoryId === targetCategoryId,
    );

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const [movedCategory] = reorderedCategories.splice(sourceIndex, 1);
    reorderedCategories.splice(targetIndex, 0, movedCategory);
    setOperationError(null);

    try {
      await updateSequenceMutation.mutateAsync(
        reorderedCategories.map((category) => category.categoryId),
      );
    } catch (error) {
      setOperationError(toApiError(error).message);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  /** 버튼을 5초 누르면 관리자 권한을 서버에 확인하고 관리자 화면으로 이동합니다. */
  function handleLogoutPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (isLoggingOut || isCheckingAdmin || event.button !== 0) {
      return;
    }

    didTriggerAdminHoldRef.current = false;
    adminHoldTimerRef.current = window.setTimeout(() => {
      didTriggerAdminHoldRef.current = true;
      setIsCheckingAdmin(true);
      setOperationError(null);

      void checkAdminAuthority()
        .then(() => navigate('/admin'))
        .catch(() => {
          // 숨겨진 관리자 진입 기능이므로 일반 사용자에게 권한 오류를 노출하지 않습니다.
        })
        .finally(() => setIsCheckingAdmin(false));
    }, 5000);
  }

  /** 버튼에서 포인터가 벗어나거나 손을 떼면 관리자 대기 타이머를 취소합니다. */
  function clearAdminHoldTimer() {
    if (adminHoldTimerRef.current !== null) {
      window.clearTimeout(adminHoldTimerRef.current);
      adminHoldTimerRef.current = null;
    }
  }

  /** 길게 누른 뒤 발생하는 click만 삼키고, 브라우저에서 click이 생략되면 다음 동작을 복구합니다. */
  function handleLogoutPointerUp() {
    clearAdminHoldTimer();
    // 버튼이 확인 중 비활성화되어 click이 생략되는 브라우저에서도 다음 클릭이 막히지 않게 정리합니다.
    window.setTimeout(() => {
      didTriggerAdminHoldRef.current = false;
    }, 0);
  }

  /** 취소된 포인터 입력은 다음 로그아웃 클릭에 영향을 주지 않도록 상태를 초기화합니다. */
  function handleLogoutPointerCancel() {
    clearAdminHoldTimer();
    didTriggerAdminHoldRef.current = false;
  }

  /** 길게 눌러 관리자 확인을 시작한 뒤 발생하는 click은 로그아웃으로 처리하지 않습니다. */
  function handleLogoutClick() {
    if (didTriggerAdminHoldRef.current) {
      didTriggerAdminHoldRef.current = false;
      return;
    }

    void handleLogout();
  }

  async function handleSignout() {
    await signout();
    closeModal();
  }

  function handleSidebarClick(event: MouseEvent<HTMLElement>) {
    // 선택이나 설정 동작이 끝나면 이전 순서 변경 오류를 자연스럽게 정리합니다.
    if ((event.target as HTMLElement).closest('button')) {
      setOperationError(null);
    }
  }

  const memberName = myPageQuery.data?.memberInfo.name ?? '사용자';

  return (
    <aside className={styles.sidebar} aria-label="스크랩 탐색" onClick={handleSidebarClick}>
      <header className={styles.profileHeader}>
        <div className={styles.greeting}>
          <span>안녕하세요</span>
          {myPageQuery.isLoading ? (
            <span className={styles.nameSkeleton} aria-label="사용자 정보 불러오는 중" />
          ) : (
            <span className={styles.memberGreeting}>
              <strong>{memberName}</strong>
              {/* 이름만 강조하고 호칭은 일반 굵기로 보여 정보의 위계를 자연스럽게 만듭니다. */}
              <span>&nbsp;님!</span>
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.collapseButton}
          aria-label="사이드바 닫기"
          onClick={onCollapse}
        >
          <img src={sidebarCollapseIcon} alt="" />
        </button>
      </header>

      <div className={styles.statistics} aria-label="사용자 스크랩 통계">
        <div>
          <img src={scrapIcon} alt="" />
          <strong>{myPageQuery.data?.statistics.totalScrap ?? '-'}</strong>
          <span>스크랩</span>
        </div>
        <div>
          <img src={folderIcon} alt="" />
          <strong>{myPageQuery.data?.statistics.totalCategory ?? '-'}</strong>
          <span>카테고리</span>
        </div>
      </div>

      {myPageQuery.isError && (
        <button
          type="button"
          className={styles.compactRetryButton}
          onClick={() => myPageQuery.refetch()}
        >
          사용자 정보 다시 불러오기
        </button>
      )}

      <nav className={styles.navigation} aria-label="스크랩 분류">
        <button
          type="button"
          className={`${styles.favoriteButton} ${isFavoritesSelected ? styles.selectedNavigation : ''}`}
          aria-current={isFavoritesSelected ? 'page' : undefined}
          onClick={onSelectFavorites}
        >
          <img src={starIcon} alt="" />
          <span>즐겨찾기</span>
        </button>

        <button
          type="button"
          className={`${styles.favoriteButton} ${location.pathname.startsWith('/customer-center') ? styles.selectedNavigation : ''}`}
          aria-current={location.pathname.startsWith('/customer-center') ? 'page' : undefined}
          onClick={() => navigate('/customer-center')}
        >
          <img className={styles.supportIcon} src={questionIcon} alt="" />
          <span>고객센터</span>
        </button>

        <div className={styles.categoryHeader}>
          <div>
            <img src={folderIcon} alt="" />
            <h2>카테고리</h2>
          </div>
          <button
            type="button"
            className={styles.addCategoryButton}
            aria-label="카테고리 추가"
            onClick={() => setActiveModal({ type: 'create' })}
          >
            <img src={categoryAddIcon} alt="" />
          </button>
        </div>

        <div className={`${styles.categoryArea} ${isCategoryListExpanded ? styles.expandedCategoryArea : ''}`}>
          {categoriesQuery.isLoading && (
            <div className={styles.categorySkeletonList} aria-label="카테고리 불러오는 중">
              {Array.from({ length: 4 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          )}

          {categoriesQuery.isError && (
            <div className={styles.categoryError} role="alert">
              <p>카테고리를 불러오지 못했습니다.</p>
              <button type="button" onClick={() => categoriesQuery.refetch()}>
                다시 시도
              </button>
            </div>
          )}

          {categoriesQuery.isSuccess && sortedCategories.length === 0 && (
            <p className={styles.emptyCategory}>카테고리가 없습니다.</p>
          )}

          {categoriesQuery.isSuccess && sortedCategories.length > 0 && (
            <CategoryList
              categories={visibleCategories}
              selectedCategoryId={selectedCategoryId}
              isReordering={updateSequenceMutation.isPending}
              onSelect={onSelectCategory}
              onEdit={(category) => setActiveModal({ type: 'edit', category })}
              onDelete={(category) => setActiveModal({ type: 'delete', category })}
              onReorder={handleReorder}
            />
          )}
        </div>

        {hasHiddenCategories && (
          <button
            type="button"
            className={styles.moreCategoriesButton}
            onClick={() => setIsCategoryListExpanded((isExpanded) => !isExpanded)}
          >
            {isCategoryListExpanded ? '간단히 보기' : '… 더보기'}
          </button>
        )}

        {operationError && (
          <p className={styles.operationError} role="alert">
            {operationError}
          </p>
        )}
      </nav>

      <footer className={styles.memberActions}>
        <div className={styles.memberActionsTitle}>
          <img src={userIcon} alt="" />
          <span>회원설정</span>
        </div>
        <button
          type="button"
          disabled={isLoggingOut || isCheckingAdmin}
          onPointerDown={handleLogoutPointerDown}
          onPointerUp={handleLogoutPointerUp}
          onPointerLeave={clearAdminHoldTimer}
          onPointerCancel={handleLogoutPointerCancel}
          onClick={handleLogoutClick}
          onContextMenu={(event) => event.preventDefault()}
        >
          {isLoggingOut ? '로그아웃 중...' : isCheckingAdmin ? '관리자 확인 중...' : '로그아웃'}
        </button>
        <button
          type="button"
          className={styles.signoutButton}
          onClick={() => setActiveModal({ type: 'signout' })}
        >
          회원탈퇴
        </button>
        {/* 고객지원 정보는 기능 메뉴와 분리해 가장 낮은 시각적 우선순위로 표시합니다. */}
        <p className={styles.contactInformation}>cs@teamscrap.co.kr&nbsp; @teamscrap2026</p>
      </footer>

      {activeModal?.type === 'create' && (
        <CategoryFormModal mode="create" onSubmit={handleCreateCategory} onClose={closeModal} />
      )}

      {activeModal?.type === 'edit' && (
        <CategoryFormModal
          mode="edit"
          initialTitle={activeModal.category.categoryTitle}
          onSubmit={handleUpdateCategoryTitle}
          onClose={closeModal}
        />
      )}

      {activeModal?.type === 'delete' && (
        <ConfirmModal
          title="카테고리를 삭제할까요?"
          description={`‘${activeModal.category.categoryTitle}’ 카테고리와 안에 있는 모든 스크랩이 함께 삭제됩니다.`}
          confirmLabel="삭제"
          onConfirm={handleDeleteCategory}
          onClose={closeModal}
        />
      )}

      {activeModal?.type === 'signout' && (
        <ConfirmModal
          title="회원탈퇴를 진행할까요?"
          description="저장한 카테고리와 스크랩이 모두 삭제되며 이 작업은 되돌릴 수 없습니다."
          confirmLabel="회원탈퇴"
          onConfirm={handleSignout}
          onClose={closeModal}
        />
      )}
    </aside>
  );
}

export default Sidebar;
