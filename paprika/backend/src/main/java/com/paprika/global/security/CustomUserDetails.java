package com.paprika.global.security;

import com.paprika.domain.auth.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String role;
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
        this.userId = user.getId();
        this.role = user.getRole().name();
    }

    // JWT 클레임으로만 생성 (DB 조회 없음)
    public static CustomUserDetails fromJwt(Long userId, String role) {
        return new CustomUserDetails(userId, role);
    }

    private CustomUserDetails(Long userId, String role) {
        this.userId = userId;
        this.role = role;
        this.user = null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return user != null ? user.getPassword() : null;
    }

    @Override
    public String getUsername() {
        return user != null ? user.getEmail() : String.valueOf(userId);
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return user != null ? user.isActive() : true;
    }
}
