'use client';

/**

 *
 * 사용법:
 *   <ChatButton postId={post.id} />
 *
 * 판매자·현재 유저는 백엔드가 JWT와 posts 조회로 판단한다. 프론트는 postId만 넘긴다.
 */
import { useState } from 'react';
import api from '@/lib/api';
import ChatRoom from './ChatRoom';
import ChatRoomList, { type RoomSummary } from './ChatRoomList';
import styles from './ChatButton.module.css';

interface ChatButtonProps {
  postId: number; // 게시글 id (백엔드 posts.id)
}

export default function ChatButton({ postId }: ChatButtonProps) {
  const [roomId, setRoomId] = useState<number | null>(null);     // 열린 방
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null); // 방 목록(N개일 때)

  const isOpen = roomId !== null || rooms !== null;

  const handleClick = async () => {
    if (isOpen) {
      // 다시 누르면 전체 닫기
      setRoomId(null);
      setRooms(null);
      return;
    }
    try {
      // enter → 항상 방 배열 반환 (구매자는 1개 보장, 판매자는 0~N개)
      const res = await api.post('/api/v1/chat/rooms/enter', { postId });
      const list: RoomSummary[] = res.data.data ?? [];

      if (list.length === 1) {
        setRoomId(list[0].id); // 1개면 목록 안 거치고 바로 열기
      } else if (list.length === 0) {
        alert('아직 대화가 없습니다.');
      } else {
        setRooms(list); // N개면 목록 표시
      }
    } catch (e) {
      console.error('[ChatButton] enter 실패', e);
      // 서버가 내려준 메시지(ApiResponse.message) + HTTP 상태코드를 함께 표시.
      // 예: "인증이 필요합니다. (401)", "게시글을 찾을 수 없습니다. (404)"
      // 응답 자체가 없으면(네트워크/서버 다운) 연결 오류로 안내.
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      const status = err.response?.status;
      const message = err.response?.data?.message;
      alert(
        message
          ? `${message}${status ? ` (${status})` : ''}`
          : '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  };

  return (
    <div className={styles.chatButton}>
      <button type="button" onClick={handleClick}>
        {isOpen ? '채팅 닫기' : '채팅하기'}
      </button>

      {/* 방 열림. 목록에서 들어온 경우 '목록으로' 뒤로가기 제공 */}
      {roomId !== null && (
        <>
          {rooms && (
            <button type="button" onClick={() => setRoomId(null)}>
              ← 목록으로
            </button>
          )}
          <ChatRoom roomId={roomId} />
        </>
      )}

      {/* 방 N개 → 목록 표시 */}
      {roomId === null && rooms && <ChatRoomList rooms={rooms} onSelect={setRoomId} />}
    </div>
  );
}
