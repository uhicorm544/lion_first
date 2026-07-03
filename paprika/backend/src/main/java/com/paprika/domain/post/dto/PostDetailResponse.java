package com.paprika.domain.post.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostCategory;
import com.paprika.domain.post.entity.Post.PostStatus;
import com.paprika.domain.post.entity.PostImage;

import lombok.Builder;

@Builder
public record PostDetailResponse(
        Long id,
        Long userId,
        String nickname,
        String title,
        String content,
        double latitude,
        double longitude,
        BigDecimal currentPrice,
        boolean active,
        PostStatus postStatus,
        PostCategory category,
        int viewCount,
        Instant createdAt,
        List<String> imgUrls) {
    public static PostDetailResponse from(Post post, List<PostImage> PostImages, String nickname) {
        return PostDetailResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .nickname(nickname)
                .title(post.getTitle())
                .content(post.getContent())
                .latitude(post.getLatitude())
                .longitude(post.getLongitude())
                .currentPrice(post.getCurrentPrice())
                .active(post.isActive())
                .postStatus(post.getPostStatus())
                .category(post.getCategory())
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt())
                .imgUrls(PostImages.stream().map(PostImage::getImgUrl).toList())
                .build();
    }
}
