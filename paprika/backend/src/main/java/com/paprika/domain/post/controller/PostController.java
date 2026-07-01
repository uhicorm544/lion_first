package com.paprika.domain.post.controller;

import com.paprika.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 중고 상품 컨트롤러
 * 담당: B - 백성민
 *
 * TODO:
 * - GET /api/v1/products 상품 목록 조회 (필터, 검색, 페이징)
 * - GET /api/v1/products/{id} 상품 상세 조회
 * - POST /api/v1/products 상품 등록 (이미지 포함)
 * - PUT /api/v1/products/{id} 상품 수정
 * - DELETE /api/v1/products/{id} 상품 삭제
 * - GET /api/v1/products/search 복합 검색 (자동완성 포함)
 * - POST /api/v1/products/{id}/status 상태 변경 (판매중/예약중/판매완료)
 */
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    // TODO: private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getPosts(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getPost(@PathVariable Long id) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createPost(
            /* @Valid @RequestBody ProductCreateRequest request, */
            @RequestParam(required = false) List<MultipartFile> images) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updatePosts(@PathVariable Long id
    /* @Valid @RequestBody ProductUpdateRequest request */) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok("상품이 삭제되었습니다.", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchPosts(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        // TODO: 자동완성 + 복합 검색 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
