package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.MyPagePostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MyPagePostImageRepository extends JpaRepository<MyPagePostImage, Long> {
    Optional<MyPagePostImage> findFirstByPostIdAndActiveTrue(Long postId);
}