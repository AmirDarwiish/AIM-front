import { publicData } from '@/lib/construction-server';
import Link from 'next/link';
import { language, type ProjectPage } from '@/lib/construction';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import Projects from '@/components/construction/projects';
export const dynamic='force-dynamic';
export const metadata={title:'المشاريع | LA Construction',description:'استكشف مشاريع LA Construction في الإنشاءات والتشطيبات والتجديد.'};
export default async function ProjectIndex({searchParams}:{searchParams:Promise<{lang?:string;page?:string}>}){
 const search=await searchParams,lang=language(search.lang),en=lang==='en',page=Math.max(1,Math.min(10000,Number.parseInt(search.page||'1')||1));let data:ProjectPage|null=null;
 try{data=await publicData<ProjectPage>(`projects?lang=${lang}&page=${page}`)}catch{}
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang}/><main className="la-wrap la-project-index"><span className="la-eyebrow">LA CONSTRUCTION / PORTFOLIO</span><h1>{en?'Our work.':'مشاريعنا.'}</h1><p className="la-lead">{en?'A closer look at the spaces we bring to life.':'نظرة أقرب على المساحات اللي بنحوّلها لواقع.'}</p>{data?data.items.length?<Projects items={data.items} lang={lang}/>:<p className="la-empty">{en?'No published projects yet.':'لم تُنشر مشاريع بعد.'}</p>:<div className="la-empty"><p>{en?'Unable to load projects.':'تعذر تحميل المشاريع.'}</p><Link href={`/projects?lang=${lang}&page=${page}`}>{en?'Retry':'إعادة المحاولة'}</Link></div>}{data&&<nav className="la-pagination" aria-label={en?'Project pages':'صفحات المشاريع'}>{page>1&&<Link href={`/projects?lang=${lang}&page=${page-1}`}>{en?'Previous':'السابق'}</Link>}<span>{page} / {Math.max(1,Math.ceil(data.totalCount/data.pageSize))}</span>{page*data.pageSize<data.totalCount&&<Link href={`/projects?lang=${lang}&page=${page+1}`}>{en?'Next':'التالي'}</Link>}</nav>}</main><Footer lang={lang}/></div>;
}
