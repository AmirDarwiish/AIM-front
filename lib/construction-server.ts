import { cache } from 'react';
import { apiBase } from './admin-server';
import type { Lang } from './public-api';
import type { SiteContent, ProjectPage } from './construction';
export async function publicData<T>(path:string):Promise<T>{
 const res=await fetch(`${apiBase()}/api/public/${path}`,{cache:'no-store',signal:AbortSignal.timeout(12000),redirect:'error'});
 if(!res.ok)throw Object.assign(new Error('Content unavailable'),{status:res.status});
 return res.json();
}
export const siteData=cache(async(lang:Lang):Promise<SiteContent|null>=>{
 try{const home=await publicData<SiteContent>(`website/home?lang=${lang}`);return /^LA\s+Construction$/i.test(home.siteName||'')||(home.sections||[]).some(s=>s.sectionKey.startsWith('la-'))?home:null;}catch{return null;}
});
export async function homeData(lang:Lang){
 const [home,projects]=await Promise.all([siteData(lang),publicData<ProjectPage>(`projects?lang=${lang}&pageSize=4&featuredOnly=true`).catch(()=>null)]);
 return {home,projects};
}

/** Fetch all published pages so service portfolios do not stop at the first page. */
export const projectCatalogue=cache(async(lang:Lang):Promise<ProjectPage>=>{
 const first=await publicData<ProjectPage>(`projects?lang=${lang}&page=1&pageSize=24`);
 const size=Math.max(1,first.pageSize||24),pages=Math.ceil(first.totalCount/size);
 const items=[...first.items];
 for(let page=2;page<=pages;page++){
  const next=await publicData<ProjectPage>(`projects?lang=${lang}&page=${page}&pageSize=24`);
  if(!next.items.length)break;
  items.push(...next.items);
 }
 return {...first,items};
});
