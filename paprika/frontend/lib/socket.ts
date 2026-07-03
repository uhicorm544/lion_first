/**
 * WebSocket + STOMP 전역 연결 매니저
 * 담당: C - 한대천
 *
 * 연결은 앱 전역에서 "하나만" 유지한다.
 *  - 로그인 시 connectSocket(token) 1회 → 연결 유지
 *  - 각 화면은 subscribe(destination)로 필요한 목적지만 구독/해제 (연결은 건드리지 않음)
 *  - 로그아웃 시에만 disconnectSocket()
 * 재연결(reconnect) 시 등록된 구독을 자동으로 다시 적용한다.
 */
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let client: Client | null = null;

interface Registered {
  destination: string;
  callback: (message: IMessage) => void;
  sub?: StompSubscription;
}
const registered = new Set<Registered>();

/** 전역 WS 연결을 보장한다(멱등). 이미 연결/연결중이면 그대로 둔다. */
export const connectSocket = (token: string): Client => {
  if (client) return client;
  client = new Client({
    webSocketFactory: () =>
      new SockJS(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080'}/ws`),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    onConnect: () => {
      // 최초 연결 및 재연결 시: 등록된 구독을 모두 (재)적용
      registered.forEach((r) => {
        r.sub = client!.subscribe(r.destination, r.callback);
      });
    },
    onStompError: (frame) => console.error('WebSocket STOMP error', frame),
  });
  client.activate();
  return client;
};

/** 전역 연결 해제 (로그아웃 시에만). */
export const disconnectSocket = () => {
  registered.forEach((r) => r.sub?.unsubscribe());
  registered.clear();
  client?.deactivate();
  client = null;
};

/**
 * 목적지 구독. 연결 전에 호출해도 onConnect 시 자동 적용된다.
 * 반환된 함수를 호출하면 구독 해제 + 등록 목록에서 제거.
 */
export const subscribe = (
  destination: string,
  callback: (message: IMessage) => void,
): (() => void) => {
  const entry: Registered = { destination, callback };
  registered.add(entry);
  if (client?.connected) {
    entry.sub = client.subscribe(destination, callback);
  }
  return () => {
    entry.sub?.unsubscribe();
    registered.delete(entry);
  };
};

/** 목적지로 메시지 전송 (연결돼 있을 때만). */
export const publish = (destination: string, body: string) => {
  if (!client?.connected) {
    console.warn('WebSocket not connected.');
    return;
  }
  client.publish({ destination, body });
};

// ── 채팅방 헬퍼 (기존 호출부 호환) ──────────────────────────────
export const subscribeToRoom = (roomId: number, callback: (message: IMessage) => void) =>
  subscribe(`/topic/chat/${roomId}`, callback);

export const sendMessage = (roomId: number, content: string) =>
  publish(`/app/chat/${roomId}`, JSON.stringify({ content }));
