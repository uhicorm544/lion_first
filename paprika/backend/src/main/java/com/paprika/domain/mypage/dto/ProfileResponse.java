package com.paprika.domain.mypage.dto;

import com.paprika.domain.mypage.entity.MyPageUser;
import lombok.Builder;
import lombok.Getter;

/**
 * 프로필 조회 응답 DTO
 * 담당: E - 장인호
 */
@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private String nickname;
    private String profileImageUrl;

    public static ProfileResponse from(MyPageUser user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}