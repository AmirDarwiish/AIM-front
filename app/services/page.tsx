import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { section, serviceItems } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import Services from '@/components/construction/services';
import Cta from '@/components/construction/cta';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const en=(await searchParams).lang==='en';return {title:`${en?'Services':'الخدمات'} | LA Construction`,description:en?'Explore our construction, finishing and renovation services.':'تعرف على خدمات LA Construction في المقاولات والتشطيبات والتجديد.'}}
export default async function ServiceIndex({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const lang=language((await searchParams).lang),en=lang==='en',home=await siteData(lang),content=section(home,'la-services'),items=serviceItems(home,lang);
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main><PageHero lang={lang} number="02" label={en?'Services':'الخدمات'} title={content?.title||(en?'A considered approach.\nAt every stage.':'رؤية متكاملة.\nفي كل مرحلة.')} description={content?.description||(en?'From the first idea to the final detail.':'من أول فكرة حتى آخر لمسة.')}/><section className="la-wrap la-services-page">{items.length?<Services items={items} lang={lang} expanded/>:<p className="la-empty">{en?'Service information is being prepared.':'جاري تجهيز تفاصيل الخدمات.'}</p>}</section><Cta lang={lang}/></main><Footer lang={lang}/></div>;
}
