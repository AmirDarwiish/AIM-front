import { language, imageUrl } from '@/lib/construction';
import { siteData } from '@/lib/construction-server';
import { seo } from '@/lib/seo';
import Header from '@/components/construction/header';
import Footer from '@/components/construction/footer';
import PageHero from '@/components/construction/page-hero';
import GuideLinks from '@/components/construction/guide-links';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang);return seo('/guides',lang,lang==='en'?'Construction & Renovation Guides | LA Construction':'أدلة التشطيب والتجديد والمقاولات | LA Construction',lang==='en'?'Practical advice on finishing quotations, renovation planning and turnkey project scopes.':'أدلة عملية لفهم عروض أسعار التشطيب والتخطيط للتجديد وتحديد نطاق أعمال تسليم مفتاح.');}
export default async function Guides({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang),en=lang==='en',home=await siteData(lang);return <div className="la-site" lang={lang} dir={en?'ltr':'rtl'}><Header lang={lang} logoUrl={imageUrl(home?.logoUrl)}/><main><PageHero lang={lang} number="05" label={en?'Project guides':'أدلة المشروع'} title={en?'Plan with a clearer picture.':'ابدأ مشروعك على أساس واضح.'} description={en?'Understand the decisions that shape your construction or renovation project.':'افهم القرارات اللي بتفرق في مشروع البناء أو التشطيب أو التجديد.'}/><GuideLinks lang={lang}/></main><Footer lang={lang}/></div>;}
