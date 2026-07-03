package com.paprika.domain.chat.repository;

import com.paprika.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 담당: C - 한대천
 */
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);

    /** 방의 가장 최신 메시지 (읽음 처리 시 기준 id로 사용) */
    Optional<ChatMessage> findFirstByChatRoomIdOrderByIdDesc(Long chatRoomId);

    /** 안 읽은 수: 그 방에서 내가 보낸 게 아니고 last_read_id 보다 새로운 메시지 개수 */
    int countByChatRoomIdAndSenderIdNotAndIdGreaterThan(Long chatRoomId, Long senderId, Long lastReadMessageId);
}
