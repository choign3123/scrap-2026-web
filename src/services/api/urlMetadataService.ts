import type { ApiResponse } from '../../types/api/common';
import type {
  UrlMetadataDTO,
  UrlMetadataRequest,
} from '../../types/api/urlMetadata';
import { apiClient } from './apiClient';

/** 백엔드가 URL에 접근해 추출한 제목·설명·대표 이미지를 조회합니다. */
export async function getUrlMetadata(url: string, signal?: AbortSignal) {
  const requestBody: UrlMetadataRequest = { url };
  const response = await apiClient.post<ApiResponse<UrlMetadataDTO>>(
    '/auth/url-metadata',
    requestBody,
    { signal },
  );

  return response.data.result;
}
