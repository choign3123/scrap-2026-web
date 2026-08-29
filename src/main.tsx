import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/App';
import { queryClient } from './app/queryClient';
import { AuthProvider } from './contexts/AuthProvider';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

// HTML의 #root 요소를 찾아 React 애플리케이션을 브라우저에 표시합니다.
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React를 표시할 #root 요소를 찾을 수 없습니다.');
}

createRoot(rootElement).render(
  // StrictMode는 개발 중 잘못된 생명주기 사용 같은 문제를 일찍 발견해 줍니다.
  <StrictMode>
    {/* Provider 안의 모든 컴포넌트에서 React Query를 사용할 수 있습니다. */}
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider는 라우터를 포함한 앱 전체에 로그인 상태를 제공합니다. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
