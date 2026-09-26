import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import FullPageLoader from '../components/common/FullPageLoader/FullPageLoader';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import KakaoCallbackPage from '../pages/KakaoCallbackPage/KakaoCallbackPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import PublicOnlyRoute from '../routes/PublicOnlyRoute';

// 무거운 Rich Text Editor는 상세 화면에 진입할 때만 내려받습니다.
const ScrapDetailPage = lazy(
  () => import('../pages/ScrapDetailPage/ScrapDetailPage'),
);
const ScrapCreatePage = lazy(
  () => import('../pages/ScrapCreatePage/ScrapCreatePage'),
);
const CustomerCenterPage = lazy(
  () => import('../pages/CustomerCenterPage/CustomerCenterPage'),
);
const AdminInquiryPage = lazy(
  () => import('../pages/AdminInquiryPage/AdminInquiryPage'),
);
const NoticeListPage = lazy(
  () => import('../pages/NoticeListPage/NoticeListPage'),
);
const NoticeDetailPage = lazy(
  () => import('../pages/NoticeDetailPage/NoticeDetailPage'),
);
const AdminNoticeListPage = lazy(
  () => import('../pages/AdminNoticeListPage/AdminNoticeListPage'),
);
const AdminNoticeCreatePage = lazy(
  () => import('../pages/AdminNoticeCreatePage/AdminNoticeCreatePage'),
);

/** URL과 페이지 컴포넌트의 관계를 한곳에서 관리합니다. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // 로그인 완료 처리는 인증 상태 전환 중에도 항상 렌더링되어야 하므로 PublicOnlyRoute 밖에 둡니다.
    path: '/auth/kakao/callback',
    element: <KakaoCallbackPage provider="kakao" />,
  },
  {
    path: '/auth/naver/callback',
    element: <KakaoCallbackPage provider="naver" />,
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
      {
        path: '/scraps/:scrapId',
        element: (
          <Suspense fallback={<FullPageLoader message="에디터를 준비하고 있습니다." />}>
            <ScrapDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/scraps/new',
        element: (
          <Suspense fallback={<FullPageLoader message="스크랩 추가 화면을 준비하고 있습니다." />}>
            <ScrapCreatePage />
          </Suspense>
        ),
      },
      {
        path: '/customer-center',
        element: (
          <Suspense fallback={<FullPageLoader message="고객센터를 준비하고 있습니다." />}>
            <CustomerCenterPage />
          </Suspense>
        ),
      },
      {
        path: '/notices',
        element: (
          <Suspense fallback={<FullPageLoader message="공지사항을 준비하고 있습니다." />}>
            <NoticeListPage />
          </Suspense>
        ),
      },
      {
        path: '/notices/:noticeId',
        element: (
          <Suspense fallback={<FullPageLoader message="공지사항을 준비하고 있습니다." />}>
            <NoticeDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/admin',
        element: (
          <Suspense fallback={<FullPageLoader message="관리자 화면을 준비하고 있습니다." />}>
            <AdminInquiryPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/notices',
        element: (
          <Suspense fallback={<FullPageLoader message="공지사항 관리를 준비하고 있습니다." />}>
            <AdminNoticeListPage />
          </Suspense>
        ),
      },
      {
        path: '/admin/notices/new',
        element: (
          <Suspense fallback={<FullPageLoader message="공지 등록 화면을 준비하고 있습니다." />}>
            <AdminNoticeCreatePage />
          </Suspense>
        ),
      },
      {
        path: '/admin/notices/:noticeId',
        element: (
          <Suspense fallback={<FullPageLoader message="공지사항을 준비하고 있습니다." />}>
            <NoticeDetailPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
