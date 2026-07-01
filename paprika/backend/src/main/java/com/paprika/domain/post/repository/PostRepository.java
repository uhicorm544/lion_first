package com.paprika.domain.post.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.paprika.domain.post.entity.Post;

/**
 * 담당: B - 백성민
 * TODO: QueryDSL 또는 Specification으로 복합 검색 구현
 */
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByCategory(String category, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    Page<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Post> findById(Long id, Pageable pageable);

    // 1. TODO: Search -> how?
    // 1) Like
    // 2) cacheing 전략?
}
