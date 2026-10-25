import { apiBase } from './admin-server';
import type { Lang } from './public-api';
import type { SiteContent, ProjectPage } from './construction';
export async function publicData<T>(path:string):Promise<T>{
 const res=await fetch(`${apiBase()}/api/public/${path}`,{cache:'no-store',signal:AbortSignal.timeout(12000),redirect:'error'});
 if(!res.ok)throw Object.assign(new Error('Content unavailable'),{status:res.status});
 return res.json();
}
// Never turn a failed request into a fake project or a successful empty response.
export async function homeData(lang:Lang){
 const [home,projects]=await Promise.allSettled([publicData<SiteContent>(`website/home?lang=${lang}`),publicData<ProjectPage>(`projects?lang=${lang}&pageSize=4`)]);
 return {home:home.status==='fulfilled'?home.value:null,projects:projects.status==='fulfilled'?projects.value:null};
}
