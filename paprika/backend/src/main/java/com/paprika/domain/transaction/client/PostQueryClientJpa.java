package com.paprika.domain.transaction.client;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.repository.PostRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * PostQueryClient 실제 구현 (B 도메인 PostRepository로 post 테이블 조회)
 * 담당: D - 이동준
 *
 * 상품 상세(/api/v1/posts/{id})와 동일한 post 테이블을 읽는다.
 */
@Primary
@Component
public class PostQueryClientJpa implements PostQueryClient {

    private final PostRepository postRepository;

    public PostQueryClientJpa(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    public PostInfo getPostInfo(Long postId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다. postId=" + postId));
        return new PostInfo(
                post.getId(),
                post.getTitle(),
                post.getCurrentPrice(),
                post.getUserId(),
                post.getPostStatus().name());
    }
}
