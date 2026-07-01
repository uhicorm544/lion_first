package com.paprika.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.paprika.domain.post.entity.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

}
