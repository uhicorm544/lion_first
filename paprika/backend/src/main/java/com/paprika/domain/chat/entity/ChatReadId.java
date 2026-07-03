package com.paprika.domain.chat.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * ChatRead 복합키 (room_id, user_id)
 * 담당: C - 한대천
 */
public class ChatReadId implements Serializable {

    private Long roomId;
    private Long userId;

    public ChatReadId() {
    }

    public ChatReadId(Long roomId, Long userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatReadId that)) return false;
        return Objects.equals(roomId, that.roomId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomId, userId);
    }
}
