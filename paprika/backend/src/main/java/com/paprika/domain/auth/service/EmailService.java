package com.paprika.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[파프리카] 비밀번호 재설정 인증코드");
        message.setText(
            "비밀번호 재설정 인증코드입니다.\n\n" +
            "인증코드: " + code + "\n\n" +
            "이 코드는 5분간 유효합니다.\n" +
            "본인이 요청하지 않았다면 이 메일을 무시해주세요."
        );
        mailSender.send(message);
    }
}
