import type { HomeContent, Lang } from './public-api';
export type SiteContent = HomeContent & {contactEmail?:string;contactPhone?:string;whatsappUrl?:string;addressAr?:string;addressEn?:string;instagramUrl?:string;linkedinUrl?:string};
export type Project = {id:number;slug:string;title:string;summary?:string;description?:string;location?:string;category?:string;year?:number;coverUrl?:string;assets?:{id:number;kind:'image'|'video';url?:string;posterUrl?:string;caption?:string}[]};
export type ProjectPage = {items:Project[];totalCount:number;page:number;pageSize:number};
export const language = (value?:string):Lang => value === 'en' ? 'en' : 'ar';
export function imageUrl(value?:string){if(!value)return undefined;try{const u=new URL(value,'https://local.invalid');if(!['http:','https:'].includes(u.protocol))return undefined;return value.startsWith('/')&&!value.startsWith('//')?value:u.href;}catch{return undefined;}}
export function videoSource(value?:string):{type:'file'|'embed';url:string}|null{
 if(!value)return null;try{const u=new URL(value);if(u.protocol!=='https:')return null;
 const host=u.hostname;let id='';
 if(['youtube.com','www.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)){id=host==='youtu.be'?u.pathname.slice(1):u.pathname.startsWith('/embed/')?u.pathname.split('/')[2]:u.searchParams.get('v')||'';return /^[A-Za-z0-9_-]{11}$/.test(id)?{type:'embed',url:`https://www.youtube-nocookie.com/embed/${id}`} : null;}
 if(['vimeo.com','player.vimeo.com'].includes(host)){id=u.pathname.split('/').filter(Boolean).pop()||'';return /^\d+$/.test(id)?{type:'embed',url:`https://player.vimeo.com/video/${id}`} : null;}
 return /\.(mp4|webm)$/i.test(u.pathname)?{type:'file',url:u.href}:null;
 }catch{return null;}
}

export function linkUrl(value?:string){if(!value)return undefined;if((value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))||value.startsWith('#'))return value;try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:undefined;}catch{return undefined;}}

/** Keep the selected language when following a CMS link to a local page. */
export function localizedLink(value:string|undefined,lang:Lang){const safe=linkUrl(value);if(!safe)return undefined;if(!safe.startsWith('/')||safe.startsWith('//'))return safe;const url=new URL(safe,'https://local.invalid');url.searchParams.set('lang',lang);return url.pathname+url.search+url.hash;}
