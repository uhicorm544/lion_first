'use client';

/**
 * 채팅방 목록 (판매자가 한 상품에서 받은 문의들)
 * 담당: C - 한대천
 *
 * 클래스는 루트(.list) 하나만. 나머지는 ChatRoomList.module.css에서 구조로 선택.
 * 상대 닉네임/게시글 정보는 채팅 전용 Post 조인 필요 → 지금은 구매자 id만 표시.
 */
import styles from './ChatRoomList.module.css';

export interface RoomSummary {
  id: number;
  postId: number;
  buyerId: number;
  sellerId: number;
  createdAt?: string;
}

interface ChatRoomListProps {
  rooms: RoomSummary[];
  onSelect: (roomId: number) => void;
}

export default function ChatRoomList({ rooms, onSelect }: ChatRoomListProps) {
  return (
    <ul className={styles.list}>
      {rooms.map((room) => (
        <li key={room.id}>
          <button type="button" onClick={() => onSelect(room.id)}>
            <span>구매자 #{room.buyerId}</span>
            <span>방 {room.id}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
