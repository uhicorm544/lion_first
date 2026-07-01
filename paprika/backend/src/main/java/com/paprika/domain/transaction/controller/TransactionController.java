package com.paprika.domain.transaction.controller;

import com.paprika.domain.transaction.client.PostInfo;
import com.paprika.domain.transaction.client.PostQueryClient;
import com.paprika.domain.transaction.dto.TransactionCreateRequest;
import com.paprika.domain.transaction.dto.TransactionResponse;
import com.paprika.domain.transaction.dto.TransactionStatusRequest;
import com.paprika.domain.transaction.service.TransactionService;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import com.paprika.global.response.ApiResponse;
import com.paprika.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 거래 컨트롤러
 * 담당: D - 이동준
 *
 * TODO:
 *  - PATCH  /api/v1/transactions/{id}/tracking       운송장 번호 입력 (택배)
 *  - PATCH  /api/v1/transactions/{id}/meeting        약속 장소/시간 설정 (직거래)
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    //상품 조회 통로
    private final PostQueryClient postQueryClient;

    //거래생성 (거래하기를 누른 로그인 사용자가 구매자)
    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransactionCreateRequest request
    ) {
        Long buyerId = requireUserId(userDetails);
        TransactionResponse response = transactionService.createTransaction(request, buyerId);
        return ResponseEntity.ok(ApiResponse.ok("거래가 생성되었습니다.", response));
    }

    // 거래 화면 표시용 상품(post) 정보 조회 (PostQueryClientJdbc로 posts 테이블 조회)
    @GetMapping("/post-info/{postId}")
    public ResponseEntity<ApiResponse<PostInfo>> getPostInfo(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.ok(postQueryClient.getPostInfo(postId)));
    }

    // 내 거래 목록 조회 (진행 중 + 완료, 상태 페이지 재방문 시에도 표시)
    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getMyTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long buyerId = requireUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getMyTransactions(buyerId)));
    }

    //거래 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getTransaction(id)));
    }

    // 거래 상태 변경: AGREED(확정) -> 상품 예약중 요청 / CANCELLED(취소) -> 상품 판매중 복구 요청
    // (POST 테이블 실제 변경·홈페이지 표시는 POST 담당. 여기서는 변경을 "요청"만 한다)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TransactionStatusRequest request
    ) {
        switch (request.getStatus()) {
            case AGREED -> transactionService.agreeTransaction(id);
            case CANCELLED -> transactionService.cancelTransaction(id);
            default -> throw new IllegalArgumentException(
                    "지원하지 않는 상태 변경입니다. status=" + request.getStatus());
        }
        return ResponseEntity.ok(ApiResponse.ok("거래 상태가 변경되었습니다.", null));
    }

    @PatchMapping("/{id}/tracking")
    public ResponseEntity<ApiResponse<Void>> updateTracking(
            @PathVariable Long id,
            @RequestParam String trackingNumber
    ) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok("운송장 번호가 등록되었습니다.", null));
    }

    // 거래 최종 완료: 거래 COMPLETED -> 상품 완료(COMPLETED)로 변경 요청
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> completeTransaction(@PathVariable Long id) {
        transactionService.completeTransaction(id);
        return ResponseEntity.ok(ApiResponse.ok("거래가 완료되었습니다.", null));
    }

    // 거래 내역 삭제: 완료(COMPLETED) 건만 구매자/판매자가 삭제 가능
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = requireUserId(userDetails);
        transactionService.deleteTransaction(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("거래 내역이 삭제되었습니다.", null));
    }

    // 로그인한 사용자(JWT) id 추출. 토큰이 없으면 401(인증 필요)
    private Long requireUserId(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }
        return userDetails.getUserId();
    }
}
