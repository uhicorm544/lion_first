'use client';

/**
 * 인라인 채팅 패널 (메시지 목록 + 입력창)
 * 담당: C - 한대천
 *
 * 클래스는 루트(.room) 하나만. 나머지는 ChatRoom.module.css에서 구조로 선택.
 *
 * 메시지 정합성:
 *  - 구독을 먼저 켜고 → 그 다음 과거 로드(GET) → 메시지 id로 중복 제거(mergeById).
 *    이렇게 해야 "과거 스냅샷 ~ 구독 활성화" 사이의 누락/중복이 없다.
 *
 * TODO:
 *  - 위로 스크롤 시 더 오래된 메시지 로드 (커서 페이징)
 */
import { useEffect, useRef, useState } from 'react';
import type { StompSubscription } from '@stomp/stompjs';
import api from '@/lib/api';
import { connectSocket, disconnectSocket, subscribeToRoom, sendMessage } from '@/lib/socket';
import { getAccessToken } from '@/lib/auth';
import styles from './ChatRoom.module.css';

interface Msg {
  id: number;
  senderId: number | null;
  content: string;
}

// JWT(access token)의 sub 클레임 = 내 유저 id. "내 메시지" 판별과 senderId 전송에 사용.
function myUserIdFromToken(): number | undefined {
  const token = getAccessToken();
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.sub != null ? Number(payload.sub) : undefined;
  } catch {
    return undefined;
  }
}

// 두 목록을 메시지 id 기준으로 합치고(중복 제거) id 오름차순 정렬
function mergeById(a: Msg[], b: Msg[]): Msg[] {
  const map = new Map<number, Msg>();
  for (const m of a) map.set(m.id, m);
  for (const m of b) map.set(m.id, m);
  return Array.from(map.values()).sort((x, y) => x.id - y.id);
}

export default function ChatRoom({ roomId }: { roomId: number }) {
  const myId = myUserIdFromToken();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // 구독 먼저 → 과거 로드 → id 병합 (마운트 시), 정리 (언마운트 시)
  useEffect(() => {
    const token = getAccessToken() ?? '';
    let sub: StompSubscription | undefined;

    connectSocket(token, () => {
      // ① 구독 먼저 활성화 (오는 메시지는 id 기준 중복 없이 추가)
      sub = subscribeToRoom(roomId, (frame) => {
        const body = JSON.parse(frame.body);
        setMessages((prev) =>
          mergeById(prev, [{ id: body.id, senderId: body.senderId ?? null, content: body.content }]),
        );
      });

      // ② 구독 활성화 후 과거 로드 (REST) → 기존과 id로 병합
      api
        .get(`/api/v1/chat/rooms/${roomId}/messages`)
        .then((res) => {
          const past: Msg[] = (res.data?.data ?? []).map(
            (m: { id: number; senderId: number | null; content: string }) => ({
              id: m.id,
              senderId: m.senderId ?? null,
              content: m.content,
            }),
          );
          setMessages((prev) => mergeById(prev, past));
        })
        .catch((e) => console.error('[ChatRoom] 과거 메시지 로드 실패', e));
    });

    return () => {
      sub?.unsubscribe();
      disconnectSocket();
    };
  }, [roomId]);

  // 새 메시지 오면 맨 아래로 자동 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage(roomId, text, myId);
    setInput('');
  };

  return (
    <div className={styles.room}>
      <div ref={listRef}>
        {messages.length === 0 ? (
          <p data-empty>대화를 시작해 보세요</p>
        ) : (
          messages.map((m) => (
            <p key={m.id} data-mine={m.senderId === myId || undefined}>
              {m.content}
            </p>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요" />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}
