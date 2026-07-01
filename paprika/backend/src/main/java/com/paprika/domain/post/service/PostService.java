package com.paprika.domain.post.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paprika.domain.post.repository.PostRepository;

/**
 * 중고 상품 서비스
 * 담당: B - 백성민
 *
 * TODO:
 * - 상품 등록 (이미지 URL 저장)
 * - 상품 수정 (판매 중 상태 검증)
 * - 상품 삭제 (소프트 딜리트 고려)
 * - 임시 저장 기능 (DRAFT 상태)
 * - 복합 검색 (카테고리 + 키워드 + 작성자)
 * - 자동완성 및 최근 검색어 저장
 * - 조회수 증가 로직 (중복 방지)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository postRepository;
}
