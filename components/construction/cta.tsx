import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { siteData } from '@/lib/construction-server';
import { section } from '@/lib/corporate-content';
import { imageUrl, linkUrl } from '@/lib/construction';
import type { Section, Lang } from '@/lib/public-api';
export function CtaContent({content,lang}:{content:Section;lang:Lang}){if(!content.title)return null;return <section className="la-corporate-cta"><div className="la-wrap"><div>{content.subtitle&&<span className="la-eyebrow">{content.subtitle}</span>}<h2>{content.title}</h2>{content.description&&<p>{content.description}</p>}</div><Link className="la-button" href={linkUrl(content.buttonUrl)||`/contact?lang=${lang}`}>{content.buttonText||(lang==='en'?'Contact':'تواصل معنا')}<ArrowUpRight size={20}/></Link></div></section>}
export default async function Cta({lang}:{lang:Lang}){const home=await siteData(lang),content=section(home,'la-cta');return content?<CtaContent content={content} lang={lang}/>:null;}
