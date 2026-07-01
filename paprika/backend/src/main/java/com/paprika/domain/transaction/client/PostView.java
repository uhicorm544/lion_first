package com.paprika.domain.transaction.client;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.math.BigDecimal;

/**
 * posts 테이블 읽기 전용 매핑 (거래 화면 표시용)
 * 담당: D - 이동준
 *
 * 거래 도메인이 상품(post) 정보를 "조회"만 하기 위한 읽기 전용 뷰 엔티티다.
 * - @Subselect: 테이블이 아닌 SELECT 쿼리에 매핑 → Hibernate 가 DDL(create/alter)을 생성하지 않는다.
 *               (일반 @Table 매핑은 ddl-auto=update 가 posts 컬럼 타입을 ALTER 하므로 사용하지 않음)
 * - @Immutable: 수정/삭제 불가(SELECT 전용)
 * - @Synchronize: 연관 테이블 명시(쓰기 전 flush 보장)
 */
@Entity
@Immutable
@Subselect("select id, user_id, title, current_price from posts")
@Synchronize("posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostView {

    @Id
    private Long id;

    @Column(name = "user_id")
    private Long userId; // 판매자(작성자) id

    private String title;

    @Column(name = "current_price")
    private BigDecimal currentPrice;
}
