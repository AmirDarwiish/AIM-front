import {FileText, ArrowUpRight} from 'lucide-react';
import type {Lang} from '@/lib/public-api';

/** A normal file link avoids prefetching the PDF with the page's initial assets. */
export default function PortfolioLink({lang}:{lang:Lang}){
 const en=lang==='en';
 return <a className="la-portfolio-link" href="/documents/LA-Construction-Portfolio.pdf?v=3" target="_blank" rel="noopener noreferrer" type="application/pdf" aria-label={en?'Open company portfolio PDF in a new tab':'فتح بورتفوليو الشركة PDF في تبويب جديد'}>
  <FileText size={19} aria-hidden="true"/>
  <span>{en?'Company portfolio':'بورتفوليو الشركة'}<small>{en?'PDF · 14 pages':'PDF · ١٤ صفحة'}</small></span>
  <ArrowUpRight size={17} aria-hidden="true"/>
 </a>;
}
