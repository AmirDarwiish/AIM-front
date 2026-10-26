'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Layers, ChevronLeft, Eye, EyeOff, Save, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import { type RecordData, adminRequest, write, AdminError } from '@/lib/admin-api';
import { safeUrl, type HomeContent } from '@/lib/public-api';
import { useRemote, Loading, ErrorNotice, Empty, Modal, MediaPicker, ActiveBadge } from './shared';
import s from './admin.module.css';
import { cmsSections } from '@/lib/cms-sections';
import { videoSource } from '@/lib/construction';
type Kind = 'sliders' | 'sections' | 'items' | 'business-categories' | 'cities';
type Field = {
    key: string;
    label: string;
    type?: 'textarea' | 'number' | 'media' | 'url' | 'video' | 'project';
    required?: boolean;
    hint?: string;
};
const bilingual = (key: string, label: string, type?: Field['type']): Field[] => [{ key: `${key}Ar`, label: `${label} بالعربية`, type }, { key: `${key}En`, label: `${label} بالإنجليزية`, type }];
const common = [...bilingual('title', 'العنوان'), ...bilingual('description', 'الوصف', 'textarea')];
const buttonFields = [...bilingual('buttonText', 'نص الزر'), { key: 'buttonUrl', label: 'رابط الزر', hint: 'رابط صفحة مثل /projects أو /contact' }];
const fieldSets: Record<Kind, Field[]> = {
    sliders: [{ key: 'desktopImageMediaId', label: 'صورة الكمبيوتر', type: 'media', required: true }, { key: 'mobileImageMediaId', label: 'صورة الموبايل', type: 'media' }, ...common, ...bilingual('altText', 'وصف الصورة'), ...buttonFields],
    sections: [{ key: 'sectionKey', label: 'نوع القسم', required: true }, ...bilingual('title', 'العنوان'), ...bilingual('subtitle', 'العنوان الفرعي'), ...bilingual('description', 'الوصف', 'textarea'), { key: 'imageMediaId', label: 'صورة القسم', type: 'media' }, ...buttonFields],
    items: [...common,...bilingual('subtitle','عنوان فرعي'), {key:'imageMediaId',label:'الصورة أو غلاف الفيديو',type:'media'}, {key:'afterImageMediaId',label:'صورة بعد التنفيذ',type:'media'}, {key:'videoMediaId',label:'رفع فيديو صغير (حتى 3 MB)',type:'video'}, {key:'videoUrl',label:'أو رابط فيديو MP4/WebM أو YouTube/Vimeo',type:'url'}, {key:'projectId',label:'المشروع المرتبط',type:'project'}],
    'business-categories': [{ key: 'nameAr', label: 'اسم النشاط بالعربية', required: true }, { key: 'nameEn', label: 'اسم النشاط بالإنجليزية' }],
    cities: [{ key: 'nameAr', label: 'اسم المدينة بالعربية', required: true }, { key: 'nameEn', label: 'اسم المدينة بالإنجليزية' }]
};
const names: Record<Kind, string> = { sliders: 'شريحة', sections: 'قسم', items: 'عنصر', 'business-categories': 'نوع نشاط', cities: 'مدينة' };
function fieldsFor(kind:Kind,key?:string){
 if(kind!=='items')return fieldSets[kind];
 return fieldSets.items.filter(f=>{
  if(f.key==='afterImageMediaId')return key==='la-before-after';
  if(['videoMediaId','videoUrl'].includes(f.key))return ['la-testimonials','la-films'].includes(key||'');
  if(f.key==='projectId')return ['la-before-after','la-testimonials','la-films'].includes(key||'');
  return true;
 }).map(f=>({...f,required:f.key==='titleAr'?true:f.required})).map(f=> key==='la-before-after'&&f.key==='imageMediaId'?{...f,label:'صورة قبل التنفيذ'}:key==='la-testimonials'&&f.key.startsWith('title')?{...f,label:f.key.endsWith('Ar')?'اسم العميل بالعربية':'اسم العميل بالإنجليزية'}:f);
}
function ProjectSelect({value,onChange}:{value:number|null;onChange:(id:number|null)=>void}){const remote=useRemote<RecordData[]>('admin/projects',[]);return <><select value={value||''} onChange={e=>onChange(e.target.value?Number(e.target.value):null)}><option value="">بدون ربط بمشروع</option>{Array.isArray(remote.data)&&remote.data.map(p=><option key={p.id} value={p.id}>{String(p.titleAr||p.titleEn)}{!p.isPublished?' (مسودة)':''}</option>)}</select><ErrorNotice message={remote.error} retry={remote.reload}/></>;}
function defaults(kind: Kind): RecordData { const data: RecordData = { sortOrder: 0, isActive: true, ...(kind==='sections'?{showOnHome:true}:{}) }; fieldSets[kind].forEach(f => data[f.key] = ['media','video','project'].includes(f.type||'') ? null : ''); return data; }
function cleanPayload(kind: Kind, data: RecordData, sectionKey?:string) { const result: RecordData = { sortOrder: Number(data.sortOrder) || 0, isActive: !!data.isActive }; if(kind==='sections')result.showOnHome=!!data.showOnHome; fieldsFor(kind,sectionKey).forEach(f => { const value = data[f.key]; result[f.key] = ['media','video','project'].includes(f.type||'') ? (value ? Number(value) : null) : typeof value === 'string' ? value.trim() || null : value; }); return result; }
function ContentEditor({ kind, item, path, onClose, onSaved, preview, sectionKey }: {
    kind: Kind;
    item: RecordData;
    path: string;
    onClose: () => void;
    onSaved: () => void;
    preview?: Record<string, string>;
    sectionKey?: string;
}) {
    const fields=fieldsFor(kind,sectionKey);
    const [form, setForm] = useState<RecordData>({ ...defaults(kind), ...item }), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const [uploads,setUploads]=useState<Record<string,boolean>>({});
    const uploading=Object.values(uploads).some(Boolean);
    const set = (key: string, value: RecordData[string]) => setForm(f => ({ ...f, [key]: value }));
    async function submit(e: FormEvent) { e.preventDefault(); setError(''); const missing=fields.find(f=>f.required && !String(form[f.key]??'').trim()); if(missing){setError(`أدخل ${missing.label}.`);return;} if (kind === 'sliders' && !form.desktopImageMediaId) {
        setError('ارفع صورة الكمبيوتر أولًا.');
        return;
    } if (form.buttonUrl && !form.buttonTextAr && !form.buttonTextEn) {
        setError('أدخل نص الزر عند إضافة رابط.');
        return;
    } if (form.buttonUrl && !safeUrl(String(form.buttonUrl))) {
        setError('رابط الزر غير صالح.');
        return;
    } if (kind === 'sections' && ['services', 'how'].includes(String(form.sectionKey))) {
        setError('هذا المفتاح محجوز. اختر مفتاحًا آخر للقسم.');
        return;
    } if(form.videoUrl&&!videoSource(String(form.videoUrl))){setError('استخدم رابط HTTPS لفيديو MP4/WebM أو YouTube/Vimeo.');return;} setBusy(true); try {
        await write(item.id ? `${path}/${item.id}` : path, item.id ? 'PUT' : 'POST', cleanPayload(kind, form, sectionKey));
        onSaved();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <Modal title={`${item.id ? 'تعديل' : 'إضافة'} ${names[kind]}`} onClose={() => { if (!busy && !uploading)
        onClose(); }}><form onSubmit={submit}><div className={s.formGrid}>{fields.map(f => <div key={f.key} className={f.type === 'textarea' ? s.full : undefined}>{f.type === 'project' ? <label>{f.label}<ProjectSelect value={form[f.key]?Number(form[f.key]):null} onChange={id=>set(f.key,id)}/></label> : ['media','video'].includes(f.type||'') ? <MediaPicker video={f.type==='video'} label={f.label} value={form[f.key] ? Number(form[f.key]) : null} onChange={id => {set(f.key,id);if(f.type==='video'&&id)set('videoUrl',null)}} required={f.required} onBusyChange={value=>setUploads(previous=>({...previous,[f.key]:value}))} preview={preview?.[f.key]}/> : <label>{f.label}{f.required && <b> *</b>}{f.key==='sectionKey'?<select required disabled={!!item.id} value={String(form.sectionKey||'')} onChange={e=>{const preset=cmsSections.find(p=>p.key===e.target.value);set('sectionKey',e.target.value);if(preset){set('sortOrder',preset.order);set('showOnHome',preset.home)}}}><option value="">اختر نوع القسم</option>{cmsSections.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}{form.sectionKey&&!cmsSections.some(p=>p.key===form.sectionKey)&&<option value={String(form.sectionKey)}>{String(form.sectionKey)}</option>}</select>:f.type === 'textarea' ? <textarea rows={4} value={String(form[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} dir={f.key.endsWith('En') ? 'ltr' : undefined}/> : <input type={f.type==='url'?'url':'text'} disabled={f.key==='videoUrl'&&!!form.videoMediaId} required={f.required} maxLength={f.key === 'sectionKey' ? 100 : undefined} value={String(form[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} dir={f.key.endsWith('En') || f.key === 'buttonUrl' || f.key === 'sectionKey' ? 'ltr' : undefined}/>} {f.hint && <small className={s.hint}>{f.hint}</small>}</label>}</div>)}<label>ترتيب العرض<input type="number" min="0" step="1" required value={Number(form.sortOrder)} onChange={e => set('sortOrder', Number(e.target.value))}/></label><label className={s.check}><input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)}/> ظاهر على الموقع</label>{kind==='sections'&&!['la-about-story','la-values','la-process','la-service-cta','la-contact','la-footer'].includes(String(form.sectionKey))&&<label className={s.check}><input type="checkbox" checked={!!form.showOnHome} onChange={e=>set('showOnHome',e.target.checked)}/> إظهار في الصفحة الرئيسية</label>}</div><ErrorNotice message={error}/><div className={s.formActions}><button className={s.primary} disabled={busy||uploading}>{busy ? <LoaderCircle className={s.spin} size={17}/> : <Save size={17}/>} {busy ? 'جاري الحفظ…' : 'حفظ التغييرات'}</button><button className={s.secondary} type="button" disabled={busy||uploading} onClick={onClose}>إلغاء</button></div></form></Modal>;
}
export function ContentManager({ kind, sectionId, onItems, sectionKey }: {
    kind: Kind;
    sectionId?: number;
    sectionKey?: string;
    onItems?: (item: RecordData) => void;
}) {
    const path = kind === 'items' ? `admin/sections/${sectionId}/items` : ['cities', 'business-categories'].includes(kind) ? `admin/lookups/${kind}` : `admin/${kind}`;
    const remote = useRemote<RecordData[]>(path, []), publicHome = useRemote<HomeContent>('public/website/home?lang=ar', { siteName: '', sliders: [], sections: [] });
    const [editing, setEditing] = useState<RecordData | null>(null), [deleting, setDeleting] = useState<RecordData | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
    const [scope,setScope]=useState('all'),[search,setSearch]=useState('');
    const allRows = Array.isArray(remote.data) ? [...remote.data].sort((a,b)=>Number(a.sortOrder)-Number(b.sortOrder)||Number(a.id)-Number(b.id)) : [];
    const pages:Record<string,string[]>={about:['la-about','la-about-story','la-values'],services:['la-services','la-process','la-service-cta'],contact:['la-contact'],shared:['la-cta','la-footer']};
    const rows=allRows.filter(item=>(kind!=='sections'||scope==='all'||(scope==='home'?!!item.showOnHome:pages[scope]?.includes(String(item.sectionKey))))&&(!search||String(item.titleAr||item.nameAr||item.titleEn||'').includes(search)||String(item.sectionKey||'').includes(search)));
    async function setVisibility(item:RecordData,home=false){setBusy(true);setError('');try{await write(`${path}/${item.id}`,'PUT',cleanPayload(kind,{...item,[home?'showOnHome':'isActive']:!item[home?'showOnHome':'isActive']},sectionKey));remote.reload();publicHome.reload();setSuccess('تم تحديث ظهور المحتوى.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}

    function done() { setEditing(null); setSuccess('تم حفظ التغييرات. المحتوى النشط يظهر على الموقع بعد تحديث الصفحة.'); remote.reload(); publicHome.reload(); }
    function preview(item: RecordData): Record<string, string> { if (kind === 'sliders') {
        const p = publicHome.data.sliders?.find(x => x.id === item.id);
        return { desktopImageMediaId: p?.desktopImageUrl || '', mobileImageMediaId: p?.mobileImageUrl || '' };
    } if (kind === 'sections') {
        return { imageMediaId: publicHome.data.sections?.find(x => x.id === item.id)?.imageUrl || '' };
    } const p=publicHome.data.sections?.find(x=>x.id===sectionId)?.items?.find(x=>x.id===item.id);return {imageMediaId:p?.imageUrl||'',afterImageMediaId:p?.afterImageUrl||'',videoMediaId:p?.videoUrl||''}; }
    async function remove() { if (!deleting)
        return; setBusy(true); setError(''); try {
        await write(`${path}/${deleting.id}`, 'DELETE');
        setDeleting(null);
        setSuccess('تم الحذف.');
        remote.reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function toggle(item: RecordData) { setBusy(true); setError(''); try {
        await write(`${path}/${item.id}/activate`, 'POST', !item.isActive);
        remote.reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <>{kind==='sections'&&<div className={s.cmsGuide}><h2>إدارة محتوى الموقع حسب الصفحة</h2><p>عدّل نصوص القسم وصورته وأزراره من «تعديل»، والخدمات والأسئلة وآراء العملاء من «العناصر». المشاريع لها تبويب مستقل، والشعار وبيانات التواصل داخل إعدادات الموقع.</p><div className={s.scopeTabs} role="group" aria-label="تصفية أقسام الموقع">{[['all','كل الأقسام'],['home','الرئيسية'],['about','عن الشركة'],['services','الخدمات'],['contact','التواصل'],['shared','التذييل والتواصل']].map(([key,label])=><button key={key} className={scope===key?s.primary:s.secondary} aria-pressed={scope===key} onClick={()=>setScope(key)}>{label}</button>)}</div><label>بحث في المحتوى<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="اسم القسم أو عنوانه"/></label></div>}<div className={s.panelToolbar}><span>{remote.loading ? '' : `${rows.length} ${kind === 'sliders' ? 'شرائح' : kind === 'sections' ? 'أقسام' : kind === 'items' ? 'عناصر' : 'عناصر مسجلة'}`}</span><button className={s.primary} onClick={() => { setError(''); setEditing(defaults(kind)); }}><Plus size={18}/> إضافة {names[kind]}</button></div>{kind === 'cities' && <div className={s.notice}>ربط المدن بالدول هيظهر هنا بعد إضافة دعم الدول في الباك إند.</div>}<ErrorNotice message={remote.error} retry={remote.reload}/>{success && <div className={s.success} role="status">{success}</div>}{!deleting && <ErrorNotice message={error}/>} {remote.loading ? <Loading /> : !remote.error && rows.length === 0 ? <Empty title={`لا توجد ${kind === 'sliders' ? 'شرائح' : kind === 'sections' ? 'أقسام مطابقة' : 'عناصر'} بعد`} description="أضف المحتوى بالعربية والإنجليزية، وحدد ترتيب ظهوره."/> : <div className={kind === 'sliders' ? s.contentGrid : s.contentList}>{rows.map(item => { const p = preview(item), image = safeUrl(p.desktopImageMediaId || p.imageMediaId); return <article key={item.id} className={s.contentCard}>{kind === 'sliders' && <div className={s.slideImage}>{image ? <img src={image} alt={String(item.titleAr || 'صورة الشريحة')}/> : <ImageIcon size={38}/>}<span className={s.slideNumber}>#{item.sortOrder}</span></div>}<div className={s.contentBody}><div className={s.cardTop}><h3>{String(item.titleAr || item.nameAr || item.titleEn || `عنصر #${item.id}`)}</h3><ActiveBadge active={!!item.isActive}/></div>{item.sectionKey && <span className={s.keyLabel}>{cmsSections.find(p=>p.key===item.sectionKey)?.label||String(item.sectionKey)}</span>}{item.descriptionAr && <p className={s.excerpt}>{String(item.descriptionAr)}</p>}<div className={s.cardActions}><button className={s.secondary} onClick={() => { setError(''); setEditing(item); }}><Pencil size={15}/> تعديل</button>{['sections','items'].includes(kind)&&<button className={s.secondary} disabled={busy} onClick={()=>setVisibility(item)}>{item.isActive?<EyeOff size={15}/>:<Eye size={15}/>} {item.isActive?'إخفاء':'إظهار'}</button>}{kind==='sections'&&!['la-about-story','la-values','la-process','la-service-cta','la-contact','la-footer'].includes(String(item.sectionKey))&&<button className={s.secondary} disabled={busy} onClick={()=>setVisibility(item,true)}>{item.showOnHome?'إزالة من الرئيسية':'إضافة للرئيسية'}</button>}{onItems && <button className={s.secondary} onClick={() => onItems(item)}><Layers size={15}/> العناصر <ChevronLeft size={14}/></button>}{kind === 'sliders' && <button className={s.iconButton} disabled={busy} onClick={() => toggle(item)} aria-label={item.isActive ? 'إخفاء الشريحة' : 'إظهار الشريحة'}>{item.isActive ? <EyeOff size={17}/> : <Eye size={17}/>}</button>}<button className={`${s.iconButton} ${s.danger}`} onClick={() => { setError(''); setDeleting(item); }} aria-label="حذف"><Trash2 size={17}/></button></div></div></article>; })}</div>}{editing && <ContentEditor sectionKey={sectionKey} kind={kind} item={editing} path={path} onClose={() => setEditing(null)} onSaved={done} preview={preview(editing)}/>} {deleting && <Modal title={`حذف ${names[kind]}`} onClose={() => { if (!busy)
        setDeleting(null); }}><p>هل تريد حذف «{String(deleting.titleAr || deleting.nameAr || `#${deleting.id}`)}»؟{kind === 'sections' ? ' سيتم حذف عناصر القسم أيضًا.' : ''}</p><ErrorNotice message={error}/><div className={s.formActions}><button className={s.dangerButton} disabled={busy} onClick={remove}>{busy ? 'جاري الحذف…' : 'تأكيد الحذف'}</button><button className={s.secondary} disabled={busy} onClick={() => setDeleting(null)}>إلغاء</button></div></Modal>}</>;
}
const settingsFields: Field[] = [{ key: 'siteNameAr', label: 'اسم الموقع بالعربية', required: true }, { key: 'siteNameEn', label: 'اسم الموقع بالإنجليزية' }, { key: 'logoMediaId', label: 'شعار الموقع', type: 'media' }, { key: 'faviconMediaId', label: 'أيقونة المتصفح', type: 'media' }, {key:'contactEmail',label:'بريد التواصل'},{key:'contactPhone',label:'هاتف التواصل'},{key:'whatsappUrl',label:'رابط WhatsApp',type:'url'},{key:'addressAr',label:'العنوان بالعربية'},{key:'addressEn',label:'العنوان بالإنجليزية'},{key:'instagramUrl',label:'رابط Instagram',type:'url'},{key:'linkedinUrl',label:'رابط LinkedIn',type:'url'}];
export function Settings() {
    const [form, setForm] = useState<RecordData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false), [success, setSuccess] = useState('');
    const [uploads,setUploads]=useState<Record<string,boolean>>({});
    const uploading=Object.values(uploads).some(Boolean);
    const home = useRemote<HomeContent>('public/website/home?lang=ar', { siteName: '', sliders: [], sections: [] });
    // A missing settings record is the supported first-run state.
    const load = useCallback(() => adminRequest<RecordData>('admin/site-settings').then(setForm).catch(e => { if (e instanceof AdminError && e.status === 404)
        setForm({ siteNameAr: 'LA Construction', siteNameEn: 'LA Construction' });
    else
        setError((e as Error).message); }).finally(() => setLoading(false)), []);
    useEffect(() => { void load(); }, [load]);
    async function save(e: FormEvent) { e.preventDefault(); if (!form)
        return; setBusy(true); setError(''); setSuccess(''); try {
        const payload: RecordData = {};
        settingsFields.forEach(f => payload[f.key] = form[f.key] || null);
        await write('admin/site-settings', 'PUT', payload);
        setSuccess('تم حفظ إعدادات الموقع.');
        home.reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <><ErrorNotice message={error} retry={!form ? () => { setLoading(true); setError(''); void load(); } : undefined}/>{loading ? <Loading /> : form && <form className={s.settingsForm} onSubmit={save}><div className={s.formGrid}>{settingsFields.map(f => <div key={f.key}>{f.type === 'media' ? <MediaPicker label={f.label} value={form[f.key] ? Number(form[f.key]) : null} onChange={id => setForm(previous=>previous?{ ...previous, [f.key]: id }:previous)} onBusyChange={value=>setUploads(previous=>({...previous,[f.key]:value}))} preview={f.key === 'logoMediaId' ? home.data.logoUrl : home.data.faviconUrl}/> : <label>{f.label}{f.required && <b> *</b>}<input type={f.type === 'url' ? 'url' : 'text'} required={f.required} value={String(form[f.key] ?? '')} onChange={e => setForm({ ...form, [f.key]: e.target.value })} dir={f.type === 'url' || f.key.endsWith('En') ? 'ltr' : undefined}/></label>}</div>)}</div>{success && <div className={s.success} role="status">{success}</div>}<div className={s.formActions}><button className={s.primary} disabled={busy||uploading}><Save size={18}/> {busy ? 'جاري الحفظ…' : 'حفظ الإعدادات'}</button></div><div className={s.notice}>بيانات التواصل تظهر في الموقع عند حفظها. إدارة المشاريع من تبويب المشاريع.</div></form>}</>;
}
