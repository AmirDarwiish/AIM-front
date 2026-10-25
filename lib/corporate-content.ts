import type { SiteContent } from './construction';
import type { Lang, Item } from './public-api';
export const section = (home:SiteContent|null,key:string)=>home?.sections.find(s=>s.sectionKey===key);
export function serviceItems(home:SiteContent|null,_lang:Lang):Item[]{return section(home,'la-services')?.items||[];}
export function contentParagraphs(value?:string){return (value||'').split(/\n\s*\n/).filter(Boolean);}
