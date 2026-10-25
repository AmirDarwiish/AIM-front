import Link from 'next/link';
import type { Lang } from '@/lib/public-api';
export default function Footer({lang}:{lang:Lang}){return <footer className="la-footer"><Link href={`/?lang=${lang}`} className="la-brand"><img src="/assets/la-mark.svg" alt="" width="42" height="48"/><span><b>LA</b> CONSTRUCTION</span></Link><p>{lang==='en'?'Thoughtfully built. Made to endure.':'نبني بعناية. لنترك أثرًا يدوم.'}</p><small>© {new Date().getFullYear()} LA Construction</small></footer>}
