import { seo } from '@/lib/seo';
import { publicData, siteData } from '@/lib/construction-server';
import Link from 'next/link';
import { language, imageUrl, type ProjectPage } from '@/lib/construction';
import { section } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import Projects from '@/components/construction/projects';
import PageHero from '@/components/construction/page-hero';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string;page?:string}>}){const q=await searchParams,lang=language(q.lang),page=Math.max(1,Math.min(10000,Number.parseInt(q.page||'1')||1));return seo('/projects',lang,lang==='en'?'Construction & Finishing Projects | LA Construction':'مشاريع البناء والتشطيبات | LA Construction',lang==='en'?'Explore LA Construction projects, photographs, project details and completed work.':'استكشف مشاريع LA Construction في الإنشاءات والتشطيبات والتجديد بالصور وتفاصيل كل مشروع.',undefined,page);}

export default async function ProjectIndex({searchParams}:{searchParams:Promise<{lang?:string;page?:string}>}){
 const search=await searchParams,lang=language(search.lang),en=lang==='en',page=Math.max(1,Math.min(10000,Number.parseInt(search.page||'1')||1));const home=await siteData(lang),content=section(home,'la-projects');let data:ProjectPage|null=null;
 try{data=await publicData<ProjectPage>(`projects?lang=${lang}&page=${page}`)}catch{}
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main><PageHero lang={lang} number="03" label={en?'Projects':'المشاريع'} title={content?.title||(en?'Projects':'المشاريع')} description={content?.description}/><div className="la-wrap la-project-index">{data?data.items.length?<Projects items={data.items} lang={lang}/>:<p className="la-empty">{en?'No published projects yet.':'لم تُنشر مشاريع بعد.'}</p>:<div className="la-empty"><p>{en?'Unable to load projects.':'تعذر تحميل المشاريع.'}</p><Link href={`/projects?lang=${lang}&page=${page}`}>{en?'Retry':'إعادة المحاولة'}</Link></div>}{data&&data.totalCount>data.pageSize&&<nav className="la-pagination" aria-label={en?'Project pages':'صفحات المشاريع'}>{page>1&&<Link href={`/projects?lang=${lang}&page=${page-1}`}>{en?'Previous':'السابق'}</Link>}<span>{page} / {Math.max(1,Math.ceil(data.totalCount/data.pageSize))}</span>{page*data.pageSize<data.totalCount&&<Link href={`/projects?lang=${lang}&page=${page+1}`}>{en?'Next':'التالي'}</Link>}</nav>}</div></main><Footer lang={lang}/></div>;
}
