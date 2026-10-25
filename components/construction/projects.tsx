import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl, type Project } from '@/lib/construction';
import type { Lang } from '@/lib/public-api';
export default function Projects({items,lang,featured=false}:{items:Project[];lang:Lang;featured?:boolean}){return <div className={`la-project-grid ${featured?'la-featured-grid':''}`} data-count={items.length}>{items.map((p,i)=><Link href={`/projects/${encodeURIComponent(p.slug)}?lang=${lang}`} className="la-project-card" key={p.id}><div className="la-project-image">{imageUrl(p.coverUrl)?<img src={imageUrl(p.coverUrl)} alt={p.title} width="1000" height="750" loading="lazy" decoding="async"/>:<span>LA / {String(i+1).padStart(2,'0')}</span>}<span className="la-project-arrow"><ArrowUpRight size={23}/></span></div><div className="la-project-meta"><span>{p.category}</span><span>{p.year}</span></div><h3>{p.title}</h3>{p.location&&<p>{p.location}</p>}</Link>)}</div>}
