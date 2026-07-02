package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 담당: E - 장인호
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    boolean existsByTransactionIdAndReviewerId(Long transactionId, Long reviewerId);

    Optional<Review> findByTransactionIdAndReviewerId(Long transactionId, Long reviewerId);
}
