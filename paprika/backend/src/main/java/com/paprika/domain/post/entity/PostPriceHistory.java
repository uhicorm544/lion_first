package com.paprika.domain.post.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "post_price_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostPriceHistory extends BaseTimeEntity {
    /* --- 1. Column Define --- */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    @Column(nullable = false)
    private BigDecimal price;

    /* --- 2. Builder --- */
    @Builder
    public PostPriceHistory(Post post, BigDecimal price) {
        this.post = post;
        this.price = price;
    }
}
