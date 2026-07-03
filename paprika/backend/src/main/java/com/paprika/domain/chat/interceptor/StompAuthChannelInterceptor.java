package com.paprika.domain.chat.interceptor;

import com.paprika.domain.chat.entity.ChatRoom;
import com.paprika.domain.chat.repository.ChatRoomRepository;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import com.paprika.global.security.CustomUserDetails;
import com.paprika.global.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * STOMP(WebSocket) 인증·인가 인터셉터
 * 담당: C - 한대천
 *
 * WebSocket 경로는 HTTP SecurityFilterChain(JwtAuthenticationFilter)을 타지 않으므로
 * 들어오는 STOMP 메시지를 여기서 가로채(preSend) 인증/인가를 건다.
 *  - CONNECT   : Authorization: Bearer 헤더의 JWT를 검증하고, 세션 사용자(Principal)를 심는다. 실패 시 연결 거부.
 *  - SUBSCRIBE : /topic/chat/{roomId} 구독 시 그 방의 당사자(구매자/판매자)인지 검증. 아니면 거부(도청 차단).
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(StompAuthChannelInterceptor.class);

    private static final String CHAT_TOPIC_PREFIX = "/topic/chat/";

    private final JwtProvider jwtProvider;
    private final ChatRoomRepository chatRoomRepository;

    public StompAuthChannelInterceptor(JwtProvider jwtProvider, ChatRoomRepository chatRoomRepository) {
        this.jwtProvider = jwtProvider;
        this.chatRoomRepository = chatRoomRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // wrap(message)는 복사본을 만들어 setUser가 원본에 반영되지 않는다.
        // 메시지에 실제로 붙어있는 mutable accessor를 가져와야 CONNECT에서 심은 사용자가 이후 메시지로 이어진다.
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }

        String sessionId = accessor.getSessionId();
        log.debug("[STOMP] command={} session={}", command, sessionId);

        switch (command) {
            case CONNECT -> authenticate(accessor, sessionId);
            case SUBSCRIBE -> authorizeSubscription(accessor, sessionId);
            default -> { /* SEND 등은 컨트롤러/서비스에서 참여자 검증 */ }
        }
        return message;
    }

    /** CONNECT: JWT를 검증하고 인증된 사용자를 STOMP 세션 Principal로 설정한다. */
    private void authenticate(StompHeaderAccessor accessor, String sessionId) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            log.warn("[STOMP][CONNECT 거부] Authorization 헤더 없음 (비로그인 연결 추정) session={}", sessionId);
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }

        String bearer = authHeaders.get(0);
        if (!StringUtils.hasText(bearer) || !bearer.startsWith("Bearer ")) {
            log.warn("[STOMP][CONNECT 거부] Authorization 형식 오류(Bearer 아님): '{}' session={}", bearer, sessionId);
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }

        String token = bearer.substring(7);
        if (!StringUtils.hasText(token)) {
            log.warn("[STOMP][CONNECT 거부] Bearer 뒤 토큰이 비어있음 session={}", sessionId);
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }
        if (!jwtProvider.isValid(token)) {
            log.warn("[STOMP][CONNECT 거부] JWT 검증 실패(만료/서명불일치 등) session={}", sessionId);
            throw new PaprikaException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtProvider.getUserId(token);
        String role = jwtProvider.getRole(token);
        CustomUserDetails userDetails = CustomUserDetails.fromJwt(userId, role);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        accessor.setUser(auth); // 이후 이 세션의 모든 메시지에서 principal로 사용됨
        log.info("[STOMP][CONNECT 성공] userId={} role={} session={}", userId, role, sessionId);
    }

    /** SUBSCRIBE: 채팅방 구독이면 요청자가 그 방의 당사자인지 검증한다. */
    private void authorizeSubscription(StompHeaderAccessor accessor, String sessionId) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(CHAT_TOPIC_PREFIX)) {
            log.debug("[STOMP][SUBSCRIBE] 채팅 토픽 아님, 통과: {} session={}", destination, sessionId);
            return; // 채팅방 토픽이 아니면 통과
        }
        Long userId = currentUserId(accessor, sessionId);
        Long roomId = parseRoomId(destination);

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> {
                    log.warn("[STOMP][SUBSCRIBE 거부] 존재하지 않는 방 roomId={} userId={} session={}", roomId, userId, sessionId);
                    return new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND);
                });
        if (!room.getBuyerId().equals(userId) && !room.getSellerId().equals(userId)) {
            log.warn("[STOMP][SUBSCRIBE 거부] 방 당사자 아님 roomId={} userId={} (buyer={}, seller={}) session={}",
                    roomId, userId, room.getBuyerId(), room.getSellerId(), sessionId);
            throw new PaprikaException(ErrorCode.CHAT_ACCESS_DENIED);
        }
        log.info("[STOMP][SUBSCRIBE 허용] roomId={} userId={} session={}", roomId, userId, sessionId);
    }

    private Long currentUserId(StompHeaderAccessor accessor, String sessionId) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth
                && auth.getPrincipal() instanceof CustomUserDetails principal) {
            return principal.getUserId();
        }
        log.warn("[STOMP][인가 거부] 세션에 인증 정보 없음(CONNECT 인증 우회 추정) session={}", sessionId);
        throw new PaprikaException(ErrorCode.UNAUTHORIZED);
    }

    private Long parseRoomId(String destination) {
        String roomIdPart = destination.substring(CHAT_TOPIC_PREFIX.length());
        if (!roomIdPart.matches("\\d+")) {
            throw new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND);
        }
        try {
            Long roomId = Long.parseLong(roomIdPart);
            if (roomId <= 0) {
                throw new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND);
            }
            return roomId;
        } catch (NumberFormatException e) {
            throw new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND);
        }
    }
}
