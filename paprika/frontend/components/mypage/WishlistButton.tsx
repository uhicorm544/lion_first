'use client';

/**
 * 찜(관심 상품) 추가/해제 버튼
 * 담당: E - 장인호
 *
 * 사용법:
 *   <WishlistButton productId={product.id} />
 *
 * 마운트 시 GET /api/v1/users/me/wishlist/{productId} 로 찜 여부를 조회하고,
 * 클릭 시 POST(추가)/DELETE(해제)를 호출해 상태를 토글한다.
 */
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './WishlistButton.module.css';

interface WishlistButtonProps {
  productId: number;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const [wished, setWished] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get(`/api/v1/users/me/wishlist/${productId}`)
      .then((res) => {
        if (active) setWished(Boolean(res.data.data));
      })
      .catch(() => {
        // 비로그인 등으로 조회 실패 시 미찜 상태로 표시
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (wished) {
        await api.delete(`/api/v1/users/me/wishlist/${productId}`);
        setWished(false);
      } else {
        await api.post(`/api/v1/users/me/wishlist/${productId}`);
        setWished(true);
      }
    } catch {
      alert('찜 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={wished ? styles.active : styles.button}
      onClick={toggle}
      disabled={loading}
    >
      {wished ? '관심 해제' : '관심 등록'}
    </button>
  );
}
