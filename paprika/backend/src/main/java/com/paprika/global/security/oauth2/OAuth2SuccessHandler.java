package com.paprika.global.security.oauth2;

import com.paprika.domain.auth.entity.RefreshToken;
import com.paprika.domain.auth.entity.User;
import com.paprika.domain.auth.repository.RefreshTokenRepository;
import com.paprika.global.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Value("${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}")
    private String redirectUri;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());

        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshToken)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiry / 1000))
                .build());

        getRedirectStrategy().sendRedirect(request, response,
                redirectUri + "?accessToken=" + accessToken + "&refreshToken=" + refreshToken);
    }
}
