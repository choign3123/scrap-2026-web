# 스크랩 웹

링크를 카테고리별로 저장하고 관리하는 PC 우선 웹 애플리케이션입니다.

## 실행 방법

PowerShell의 스크립트 실행 정책과 관계없이 동작하도록 `npm.cmd`를 사용합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

Vite가 출력한 로컬 주소를 브라우저에서 열면 됩니다. Vite에서는 Create React App의
`npm start` 대신 `npm run dev`를 사용합니다.

## 검사 명령

```powershell
# TypeScript/React 코드 규칙 검사
npm.cmd run lint

# TypeScript 타입 검사 후 배포 파일 생성
npm.cmd run build

# 생성된 배포 파일을 로컬에서 미리 확인
npm.cmd run preview
```

## 주요 라이브러리

- **Vite**: 개발 서버를 실행하고 배포 파일을 생성합니다.
- **TypeScript**: 값의 타입을 검사하여 실행 전에 실수를 찾습니다.
- **React Router**: URL에 맞는 페이지를 표시합니다.
- **Axios**: 백엔드 REST API를 호출합니다.
- **TanStack React Query**: 서버 데이터의 로딩, 오류, 캐시를 관리합니다.
- **React Markdown**: 스크랩 메모의 마크다운을 화면에 표시합니다.

## `src` 디렉터리 역할

```text
src/
├─ app/                 # Router와 React Query 같은 앱 전역 설정
├─ assets/              # 이미지와 SVG 아이콘
├─ components/          # 여러 페이지에서 재사용하는 UI 컴포넌트
├─ contexts/            # 로그인처럼 앱 전체에 필요한 클라이언트 상태
├─ hooks/               # React Query와 공통 동작을 감싼 custom hook
├─ pages/               # URL 단위의 화면 컴포넌트
├─ routes/              # 로그인 여부에 따라 페이지 접근을 제어
├─ services/api/        # 백엔드 API 호출 함수
├─ styles/              # 전역 스타일과 디자인 토큰
├─ types/               # API 응답과 화면 모델의 TypeScript 타입
└─ utils/               # 날짜, URL, 오류 변환 등의 순수 함수
```

화면 컴포넌트에서 Axios를 직접 호출하지 않습니다. 기본 데이터 흐름은 다음과 같습니다.

```text
Page/Component → Query 또는 Mutation Hook → API Service → apiClient → Backend
```

## 환경변수

`.env.example`을 참고하여 개발자별 설정은 `.env.local`에 작성합니다.

```dotenv
VITE_API_BASE_URL=https://dev.teamscrap.co.kr
```

`.env.local`은 Git에 커밋되지 않습니다. 환경변수를 바꾸었다면 개발 서버를 다시 실행해야
적용됩니다.

## 주석 작성 원칙

프론트엔드 입문자가 코드를 따라갈 수 있도록 다음 내용을 중심으로 주석을 작성합니다.

- 파일이나 컴포넌트가 담당하는 역할
- 상태와 데이터가 이동하는 흐름
- 코드만 보고 알기 어려운 선택의 이유
- 인증, 캐시 무효화, 오류 처리처럼 주의가 필요한 동작

코드를 그대로 한국어로 반복하는 주석은 피하고, 유지보수에 도움이 되는 설명을 남깁니다.
