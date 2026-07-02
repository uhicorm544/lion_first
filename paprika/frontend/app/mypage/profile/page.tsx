/**
 * 회원정보 수정 페이지
 * 담당: E - 장인호
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { uploadImage } from '@/lib/image';
import { clearTokens } from '@/lib/auth';
import styles from './page.module.css';
import MannerTemperature from '@/components/mypage/MannerTemperature';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [temperature, setTemperature] = useState(50);
  const [trustGrade, setTrustGrade] = useState('보통');

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then((res) => {
        const data = res.data;
        setNickname(data.nickname ?? '');
        setTempNickname(data.nickname ?? '');
        setEmail(data.email ?? '');
        setProfileImageUrl(data.profileImageUrl ?? null);
        
        api.get(`/api/v1/users/${data.id}/manner`)
        .then((mannerRes) => {
          setTemperature(mannerRes.data.data.temperature);
          setTrustGrade(mannerRes.data.data.trustGrade);
        })
        .catch((err) => console.error('매너온도 로드 실패:', err));
    })
      .catch(() => alert('프로필 불러오기 실패'));
  }, []);

  const handleNicknameCheck = async () => {
    if (!tempNickname.trim()) return;
    try {
      const res = await api.get('/api/v1/users/me/check-nickname', {
        params: { nickname: tempNickname },
      });
      if (res.data.isDuplicate) {
        setNicknameCheckMsg('이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      } else {
        setNicknameCheckMsg('사용 가능한 닉네임입니다.');
        setIsNicknameChecked(true);
      }
    } catch {
      alert('중복 확인 실패');
    }
  };

  const handleNicknameSave = async () => {
    try {
      await api.patch('/api/v1/users/me', { nickname: tempNickname });
      setNickname(tempNickname);
      setIsEditingNickname(false);
      setIsNicknameChecked(false);
      setNicknameCheckMsg('');
    } catch (err: any) {
      alert(err.response?.data?.message ?? '닉네임 변경 실패');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImage(file, 'profiles');
      await api.patch('/api/v1/users/me', { profileImageUrl: imageUrl });
      setProfileImageUrl(imageUrl);
    } catch {
      alert('이미지 업로드 실패');
    }
  };

  const isSaveEnabled = tempNickname === nickname || isNicknameChecked;

  // TODO: A(민동현)님이 회원 탈퇴 API 구현 전까지는 기능 없음(요청만 하고 실패로 끝남).
  // 엔드포인트가 생기면 별도 수정 없이 바로 정상 동작함.
  const handleWithdraw = async () => {
    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await api.delete('/api/v1/users/me');
      clearTokens();
      router.push('/login');
    } catch {
      // API 미구현 - 지금은 아무 동작 안 함
    }
  };

  return (
    <section>
      <h1 className={styles.title}>회원정보 수정</h1>

      <div className={styles.card}>
        <div className={styles.cardInner}>

          {/* 프로필 이미지 */}
          <div className={styles.avatarWrap}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="프로필" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            <input type="file" accept=".jpg,.jpeg,.png" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
            <button onClick={() => fileInputRef.current?.click()} className={styles.avatarEditBtn}>
              수정
            </button>
          </div>

          {/* 닉네임 */}
          <div>
            {isEditingNickname ? (
              <div>
                <div className={styles.nicknameRow}>
                  <input
                    value={tempNickname}
                    onChange={(e) => {
                      setTempNickname(e.target.value);
                      setIsNicknameChecked(false);
                      setNicknameCheckMsg('');
                    }}
                    className={styles.nicknameInput}
                  />
                  <button onClick={handleNicknameCheck} className={styles.checkBtn}>중복확인</button>
                  <button onClick={handleNicknameSave} disabled={!isSaveEnabled} className={styles.saveBtn}>저장</button>
                  <button onClick={() => { setIsEditingNickname(false); setNicknameCheckMsg(''); setIsNicknameChecked(false); }} className={styles.cancelBtn}>취소</button>
                </div>
                {nicknameCheckMsg && (
                  <p className={`${styles.nicknameMsg} ${isNicknameChecked ? styles.nicknameMsgSuccess : styles.nicknameMsgError}`}>
                    {nicknameCheckMsg}
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.nicknameRow}>
                <p className={styles.nicknameName}>{nickname}</p>
                <button onClick={() => { setTempNickname(nickname); setIsEditingNickname(true); }} className={styles.editBtn}>수정</button>
              </div>
            )}
            <p className={styles.email}>이메일: {email}</p>
            <MannerTemperature score={temperature} />
          </div>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <button onClick={handleWithdraw} className={styles.withdrawBtn}>회원 탈퇴하기</button>
      </div>
    </section>
  );
}