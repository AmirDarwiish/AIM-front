import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { section, serviceItems } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import Contact from '@/components/construction/contact';
import CompanyDetails from '@/components/construction/company-details';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const en=(await searchParams).lang==='en';return {title:`${en?'Contact':'تواصل معنا'} | LA Construction`,description:en?'Tell LA Construction about your next project.':'تواصل مع LA Construction وشاركنا متطلبات مشروعك القادم.'}}
export default async function ContactPage({searchParams}:{searchParams:Promise<{lang?:string;service?:string}>}){
 const query=await searchParams,lang=language(query.lang),en=lang==='en',home=await siteData(lang),content=section(home,'la-contact'),services=serviceItems(home,lang),process=section(home,'la-process');
 const hasDetails=!!(home?.contactEmail||home?.contactPhone||home?.addressAr||home?.addressEn||home?.whatsappUrl||home?.instagramUrl||home?.linkedinUrl);
 const showAside=hasDetails||!!process?.items.length;
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main><PageHero lang={lang} number="04" label={en?'Contact':'تواصل معنا'} title={content?.title||(en?'Contact':'تواصل معنا')} description={content?.description}/><section className={`la-wrap la-contact-page ${!showAside?'la-contact-centered':''}`}>{showAside&&<aside>{hasDetails?<>{content?.subtitle&&<h2>{content.subtitle}</h2>}<CompanyDetails home={home} lang={lang}/></>:<div className="la-contact-guide">{process?.title&&<h2>{process.title}</h2>}<ol>{process?.items.slice(0,3).map(item=><li key={item.id}><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}</li>)}</ol></div>}</aside>}<div className="la-contact-panel"><h2>{en?'Tell us about your project':'احكي لنا عن مشروعك'}</h2><Contact lang={lang} enabled={!!home} services={services.map(s=>({id:String(s.id),title:s.title}))} initialService={services.some(s=>String(s.id)===query.service)?query.service:undefined}/></div></section></main><Footer lang={lang} showProjectLink={false}/></div>;
}
