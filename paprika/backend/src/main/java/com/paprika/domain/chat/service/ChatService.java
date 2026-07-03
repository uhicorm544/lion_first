package com.paprika.domain.chat.service;

import com.paprika.domain.chat.entity.ChatMessage;
import com.paprika.domain.chat.entity.ChatRoom;
import com.paprika.domain.chat.repository.ChatMessageRepository;
import com.paprika.domain.chat.repository.ChatRoomRepository;
import com.paprika.domain.chat.repository.ChatPostRepository;
import com.paprika.domain.post.entity.Post;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 채팅 서비스
 * 담당: C - 한대천

 * TODO:
 *  - 메시지 저장 및 WebSocket 브로드캐스트
 *  - 이전 메시지 페이징 조회 (무한 스크롤)
 *  - 실시간 알림 발송 (새 메시지 도착 시)
 *  - 메시지 읽음 처리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private static final int MAX_MESSAGE_LENGTH = 1000;

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatPostRepository chatPostRepository; // posts 조회(판매자) — 채팅 전용 read-only

    /**
     * "채팅하기" 진입 — 항상 방 목록(List)을 반환한다. 프론트는 개수만 보고 UI를 정한다.
     *  - 내가 이 게시글의 판매자면: 나에게 온 문의 방들 (0~N개), 새로 만들지 않음.
     *  - 내가 구매자면: 나↔판매자 방을 get-or-create 해서 항상 1개를 담아 반환.

     * 판매자(sellerId)는 클라이언트가 보내지 않고 postId로 posts 테이블에서 서버가 조회한다 (조작 방지).
     */
    @Transactional
    public List<ChatRoom> enterChatRooms(Long postId, Long currentUserId) {
        Long sellerId = chatPostRepository.findById(postId)
                .map(Post::getUserId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.POST_NOT_FOUND));
        if (currentUserId.equals(sellerId)) {
            return chatRoomRepository.findByPostIdAndSellerId(postId, currentUserId);
        }
        return List.of(getOrCreateRoom(postId, currentUserId, sellerId));
    }

    /**
     * 채팅방 get-or-create.
     * (postId, buyerId, sellerId) 조합으로 기존 방을 찾고, 없으면 새로 만들어 반환한다.
     * 같은 상품이라도 구매자가 다르면 다른 방이 된다.
     */
    @Transactional
    public ChatRoom getOrCreateRoom(Long postId, Long buyerId, Long sellerId) {
        // DB 유니크 제약이 (post_id, buyer_id)이므로 그 키로 조회한다 (게시글당 구매자 1방).
        return chatRoomRepository
                .findByPostIdAndBuyerId(postId, buyerId)
                .orElseGet(() -> {
                    try {
                        return chatRoomRepository.save(ChatRoom.create(postId, buyerId, sellerId));
                    } catch (DataIntegrityViolationException e) {
                        // 동시 요청이 uq_chat_room(post_id, buyer_id)에 먼저 걸린 경우: 방금 생성된 방을 재조회
                        return chatRoomRepository.findByPostIdAndBuyerId(postId, buyerId)
                                .orElseThrow(() -> e);
                    }
                });
    }

    /**
     * 메시지 저장 (room_id, sender_id, content). created_at은 자동.
     * 발신자가 그 방의 당사자(구매자/판매자)일 때만 저장한다(SUBSCRIBE 인가와 별개의 심층 방어).
     */
    @Transactional
    public ChatMessage saveMessage(Long chatRoomId, Long senderId, String content) {
        String normalizedContent = normalizeContent(content);
        ChatRoom room = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND));
        if (!room.getBuyerId().equals(senderId) && !room.getSellerId().equals(senderId)) {
            throw new PaprikaException(ErrorCode.CHAT_ACCESS_DENIED);
        }
        return chatMessageRepository.save(ChatMessage.create(chatRoomId, senderId, normalizedContent));
    }

    private String normalizeContent(String content) {
        if (!StringUtils.hasText(content)) {
            throw new PaprikaException(ErrorCode.INVALID_INPUT);
        }
        String trimmed = content.trim();
        if (trimmed.length() > MAX_MESSAGE_LENGTH) {
            throw new PaprikaException(ErrorCode.INVALID_INPUT);
        }
        return trimmed;
    }

    /**
     * 방의 최근 메시지 N개를 시간순(오래된→최신)으로 반환.
     * 요청자가 그 방의 당사자(구매자 또는 판매자)일 때만 조회 가능하다.
     * roomId만 믿지 않고 방을 조회해 참여자인지 검증한다(IDOR 방지).
     */
    public List<ChatMessage> getMessages(Long roomId, Long userId, Pageable pageable) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.CHAT_ROOM_NOT_FOUND));
        if (!room.getBuyerId().equals(userId) && !room.getSellerId().equals(userId)) {
            throw new PaprikaException(ErrorCode.CHAT_ACCESS_DENIED);
        }

        List<ChatMessage> recent = new ArrayList<>(
                chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(roomId, pageable).getContent());
        Collections.reverse(recent); // DESC로 뽑은 걸 뒤집어 오래된→최신
        return recent;
    }
}
