package com.paprika.domain.chat.repository;

import com.paprika.domain.chat.entity.ChatRead;
import com.paprika.domain.chat.entity.ChatReadId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 담당: C - 한대천
 */
public interface ChatReadRepository extends JpaRepository<ChatRead, ChatReadId> {
}
