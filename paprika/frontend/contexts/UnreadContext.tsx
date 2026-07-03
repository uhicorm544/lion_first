'use client';

/**
 * 안 읽은 채팅 상태 + 전역 WS 알림 구독
 * 담당: C - 한대천
 *
 * - 로그인(user 존재) 시: 전역 WS 연결 + /user/queue/notifications 구독
 * - 알림(새 메시지) 오면 해당 방 unread +1 → 뱃지 실시간 갱신
 * - 로그아웃 시: 연결 해제 + 상태 초기화
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { connectSocket, disconnectSocket, subscribe } from '@/lib/socket';

interface UnreadContextValue {
  unreadByRoom: Record<number, number>;
  total: number;
  setRoomsUnread: (rooms: { id: number; unreadCount?: number }[]) => void;
  clearRoom: (roomId: number) => void;
}

const UnreadContext = createContext<UnreadContextValue>({
  unreadByRoom: {},
  total: 0,
  setRoomsUnread: () => {},
  clearRoom: () => {},
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadByRoom, setUnread] = useState<Record<number, number>>({});

  // 목록 조회 결과로 방별 unread 초기화(서버 계산값 반영)
  const setRoomsUnread = useCallback((rooms: { id: number; unreadCount?: number }[]) => {
    setUnread((prev) => {
      const next = { ...prev };
      rooms.forEach((r) => {
        next[r.id] = r.unreadCount ?? 0;
      });
      return next;
    });
  }, []);

  const clearRoom = useCallback((roomId: number) => {
    setUnread((prev) => (prev[roomId] ? { ...prev, [roomId]: 0 } : prev));
  }, []);

  const bumpRoom = useCallback((roomId: number) => {
    setUnread((prev) => ({ ...prev, [roomId]: (prev[roomId] ?? 0) + 1 }));
  }, []);

  // 로그인 시 전역 연결 + 알림 구독, 로그아웃 시 해제
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setUnread({});
      return;
    }
    const token = getAccessToken() ?? '';
    connectSocket(token);
    const unsub = subscribe('/user/queue/notifications', (frame) => {
      try {
        const body = JSON.parse(frame.body);
        if (body?.chatRoomId != null) bumpRoom(Number(body.chatRoomId));
      } catch {
        // 무시
      }
    });

    // 로그인/새로고침 시 내 방 unread를 한 번 불러와 뱃지를 채운다(페이지와 무관하게 항상 정확).
    let cancelled = false;
    api
      .get('/api/v1/chat/rooms')
      .then((res) => {
        if (!cancelled) setRoomsUnread(res.data?.data ?? []);
      })
      .catch(() => {
        // 조용히 무시 (뱃지 없이 동작)
      });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [user, bumpRoom, setRoomsUnread]);

  const total = useMemo(
    () => Object.values(unreadByRoom).reduce((sum, n) => sum + (n || 0), 0),
    [unreadByRoom],
  );

  return (
    <UnreadContext.Provider value={{ unreadByRoom, total, setRoomsUnread, clearRoom }}>
      {children}
    </UnreadContext.Provider>
  );
}

export const useUnread = () => useContext(UnreadContext);
