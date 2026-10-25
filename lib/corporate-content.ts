import type { SiteContent } from './construction';
import type { Lang, Item } from './public-api';
export const section = (home:SiteContent|null,key:string)=>home?.sections.find(s=>s.sectionKey===key);
export function serviceItems(home:SiteContent|null,lang:Lang):Item[]{
 const configured=section(home,'la-services');if(home)return configured?.items||[];
 const en=lang==='en';return [
 {id:1,title:en?'Construction':'المقاولات والإنشاءات',description:en?'A clear approach to construction, from the structural framework to the final detail. We discuss your requirements, define the scope and coordinate the stages of execution.':'تنفيذ متكامل للأعمال الإنشائية، من الهيكل وحتى أدق تفاصيل التنفيذ. نناقش متطلبات المشروع ونحدد نطاق الأعمال ومراحل التنفيذ بوضوح.',sortOrder:0},
 {id:2,title:en?'Finishing & interiors':'التشطيبات والديكور',description:en?'Considered materials and careful execution for spaces that reflect your needs. Our approach connects the details, finishes and practical use of every space.':'خامات مدروسة وتنفيذ دقيق لمساحات تعكس احتياجاتك. نهتم بتناسق التفاصيل والتشطيبات مع الاستخدام العملي لكل مساحة.',sortOrder:1},
 {id:3,title:en?'Renovation & development':'التجديد والتطوير',description:en?'A fresh perspective on existing spaces. We begin by understanding the space, then discuss the changes and priorities that will shape its next chapter.':'رؤية جديدة للمساحات القائمة. نبدأ بفهم الوضع الحالي، ثم نناقش التعديلات والأولويات التي تصنع قيمة للمكان.',sortOrder:2}];
}
export function contentParagraphs(value?:string){return (value||'').split(/\n\s*\n/).filter(Boolean);}
