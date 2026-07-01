'use client';

/**
 * 채팅방 목록 + ChatButton 테스트 하니스
 * 담당: C - 한대천
 *
 * 테스트 박스에서 게시글id만 입력해 enter 동작을 확인한다.
 * 판매자/구매자 구분은 로그인한 유저(JWT)와 posts.user_id 비교로 서버가 판단한다.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import ChatButton from '@/components/chat/ChatButton';
import TransactionButton from "@/app/transactions/TransactionButton";

const rooms = [
  {
    id: 'public',
    href: '/chat/public',
    name: '🌐 전체 공개 채팅방',
    desc: '로그인 없이 누구나 참여할 수 있어요',
  },
  // TODO: 로그인 시 1:1 거래 채팅방들 (GET /api/v1/chat/rooms)
];

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 12,
  color: 'var(--color-on-surface-variant)',
};

const inputStyle: CSSProperties = {
  width: 80,
  padding: '6px 8px',
  border: '1px solid var(--color-outline-variant)',
  borderRadius: 8,
  fontSize: 14,
};

export default function ChatListPage() {
  const [postId, setPostId] = useState(1);

  return (
    <div className={styles.chatList}>

      <h1>채팅</h1>
      <TransactionButton status={"SELLING"}></TransactionButton>

      {/* ── 테스트 하니스 (확인 후 제거) ─────────────────────────────── */}
      <div
        style={{
          padding: 16,
          border: '1px dashed var(--color-outline)',
          borderRadius: 12,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
          [테스트] 게시글id만 입력. 판매자/구매자는 로그인 토큰(JWT)으로 서버가 판단 (localStorage에 accessToken 필요)
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={labelStyle}>
            게시글id
            <input type="number" value={postId} onChange={(e) => setPostId(Number(e.target.value))} style={inputStyle} />
          </label>
        </div>

        {/* key로 입력이 바뀌면 ChatButton을 새로(닫힌 상태) 다시 마운트 */}
        <ChatButton postId={postId} />
      </div>
      {/* ─────────────────────────────────────────────────────────────── */}

      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link href={room.href}>
              <strong>{room.name}</strong>
              <span>{room.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
