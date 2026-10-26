import Link from 'next/link';
import { siteData } from '@/lib/construction-server';
import { section } from '@/lib/corporate-content';
import { imageUrl } from '@/lib/construction';
import type { Lang } from '@/lib/public-api';
export default async function Footer({lang}:{lang:Lang}){const en=lang==='en',home=await siteData(lang),content=section(home,'la-footer');return <footer className="la-corporate-footer"><div className="la-wrap la-footer-columns"><div><Link href={`/?lang=${lang}`} className="la-brand"><img src={imageUrl(home?.logoUrl)||'/assets/la-mark.svg'} alt="" width="42" height="48"/><span><b>LA</b> CONSTRUCTION</span></Link>{content?.title&&<p>{content.title}</p>}</div><div><h2>{en?'Explore':'اكتشف'}</h2><nav aria-label={en?'Footer navigation':'روابط الموقع'}>{[['/about',en?'About the company':'عن الشركة'],['/services',en?'Our services':'خدماتنا'],['/projects',en?'Our projects':'مشاريعنا'],['/contact',en?'Get in touch':'تواصل معنا']].map(([path,label])=><Link href={`${path}?lang=${lang}`} key={path}>{label}</Link>)}</nav></div></div><div className="la-wrap la-footer-base"><small>© {new Date().getFullYear()} LA Construction</small></div></footer>}
