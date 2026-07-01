package com.paprika.domain.post.entity;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 중고 상품 엔티티
 * 담당: B - 백성민
 *
 * TODO:
 * - 2026.06.26
 * - @author 백성민
 * - 1. Category 엔티티 연관 관계 추가 but completed yet -> why? 우선 enum 으로 정의 후, 회의 후
 * Description table 로 리팩토링
 * - 2. 조회수(viewCount) 캐싱 전략 고려
 * - 3. 임시저장(DRAFT) 상태 Logic -> Default 로 selling. 이후 수정 시 DRAFT 변경
 * - 4. 예외 처리를 고민 해 보기
 */
@Entity
@Table(name = "post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseTimeEntity {
    /* --- 1. Column Define --- */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column
    private String thumbnailUrl;
    /**
     * 위도, 경도의 데이터 타입 (float vs double) 오차 고려함
     * - float: 7자리 소수점까지 정확, 약 1.1m 오차
     * - double: 15자리 소수점까지 정확, 약 0.0001m 오차
     * - 일반적인 위치 정보는 double 사용 권장
     * - float는 4바이트, double은 8바이트로 메모리 사용량 차이 있음
     * - 비즈니스상 약속 장소에 대한 물리적 거리가 일반적으로 중요 하지 않을 것으로 생각해, float 사용 하려 했으나
     * - 그로 인한 데이테 효율성 증가가 크지 않다고 판단하여, gps 권장 표준인 double 사용
     */
    @Column
    private double latitude;
    @Column
    private double longitude;
    @Column(nullable = false)
    private BigDecimal currentPrice;
    @Column(nullable = false)
    private boolean active = true;
    @Enumerated(EnumType.STRING)
    private PostCategory category;
    /**
     * product_status -> postStatus 로 컬럼명 변경
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus postStatus = PostStatus.SELLING;
    @Column(nullable = false)
    private int viewCount = 0;

    /* --- 1.1. For Post entity Enum Type --- */
    public enum PostCategory {
        ELECTRONICS, FASHION, HOME, KIDS, BOOKS, SPORTS, HOBBIES, OTHERS
    }

    public enum PostStatus {
        SELLING("판매중"),
        RESERVED("예약중"),
        SOLD("판매완료"),
        DRAFT("임시저장");

        private final String description;

        PostStatus(String description) {
            this.description = description;
        }

        public void validateNextStatus(PostStatus nextStatus) {
            if (this == nextStatus)
                return;

            boolean isAllowed = switch (this) {
                case DRAFT -> List.of(SELLING).contains(nextStatus);
                case SELLING -> List.of(RESERVED, SOLD).contains(nextStatus);
                case RESERVED -> List.of(SELLING, SOLD).contains(nextStatus);
                case SOLD -> false;
            };

            if (!isAllowed) {
                throw new IllegalArgumentException(this.description + " 상태에서 " + nextStatus.description + " 변경 불가");
            }
        }
    }

    /* --- 2. Builder --- */
    @Builder
    private Post(Long userId, String title, String content, BigDecimal currentPrice) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.currentPrice = currentPrice;
    }

    /* --- 2.1. static Factory Method */
    public static Post createPost(Long userId, String title, String content, BigDecimal currentPrice) {
        if (userId == null || title == null || content == null || currentPrice == null) {
            throw new IllegalArgumentException("필수 값이 누락 되었습니다.");
        }
        return Post.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .currentPrice(currentPrice)
                .build();
    }

    /* --- 3. Entity Method --- */
    /**
     * Post Entity 의 title 과 content 를 update
     * 
     * @param title
     * @param content
     */
    public void updateContent(String title, String content) {
        if (title == null || title.isBlank())
            throw new IllegalArgumentException();
        this.title = title;
        this.content = content;
    }

    /**
     * Post Entity 의 price 업데이트
     * - 0 미만 불가
     * 
     * @param newPrice
     */
    public void updatePrice(BigDecimal newPrice) {
        if (newPrice.compareTo(BigDecimal.valueOf(0)) < 0)
            throw new IllegalArgumentException();
        this.currentPrice = newPrice;
    }

    /**
     * Post Entity의 status 업데이트
     * 
     * @param newStatus
     */
    public void updateStatus(PostStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("변경 할 상태를 입력 해 주세요");
        }
        this.postStatus.validateNextStatus(newStatus);
        this.postStatus = newStatus;
    }

    /**
     * Post Soft delete
     */
    public void softDeletePost() {
        if (this.active) {
            this.active = false;
        }
    }

    public void addViewCount() {
        this.viewCount++;
    }
}
