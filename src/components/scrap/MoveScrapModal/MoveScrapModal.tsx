import { useEffect, useState } from 'react';
import folderIcon from '../../../assets/icons/folder.svg';
import { useCategorySelectionQuery } from '../../../hooks/queries/useCategoriesQuery';
import { toApiError } from '../../../utils/apiError';
import Modal from '../../common/Modal/Modal';
import styles from './MoveScrapModal.module.css';

interface MoveScrapModalProps {
  onMove: (categoryId: number) => Promise<void>;
  onClose: () => void;
}

/** 이동할 카테고리를 고른 뒤 확인하는 스크랩 전용 팝업입니다. */
function MoveScrapModal({ onMove, onClose }: MoveScrapModalProps) {
  const categoriesQuery = useCategorySelectionQuery(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCategoryId === null && categoriesQuery.data) {
      setSelectedCategoryId(categoriesQuery.data.defaultCategory);
    }
  }, [categoriesQuery.data, selectedCategoryId]);

  async function handleMove() {
    if (selectedCategoryId === null) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onMove(selectedCategoryId);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title="카테고리 이동"
      isDismissDisabled={isSubmitting}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={isSubmitting}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={selectedCategoryId === null || isSubmitting}
            onClick={handleMove}
          >
            {isSubmitting ? '이동 중...' : '이동'}
          </button>
        </>
      }
    >
      <p className={styles.description}>스크랩을 보관할 카테고리를 선택해 주세요.</p>

      {categoriesQuery.isLoading && (
        <div className={styles.skeleton} aria-label="카테고리 불러오는 중">
          <span />
          <span />
          <span />
        </div>
      )}

      {categoriesQuery.isError && (
        <div className={styles.error} role="alert">
          <p>{toApiError(categoriesQuery.error).message}</p>
          <button type="button" onClick={() => categoriesQuery.refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {categoriesQuery.isSuccess && categoriesQuery.data.categories.length === 0 && (
        <p className={styles.empty}>이동할 수 있는 카테고리가 없습니다.</p>
      )}

      {categoriesQuery.isSuccess && categoriesQuery.data.categories.length > 0 && (
        <div className={styles.categoryList} role="radiogroup" aria-label="이동할 카테고리">
          {categoriesQuery.data.categories.map((category) => (
            <label
              key={category.categoryId}
              className={`${styles.categoryOption} ${selectedCategoryId === category.categoryId ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name="moveCategory"
                value={category.categoryId}
                checked={selectedCategoryId === category.categoryId}
                onChange={() => setSelectedCategoryId(category.categoryId)}
              />
              <span className={styles.folderBox}>
                <img src={folderIcon} alt="" />
              </span>
              <span>{category.categoryTitle}</span>
              <i aria-hidden="true" />
            </label>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className={styles.operationError} role="alert">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}

export default MoveScrapModal;
