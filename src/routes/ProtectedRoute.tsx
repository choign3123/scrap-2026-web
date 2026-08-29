import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageLoader from '../components/common/FullPageLoader/FullPageLoader';
import { useAuth } from '../hooks/useAuth';

/** 로그인한 사용자만 하위 페이지에 접근하도록 검사하는 Route 컴포넌트입니다. */
function ProtectedRoute() {
  const { authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === 'initializing') {
    return <FullPageLoader />;
  }

  if (authStatus === 'unauthenticated') {
    // 로그인 완료 후 원래 가려던 주소로 돌아갈 수 있도록 현재 위치를 전달합니다.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
