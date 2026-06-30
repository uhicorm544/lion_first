'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <section style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h1>로그인</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)' }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)' }}
          />
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--color-primary)', color: 'white', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>또는</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', borderRadius: 16, border: 'none', background: '#03C75A', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(3, 199, 90, 0.18)' }}
            >
              <img src="/images/naver-logo.svg" alt="Naver" style={{ width: 18, height: 18 }} />
              네이버로 계속하기
            </button>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', borderRadius: 16, border: '1px solid #D0D5DD', background: 'white', color: '#111827', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
            >
              <img src="/images/google-logo.svg" alt="Google" style={{ width: 18, height: 18 }} />
              Google로 계속하기
            </button>
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 16px', borderRadius: 16, border: 'none', background: '#111827', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(17, 24, 39, 0.16)' }}
            >
              <img src="/images/github-logo.svg" alt="GitHub" style={{ width: 18, height: 18 }} />
              GitHub로 계속하기
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
            <Link href="/register" style={{ color: 'var(--color-primary)' }}>회원가입</Link>
            <Link href="/find-password" style={{ color: 'var(--color-primary)' }}>비밀번호 찾기</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
