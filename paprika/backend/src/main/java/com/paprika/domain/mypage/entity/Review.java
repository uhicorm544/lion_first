package com.paprika.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 거래 후기(리뷰) 엔티티
 * 담당: E - 장인호
 *
 * TODO:
 *  - Transaction과 연관 관계 (D - 이동준과 협의)
 *  - 매너 온도 반영 로직 (trustScore 업데이트)
 *  - 리뷰 작성 1회 제한 검증
 */
@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long transactionId; // TODO: Transaction과 @OneToOne

    private Long reviewerId;    // TODO: User와 @ManyToOne (리뷰 작성자)

    private Long revieweeId;    // TODO: User와 @ManyToOne (리뷰 대상)

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer rating; 

    private Integer mannerScore; // -1 (비매너), 0 (보통), +1 (매너)

    @CreatedDate
    private LocalDateTime createdAt;

    public static Review of(Long transactionId, Long reviewerId, Long revieweeId,
                             Integer rating, Integer mannerScore, String content) {
        Review r = new Review();
        r.transactionId = transactionId;
        r.reviewerId = reviewerId;
        r.revieweeId = revieweeId;
        r.rating = rating;
        r.mannerScore = mannerScore;
        r.content = content;
        return r;
    }

    public void update(Integer rating, Integer mannerScore, String content) {
        this.rating = rating;
        this.mannerScore = mannerScore;
        this.content = content;
    }
}
