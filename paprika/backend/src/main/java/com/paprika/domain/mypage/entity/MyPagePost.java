package com.paprika.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * post 테이블 읽기 전용 매핑 (찜 목록에 상품명 표시용)
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

    @Column(nullable = false)
    private String title;
}
