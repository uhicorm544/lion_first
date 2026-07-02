/**
 * 인증 관련 유틸리티
 * 담당: A - 민동현
 *
 * TODO:
 *  - 토큰 저장/조회/삭제 로직 (httpOnly cookie 사용 권장)
 *  - 인증 상태 확인 함수
 *  - OAuth2 리다이렉트 처리
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const withdraw = async (): Promise<void> => {
  const { default: api } = await import('@/lib/api');
  await api.delete('/api/v1/auth/withdraw');
  clearTokens();
  window.location.href = '/login';
};
