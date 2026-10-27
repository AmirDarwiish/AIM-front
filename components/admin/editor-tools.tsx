'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Circle, ArrowRight, ChevronRight, ChevronLeft, LoaderCircle } from 'lucide-react';
import s from './admin.module.css';
export function useUnsavedChanges(dirty:boolean){
 useEffect(()=>{window.dispatchEvent(new CustomEvent('la-admin-dirty',{detail:dirty}));const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>{window.removeEventListener('beforeunload',warn);window.dispatchEvent(new CustomEvent('la-admin-dirty',{detail:false}));};},[dirty]);
}
export function EditorTabs({tabs,value,onChange,disabled=false}:{disabled?:boolean;tabs:{id:string;label:string}[];value:string;onChange:(id:string)=>void}){return <div className={s.editorTabs} role="group" aria-label="خطوات تحرير المحتوى">{tabs.map((tab,i)=><button type="button" disabled={disabled} key={tab.id} aria-pressed={value===tab.id} className={value===tab.id?s.editorTabActive:undefined} onClick={()=>onChange(tab.id)}><span>{String(i+1).padStart(2,'0')}</span>{tab.label}</button>)}</div>;}
export function LanguageTabs({value,onChange}:{value:'Ar'|'En';onChange:(value:'Ar'|'En')=>void}){return <div className={s.languageTabs} role="group" aria-label="لغة المحتوى"><button type="button" aria-pressed={value==='Ar'} onClick={()=>onChange('Ar')}>العربية <small>AR</small></button><button type="button" aria-pressed={value==='En'} onClick={()=>onChange('En')}>English <small>EN</small></button></div>;}
export function Readiness({checks}:{checks:{label:string;done:boolean}[]}){return <ul className={s.readinessList}>{checks.map(check=><li key={check.label} data-done={check.done}>{check.done?<Check size={16}/>:<Circle size={15}/>}<span>{check.label}</span><small>{check.done?'مكتمل':'يحتاج مراجعة'}</small></li>)}</ul>;}
export function ContentPreview({title,subtitle,description,button,rtl=true}:{title:string;subtitle?:string;description?:string;button?:string;rtl?:boolean}){return <details className={s.previewPanel}><summary>معاينة النص قبل الحفظ</summary><div dir={rtl?'rtl':'ltr'} lang={rtl?'ar':'en'}>{subtitle&&<small>{subtitle}</small>}<h3>{title||'العنوان يظهر هنا'}</h3><p>{description||'أضف وصفًا واضحًا يساعد الزائر يفهم المحتوى.'}</p>{button&&<span>{button}</span>}</div><small>معاينة تحريرية للنص؛ تنسيق الصفحة النهائي يظهر في الموقع بعد الحفظ.</small></details>;}

export function useAdminNavigation(){const router=useRouter();return (href:string,force=false)=>{if(!force&&!window.dispatchEvent(new CustomEvent('la-admin-before-navigate',{cancelable:true,detail:href})))return;if(force)router.replace(href);else router.push(href);};}
export function EditorPage({title,children,onClose,dirty=false,busy=false}:{title:string;children:ReactNode;onClose:()=>void;dirty?:boolean;busy?:boolean}){
 useUnsavedChanges(dirty||busy);
 return <section className={s.recordPage}><div className={s.recordPageHeader}><button type="button" disabled={busy} className={s.backButton} onClick={onClose}><ArrowRight size={18}/>العودة للقائمة</button><span className={s.recordPageTitle}>{title}</span></div>{children}</section>;
}
export function VisibilityToggle({checked,onChange,disabled=false,busy=false,label}:{checked:boolean;onChange:()=>void;disabled?:boolean;busy?:boolean;label:string}){return <button type="button" role="switch" aria-checked={checked} aria-label={label} aria-busy={busy} disabled={disabled||busy} className={s.visibilityToggle} onClick={onChange}><span className={s.toggleTrack}><span className={s.toggleThumb}>{busy&&<LoaderCircle size={11} className={s.spin}/>}</span></span><span>{checked?'ظاهر':'مخفي'}</span></button>;}

export function TablePagination({page,pages,total,onChange,disabled=false}:{page:number;pages:number;total:number;onChange:(page:number)=>void;disabled?:boolean}){
 const visible=Array.from(new Set([1,page-1,page,page+1,pages])).filter(n=>n>=1&&n<=pages).sort((a,b)=>a-b);
 return <nav className={s.pagination} aria-label="صفحات الجدول"><span>{total.toLocaleString('ar-EG')} نتيجة · الصفحة {page} من {pages}</span><div><button type="button" className={s.secondary} disabled={disabled||page<=1} onClick={()=>onChange(page-1)}><ChevronRight size={14}/>السابق</button>{visible.map((n,i)=><span key={n}>{i>0&&n-visible[i-1]>1&&<span className={s.pageEllipsis}>…</span>}<button type="button" className={s.pageNumber} aria-label={`الصفحة ${n}`} aria-current={n===page?'page':undefined} disabled={disabled} onClick={()=>onChange(n)}>{n}</button></span>)}<button type="button" className={s.secondary} disabled={disabled||page>=pages} onClick={()=>onChange(page+1)}>التالي<ChevronLeft size={14}/></button></div></nav>;
}
