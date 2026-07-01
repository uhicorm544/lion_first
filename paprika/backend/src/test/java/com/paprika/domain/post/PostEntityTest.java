package com.paprika.domain.post;

import java.math.BigDecimal;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.PostImage;
import com.paprika.domain.post.entity.PostPriceHistory;
import com.paprika.domain.post.repository.PostImageRepository;
import com.paprika.domain.post.repository.PostPriceHistoryRepository;
import com.paprika.domain.post.repository.PostRepository;
import com.paprika.global.config.JpaConfig;

@Transactional
@ActiveProfiles("local")
@DataJpaTest
@Import(JpaConfig.class)
public class PostEntityTest {

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private PostImageRepository postImageRepository;
    @Autowired
    private PostPriceHistoryRepository postPriceHistoryRepository;

    @Test
    @DisplayName("게시글, 이미지, 가격 히스토리 로그 정상 저장, 연계 매핑 테스트")
    void saveAndVerifyPostWithDependencies() {
        // given - 부모 엔티티(Post) 생성
        Post post = Post.builder()
                .title("Test Post")
                .userId(123L)
                .content("This is a test post.")
                .currentPrice(BigDecimal.valueOf(1000))
                .build();

        Post savedPost = postRepository.save(post);

        var postImage = PostImage.builder()
                .post(savedPost)
                .imgUrl("http:/cloudinary.test.com")
                .build();

        PostPriceHistory postPriceHistory = PostPriceHistory.builder()
                .post(savedPost)
                .price(BigDecimal.valueOf(1000))
                .build();

        // when - 자식 엔티티(PostImage, PostPriceHistory) 저장
        postImageRepository.save(postImage);
        postPriceHistoryRepository.save(postPriceHistory);

        // 1. 각 테이블 ID 발급 확인
        assertThat(savedPost.getId()).isNotNull();
        assertThat(postImage.getId()).isNotNull();
        assertThat(postPriceHistory.getId()).isNotNull();

        // 2. EntityListener에 의해 createdAt, updatedAt 자동 생성 확인
        assertThat(savedPost.getCreatedAt()).isNotNull();
        assertThat(savedPost.getUpdatedAt()).isNotNull();
        assertThat(postPriceHistory.getCreatedAt()).isNotNull();
        assertThat(postPriceHistory.getUpdatedAt()).isNotNull();

        // 3. 단방향 연관관계 매핑 확인
        assertThat(postImage.getPost()).isEqualTo(savedPost);
        assertThat(postPriceHistory.getPost()).isEqualTo(savedPost);

        // 4. 가격 히스토리 로그 저장 확인
        assertThat(postPriceHistory.getPrice()).isEqualTo(savedPost.getCurrentPrice());
        assertThat(postPriceHistory.getPost().getCurrentPrice()).isEqualByComparingTo(BigDecimal.valueOf(1000));
    }
}
