'use client';

/**
 * 채팅 목록 페이지 — 내가 참여한 채팅방을 판매/구매로 나눠 보여준다.
 * 담당: C - 한대천
 *
 * GET /api/v1/chat/rooms → 내 방(구매자/판매자 모두) 목록
 *  - 내가 sellerId 인 방  → "판매 채팅"
 *  - 내가 buyerId 인 방   → "구매 채팅"
 * 방을 누르면 해당 채팅방을 모달로 연다.
 */
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { useUnread } from '@/contexts/UnreadContext';
import ChatRoom from '@/components/chat/ChatRoom';
import type { RoomSummary } from '@/components/chat/ChatRoomList';
import styles from './page.module.css';

// JWT sub 클레임 = 내 유저 id
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

export default function ChatListPage() {
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RoomSummary | null>(null);
  const myId = useMemo(() => myUserIdFromToken(), []);
  const { unreadByRoom, setRoomsUnread, clearRoom } = useUnread();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get('/api/v1/chat/rooms')
      .then((res) => {
        if (!cancelled) {
          const list: RoomSummary[] = res.data?.data ?? [];
          setRooms(list);
          setRoomsUnread(list); // 서버 계산 unread를 전역 상태에 시드
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.response?.data?.message ?? '채팅방 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setRoomsUnread]);

  const sellingRooms = (rooms ?? []).filter((r) => r.sellerId === myId);
  const buyingRooms = (rooms ?? []).filter((r) => r.buyerId === myId);

  const openRoom = (room: RoomSummary) => {
    clearRoom(room.id); // 열면 즉시 뱃지 제거 (백엔드 markRead와 별개로 UI 반영)
    setSelected(room);
  };

  // 방 한 줄 렌더 (상대 닉네임 + 상품명 + 안읽음 뱃지). 뱃지는 전역 상태(실시간) 우선.
  const renderRoom = (room: RoomSummary, counterpartName: string) => {
    const unread = unreadByRoom[room.id] ?? room.unreadCount ?? 0;
    return (
      <li key={room.id}>
        <button type="button" className={styles.roomItem} onClick={() => openRoom(room)}>
          <span className={styles.roomTitle}>{room.postTitle ?? '상품'}</span>
          <span className={styles.roomSub}>{counterpartName}</span>
          {unread > 0 && (
            <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className={styles.chatList}>
      <h1>채팅</h1>

      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* 판매 채팅 (내가 판매자) */}
          <section>
            <h2>판매 채팅 <small>내가 판매자</small></h2>
            {sellingRooms.length === 0 ? (
              <p className={styles.empty}>받은 문의가 없습니다.</p>
            ) : (
              <ul className={styles.rooms}>
                {sellingRooms.map((room) =>
                  renderRoom(room, `구매자: ${room.buyerNickname ?? '구매자'} (id:${room.buyerId})`),
                )}
              </ul>
            )}
          </section>

          {/* 구매 채팅 (내가 구매자) */}
          <section>
            <h2>구매 채팅 <small>내가 구매자</small></h2>
            {buyingRooms.length === 0 ? (
              <p className={styles.empty}>진행 중인 대화가 없습니다.</p>
            ) : (
              <ul className={styles.rooms}>
                {buyingRooms.map((room) =>
                  renderRoom(room, `판매자: ${room.sellerNickname ?? '판매자'} (id:${room.sellerId})`),
                )}
              </ul>
            )}
          </section>
        </>
      )}

      {/* 선택한 방 → 모달로 채팅 열기 */}
      {selected && (
        <div className={styles.backdrop} onClick={() => setSelected(null)} role="presentation">
          <div
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="채팅"
          >
            <div className={styles.dialogHeader}>
              <button type="button" className={styles.closeButton} onClick={() => setSelected(null)}>
                닫기
              </button>
            </div>
            <ChatRoom room={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
