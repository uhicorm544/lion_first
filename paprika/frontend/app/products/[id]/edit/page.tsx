import type { ApiResponse, PostApiResponse } from '@/types';
import PostEditForm from '@/components/post/PostEditForm';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}/api/v1/posts/${params.id}`,
    { cache: 'no-store' },
  );
  const json: ApiResponse<PostApiResponse> = await res.json();

  return <PostEditForm post={json.data} />;
}
