'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type Step = 'email' | 'code' | 'password';

export default function PasswordFindPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = { padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)', fontSize: 16 };
  const btnStyle = { padding: '14px 18px', borderRadius: 16, background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', border: 'none' };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/password-reset/request', { email });
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || '이메일을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/password-reset/verify', { email, code });
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || '인증코드를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/password-reset/confirm', { email, code, newPassword });
      router.push('/login?reset=success');
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <section style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h1>비밀번호 찾기</h1>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['email', 'code', 'password'] as Step[]).map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step === s || (i < ['email','code','password'].indexOf(step)) ? 'var(--color-primary)' : 'var(--color-outline-variant)' }} />
          ))}
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestCode} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
              가입하신 이메일 주소를 입력하면 인증코드를 보내드립니다.
            </p>
            <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? '전송 중...' : '인증코드 보내기'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
              <strong>{email}</strong>로 발송된 6자리 인증코드를 입력해주세요. (5분 내 입력)
            </p>
            <input type="text" placeholder="인증코드 6자리" value={code} onChange={e => setCode(e.target.value)} maxLength={6} required style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
            {error && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? '확인 중...' : '인증코드 확인'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 14 }}>
              이메일 다시 입력하기
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
              새로운 비밀번호를 입력해주세요. (8자 이상)
            </p>
            <input type="password" placeholder="새 비밀번호" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} style={inputStyle} />
            <input type="password" placeholder="새 비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} />
            {error && <p style={{ color: 'var(--color-error)', fontSize: 14, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--color-on-surface-variant)', fontSize: 14 }}>
          <Link href="/login" style={{ color: 'var(--color-primary)' }}>로그인으로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}
