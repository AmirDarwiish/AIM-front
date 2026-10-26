'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, ZoomIn, X } from 'lucide-react';
import { imageUrl, videoSource } from '@/lib/construction';
import { Video } from './gallery';
import type { Item, Lang } from '@/lib/public-api';
export default function MediaCarousel({title,items,lang,kind='testimonials'}:{title:string;items:Item[];lang:Lang;kind?:'testimonials'|'films'}){
 const track=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null);const [selected,setSelected]=useState<Item|null>(null),[ends,setEnds]=useState({start:true,end:items.length<=1});const en=lang==='en';const pausedUntil=useRef(0),hovered=useRef(false);
 useEffect(()=>{const el=track.current;if(!el)return;const check=()=>setEnds({start:Math.abs(el.scrollLeft)<3,end:Math.abs(el.scrollLeft)>=el.scrollWidth-el.clientWidth-3});check();el.addEventListener('scroll',check,{passive:true});const observer=new ResizeObserver(check);observer.observe(el);return()=>{observer.disconnect();el.removeEventListener('scroll',check)}},[items.length]);
 useEffect(()=>{const modal=dialog.current;if(!selected){modal?.close();return;}const previous=document.body.style.overflow;document.body.style.overflow='hidden';modal?.showModal();return()=>{modal?.close();document.body.style.overflow=previous}},[selected]);
 // All media rails advance on a quiet timer, pausing while read, focused or opened.
 useEffect(()=>{
  const el=track.current;if(!el||selected||items.length<2)return;
  let visible=false;const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.5},{threshold:[0,.5]});observer.observe(el);
  const timer=window.setInterval(()=>{
   if(!visible||reduced.matches||document.visibilityState!=='visible'||Date.now()<pausedUntil.current||hovered.current||el.parentElement?.contains(document.activeElement))return;
   const max=el.scrollWidth-el.clientWidth;if(max<3)return;
   const card=el.firstElementChild as HTMLElement|null;
   const distance=(card?.getBoundingClientRect().width||el.clientWidth)+(Number.parseFloat(getComputedStyle(el).columnGap)||0);
   if(Math.abs(el.scrollLeft)>=max-3)el.scrollTo({left:0,behavior:'smooth'});
   else el.scrollBy({left:(en?1:-1)*distance,behavior:'smooth'});
  },4000);
  return()=>{window.clearInterval(timer);observer.disconnect()};
 },[items.length,en,selected]);
 function pause(){pausedUntil.current=Date.now()+8000}
 function step(next:boolean){const el=track.current;if(!el)return;const card=el.firstElementChild as HTMLElement|null;const distance=(card?.getBoundingClientRect().width||el.clientWidth)+(Number.parseFloat(getComputedStyle(el).columnGap)||0);el.scrollBy({left:(next?1:-1)*(en?1:-1)*distance,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 return <div className={`la-media-carousel la-media-${kind}`} onPointerDownCapture={pause} onWheelCapture={pause} onFocusCapture={pause} onPointerEnter={event=>{if(event.pointerType==='mouse')hovered.current=true}} onPointerLeave={()=>{hovered.current=false}}><div className="la-carousel-controls"><div><button type="button" disabled={ends.start} aria-label={en?'Previous':'السابق'} onClick={()=>step(false)}>{en?<ArrowLeft size={20}/>:<ArrowRight size={20}/>}</button><button type="button" disabled={ends.end} aria-label={en?'Next':'التالي'} onClick={()=>step(true)}>{en?<ArrowRight size={20}/>:<ArrowLeft size={20}/>}</button></div></div><div ref={track} className="la-carousel-track" data-count={items.length} role="list" aria-label={title} tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(en?e.key==='ArrowRight':e.key==='ArrowLeft')}}}>{items.map(item=>{const hasVideo=!!videoSource(item.videoUrl),photo=imageUrl(item.imageUrl),hasMedia=hasVideo||!!photo;return <article key={item.id} className={`la-story-card ${!hasMedia?'la-story-card-text':''}`} role="listitem">{hasMedia&&<button className={`la-story-preview ${hasVideo?'is-video':''}`} onClick={()=>setSelected(item)} aria-label={`${hasVideo?(en?'Watch':'مشاهدة'):(en?'Enlarge':'تكبير')} ${item.title}`}>{photo?<img src={photo} alt={item.title} width="720" height="900" loading="lazy" decoding="async"/>:<span className="la-film-placeholder" aria-hidden="true">LA<br/>CONSTRUCTION</span>}<span className="la-preview-action">{hasVideo?<Play size={22}/>:<ZoomIn size={22}/>}<span>{hasVideo?(en?'Watch video':'شاهد الفيديو'):(en?'View review':'عرض الرأي')}</span></span></button>}<div className="la-story-card-body">{item.description&&<blockquote>{item.description}</blockquote>}<div className="la-story-attribution"><h3>{item.title}</h3>{item.subtitle&&<p>{item.subtitle}</p>}</div>{!hasMedia&&item.description&&<button className="la-text-link" onClick={()=>setSelected(item)}>{en?'Read review':'قراءة الرأي'}</button>}{item.projectSlug&&<Link className="la-text-link" href={`/projects/${encodeURIComponent(item.projectSlug)}?lang=${lang}`}>{en?'View project':'شاهد المشروع'}{en?<ArrowRight size={17}/>:<ArrowLeft size={17}/>}</Link>}</div></article>})}</div><dialog ref={dialog} className="la-media-dialog" aria-label={selected?.title||(en?'Client story':'تجربة عميل')} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="la-media-dialog-heading"><h2>{selected?.title}</h2><button onClick={()=>setSelected(null)} aria-label={en?'Close':'إغلاق'}><X size={22}/></button></div>{selected&&(videoSource(selected.videoUrl)?<Video key={selected.id} url={selected.videoUrl!} poster={selected.imageUrl} caption={selected.title} lang={lang} startOpen/>:imageUrl(selected.imageUrl)?<img src={imageUrl(selected.imageUrl)} alt={selected.title}/>:null)}{selected?.description&&<p>{selected.description}</p>}</dialog></div>;
}
