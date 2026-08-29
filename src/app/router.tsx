import { createBrowserRouter } from 'react-router-dom';
import ProjectSetupPage from '../pages/ProjectSetupPage/ProjectSetupPage';

/** URL과 페이지 컴포넌트의 관계를 한곳에서 관리합니다. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectSetupPage />,
  },
]);
