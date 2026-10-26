'use client';
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {Pause,Play} from 'lucide-react';
import type {Lang} from '@/lib/public-api';

/** Progressive enhancement: desktop grids and server-rendered links stay intact. */
export default function MobileCards({children,count,label,lang,autoAdvance=false}:{children:ReactNode;count:number;label:string;lang:Lang;autoAdvance?:boolean}){
 const content=useRef<HTMLDivElement>(null),current=useRef(0);
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 const en=lang==='en';
 const pause=useCallback(()=>setPaused(true),[]);
 const move=useCallback((index:number)=>{
  const track=content.current?.firstElementChild as HTMLElement|null;
  if(!track||!window.matchMedia('(max-width:760px)').matches)return;
  const card=track.firstElementChild as HTMLElement|null;
  if(!card)return;
  const gap=Number.parseFloat(getComputedStyle(track).columnGap)||0;
  track.scrollTo({left:(en?1:-1)*index*(card.getBoundingClientRect().width+gap),behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 },[en]);

 useEffect(()=>{
  const track=content.current?.firstElementChild as HTMLElement|null;
  if(!track)return;
  const measure=()=>{
   const card=track.firstElementChild as HTMLElement|null;
   if(!card)return;
   const step=card.getBoundingClientRect().width+(Number.parseFloat(getComputedStyle(track).columnGap)||0);
   const index=Math.min(Math.max(count-1,0),Math.round(Math.abs(track.scrollLeft)/Math.max(step,1)));
   current.current=index;setActive(index);
  };
  track.addEventListener('scroll',measure,{passive:true});
  const observer=new ResizeObserver(measure);observer.observe(track);measure();
  return()=>{track.removeEventListener('scroll',measure);observer.disconnect()};
 },[count]);

 useEffect(()=>{
  if(!autoAdvance||paused||count<2)return;
  const node=content.current;if(!node)return;
  const mobile=window.matchMedia('(max-width:760px)'),reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  let visible=false;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.5},{threshold:[0,.5]});
  observer.observe(node);
  const timer=window.setInterval(()=>{
   if(mobile.matches&&!reduced.matches&&visible&&document.visibilityState==='visible')move((current.current+1)%count);
  },4000);
  return()=>{window.clearInterval(timer);observer.disconnect()};
 },[autoAdvance,paused,count,move]);

 return <div className="la-mobile-cards" role="group" aria-label={label} data-count={count} data-mobile-autoplay={autoAdvance?'true':'false'}>
  <div className="la-mobile-card-content" ref={content} onPointerDownCapture={pause} onWheelCapture={pause} onFocusCapture={pause} onKeyDown={event=>{
   if(!window.matchMedia('(max-width:760px)').matches||!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();pause();const next=en?event.key==='ArrowRight':event.key==='ArrowLeft';move(Math.max(0,Math.min(count-1,current.current+(next?1:-1))));
  }}>{children}</div>
  {count>1&&<div className="la-mobile-card-controls">
   <div className="la-mobile-card-dots" aria-label={en?'Choose a card':'اختيار كارت'}>{Array.from({length:count},(_,index)=><button key={index} type="button" aria-label={`${en?'Show card':'عرض الكارت'} ${index+1}`} aria-current={active===index?'true':undefined} onClick={()=>{pause();move(index)}}><span/></button>)}</div>
   <span className="la-mobile-card-position" dir="ltr">{active+1} / {count}</span>
   {autoAdvance&&<button className="la-mobile-card-play" type="button" aria-label={paused?(en?'Resume automatic project slides':'تشغيل التنقل التلقائي للمشاريع'):(en?'Pause automatic project slides':'إيقاف التنقل التلقائي للمشاريع')} aria-pressed={!paused} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}
  </div>}
 </div>;
}
