import type { NoticeDTO } from '../../../types/api/notice';
import styles from './NoticeList.module.css';

interface NoticeListProps {
  notices: NoticeDTO[];
  onSelect: (noticeId: number) => void;
}

/** 공지 목록과 관리자 공지 목록에서 같은 정보 밀도를 유지하는 재사용 목록입니다. */
function NoticeList({ notices, onSelect }: NoticeListProps) {
  return (
    <div className={styles.list}>
      {notices.map((notice) => (
        <button
          key={notice.id}
          type="button"
          className={styles.item}
          onClick={() => onSelect(notice.id)}
        >
          <span className={styles.title}>{notice.title}</span>
          <time className={styles.date} dateTime={notice.createdAt}>
            {new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(new Date(notice.createdAt))}
          </time>
          <span className={styles.arrow} aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  );
}

export default NoticeList;
