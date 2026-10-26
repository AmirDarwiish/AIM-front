import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';
import './construction-growth.css';
import './globals.css';
import './tajawal.css';
import './construction.css';
import './construction-editorial.css';
import './construction-depth.css';
export const metadata:Metadata={metadataBase:new URL(SITE_URL),robots:{index:true,follow:true},title:'LA Construction | نبني بإتقان',description:'المقاولات والإنشاءات والتشطيبات والتجديد. استكشف أعمال LA Construction وتواصل معنا لمناقشة مشروعك.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl" data-scroll-behavior="smooth"><body>{children}</body></html>}
