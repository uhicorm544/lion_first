package com.paprika.domain.chat.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 채팅방 읽음 상태 (room_id, user_id 당 마지막으로 읽은 메시지 id)
 * 담당: C - 한대천
 *
 * 안 읽은 수 = 그 방 메시지 중 (id > last_read_message_id AND sender != 나) 개수.
 */
@Entity
@Table(name = "chat_read")
@IdClass(ChatReadId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ChatRead {

    @Id
    @Column(name = "room_id")
    private Long roomId;

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "last_read_message_id", nullable = false)
    private Long lastReadMessageId;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static ChatRead of(Long roomId, Long userId) {
        ChatRead cr = new ChatRead();
        cr.roomId = roomId;
        cr.userId = userId;
        cr.lastReadMessageId = 0L;
        return cr;
    }

    /** 마지막 읽은 메시지 id를 갱신(뒤로 가지 않도록 더 큰 값일 때만). */
    public void updateLastRead(Long messageId) {
        if (messageId != null && (lastReadMessageId == null || messageId > lastReadMessageId)) {
            this.lastReadMessageId = messageId;
        }
    }
}
