'use client';
import {useEffect,useRef,useState} from 'react';
import {Globe,Building2,Users,ClipboardList} from 'lucide-react';
import type {Lang,PlatformStatistics} from '@/lib/public-api';

function Counter({value,lang}:{value?:number|null;lang:Lang}){
 const target=typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:null;
 const ref=useRef<HTMLElement>(null);
 const [visible,setVisible]=useState(false),[count,setCount]=useState(0);
 useEffect(()=>{const element=ref.current;if(!element)return;if(!('IntersectionObserver' in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect()}},{threshold:.25});observer.observe(element);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!visible||target===null)return;const media=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=0;const start=performance.now();const finish=()=>{if(media.matches){cancelAnimationFrame(frame);setCount(target)}};if(media.matches)setCount(target);else{const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1100);setCount(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)}media.addEventListener('change',finish);return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',finish)}},[visible,target]);
 const format=new Intl.NumberFormat(lang==='ar'?'ar-EG':'en-US');
 return <strong ref={ref} className="stat-number"><span aria-hidden="true">{target===null?'—':format.format(count)}</span><span className="sr-only">{target===null?(lang==='ar'?'الإحصائية غير متاحة حاليًا':'Statistic currently unavailable'):format.format(target)}</span></strong>;
}
export function PlatformStats({statistics,lang}:{statistics?:PlatformStatistics|null;lang:Lang}){
 const ar=lang==='ar';
 const items=[
  {key:'availableCountries',label:ar?'دول يتوفر فيها التطبيق':'Countries available',icon:Globe},
  {key:'registeredBusinesses',label:ar?'أنشطة مسجلة':'Registered businesses',icon:Building2},
  {key:'users',label:ar?'مستخدمون':'Users',icon:Users},
  {key:'requests',label:ar?'طلبات':'Requests',icon:ClipboardList},
 ] as const;
 return <section className="stats-band" aria-label={ar?'All in Map بالأرقام':'All in Map in numbers'}><div className="section stats-grid">{items.map(({key,label,icon:Icon})=><div className="stat-cell" key={key}><span className="stat-icon" aria-hidden="true"><Icon size={21} strokeWidth={1.5}/></span><Counter value={statistics?.[key]} lang={lang}/><h3>{label}</h3></div>)}</div></section>;
}
