package com.paprika.domain.transaction.client;

import com.paprika.domain.post.service.IPostStatusUpdater;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * PostStatusClient 실제 구현 (post 도메인 IPostStatusUpdater 위임)
 * 담당: D - 이동준
 *
 * 거래 이벤트에 맞춰 post 담당 팀의 상태 변경 인터페이스를 호출한다.
 *  - AGREED    -> reservePost (RESERVED)
 *  - COMPLETED -> soldPost (SOLD)
 *  - CANCELLED -> sellingPostAsCanceled (SELLING 복구)
 */
@Primary
@Component
public class PostStatusClientJpa implements PostStatusClient {

    private final IPostStatusUpdater postStatusUpdater;

    public PostStatusClientJpa(IPostStatusUpdater postStatusUpdater) {
        this.postStatusUpdater = postStatusUpdater;
    }

    @Override
    public void markReserved(Long postId) {
        postStatusUpdater.reservePost(postId);
    }

    @Override
    public void markSold(Long postId) {
        postStatusUpdater.soldPost(postId);
    }

    @Override
    public void markSelling(Long postId) {
        postStatusUpdater.sellingPostAsCanceled(postId);
    }
}
