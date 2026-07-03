package com.paprika.domain.post.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostImage {
    /* --- 1. Column Define --- */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    @Column
    private String imgUrl;
    /**
     * enable -> Active 로 변경
     * 사용자 요청에서 image 가 delete 되면 active = false
     * 이후, 배치 작업에서
     * 1) active = false 인 데이터에 대해 delete_scheduled_at 데이터 update
     * 2) delete_scheduled_at 에 대해 overdue 인 것에 대해 삭제
     */
    @Column(nullable = false)
    private boolean active = true;
    @Column
    private Instant deleteScheduledAt;

    /* --- 2. Builder --- */
    @Builder
    private PostImage(Post post, String imgUrl) {
        this.post = post;
        this.imgUrl = imgUrl;
    }

    /* --- 3. Entity Method --- */
    /**
     * 삭제 예정일 : 현재 + 7일
     * 
     * @param scheduledAt
     */
    public void softDeleteSchedule() {
        final int SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60; // 7일을 초 단위로 계산
        this.active = false;
        this.deleteScheduledAt = Instant.now().plusSeconds(SEVEN_DAYS_IN_SECONDS); // 7일 후
    }
}
