package com.paprika.domain.transaction.client;

/**
 * 거래 -> 상품(post) 상태 변경 호출 통로 (담당 경계)
 * 담당: D - 이동준 (인터페이스 정의) / 
 *
 * 거래 이벤트가 발생하면 거래 도메인이 이 통로를 통해 상품 상태 변경을 "요청"한다.
 * 실제 연동 방식(REST API 호출 / PostService 직접 호출)은 구현체에서 결정한다.
 */
public interface PostStatusClient {

    /** 거래 확정(AGREED) 시: 상품을 예약중(RESERVED)으로 변경 요청 */
    void markReserved(Long postId);

    /** 거래 완료(COMPLETED) 시: 상품을 완료(COMPLETED)로 변경 요청 */
    void markCompleted(Long postId);

    /** 거래 취소(CANCELLED) 시: 상품을 판매중(SELLING)으로 복구 요청 */
    void markSelling(Long postId);
}
