// ────────────────────────────────────────────────────────────────
// Paprika 공통 타입 정의
// ────────────────────────────────────────────────────────────────

// Auth (A - 민동현)
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  role: 'USER' | 'ADMIN';
  trustScore?: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Product (B - 백성민)
export type ProductStatus = 'SELLING' | 'RESERVED' | 'SOLD' | 'DRAFT';

export interface Product {
  id: number;
  sellerId: number;
  sellerNickname: string;
  sellerProfileImageUrl?: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrls: string[];
  viewCount: number;
  wishCount: number;
  createdAt: string;
}

export interface PostApiResponse {
  id: number;
  userId: number;
  nickname: string;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string | null;
  currentPrice: number;
  active: boolean;
  postStatus: 'SELLING' | 'RESERVED' | 'SOLD' | 'DRAFT';
  category: string | null;
  viewCount: number;
  createdAt: string;
  imgUrls: string[];
}

// Chat (C - 한대천)
export interface ChatRoom {
  id: number;
  productId: number;
  productTitle: string;
  productImageUrl?: string;
  counterpartId: number;
  counterpartNickname: string;
  counterpartProfileImageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Transaction (D - 이동준)
export type TransactionType = 'DIRECT' | 'DELIVERY';
export type TransactionStatus = 'PENDING' | 'AGREED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  meetingLocation?: string;
  meetingTime?: string;
  trackingNumber?: string;
  createdAt: string;
}

// 거래 화면 표시용 상품 정보 (GET /api/v1/transactions/post-info/{postId})
export interface PostInfo {
  postId: number;
  title: string;
  price: number;
  sellerId: number;
  status: ProductStatus;
}

// MyPage (E - 장인호)
export interface MyPageTransaction {
  id: number | null; // 판매중 탭에서 아직 거래가 생성되지 않은 상품만 있는 항목은 null
  postId: number;
  type: string | null;
  status: string;
  myRole: 'BUYER' | 'SELLER';
  itemPrice: number;
  amount: number;
  createdAt: string;
  imgUrl: string;
  reviewId: number | null;
  cancelledBy: 'BUYER' | 'SELLER' | null;
}
// Wishlist
export interface WishListItem {
  id: number;
  productId: number;
  title: string;
  imgUrl: string;
  createdAt: string;
}

// Review
export interface Review {
  id: number;
  transactionId: number;
  reviewerId: number;
  reviewerNickname: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  mannerScore: -2 | -1 | 0 | 1 | 2;
  createdAt: string;
  postId: number | null;
}
// Mannertemperature
export interface MannerTemperature {
  userId: number;
  temperature: number;
  trustGrade: '나쁨' | '약간나쁨' | '보통' | '좋음' | '최고';
  reviewCount: number;
}

// PublicProfile 다른 유저 프로필 조회용
export interface PublicProfile {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

// Common
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
