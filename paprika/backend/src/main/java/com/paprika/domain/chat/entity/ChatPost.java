package com.paprika.domain.chat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * posts 테이블 읽기 전용 매핑 (채팅에서 판매자 조회용)
 * 담당: C - 한대천
 *
 * post 도메인(B)의 Post 엔티티와 이름이 겹치지 않도록 채팅 전용 이름(ChatPost)을 쓴다.
 * 채팅에 필요한 필드(id, 판매자=user_id)만 매핑하고, 쓰기(save)는 하지 않는다. 조회 전용.
 */
@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatPost {

    @Id
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long sellerId; // posts.user_id = 판매자(작성자)
}
