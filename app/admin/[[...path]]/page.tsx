import { notFound } from 'next/navigation';
import Dashboard from '@/components/admin/dashboard';
import { parseAdminRoute } from '@/lib/admin-navigation';
export const metadata={title:'لوحة التحكم | LA Construction'};
export default async function AdminPage({params}:{params:Promise<{path?:string[]}>}){
 const route=parseAdminRoute((await params).path||[]);
 if(!route)notFound();
 return <Dashboard route={route}/>;
}
