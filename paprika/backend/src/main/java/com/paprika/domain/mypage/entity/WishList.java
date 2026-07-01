package com.paprika.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 관심 상품(찜) 엔티티
 * 담당: E - 장인호
 */
@Entity
@Table(name = "wish_list",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class WishList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @CreatedDate
    private LocalDateTime createdAt;

    public static WishList of(Long userId, Long productId) {
        WishList w = new WishList();
        w.userId = userId;
        w.productId = productId;
        return w;
    }
}
