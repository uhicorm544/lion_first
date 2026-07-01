package com.paprika.domain.chat.repository;

import com.paprika.domain.chat.entity.ChatPost;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * posts 테이블 읽기 전용 조회 (채팅 전용)
 * 담당: C - 한대천
 *
 * post 도메인(B)의 PostRepository와 빈 이름이 겹치지 않도록 채팅 전용 이름을 쓴다.
 * 판매자(user_id) 확인용. 다른 도메인 레포지토리를 쓰지 않고 채팅에서 직접 둔다.
 */
public interface ChatPostRepository extends JpaRepository<ChatPost, Long> {
}
