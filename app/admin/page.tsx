import type { Metadata } from 'next';
import Dashboard from '@/components/admin/dashboard';
export const metadata: Metadata = { title: 'لوحة التحكم | All in Map', robots: { index: false, follow: false } };
export default function AdminPage() { return <Dashboard />; }
