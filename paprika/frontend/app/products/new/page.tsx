/**
 * 상품 등록 페이지
 * 화면 참조: _3 (Sell on Paprika | Product Registration)
 * 담당: B - 백성민
 *
 * TODO:
 *  - 이미지 업로드 (최대 10장)
 *  - 지도 API로 거래 위치 설정 (Kakao/Google Maps)
 *  - 임시 저장 기능
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

const CATEGORIES = [
	{ value: "ELECTRONICS", label: "전자기기" },
	{ value: "FASHION", label: "패션/의류" },
	{ value: "HOME", label: "생활/가구" },
	{ value: "KIDS", label: "유아동" },
	{ value: "BOOKS", label: "도서" },
	{ value: "SPORTS", label: "스포츠/레저" },
	{ value: "HOBBIES", label: "취미/게임" },
	{ value: "OTHERS", label: "기타" },
];

export default function NewProductPage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [price, setPrice] = useState("");
	const [content, setContent] = useState("");

	async function handleSubmit() {
		const res = await api.post("/api/v1/posts", {
			title,
			content,
			price: Number(price),
			category: category || null,
		});
		if (res.data.success) {
			router.push(`/products/${res.data.data}`);
		}
	}

	return (
		<main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
			<section
				style={{
					background: "var(--color-surface-container-lowest)",
					borderRadius: 24,
					padding: 24,
					boxShadow: "var(--shadow-card)",
				}}
			>
				<h1>상품 등록</h1>
				<p
					style={{ color: "var(--color-on-surface-variant)", marginBottom: 24 }}
				>
					상품 정보를 입력하고 이미지를 업로드하면 등록 준비가 완료됩니다.
				</p>

				<div style={{ display: "grid", gap: 20 }}>
					<div style={{ display: "grid", gap: 8 }}>
						<label>상품 제목</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							style={{
								padding: 14,
								borderRadius: 16,
								border: "1px solid var(--color-outline-variant)",
							}}
							placeholder="예: 빈티지 캐논 AE-1"
						/>
					</div>
					<div style={{ display: "grid", gap: 8 }}>
						<label>카테고리</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							style={{
								padding: 14,
								borderRadius: 16,
								border: "1px solid var(--color-outline-variant)",
							}}
						>
							<option value="">카테고리 선택</option>
							{CATEGORIES.map((c) => (
								<option key={c.value} value={c.value}>
									{c.label}
								</option>
							))}
						</select>
					</div>
					<div style={{ display: "grid", gap: 8 }}>
						<label>가격</label>
						<input
							type="number"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							style={{
								padding: 14,
								borderRadius: 16,
								border: "1px solid var(--color-outline-variant)",
							}}
							placeholder="₩0"
						/>
					</div>
					<div style={{ display: "grid", gap: 8 }}>
						<label>상품 설명</label>
						<textarea
							rows={6}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							style={{
								padding: 14,
								borderRadius: 16,
								border: "1px solid var(--color-outline-variant)",
								resize: "vertical",
							}}
							placeholder="상품 상태, 특징, 거래 지역 등을 입력해 주세요."
						/>
					</div>
					<div style={{ display: "grid", gap: 8 }}>
						<label>사진 업로드</label>
						<div
							style={{
								minHeight: 140,
								borderRadius: 20,
								border: "1px dashed var(--color-outline-variant)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--color-on-surface-variant)",
							}}
						>
							이미지 업로드 영역 (최대 10장)
						</div>
					</div>
					<button
						type="button"
						onClick={handleSubmit}
						style={{
							padding: "16px 20px",
							borderRadius: 16,
							background: "var(--color-primary)",
							color: "white",
							fontWeight: 700,
						}}
					>
						상품 등록하기
					</button>
				</div>
			</section>
		</main>
	);
}
