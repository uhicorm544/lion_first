/**
 * 상품 상세 페이지
 * 화면 참조: _4 (Paprika - Product Detail)
 * 담당: B - 백성민 (상품 정보), D - 이동준 (거래 버튼), C - 한대천 (채팅하기 버튼)
 *
 * TODO:
 *  - 상품 상세 API 호출 (GET /api/v1/products/:id)
 *  - 이미지 갤러리
 *  - 판매자 정보 및 매너 온도 표시 (E - 장인호)
 *  - '채팅하기' 버튼 → 채팅방 생성/이동 (C - 한대천)
 *  - '거래하기' 버튼 → 직거래/택배 선택 (D - 이동준)
 *  - '관심' 버튼 → 찜 추가/제거 (E - 장인호)
 */
import type { Metadata } from 'next';
import TradeButton from '@/components/transactions/TradeButton';
import type { Product } from '@/types';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Paprika - 상품 상세',
};

const sampleProduct: Product = {
  id: 1,
  sellerId: 10,
  sellerNickname: 'ArtisanLens',
  title: 'Vintage Leica M3 Mechanical Masterpiece',
  description:
    '매우 상태가 좋은 빈티지 Leica M3 카메라입니다. 필름과 함께 사용 가능한 테스트 완료 제품이며, 수집용으로도 적합합니다.',
  price: 2450,
  status: 'SELLING',
  category: 'Electronics',
  location: 'Seoul, KR',
  imageUrls: ['/images/product-placeholder.svg', '/images/product-placeholder.svg', '/images/product-placeholder.svg', '/images/product-placeholder.svg'],
  viewCount: 1200,
  wishCount: 48,
  createdAt: new Date().toISOString(),
};

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className={styles.page}>
      <section className={styles.gallery}>
        <div className={styles.mainImage}>
          <img src={sampleProduct.imageUrls[0]} alt={sampleProduct.title} />
        </div>
        <div className={styles.thumbnails}>
          {sampleProduct.imageUrls.map((url, index) => (
            <button key={index} className={styles.thumbnail} type="button">
              <img src={url} alt={`${sampleProduct.title} ${index + 1}`} />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.detailCard}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.category}>{sampleProduct.category} • 2 hours ago</p>
            <h1 className={styles.title}>{sampleProduct.title}</h1>
          </div>
          <p className={styles.price}>${sampleProduct.price.toLocaleString()}</p>
        </div>

        <div className={styles.stats}>
          <span>{sampleProduct.location}</span>
          <span>{sampleProduct.viewCount} views</span>
          <span>{sampleProduct.wishCount} likes</span>
        </div>

        <div className={styles.descriptionCard}>
          <h2 className={styles.descriptionTitle}>상품 설명</h2>
          <p className={styles.descriptionText}>{sampleProduct.description}</p>
        </div>

        <div className={styles.sellerCard}>
          <h2 className={styles.sellerTitle}>판매자 정보</h2>
          <div className={styles.sellerInfo}>
            <div className={styles.sellerMeta}>
              <div className={styles.avatar}>
                <img src="/images/avatar-placeholder.svg" alt={sampleProduct.sellerNickname} />
              </div>
              <div>
                <p className={styles.sellerName}>{sampleProduct.sellerNickname}</p>
                <p className={styles.sellerSub}>Trusted seller • 1.2k sales</p>
              </div>
            </div>
            <span className={styles.sellerTag}>Manner Temperature 36.5°C</span>
          </div>
        </div>

        <div className={styles.actionsCard}>
          <h2 className={styles.actionsTitle}>거래 옵션</h2>
          <div className={styles.actionRow}>
            <button className={styles.secondaryButton} type="button">
              관심 등록
            </button>
            <button className={styles.secondaryButton} type="button">
              채팅하기
            </button>
            <TradeButton postId={params.id} buttonClassName={styles.primaryButton} />
          </div>
        </div>
      </section>
    </main>
  );
}
