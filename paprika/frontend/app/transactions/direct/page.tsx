'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressAutocomplete from './AddressAutocomplete';
import MapView from './MapView';
import styles from './page.module.css';

export default function DirectTransactionPage() {
  const router = useRouter();
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

  const handleConfirm = () => {
    if (!meetingLocation || !meetingTime) {
      alert('약속 장소와 시간을 입력해 주세요.');
      return;
    }
    alert('직거래 약속이 확정되었습니다.');
    const params = new URLSearchParams({
      location: meetingLocation,
      time: meetingTime,
    });
    router.push(`/transactions/status?${params.toString()}`);
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
