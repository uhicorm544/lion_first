package com.paprika.domain.chat.repository;

import com.paprika.domain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 닉네임 조회용 레포지토리 (채팅) — auth 도메인(A)의 User 엔티티를 재사용.
 * 담당: C - 한대천
 *
 * 채팅방 목록/헤더에 상대 닉네임을 표시하기 위해 users 테이블을 읽기 전용으로 조회한다.
 * (ChatPostRepository가 Post를 재사용하는 것과 동일한 패턴)
 */
public interface ChatUserRepository extends JpaRepository<User, Long> {
}
