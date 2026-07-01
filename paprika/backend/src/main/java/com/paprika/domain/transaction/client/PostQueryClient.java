package com.paprika.domain.transaction.client;

/**
 * 거래 -> 상품(post) 정보 "조회" 호출 통로 (담당 경계)
 * 담당: D - 이동준 (인터페이스 정의) / 
 *
 * 거래 화면에서 상품명·가격 등을 보여주기 위해 거래 도메인이 이 통로로 상품 정보를 "조회"한다.
 * 실제 연동 방식(REST API 호출 / PostService 직접 호출)은 구현체에서 결정한다.
 */
public interface PostQueryClient {

    /** postId로 거래 화면에 표시할 상품 정보를 조회한다. */
    PostInfo getPostInfo(Long postId);
}
