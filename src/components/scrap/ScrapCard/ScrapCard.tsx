import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import scrapIcon from '../../../assets/icons/scrap-clip.svg';
import starIcon from '../../../assets/icons/star-fill.svg';
import type { ScrapListItem } from '../../../types/api/scrap';
import styles from './ScrapCard.module.css';

interface ScrapCardProps {
  scrap: ScrapListItem;
  detailHref: string;
}

/** 표시용 URL은 길고 복잡한 경로 대신 사용자가 출처를 알아볼 수 있는 호스트를 우선합니다. */
function getDisplayUrl(scrapURL: string) {
  try {
    return new URL(scrapURL).hostname.replace(/^www\./, '');
  } catch {
    return scrapURL;
  }
}

/** 격자 보기에서 이미지, 제목, URL, 저장일과 즐겨찾기 상태를 표시합니다. */
function ScrapCard({ scrap, detailHref }: ScrapCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [scrap.imageURL]);

  const showsImage = Boolean(scrap.imageURL) && !hasImageError;

  return (
    <article className={styles.card}>
      <a
        className={styles.thumbnailLink}
        href={scrap.scrapURL}
        target="_blank"
        rel="noreferrer"
        aria-label={`${scrap.title} 원본 링크 열기`}
      >
        {showsImage ? (
          <img
            className={styles.thumbnail}
            src={scrap.imageURL ?? undefined}
            alt=""
            // 원격 이미지 서버가 Referer를 기준으로 요청을 차단하는 문제를 방지합니다.
            referrerPolicy="no-referrer"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <span className={styles.imageFallback}>
            <img src={scrapIcon} alt="" />
            <span>미리보기 없음</span>
          </span>
        )}
        {scrap.isFavorite && (
          <span className={styles.favoriteBadge} aria-label="즐겨찾기된 스크랩">
            <img src={starIcon} alt="" />
          </span>
        )}
      </a>

      {/* 이미지는 원문으로, 나머지 카드 영역은 상세 화면으로 연결합니다. */}
      <Link className={styles.content} to={detailHref}>
        {scrap.categoryTitle && (
          <span className={styles.categoryBadge}>{scrap.categoryTitle}</span>
        )}
        <h3 className={styles.title} title={scrap.title}>
          {scrap.title || '제목 없음'}
        </h3>
        <p className={styles.url} title={scrap.scrapURL}>
          {getDisplayUrl(scrap.scrapURL)}
        </p>
        <time className={styles.date} dateTime={scrap.scrapDate}>
          {scrap.scrapDate}
        </time>
      </Link>
    </article>
  );
}

export default ScrapCard;
