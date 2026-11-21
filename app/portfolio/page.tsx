import Link from 'next/link';
import {ArrowUpRight, Download, ArrowLeft, ArrowRight} from 'lucide-react';
import {language} from '@/lib/construction';
import {seo} from '@/lib/seo';
import pages from '@/lib/portfolio-pages.json';

const pdf='/documents/LA-Construction-Portfolio.pdf?v=3';

type Props={searchParams:Promise<{lang?:string}>};
export async function generateMetadata({searchParams}:Props){
 const lang=language((await searchParams).lang);
 return seo('/portfolio',lang,lang==='en'?'Company Portfolio | LA Construction':'بورتفوليو الشركة | LA Construction',lang==='en'?'View and download the LA Construction company portfolio and selected projects.':'تصفح وحمّل بورتفوليو LA Construction وتعرّف على الشركة ومشروعاتها المختارة.');
}

export default async function Portfolio({searchParams}:Props){
 const lang=language((await searchParams).lang),en=lang==='en';
 const Back=en?ArrowLeft:ArrowRight;
 return <div className="la-site la-portfolio-viewer" dir={en?'ltr':'rtl'} lang={lang}>
  <header className="la-portfolio-toolbar">
   <Link className="la-portfolio-back" href={`/?lang=${lang}`} aria-label={en?'Back to home':'العودة للرئيسية'}><Back size={18}/><img src="/assets/la-mark.svg" width="30" height="34" alt="LA Construction"/></Link>
   <div className="la-portfolio-heading"><span className="la-portfolio-kicker" dir="ltr">LA CONSTRUCTION / PORTFOLIO</span><h1>{en?'Company portfolio':'بورتفوليو الشركة'}</h1></div>
   <div className="la-portfolio-tools">
    <a className="la-portfolio-open" href={pdf} target="_blank" rel="noopener noreferrer">{en?'Open PDF':'فتح الملف'}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only">{en?' (new tab)':' (تبويب جديد)'}</span></a>
    <a className="la-portfolio-download" href="/portfolio/download" download="LA-Construction-Portfolio.pdf"><Download size={18} aria-hidden="true"/><span>{en?'Download PDF':'تحميل PDF'}</span></a>
   </div>
  </header>
  <main className="la-portfolio-canvas">
   <div className="la-portfolio-pages" aria-label={en?'Company portfolio pages':'صفحات بورتفوليو الشركة'}>
    {pages.map((page,i)=><figure className="la-portfolio-sheet" key={i}>
     <img src={page.src} width={page.width} height={page.height} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} alt={en?`LA Construction company portfolio, page ${i+1}`:`بورتفوليو شركة LA Construction، الصفحة ${i+1}`}/>
    </figure>)}
   </div>
  </main>
 </div>;
}
