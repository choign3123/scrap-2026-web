import addIcon from '../../../assets/icons/add.svg';
import searchIcon from '../../../assets/icons/search.svg';
import styles from './ScrapSearchDock.module.css';

interface ScrapSearchDockProps {
  value: string;
  onChange: (value: string) => void;
  onAddScrap: () => void;
}

/** 화면 하단에서 현재 목록 검색과 새 스크랩 추가 진입을 제공합니다. */
function ScrapSearchDock({ value, onChange, onAddScrap }: ScrapSearchDockProps) {
  return (
    <div className={styles.dock}>
      <label className={styles.searchField}>
        <img src={searchIcon} alt="" />
        <span className={styles.visuallyHidden}>스크랩 검색</span>
        <input
          type="search"
          value={value}
          placeholder="제목, 본문내용, 메모, URL로 검색하기"
          onChange={(event) => onChange(event.target.value)}
        />
        {value && (
          <button type="button" className={styles.clearButton} onClick={() => onChange('')}>
            지우기
          </button>
        )}
      </label>
      <button
        type="button"
        className={styles.addButton}
        aria-label="스크랩 추가"
        title="스크랩 추가"
        onClick={onAddScrap}
      >
        <img src={addIcon} alt="" />
        <span>새 스크랩</span>
      </button>
    </div>
  );
}

export default ScrapSearchDock;
