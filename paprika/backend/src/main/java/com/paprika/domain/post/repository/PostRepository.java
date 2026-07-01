package com.paprika.domain.post.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostCategory;

/**
 * 담당: B - 백성민
 * TODO: QueryDSL 또는 Specification으로 복합 검색 구현
 */
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByCategoryAndActiveTrue(PostCategory category, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword%")
    Page<Post> searchPostsByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Optional<Post> findByIdAndActiveTrue(Long id);

}
