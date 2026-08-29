import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import PublicOnlyRoute from '../routes/PublicOnlyRoute';

/** URL과 페이지 컴포넌트의 관계를 한곳에서 관리합니다. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
