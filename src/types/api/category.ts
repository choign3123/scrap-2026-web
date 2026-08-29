/** 카테고리 전체 조회에서 반환하는 개별 카테고리 필드입니다. */
export interface CategoryDTO {
  categoryId: number;
  categoryTitle: string;
  scrapCnt: number;
  sequence: number;
  isDefault: boolean;
}

/** GET /auth/categories API의 result 구조입니다. */
export interface CategoryListDTO {
  categories: CategoryDTO[];
  total: number;
}

/** POST /auth/categories 요청 본문입니다. */
export interface CreateCategoryRequest {
  categoryTitle: string;
}

/** PATCH /auth/categories/{id}/title 요청 본문입니다. */
export interface UpdateCategoryTitleRequest {
  newCategoryTitle: string;
}

/** PATCH /auth/categories/sequence 요청 본문입니다. */
export interface UpdateCategorySequenceRequest {
  categoryIdList: number[];
}
