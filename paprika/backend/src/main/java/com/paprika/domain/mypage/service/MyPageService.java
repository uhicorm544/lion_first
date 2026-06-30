package com.paprika.domain.mypage.service;

import com.paprika.domain.mypage.entity.MyPageUser;
import com.paprika.domain.mypage.repository.MyPageUserRepository;
import com.paprika.domain.mypage.dto.ProfileResponse;
import com.paprika.domain.mypage.dto.ProfileUpdateRequest;
import com.paprika.domain.mypage.dto.TransactionSummaryResponse;
import com.paprika.domain.mypage.repository.ReviewRepository;
import com.paprika.domain.mypage.repository.WishListRepository;
import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import com.paprika.domain.transaction.repository.TransactionRepository;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 마이페이지 서비스
 * 담당: E - 장인호
 *
 * TODO:
 *  - 나의 거래 내역 조회 (판매중/예약중/완료 필터)
 *  - 관심 상품(찜) 추가/제거/목록 조회
 *  - 거래 후기 작성 (거래 완료 상태 검증 필요 - D - 이동준과 연동)
 *  - 매너 온도(신뢰 점수) 업데이트 로직
 *  - 공지사항 CRUD (Admin)
 *  - 카테고리 관리 (Admin)
 *  - 신고 접수 처리 및 유저 제어 (Admin)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPageService {

    private final ReviewRepository reviewRepository;
    private final WishListRepository wishListRepository;
    private final MyPageUserRepository myPageUserRepository;
    private final TransactionRepository transactionRepository;

    /**
     * 내 프로필 조회
     * GET /api/v1/users/me
     */
    public ProfileResponse getMyProfile(Long userId) {
        MyPageUser user = myPageUserRepository.findById(userId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));
        return ProfileResponse.from(user);
    }

    /**
     * 내 프로필 수정 (닉네임, 프로필 이미지)
     * PATCH /api/v1/users/me
     */
    @Transactional
    public ProfileResponse updateMyProfile(Long userId, ProfileUpdateRequest request) {
        MyPageUser user = myPageUserRepository.findById(userId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        if (request.getNickname() != null) {
            if (myPageUserRepository.existsByNickname(request.getNickname())
                    && !request.getNickname().equals(user.getNickname())) {
                throw new PaprikaException(ErrorCode.INVALID_INPUT);
            }
            user.updateNickname(request.getNickname());
        }
        if (request.getProfileImageUrl() != null) {
            user.updateProfileImage(request.getProfileImageUrl());
        }
        return ProfileResponse.from(user);
    }

    /**
     * 닉네임 중복 확인
     * GET /api/v1/users/me/check-nickname
     */
    public boolean isNicknameDuplicate(String nickname, Long currentUserId) {
        MyPageUser currentUser = myPageUserRepository.findById(currentUserId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));
        if (nickname.equals(currentUser.getNickname())) return false;
        return myPageUserRepository.existsByNickname(nickname);
    }

    /**
     * 나의 거래 내역 조회 (탭별)
     * GET /api/v1/users/me/transactions?tab=all|buy|sell|selling
     *
     * - buy: 내가 구매자인 거래 전체
     * - sell: 내가 판매자인 거래 전체
     * - selling: 내가 판매자이며 진행중(PENDING/AGREED)인 거래
     * - all: 구매 + 판매 합산, 최신순 정렬
     *
     * TODO: 거래 취소 후 상품 상태 복구 - D(이동준), B(백성민)과 협의 필요
     */
    public List<TransactionSummaryResponse> getMyTransactions(Long userId, String tab) {
        return switch (tab) {
            case "buy" -> transactionRepository
                    .findByBuyerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .map(t -> TransactionSummaryResponse.from(t, "BUYER"))
                    .collect(Collectors.toList());

            case "sell" -> transactionRepository
                    .findBySellerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .map(t -> TransactionSummaryResponse.from(t, "SELLER"))
                    .collect(Collectors.toList());

            case "selling" -> transactionRepository
                    .findBySellerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .filter(t -> t.getStatus() == TransactionStatus.PENDING
                              || t.getStatus() == TransactionStatus.AGREED)
                    .map(t -> TransactionSummaryResponse.from(t, "SELLER"))
                    .collect(Collectors.toList());

            default -> {
                List<TransactionSummaryResponse> all = new ArrayList<>();
                transactionRepository.findByBuyerIdOrderByCreatedAtDesc(userId)
                        .forEach(t -> all.add(TransactionSummaryResponse.from(t, "BUYER")));
                transactionRepository.findBySellerIdOrderByCreatedAtDesc(userId)
                        .forEach(t -> all.add(TransactionSummaryResponse.from(t, "SELLER")));
                all.sort(Comparator.comparing(TransactionSummaryResponse::getCreatedAt).reversed());
                yield all;
            }
        };
    }
}