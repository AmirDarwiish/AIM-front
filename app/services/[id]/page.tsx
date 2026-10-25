import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { serviceItems, section, contentParagraphs } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import Unavailable from '@/components/construction/unavailable';
import type { Metadata } from 'next';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>};
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const lang=language((await searchParams).lang),home=await siteData(lang),id=(await params).id,item=serviceItems(home,lang).find(x=>String(x.id)===id);return {title:`${item?.title||(lang==='en'?'Service':'الخدمة')} | LA Construction`,description:item?.description?.slice(0,160)}}
export default async function ServiceDetail({params,searchParams}:Props){
 const lang=language((await searchParams).lang),en=lang==='en',id=(await params).id,home=await siteData(lang),item=serviceItems(home,lang).find(i=>String(i.id)===id);
 if(!home)return <div className="la-site" lang={lang} dir={en?'ltr':'rtl'}><Header lang={lang}/><Unavailable lang={lang} path={`/services/${encodeURIComponent(id)}`}/><Footer lang={lang}/></div>;
 if(!item)notFound();const process=section(home,'la-process'),cta=section(home,'la-service-cta');
 return <div className="la-site" lang={lang} dir={en?'ltr':'rtl'}><Header lang={lang} logoUrl={imageUrl(home.logoUrl)}/><main><PageHero lang={lang} number="02" label={en?'Services':'الخدمات'} title={item.title} description={item.subtitle}/><section className={`la-wrap la-service-detail ${!cta?'la-story-text-only':''}`}><div><Link className="la-text-link" href={`/services?lang=${lang}`}><ArrowRight size={18} className="la-back-icon" aria-hidden="true"/>{en?'All services':'كل الخدمات'}</Link><div className="la-prose">{contentParagraphs(item.description).map((p,i)=><p key={i}>{p}</p>)}</div>{imageUrl(item.imageUrl)&&<img src={imageUrl(item.imageUrl)} alt={item.title} width="1200" height="800" loading="lazy"/>}</div>{cta&&<aside>{cta.subtitle&&<span className="la-eyebrow">{cta.subtitle}</span>}{cta.title&&<h2>{cta.title}</h2>}{cta.description&&<p>{cta.description}</p>}<Link className="la-button la-button-dark" href={`/contact?lang=${lang}&service=${item.id}`}>{cta.buttonText||(en?'Contact':'تواصل معنا')}<ArrowUpRight size={18}/></Link></aside>}</section>{!!process?.items.length&&<section className="la-values-band"><div className="la-wrap">{process.title&&<h2>{process.title}</h2>}<div className="la-values-grid">{process.items.map((step,i)=><article key={step.id}><span>{String(i+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div></section>}</main><Footer lang={lang}/></div>;
}
