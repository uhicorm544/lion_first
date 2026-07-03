package com.paprika.domain.chat.dto;

import com.paprika.domain.chat.entity.ChatRoom;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 채팅방 응답 DTO
 * 담당: C - 한대천
 *
 * 화면 표시용으로 상대 닉네임과 상품(제목/가격) 정보를 함께 내려준다.
 */
@Getter
@Builder
public class ChatRoomResponse {

    private Long id;
    private Long postId;
    private Long buyerId;
    private Long sellerId;
    private String buyerNickname;     // 구매자 닉네임
    private String sellerNickname;    // 판매자 닉네임
    private String postTitle;         // 상품명 (헤더 표시용)
    private BigDecimal postPrice;     // 상품 가격 (헤더 표시용)
    private String lastMessage;       // TODO: 마지막 메시지 내용
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;      // TODO: 읽지 않은 메시지 수
    private LocalDateTime createdAt;

    public static ChatRoomResponse of(ChatRoom room, String buyerNickname, String sellerNickname,
                                      String postTitle, BigDecimal postPrice, int unreadCount) {
        return ChatRoomResponse.builder()
            .id(room.getId())
            .postId(room.getPostId())
            .buyerId(room.getBuyerId())
            .sellerId(room.getSellerId())
            .buyerNickname(buyerNickname)
            .sellerNickname(sellerNickname)
            .postTitle(postTitle)
            .postPrice(postPrice)
            .unreadCount(unreadCount)
            .createdAt(room.getCreatedAt())
            .build();
    }
}
