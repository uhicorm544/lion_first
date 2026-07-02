package com.paprika.domain.auth.service;

import com.paprika.domain.auth.dto.*;
import com.paprika.domain.auth.entity.PasswordResetToken;
import com.paprika.domain.auth.entity.RefreshToken;
import com.paprika.domain.auth.entity.User;
import com.paprika.domain.auth.repository.PasswordResetTokenRepository;
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

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final EmailService emailService;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new PaprikaException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new PaprikaException(ErrorCode.DUPLICATE_NICKNAME);
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

        if (!user.isActive()) {
            throw new PaprikaException(ErrorCode.WITHDRAWN_ACCOUNT);
        }

        if (user.getPassword() == null) {
            throw new PaprikaException(ErrorCode.OAUTH2_ACCOUNT);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new PaprikaException(ErrorCode.INVALID_PASSWORD);
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

    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));
        user.deactivate();
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public void sendPasswordResetCode(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        if (user.getPassword() == null) {
            throw new PaprikaException(ErrorCode.OAUTH2_ACCOUNT);
        }

        passwordResetTokenRepository.deleteByUserId(user.getId());

        String code = String.format("%06d", new SecureRandom().nextInt(1000000));
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .userId(user.getId())
                .token(code)
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .build());

        emailService.sendPasswordResetCode(request.getEmail(), code);
    }

    @Transactional
    public void verifyResetCode(PasswordResetVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new PaprikaException(ErrorCode.INVALID_RESET_CODE));

        if (resetToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new PaprikaException(ErrorCode.EXPIRED_RESET_CODE);
        }

        if (!resetToken.getToken().equals(request.getCode())) {
            throw new PaprikaException(ErrorCode.INVALID_RESET_CODE);
        }
    }

    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new PaprikaException(ErrorCode.USER_NOT_FOUND));

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new PaprikaException(ErrorCode.INVALID_RESET_CODE));

        if (resetToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new PaprikaException(ErrorCode.EXPIRED_RESET_CODE);
        }

        if (!resetToken.getToken().equals(request.getCode())) {
            throw new PaprikaException(ErrorCode.INVALID_RESET_CODE);
        }

        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
        passwordResetTokenRepository.delete(resetToken);
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
