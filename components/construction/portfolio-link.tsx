import {FileText, ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
import type {Lang} from '@/lib/public-api';

/** Load the PDF only after visitors choose to view the portfolio. */
export default function PortfolioLink({lang,hero=false}:{lang:Lang;hero?:boolean}){
 const en=lang==='en';
 return <Link className={`la-portfolio-link${hero?' la-portfolio-link-hero':''}`} href={`/portfolio?lang=${lang}`} prefetch={false}>
  <span className="la-portfolio-symbol"><FileText size={21} aria-hidden="true"/></span>
  <span>{en?'Company portfolio':'بورتفوليو الشركة'}<small>{en?'PDF · 14 pages':'PDF · ١٤ صفحة'}</small></span>
  <ArrowUpRight size={17} aria-hidden="true"/>
 </Link>;
}
