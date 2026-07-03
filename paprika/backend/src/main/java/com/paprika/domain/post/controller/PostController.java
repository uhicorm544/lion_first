package com.paprika.domain.post.controller;

import com.paprika.domain.post.dto.PostCreateRequest;
import com.paprika.domain.post.dto.PostDetailResponse;
import com.paprika.domain.post.dto.PostResponse;
import com.paprika.domain.post.entity.Post.PostCategory;
import com.paprika.domain.post.service.PostService;
import com.paprika.global.response.ApiResponse;
import com.paprika.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 중고 상품 컨트롤러
 * 담당: B - 백성민
 *
 * TODO:
 * - GET /api/v1/posts/search 복합 검색 (자동완성 포함)
 * - POST /api/v1/posts/{id}/status 상태 변경 (판매중/예약중/판매완료)
 */
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPosts(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) PostCategory category) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getPostsByCategory(pageable, category)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDetailResponse>> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getPostById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createPost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(postService.createPost(userDetails.getUserId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Long>> updatePost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(postService.updatePost(userDetails.getUserId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        postService.deletePost(userDetails.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> searchPosts(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        // TODO: 복합 검색 구현
        return ResponseEntity.ok(ApiResponse.ok(postService.searchPosts(keyword, pageable)));
    }
}
