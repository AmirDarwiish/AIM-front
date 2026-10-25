import Link from 'next/link';
import type { Lang } from '@/lib/public-api';
export default function Unavailable({lang,path='/'}:{lang:Lang;path?:string}){return <div className="la-wrap la-content-status" role="status"><h1>{lang==='en'?'Content is temporarily unavailable':'المحتوى غير متاح حاليًا'}</h1><p>{lang==='en'?'Please try again shortly.':'يرجى المحاولة مرة أخرى بعد قليل.'}</p><Link href={`${path}?lang=${lang}`} className="la-text-link">{lang==='en'?'Try again':'إعادة المحاولة'}</Link></div>}
