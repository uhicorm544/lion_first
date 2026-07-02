package com.paprika.domain.mypage.dto;

import com.paprika.domain.transaction.entity.Transaction;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 마이페이지 거래 내역 목록 응답 DTO
 * 담당: E - 장인호
 *
 * TransactionResponse는 직거래/택배 상세 필드까지 포함한 상세 페이지용 DTO.
 * 마이페이지 목록에서는 상세 필드가 불필요하므로 목록용 경량 DTO를 별도 작성.
 *
 * TODO: imgUrl - B(백성민) PostImageRepository 연동 후 실제 이미지로 교체
 * TODO: 거래 취소 후 상품 상태 복구 로직 - D(이동준), B(백성민)과 협의 필요
 */
@Getter
@Builder
public class TransactionSummaryResponse {
    private Long id;
    private Long postId;
    private String type;       // DIRECT, DELIVERY
    private String status;     // PENDING, AGREED, COMPLETED, CANCELLED
    private String myRole;     // BUYER, SELLER
    private BigDecimal itemPrice;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String imgUrl;
    private Long reviewId; // 작성한 리뷰 id (없으면 null = 아직 리뷰 안 씀, 구매 완료 건에만 의미 있음)

    public static TransactionSummaryResponse from(Transaction t, String myRole, String imgUrl, Long reviewId) {
        return TransactionSummaryResponse.builder()
                .id(t.getId())
                .postId(t.getPostId())
                .type(t.getType().name())
                .status(t.getStatus().name())
                .myRole(myRole)
                .itemPrice(t.getItemPrice())
                .amount(t.getAmount())
                .createdAt(t.getCreatedAt())
                .imgUrl(imgUrl)
                .reviewId(reviewId)
                .build();
    }
}