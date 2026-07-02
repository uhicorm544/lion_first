package com.paprika.domain.mypage.dto;

import com.paprika.domain.mypage.entity.WishList;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class WishListResponse {
    private Long id;
    private Long productId;
    private String title;
    private String imgUrl;
    private LocalDateTime createdAt;

    public static WishListResponse from(WishList w, String title, String imgUrl) {
        return WishListResponse.builder()
                .id(w.getId())
                .productId(w.getProductId())
                .title(title)
                .imgUrl(imgUrl)
                .createdAt(w.getCreatedAt())
                .build();
    }
}