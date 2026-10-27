'use client';
import { AdminSelect, FilterSummary } from './data-controls';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, ExternalLink, Eye } from 'lucide-react';
import { adminRequest, write, type MediaRecord } from '@/lib/admin-api';
import { adminRecordPath, type AdminRoute } from '@/lib/admin-navigation';
import { safeUrl } from '@/lib/public-api';
import { videoSource } from '@/lib/construction';
import { useRemote, Loading, ErrorNotice, Empty, Modal, MediaPicker, ActiveBadge } from './shared';
import s from './admin.module.css';
import { EditorTabs, LanguageTabs, EditorPage, VisibilityToggle, TablePagination, useAdminNavigation } from './editor-tools';
import { normalizeProject, newProject, publicationChecks, type AdminProject as Row } from '@/lib/admin-project';
import ProjectReview from './project-review';
const fresh=newProject;
const labels=[['title','عنوان المشروع',200],['summary','نبذة مختصرة',600],['description','تفاصيل المشروع',20000],['location','الموقع',200],['category','نوع المشروع',200]] as const;
function Editor({initial,media,onClose,onSaved}:{initial:Row;media:MediaRecord[];onClose:()=>void;onSaved:()=>void}){
 const editorTop=useRef<HTMLDivElement>(null);
 const [step,setStep]=useState('copy'),[locale,setLocale]=useState<'Ar'|'En'>('Ar');
 const [form,setForm]=useState(()=>normalizeProject(initial)),[knownMedia,setKnownMedia]=useState<MediaRecord[]>(media),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uploads,setUploads]=useState<Record<string,boolean>>({});
 useEffect(()=>{editorTop.current?.scrollIntoView({block:'start',behavior:'instant'});},[step]);
 const uploading=Object.values(uploads).some(Boolean),dirty=JSON.stringify(form)!==JSON.stringify(normalizeProject(initial));
 function update(key:string,value:unknown){setError('');setForm(f=>({...f,[key]:value}));}
 function asset(index:number,key:string,value:unknown){setError('');setForm(f=>({...f,assets:f.assets.map((a,i)=>i===index?{...a,[key]:value}:a)}));}
 function remember(file:MediaRecord){setKnownMedia(rows=>[...rows.filter(row=>row.id!==file.id),file]);}
 function uploadState(key:string,value:boolean){setUploads(previous=>({...previous,[key]:value}));}
 function move(index:number,delta:number){setForm(f=>{const assets=[...f.assets];[assets[index],assets[index+delta]]=[assets[index+delta],assets[index]];return {...f,assets};});}
 async function persist(published:boolean){
  if(busy||uploading)return;setError('');
  const project=normalizeProject({...form,isPublished:published});
  if(!project.titleAr.trim()||!(/^[a-z0-9]+(-[a-z0-9]+)*$/).test(project.slug)){setStep('copy');setLocale('Ar');setError('أدخل عنوان المشروع بالعربية ورابطًا إنجليزيًا من حروف صغيرة وأرقام وشرطات.');return;}
  if((project.year!==null&&(!Number.isInteger(project.year)||project.year<1900||project.year>2200))||!Number.isInteger(project.sortOrder)||project.sortOrder<0||project.sortOrder>100000){setStep('copy');setError('راجع السنة وترتيب العرض: السنة من 1900 إلى 2200، والترتيب عدد صحيح من 0 إلى 100000.');return;}
  const missing=publicationChecks(project).find(c=>c.required&&!c.done);
  if(published&&missing){setStep(missing.step);setLocale('Ar');setError(`استكمل ${missing.label} قبل النشر، أو احفظ المشروع كمسودة.`);return;}
  if(project.assets.some(a=>a.kind==='image'?!a.mediaId:!a.mediaId&&!videoSource(a.videoUrl||''))){setStep('media');setError('أضف ملفًا لكل عنصر في المعرض أو أزل العنصر غير المكتمل.');return;}
  setBusy(true);
  try{await write(`admin/projects${project.id?`/${project.id}`:''}`,project.id?'PUT':'POST',{...project,assets:project.assets.map((a,i)=>({...a,id:0,sortOrder:i,videoUrl:a.kind==='video'?a.videoUrl||null:null}))});onSaved();}
  catch(e){setError((e as Error).message);}
  finally{setBusy(false);}
 }
 return <EditorPage title={form.id?'تعديل المشروع':'إضافة مشروع'} dirty={dirty} busy={busy||uploading} onClose={onClose}>
  <form onSubmit={e=>{e.preventDefault();void persist(form.isPublished);}} noValidate>
   <div ref={editorTop} className={s.editorStepAnchor}><EditorTabs disabled={busy||uploading} tabs={[{id:'copy',label:'بيانات المشروع'},{id:'media',label:'الغلاف والمعرض'},{id:'publish',label:'المعاينة والنشر'}]} value={step} onChange={setStep}/></div>
   <ErrorNotice message={error}/>
   <fieldset disabled={busy||uploading} className={s.editorFieldset}>
    {step==='copy'&&<><LanguageTabs value={locale} onChange={setLocale}/><div className={s.editorIntro}><h3>بيانات المشروع</h3><p>حدد تفاصيل العمل كما تريد أن يراها العميل، ثم أضف الغلاف وراجع المعاينة.</p></div><div className={s.formGrid}>
     <label className={s.full}>رابط المشروع بالإنجليزية <b>*</b><input required dir="ltr" placeholder="modern-villa" maxLength={120} value={form.slug} onChange={e=>update('slug',e.target.value)}/><small className={s.hint}>حروف صغيرة وأرقام وشرطات. مثال: modern-villa</small></label>
     {labels.map(([key,label,max])=>{const name=`${key}${locale}` as keyof Row;return <label key={name} className={['title','summary','description'].includes(key)?s.full:undefined}>{label} {locale==='Ar'?'بالعربية':'بالإنجليزية'}{name==='titleAr'&&<b> *</b>}{['description','summary'].includes(key)?<textarea rows={key==='description'?6:3} maxLength={max} dir={locale==='En'?'ltr':undefined} value={String(form[name]||'')} onChange={e=>update(name,e.target.value)}/>:<input maxLength={max} dir={locale==='En'?'ltr':undefined} value={String(form[name]||'')} onChange={e=>update(name,e.target.value)}/>}</label>;})}
     <label>سنة التنفيذ<input type="number" min="1900" max="2200" value={form.year||''} onChange={e=>update('year',e.target.value?Number(e.target.value):null)}/></label><label>ترتيب العرض<input type="number" min="0" max="100000" value={form.sortOrder} onChange={e=>update('sortOrder',Number(e.target.value))}/><small className={s.hint}>الرقم الأقل يظهر أولًا.</small></label>
    </div></>}
    {step==='media'&&<><div className={s.editorIntro}><h3>غلاف المشروع ومعرض الأعمال</h3><p>اختر الغلاف من المكتبة أو ارفع صورة، ثم أضف بقية الوسائط.</p></div>
     <MediaPicker label="صورة غلاف المشروع" value={form.coverMediaId} preview={knownMedia.find(m=>m.id===form.coverMediaId)?.url} onChange={id=>update('coverMediaId',id)} onResolvedMedia={remember} onBusyChange={value=>uploadState('cover',value)}/>
     <div className={s.panelToolbar}><div><h3>الصور والفيديوهات</h3><p className={s.hint}>{form.assets.length} من 60 ملفًا. MP4/WebM أو رابط YouTube/Vimeo للفيديوهات الكبيرة.</p></div><button type="button" className={s.secondary} disabled={form.assets.length>=60} onClick={()=>update('assets',[...form.assets,{kind:'image',mediaId:null,videoUrl:null,posterMediaId:null,captionAr:'',captionEn:'',sortOrder:form.assets.length}])}><Plus size={16}/>إضافة وسيط</button></div>
     {form.assets.map((a,i)=><fieldset key={i} className={s.projectAsset}><div className={s.panelToolbar}><strong>ملف {i+1}</strong><div className={s.rowActions}><button type="button" className={s.iconButton} disabled={i===0} onClick={()=>move(i,-1)} aria-label="تحريك للأعلى"><ArrowUp size={17}/></button><button type="button" className={s.iconButton} disabled={i===form.assets.length-1} onClick={()=>move(i,1)} aria-label="تحريك للأسفل"><ArrowDown size={17}/></button><button type="button" className={`${s.iconButton} ${s.danger}`} onClick={()=>update('assets',form.assets.filter((_,index)=>i!==index))} aria-label="إزالة الوسيط"><Trash2 size={17}/></button></div></div><label>نوع الملف<AdminSelect aria-label="نوع الملف" value={a.kind} onValueChange={value=>{asset(i,'kind',value);asset(i,'mediaId',null);asset(i,'videoUrl',null);}}><option value="image">صورة</option><option value="video">فيديو</option></AdminSelect></label>
      {a.kind==='image'?<MediaPicker label="الصورة" value={a.mediaId} preview={knownMedia.find(m=>m.id===a.mediaId)?.url} onChange={id=>asset(i,'mediaId',id)} onResolvedMedia={remember} onBusyChange={value=>uploadState(`asset-${i}`,value)}/>:<><label>رابط الفيديو<input type="url" dir="ltr" maxLength={2048} value={a.videoUrl||''} disabled={!!a.mediaId} onChange={e=>asset(i,'videoUrl',e.target.value)}/></label><MediaPicker label="أو رفع فيديو صغير" video value={a.mediaId} preview={knownMedia.find(m=>m.id===a.mediaId)?.url} onChange={id=>{asset(i,'mediaId',id);if(id)asset(i,'videoUrl',null);}} onResolvedMedia={remember} onBusyChange={value=>uploadState(`asset-${i}`,value)}/><MediaPicker label="صورة معاينة الفيديو" value={a.posterMediaId} preview={knownMedia.find(m=>m.id===a.posterMediaId)?.url} onChange={id=>asset(i,'posterMediaId',id)} onResolvedMedia={remember} onBusyChange={value=>uploadState(`poster-${i}`,value)}/></>}
      <div className={s.formGrid}><label>وصف الملف بالعربية<input maxLength={300} value={a.captionAr} onChange={e=>asset(i,'captionAr',e.target.value)}/></label><label>وصف الملف بالإنجليزية<input dir="ltr" maxLength={300} value={a.captionEn} onChange={e=>asset(i,'captionEn',e.target.value)}/></label></div>
     </fieldset>)}
    </>}
    {step==='publish'&&<ProjectReview project={form} media={knownMedia} locale={locale} onLocale={setLocale} onUpdate={update} onStep={setStep}/>}
   </fieldset>
   <div className={s.editorFooter}><span className={s.saveState}>{busy?'جاري حفظ المشروع…':uploading?'جاري رفع الملف…':dirty?'تغييرات غير محفوظة':'لا توجد تغييرات جديدة'}</span><div>{step!=='publish'&&!form.isPublished&&<button type="button" className={s.secondary} disabled={busy||uploading} onClick={()=>void persist(false)}>حفظ كمسودة</button>}{step!=='copy'&&<button type="button" className={s.secondary} disabled={busy||uploading} onClick={()=>setStep(step==='publish'?'media':'copy')}>السابق</button>}{step!=='publish'?<button type="button" className={s.primary} disabled={busy||uploading} onClick={()=>setStep(step==='copy'?'media':'publish')}>{step==='media'?'معاينة المشروع':'التالي'}</button>:<>{form.isPublished&&<button type="button" className={s.secondary} disabled={busy||uploading} onClick={()=>void persist(false)}>حفظ كمسودة</button>}<button className={s.primary} disabled={busy||uploading}><Save size={17}/>{busy?'جاري الحفظ…':form.isPublished?(initial.isPublished?'حفظ التعديلات':'نشر المشروع'):'حفظ كمسودة'}</button></>}</div></div>
  </form>
 </EditorPage>;
}
function ProjectDetails({project:p,media,onBack,onEdit}:{project:Row;media:MediaRecord[];onBack:()=>void;onEdit:()=>void}){
 const cover=safeUrl(media.find(m=>m.id===p.coverMediaId)?.url);
 return <EditorPage title={p.titleAr||p.titleEn} onClose={onBack}><div className={s.detailToolbar}><ActiveBadge active={p.isPublished}/><div className={s.rowActions}>{p.isPublished&&<Link className={s.secondary} href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>صفحة الموقع</Link>}<button className={s.primary} onClick={onEdit}><Pencil size={16}/>تعديل المشروع</button></div></div>{cover&&<img className={s.recordCover} src={cover} alt={p.titleAr}/>}<dl className={s.recordDetails}>{labels.flatMap(([key,label])=>['Ar','En'].map(locale=><div key={key+locale} className={['title','summary','description'].includes(key)?s.full:undefined}><dt>{label} {locale==='Ar'?'بالعربية':'بالإنجليزية'}</dt><dd dir={locale==='En'?'ltr':undefined}>{String(p[`${key}${locale}` as keyof Row]||'—')}</dd></div>))}<div><dt>رابط المشروع</dt><dd dir="ltr">/projects/{p.slug}</dd></div><div><dt>السنة</dt><dd>{p.year||'—'}</dd></div><div><dt>ترتيب العرض</dt><dd>{p.sortOrder}</dd></div><div><dt>مميز في الرئيسية</dt><dd>{p.isFeatured?'نعم':'لا'}</dd></div></dl><div className={s.tableHeading}><h3>وسائط المشروع</h3><span>{p.assets.length} ملف</span></div>{p.assets.length?<div className={s.tableWrap}><table className={s.table}><thead><tr><th>الترتيب</th><th>النوع</th><th>الوصف بالعربية</th><th>الملف</th></tr></thead><tbody>{p.assets.map((a,i)=>{const url=safeUrl(a.videoUrl||media.find(m=>m.id===a.mediaId)?.url);return <tr key={i}><td>{i+1}</td><td>{a.kind==='video'?'فيديو':'صورة'}</td><td>{a.captionAr||'—'}</td><td>{url?<a className={s.textAction} href={url} target="_blank" rel="noopener noreferrer">فتح الملف</a>:'ملف محفوظ'}</td></tr>;})}</tbody></table></div>:<p className={s.hint}>لا توجد ملفات إضافية.</p>}</EditorPage>;
}
function ProjectRecord({route}:{route:AdminRoute}){
 const go=useAdminNavigation();const remote=useRemote<{project:Row;media:MediaRecord[]}>(`admin/projects/${route.id}`,{project:fresh(),media:[]});
 if(remote.loading)return <Loading/>;if(remote.error)return <><ErrorNotice message={remote.error} retry={remote.reload}/><button className={s.secondary} onClick={()=>go('/admin/projects')}>العودة للمشاريع</button></>;
 const project=normalizeProject(remote.data.project);project.assets.sort((a,b)=>a.sortOrder-b.sortOrder);
 return route.action==='view'?<ProjectDetails project={project} media={remote.data.media||[]} onBack={()=>go('/admin/projects')} onEdit={()=>go(`/admin/projects/${route.id}/edit`)}/>:<Editor initial={project} media={remote.data.media||[]} onClose={()=>go('/admin/projects')} onSaved={()=>go('/admin/projects',true)}/>;
}
export default function ProjectManager({route}:{route:AdminRoute}){
 const go=useAdminNavigation();
 if(route.action==='new')return <Editor initial={fresh()} media={[]} onClose={()=>go('/admin/projects')} onSaved={()=>go('/admin/projects',true)}/>;
 if(route.action!=='list')return <ProjectRecord route={route}/>;
 return <ProjectTable route={route}/>;
}
function ProjectTable({route}:{route:AdminRoute}){
 const go=useAdminNavigation(),remote=useRemote<Row[]>('admin/projects',[]);
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[tablePage,setTablePage]=useState(1),[deleting,setDeleting]=useState<Row|null>(null),[pending,setPending]=useState<number|null>(null),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const all=Array.isArray(remote.data)?remote.data.map(normalizeProject):[],rows=all.filter(p=>(filter==='all'||(filter==='published'?p.isPublished:filter==='draft'?!p.isPublished:p.isFeatured))&&`${p.titleAr} ${p.titleEn} ${p.slug} ${p.locationAr}`.toLowerCase().includes(search.trim().toLowerCase()));
 const pages=Math.max(1,Math.ceil(rows.length/15)),page=Math.min(tablePage,pages),visibleRows=rows.slice((page-1)*15,page*15);
 async function toggle(row:Row,key:'isPublished'|'isFeatured'){
  if(pending!==null)return;setPending(row.id!);setError('');setSuccess('');
  try{const data=await adminRequest<{project:Row;media:MediaRecord[]}>(`admin/projects/${row.id}`);const project=normalizeProject({...data.project,[key]:!row[key]});
   if(project.isPublished&&(!project.coverMediaId||!project.descriptionAr?.trim())){setError('أضف غلاف المشروع ووصفه بالعربية من صفحة التعديل قبل إظهاره على الموقع.');return;}
   await write(`admin/projects/${row.id}`,'PUT',{...project,assets:(project.assets||[]).map(a=>({...a,id:0}))});remote.reload();setSuccess('تم حفظ حالة المشروع.');
  }catch(e){setError((e as Error).message);}finally{setPending(null);}
 }
 async function remove(){if(!deleting)return;setPending(deleting.id!);setError('');try{await write(`admin/projects/${deleting.id}`,'DELETE');setDeleting(null);setSuccess('تم حذف المشروع.');remote.reload();}catch(e){setError((e as Error).message);}finally{setPending(null);}}
 return <><div className={s.collectionToolbar}><div><h2>سجل المشاريع</h2><p>إجمالي {all.length} · منشور {all.filter(p=>p.isPublished).length} · مسودة {all.filter(p=>!p.isPublished).length}</p></div><button className={s.primary} onClick={()=>go('/admin/projects/new')}><Plus size={17}/>إضافة مشروع</button></div><div className={s.filters}><label className={s.librarySearch}>البحث في المشاريع<input value={search} onChange={e=>{setSearch(e.target.value);setTablePage(1);}} placeholder="عنوان المشروع أو موقعه"/></label><label>الحالة<AdminSelect aria-label="حالة المشاريع" value={filter} onValueChange={value=>{setFilter(value);setTablePage(1);}}><option value="all">كل المشاريع</option><option value="published">المنشورة</option><option value="draft">المسودات</option><option value="featured">المميزة</option></AdminSelect></label></div><FilterSummary total={rows.length} active={!!search||filter!=='all'} onReset={()=>{setSearch('');setFilter('all');setTablePage(1);}}/><ErrorNotice message={remote.error||error} retry={remote.error?remote.reload:undefined}/>{success&&<div className={s.success} role="status">{success}</div>}{remote.loading?<Loading/>:!rows.length?<Empty title="لا توجد مشاريع مطابقة" description="غيّر البحث أو أضف مشروعًا جديدًا."/>:<div className={s.tableWrap}><table className={`${s.table} ${s.managementTable}`}><caption className={s.srOnly}>جدول مشاريع الشركة</caption><thead><tr><th scope="col">المشروع</th><th scope="col">التصنيف والموقع</th><th scope="col">السنة</th><th scope="col">الظهور</th><th scope="col">مميز</th><th scope="col">الإجراءات</th></tr></thead><tbody>{visibleRows.map(p=><tr key={p.id}><td><strong className={s.tableTitle}>{p.titleAr||p.titleEn}</strong><small className={s.tableSubtitle} dir="ltr">/projects/{p.slug}</small></td><td><span>{p.categoryAr||'—'}</span><small className={s.tableSubtitle}>{p.locationAr||'لم يحدد الموقع'}</small></td><td>{p.year||'—'}</td><td><VisibilityToggle checked={p.isPublished} disabled={pending!==null} busy={pending===p.id} label={`ظهور ${p.titleAr}`} onChange={()=>toggle(p,'isPublished')}/></td><td><VisibilityToggle checked={p.isFeatured} disabled={pending!==null} busy={pending===p.id} label={`تمييز ${p.titleAr}`} onChange={()=>toggle(p,'isFeatured')}/></td><td><div className={s.rowActions}><button className={s.secondary} onClick={()=>go(adminRecordPath(route,'view',p.id))}><Eye size={15}/>عرض</button><button className={s.secondary} onClick={()=>go(adminRecordPath(route,'edit',p.id))}><Pencil size={15}/>تعديل</button><button className={`${s.iconButton} ${s.danger}`} disabled={pending!==null} onClick={()=>setDeleting(p)} aria-label={`حذف ${p.titleAr}`}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}<TablePagination page={page} pages={pages} total={rows.length} onChange={setTablePage}/>{deleting&&<Modal title="حذف المشروع" busy={pending!==null} onClose={()=>setDeleting(null)}><p>حذف «{deleting.titleAr}» وصفحته من الموقع؟</p><ErrorNotice message={error}/><div className={s.formActions}><button className={s.dangerButton} disabled={pending!==null} onClick={remove}>تأكيد الحذف</button><button className={s.secondary} disabled={pending!==null} onClick={()=>setDeleting(null)}>إلغاء</button></div></Modal>}</>;
}
