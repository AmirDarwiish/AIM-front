'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Play, ArrowLeft, ArrowRight, ZoomIn } from 'lucide-react';
import { imageUrl, videoSource, type Project } from '@/lib/construction';
import { galleryKeyStep, gallerySwipeStep } from '@/lib/gallery-navigation';
import type { Lang } from '@/lib/public-api';
export function Video({url,poster,caption,lang,startOpen=false}:{url:string;poster?:string;caption:string;lang:Lang;startOpen?:boolean}){
 const [playing,setPlaying]=useState(startOpen);const source=videoSource(url);
 if(!source)return <p>{lang==='en'?'Video unavailable':'الفيديو غير متاح'}</p>;
 return <div className="la-video">{!playing?<button onClick={()=>setPlaying(true)} aria-label={`${lang==='en'?'Play':'تشغيل'} ${caption}`}>{imageUrl(poster)&&<img src={imageUrl(poster)} alt="" loading="lazy"/>}<span><Play size={28}/>{lang==='en'?'Watch video':'مشاهدة الفيديو'}</span></button>:source.type==='embed'?<iframe src={source.url} title={caption} allow="fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<video src={source.url} poster={imageUrl(poster)} controls playsInline preload="metadata"><track kind="captions"/>{lang==='en'?'Your browser cannot play this video.':'المتصفح لا يدعم الفيديو.'}</video>}</div>;
}
type Assets=NonNullable<Project['assets']>;
export default function Gallery({assets,previewAssets=assets,lang,cover=false,inline=false,showCaptions=true}:{assets:Assets;previewAssets?:Assets;lang:Lang;cover?:boolean;inline?:boolean;showCaptions?:boolean}){
 const [selected,setSelected]=useState<number|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),touch=useRef<{x:number;y:number}|null>(null);
 const images=previewAssets.filter(a=>a.kind==='image'&&imageUrl(a.url));
 const en=lang==='en',current=selected===null?null:images[selected];
 const open=selected!==null;
 useEffect(()=>{const modal=dialog.current;if(open&&!modal?.open)modal?.showModal();else if(!open&&modal?.open)modal.close();},[open]);
 useEffect(()=>{if(!open)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=before}},[open]);
 function move(delta:number){if(images.length<2)return;setSelected(value=>value===null?null:(value+delta+images.length)%images.length)}
 function show(asset:Assets[number]){const index=images.findIndex(i=>i.id===asset.id&&i.url===asset.url);if(index>=0)setSelected(index)}
 return <><div className={inline?'la-inline-gallery':cover?'la-cover-gallery':'la-gallery'} data-count={assets.length}>
  {assets.map(a=><figure key={a.id}>{a.kind==='video'&&a.url?<Video url={a.url} poster={a.posterUrl} caption={a.caption||(en?'Project video':'فيديو المشروع')} lang={lang}/>:imageUrl(a.url)?<button type="button" className="la-gallery-image" onClick={()=>show(a)} aria-label={`${en?'Enlarge':'تكبير'} ${a.caption||''}`} aria-haspopup="dialog"><img src={imageUrl(a.url)} alt={a.caption||(en?'Project photograph':'صورة المشروع')} width="1200" height="900" loading={cover?'eager':'lazy'} fetchPriority={cover?'high':undefined} decoding="async"/><ZoomIn size={22} aria-hidden="true"/></button>:null}{a.caption&&!inline&&showCaptions&&<figcaption>{a.caption}</figcaption>}</figure>)}
 </div><dialog ref={dialog} className="la-lightbox" dir={en?'ltr':'rtl'} aria-label={en?'Project photographs':'صور المشروع'} onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)} onClick={event=>{if(event.target===event.currentTarget)setSelected(null)}} onKeyDown={event=>{const delta=galleryKeyStep(event.key,lang);if(delta&&images.length>1){event.preventDefault();event.stopPropagation();move(delta)}}}>
  <button type="button" className="la-lightbox-close" aria-label={en?'Close':'إغلاق'} onClick={()=>setSelected(null)}><X aria-hidden="true"/></button>
  {current&&<><div className="la-lightbox-stage" onTouchStart={event=>{const p=event.touches[0];touch.current=p?{x:p.clientX,y:p.clientY}:null}} onTouchEnd={event=>{const start=touch.current,p=event.changedTouches[0];touch.current=null;if(start&&p){const delta=gallerySwipeStep(p.clientX-start.x,p.clientY-start.y,lang);if(delta)move(delta)}}}>
   <img key={current.url} src={imageUrl(current.url)} alt={current.caption||(en?'Project photograph':'صورة المشروع')} decoding="async"/>
   {images.length>1&&<><button type="button" className="la-lightbox-prev" aria-label={en?'Previous image':'الصورة السابقة'} onClick={()=>move(-1)}>{en?<ArrowLeft aria-hidden="true"/>:<ArrowRight aria-hidden="true"/>}</button><button type="button" className="la-lightbox-next" aria-label={en?'Next image':'الصورة التالية'} onClick={()=>move(1)}>{en?<ArrowRight aria-hidden="true"/>:<ArrowLeft aria-hidden="true"/>}</button></>}
  </div><div className="la-lightbox-info" aria-live="polite" aria-atomic="true"><p>{current.caption}</p><bdi dir="ltr">{(selected??0)+1} / {images.length}</bdi></div></>}
 </dialog></>;
}
