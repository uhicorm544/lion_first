package com.paprika.domain.transaction.dto;

import com.paprika.domain.transaction.entity.Transaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 거래 생성 요청 DTO
 * 담당: D - 이동준
 *
 * fee, amount(최종 결제 금액)는 서버에서 itemPrice 기준으로 계산한다.
 */
@Getter
public class TransactionCreateRequest {

    @NotNull
    private Long postId;

    @NotNull
    private TransactionType type; // DIRECT or DELIVERY

    @NotNull
    private BigDecimal itemPrice; // 상품 가격

    // 직거래(DIRECT) 시 입력 (선택)
    private String meetingLocation;
    private LocalDateTime meetingTime; 
}
