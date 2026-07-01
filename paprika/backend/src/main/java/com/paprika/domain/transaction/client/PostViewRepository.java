package com.paprika.domain.transaction.client;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * posts 테이블 읽기 전용 조회 Repository (거래 화면 표시용)
 * 담당: D - 이동준
 */
public interface PostViewRepository extends JpaRepository<PostView, Long> {
}
