package com.paprika.domain.chat.dto;

import lombok.Getter;

/**
 * 채팅 진입 요청 DTO
 * 담당: C - 한대천
 *
 * postId만 받는다.
 *  - 현재 유저(나=buyer)는 서버가 JWT에서 가져온다.
 *  - 판매자(seller)는 서버가 postId로 posts 테이블에서 조회한다. (클라이언트가 보내지 않음)
 */
@Getter
public class ChatRoomCreateRequest {

    private Long postId;
}
