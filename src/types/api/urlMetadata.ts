/** POST /auth/url-metadata 요청 본문입니다. */
export interface UrlMetadataRequest {
  url: string;
}

/** POST /auth/url-metadata API의 result 구조입니다. */
export interface UrlMetadataDTO {
  title: string | null;
  description: string | null;
  imageURL: string | null;
}
