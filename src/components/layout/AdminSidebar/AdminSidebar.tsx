import gridIcon from '../../../assets/icons/grid-view.svg';
import questionIcon from '../../../assets/icons/question-duotone-line.svg';
import warningIcon from '../../../assets/icons/warning.svg';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isLoggingOut: boolean;
  onBackToService: () => void;
  onLogout: () => void;
}

/** 관리자 기능과 일반 사용자 화면을 명확히 구분하는 관리자 전용 사이드바입니다. */
function AdminSidebar({ isLoggingOut, onBackToService, onLogout }: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="관리자 메뉴">
      <header className={styles.header}>
        <span className={styles.logoMark}>S</span>
        <div>
          <strong>스크랩 관리자</strong>
          <span>관리자 전용 화면</span>
        </div>
      </header>

      <nav className={styles.navigation}>
        <button type="button" className={styles.activeMenu} aria-current="page">
          <img src={questionIcon} alt="" />
          <span>고객센터</span>
        </button>
        <button type="button" disabled>
          <img src={gridIcon} alt="" />
          <span>이용 통계</span>
          <small>준비 중</small>
        </button>
        <button type="button" disabled>
          <img src={warningIcon} alt="" />
          <span>공지사항</span>
          <small>준비 중</small>
        </button>
      </nav>

      <footer className={styles.footer}>
        <button type="button" onClick={onBackToService}>사용자 화면으로 돌아가기</button>
        <button type="button" disabled={isLoggingOut} onClick={onLogout}>
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </footer>
    </aside>
  );
}

export default AdminSidebar;
