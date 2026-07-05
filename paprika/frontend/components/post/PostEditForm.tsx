'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { PostApiResponse } from '@/types';
import { invalidatePost } from '@/app/products/[id]/edit/actions';

const CATEGORIES = [
  { value: 'ELECTRONICS', label: '전자기기' },
  { value: 'FASHION', label: '패션/의류' },
  { value: 'HOME', label: '생활/가구' },
  { value: 'KIDS', label: '유아동' },
  { value: 'BOOKS', label: '도서' },
  { value: 'SPORTS', label: '스포츠/레저' },
  { value: 'HOBBIES', label: '취미/게임' },
  { value: 'OTHERS', label: '기타' },
];

const MAX_FILE_COUNT = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function PostEditForm({ post }: { post: PostApiResponse }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post.title);
  const [category, setCategory] = useState(post.category ?? '');
  const [price, setPrice] = useState(String(post.currentPrice));
  const [content, setContent] = useState(post.content);

  // 기존 이미지 URL + 새로 추가할 파일 분리 관리
  const [existingImgUrls, setExistingImgUrls] = useState<string[]>(post.imgUrls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalCount = existingImgUrls.length + newFiles.length;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const overSize = selected.filter((f) => f.size > MAX_FILE_SIZE);
    if (overSize.length > 0) alert(`5MB 초과 파일 ${overSize.length}개는 제외됩니다.`);
    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE);
    const merged = [...newFiles, ...valid].slice(0, MAX_FILE_COUNT - existingImgUrls.length);
    if (newFiles.length + valid.length > MAX_FILE_COUNT - existingImgUrls.length) {
      alert(`최대 ${MAX_FILE_COUNT}장까지만 등록됩니다.`);
    }
    setNewFiles(merged);
    setNewPreviews(merged.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  }

  function removeExisting(index: number) {
    setExistingImgUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNew(index: number) {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);
    setNewPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit() {
    setIsLoading(true);
    try {
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f) => formData.append('files', f));
        const uploadRes = await api.post('/api/v1/images/upload/batch', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls = uploadRes.data.data;
      }

      const res = await api.put(`/api/v1/posts/${post.id}`, {
        title,
        content,
        price: Number(price),
        category: category || null,
        imgUrls: [...existingImgUrls, ...uploadedUrls],
        latitude: post.latitude,
        longitude: post.longitude,
      });

      if (res.data.success) {
        await invalidatePost(post.id);
        router.push(`/products/${post.id}`);
      }
    } catch {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    padding: 14,
    borderRadius: 16,
    border: '1px solid var(--color-outline-variant)',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <section
        style={{
          background: 'var(--color-surface-container-lowest)',
          borderRadius: 24,
          padding: 24,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h1>상품 수정</h1>
        <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
          수정할 내용을 입력하세요.
        </p>

        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>상품 제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label>가격</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label>상품 설명</label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label>사진 ({totalCount}/{MAX_FILE_COUNT})</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={totalCount >= MAX_FILE_COUNT}
              style={{
                padding: '14px 24px',
                borderRadius: 16,
                background: 'rgba(255, 111, 60, 0.12)',
                border: '1px solid rgba(255, 111, 60, 0.3)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: totalCount >= MAX_FILE_COUNT ? 'not-allowed' : 'pointer',
              }}
            >
              사진 추가 ({totalCount}/{MAX_FILE_COUNT})
            </button>

            {(existingImgUrls.length > 0 || newPreviews.length > 0) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {existingImgUrls.map((src, i) => (
                  <div key={`existing-${i}`} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`기존 이미지 ${i + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-outline-variant)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0 }}
                    >×</button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`새 이미지 ${i + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--color-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 16,
                background: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
                color: 'var(--color-on-surface)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 2,
                padding: '16px 20px',
                borderRadius: 16,
                background: isLoading ? 'var(--color-outline-variant)' : 'var(--color-primary)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
