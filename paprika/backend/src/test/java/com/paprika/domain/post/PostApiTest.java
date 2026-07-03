package com.paprika.domain.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paprika.domain.post.dto.PostCreateRequest;
import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.repository.PostImageRepository;
import com.paprika.domain.post.repository.PostRepository;
import com.paprika.global.security.CustomUserDetails;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class PostApiTest {

        @Autowired
        MockMvc mockMvc;
        @Autowired
        ObjectMapper objectMapper;
        @Autowired
        PostRepository postRepository;
        @Autowired
        PostImageRepository postImageRepository;

        private CustomUserDetails mockUser;
        private CustomUserDetails otherUser;

        @BeforeEach
        void setUp() {
                mockUser = CustomUserDetails.fromJwt(1L, "USER");
                otherUser = CustomUserDetails.fromJwt(2L, "USER");
        }

        // ─── CREATE ──────────────────────────────────────────────────

        @Test
        @DisplayName("POST /api/v1/posts - 정상 등록")
        void createPost_success() throws Exception {
                PostCreateRequest request = PostCreateRequest.builder()
                                .title("테스트 상품")
                                .content("상품 설명입니다.")
                                .price(BigDecimal.valueOf(10000))
                                .build();

                mockMvc.perform(post("/api/v1/posts")
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").isNumber());
        }

        @Test
        @DisplayName("POST /api/v1/posts - 이미지 URL 포함 등록")
        void createPost_withImages() throws Exception {
                PostCreateRequest request = PostCreateRequest.builder()
                                .title("이미지 있는 상품")
                                .content("이미지 포함 상품 설명")
                                .price(BigDecimal.valueOf(5000))
                                .imgUrls(List.of("http://example.com/img1.jpg", "http://example.com/img2.jpg"))
                                .build();

                String response = mockMvc.perform(post("/api/v1/posts")
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString();

                Long postId = objectMapper.readTree(response).get("data").asLong();
                assertThat(postImageRepository.findByPost_IdAndActiveTrue(postId)).hasSize(2);
        }

        @Test
        @DisplayName("POST /api/v1/posts - 필수값(title) 누락 시 400")
        void createPost_missingTitle_returns400() throws Exception {
                PostCreateRequest request = PostCreateRequest.builder()
                                .content("설명")
                                .price(BigDecimal.valueOf(5000))
                                .build();

                mockMvc.perform(post("/api/v1/posts")
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        // ─── READ ────────────────────────────────────────────────────

        @Test
        @DisplayName("GET /api/v1/posts - 전체 조회 (active=true만)")
        void getPosts_returnsActivePosts() throws Exception {
                Post deletedPost = postRepository.save(
                                Post.builder().userId(1L).title("삭제된 상품").content("설명").currentPrice(BigDecimal.valueOf(2000)).build());
                deletedPost.softDeletePost();

                mockMvc.perform(get("/api/v1/posts"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.content").isArray());
        }

        @Test
        @DisplayName("GET /api/v1/posts?category=ELECTRONICS - 카테고리 필터")
        void getPosts_withCategory() throws Exception {
                mockMvc.perform(get("/api/v1/posts")
                                .param("category", "ELECTRONICS"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("GET /api/v1/posts/{id} - 단건 조회 정상")
        void getPost_success() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("단건조회 상품").content("상품 설명").currentPrice(BigDecimal.valueOf(3000)).build());

                mockMvc.perform(get("/api/v1/posts/{id}", post.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.title").value("단건조회 상품"))
                                .andExpect(jsonPath("$.data.currentPrice").value(3000));
        }

        @Test
        @DisplayName("GET /api/v1/posts/{id} - 존재하지 않는 id → 400 (GlobalExceptionHandler)")
        void getPost_notFound_returns400() throws Exception {
                mockMvc.perform(get("/api/v1/posts/{id}", 999999L))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/v1/posts/{id} - soft delete된 상품은 조회 안 됨 → 400")
        void getPost_softDeleted_returns400() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("삭제된 상품").content("설명").currentPrice(BigDecimal.valueOf(1000)).build());
                post.softDeletePost();

                mockMvc.perform(get("/api/v1/posts/{id}", post.getId()))
                                .andExpect(status().isBadRequest());
        }

        // ─── UPDATE ──────────────────────────────────────────────────

        @Test
        @DisplayName("PUT /api/v1/posts/{id} - 정상 수정")
        void updatePost_success() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("원래 제목").content("원래 설명").currentPrice(BigDecimal.valueOf(1000)).build());

                PostCreateRequest request = PostCreateRequest.builder()
                                .title("수정된 제목")
                                .content("수정된 설명")
                                .price(BigDecimal.valueOf(2000))
                                .build();

                mockMvc.perform(put("/api/v1/posts/{id}", post.getId())
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));

                Post updated = postRepository.findByIdAndActiveTrue(post.getId()).orElseThrow();
                assertThat(updated.getTitle()).isEqualTo("수정된 제목");
                assertThat(updated.getCurrentPrice()).isEqualByComparingTo(BigDecimal.valueOf(2000));
        }

        @Test
        @DisplayName("PUT /api/v1/posts/{id} - 작성자가 아니면 수정 불가")
        void updatePost_notOwner_fails() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("원래 제목").content("설명").currentPrice(BigDecimal.valueOf(1000)).build());

                PostCreateRequest request = PostCreateRequest.builder()
                                .title("해킹된 제목")
                                .content("해킹된 내용")
                                .price(BigDecimal.valueOf(1))
                                .build();

                mockMvc.perform(put("/api/v1/posts/{id}", post.getId())
                                .with(user(otherUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("PUT /api/v1/posts/{id} - 이미지 교체 시 기존 soft delete, 새 이미지만 active")
        void updatePost_imageReplace() throws Exception {
                PostCreateRequest createReq = PostCreateRequest.builder()
                                .title("이미지 상품")
                                .content("설명")
                                .price(BigDecimal.valueOf(1000))
                                .imgUrls(List.of("http://old1.jpg", "http://old2.jpg"))
                                .build();

                String createResponse = mockMvc.perform(post("/api/v1/posts")
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createReq)))
                                .andReturn().getResponse().getContentAsString();
                Long postId = objectMapper.readTree(createResponse).get("data").asLong();

                PostCreateRequest updateReq = PostCreateRequest.builder()
                                .title("이미지 상품")
                                .content("설명")
                                .price(BigDecimal.valueOf(1000))
                                .imgUrls(List.of("http://new1.jpg"))
                                .build();

                mockMvc.perform(put("/api/v1/posts/{id}", postId)
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateReq)))
                                .andExpect(status().isOk());

                assertThat(postImageRepository.findByPost_IdAndActiveTrue(postId)).hasSize(1);
        }

        // ─── DELETE ──────────────────────────────────────────────────

        @Test
        @DisplayName("DELETE /api/v1/posts/{id} - 정상 삭제 후 조회 안 됨")
        void deletePost_success() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("삭제할 상품").content("설명").currentPrice(BigDecimal.valueOf(1000)).build());

                mockMvc.perform(delete("/api/v1/posts/{id}", post.getId())
                                .with(user(mockUser)))
                                .andExpect(status().isNoContent());

                assertThat(postRepository.findByIdAndActiveTrue(post.getId())).isEmpty();
        }

        @Test
        @DisplayName("DELETE /api/v1/posts/{id} - 작성자가 아니면 삭제 불가")
        void deletePost_notOwner_fails() throws Exception {
                Post post = postRepository.save(
                                Post.builder().userId(1L).title("삭제할 상품").content("설명").currentPrice(BigDecimal.valueOf(1000)).build());

                mockMvc.perform(delete("/api/v1/posts/{id}", post.getId())
                                .with(user(otherUser)))
                                .andExpect(status().isBadRequest());

                assertThat(postRepository.findByIdAndActiveTrue(post.getId())).isPresent();
        }

        @Test
        @DisplayName("DELETE /api/v1/posts/{id} - 삭제 시 이미지도 soft delete")
        void deletePost_imagesSoftDeleted() throws Exception {
                PostCreateRequest request = PostCreateRequest.builder()
                                .title("이미지 있는 상품")
                                .content("설명")
                                .price(BigDecimal.valueOf(1000))
                                .imgUrls(List.of("http://img1.jpg", "http://img2.jpg"))
                                .build();

                String response = mockMvc.perform(post("/api/v1/posts")
                                .with(user(mockUser))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andReturn().getResponse().getContentAsString();
                Long postId = objectMapper.readTree(response).get("data").asLong();

                mockMvc.perform(delete("/api/v1/posts/{id}", postId)
                                .with(user(mockUser)))
                                .andExpect(status().isNoContent());

                assertThat(postImageRepository.findByPost_IdAndActiveTrue(postId)).isEmpty();
        }
}
