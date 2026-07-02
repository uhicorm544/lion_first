package com.paprika.domain.mypage.service;

import com.paprika.domain.mypage.entity.MyPagePost;
import com.paprika.domain.mypage.entity.MyPagePostImage;
import com.paprika.domain.mypage.repository.MyPagePostImageRepository;
import com.paprika.domain.mypage.repository.MyPagePostRepository;
import com.paprika.domain.mypage.entity.MyPageUser;
import com.paprika.domain.mypage.entity.Review;
import com.paprika.domain.mypage.entity.WishList;
import com.paprika.domain.mypage.repository.MyPageUserRepository;
import com.paprika.domain.mypage.dto.ProfileResponse;
import com.paprika.domain.mypage.dto.ProfileUpdateRequest;
import com.paprika.domain.mypage.dto.TransactionSummaryResponse;
import com.paprika.domain.mypage.dto.WishListResponse;
import com.paprika.domain.mypage.repository.ReviewRepository;
import com.paprika.domain.mypage.repository.WishListRepository;
import com.paprika.domain.transaction.entity.Transaction;
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
import java.util.HashMap;
import java.util.Map;

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

    private final WishListRepository wishListRepository;
    private final ReviewRepository reviewRepository;
    private final MyPageUserRepository myPageUserRepository;
    private final TransactionRepository transactionRepository;
    private final MyPagePostImageRepository myPagePostImageRepository;
    private final MyPagePostRepository myPagePostRepository;

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
     * GET /api/v1/users/me/transactions?tab=all|buy|sell|selling&page=0&size=10
     */
    public Map<String, Object> getMyTransactions(Long userId, String tab, int page, int size) {
        List<TransactionSummaryResponse> all = getMyTransactionsAll(userId, tab);

        int fromIndex = Math.min(page * size, all.size());
        int toIndex = Math.min(fromIndex + size, all.size());
        List<TransactionSummaryResponse> content = all.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", all.size());
        result.put("totalPages", size == 0 ? 0 : (int) Math.ceil((double) all.size() / size));
        result.put("number", page);
        result.put("size", size);
        return result;
    }
    private List<TransactionSummaryResponse> getMyTransactionsAll(Long userId, String tab) {
        return switch (tab) {
            case "buy" -> transactionRepository
                    .findByBuyerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .map(t -> {
                        String imgUrl = myPagePostImageRepository
                                .findFirstByPostIdAndActiveTrue(t.getPostId())
                                .map(MyPagePostImage::getImgUrl)
                                .orElse("https://picsum.photos/seed/post" + t.getPostId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                        Long reviewId = findMyReviewId(t, userId);
                        return TransactionSummaryResponse.from(t, "BUYER", imgUrl, reviewId);
                    })
                    .collect(Collectors.toList());

            case "sell" -> transactionRepository
                    .findBySellerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .filter(t -> t.getStatus() == TransactionStatus.COMPLETED || t.getStatus() == TransactionStatus.CANCELLED)
                    .map(t -> {
                        String imgUrl = myPagePostImageRepository
                                .findFirstByPostIdAndActiveTrue(t.getPostId())
                                .map(MyPagePostImage::getImgUrl)
                                .orElse("https://picsum.photos/seed/post" + t.getPostId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                        return TransactionSummaryResponse.from(t, "SELLER", imgUrl, null);
                    })
                    .collect(Collectors.toList());

            case "selling" -> transactionRepository
                    .findBySellerIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .filter(t -> t.getStatus() == TransactionStatus.PENDING
                              || t.getStatus() == TransactionStatus.AGREED)
                    .map(t -> {
                        String imgUrl = myPagePostImageRepository
                                .findFirstByPostIdAndActiveTrue(t.getPostId())
                                .map(MyPagePostImage::getImgUrl)
                                .orElse("https://picsum.photos/seed/post" + t.getPostId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                        return TransactionSummaryResponse.from(t, "SELLER", imgUrl, null);
                    })
                    .collect(Collectors.toList());

            default -> {
                List<TransactionSummaryResponse> all = new ArrayList<>();
                transactionRepository.findByBuyerIdOrderByCreatedAtDesc(userId)
                        .forEach(t -> {
                            String imgUrl = myPagePostImageRepository
                                    .findFirstByPostIdAndActiveTrue(t.getPostId())
                                    .map(MyPagePostImage::getImgUrl)
                                    .orElse("https://picsum.photos/seed/post" + t.getPostId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                            Long reviewId = findMyReviewId(t, userId);
                            all.add(TransactionSummaryResponse.from(t, "BUYER", imgUrl, reviewId));
                        });
                transactionRepository.findBySellerIdOrderByCreatedAtDesc(userId)
                        .forEach(t -> {
                            String imgUrl = myPagePostImageRepository
                                    .findFirstByPostIdAndActiveTrue(t.getPostId())
                                    .map(MyPagePostImage::getImgUrl)
                                    .orElse("https://picsum.photos/seed/post" + t.getPostId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                            all.add(TransactionSummaryResponse.from(t, "SELLER", imgUrl, null));
                        });
                all.sort(Comparator.comparing(TransactionSummaryResponse::getCreatedAt).reversed());
                yield all;
            }
        };

    }
    /** 구매완료 건에 한해, 내가 이미 쓴 리뷰가 있으면 그 id를 반환 (없으면 null) */
    private Long findMyReviewId(Transaction t, Long userId) {
        if (t.getStatus() != TransactionStatus.COMPLETED) {
            return null;
        }
        return reviewRepository.findByTransactionIdAndReviewerId(t.getId(), userId)
                .map(Review::getId)
                .orElse(null);
    }

    public Map<String, Object> getMyWishList(Long userId, int page, int size) {
        List<WishListResponse> all = wishListRepository.findByUserId(userId)
                .stream()
                .map(w -> {
                    String imgUrl = myPagePostImageRepository
                            .findFirstByPostIdAndActiveTrue(w.getProductId())
                            .map(MyPagePostImage::getImgUrl)
                            .orElse("https://picsum.photos/seed/product" + w.getProductId() + "/320/320");//상품사진이 없을떄 기본이미지 나중에변경
                    String title = myPagePostRepository.findById(w.getProductId())
                            .map(MyPagePost::getTitle)
                            .orElse("삭제된 상품");
                    return WishListResponse.from(w, title, imgUrl);
                })
                .collect(Collectors.toList());
        int fromIndex = Math.min(page * size, all.size());
        int toIndex = Math.min(fromIndex + size, all.size());
        List<WishListResponse> content = all.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", all.size());
        result.put("totalPages", size == 0 ? 0 : (int) Math.ceil((double) all.size() / size));
        result.put("number", page);
        result.put("size", size);
        return result;
    }

    @Transactional
    public void addWishList(Long userId, Long productId) {
        if (wishListRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new PaprikaException(ErrorCode.INVALID_INPUT);
        }
        wishListRepository.save(WishList.of(userId, productId));
    }

    @Transactional
    public void removeWishList(Long userId, Long productId) {
        WishList wishList = wishListRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.INVALID_INPUT));
        wishListRepository.delete(wishList);
    }

    /**
     * 특정 상품 찜 여부 확인 (WishlistButton 초기 상태용)
     * GET /api/v1/users/me/wishlist/{productId}
     */
    public boolean isWished(Long userId, Long productId) {
        return wishListRepository.existsByUserIdAndProductId(userId, productId);
    }
}