package com.paprika.domain.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * 채팅 메시지 전송 DTO (WebSocket STOMP payload)
 * 담당: C - 한대천
 */
@Getter
public class ChatMessageRequest {

    @NotBlank(message = "메시지 내용을 입력해주세요.")
    @Size(max = 1000, message = "메시지는 1000자 이하로 입력해주세요.")
    private String content;
}
