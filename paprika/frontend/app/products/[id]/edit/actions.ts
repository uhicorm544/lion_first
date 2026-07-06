'use server';
import { revalidatePath } from 'next/cache';

export async function invalidatePost(postId: number) {
  revalidatePath(`/products/${postId}`);
}
