package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.MyPagePost;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 담당: E - 장인호
 */
public interface MyPagePostRepository extends JpaRepository<MyPagePost, Long> {
}
