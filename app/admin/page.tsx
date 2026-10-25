import type { Metadata } from 'next';
import Dashboard from '@/components/admin/dashboard';
export const metadata: Metadata = { title: 'لوحة التحكم | LA Construction', robots: { index: false, follow: false } };
export default function AdminPage() { return <Dashboard />; }
