/// <reference types="vite/client" />

/** Vite 환경변수의 이름과 값 형식을 TypeScript에 알려줍니다. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

/** import.meta.env를 사용할 때 자동완성과 타입 검사를 제공합니다. */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
