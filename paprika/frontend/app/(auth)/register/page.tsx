'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/signup', { email, nickname, password });
      // 가입 후 자동 로그인
      const res = await api.post('/api/v1/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <section style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h1>회원가입</h1>
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
            type="text"
            placeholder="닉네임 (2~10자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={2}
            maxLength={10}
            style={{ padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)' }}
          />
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)' }}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 16, border: `1px solid ${confirmPassword && password !== confirmPassword ? 'var(--color-error)' : 'var(--color-outline-variant)'}` }}
          />
          {confirmPassword && password !== confirmPassword && (
            <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>비밀번호가 일치하지 않습니다.</p>
          )}
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--color-primary)', color: 'white', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
          <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            이미 계정이 있으신가요? <Link href="/login" style={{ color: 'var(--color-primary)' }}>로그인</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
