package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.MyPageUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyPageUserRepository extends JpaRepository<MyPageUser, Long> {
    boolean existsByNickname(String nickname);
}