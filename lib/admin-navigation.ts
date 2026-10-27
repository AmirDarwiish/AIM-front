export type AdminResource='overview'|'projects'|'services'|'leads'|'sliders'|'sections'|'items'|'media'|'settings';
export type AdminRoute={resource:AdminResource;action:'list'|'new'|'edit'|'view';id?:number;sectionId?:number};
const collections=new Set(['projects','services','sliders','sections','media','leads']);
const id=(value?:string)=>value&&/^[1-9]\d*$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):undefined;
export function parseAdminRoute(path:string[]):AdminRoute|null{
 if(!path.length)return {resource:'overview',action:'list'};
 const [resource,...tail]=path;
 if(resource==='settings')return tail.length?null:{resource:'settings',action:'list'};
 if(!collections.has(resource))return null;
 if(resource==='sections'&&id(tail[0])&&tail[1]==='items'){
  const sectionId=id(tail[0])!;const rest=tail.slice(2);
  if(!rest.length)return {resource:'items',action:'list',sectionId};
  if(rest.length===1&&rest[0]==='new')return {resource:'items',action:'new',sectionId};
  if(id(rest[0])&&(rest.length===1||(rest.length===2&&rest[1]==='edit')))return {resource:'items',action:rest.length===1?'view':'edit',sectionId,id:id(rest[0])};
  return null;
 }
 const base=resource as AdminResource;
 if(!tail.length)return {resource:base,action:'list'};
 if(tail.length===1&&tail[0]==='new'&&resource!=='leads')return {resource:base,action:'new'};
 if(id(tail[0])&&tail.length===1)return {resource:base,action:'view',id:id(tail[0])};
 if(id(tail[0])&&tail.length===2&&tail[1]==='edit'&&!['leads','media'].includes(resource))return {resource:base,action:'edit',id:id(tail[0])};
 return null;
}
export function adminListPath(resource:AdminResource,sectionId?:number){return resource==='overview'?'/admin':resource==='items'?`/admin/sections/${sectionId}/items`:`/admin/${resource}`;}
export function adminRecordPath(route:AdminRoute,action:'new'|'edit'|'view',recordId?:number){const base=adminListPath(route.resource,route.sectionId);return action==='new'?`${base}/new`:`${base}/${recordId}${action==='edit'?'/edit':''}`;}
export const adminLabels:Record<AdminResource,string>={overview:'نظرة عامة',projects:'المشاريع',services:'خدمات الشركة',leads:'استفسارات المشاريع',sliders:'السلايدر الرئيسي',sections:'صفحات الموقع',items:'عناصر القسم',media:'مكتبة الوسائط',settings:'إعدادات الموقع'};
