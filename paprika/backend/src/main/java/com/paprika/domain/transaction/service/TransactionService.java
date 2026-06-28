package com.paprika.domain.transaction.service;

import com.paprika.domain.transaction.client.PostStatusClient;
import com.paprika.domain.transaction.entity.Transaction;
import com.paprika.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 거래 서비스
 * 담당: D - 이동준
 *
 * 거래 상태를 전이시키고, 그에 맞춰 상품(post) 상태 변경을 PostStatusClient로 "요청"한다.
 *  - 거래 확정(AGREED)   -> 상품 RESERVED(예약중)
 *  - 거래 완료(COMPLETED) -> 상품 COMPLETED(완료)
 * (상품 상태를 실제로 바꾸는 부분은 post 담당 팀원이 PostStatusClient 구현에서 처리)
 *
 * TODO:
 *  - 거래 생성 (직거래/택배 분기)
 *  - 거래 취소 처리 및 상품 상태 복구
 *  - 거래 상태 전이 검증 (FSM)
 *  - 세금계산서 발행 로직
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PostStatusClient postStatusClient;

    /** 거래 확정: 거래를 AGREED로, 상품을 RESERVED(예약중)로 변경 요청 */
    @Transactional
    public void agreeTransaction(Long transactionId) {
        Transaction transaction = findTransaction(transactionId);
        transaction.agree();
        postStatusClient.markReserved(transaction.getPostId());
    }

    /** 거래 완료: 거래를 COMPLETED로, 상품을 COMPLETED(완료)로 변경 요청 */
    @Transactional
    public void completeTransaction(Long transactionId) {
        Transaction transaction = findTransaction(transactionId);
        transaction.complete();
        postStatusClient.markCompleted(transaction.getPostId());
    }

    private Transaction findTransaction(Long transactionId) {
        return transactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다. id=" + transactionId));
    }
}
