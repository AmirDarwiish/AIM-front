import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'All in Map | كل ما تحتاجه في مكان واحد',description:'اكتشف الأماكن والخدمات القريبة منك. عقارات، صيانة، مطاعم، مغاسل، متاجر وصيدليات على خريطة واحدة.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
