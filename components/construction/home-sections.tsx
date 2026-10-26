import Link from 'next/link';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { imageUrl, videoSource, type ProjectPage } from '@/lib/construction';
import type { Section, Lang } from '@/lib/public-api';
import Projects from './projects';
import MobileCards from './mobile-cards';
import Services from './services';
import MediaCarousel from './media-carousel';
import BeforeAfter from './before-after';
import {testimonialPreviews} from '@/lib/testimonial-previews';
import { CtaContent } from './cta';
function Heading({content,lang,href}:{content:Section;lang:Lang;href?:string}){return <div className="la-section-head"><div>{content.subtitle&&<span className="la-eyebrow">{content.subtitle}</span>}{content.title&&<h2>{content.title}</h2>}{content.description&&<p className="la-section-description">{content.description}</p>}</div>{href&&<Link className="la-text-link" href={href}>{content.buttonText||(lang==='en'?'View all':'عرض الكل')}<ArrowUpRight size={19}/></Link>}</div>}
export default function HomeSection({content:s,lang,projects}:{content:Section;lang:Lang;projects:ProjectPage|null}){
 const en=lang==='en';
 if(s.sectionKey==='la-projects')return projects?.items.length?<section className="la-wrap la-projects" data-section={s.sectionKey}><Heading content={s} lang={lang} href={`/projects?lang=${lang}`}/><MobileCards count={Math.min(projects.items.length,3)} label={s.title||(en?'Projects':'المشاريع')} lang={lang} autoAdvance><Projects items={projects.items.slice(0,3)} lang={lang} featured/></MobileCards></section>:null;
 if(s.sectionKey==='la-services')return s.items.length?<section className="la-services-band" data-section={s.sectionKey}><div className="la-wrap"><Heading content={s} lang={lang} href={`/services?lang=${lang}`}/><MobileCards count={Math.min(s.items.length,3)} label={s.title||(en?'Services':'الخدمات')} lang={lang}><Services items={s.items.slice(0,3)} lang={lang}/></MobileCards></div></section>:null;
 if(s.sectionKey==='la-about')return s.title||s.description?<section className={`la-wrap la-home-intro ${imageUrl(s.imageUrl)?'has-image':''}`} data-section={s.sectionKey}>{imageUrl(s.imageUrl)&&<figure className="la-intro-image"><img src={imageUrl(s.imageUrl)} alt={s.title||''} width="900" height="1100" loading="lazy"/></figure>}<div className="la-intro-content"><div>{s.subtitle&&<span className="la-eyebrow">{s.subtitle}</span>}{s.title&&<h2>{s.title}</h2>}</div><div>{s.description&&<p className="la-lead">{s.description.length>240?s.description.slice(0,237)+'…':s.description}</p>}<Link className="la-text-link" href={`/about?lang=${lang}`}>{s.buttonText||(en?'About the company':'عن الشركة')}<ArrowUpRight size={19}/></Link></div></div></section>:null;
 if(s.sectionKey==='la-testimonials'||s.sectionKey==='la-films'){
  const film=s.sectionKey==='la-films';const managedItems=s.items.filter(i=>film?!!videoSource(i.videoUrl):!!(i.description||imageUrl(i.imageUrl)||videoSource(i.videoUrl)));const preview=!film&&!s.items.length;const items=preview?testimonialPreviews(lang):managedItems;if(!items.length)return null;
  return <section className={`la-media-section ${film?'la-site-films':'la-client-stories'}`} data-section={s.sectionKey}><div className="la-wrap"><Heading content={s} lang={lang}/>{preview&&<p className="la-review-preview-note">{en?'Illustrative preview samples. These are not actual client reviews.':'نماذج توضيحية لعرض القسم، وليست آراء لعملاء حقيقيين.'}</p>}<MediaCarousel title={s.title||''} items={items} lang={lang} kind={film?'films':'testimonials'}/></div></section>;
 }
 if(s.sectionKey==='la-before-after'){const items=s.items.filter(i=>imageUrl(i.imageUrl)&&imageUrl(i.afterImageUrl));return items.length?<section className="la-wrap la-transformation-section" data-section={s.sectionKey}><Heading content={s} lang={lang}/><BeforeAfter items={items} lang={lang}/></section>:null;}
 if(s.sectionKey==='la-faq'){const items=s.items.filter(i=>i.title&&i.description);return items.length?<section className="la-wrap la-faq-section" data-section={s.sectionKey}><Heading content={s} lang={lang}/><div className="la-faq-list">{items.map((i,index)=><details key={i.id} open={index===0}><summary><span>{i.title}</span><span className="la-faq-toggle" aria-hidden="true"><Plus className="la-faq-plus" size={19}/><Minus className="la-faq-minus" size={19}/></span></summary><p>{i.description}</p></details>)}</div></section>:null;}
 if(s.sectionKey==='la-stats')return s.items.length?<section className="la-statistics-band" data-section={s.sectionKey}><div className="la-wrap"><Heading content={s} lang={lang}/><div className="la-company-statistics">{s.items.map(i=><article key={i.id}><strong>{i.title}</strong><p>{i.description}</p></article>)}</div></div></section>:null;
 if(s.sectionKey==='la-partners'){const items=s.items.filter(i=>imageUrl(i.imageUrl));return items.length?<section className="la-wrap la-partners-section" data-section={s.sectionKey}><Heading content={s} lang={lang}/><div className="la-partner-logos">{items.map(i=><img key={i.id} src={imageUrl(i.imageUrl)} alt={i.title} width="180" height="90" loading="lazy"/>)}</div></section>:null;}
 if(s.sectionKey==='la-cta')return <CtaContent content={s} lang={lang}/>;
 if(!s.title&&!s.description&&!s.items.length&&!imageUrl(s.imageUrl))return null;
 return <section className="la-wrap la-extra" data-section={s.sectionKey}><Heading content={s} lang={lang}/>{imageUrl(s.imageUrl)&&<img src={imageUrl(s.imageUrl)} alt={s.title} width="1200" height="800" loading="lazy"/>}{s.items.map(i=><article key={i.id}><h3>{i.title}</h3><p>{i.description}</p>{imageUrl(i.imageUrl)&&<img src={imageUrl(i.imageUrl)} alt={i.title} width="900" height="600" loading="lazy"/>}</article>)}</section>;
}
