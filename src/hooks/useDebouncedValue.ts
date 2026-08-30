import { useEffect, useState } from 'react';

/** 입력이 멈춘 뒤에만 검색 API를 호출해 불필요한 네트워크 요청을 줄입니다. */
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timerId);
  }, [delay, value]);

  return debouncedValue;
}
