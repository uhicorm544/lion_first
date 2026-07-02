package com.paprika.global.exception;

import com.paprika.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PaprikaException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaprikaException(PaprikaException e) {
        log.warn("PaprikaException: {}", e.getMessage());
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse(ErrorCode.INVALID_INPUT.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.fail(message));
    }

    // 잘못된 요청 값(예: 존재하지 않는 상품) -> 400, 실제 사유를 그대로 전달
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("IllegalArgumentException: {}", e.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
    }

    // 현재 상태에서 처리 불가(예: 이미 진행 중인 거래) -> 409 Conflict, 실제 사유를 그대로 전달
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException e) {
        log.warn("IllegalStateException: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(e.getMessage()));
    }

    // 본문 파싱 실패(예: 잘못된 날짜·시간 형식 "1232-13-21T32:31") -> 500이 아닌 400으로 응답
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException e) {
        log.warn("HttpMessageNotReadableException: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.fail("요청 형식이 올바르지 않습니다. 입력값(날짜·시간 등)을 확인해 주세요."));
    }

    // FK/유니크 제약 위반 등 DB 저장 실패 -> 409, 사유를 최대한 전달
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException e) {
        log.warn("DataIntegrityViolationException: {}", e.getMessage());
        String detail = e.getMostSpecificCause() != null
                ? e.getMostSpecificCause().getMessage()
                : e.getMessage();
        if (detail != null && detail.contains("not present in table \"posts\"")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("존재하지 않는 상품입니다. 상품 페이지에서 다시 시도해 주세요."));
        }
        if (detail != null && (detail.contains("post_id") || detail.contains("product_id"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.fail("거래 저장에 실패했습니다. DB 스키마(post_id)를 확인해 주세요."));
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.fail("거래를 저장할 수 없습니다. 이미 진행 중인 거래가 있거나 입력 정보를 확인해 주세요."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.internalServerError()
                .body(ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
