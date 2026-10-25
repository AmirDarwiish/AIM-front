'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import type { Lang } from '@/lib/public-api';
export default function Header({lang,logoUrl}:{lang:Lang;logoUrl?:string}){
 const [open,setOpen]=useState(false);const en=lang==='en';
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=en?'ltr':'rtl';},[lang,en]);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const root=`/?lang=${lang}`;
 return <header className="la-header"><Link className="la-brand" href={root} aria-label="LA Construction"><img src={logoUrl||'/assets/la-mark.svg'} alt="" width="54" height="60"/><span><b>LA</b> CONSTRUCTION<small>PRECISION IN EVERY DETAIL</small></span></Link><nav id="la-navigation" className={open?'la-nav is-open':'la-nav'} aria-label={en?'Main navigation':'القائمة الرئيسية'}>{[[`${root}#about`,en?'About':'عن الشركة'],[`${root}#services`,en?'Expertise':'خدماتنا'],[`/projects?lang=${lang}`,en?'Projects':'المشاريع'],[`${root}#contact`,en?'Contact':'تواصل معنا']].map(([href,label])=><Link onClick={()=>setOpen(false)} href={href} key={href}>{label}</Link>)}</nav><div className="la-header-actions"><Link className="la-language" href={`?lang=${en?'ar':'en'}`} aria-label={en?'العربية':'English'}>{en?'عربي':'EN'}</Link><Link className="la-contact-link" href={`${root}#contact`}>{en?'Start a conversation':'ابدأ مشروعك'} <ArrowUpRight size={16}/></Link><button className="la-menu" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="la-navigation" aria-label={en?'Toggle menu':'فتح أو إغلاق القائمة'}>{open?<X/>:<Menu/>}</button></div></header>;
}
