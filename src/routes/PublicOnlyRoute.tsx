import { Navigate, Outlet } from 'react-router-dom';
import FullPageLoader from '../components/common/FullPageLoader/FullPageLoader';
import { useAuth } from '../hooks/useAuth';

/** 로그인한 사용자가 로그인 화면으로 되돌아가지 않게 막는 Route 컴포넌트입니다. */
function PublicOnlyRoute() {
  const { authStatus } = useAuth();

  if (authStatus === 'initializing') {
    return <FullPageLoader />;
  }

  if (authStatus === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
