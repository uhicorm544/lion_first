package com.paprika.domain.transaction.controller;

import com.paprika.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 거래 컨트롤러
 * 담당: D - 이동준
 *
 * TODO:
 *  - POST   /api/v1/transactions                     거래 시작 (직거래/택배 선택)
 *  - GET    /api/v1/transactions/{id}                거래 상세 조회
 *  - PATCH  /api/v1/transactions/{id}/status         거래 상태 변경
 *  - PATCH  /api/v1/transactions/{id}/tracking       운송장 번호 입력 (택배)
 *  - PATCH  /api/v1/transactions/{id}/meeting        약속 장소/시간 설정 (직거래)
 *  - POST   /api/v1/transactions/{id}/complete       거래 최종 완료 처리
 */
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    // TODO: private final TransactionService transactionService;

    //거래생성
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createTransaction(
            /* @Valid @RequestBody TransactionCreateRequest request */
    ) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getTransaction(@PathVariable Long id) {
        // TODO: 구현
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id
            /* @RequestBody TransactionStatusRequest request */
    ) {
        // TODO: 구현
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

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> completeTransaction(@PathVariable Long id) {
        // TODO: 거래 완료 처리 + 리뷰 작성 유도 (E - 장인호와 연동)
        return ResponseEntity.ok(ApiResponse.ok("거래가 완료되었습니다.", null));
    }
}
