package com.paprika.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth (A - 민동현)
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 틀립니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    WITHDRAWN_ACCOUNT(HttpStatus.UNAUTHORIZED, "탈퇴한 계정입니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    OAUTH2_ACCOUNT(HttpStatus.BAD_REQUEST, "소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요."),
    INVALID_RESET_CODE(HttpStatus.BAD_REQUEST, "유효하지 않은 인증코드입니다."),
    EXPIRED_RESET_CODE(HttpStatus.BAD_REQUEST, "만료된 인증코드입니다. 다시 요청해주세요."),

    // Product (B - 백성민)
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."),
    PRODUCT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "상품에 대한 권한이 없습니다."),

    // Chat (C - 한대천)
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."),
    CHAT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "채팅방에 대한 권한이 없습니다."),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),

    // Transaction (D - 이동준)
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다."),
    TRANSACTION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "거래에 대한 권한이 없습니다."),
    INVALID_TRANSACTION_STATUS(HttpStatus.BAD_REQUEST, "유효하지 않은 거래 상태입니다."),

    // Review (E - 장인호)
    REVIEW_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 리뷰를 작성했습니다."),
    INVALID_RATING(HttpStatus.BAD_REQUEST, "유효하지 않은 별점입니다."),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."),
    REVIEW_ACCESS_DENIED(HttpStatus.FORBIDDEN, "리뷰에 대한 권한이 없습니다."),

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
