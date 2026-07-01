/**
 * 회원정보 수정 페이지
 * 담당: E - 장인호
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { uploadImage } from '@/lib/image';

export default function ProfilePage() {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then((res) => {
        const data = res.data;
        setNickname(data.nickname ?? '');
        setTempNickname(data.nickname ?? '');
        setEmail(data.email ?? '');
        setProfileImageUrl(data.profileImageUrl ?? null);
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

  return (
    <section>
      <h1 style={{ marginBottom: 24 }}>회원정보 수정</h1>

      <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>

          {/* 프로필 이미지 */}
          <div style={{ position: 'relative', width: 88, height: 88 }}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="프로필" style={{ width: 88, height: 88, borderRadius: 24, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: 24, background: 'var(--color-surface)' }} />
            )}
            <input type="file" accept=".jpg,.jpeg,.png" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: -10, right: 0, background: 'var(--color-secondary)', color: '#fff', border: 'none', borderRadius: 8, padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}
            >
              수정
            </button>
          </div>

          {/* 닉네임 */}
          <div>
            {isEditingNickname ? (
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={tempNickname}
                    onChange={(e) => {
                      setTempNickname(e.target.value);
                      setIsNicknameChecked(false);
                      setNicknameCheckMsg('');
                    }}
                    style={{ fontSize: 18, fontWeight: 700, border: '1px solid #ccc', borderRadius: 8, padding: '2px 8px' }}
                  />
                  <button onClick={handleNicknameCheck} style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 8, border: 'none', background: '#555', color: '#fff', fontSize: 13 }}>중복확인</button>
                  <button
                    onClick={handleNicknameSave}
                    disabled={!isSaveEnabled}
                    style={{ cursor: isSaveEnabled ? 'pointer' : 'not-allowed', padding: '2px 8px', borderRadius: 8, border: 'none', background: 'var(--color-secondary)', color: '#fff', fontSize: 13, opacity: isSaveEnabled ? 1 : 0.4 }}
                  >
                    저장
                  </button>
                  <button onClick={() => { setIsEditingNickname(false); setNicknameCheckMsg(''); setIsNicknameChecked(false); }} style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 8, border: '1px solid #ccc', fontSize: 13, background: 'transparent' }}>취소</button>
                </div>
                {nicknameCheckMsg && (
                  <p style={{ fontSize: 12, marginTop: 4, color: isNicknameChecked ? 'green' : 'red' }}>
                    {nicknameCheckMsg}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 700 }}>{nickname}</p>
                <button onClick={() => { setTempNickname(nickname); setIsEditingNickname(true); }} style={{ cursor: 'pointer', padding: '2px 8px', borderRadius: 8, border: '1px solid #ccc', fontSize: 13, background: 'transparent' }}>수정</button>
              </div>
            )}
            <p style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>이메일: {email}</p>
            <p style={{ color: 'var(--color-secondary)', marginTop: 8 }}>매너 온도 36.5°C</p>
          </div>
        </div>
      </div>
    </section>
  );
}