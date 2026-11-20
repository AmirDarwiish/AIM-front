import {adminRequest} from './admin-api';
import payload from './company-content.json';
type Data = Record<string, any>;
export async function importCompanyContent(onProgress:(message:string)=>void,onBackup:(value:unknown)=>void){
 const content:Data=payload;
 const stateKey='la-company-import-v1';
 let state:Data={media:{},projects:{},sections:{},items:{}};
 try{const stored=localStorage.getItem(stateKey);if(stored)state=JSON.parse(stored)}catch{throw Error('تعذر قراءة حالة الاستيراد. راجع إعدادات تخزين المتصفح.')}
 const save=()=>localStorage.setItem(stateKey,JSON.stringify(state));
 async function api(route:string,method='GET',body?:unknown):Promise<any>{
  const multipart=body instanceof FormData;
  return adminRequest(route.replace(/^\/api\//,''),{method,...(body?{body:multipart?body:JSON.stringify(body)}:{})});
 }
 function omit(obj:Data,keys:string[]){return Object.fromEntries(Object.entries(obj).filter(([key])=>!keys.includes(key)))}
// Read all targeted content before any mutation. Backup contains content, not authentication.
const [settings,sections,projects,sliders]=await Promise.all(['/api/admin/site-settings','/api/admin/sections','/api/admin/projects','/api/admin/sliders'].map((p:any)=>api(p)));
if(!/^LA\s+Construction$/i.test(settings.siteNameAr||settings.siteNameEn||'')||!sections.some((s:any)=>s.sectionKey==='la-hero'))throw Error('Target is not the expected LA Construction CMS.');
const projectDetails=await Promise.all(projects.map((p:any)=>api(`/api/admin/projects/${p.id}`)));
const sectionItems=Object.fromEntries(await Promise.all(sections.map(async (s:any)=>[s.id,await api(`/api/admin/sections/${s.id}/items`)])));
onBackup({settings,sections,projects:projectDetails,sliders,sectionItems});
async function media(key:string){
 if(state.media[key])return state.media[key];
 const rel=content.assets[key];if(!rel)throw Error(`Missing image ${key}`);
 const res=await fetch(rel); if(!res.ok)throw Error('تعذر تحميل الصورة: '+key); const data=await res.arrayBuffer(); if(data.byteLength===0||data.byteLength>3*1024*1024)throw Error('حجم الصورة غير صالح: '+key); const form=new FormData();
 form.append('file',new Blob([data],{type:'image/webp'}),`la-real-${key}.webp`);
 const result=await api('/api/admin/media','POST',form);
 if(!Number.isInteger(result.id)||result.id<=0)throw Error('Unexpected media response.');
 state.media[key]=result.id;save();onProgress('تم رفع '+key);return result.id;
}
// Upload media once. Existing CMS content remains unchanged if an upload fails.
for(const key of Object.keys(content.assets))await media(key);
for(const p of content.projects){
 const old=projects.find((x:any)=>x.slug===p.slug);
 const body={...omit(p,['coverAsset','gallery']),coverMediaId:await media(p.coverAsset),assets:await Promise.all(p.gallery.map(async (a:any)=>({kind:'image',mediaId:await media(a.asset),captionAr:a.captionAr,captionEn:a.captionEn,sortOrder:a.sortOrder})))};
 let id=old?.id||state.projects[p.slug];
 if(id)await api(`/api/admin/projects/${id}`,'PUT',body);else{id=(await api('/api/admin/projects','POST',body)).id}
 state.projects[p.slug]=id;save();onProgress('تم حفظ '+p.titleAr);
}
for(const s of content.sections){
 const old=sections.find((x:any)=>x.sectionKey===s.sectionKey);
 const body={...omit(old||{},['id','items']),...omit(s,['items','imageAsset']),imageMediaId:s.imageAsset?await media(s.imageAsset):null};
 let id=old?.id||state.sections[s.sectionKey];
 if(id)await api(`/api/admin/sections/${id}`,'PUT',body);else{id=(await api('/api/admin/sections','POST',body)).id}
 state.sections[s.sectionKey]=id;save();
 if(s.items){
  const existing=await api(`/api/admin/sections/${id}/items`);const used=new Set<number>();
  for(let i=0;i<s.items.length;i++){
   const item=s.items[i];const key=`${s.sectionKey}:${item.titleEn}`;
   // Reuse matching item, then matching existing slot, so existing service URLs remain valid.
   const oldItem=existing.find((x:any)=>!used.has(x.id)&&x.titleEn===item.titleEn)||existing.find((x:any)=>!used.has(x.id)&&x.sortOrder===item.sortOrder)||existing.find((x:any)=>!used.has(x.id));
   const payload={...omit(oldItem||{},['id','websiteSectionId','websiteSection']),...omit(item,['imageAsset']),imageMediaId:item.imageAsset?await media(item.imageAsset):null};
   let itemId=oldItem?.id||state.items[key];
   if(itemId)await api(`/api/admin/sections/${id}/items/${itemId}`,'PUT',payload);else{itemId=(await api(`/api/admin/sections/${id}/items`,'POST',payload)).id}
   used.add(itemId);state.items[key]=itemId;save();
  }
  // Hide superseded entries rather than deleting records.
  for(const x of existing.filter((x:any)=>!used.has(x.id)&&x.isActive))await api(`/api/admin/sections/${id}/items/${x.id}`,'PUT',{...omit(x,['id','websiteSectionId','websiteSection']),isActive:false});
 }
 onProgress('تم تحديث '+s.titleAr);
}
// Use a new owned hero record; retain all earlier slider records in inactive state.
const hero={...omit(content.hero,['desktopImageAsset','mobileImageAsset']),desktopImageMediaId:await media(content.hero.desktopImageAsset),mobileImageMediaId:await media(content.hero.mobileImageAsset)};
if(state.heroId)await api(`/api/admin/sliders/${state.heroId}`,'PUT',hero);else{state.heroId=(await api('/api/admin/sliders','POST',hero)).id;await save()}
for(const s of sliders.filter((x:any)=>x.isActive&&x.id!==state.heroId))await api(`/api/admin/sliders/${s.id}`,'PUT',{...omit(s,['id']),isActive:false});
await api('/api/admin/site-settings','PUT',{...omit(settings,['id']),...content.settingsPatch});
// Retire only the three verified demo slugs, preserving their records and galleries.
for(const p of projects.filter((x:any)=>content.retireProjectSlugs.includes(x.slug))){const detail=projectDetails.find((x:any)=>x.project.id===p.id).project;await api(`/api/admin/projects/${p.id}`,'PUT',{...detail,isPublished:false,isFeatured:false,assets:detail.assets.map((a:any)=>omit(a,['id','constructionProjectId']))})}

 onProgress('اكتمل استيراد محتوى الشركة والصور.');
}
