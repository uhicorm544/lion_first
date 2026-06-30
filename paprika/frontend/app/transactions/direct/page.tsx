'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import AddressAutocomplete from './AddressAutocomplete';
import MapView from './MapView';
import styles from './page.module.css';

function DirectTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const price = searchParams.get('price');

  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [placeId, setPlaceId] = useState('');

  // 숫자만 입력하면 YYYY-MM-DD HH:MM 형식으로 구분자(-, :, 공백)를 자동 삽입
  const formatMeetingTime = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 12);
    let result = digits.slice(0, 4);
    if (digits.length > 4) result += '-' + digits.slice(4, 6);
    if (digits.length > 6) result += '-' + digits.slice(6, 8);
    if (digits.length > 8) result += ' ' + digits.slice(8, 10);
    if (digits.length > 10) result += ':' + digits.slice(10, 12);
    return result;
  };

  // "YYYY-MM-DD HH:MM" 문자열이 실제 달력상 존재하는 날짜·시간인지 검증한다.
  const isValidMeetingTime = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
    if (!match) {
      return false;
    }
    const [, y, mo, d, h, mi] = match;
    const year = Number(y);
    const month = Number(mo);
    const day = Number(d);
    const hour = Number(h);
    const minute = Number(mi);
    const date = new Date(year, month - 1, day, hour, minute);
    // Date가 잘못된 값(13월, 32시 등)을 자동 보정하므로 원래 값과 일치하는지 확인
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hour &&
      date.getMinutes() === minute
    );
  };

  const handleConfirm = async () => {
    // 날짜·시간은 "YYYY-MM-DD HH:MM"(16자)까지 모두 입력해야 저장된다.
    if (!meetingLocation || meetingTime.length !== 16) {
      alert('약속 장소와 날짜·시간(YYYY-MM-DD HH:MM)을 끝까지 입력해 주세요.');
      return;
    }
    // 13월·32시처럼 존재하지 않는 날짜·시간이면 막는다.
    if (!isValidMeetingTime(meetingTime)) {
      alert('올바른 날짜·시간을 입력해 주세요. (예: 2026-07-05 14:00)');
      return;
    }
    if (!postId || !price) {
      alert('상품 정보가 없어 거래를 생성할 수 없습니다. 상품 페이지에서 다시 시도해 주세요.');
      return;
    }

    // 약속 확정 시: 거래 생성(PENDING) → 확정(AGREED)으로 상품을 예약중으로 변경 요청
    let transactionId: number;
    try {
      const createRes = await api.post<ApiResponse<{ id: number }>>('/api/v1/transactions', {
        postId: Number(postId),
        type: 'DIRECT',
        itemPrice: Number(price),
        meetingLocation,
        // 위에서 16자 검증을 통과했으므로 항상 ISO(LocalDateTime) 형식으로 전송
        meetingTime: meetingTime.replace(' ', 'T'),
      });
      transactionId = createRes.data.data.id;
      await api.patch(`/api/v1/transactions/${transactionId}/status`, { status: 'AGREED' });
    } catch (error) {
      // 거래 생성/확정 실패 시: 사용자에게 사유를 알리고 상태 페이지로 넘어가지 않음
      const message =
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        '거래 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(message);
      return;
    }

    alert('직거래 약속이 확정되었습니다.');
    router.push('/');
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>직거래 약속</h1>
        <p className={styles.subtitle}>판매자와 만날 장소와 시간을 정해 주세요.</p>

        {/* 자동완성 장소 고르면 해당위치로 이동*/}
        <MapView placeId={placeId} onPick={setMeetingLocation} />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="location">
            약속 장소
          </label>
          <AddressAutocomplete
            id="location"
            inputClassName={styles.input}
            placeholder="예: 강남역 2번 출구"
            value={meetingLocation}
            onChange={setMeetingLocation}
            onSelect={(suggestion) => setPlaceId(suggestion.placeId)}
          />

          <label className={styles.label} htmlFor="time">
            약속 날짜·시간
          </label>
          <input
            id="time"
            className={styles.input}
            type="text"
            inputMode="numeric"
            maxLength={16}
            placeholder="예: 2026-06-28 14:00"
            value={meetingTime}
            onChange={(event) => setMeetingTime(formatMeetingTime(event.target.value))}
          />
        </div>

        <button type="button" className={styles.confirmButton} onClick={handleConfirm}>
          약속 확정
        </button>
      </div>
    </main>
  );
}

export default function DirectTransactionPage() {
  return (
    <Suspense fallback={null}>
      <DirectTransactionContent />
    </Suspense>
  );
}
