import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminRootPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/admin/login');
  }
  redirect('/admin/dashboard');
}
