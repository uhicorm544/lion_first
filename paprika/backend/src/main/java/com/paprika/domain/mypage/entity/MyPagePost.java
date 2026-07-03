package com.paprika.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * post 테이블 읽기 전용 매핑 (찜 목록에 상품명 표시 + 마이페이지 판매중 목록용)
 * 담당: E - 장인호
 *
 * MyPagePostImage와 동일한 방식으로, 상품(post) 도메인 테이블을 조회만 하기 위한
 * 마이페이지 전용 읽기 엔티티다. (B - 백성민의 Post.java는 건드리지 않음)
 */
@Entity
@Table(name = "post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MyPagePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Post.java의 필드들이 전부 @Column(name=...) 없이 암묵적 네이밍(camelCase -> snake_case)만 쓰므로,
    // 같은 post 테이블을 공유하는 이 mirror 엔티티도 이름을 명시하지 않아야 물리 컬럼에 대한 논리 이름이 일치한다.
    // (명시하면 Hibernate가 같은 물리 컬럼에 논리 이름이 두 개라고 보고 DuplicateMappingException을 던짐)
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal currentPrice;

    @Column(nullable = false)
    private String postStatus;

    @Column(updatable = false, insertable = false)
    private Instant createdAt;
}
