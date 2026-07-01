package com.paprika.domain.transaction.client;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * PostQueryClient 실제 구현 (JPA로 posts 테이블 읽기 전용 조회)
 * 담당: D - 이동준
 *
 * 거래 화면 표시용으로 posts 테이블을 SELECT만 한다. (테이블/스키마는 변경하지 않음)
 *  - title          -> 상품명
 *  - current_price  -> 가격
 *  - user_id        -> 판매자(작성자) id
 *
 * post 도메인 서비스가 완성되면 이 구현 대신 PostService 직접 호출로 교체할 수 있다.
 */
@Primary
@Component
public class PostQueryClientJpa implements PostQueryClient {

    private final PostViewRepository postViewRepository;

    public PostQueryClientJpa(PostViewRepository postViewRepository) {
        this.postViewRepository = postViewRepository;
    }

    @Override
    public PostInfo getPostInfo(Long postId) {
        PostView post = postViewRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다. postId=" + postId));
        return new PostInfo(
                post.getId(),
                post.getTitle(),
                post.getCurrentPrice(),
                post.getUserId());
    }
}
