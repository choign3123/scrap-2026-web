import gridViewIcon from '../../../assets/icons/grid-view.svg';
import listViewIcon from '../../../assets/icons/list-view.svg';
import sortDownIcon from '../../../assets/icons/sort-down.svg';
import sortUpIcon from '../../../assets/icons/sort-up.svg';
import type { ScrapSort, SortDirection } from '../../../types/api/scrap';
import styles from './ScrapToolbar.module.css';

export type ScrapViewMode = 'grid' | 'list';

interface ScrapToolbarProps {
  sort: ScrapSort;
  direction: SortDirection;
  viewMode: ScrapViewMode;
  onChangeSort: (sort: ScrapSort) => void;
  onToggleDirection: () => void;
  onChangeViewMode: (viewMode: ScrapViewMode) => void;
}

/** 정렬 기준, 방향과 격자·목록 보기를 한곳에서 제어합니다. */
function ScrapToolbar({
  sort,
  direction,
  viewMode,
  onChangeSort,
  onToggleDirection,
  onChangeViewMode,
}: ScrapToolbarProps) {
  return (
    <div className={styles.toolbar} aria-label="스크랩 목록 설정">
      <label className={styles.sortSelect}>
        <span className={styles.visuallyHidden}>정렬 기준</span>
        <select value={sort} onChange={(event) => onChangeSort(event.target.value as ScrapSort)}>
          <option value="SCRAP_DATE">스크랩 날짜순</option>
          <option value="TITLE">제목순</option>
        </select>
      </label>

      <button
        type="button"
        className={styles.iconButton}
        aria-label={direction === 'ASC' ? '오름차순, 내림차순으로 변경' : '내림차순, 오름차순으로 변경'}
        title={direction === 'ASC' ? '오름차순' : '내림차순'}
        onClick={onToggleDirection}
      >
        <img src={direction === 'ASC' ? sortUpIcon : sortDownIcon} alt="" />
      </button>

      <span className={styles.divider} />

      <div className={styles.viewToggle} aria-label="보기 방식">
        <button
          type="button"
          className={viewMode === 'grid' ? styles.activeView : ''}
          aria-label="격자형 보기"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onChangeViewMode('grid')}
        >
          <img src={gridViewIcon} alt="" />
        </button>
        <button
          type="button"
          className={viewMode === 'list' ? styles.activeView : ''}
          aria-label="목록형 보기"
          aria-pressed={viewMode === 'list'}
          onClick={() => onChangeViewMode('list')}
        >
          <img src={listViewIcon} alt="" />
        </button>
      </div>
    </div>
  );
}

export default ScrapToolbar;
