package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.MyPagePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 담당: E - 장인호
 */
public interface MyPagePostRepository extends JpaRepository<MyPagePost, Long> {

    /** 마이페이지 판매중 탭용: 내 상품 중 판매중/예약중 상태만 최신순 조회 */
    List<MyPagePost> findByUserIdAndPostStatusInOrderByCreatedAtDesc(Long userId, List<String> postStatuses);
}
