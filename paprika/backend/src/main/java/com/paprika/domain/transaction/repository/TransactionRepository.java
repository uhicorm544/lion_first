package com.paprika.domain.transaction.repository;

import com.paprika.domain.transaction.entity.Transaction;
import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 담당: D - 이동준
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Transaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    /** 내 거래 목록(구매자 OR 판매자, 특정 상태만) 조회: 최신순
     *  - 구매자: 거래하기를 누른 사람 / 판매자: 상품 등록자
     */
    @Query("SELECT t FROM Transaction t " +
           "WHERE (t.buyerId = :userId OR t.sellerId = :userId) " +
           "AND t.status IN :statuses " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findMyTransactions(
            @Param("userId") Long userId,
            @Param("statuses") List<TransactionStatus> statuses);

    /** 중복 거래 방지: 동일 게시글에 특정 상태인 거래가 있는지 확인 */
    boolean existsByPostIdAndStatusIn(Long postId, List<TransactionStatus> statuses);

    /** 동일 구매자·게시글에 진행 중인 거래가 있는지 확인 */
    boolean existsByPostIdAndBuyerIdAndStatusIn(
            Long postId, Long buyerId, List<TransactionStatus> statuses);

    /** 같은 상품의 다른 PENDING 거래 조회 (확정 시 일괄 취소용) */
    List<Transaction> findByPostIdAndStatusAndIdNot(
            Long postId, TransactionStatus status, Long excludeId);
}
