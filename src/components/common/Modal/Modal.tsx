import { useEffect, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import closeIcon from '../../../assets/icons/modal-close.svg';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  isDismissDisabled?: boolean;
  onClose: () => void;
}

/** 입력과 확인 팝업이 공통으로 사용하는 접근성 기반 Modal 틀입니다. */
function Modal({
  title,
  children,
  footer,
  isDismissDisabled = false,
  onClose,
}: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDismissDisabled) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDismissDisabled, onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isDismissDisabled) {
      onClose();
    }
  }

  return createPortal(
    <div className={styles.backdrop} onMouseDown={handleBackdropClick}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className={styles.header}>
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="팝업 닫기"
            disabled={isDismissDisabled}
            onClick={onClose}
          >
            <img src={closeIcon} alt="" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>{footer}</footer>
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
