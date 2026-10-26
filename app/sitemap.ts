import type { MetadataRoute } from 'next';
import { siteData, publicData } from '@/lib/construction-server';
import { serviceItems } from '@/lib/corporate-content';
import { guides } from '@/lib/construction-guides';
import { pageUrl } from '@/lib/seo';
import type { ProjectPage } from '@/lib/construction';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const paths=new Set(['/','/about','/services','/projects','/contact','/guides',...guides.map(g=>`/guides/${g.slug}`)]);
 const homes=await Promise.all([siteData('ar'),siteData('en')]);
 for(const home of homes)for(const s of serviceItems(home,'ar'))paths.add(`/services/${s.id}`);
 // Include every published project; avoid invented modification dates.
 try{let page=1;while(true){const data=await publicData<ProjectPage>(`projects?lang=ar&page=${page}&pageSize=100`);for(const p of data.items)paths.add(`/projects/${encodeURIComponent(p.slug)}`);if(!data.items.length||page*data.pageSize>=data.totalCount)break;page++;if(page>100)break;}}catch{/* Static pages remain discoverable during a CMS outage. */}
 return [...paths].flatMap(path=>(['ar','en'] as const).map(lang=>({url:pageUrl(path,lang),alternates:{languages:{ar:pageUrl(path,'ar'),en:pageUrl(path,'en')}}})));
}
