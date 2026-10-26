import { seo } from '@/lib/seo';
import { siteData } from '@/lib/construction-server';
import { language, imageUrl } from '@/lib/construction';
import { section, contentParagraphs } from '@/lib/corporate-content';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import Unavailable from '@/components/construction/unavailable';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang),home=await siteData(lang),about=section(home,'la-about');return seo('/about',lang,lang==='en'?'About LA Construction | LA Construction':'عن الشركة | LA Construction',about?.description?.slice(0,160)||(lang==='en'?'Explore LA Construction services and discuss the scope of your next project.':'تعرف على LA Construction وخدمات البناء والتشطيبات والتجديد وناقش معنا نطاق مشروعك.'))}
export default async function About({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const lang=language((await searchParams).lang),en=lang==='en',home=await siteData(lang),about=section(home,'la-about'),story=section(home,'la-about-story'),values=section(home,'la-values');
 const photo=imageUrl(story?.imageUrl||about?.imageUrl);
 return <div className="la-site" dir={en?'ltr':'rtl'} lang={lang}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main>{!home?<Unavailable lang={lang} path="/about"/>:<><PageHero lang={lang} number="01" label={en?'About':'عن الشركة'} title={about?.title||(en?'About':'عن الشركة')} description={about?.subtitle}/>{(story||about?.description)&&<section className={`la-wrap la-company-story ${!photo?'la-story-text-only':''}`}>{photo&&<div className="la-company-photo"><img src={photo} alt={story?.title||about?.title||''} width="1000" height="900" loading="lazy"/></div>}<div>{story?.subtitle&&<span className="la-eyebrow">{story.subtitle}</span>}{story?.title&&<h2>{story.title}</h2>}<div className="la-prose">{contentParagraphs(story?.description||about?.description).map((p,i)=><p key={i}>{p}</p>)}</div></div></section>}{!!values?.items.length&&<section className="la-values-band"><div className="la-wrap">{values.subtitle&&<span className="la-eyebrow">{values.subtitle}</span>}{values.title&&<h2>{values.title}</h2>}<div className="la-values-grid">{values.items.map(item=><article key={item.id}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section>}</>}</main><Footer lang={lang}/></div>;
}
