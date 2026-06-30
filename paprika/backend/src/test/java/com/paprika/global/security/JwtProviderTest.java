package com.paprika.global.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtProviderTest {

    private final JwtProvider jwtProvider = new JwtProvider(
            "test-secret-key-for-jwt-provider-123456",
            3_600_000L,
            7_200_000L
    );

    @Test
    void createAccessToken_shouldIncludeUserIdAndRole() {
        String token = jwtProvider.createAccessToken(42L, "USER");

        Claims claims = jwtProvider.parseClaims(token);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
        assertThat(jwtProvider.getUserId(token)).isEqualTo(42L);
        assertThat(jwtProvider.isValid(token)).isTrue();
    }

    @Test
    void createRefreshToken_shouldBeValidAndContainUserId() {
        String token = jwtProvider.createRefreshToken(7L);

        Claims claims = jwtProvider.parseClaims(token);

        assertThat(claims.getSubject()).isEqualTo("7");
        assertThat(jwtProvider.getUserId(token)).isEqualTo(7L);
        assertThat(jwtProvider.isValid(token)).isTrue();
    }

    @Test
    void isValid_shouldReturnFalseForMalformedToken() {
        assertThat(jwtProvider.isValid("not-a-real-jwt")).isFalse();
    }

    @Test
    void parseClaims_shouldThrowForExpiredToken() {
        JwtProvider expiredProvider = new JwtProvider(
                "test-secret-key-for-jwt-provider-123456",
                1L,
                1L
        );

        String token = expiredProvider.createAccessToken(99L, "USER");

        assertThatThrownBy(() -> expiredProvider.parseClaims(token))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }
}
