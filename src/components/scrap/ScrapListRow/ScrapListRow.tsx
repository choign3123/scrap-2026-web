import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import copyIcon from '../../../assets/icons/copy.svg';
import starIcon from '../../../assets/icons/star-fill.svg';
import type { ScrapListItem } from '../../../types/api/scrap';
import styles from './ScrapListRow.module.css';

interface ScrapListRowProps {
  scrap: ScrapListItem;
  detailHref: string;
}

/** 목록 보기는 선택 박스 없이 날짜, 제목, URL을 빠르게 비교하도록 구성합니다. */
function ScrapListRow({ scrap, detailHref }: ScrapListRowProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(scrap.scrapURL);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => setCopyState('idle'), 1600);
  }

  return (
    <article className={styles.row}>
      {/* 행 전체를 덮는 링크를 두어 날짜나 제목 주변을 눌러도 상세 화면으로 이동합니다. */}
      <Link
        className={styles.rowLink}
        to={detailHref}
        aria-label={`${scrap.title || '제목 없음'} 상세 보기`}
      />
      <time className={styles.date} dateTime={scrap.scrapDate}>
        {scrap.scrapDate}
      </time>
      <div className={styles.titleCell}>
        {scrap.isFavorite && <img src={starIcon} alt="즐겨찾기" />}
        <span className={styles.detailTitle} title={scrap.title}>
          {scrap.title || '제목 없음'}
        </span>
        {scrap.categoryTitle && (
          <small className={styles.category}>{scrap.categoryTitle}</small>
        )}
      </div>
      <a
        className={styles.url}
        href={scrap.scrapURL}
        target="_blank"
        rel="noreferrer"
        title={scrap.scrapURL}
      >
        {scrap.scrapURL}
      </a>
      {/* 복사 버튼은 행 링크 위에 있으므로 클릭해도 상세 화면으로 이동하지 않습니다. */}
      <button
        type="button"
        className={`${styles.copyButton} ${copyState !== 'idle' ? styles.copyResult : ''}`}
        aria-label={
          copyState === 'copied'
            ? 'URL 복사 완료'
            : copyState === 'error'
              ? 'URL 복사 실패'
              : 'URL 복사'
        }
        title={copyState === 'copied' ? '복사 완료' : 'URL 복사'}
        onClick={handleCopyUrl}
      >
        {copyState === 'idle' ? <img src={copyIcon} alt="" /> : copyState === 'copied' ? '✓' : '!'}
      </button>
    </article>
  );
}

export default ScrapListRow;
