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
 try{const home=await publicData<SiteContent>(`website/home?lang=${lang}`);return (home.sections||[]).some(s=>s.sectionKey.startsWith('la-'))?home:null;}catch{return null;}
});
export async function homeData(lang:Lang){
 const [home,projects]=await Promise.all([siteData(lang),publicData<ProjectPage>(`projects?lang=${lang}&pageSize=4`).catch(()=>null)]);
 return {home,projects};
}
