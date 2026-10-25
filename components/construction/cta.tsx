import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Lang } from '@/lib/public-api';
export default function Cta({lang}:{lang:Lang}){const en=lang==='en';return <section className="la-corporate-cta"><div className="la-wrap"><div><span className="la-eyebrow">{en?'LET’S BUILD WHAT COMES NEXT':'نبدأ من هنا'}</span><h2>{en?'A clear vision.\nA considered next step.':'رؤية واضحة.\nوخطوة تستحق البداية.'}</h2></div><Link className="la-button" href={`/contact?lang=${lang}`}>{en?'Discuss your project':'ناقش مشروعك معنا'}<ArrowUpRight size={20}/></Link></div></section>}
