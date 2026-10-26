import { seo } from '@/lib/seo';
import StructuredData from '@/components/construction/structured-data';
import GuideLinks from '@/components/construction/guide-links';
import { homeData, siteData } from '@/lib/construction-server';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl, localizedLink, language } from '@/lib/construction';
import { section } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import ArchitectureScene from '@/components/construction/architecture-scene';
import Footer from '@/components/construction/footer';
import HomeSection from '@/components/construction/home-sections';
import Unavailable from '@/components/construction/unavailable';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang),home=await siteData(lang),hero=section(home,'la-hero');return seo('/',lang,lang==='en'?'LA Construction | Construction, Renovation & Interior Finishing':'LA Construction | مقاولات وتشطيبات وتجديد',hero?.description?.slice(0,160)||(lang==='en'?'Explore construction, renovation and interior finishing services. View projects and request a project quotation.':'استكشف خدمات المقاولات والتشطيبات وتجديد المساحات، شاهد المشاريع وشاركنا تفاصيل مشروعك لطلب عرض سعر.'),imageUrl(home?.sliders[0]?.desktopImageUrl||hero?.imageUrl))}
export default async function Home({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const lang=language((await searchParams).lang),en=lang==='en';const {home,projects}=await homeData(lang),hero=section(home,'la-hero'),slide=home?.sliders[0];
 const internal=new Set(['la-hero','la-about-story','la-values','la-process','la-service-cta','la-contact','la-footer','la-cta']);
 const sections=(home?.sections||[]).filter(s=>s.sectionKey.startsWith('la-')&&s.showOnHome!==false&&!internal.has(s.sectionKey)).sort((a,b)=>Number(a.sectionKey==='la-testimonials')-Number(b.sectionKey==='la-testimonials')||(a.sortOrder||0)-(b.sortOrder||0)||a.id-b.id);
 const photo=imageUrl(slide?.desktopImageUrl||hero?.imageUrl),mobile=imageUrl(slide?.mobileImageUrl);const title=slide?.title||hero?.title;
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><a className="la-skip" href="#main">{en?'Skip to content':'انتقل للمحتوى'}</a><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main id="main">{!home?<Unavailable lang={lang}/>:<>{hero&&hero.showOnHome!==false&&title&&<section className={`la-hero ${!photo?'la-hero-typographic':''}`}>{photo&&<picture>{mobile&&<source media="(max-width:760px)" srcSet={mobile}/>}<img src={photo} alt={title} width="1774" height="887" fetchPriority="high"/></picture>}<div className="la-hero-shade"/><div className="la-hero-copy la-hero-spatial"><div className="la-hero-text">{hero.subtitle&&<span className="la-eyebrow">{hero.subtitle}</span>}<h1>{title}</h1>{(slide?.description||hero.description)&&<p>{slide?.description||hero.description}</p>}<div className="la-hero-actions"><Link className="la-button" href={localizedLink(slide?.buttonUrl||hero.buttonUrl,lang)||`/projects?lang=${lang}`}>{slide?.buttonText||hero.buttonText||(en?'Projects':'المشاريع')}<ArrowUpRight size={20}/></Link>{!(localizedLink(slide?.buttonUrl||hero.buttonUrl,lang)||'').startsWith('/contact')&&<Link className="la-hero-quote" href={`/contact?lang=${lang}`}>{en?'Request a quotation':'اطلب عرض سعر لمشروعك'}<ArrowUpRight size={18}/></Link>}</div></div><ArchitectureScene className="la-hero-model"/></div></section>}<StructuredData home={home} lang={lang}/><div id="la-home-content">{sections.map(s=><HomeSection key={s.id} content={s} lang={lang} projects={projects}/>)}</div><GuideLinks lang={lang}/></>}</main><Footer lang={lang}/></div>;
}
