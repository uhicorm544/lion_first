package com.paprika.domain.transaction.client;

import java.math.BigDecimal;

/**
 * 거래 화면 표시용 상품(post) 정보 (담당 경계)
 * 담당: D - 이동준 (구조 정의) / 
 *
 * 거래 도메인이 PostQueryClient로 상품 정보를 "조회"할 때 받는 결과 묶음이다.
 */
public record PostInfo(
        Long postId,
        String title,
        BigDecimal price,
        Long sellerId,
        String status
) {
}
