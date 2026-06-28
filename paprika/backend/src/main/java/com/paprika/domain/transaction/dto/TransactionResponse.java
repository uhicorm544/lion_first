package com.paprika.domain.transaction.dto;

import com.paprika.domain.transaction.entity.DeliveryTransaction;
import com.paprika.domain.transaction.entity.DirectTransaction;
import com.paprika.domain.transaction.entity.Transaction;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 거래 응답 DTO
 * 담당: D - 이동준
 *
 * 공통 정보(transactions) + 방식별 상세(direct/delivery)를 합쳐서 응답한다.
 * 거래 방식에 따라 direct 또는 delivery 한쪽만 채워진다.
 */
@Getter
@Builder
public class TransactionResponse {

    // 공통 정보
    private Long id;
    private Long postId;
    private Long sellerId;
    private Long buyerId;
    private String type;
    private String status;
    private BigDecimal itemPrice;
    private BigDecimal fee;
    private BigDecimal amount;
    private String cancelledBy;
    private LocalDateTime createdAt;

    // 직거래 상세 (type = DIRECT 일 때)
    private String meetingLocation;
    private LocalDateTime meetingTime;
    private String directStatus;

    // 택배 상세 (type = DELIVERY 일 때)
    private String trackingNumber;
    private String deliveryStatus;

    public static TransactionResponse of(Transaction tx,
                                         DirectTransaction direct,
                                         DeliveryTransaction delivery) {
        TransactionResponseBuilder builder = TransactionResponse.builder()
            .id(tx.getId())
            .postId(tx.getPostId())
            .sellerId(tx.getSellerId())
            .buyerId(tx.getBuyerId())
            .type(tx.getType().name())
            .status(tx.getStatus().name())
            .itemPrice(tx.getItemPrice())
            .fee(tx.getFee())
            .amount(tx.getAmount())
            .cancelledBy(tx.getCancelledBy() != null ? tx.getCancelledBy().name() : null)
            .createdAt(tx.getCreatedAt());

        if (direct != null) {
            builder.meetingLocation(direct.getMeetingLocation())
                .meetingTime(direct.getMeetingTime())
                .directStatus(direct.getDirectStatus().name());
        }

        if (delivery != null) {
            builder.trackingNumber(delivery.getTrackingNumber())
                .deliveryStatus(delivery.getDeliveryStatus().name());
        }

        return builder.build();
    }
}
