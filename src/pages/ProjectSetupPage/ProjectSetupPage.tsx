import styles from './ProjectSetupPage.module.css';

/** 실제 기능 개발 전, 초기 환경이 정상 동작하는지 확인하는 임시 페이지입니다. */
function ProjectSetupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="setup-title">
        <span className={styles.badge}>SCRAP WEB</span>
        <h1 id="setup-title" className={styles.title}>
          프로젝트 기반 구성이 완료되었습니다
        </h1>
        <p className={styles.description}>
          Vite, TypeScript, Router, Axios와 React Query를 사용할 준비가
          되었습니다. 다음 단계부터 로그인과 대시보드를 구현합니다.
        </p>
        <dl className={styles.summary}>
          <div>
            <dt>개발 서버</dt>
            <dd>npm.cmd run dev</dd>
          </div>
          <div>
            <dt>코드 검사</dt>
            <dd>npm.cmd run lint</dd>
          </div>
          <div>
            <dt>배포 빌드</dt>
            <dd>npm.cmd run build</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default ProjectSetupPage;
