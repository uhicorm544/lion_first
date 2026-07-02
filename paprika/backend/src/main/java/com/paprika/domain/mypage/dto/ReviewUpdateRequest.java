package com.paprika.domain.mypage.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

/**
 * 리뷰 수정 요청 DTO
 * 담당: E - 장인호
 */
@Getter
public class ReviewUpdateRequest {

    private String content;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;
}
