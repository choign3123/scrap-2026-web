import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import styles from './SelectMenu.module.css';

export interface SelectMenuOption<T extends string> {
  value: T;
  label: string;
}

interface SelectMenuProps<T extends string> {
  id?: string;
  label: string;
  value: T;
  options: Array<SelectMenuOption<T>>;
  disabled?: boolean;
  onChange: (value: T) => void;
}

/** 브라우저별 모양이 다른 select 대신 프로젝트에서 공통으로 사용하는 선택 메뉴입니다. */
function SelectMenu<T extends string>({
  id,
  label,
  value,
  options,
  disabled = false,
  onChange,
}: SelectMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    /** 마우스·터치·펜으로 메뉴 바깥을 누르면 열린 목록을 닫습니다. */
    function handleOutsidePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    /** Tab 키 등으로 포커스가 드롭다운 밖으로 이동한 경우에도 목록을 닫습니다. */
    function handleFocusIn(event: FocusEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // capture 단계에서 감지하여 상위 화면이 이벤트 전파를 막아도 정상 동작하게 합니다.
    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    document.addEventListener('focusin', handleFocusIn, true);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setIsOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={styles.root} onKeyDown={handleKeyDown}>
      <button
        id={id}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedOption?.label}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.openChevron : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.menu} role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={value === option.value ? styles.selectedOption : undefined}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {value === option.value && <span className={styles.check} aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectMenu;
