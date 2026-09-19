import { useEffect, useMemo, useRef, useState } from 'react';
import type { CategoryDTO } from '../../../types/api/category';
import styles from './CategorySelect.module.css';

interface CategorySelectProps {
  categories: CategoryDTO[];
  value: number | null;
  disabled?: boolean;
  onChange: (categoryId: number) => void;
}

/** 네이티브 select 대신 선택 목록의 모양과 동작을 직접 관리하는 카테고리 선택창입니다. */
function CategorySelect({
  categories,
  value,
  disabled = false,
  onChange,
}: CategorySelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = useMemo(
    () => categories.findIndex((category) => category.categoryId === value),
    [categories, value],
  );
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const selectedCategory = selectedIndex >= 0 ? categories[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 선택창 바깥을 누르면 일반적인 드롭다운처럼 목록을 닫습니다.
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  function openSelect() {
    if (disabled || categories.length === 0) {
      return;
    }

    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function selectCategory(category: CategoryDTO) {
    onChange(category.categoryId);
    setIsOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || categories.length === 0) {
      return;
    }

    if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openSelect();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      setHighlightedIndex(
        (currentIndex) =>
          (currentIndex + offset + categories.length) % categories.length,
      );
      return;
    }

    if (event.key === 'Enter' && categories[highlightedIndex]) {
      event.preventDefault();
      selectCategory(categories[highlightedIndex]);
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        role="combobox"
        aria-controls="scrap-category-options"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openSelect())}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedCategory?.categoryTitle ?? '카테고리 선택'}</span>
      </button>

      {isOpen && (
        <div
          id="scrap-category-options"
          className={styles.menu}
          role="listbox"
          aria-label="저장할 카테고리"
        >
          <div className={styles.menuHeader}>
            <strong>카테고리 선택</strong>
            <span>{categories.length}개</span>
          </div>
          <div className={styles.optionList}>
            {categories.map((category, index) => {
              const isSelected = category.categoryId === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={category.categoryId}
                  type="button"
                  className={`${styles.option} ${
                    isHighlighted ? styles.highlighted : ''
                  } ${isSelected ? styles.selected : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectCategory(category)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className={styles.optionText}>
                    <strong>{category.categoryTitle}</strong>
                    {category.isDefault && <small>기본</small>}
                  </span>
                  {isSelected && (
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySelect;
