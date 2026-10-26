import { SITE_URL, pageUrl, jsonLd } from '@/lib/seo';
import { imageUrl, linkUrl, type SiteContent } from '@/lib/construction';
import { serviceItems } from '@/lib/corporate-content';
import type { Lang } from '@/lib/public-api';
export default function StructuredData({home,lang}:{home:SiteContent;lang:Lang}){
 const services=serviceItems(home,lang);
 const data={'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':`${SITE_URL}/#organization`,name:'LA Construction',url:SITE_URL,...(imageUrl(home.logoUrl)?{logo:imageUrl(home.logoUrl)}:{}),...(home.contactPhone?{telephone:home.contactPhone}:{}),...(home.contactEmail?{email:home.contactEmail}:{}),sameAs:[home.instagramUrl,home.linkedinUrl].filter(x=>linkUrl(x))},
 {'@type':'WebSite','@id':`${SITE_URL}/#website`,name:'LA Construction',url:SITE_URL,inLanguage:['ar','en'],publisher:{'@id':`${SITE_URL}/#organization`}},
 ...services.map(s=>({'@type':'Service',name:s.title,description:s.description,url:pageUrl(`/services/${s.id}`,lang),provider:{'@id':`${SITE_URL}/#organization`}}))]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(data)}}/>;
}
