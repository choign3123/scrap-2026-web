import type {
  CategoryListDTO,
  CreateCategoryRequest,
  UpdateCategorySequenceRequest,
  UpdateCategoryTitleRequest,
} from '../../types/api/category';
import type { ApiResponse } from '../../types/api/common';
import { apiClient } from './apiClient';

/** 로그인 사용자의 카테고리 전체 목록을 조회합니다. */
export async function getCategories() {
  const response = await apiClient.get<ApiResponse<CategoryListDTO>>('/auth/categories');
  return response.data.result;
}

/** 입력받은 이름으로 새 카테고리를 생성합니다. */
export async function createCategory(categoryTitle: string) {
  const requestBody: CreateCategoryRequest = { categoryTitle };
  await apiClient.post<ApiResponse<CreateCategoryRequest>>('/auth/categories', requestBody);
}

/** 기본 카테고리가 아닌 카테고리의 이름을 변경합니다. */
export async function updateCategoryTitle(categoryId: number, newCategoryTitle: string) {
  const requestBody: UpdateCategoryTitleRequest = { newCategoryTitle };
  await apiClient.patch<ApiResponse<UpdateCategoryTitleRequest>>(
    `/auth/categories/${categoryId}/title`,
    requestBody,
  );
}

/** 드래그 결과의 카테고리 ID 순서를 서버에 저장합니다. */
export async function updateCategorySequence(categoryIdList: number[]) {
  const requestBody: UpdateCategorySequenceRequest = { categoryIdList };
  await apiClient.patch<ApiResponse<UpdateCategorySequenceRequest>>(
    '/auth/categories/sequence',
    requestBody,
  );
}

/** 카테고리와 그 안의 스크랩을 함께 삭제합니다. */
export async function deleteCategory(categoryId: number) {
  await apiClient.delete<ApiResponse<null>>(`/auth/categories/${categoryId}`);
}
