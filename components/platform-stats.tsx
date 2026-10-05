'use client';
import {useEffect,useRef,useState} from 'react';
import {Globe,Building2,Users,ClipboardList} from 'lucide-react';
import styles from './platform-stats.module.css';
import type {Lang,PlatformStatistics} from '@/lib/public-api';

function Counter({value,lang}:{value?:number|null;lang:Lang}){
 const target=typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:null;
 const ref=useRef<HTMLElement>(null);
 const [visible,setVisible]=useState(false),[count,setCount]=useState(0);
 useEffect(()=>{const element=ref.current;if(!element)return;if(!('IntersectionObserver' in window)){setVisible(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect()}},{threshold:.25});observer.observe(element);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!visible||target===null)return;const media=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=0;const start=performance.now();const finish=()=>{if(media.matches){cancelAnimationFrame(frame);setCount(target)}};if(media.matches)setCount(target);else{const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1100);setCount(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)}media.addEventListener('change',finish);return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',finish)}},[visible,target]);
 const format=new Intl.NumberFormat('en-US');
 return <strong ref={ref} className={styles.number}><span aria-hidden="true">{target===null?'—':format.format(count)}</span><span className={styles.srOnly}>{target===null?(lang==='ar'?'الإحصائية غير متاحة حاليًا':'Statistic currently unavailable'):format.format(target)}</span></strong>;
}
export function PlatformStats({statistics,lang}:{statistics?:PlatformStatistics|null;lang:Lang}){
 const ar=lang==='ar';
 const preview:PlatformStatistics={availableCountries:3,registeredBusinesses:1200,users:8500,requests:16000};
 const live=!!statistics&&['availableCountries','registeredBusinesses','users','requests'].every(key=>{const v=statistics[key as keyof PlatformStatistics];return typeof v==='number'&&Number.isSafeInteger(v)&&v>=0});
 const totals=live?statistics:preview;
 const items=[
  {key:'availableCountries',label:ar?'دول يتوفر فيها التطبيق':'Countries available',icon:Globe},
  {key:'registeredBusinesses',label:ar?'أنشطة مسجلة':'Registered businesses',icon:Building2},
  {key:'users',label:ar?'مستخدمون':'Users',icon:Users},
  {key:'requests',label:ar?'طلبات':'Requests',icon:ClipboardList},
 ] as const;
 return <section className={styles.band} aria-label={ar?'All in Map بالأرقام':'All in Map in numbers'}><div className={styles.grid}>{items.map(({key,label,icon:Icon})=><div className={styles.cell} key={key}><span className={styles.icon} aria-hidden="true"><Icon size={21} strokeWidth={1.5}/></span><Counter value={totals?.[key]} lang={lang}/><h3>{label}</h3></div>)}</div>{!live&&<p className={styles.preview}>{ar?'أرقام توضيحية':'Illustrative figures'}</p>}</section>;
}
