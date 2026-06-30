package com.paprika.domain.transaction.service;

import com.paprika.domain.transaction.client.PostInfo;
import com.paprika.domain.transaction.client.PostQueryClient;
import com.paprika.domain.transaction.client.PostStatusClient;
import com.paprika.domain.transaction.dto.TransactionCreateRequest;
import com.paprika.domain.transaction.dto.TransactionResponse;
import com.paprika.domain.transaction.entity.DeliveryTransaction;
import com.paprika.domain.transaction.entity.DirectTransaction;
import com.paprika.domain.transaction.entity.Transaction;
import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import com.paprika.domain.transaction.entity.Transaction.TransactionType;
import com.paprika.domain.transaction.repository.DeliveryTransactionRepository;
import com.paprika.domain.transaction.repository.DirectTransactionRepository;
import com.paprika.domain.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 거래 서비스
 * 담당: D - 이동준
 *
 * 거래 상태를 전이시키고, 그에 맞춰 상품(post) 상태 변경을 PostStatusClient로 "요청"한다.
 *  - 거래 확정(AGREED)   -> 상품 RESERVED(예약중)
 *  - 거래 완료(COMPLETED) -> 상품 COMPLETED(완료)
 *  - 거래 취소(CANCELLED) -> 상품 SELLING(판매중) 복구
 * (상품 상태를 실제로 바꾸는 부분은 post 담당 팀원이 PostStatusClient 구현에서 처리)
 *
 * TODO:
 *  - 거래 상태 전이 검증 (FSM)
 *  - 세금계산서 발행 로직
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final DirectTransactionRepository directTransactionRepository;
    private final DeliveryTransactionRepository deliveryTransactionRepository;
    private final PostStatusClient postStatusClient;
    private final PostQueryClient postQueryClient;

    /** 거래 생성: 상품 정보를 조회해 거래(PENDING)와 방식별 상세를 저장한다. (buyerId = 거래하기를 누른 로그인 사용자) */
    @Transactional
    public TransactionResponse createTransaction(TransactionCreateRequest request, Long buyerId) {
        // 같은 상품에 진행 중(PENDING/AGREED)인 거래가 있으면 중복 생성 방지
        boolean inProgressExists = transactionRepository.existsByPostIdAndStatusIn(
                request.getPostId(),
                List.of(TransactionStatus.PENDING, TransactionStatus.AGREED));
        if (inProgressExists) {
            throw new IllegalStateException("이미 진행 중인 거래가 있는 상품입니다. postId=" + request.getPostId());
        }

        // 상품 조회로 판매자(작성자) 확보
        PostInfo postInfo = postQueryClient.getPostInfo(request.getPostId());

        Transaction transaction = Transaction.builder()
                .postId(request.getPostId())
                .sellerId(postInfo.sellerId())
                .buyerId(buyerId)
                .type(request.getType())
                .itemPrice(request.getItemPrice())
                .build();
        transactionRepository.save(transaction);

        // 방식(type)에 따라 하위 1:1 상세 엔티티 생성
        DirectTransaction direct = null;
        DeliveryTransaction delivery = null;
        if (request.getType() == TransactionType.DIRECT) {
            direct = DirectTransaction.builder()
                    .transactionId(transaction.getId())
                    .meetingLocation(request.getMeetingLocation())
                    .meetingTime(request.getMeetingTime())
                    .build();
            directTransactionRepository.save(direct);
        } else {
            delivery = DeliveryTransaction.builder()
                    .transactionId(transaction.getId())
                    .build();
            deliveryTransactionRepository.save(delivery);
        }

        return TransactionResponse.of(transaction, direct, delivery);
    }

    /** 거래 상세 조회: 공통 정보 + 방식별 상세를 합쳐 반환한다. */ 
    //findTransaction은 없으면 예외를 던지는 헬퍼
    public TransactionResponse getTransaction(Long transactionId) {
        Transaction transaction = findTransaction(transactionId);
        return toResponse(transaction);
    }

    /** 내 진행 중 거래 목록 조회(구매자/판매자 모두): 화면 새로고침·재방문 시에도 표시하기 위함 */
    public List<TransactionResponse> getMyTransactions(Long userId) {
        return transactionRepository
                .findMyTransactions(
                        userId,
                        List.of(TransactionStatus.PENDING, TransactionStatus.AGREED))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** 거래 공통 정보에 방식별 상세를 합쳐 응답 DTO로 변환 */
    private TransactionResponse toResponse(Transaction transaction) {
        DirectTransaction direct = null;
        DeliveryTransaction delivery = null;
        if (transaction.getType() == TransactionType.DIRECT) {
            direct = directTransactionRepository.findById(transaction.getId()).orElse(null);
        } else {
            delivery = deliveryTransactionRepository.findById(transaction.getId()).orElse(null);
        }
        return TransactionResponse.of(transaction, direct, delivery);
    }

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

    /** 거래 취소: 거래를 CANCELLED로, 상품을 SELLING(판매중)으로 복구 요청 */
    @Transactional
    public void cancelTransaction(Long transactionId) {
        Transaction transaction = findTransaction(transactionId);
        transaction.cancel();
        postStatusClient.markSelling(transaction.getPostId());
    }

    private Transaction findTransaction(Long transactionId) {
        return transactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다. id=" + transactionId));
    }
}
