package com.paprika.domain.post.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostCategory;

import lombok.Builder;

/**
 * 상품 응답 DTO
 * 담당: B - 백성민
 */
@Builder
public record PostResponse(
        Long id,
        Long userId,
        String title,
        String content,
        double latitude,
        double longitude,
        String thumbnailUrl,
        BigDecimal currentPrice,
        boolean active,
        PostCategory category,
        int viewCount,
        Instant createdAt) {
    public static PostResponse from(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .title(post.getTitle())
                .content(post.getContent())
                .latitude(post.getLatitude())
                .longitude(post.getLongitude())
                .thumbnailUrl(post.getThumbnailUrl())
                .currentPrice(post.getCurrentPrice())
                .active(post.isActive())
                .category(post.getCategory())
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
