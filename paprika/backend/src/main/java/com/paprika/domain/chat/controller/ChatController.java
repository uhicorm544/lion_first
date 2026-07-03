package com.paprika.domain.chat.controller;

import com.paprika.domain.chat.dto.ChatMessageRequest;
import com.paprika.domain.chat.dto.ChatMessageResponse;
import com.paprika.domain.chat.dto.ChatRoomCreateRequest;
import com.paprika.domain.chat.dto.ChatRoomResponse;
import com.paprika.domain.chat.entity.ChatMessage;
import com.paprika.domain.chat.service.ChatService;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import com.paprika.global.response.ApiResponse;
import com.paprika.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * 채팅 컨트롤러 (REST + WebSocket)
 * 담당: C - 한대천
 *
 * [REST API]
 *  - POST /api/v1/chat/rooms/enter          채팅 진입 → 방 목록 반환 (구현됨)
 *  - GET  /api/v1/chat/rooms                내 채팅방 목록 (TODO)
 *  - GET  /api/v1/chat/rooms/{id}           채팅방 단건 조회 (TODO)
 *  - GET  /api/v1/chat/rooms/{id}/messages  이전 메시지 조회 (TODO)
 *
 * [WebSocket - STOMP]
 *  - @MessageMapping("/chat/{roomId}")  메시지 전송 → /topic/chat/{roomId} 브로드캐스트
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * 현재 로그인 사용자 id — JWT(SecurityContext)에서 가져온다.
     * JwtAuthenticationFilter가 유효한 Bearer 토큰이면 CustomUserDetails를 넣어준다.
     * (참고: WebSocket 메시지 경로는 이 SecurityContext를 타지 않는다 — 별도 인터셉터 필요)
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }
        return principal.getUserId();
    }

    /**
     * "채팅하기" 진입.
     * 항상 방 목록(List)을 반환한다. 프론트는 개수만 보고 UI를 정한다.
     *  - 1개  → 그 방을 바로 연다
     *  - N개  → 목록을 보여준다
     *  - 0개  → 빈 상태 (판매자에게 문의 없음)
     *
     * 요청 본문은 postId만 받는다.
     *  - 현재 유저(나)는 JWT에서 가져온다.
     *  - 판매자는 서버가 postId로 posts를 조회해 판단한다. (내가 판매자면 문의 목록, 아니면 방 1개)
     */
    @PostMapping("/rooms/enter")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> enterRooms(
            @RequestBody ChatRoomCreateRequest request
    ) {
        Long me = getCurrentUserId();
        List<ChatRoomResponse> rooms = chatService
                .enterChatRooms(request.getPostId(), me)
                .stream()
                .map(ChatRoomResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(rooms));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<Object>> getChatRooms() {
        // TODO: 내 채팅방 목록 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<Object>> getChatRoom(@PathVariable Long roomId) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable Long roomId,
            @PageableDefault(size = 30) Pageable pageable
    ) {
        // 최근 N개를 시간순(오래된→최신)으로 반환. TODO: 위로 스크롤 시 커서 페이징
        // 방 당사자(구매자/판매자)만 조회 가능 — 현재 로그인 사용자를 서비스로 넘겨 검증한다.
        Long me = getCurrentUserId();
        List<ChatMessageResponse> messages = chatService.getMessages(roomId, me, pageable)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    // WebSocket 메시지 핸들러: 받은 메시지를 DB에 저장하고, 저장된 결과를 방 구독자 전원에게 브로드캐스트
    // 발신자(senderId)는 클라이언트 값을 신뢰하지 않고, CONNECT 때 인증된 세션 Principal에서 가져온다(위조 방지).
    // TODO: 상대방 알림(/user/{userId}/notification)
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageResponse sendMessage(@DestinationVariable Long roomId,
                                           @Payload @Valid ChatMessageRequest req,
                                           Principal principal) {
        Long senderId = resolveSenderId(principal);
        ChatMessage saved = chatService.saveMessage(roomId, senderId, req.getContent());
        return ChatMessageResponse.from(saved);
    }

    /** STOMP 세션 Principal(인터셉터가 심은 인증)에서 발신자 id를 꺼낸다. */
    private Long resolveSenderId(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }
        throw new PaprikaException(ErrorCode.UNAUTHORIZED);
    }


}
