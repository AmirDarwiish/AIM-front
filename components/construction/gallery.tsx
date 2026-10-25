'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Play, ArrowLeft, ArrowRight, ZoomIn } from 'lucide-react';
import { imageUrl, videoSource, type Project } from '@/lib/construction';
import type { Lang } from '@/lib/public-api';
function Video({url,poster,caption,lang}:{url:string;poster?:string;caption:string;lang:Lang}){
 const [playing,setPlaying]=useState(false);const source=videoSource(url);
 if(!source)return <p>{lang==='en'?'Video unavailable':'الفيديو غير متاح'}</p>;
 return <div className="la-video">{!playing?<button onClick={()=>setPlaying(true)} aria-label={`${lang==='en'?'Play':'تشغيل'} ${caption}`}>{imageUrl(poster)&&<img src={imageUrl(poster)} alt="" loading="lazy"/>}<span><Play size={28}/>{lang==='en'?'Watch video':'مشاهدة الفيديو'}</span></button>:source.type==='embed'?<iframe src={source.url} title={caption} allow="fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<video src={source.url} poster={imageUrl(poster)} controls playsInline preload="metadata"><track kind="captions"/>{lang==='en'?'Your browser cannot play this video.':'المتصفح لا يدعم الفيديو.'}</video>}</div>;
}
export default function Gallery({assets,lang}:{assets:NonNullable<Project['assets']>;lang:Lang}){
 const [selected,setSelected]=useState<number|null>(null);const dialog=useRef<HTMLDialogElement>(null);const images=assets.filter(a=>a.kind==='image'&&imageUrl(a.url));
 useEffect(()=>{if(selected!==null)dialog.current?.showModal();else dialog.current?.close();},[selected]);
 function move(delta:number){setSelected(current=>current===null?null:(current+delta+images.length)%images.length)}
 return <><div className="la-gallery">{assets.map(a=><figure key={a.id}>{a.kind==='video'&&a.url?<Video url={a.url} poster={a.posterUrl} caption={a.caption||'Project video'} lang={lang}/>:imageUrl(a.url)?<button className="la-gallery-image" onClick={()=>setSelected(images.findIndex(i=>i.id===a.id))} aria-label={`${lang==='en'?'Enlarge':'تكبير'} ${a.caption||''}`}><img src={imageUrl(a.url)} alt={a.caption|| (lang==='en'?'Project photograph':'صورة المشروع')} width="1200" height="900" loading="lazy" decoding="async"/><ZoomIn size={22}/></button>:null}{a.caption&&<figcaption>{a.caption}</figcaption>}</figure>)}</div><dialog ref={dialog} className="la-lightbox" aria-label={lang==='en'?'Project photographs':'صور المشروع'} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}} onKeyDown={e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1)}}><button className="la-lightbox-close" aria-label={lang==='en'?'Close':'إغلاق'} onClick={()=>setSelected(null)}><X/></button>{selected!==null&&images[selected]&&<><img src={imageUrl(images[selected].url)} alt={images[selected].caption||''}/><p>{images[selected].caption}</p><div><button aria-label={lang==='en'?'Previous image':'الصورة السابقة'} onClick={()=>move(-1)}><ArrowLeft/></button><span>{selected+1} / {images.length}</span><button aria-label={lang==='en'?'Next image':'الصورة التالية'} onClick={()=>move(1)}><ArrowRight/></button></div></>}</dialog></>;
}
