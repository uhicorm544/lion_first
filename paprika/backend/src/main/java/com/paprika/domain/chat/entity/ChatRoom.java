package com.paprika.domain.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 1:1 채팅방 엔티티
 * 담당: C - 한대천
 *
 * TODO:
 *  - 채팅방 마지막 메시지 미리보기
 *  - 읽지 않은 메시지 카운트
 */
@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;  // posts.id (채팅 전용 Post 엔티티로 조회)

    private Long buyerId;    // TODO: User와 @ManyToOne

    private Long sellerId;   // TODO: User와 @ManyToOne

    @CreatedDate
    private LocalDateTime createdAt;

    /** 새 채팅방 생성용 정적 팩토리 (상품 + 구매자 + 판매자) */
    public static ChatRoom create(Long postId, Long buyerId, Long sellerId) {
        ChatRoom room = new ChatRoom();
        room.postId = postId;
        room.buyerId = buyerId;
        room.sellerId = sellerId;
        return room;
    }
}
