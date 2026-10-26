import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {siteData} from '@/lib/construction-server';
import {section} from '@/lib/corporate-content';
import {imageUrl,linkUrl} from '@/lib/construction';
import type {Lang} from '@/lib/public-api';

export default async function Footer({lang}:{lang:Lang}){
 const en=lang==='en',home=await siteData(lang),content=section(home,'la-footer');
 const socials=[['Instagram',home?.instagramUrl],['LinkedIn',home?.linkedinUrl],['WhatsApp',home?.whatsappUrl]].filter(([,url])=>linkUrl(url));
 const hasContact=!!(home?.contactEmail||home?.contactPhone||socials.length);
 return <footer className="la-corporate-footer la-footer-modern">
  <div className="la-wrap">
   <div className="la-footer-heading">
    <div className="la-footer-identity"><Link href={`/?lang=${lang}`} className="la-brand"><img src={imageUrl(home?.logoUrl)||'/assets/la-mark.svg'} alt="" width="48" height="54"/><span><b>LA</b> CONSTRUCTION</span></Link>{content?.title&&<h2>{content.title}</h2>}{content?.description&&<p>{content.description}</p>}</div>
    <Link className="la-footer-project" href={`/contact?lang=${lang}`}><span>{en?'Discuss your project':'ناقش مشروعك'}</span><span className="la-footer-project-icon" aria-hidden="true"><ArrowUpRight size={30}/></span></Link>
   </div>
   <div className={`la-footer-directory ${hasContact?'has-contact':''}`}>
    <div><h3>{en?'Explore':'اكتشف'}</h3><nav aria-label={en?'Footer navigation':'روابط الموقع'}>{[['/about',en?'About the company':'عن الشركة'],['/services',en?'Our services':'خدماتنا'],['/projects',en?'Our projects':'مشاريعنا'],['/contact',en?'Get in touch':'تواصل معنا']].map(([path,label])=><Link href={`${path}?lang=${lang}`} key={path}>{label}</Link>)}</nav></div>
    {hasContact&&<div className="la-footer-contact"><h3>{en?'Connect':'لنتواصل'}</h3>{home?.contactEmail&&<a dir="ltr" href={`mailto:${home.contactEmail}`}>{home.contactEmail}</a>}{home?.contactPhone&&<a dir="ltr" href={`tel:${home.contactPhone.replace(/[^+\d]/g,'')}`}>{home.contactPhone}</a>}{socials.length>0&&<nav aria-label={en?'Social media':'التواصل الاجتماعي'}>{socials.map(([name,url])=><a key={name} href={linkUrl(url)} target="_blank" rel="noopener noreferrer">{name}<ArrowUpRight size={14} aria-hidden="true"/></a>)}</nav>}</div>}
   </div>
   <div className="la-footer-base"><small>© {new Date().getFullYear()} LA Construction</small><Link href={`/?lang=${en?'ar':'en'}`} lang={en?'ar':'en'}>{en?'العربية':'English'}</Link></div>
  </div>
 </footer>;
}
