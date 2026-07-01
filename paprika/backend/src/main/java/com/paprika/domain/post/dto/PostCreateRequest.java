package com.paprika.domain.post.dto;

import java.math.BigDecimal;
import java.util.List;

import com.paprika.domain.post.entity.Post.PostCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

@Builder
public record PostCreateRequest(
        @NotBlank String title,
        @NotNull @Positive BigDecimal price,
        @NotBlank String content,
        PostCategory category,
        double latitude,
        double longitude,
        List<String> imgUrls) {
    public static PostCreateRequest of(
            String title,
            BigDecimal price,
            String content,
            PostCategory category,
            double latitude,
            double longitude,
            List<String> imgUrls) {
        return PostCreateRequest.builder()
                .title(title)
                .price(price)
                .content(content)
                .category(category)
                .latitude(latitude)
                .longitude(longitude)
                .imgUrls(imgUrls)
                .build();
    }
}
