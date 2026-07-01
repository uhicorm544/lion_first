package com.paprika.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.paprika.domain.post.entity.PostPriceHistory;

public interface PostPriceHistoryRepository extends JpaRepository<PostPriceHistory, Long> {

}
