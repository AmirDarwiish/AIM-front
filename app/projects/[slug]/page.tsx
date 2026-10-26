import { publicData } from '@/lib/construction-server';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { language, imageUrl, type Project } from '@/lib/construction';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import Gallery from '@/components/construction/gallery';
export const dynamic='force-dynamic';
const getProject=cache((slug:string,lang:string)=>publicData<Project>(`projects/${encodeURIComponent(slug)}?lang=${lang}`));
type Props={params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>};
export async function generateMetadata({params,searchParams}:Props){try{const p=await getProject((await params).slug,language((await searchParams).lang));return {title:`${p.title} | LA Construction`,description:p.summary,openGraph:{title:p.title,description:p.summary,...(imageUrl(p.coverUrl)?{images:[p.coverUrl!]}:{})}}}catch{return {title:'Project | LA Construction'}}}
export default async function ProjectDetail({params,searchParams}:Props){
 const lang=language((await searchParams).lang),en=lang==='en';let p:Project;
 try{p=await getProject((await params).slug,lang)}catch(e){if((e as {status?:number}).status===404)notFound();throw e;}
 const cover=imageUrl(p.coverUrl);const gallery=(p.assets||[]).filter(asset=>!cover||asset.kind!=='image'||imageUrl(asset.url)!==cover);
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang}/><main><div className="la-wrap la-project-title"><Link className="la-text-link" href={`/projects?lang=${lang}`}><ArrowRight size={18} className="la-back-icon" aria-hidden="true"/>{en?'All projects':'كل المشاريع'}</Link><span className="la-eyebrow">{p.category||'LA CONSTRUCTION'}</span><h1>{p.title}</h1><p className="la-lead">{p.summary}</p>{(p.location||p.year)&&<dl className="la-project-facts">{[[en?'Location':'الموقع',p.location],[en?'Year':'السنة',p.year]].filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}</div>{imageUrl(p.coverUrl)&&<div className="la-project-cover"><img src={imageUrl(p.coverUrl)} alt={p.title} width="1600" height="1000" fetchPriority="high"/></div>}<section className="la-wrap la-story"><span className="la-eyebrow">{en?'THE PROJECT':'عن المشروع'}</span><div className="la-prose">{p.description?.split(/\r?\n+/).filter(text=>text.trim()).map((text,i)=><p key={i}>{text}</p>)}</div></section>{!!gallery.length&&<section className="la-wrap la-project-gallery"><div className="la-section-head"><h2>{en?'In the details.':'من تفاصيل المشروع.'}</h2><span>{en?'PHOTOGRAPHS & FILMS':'صور وفيديوهات'}</span></div><Gallery assets={gallery} lang={lang}/></section>}</main><Footer lang={lang}/></div>;
}
