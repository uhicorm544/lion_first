package com.paprika.domain.mypage.controller;

import com.paprika.domain.mypage.dto.ProfileResponse;
import com.paprika.domain.mypage.dto.ProfileUpdateRequest;
import com.paprika.domain.mypage.service.MyPageService;
import com.paprika.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * 마이페이지 컨트롤러
 * 담당: E - 장인호
 *
 * - GET    /api/v1/users/me              내 프로필 조회
 * - PATCH  /api/v1/users/me              프로필 수정
 * - GET    /api/v1/users/me/products     나의 판매 상품 목록 (판매중/예약중/완료)
 * - GET    /api/v1/users/me/wishlist     관심 상품(찜) 목록
 * - GET    /api/v1/users/me/wishlist/{productId}    찜 여부 확인
 * - POST   /api/v1/users/me/wishlist/{productId}    찜 추가
 * - DELETE /api/v1/users/me/wishlist/{productId}    찜 취소
 * - GET    /api/v1/users/{id}/reviews    유저 리뷰 목록 (매너 온도)
 * - POST   /api/v1/reviews               거래 후기 작성
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    /**
     * 내 프로필 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(myPageService.getMyProfile(userId));
    }

    /**
     * 내 프로필 수정 (닉네임, 프로필 이미지)
     */
    @PatchMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(myPageService.updateMyProfile(userId, request));
    }

    /**
     * 닉네임 중복 확인
     */
    @GetMapping("/me/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNickname(
            @RequestParam String nickname,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        boolean isDuplicate = myPageService.isNicknameDuplicate(nickname, userId);
        return ResponseEntity.ok(Map.of("isDuplicate", isDuplicate));
    }

    @GetMapping("/me/products")
    public ResponseEntity<ApiResponse<Object>> getMyProducts(
            @RequestParam(required = false, defaultValue = "ALL") String status
    ) {
        // TODO: 판매중/예약중/완료 필터링 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /**
     * 나의 거래 내역 조회 (탭별)
     * tab: all | buy | sell | selling
     */
    @GetMapping("/me/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyTransactions(
            @RequestParam(defaultValue = "all") String tab,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(myPageService.getMyTransactions(userId, tab, page, size)));
    }
    //찜목록조회
    @GetMapping("/me/wishlist")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyWishList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(myPageService.getMyWishList(userId, page, size)));
    }
    //찜 여부 확인
    @GetMapping("/me/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> isWished(
            @PathVariable Long productId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(myPageService.isWished(userId, productId)));
    }
    //찜 추가
    @PostMapping("/me/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Void>> addWishList(
            @PathVariable Long productId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        myPageService.addWishList(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    //찜 삭제
    @DeleteMapping("/me/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeWishList(
            @PathVariable Long productId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        myPageService.removeWishList(userId, productId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}