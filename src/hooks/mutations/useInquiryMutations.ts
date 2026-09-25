import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  answerInquiry,
  confirmInquiry,
  createInquiry,
} from '../../services/api/inquiryService';
import type { AnswerInquiryRequest, CreateInquiryRequest } from '../../types/api/inquiry';
import { inquiryQueryKeys } from '../queries/useInquiriesQuery';

/** 문의 등록 성공 후 내 문의 목록을 다시 조회하도록 캐시를 갱신합니다. */
export function useCreateInquiryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInquiryRequest) => createInquiry(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inquiryQueryKeys.all });
    },
  });
}

/** 문의를 처리 중으로 바꾼 뒤 관리자 목록을 다시 조회합니다. */
export function useConfirmInquiryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryId: number) => confirmInquiry(inquiryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inquiryQueryKeys.all });
    },
  });
}

/** 답변 등록 후 관리자와 일반 사용자 문의 목록을 모두 갱신합니다. */
export function useAnswerInquiryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AnswerInquiryRequest) => answerInquiry(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inquiryQueryKeys.all });
    },
  });
}
