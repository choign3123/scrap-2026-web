import { RouterProvider } from 'react-router-dom';
import { router } from './router';

/** 실제 페이지 선택은 router에 맡기는 최상위 컴포넌트입니다. */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
