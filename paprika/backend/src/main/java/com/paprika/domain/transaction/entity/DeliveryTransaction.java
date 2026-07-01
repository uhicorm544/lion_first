package com.paprika.domain.transaction.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 택배거래 상세 엔티티 (하위, transactions 와 1:1)
 * 담당: D - 이동준
 *
 * PK(transactionId)가 곧 상위 Transaction.id 이며 FK 역할도 한다.
 */
@Entity
@Table(name = "delivery_transactions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeliveryTransaction {

    @Id
    private Long transactionId; // 상위 Transaction.id 와 공유하는 PK(=FK)

    private String trackingNumber; // 운송장 번호 (발급 전 null 가능)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus deliveryStatus = DeliveryStatus.READY;

    @Builder
    private DeliveryTransaction(Long transactionId, String trackingNumber) {
        this.transactionId = transactionId;
        this.trackingNumber = trackingNumber;
        this.deliveryStatus = DeliveryStatus.READY;
    }

    /** 운송장 번호 등록 -> 배송중 전환 */
    public void registerTracking(String trackingNumber) {
        this.trackingNumber = trackingNumber;
        this.deliveryStatus = DeliveryStatus.IN_TRANSIT;
    }

    public void cancel() {
        this.deliveryStatus = DeliveryStatus.CANCELED;
    }

    public enum DeliveryStatus {
        READY,       // 배송준비 (운송장 발급 전)
        IN_TRANSIT,  // 배송중
        DELIVERED,   // 배송완료
        CANCELED     // 취소
    }
}
