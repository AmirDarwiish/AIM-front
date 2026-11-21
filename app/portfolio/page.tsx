import Link from 'next/link';
import {ArrowUpRight, Download, FileText, ArrowLeft, ArrowRight} from 'lucide-react';
import {language} from '@/lib/construction';
import {seo} from '@/lib/seo';

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
    <a className="la-portfolio-download" href={pdf} download="LA-Construction-Portfolio.pdf"><Download size={18} aria-hidden="true"/><span>{en?'Download PDF':'تحميل PDF'}</span></a>
   </div>
  </header>
  <main className="la-portfolio-canvas">
   <div className="la-portfolio-caption"><FileText size={14} aria-hidden="true"/><span>{en?'Company profile & selected works':'نبذة عن الشركة ومشروعات مختارة'}</span><span dir="ltr">PDF / 14</span></div>
   <iframe className="la-portfolio-document" src={`${pdf}#view=FitH`} title={en?'LA Construction company portfolio — 14 pages':'بورتفوليو شركة LA Construction — ١٤ صفحة'}/>
   <p className="la-portfolio-help">{en?'Having trouble viewing? Use “Open PDF” above to read the full document.':'لو الملف مش ظاهر كامل، اضغط «فتح الملف» بالأعلى لعرض كل الصفحات.'}</p>
  </main>
 </div>;
}
