import { useState, type FormEvent } from 'react';
import { toApiError } from '../../../utils/apiError';
import Modal from '../Modal/Modal';
import styles from './CategoryFormModal.module.css';

interface CategoryFormModalProps {
  mode: 'create' | 'edit';
  initialTitle?: string;
  onSubmit: (categoryTitle: string) => Promise<void>;
  onClose: () => void;
}

/** 카테고리 생성과 이름 수정에서 함께 사용하는 입력 Modal입니다. */
function CategoryFormModal({
  mode,
  initialTitle = '',
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  const [categoryTitle, setCategoryTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalTitle = mode === 'create' ? '새 카테고리' : '카테고리명 수정';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = categoryTitle.trim();

    if (!trimmedTitle) {
      setErrorMessage('카테고리 이름을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(trimmedTitle);
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={modalTitle}
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
            type="submit"
            form="category-form"
            className={styles.primaryButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '확인'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="category-title">
          카테고리 이름
        </label>
        <p className={styles.helperText}>사이드바에 표시할 이름을 입력해 주세요.</p>
        <input
          id="category-title"
          className={styles.input}
          value={categoryTitle}
          placeholder="예: 개발 자료"
          autoFocus
          disabled={isSubmitting}
          onChange={(event) => setCategoryTitle(event.target.value)}
        />
        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
