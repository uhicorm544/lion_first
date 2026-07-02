package com.paprika.domain.mypage.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 매너온도 엔티티
 * 담당: E - 장인호
 */
@Entity
@Table(name = "manner_temperatures")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MannerTemperature {

    @Id
    @Column(name = "user_id")
    private Long userId;

    private Integer temperature;

    @Column(name = "trust_grade")
    private String trustGrade;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public static MannerTemperature defaultFor(Long userId) {
        MannerTemperature m = new MannerTemperature();
        m.userId = userId;
        m.temperature = 50;
        m.trustGrade = "보통";
        m.reviewCount = 0;
        m.lastUpdated = LocalDateTime.now();
        return m;
    }

    public void applyScore(int mannerScore) {
        this.temperature = clamp(this.temperature + mannerScore);
        this.reviewCount++;
        this.trustGrade = calcGrade(this.temperature);
        this.lastUpdated = LocalDateTime.now();
    }

    /** 리뷰 수정 시 사용: reviewCount는 그대로 두고 온도 차이(delta)만 반영 */
    public void adjustScore(int delta) {
        this.temperature = clamp(this.temperature + delta);
        this.trustGrade = calcGrade(this.temperature);
        this.lastUpdated = LocalDateTime.now();
    }

    /** 리뷰 삭제 시 사용: 기존 점수 되돌리고 reviewCount -1 */
    public void revertScore(int mannerScore) {
        this.temperature = clamp(this.temperature - mannerScore);
        this.reviewCount = Math.max(0, this.reviewCount - 1);
        this.trustGrade = calcGrade(this.temperature);
        this.lastUpdated = LocalDateTime.now();
    }

    private int clamp(int temp) {
        return Math.max(1, Math.min(100, temp));
    }

    private String calcGrade(int temp) {
        if (temp <= 20) return "나쁨";
        if (temp <= 40) return "약간나쁨";
        if (temp <= 60) return "보통";
        if (temp <= 80) return "좋음";
        return "최고";
    }
}