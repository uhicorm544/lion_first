package com.paprika.domain.transaction.dto;

import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

/**
 * 거래 상태 변경 요청 DTO
 * 담당: D - 이동준
 *
 * status 로 전이할 상태를 지정한다. (AGREED: 거래 확정 / CANCELLED: 거래 취소)
 */
@Getter
public class TransactionStatusRequest {

    @NotNull
    private TransactionStatus status; // AGREED 또는 CANCELLED
}
