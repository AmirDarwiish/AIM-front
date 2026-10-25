import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl } from '@/lib/construction';
import type { Item, Lang } from '@/lib/public-api';
export default function Services({items,lang,expanded=false}:{items:Item[];lang:Lang;expanded?:boolean}){return <div className={expanded?'la-services-catalogue':'la-service-grid'}>{items.map((item,i)=><article key={item.id}>{expanded&&imageUrl(item.imageUrl)&&<Link className="la-service-cover" href={`/services/${item.id}?lang=${lang}`}><img src={imageUrl(item.imageUrl)} alt={item.title} width="1000" height="700" loading="lazy"/></Link>}<div><span className="la-service-number">{String(i+1).padStart(2,'0')}</span><h3><Link href={`/services/${item.id}?lang=${lang}`}>{item.title}</Link></h3><p>{item.description}</p><Link className="la-text-link" href={`/services/${item.id}?lang=${lang}`}>{lang==='en'?'Explore this service':'تفاصيل الخدمة'}<ArrowUpRight size={19}/></Link></div></article>)}</div>}
