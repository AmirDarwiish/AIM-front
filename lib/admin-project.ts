export type ProjectAsset={kind:'image'|'video';mediaId:number|null;videoUrl:string|null;posterMediaId:number|null;captionAr:string;captionEn:string;sortOrder:number};
export type AdminProject={id?:number;slug:string;titleAr:string;titleEn:string;summaryAr:string;summaryEn:string;descriptionAr:string;descriptionEn:string;locationAr:string;locationEn:string;categoryAr:string;categoryEn:string;year:number|null;coverMediaId:number|null;sortOrder:number;isPublished:boolean;isFeatured:boolean;assets:ProjectAsset[]};
const text=(value:unknown)=>typeof value==='string'?value:'';
const positiveId=(value:unknown)=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null;
/** Optional API strings can be null, including on a newly saved draft. */
export function normalizeProject(input:unknown):AdminProject{
 const data=(input&&typeof input==='object'?input:{}) as Record<string,unknown>;
 const strings=Object.fromEntries(['slug','titleAr','titleEn','summaryAr','summaryEn','descriptionAr','descriptionEn','locationAr','locationEn','categoryAr','categoryEn'].map(key=>[key,text(data[key])])) as Pick<AdminProject,'slug'|'titleAr'|'titleEn'|'summaryAr'|'summaryEn'|'descriptionAr'|'descriptionEn'|'locationAr'|'locationEn'|'categoryAr'|'categoryEn'>;
 return {...strings,...(positiveId(data.id)?{id:positiveId(data.id)!}:{}),year:data.year===null||data.year===undefined||data.year===''?null:Number.isFinite(Number(data.year))?Number(data.year):null,coverMediaId:positiveId(data.coverMediaId),sortOrder:Number.isFinite(Number(data.sortOrder))?Number(data.sortOrder):0,isPublished:data.isPublished===true,isFeatured:data.isFeatured===true,assets:(Array.isArray(data.assets)?data.assets:[]).filter(a=>a&&typeof a==='object').map((a,i)=>({kind:a.kind==='video'?'video':'image',mediaId:positiveId(a.mediaId),videoUrl:text(a.videoUrl)||null,posterMediaId:positiveId(a.posterMediaId),captionAr:text(a.captionAr),captionEn:text(a.captionEn),sortOrder:Number.isFinite(Number(a.sortOrder))?Number(a.sortOrder):i}))};
}
export const newProject=()=>normalizeProject({});
export function publicationChecks(project:AdminProject){return [
 {key:'title',label:'عنوان المشروع بالعربية',done:!!project.titleAr.trim(),required:true,step:'copy'},
 {key:'slug',label:'رابط صفحة المشروع',done:/^[a-z0-9]+(-[a-z0-9]+)*$/.test(project.slug),required:true,step:'copy'},
 {key:'cover',label:'صورة الغلاف',done:!!project.coverMediaId,required:true,step:'media'},
 {key:'description',label:'وصف المشروع بالعربية',done:!!project.descriptionAr.trim(),required:true,step:'copy'},
 {key:'english',label:'النسخة الإنجليزية',done:!!project.titleEn.trim()&&!!project.descriptionEn.trim(),required:false,step:'copy'},
 {key:'location',label:'الموقع والتصنيف',done:!!project.locationAr.trim()&&!!project.categoryAr.trim(),required:false,step:'copy'}
 ];}
