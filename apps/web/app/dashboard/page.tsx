import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (session.role === 'PROFISSIONAL') redirect('/profissional');
  if (session.role === 'ESTABELECIMENTO') redirect('/estabelecimento');
  if (session.role === 'ADMIN') redirect('/admin');

  redirect('/login');
}
