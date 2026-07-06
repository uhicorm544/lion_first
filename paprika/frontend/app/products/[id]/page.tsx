/**
 * 상품 상세 페이지
 * 화면 참조: _4 (Paprika - Product Detail)
 * 담당: B - 백성민 (상품 정보), D - 이동준 (거래 버튼), C - 한대천 (채팅하기 버튼)
 *
 * TODO:
 *  - [x] 이미지 갤러리 (PostImage 연동 후) - 성민 07/03
 *  - [x] 판매자 정보 및 매너 온도 표시 (E - 장인호) - 인호 07/06
 *  - '거래하기' 버튼 → 직거래/택배 선택 (D - 이동준)
 *  - [x] '관심' 버튼 → 찜 추가/제거 (E - 장인호)
 */
import type { Metadata } from "next";
import ChatButton from "@/components/chat/ChatButton";
import SellerInfoCard from "@/components/mypage/SellerInfoCard";
import WishlistButton from "@/components/mypage/WishlistButton";
import PostOwnerActions from "@/components/post/PostOwnerActions";
import ImageGallery from "@/components/product/ImageGallery";
import TradeButton from "@/components/transactions/TradeButton";
import type { ApiResponse, PostApiResponse } from "@/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Paprika - 상품 상세",
};

export default async function ProductDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/posts/${params.id}`,
		{ cache: "no-store" },
	);
	const json: ApiResponse<PostApiResponse> = await res.json();
	const product = json.data;

	return (
		<main className={styles.page}>
			<section className={styles.gallery}>
				<ImageGallery images={product.imgUrls ?? []} alt={product.title} />
			</section>

			<section className={styles.detailCard}>
				<div className={styles.headerRow}>
					<div>
						<p className={styles.category}>
							{product.category} •{" "}
							{new Date(product.createdAt).toLocaleDateString()}
						</p>
						<h1 className={styles.title}>{product.title}</h1>
					</div>
					<div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
						<p className={styles.price}>
							₩{product.currentPrice.toLocaleString()}
						</p>
						<PostOwnerActions
							postId={product.id}
							postAuthorId={product.userId}
						/>
					</div>
				</div>

				<div className={styles.stats}>
					<span>{product.viewCount} views</span>
				</div>

				<div className={styles.descriptionCard}>
					<h2 className={styles.descriptionTitle}>상품 설명</h2>
					<p className={styles.descriptionText}>{product.content}</p>
				</div>

				<div className={styles.sellerCard}>
					<h2 className={styles.sellerTitle}>판매자 정보</h2>
					<div className={styles.sellerInfo}>
						<SellerInfoCard
							userId={product.userId}
							metaClassName={styles.sellerMeta}
						/>
					</div>
				</div>

				<div className={styles.actionsCard}>
					<h2 className={styles.actionsTitle}>거래 옵션</h2>
					<div className={styles.actionRow}>
						<WishlistButton productId={product.id} />
						<ChatButton postId={product.id} />
						{product.postStatus === "SELLING" && (
							<TradeButton postId={product.id} />
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
