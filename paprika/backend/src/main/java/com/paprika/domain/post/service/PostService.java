package com.paprika.domain.post.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paprika.domain.auth.entity.User;
import com.paprika.domain.auth.repository.UserRepository;
import com.paprika.domain.post.dto.PostCreateRequest;
import com.paprika.domain.post.dto.PostDetailResponse;
import com.paprika.domain.post.dto.PostResponse;
import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostCategory;
import com.paprika.domain.post.entity.Post.PostStatus;
import com.paprika.domain.post.entity.PostImage;
import com.paprika.domain.post.repository.PostImageRepository;
import com.paprika.domain.post.repository.PostPriceHistoryRepository;
import com.paprika.domain.post.repository.PostRepository;

import lombok.RequiredArgsConstructor;

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
public class PostService implements IPostStatusUpdater {
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final PostPriceHistoryRepository postPriceHistoryRepository;
    private final UserRepository userRepository;

    // 단건 조회
    // (As-is - 07/02) 현재 쿼리 두 번 나가는 구조임
    // (To-be) @Query 또는 @EntityGraph or fetch join로 한 번에 가져오도록 수정 필요
    public PostDetailResponse getPostById(Long id) {
        Post post = postRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + id));
        List<PostImage> postImages = postImageRepository.findByPost_IdAndActiveTrue(id);
        User user = userRepository.findById(post.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + post.getUserId()));
        return PostDetailResponse.from(post, postImages, user.getNickname());
    }

    // 전체 or 카테고리별 조회
    public Page<PostResponse> getPostsByCategory(Pageable pageable, PostCategory category) {
        Page<Post> posts = (category != null)
                ? postRepository.findByCategoryAndActiveTrue(category, pageable)
                : postRepository.findByActiveTrue(pageable);
        return posts.map(PostResponse::from);
    }

    // 여기가 중요하구나
    // 선택사항으로 두었을 때, 입력을 한다면 Post에서 builder는 어떻게 해야하는가
    // PostCreateRequest에서 category를 null로 두고, Post에서 category를 null로 두면 된다.
    @Transactional
    public Long createPost(Long userId, PostCreateRequest request) {
        String thumbnailUrl = (request.imgUrls() != null && !request.imgUrls().isEmpty())
                ? request.imgUrls().get(0)
                : null;

        Post post = Post.builder()
                .userId(userId)
                .title(request.title())
                .content(request.content())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .currentPrice(request.price())
                .thumbnailUrl(thumbnailUrl)
                .category(request.category())
                .build();
        postRepository.save(post);

        if (request.imgUrls() != null) {
            List<PostImage> postImages = request.imgUrls().stream()
                    .map(imgUrl -> PostImage.builder()
                            .post(post)
                            .imgUrl(imgUrl)
                            .build())
                    .toList();
            postImageRepository.saveAll(postImages);
        }

        return post.getId();
    }

    // Post 수정
    @Transactional
    public Long updatePost(Long requesterId, Long postId, PostCreateRequest request) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));
        if (!post.getUserId().equals(requesterId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // Post update
        post.updateContent(request.title(), request.content());
        post.updatePrice(request.price());

        // PostImage update
        // 일단은 기존 이미지들을 soft delete 하고, 이미지를 다시 등록하는 방식으로 구현
        // edited : 07/02
        // TODO: 이미지 수정 로직 개선 필요 (예: 기존 이미지와 비교하여 변경된 부분만 업데이트)
        List<PostImage> existingImages = postImageRepository.findByPost_IdAndActiveTrue(postId);
        existingImages.forEach(PostImage::softDeleteSchedule);

        if (request.imgUrls() != null && !request.imgUrls().isEmpty()) {
            List<PostImage> newImages = request.imgUrls().stream()
                    .map(imgUrl -> PostImage.builder()
                            .post(post)
                            .imgUrl(imgUrl)
                            .build())
                    .toList();
            postImageRepository.saveAll(newImages);
            post.updateThumbnailUrl(request.imgUrls().get(0));
        } else {
            post.updateThumbnailUrl(null);
        }

        return post.getId();
    }

    // Post 삭제 (soft delete)
    // edited : 07/02
    // 이것도 TODO: 이미지 수정 로직 개선
    @Transactional
    public void deletePost(Long requesterId, Long postId) {
        Post post = postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));
        if (!post.getUserId().equals(requesterId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }
        post.softDeletePost();

        List<PostImage> existingImages = postImageRepository.findByPost_IdAndActiveTrue(postId);
        existingImages.forEach(PostImage::softDeleteSchedule);
    }

    // TODO : search 임시
    public Page<PostResponse> searchPosts(String keyword, Pageable pageable) {
        Page<Post> posts = postRepository.searchPostsByKeyword(keyword, pageable);
        return posts.map(PostResponse::from);
    }

    @Override
    @Transactional
    public void reservePost(Long postId) {
        changeStatus(postId, PostStatus.RESERVED);
    }

    @Override
    @Transactional
    public void sellingPostAsCanceled(Long postId) {
        changeStatus(postId, PostStatus.SELLING);

    }

    @Override
    @Transactional
    public void soldPost(Long postId) {
        changeStatus(postId, PostStatus.SOLD);
    }

    private void changeStatus(Long postId, PostStatus newStatus) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId));
        post.updateStatus(newStatus);

    }
}
