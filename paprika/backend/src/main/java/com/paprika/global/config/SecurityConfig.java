package com.paprika.global.config;

import com.paprika.global.security.JwtAuthenticationFilter;
import com.paprika.global.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    // application-dev.yml: true / application-prod.yml: false
    @Value("${security.dev-mode:true}")
    private boolean devMode;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (devMode) {
            // 개발 모드: 모든 API 허용 (JWT 필터도 동작하지만 인증 없이도 접근 가능)
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        } else {
            // 운영 모드: JWT 인증 적용
            http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/ws/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        }

        // JWT 필터는 dev/prod 모두 적용 (dev에서도 토큰이 있으면 SecurityContext에 유저 정보 세팅)
        http.addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
