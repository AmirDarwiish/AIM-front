'use client';
import { Check, Circle, Image as ImageIcon, ArrowLeft, MapPin, CalendarDays, Layers } from 'lucide-react';
import type { MediaRecord } from '@/lib/admin-api';
import { publicationChecks, type AdminProject } from '@/lib/admin-project';
import { safeUrl } from '@/lib/public-api';
import { LanguageTabs, VisibilityToggle } from './editor-tools';
import s from './admin.module.css';
export default function ProjectReview({project,media,locale,onLocale,onUpdate,onStep}:{project:AdminProject;media:MediaRecord[];locale:'Ar'|'En';onLocale:(value:'Ar'|'En')=>void;onUpdate:(key:string,value:unknown)=>void;onStep:(step:string)=>void}){
 const checks=publicationChecks(project),required=checks.filter(c=>c.required),missing=required.filter(c=>!c.done);
 const cover=safeUrl(media.find(m=>m.id===project.coverMediaId)?.url);
 const title=project[`title${locale}`],summary=project[`summary${locale}`],description=project[`description${locale}`],location=project[`location${locale}`],category=project[`category${locale}`];
 return <div className={s.projectReviewGrid}>
  <section className={s.projectPreviewPanel} aria-label="معاينة المشروع قبل الحفظ">
   <div className={s.reviewHeading}><div><span className={s.eyebrow}>PROJECT PREVIEW</span><h2>معاينة المشروع</h2></div><span className={s.previewLabel}>قبل الحفظ</span></div>
   <LanguageTabs value={locale} onChange={onLocale}/>
   <article className={s.projectPreview} dir={locale==='En'?'ltr':'rtl'} lang={locale==='En'?'en':'ar'}>
    {cover?<img className={s.projectPreviewCover} src={cover} alt={title||'غلاف المشروع'}/>:<div className={s.projectPreviewEmpty}><ImageIcon size={30}/><strong>{project.coverMediaId?'تم تحديد الغلاف':'أضف صورة غلاف للمشروع'}</strong><span>{project.coverMediaId?'اختر الملف من المكتبة لإظهار معاينته.':'الغلاف يظهر للزائر في بطاقة المشروع.'}</span><button type="button" onClick={()=>onStep('media')}>اختيار الغلاف<ArrowLeft size={15}/></button></div>}
    <div className={s.projectPreviewCopy}><span className={s.eyebrow}>{category||'LA CONSTRUCTION'}</span><h3>{title||(locale==='En'?'Project title':'عنوان المشروع يظهر هنا')}</h3>{summary&&<p className={s.projectPreviewSummary}>{summary}</p>}<div className={s.projectPreviewFacts}>{location&&<span><MapPin size={14}/>{location}</span>}{project.year&&<span><CalendarDays size={14}/>{project.year}</span>}{project.assets.length>0&&<span><Layers size={14}/>{project.assets.length} {locale==='En'?'gallery items':'ملف في المعرض'}</span>}</div>{description?<p className={s.projectPreviewDescription}>{description.length>700?`${description.slice(0,700)}…`:description}</p>:<p className={s.hint}>{locale==='En'?'Add the project description in the details step.':'أضف وصف المشروع من خطوة بيانات المشروع.'}</p>}</div>
   </article>
   <p className={s.reviewNote}>المعاينة تستخدم البيانات الحالية. التغييرات تظهر على الموقع بعد الحفظ والنشر.</p>
  </section>
  <aside className={s.projectPublishPanel} aria-label="إعدادات نشر المشروع">
   <span className={s.eyebrow}>PUBLISH SETTINGS</span><h2>إعدادات النشر</h2><p className={s.publishIntro}>راجع ظهور المشروع قبل الحفظ.</p>
   <div className={s.publishControl}><div><strong>نشر على الموقع</strong><small>إتاحته للزوار في صفحة المشاريع.</small></div><VisibilityToggle checked={project.isPublished} label="نشر المشروع على الموقع" onChange={()=>onUpdate('isPublished',!project.isPublished)}/></div>
   <div className={s.publishControl}><div><strong>مشروع مميز</strong><small>عرضه في الرئيسية عند نشره.</small></div><VisibilityToggle checked={project.isFeatured} label="تمييز المشروع في الرئيسية" onChange={()=>onUpdate('isFeatured',!project.isFeatured)}/></div>
   <div className={`${s.publishReadiness} ${missing.length?s.publishIncomplete:s.publishReady}`} role="status"><strong>{missing.length?`متبقي ${missing.length} ${missing.length===1?'متطلب':'متطلبات'} للنشر`:'المشروع جاهز للنشر'}</strong><span>{missing.length?'استكمل المطلوب أو احفظه كمسودة.':'تأكد من تفعيل النشر ثم احفظ المشروع.'}</span></div>
   <h3 className={s.checkGroupTitle}>متطلبات النشر</h3><ul className={s.publishChecks}>{required.map(check=><li key={check.key} data-done={check.done}>{check.done?<Check size={16}/>:<Circle size={15}/>}<span>{check.label}</span>{!check.done&&<button type="button" onClick={()=>{onLocale('Ar');onStep(check.step);}}>استكمال</button>}</li>)}</ul>
   <details className={s.optionalChecks}><summary>تحسينات اختيارية</summary><ul className={s.publishChecks}>{checks.filter(c=>!c.required).map(check=><li key={check.key} data-done={check.done}>{check.done?<Check size={16}/>:<Circle size={15}/>}<span>{check.label}</span>{!check.done&&<button type="button" onClick={()=>{onLocale(check.key==='english'?'En':'Ar');onStep(check.step);}}>إضافة</button>}</li>)}</ul></details>
   {project.isFeatured&&!project.isPublished&&<p className={s.hint}>المشروع المميز يظل مخفيًا ما دام النشر غير مفعل.</p>}
  </aside>
 </div>;
}
