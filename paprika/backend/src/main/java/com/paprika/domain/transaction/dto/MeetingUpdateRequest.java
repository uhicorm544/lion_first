package com.paprika.domain.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 직거래 약속 확정 요청 DTO
 * 담당: D - 이동준
 *
 * 이미 생성된 직거래(AGREED)에 약속 장소·시간을 얹고 상품을 예약중으로 바꿀 때 쓴다.
 */
@Getter
public class MeetingUpdateRequest {

    @NotBlank
    private String meetingLocation;

    @NotNull
    private LocalDateTime meetingTime;
}
