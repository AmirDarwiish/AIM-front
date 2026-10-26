import type { Metadata } from 'next';
import './globals.css';
import './tajawal.css';
import './construction.css';
import './construction-editorial.css';
export const metadata:Metadata={title:'LA Construction | نبني بإتقان',description:'المقاولات والإنشاءات والتشطيبات والتجديد. استكشف أعمال LA Construction وتواصل معنا لمناقشة مشروعك.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl" data-scroll-behavior="smooth"><body>{children}</body></html>}
