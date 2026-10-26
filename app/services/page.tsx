import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { section, serviceItems } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import Services from '@/components/construction/services';
import Unavailable from '@/components/construction/unavailable';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang),home=await siteData(lang),s=section(home,'la-services');return {title:`${s?.title||(lang==='en'?'Services':'الخدمات')} | LA Construction`,description:s?.description?.slice(0,160)}}
export default async function ServiceIndex({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const lang=language((await searchParams).lang),en=lang==='en',home=await siteData(lang),content=section(home,'la-services'),items=serviceItems(home,lang);
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main>{!home?<Unavailable lang={lang} path="/services"/>:<><PageHero lang={lang} number="02" label={en?'Services':'الخدمات'} title={content?.title||(en?'Services':'الخدمات')} description={content?.description}/><section className="la-wrap la-services-page">{items.length?<Services items={items} lang={lang} expanded/>:<p className="la-empty">{en?'No services are published yet.':'لا توجد خدمات منشورة حاليًا.'}</p>}</section></>}</main><Footer lang={lang}/></div>;
}
