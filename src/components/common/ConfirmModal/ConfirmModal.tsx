import { useState } from 'react';
import warningIcon from '../../../assets/icons/warning.svg';
import { toApiError } from '../../../utils/apiError';
import Modal from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** 삭제와 회원탈퇴처럼 되돌리기 어려운 작업을 한 번 더 확인합니다. */
function ConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onConfirm();
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={title}
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
            className={styles.dangerButton}
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? '처리 중...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className={styles.message}>
        <img src={warningIcon} alt="" />
        <p>{description}</p>
      </div>
      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}

export default ConfirmModal;
