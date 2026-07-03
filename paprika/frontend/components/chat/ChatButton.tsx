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
  const [room, setRoom] = useState<RoomSummary | null>(null);     // 열린 방
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null); // 방 목록(N개일 때)

  const isOpen = room !== null || rooms !== null;

  // 방/목록 전체 닫기 (모달 닫기)
  const closeAll = () => {
    setRoom(null);
    setRooms(null);
  };

  const handleClick = async () => {
    try {
      // enter → 항상 방 배열 반환 (구매자는 1개 보장, 판매자는 0~N개)
      const res = await api.post('/api/v1/chat/rooms/enter', { postId });
      const list: RoomSummary[] = res.data.data ?? [];

      if (list.length === 1) {
        setRoom(list[0]); // 1개면 목록 안 거치고 바로 열기
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
    <>
      <button type="button" className={styles.trigger} onClick={handleClick}>
        채팅하기
      </button>

      {/* 배경 블러 + 화면 중앙 모달. 거래하기 팝업과 동일한 방식 */}
      {isOpen && (
        <div className={styles.backdrop} onClick={closeAll} role="presentation">
          <div
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="채팅"
          >
            <div className={styles.dialogHeader}>
              {/* 목록에서 들어온 경우 '목록으로' 뒤로가기 제공 */}
              {room !== null && rooms && (
                <button type="button" className={styles.backButton} onClick={() => setRoom(null)}>
                  ← 목록으로
                </button>
              )}
              <button type="button" className={styles.closeButton} onClick={closeAll}>
                닫기
              </button>
            </div>

            {/* 방 열림 */}
            {room !== null && <ChatRoom room={room} />}

            {/* 방 N개 → 목록 표시 */}
            {room === null && rooms && <ChatRoomList rooms={rooms} onSelect={setRoom} />}
          </div>
        </div>
      )}
    </>
  );
}
