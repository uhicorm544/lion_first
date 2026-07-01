package com.paprika.domain.transaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 거래 공통 엔티티 (상위)
 * 담당: D - 이동준
 *
 * 거래 방식(type)에 따라 하위 1:1 테이블 중 하나와만 연결된다.
 *  - DIRECT   -> DirectTransaction
 *  - DELIVERY -> DeliveryTransaction
 *
 * TODO:
 *  - Post, User 연관 관계(@ManyToOne) 추가
 *  - 거래 완료 후 리뷰 연동 (E - 장인호와 협의)
 *  - 세금계산서 발행 로직
 */
@Entity
@Table(name = "transactions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;  // TODO: Post와 @ManyToOne (posts 테이블 참조)

    @Column(nullable = false)
    private Long sellerId;   // TODO: User와 @ManyToOne (판매자)

    @Column(nullable = false)
    private Long buyerId;    // TODO: User와 @ManyToOne (구매자)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // DIRECT, DELIVERY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(nullable = false)
    private BigDecimal itemPrice; // 상품 가격

    @Column(nullable = false)
    private BigDecimal fee = BigDecimal.ZERO; // 수수료 (직거래는 0, 택배만 부과)

    @Column(nullable = false)
    private BigDecimal amount; // 최종 결제 금액 (itemPrice + fee)

    @Enumerated(EnumType.STRING)
    private CancelledBy cancelledBy; // SELLER, BUYER / 취소 아닐 때 null

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder
    private Transaction(Long postId, Long sellerId, Long buyerId,
                        TransactionType type, BigDecimal itemPrice, BigDecimal fee) {
        this.postId = postId;
        this.sellerId = sellerId;
        this.buyerId = buyerId;
        this.type = type;
        this.status = TransactionStatus.PENDING;
        this.itemPrice = itemPrice;
        // 직거래(DIRECT)는 수수료 없음, 택배(DELIVERY)만 수수료 부과
        this.fee = (type == TransactionType.DELIVERY && fee != null) ? fee : BigDecimal.ZERO;
        this.amount = itemPrice.add(this.fee);
    }

    /** 거래 확정 (판매자 수락) */
    public void agree() {
        this.status = TransactionStatus.AGREED;
    }

    /** 거래 완료 */
    public void complete() {
        this.status = TransactionStatus.COMPLETED;
    }

    /** 거래 취소 */
    public void cancel() {
        this.status = TransactionStatus.CANCELLED;
    }

    public enum TransactionType { DIRECT, DELIVERY }

    public enum TransactionStatus {
        PENDING,    // 거래 요청
        AGREED,     // 거래 확정
        COMPLETED,  // 거래 완료
        CANCELLED   // 거래 취소
    }

    public enum CancelledBy { SELLER, BUYER }
}
