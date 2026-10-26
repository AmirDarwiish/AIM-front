import type { Metadata } from 'next';
import type { Lang } from './public-api';
export const SITE_URL = 'https://la-construction.online';
export function pageUrl(path:string,lang:Lang='ar',page?:number){
 const url=new URL(path,SITE_URL);
 if(lang==='en')url.searchParams.set('lang','en');
 if(page&&page>1)url.searchParams.set('page',String(page));
 return url.href;
}
export function seo(path:string,lang:Lang,title:string,description:string,image?:string,page?:number):Metadata{
 const canonical=pageUrl(path,lang,page);
 return {title,description,alternates:{canonical,languages:{ar:pageUrl(path,'ar',page),en:pageUrl(path,'en',page),'x-default':pageUrl(path,'ar',page)}},openGraph:{type:'website',siteName:'LA Construction',title,description,url:canonical,locale:lang==='en'?'en_US':'ar_EG',alternateLocale:lang==='en'?'ar_EG':'en_US',...(image?{images:[{url:image,alt:title}]}:{})},twitter:{card:image?'summary_large_image':'summary',title,description,...(image?{images:[image]}:{})}};
}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
