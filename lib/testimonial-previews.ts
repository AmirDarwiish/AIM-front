import type {Item,Lang} from './public-api';

/** Explicitly illustrative samples requested for the empty showcase. CMS items replace them. */
export function testimonialPreviews(lang:Lang):Item[]{
 const en=lang==='en';
 const titles=en?['Clarity from the first step','Attention to detail','Following each stage','A space shaped around you']:['وضوح من أول خطوة','عناية بالتفاصيل','متابعة مراحل العمل','مساحة تشبه أصحابها'];
 return titles.map((title,index)=>({id:-100-index,title,subtitle:en?'Illustrative sample — not an actual client review':'نموذج توضيحي — ليس رأيًا لعميل حقيقي',imageUrl:`/assets/review-previews/review-${index+1}.svg`,sortOrder:index}));
}
