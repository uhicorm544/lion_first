package com.paprika.domain.transaction.client;

import org.springframework.stereotype.Component;

/**
 * PostStatusClient 임시 구현 (받는 부분 - 비워둠)
 *
 * 
 *    - REST API 호출  또는  PostService 직접 호출 중 택1로 구현
 *    - 구현 완료 후 이 스텁은 교체/삭제 가능
 *
 * 현재는 앱이 정상 기동되도록 아무 동작도 하지 않는 빈 구현이다.
 */
@Component
public class PostStatusClientStub implements PostStatusClient {

    @Override
    public void markReserved(Long postId) {
     
    }

    @Override
    public void markCompleted(Long postId) {
     
    }

    @Override
    public void markSelling(Long postId) {

    }
}
