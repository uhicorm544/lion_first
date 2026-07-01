package com.paprika.domain.post.service;

import com.paprika.domain.post.dto.PostCreateRequest;
import com.paprika.domain.post.dto.PostResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostCategory;
import com.paprika.domain.post.repository.PostImageRepository;
import com.paprika.domain.post.repository.PostRepository;
import com.paprika.domain.post.repository.PostPriceHistoryRepository;

/**
 * 중고 상품 서비스
 * 담당: B - 백성민
 *
 * TODO:
 * - 상품 등록 (이미지 URL 저장)
 * - 상품 수정 (판매 중 상태 검증)
 * - 상품 삭제 (소프트 딜리트 고려)
 * - 임시 저장 기능 (DRAFT 상태)
 * - [x] 전체 상품 조회 (페이징 처리)
 * - [x] 카테고리 검색(카테고리 제공)
 * - 복합 검색 (카테고리 + 키워드 + 작성자)
 * - 자동완성 및 최근 검색어 저장
 * - 조회수 증가 로직 (중복 방지)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final PostPriceHistoryRepository postPriceHistoryRepository;

    // 전체 조회
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findAll(pageable);
        return posts.map(PostResponse::from);
    }

    // 단건 조회
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + id));
        return PostResponse.from(post);
    }

    // 카테고리별 조회
    public Page<PostResponse> getPostsByCategory(PostCategory category, Pageable pageable) {
        Page<Post> posts = (category != null)
                ? postRepository.findByCategoryAndActiveTrue(category, pageable)
                : postRepository.findAll(pageable);
        return posts.map(PostResponse::from);
    }

    // 여기가 중요하구나
    // 선택사항으로 두었을 때, 입력을 한다면 Post에서 builder는 어떻게 해야하는가
    // PostCreateRequest에서 category를 null로 두고, Post에서 category를 null로 두면 된다.
    @Transactional
    public Long createdPost(Long userId, PostCreateRequest request) {
        Post post = Post.builder()
                .userId(userId)
                .title(request.title())
                .content(request.content())
                // .latitude(request.latitude())
                // .longitude(request.longitude())
                // .thumbnailUrl(request.thumbnailUrl())
                .currentPrice(request.price())
                // .active(true)
                // .category(request.category())
                .build();
        postRepository.save(post);
        return post.getId();
    }
}
