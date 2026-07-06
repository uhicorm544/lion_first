'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import PostActionMenu from './PostActionMenu';

interface Props {
  postId: number;
  postAuthorId: number;
}

export default function PostOwnerActions({ postId, postAuthorId }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || user?.id !== postAuthorId) return null;

  async function handleDelete() {
    if (!confirm('삭제하면 복구할 수 없습니다. 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/v1/posts/${postId}`);
      router.push('/products');
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  const items = [
    { label: '수정', onClick: () => router.push(`/products/${postId}/edit`) },
    { label: '삭제', onClick: handleDelete, danger: true },
  ];

  return <PostActionMenu items={items} />;
}
