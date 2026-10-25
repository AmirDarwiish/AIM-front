'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import type { Lang } from '@/lib/public-api';
export default function Header({lang,logoUrl}:{lang:Lang;logoUrl?:string}){
 const [open,setOpen]=useState(false);const en=lang==='en',pathname=usePathname();
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=en?'ltr':'rtl';},[lang,en]);
 useEffect(()=>{setOpen(false)},[pathname]);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const links=[['/',en?'Home':'الرئيسية'],['/about',en?'About':'عن الشركة'],['/services',en?'Services':'الخدمات'],['/projects',en?'Projects':'المشاريع'],['/contact',en?'Contact':'تواصل معنا']];
 return <header className="la-header"><Link className="la-brand" href={`/?lang=${lang}`} aria-label="LA Construction"><img src={logoUrl||'/assets/la-mark.svg'} alt="" width="54" height="60"/><span><b>LA</b> CONSTRUCTION</span></Link><nav id="la-navigation" className={open?'la-nav is-open':'la-nav'} aria-label={en?'Main navigation':'القائمة الرئيسية'}>{links.map(([path,label])=><Link onClick={()=>setOpen(false)} href={`${path}?lang=${lang}`} key={path} aria-current={(path==='/'?pathname==='/':pathname.startsWith(path))?'page':undefined}>{label}</Link>)}</nav><div className="la-header-actions"><Link className="la-language" href={`${pathname}?lang=${en?'ar':'en'}`} aria-label={en?'العربية':'English'}>{en?'عربي':'EN'}</Link><Link className="la-contact-link" href={`/contact?lang=${lang}`}>{en?'Start a project':'ابدأ مشروعك'}<ArrowUpRight size={16}/></Link><button className="la-menu" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="la-navigation" aria-label={en?'Toggle menu':'فتح أو إغلاق القائمة'}>{open?<X/>:<Menu/>}</button></div></header>;
}
