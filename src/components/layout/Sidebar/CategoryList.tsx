import { useState, type DragEvent, type MouseEvent } from 'react';
import categoryMenuIcon from '../../../assets/icons/category-menu.svg';
import editIcon from '../../../assets/icons/edit.svg';
import trashIcon from '../../../assets/icons/trash.svg';
import type { CategoryDTO } from '../../../types/api/category';
import styles from './Sidebar.module.css';

interface CategoryListProps {
  categories: CategoryDTO[];
  selectedCategoryId: number | null;
  isReordering: boolean;
  onSelect: (categoryId: number) => void;
  onEdit: (category: CategoryDTO) => void;
  onDelete: (category: CategoryDTO) => void;
  onReorder: (sourceCategoryId: number, targetCategoryId: number) => void;
}

/** 카테고리 선택, 설정 메뉴와 HTML Drag & Drop을 담당하는 목록입니다. */
function CategoryList({
  categories,
  selectedCategoryId,
  isReordering,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
}: CategoryListProps) {
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<number | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(null);

  function handleListClick(event: MouseEvent<HTMLUListElement>) {
    const clickedElement = event.target as HTMLElement;

    if (!clickedElement.closest('[data-category-menu-root]')) {
      setOpenMenuCategoryId(null);
    }
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>, categoryId: number) {
    setDraggingCategoryId(categoryId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(categoryId));
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, targetCategoryId: number) {
    event.preventDefault();
    const sourceCategoryId = Number(event.dataTransfer.getData('text/plain'));

    setDraggingCategoryId(null);

    if (Number.isFinite(sourceCategoryId) && sourceCategoryId !== targetCategoryId) {
      onReorder(sourceCategoryId, targetCategoryId);
    }
  }

  return (
    <ul className={styles.categoryList} onClick={handleListClick}>
      {categories.map((category) => {
        const isSelected = category.categoryId === selectedCategoryId;
        const isMenuOpen = category.categoryId === openMenuCategoryId;
        const isDragging = category.categoryId === draggingCategoryId;

        return (
          <li
            key={category.categoryId}
            className={`${styles.categoryRow} ${isSelected ? styles.selectedCategory : ''} ${isDragging ? styles.draggingCategory : ''}`}
            draggable={!isReordering}
            onDragStart={(event) => handleDragStart(event, category.categoryId)}
            onDragEnd={() => setDraggingCategoryId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, category.categoryId)}
          >
            <div className={styles.categoryMenuRoot} data-category-menu-root>
              {category.isDefault ? (
                <span
                  className={styles.dragIndicator}
                  title="드래그하여 순서 변경 (기본 카테고리는 수정·삭제할 수 없습니다)"
                >
                  <img src={categoryMenuIcon} alt="" />
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.categoryMenuButton}
                  aria-label={`${category.categoryTitle} 카테고리 설정`}
                  aria-expanded={isMenuOpen}
                  title="카테고리 메뉴"
                  onClick={() =>
                    setOpenMenuCategoryId(isMenuOpen ? null : category.categoryId)
                  }
                >
                  <img src={categoryMenuIcon} alt="" />
                </button>
              )}

              {isMenuOpen && (
                <div
                  className={styles.categoryMenu}
                  role="menu"
                  aria-label={`${category.categoryTitle} 카테고리 관리`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenMenuCategoryId(null);
                      onEdit(category);
                    }}
                  >
                    <img src={editIcon} alt="" />
                    <span>카테고리명 수정</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.deleteMenuItem}
                    onClick={() => {
                      setOpenMenuCategoryId(null);
                      onDelete(category);
                    }}
                  >
                    <img src={trashIcon} alt="" />
                    <span>카테고리 삭제</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.categorySelectButton}
              aria-current={isSelected ? 'page' : undefined}
              onClick={() => onSelect(category.categoryId)}
            >
              <span className={styles.categoryTitle} title={category.categoryTitle}>
                {category.categoryTitle}
              </span>
              <span className={styles.categoryCount}>{category.scrapCnt}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default CategoryList;
