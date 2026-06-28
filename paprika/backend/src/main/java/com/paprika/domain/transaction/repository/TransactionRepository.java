package com.paprika.domain.transaction.repository;

import com.paprika.domain.transaction.entity.Transaction;
import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 담당: D - 이동준
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Transaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    /** 중복 거래 방지: 동일 게시글(상품)에 진행 중(취소/완료 아님)인 거래가 있는지 확인 */
    boolean existsByPostIdAndStatusIn(Long postId, List<TransactionStatus> statuses);
}
