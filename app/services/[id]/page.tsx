import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { serviceItems, section, contentParagraphs } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import type { Metadata } from 'next';
export const dynamic='force-dynamic';
type Props={params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>};
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const lang=language((await searchParams).lang),home=await siteData(lang),id=(await params).id,item=serviceItems(home,lang).find(x=>String(x.id)===id);return {title:`${item?.title||(lang==='en'?'Service':'الخدمة')} | LA Construction`,description:item?.description?.slice(0,160)}}
export default async function ServiceDetail({params,searchParams}:Props){
 const lang=language((await searchParams).lang),en=lang==='en',id=(await params).id,home=await siteData(lang),item=serviceItems(home,lang).find(i=>String(i.id)===id);if(!item)notFound();
 const process=section(home,'la-process');const steps=process?.items||(en?[{id:1,title:'Understand the brief',description:'Discuss the space, requirements and priorities.'},{id:2,title:'Define the scope',description:'Agree on the proposed work, materials and stages.'},{id:3,title:'Plan the next steps',description:'Review the details and the way forward together.'}]:[{id:1,title:'نفهم احتياجك',description:'نناقش المساحة والمتطلبات وأولويات المشروع.'},{id:2,title:'نحدد نطاق الأعمال',description:'نوضح الأعمال المقترحة والخامات ومراحل التنفيذ.'},{id:3,title:'نرتب الخطوات القادمة',description:'نراجع التفاصيل والطريقة الأنسب لبدء المشروع.'}]);
 return <div className="la-site" lang={lang} dir={en?'ltr':'rtl'}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main><PageHero lang={lang} number="02" label={en?'Services':'الخدمات'} title={item.title} description={en?'A closer look at our expertise.':'نظرة أقرب على تفاصيل الخدمة.'}/><section className="la-wrap la-service-detail"><div><Link className="la-text-link" href={`/services?lang=${lang}`}>← {en?'All services':'كل الخدمات'}</Link><div className="la-prose">{contentParagraphs(item.description).map((p,i)=><p key={i}>{p}</p>)}</div>{imageUrl(item.imageUrl)&&<img src={imageUrl(item.imageUrl)} alt={item.title} width="1200" height="800" loading="lazy"/>}</div><aside><span className="la-eyebrow">{en?'LET’S TALK DETAILS':'نتكلم في التفاصيل'}</span><h2>{en?'Your project.\nYour priorities.':'مشروعك.\nوأولوياتك.'}</h2><p>{en?'Tell us about your space and what you have in mind.':'شاركنا تفاصيل المكان والفكرة اللي في بالك.'}</p><Link className="la-button la-button-dark" href={`/contact?lang=${lang}&service=${item.id}`}>{en?'Request a conversation':'تواصل بخصوص الخدمة'} ↗</Link></aside></section><section className="la-values-band"><div className="la-wrap"><h2>{process?.title||(en?'Where we begin.':'إزاي بنبدأ؟')}</h2><div className="la-values-grid">{steps.map((step,i)=><article key={step.id}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div></section></main><Footer lang={lang}/></div>;
}
