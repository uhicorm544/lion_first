package com.paprika.domain.auth.service;

import com.paprika.domain.auth.dto.AuthResponse;
import com.paprika.domain.auth.dto.LoginRequest;
import com.paprika.domain.auth.dto.SignupRequest;
import com.paprika.domain.auth.entity.RefreshToken;
import com.paprika.domain.auth.entity.User;
import com.paprika.domain.auth.repository.RefreshTokenRepository;
import com.paprika.domain.auth.repository.UserRepository;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import com.paprika.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new PaprikaException(ErrorCode.DUPLICATE_EMAIL);
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(User.Role.USER)
                .provider(User.Provider.LOCAL)
                .build();
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new PaprikaException(ErrorCode.UNAUTHORIZED);
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse reissue(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new PaprikaException(ErrorCode.INVALID_TOKEN));

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new PaprikaException(ErrorCode.EXPIRED_TOKEN);
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        refreshTokenRepository.delete(stored);
        return issueTokens(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(refreshTokenRepository::delete);
        }
    }

    public AuthResponse.UserInfo getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));
        return AuthResponse.UserInfo.from(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String newRefreshToken = jwtProvider.createRefreshToken(user.getId());

        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(RefreshToken.builder()
                .token(newRefreshToken)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiry / 1000))
                .build());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .user(AuthResponse.UserInfo.from(user))
                .build();
    }
}
