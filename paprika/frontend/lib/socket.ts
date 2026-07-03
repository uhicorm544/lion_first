/**
 * WebSocket + STOMP 클라이언트
 * 담당: C - 한대천
 *
 * TODO:
 *  - 알림 구독 (공지, 찜한 상품 상태 변경 등)
 *  - JWT 기반 WebSocket 인증 헤더 — connectSocket에 token 인자 전달 필요
 */
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export const connectSocket = (token: string, onConnect?: () => void): Client => {
  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080'}/ws`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (str) => {
      console.log('[STOMP]', str);
    },
    onConnect: () => {
      console.log('WebSocket connected');
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error('WebSocket STOMP error', frame);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
};

export const getStompClient = (): Client | null => stompClient;

export const subscribeToRoom = (
  roomId: number,
  callback: (message: IMessage) => void
) => {
  if (!stompClient?.connected) {
    console.warn('WebSocket not connected. Call connectSocket first.');
    return;
  }
  return stompClient.subscribe(`/topic/chat/${roomId}`, callback);
};

export const sendMessage = (roomId: number, content: string) => {
  if (!stompClient?.connected) {
    console.warn('WebSocket not connected. Call connectSocket first.');
    return;
  }
  stompClient.publish({
    destination: `/app/chat/${roomId}`,
    body: JSON.stringify({ content }),
  });
};
