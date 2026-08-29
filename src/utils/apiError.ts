import axios from 'axios';

interface ErrorResponseBody {
  code?: unknown;
  message?: unknown;
}

/** UI가 HTTP 라이브러리의 세부 구조를 몰라도 오류를 일관되게 표시하도록 만든 오류 타입입니다. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Axios 오류의 서버 응답을 안전하게 읽어 화면에서 사용할 ApiError로 변환합니다. */
export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ErrorResponseBody>(error)) {
    // CORS 차단이나 네트워크 단절처럼 서버 응답 자체를 받지 못한 경우입니다.
    if (!error.response) {
      return new ApiError(
        '서버에 연결할 수 없습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.',
      );
    }

    const responseBody = error.response?.data;
    const message =
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : '서버 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    const code =
      typeof responseBody?.code === 'string' ? responseBody.code : undefined;

    return new ApiError(message, error.response?.status, code);
  }

  return new ApiError('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
}
