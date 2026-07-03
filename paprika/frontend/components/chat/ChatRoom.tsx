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
import { Fragment, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { connectSocket, subscribeToRoom, sendMessage } from '@/lib/socket';
import { getAccessToken } from '@/lib/auth';
import { useUnread } from '@/contexts/UnreadContext';
import type { RoomSummary } from './ChatRoomList';
import styles from './ChatRoom.module.css';

interface Msg {
  id: number;
  senderId: number | null;
  content: string;
  createdAt: string | null; // 발송 시각 (ISO 문자열)
}

// ISO 문자열 → 날짜 키(YYYY-MM-DD). 날짜 구분선 비교용.
function dayKey(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR');
}

// 날짜 구분선 라벨 (예: 2026년 7월 3일 금요일)
function formatDateLabel(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

// 발송 시각 (예: 오후 3:57)
function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

// JWT(access token)의 sub 클레임 = 내 유저 id. "내 메시지" 판별에 사용.
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

export default function ChatRoom({ room }: { room: RoomSummary }) {
  const roomId = room.id;
  const myId = myUserIdFromToken();
  const { clearRoom } = useUnread();

  // senderId → "닉네임 (id:번호)" (방 참여자는 구매자/판매자 둘뿐이라 방 정보로 매핑 가능)
  const nameOf = (senderId: number | null): string => {
    if (senderId === room.buyerId) return `${room.buyerNickname ?? '구매자'} (id:${room.buyerId})`;
    if (senderId === room.sellerId) return `${room.sellerNickname ?? '판매자'} (id:${room.sellerId})`;
    return senderId != null ? `(id:${senderId})` : '알 수 없음';
  };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // 전역 연결에 이 방 토픽만 구독 → 과거 로드 → id 병합 (마운트 시), 구독 해제 (언마운트 시)
  // 연결 자체는 전역(로그인 시)에서 관리하므로 여기서 연결/해제하지 않는다.
  useEffect(() => {
    const token = getAccessToken() ?? '';
    connectSocket(token); // 멱등: 이미 연결돼 있으면 그대로

    // ① 이 방 토픽 구독 (연결 전이면 연결 시 자동 적용)
    const unsub = subscribeToRoom(roomId, (frame) => {
      const body = JSON.parse(frame.body);
      setMessages((prev) =>
        mergeById(prev, [{
          id: body.id,
          senderId: body.senderId ?? null,
          content: body.content,
          createdAt: body.createdAt ?? null,
        }]),
      );
      clearRoom(roomId); // 열려 있는 방의 새 메시지는 읽은 것으로 처리(뱃지 방지)
    });

    // ② 과거 로드 (REST) → 기존과 id로 병합. 방을 열었으니 이 방 뱃지 클리어.
    api
      .get(`/api/v1/chat/rooms/${roomId}/messages`)
      .then((res) => {
        const past: Msg[] = (res.data?.data ?? []).map(
          (m: { id: number; senderId: number | null; content: string; createdAt: string | null }) => ({
            id: m.id,
            senderId: m.senderId ?? null,
            content: m.content,
            createdAt: m.createdAt ?? null,
          }),
        );
        setMessages((prev) => mergeById(prev, past));
      })
      .catch((e) => console.error('[ChatRoom] 과거 메시지 로드 실패', e));
    clearRoom(roomId);

    return () => {
      unsub();
    };
  }, [roomId, clearRoom]);

  // 새 메시지 오면 맨 아래로 자동 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage(roomId, text);
    setInput('');
  };

  return (
    <div className={styles.room}>
      {/* 상품 정보 헤더 — 어떤 상품에 대한 대화인지 참고 표시 */}
      {(room.postTitle || room.postPrice != null) && (
        <header>
          <strong>{room.postTitle ?? '상품'}</strong>
          {room.postPrice != null && <span>{room.postPrice.toLocaleString()}원</span>}
        </header>
      )}

      <div ref={listRef}>
        {messages.length === 0 ? (
          <p data-empty>대화를 시작해 보세요</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === myId;
            const showDate = i === 0 || dayKey(m.createdAt) !== dayKey(messages[i - 1].createdAt);
            return (
              <Fragment key={m.id}>
                {showDate && dayKey(m.createdAt) && (
                  <div data-datesep><span>{formatDateLabel(m.createdAt)}</span></div>
                )}
                <span data-sender data-mine={mine || undefined}>{nameOf(m.senderId)}</span>
                <p data-mine={mine || undefined}>{m.content}</p>
                {formatTime(m.createdAt) && (
                  <span data-time data-mine={mine || undefined}>{formatTime(m.createdAt)}</span>
                )}
              </Fragment>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요" />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}
