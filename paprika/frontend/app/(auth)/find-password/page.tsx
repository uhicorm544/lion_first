'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PasswordFindPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <section style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <h1>비밀번호 찾기</h1>
        <p style={{ marginTop: 8, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
          가입하신 이메일 주소를 입력하면, 비밀번호 재설정 안내를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 14, borderRadius: 16, border: '1px solid var(--color-outline-variant)' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--color-primary)', color: 'white', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '전송 중...' : '재설정 메일 보내기'}
          </button>

          {submitted && (
            <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: 14 }}>
              입력하신 이메일로 재설정 안내를 전송했습니다.
            </p>
          )}

          <div style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            로그인으로 돌아가기 <Link href="/login" style={{ color: 'var(--color-primary)' }}>로그인</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
