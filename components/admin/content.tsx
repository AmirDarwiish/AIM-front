'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Layers, ChevronLeft, Eye, EyeOff, Save, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import { type RecordData, adminRequest, write, AdminError } from '@/lib/admin-api';
import { safeUrl, type HomeContent } from '@/lib/public-api';
import { useRemote, Loading, ErrorNotice, Empty, Modal, MediaPicker, ActiveBadge } from './shared';
import s from './admin.module.css';
type Kind = 'sliders' | 'sections' | 'items' | 'business-categories' | 'cities';
type Field = {
    key: string;
    label: string;
    type?: 'textarea' | 'number' | 'media' | 'url';
    required?: boolean;
    hint?: string;
};
const bilingual = (key: string, label: string, type?: Field['type']): Field[] => [{ key: `${key}Ar`, label: `${label} بالعربية`, type }, { key: `${key}En`, label: `${label} بالإنجليزية`, type }];
const common = [...bilingual('title', 'العنوان'), ...bilingual('description', 'الوصف', 'textarea')];
const buttonFields = [...bilingual('buttonText', 'نص الزر'), { key: 'buttonUrl', label: 'رابط الزر', hint: 'رابط كامل أو مسار مثل / أو #join' }];
const fieldSets: Record<Kind, Field[]> = {
    sliders: [{ key: 'desktopImageMediaId', label: 'صورة الكمبيوتر', type: 'media', required: true }, { key: 'mobileImageMediaId', label: 'صورة الموبايل', type: 'media' }, ...common, ...bilingual('altText', 'وصف الصورة'), ...buttonFields],
    sections: [{ key: 'sectionKey', label: 'مفتاح القسم', required: true, hint: 'اسم فريد بالإنجليزية، مثل about أو benefits. services و how محجوزان لتصميم الموقع.' }, ...bilingual('title', 'العنوان'), ...bilingual('subtitle', 'العنوان الفرعي'), ...bilingual('description', 'الوصف', 'textarea'), { key: 'imageMediaId', label: 'صورة القسم', type: 'media' }, ...buttonFields],
    items: [...common, { key: 'imageMediaId', label: 'صورة العنصر', type: 'media' }],
    'business-categories': [{ key: 'nameAr', label: 'اسم النشاط بالعربية', required: true }, { key: 'nameEn', label: 'اسم النشاط بالإنجليزية' }],
    cities: [{ key: 'nameAr', label: 'اسم المدينة بالعربية', required: true }, { key: 'nameEn', label: 'اسم المدينة بالإنجليزية' }]
};
const names: Record<Kind, string> = { sliders: 'شريحة', sections: 'قسم', items: 'عنصر', 'business-categories': 'نوع نشاط', cities: 'مدينة' };
function defaults(kind: Kind): RecordData { const data: RecordData = { sortOrder: 0, isActive: true }; fieldSets[kind].forEach(f => data[f.key] = f.type === 'media' ? null : ''); return data; }
function cleanPayload(kind: Kind, data: RecordData) { const result: RecordData = { sortOrder: Number(data.sortOrder) || 0, isActive: !!data.isActive }; fieldSets[kind].forEach(f => { const value = data[f.key]; result[f.key] = f.type === 'media' ? (value ? Number(value) : null) : typeof value === 'string' ? value.trim() || null : value; }); return result; }
function ContentEditor({ kind, item, path, onClose, onSaved, preview }: {
    kind: Kind;
    item: RecordData;
    path: string;
    onClose: () => void;
    onSaved: () => void;
    preview?: Record<string, string>;
}) {
    const [form, setForm] = useState<RecordData>({ ...defaults(kind), ...item }), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const [uploads,setUploads]=useState<Record<string,boolean>>({});
    const uploading=Object.values(uploads).some(Boolean);
    const set = (key: string, value: RecordData[string]) => setForm(f => ({ ...f, [key]: value }));
    async function submit(e: FormEvent) { e.preventDefault(); setError(''); const missing=fieldSets[kind].find(f=>f.required && !String(form[f.key]??'').trim()); if(missing){setError(`أدخل ${missing.label}.`);return;} if (kind === 'sliders' && !form.desktopImageMediaId) {
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
    } setBusy(true); try {
        await write(item.id ? `${path}/${item.id}` : path, item.id ? 'PUT' : 'POST', cleanPayload(kind, form));
        onSaved();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <Modal title={`${item.id ? 'تعديل' : 'إضافة'} ${names[kind]}`} onClose={() => { if (!busy && !uploading)
        onClose(); }}><form onSubmit={submit}><div className={s.formGrid}>{fieldSets[kind].map(f => <div key={f.key} className={f.type === 'textarea' ? s.full : undefined}>{f.type === 'media' ? <MediaPicker label={f.label} value={form[f.key] ? Number(form[f.key]) : null} onChange={id => set(f.key, id)} required={f.required} onBusyChange={value=>setUploads(previous=>({...previous,[f.key]:value}))} preview={preview?.[f.key]}/> : <label>{f.label}{f.required && <b> *</b>}{f.type === 'textarea' ? <textarea rows={4} value={String(form[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} dir={f.key.endsWith('En') ? 'ltr' : undefined}/> : <input required={f.required} maxLength={f.key === 'sectionKey' ? 100 : undefined} value={String(form[f.key] ?? '')} onChange={e => set(f.key, e.target.value)} dir={f.key.endsWith('En') || f.key === 'buttonUrl' || f.key === 'sectionKey' ? 'ltr' : undefined}/>} {f.hint && <small className={s.hint}>{f.hint}</small>}</label>}</div>)}<label>ترتيب العرض<input type="number" min="0" step="1" required value={Number(form.sortOrder)} onChange={e => set('sortOrder', Number(e.target.value))}/></label><label className={s.check}><input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)}/> ظاهر على الموقع</label></div><ErrorNotice message={error}/><div className={s.formActions}><button className={s.primary} disabled={busy||uploading}>{busy ? <LoaderCircle className={s.spin} size={17}/> : <Save size={17}/>} {busy ? 'جاري الحفظ…' : 'حفظ التغييرات'}</button><button className={s.secondary} type="button" disabled={busy||uploading} onClick={onClose}>إلغاء</button></div></form></Modal>;
}
export function ContentManager({ kind, sectionId, onItems }: {
    kind: Kind;
    sectionId?: number;
    onItems?: (item: RecordData) => void;
}) {
    const path = kind === 'items' ? `admin/sections/${sectionId}/items` : ['cities', 'business-categories'].includes(kind) ? `admin/lookups/${kind}` : `admin/${kind}`;
    const remote = useRemote<RecordData[]>(path, []), publicHome = useRemote<HomeContent>('public/website/home?lang=ar', { siteName: '', sliders: [], sections: [] });
    const [editing, setEditing] = useState<RecordData | null>(null), [deleting, setDeleting] = useState<RecordData | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
    const rows = Array.isArray(remote.data) ? remote.data : [];
    function done() { setEditing(null); setSuccess('تم حفظ التغييرات. المحتوى النشط يظهر على الموقع بعد تحديث الصفحة.'); remote.reload(); publicHome.reload(); }
    function preview(item: RecordData): Record<string, string> { if (kind === 'sliders') {
        const p = publicHome.data.sliders?.find(x => x.id === item.id);
        return { desktopImageMediaId: p?.desktopImageUrl || '', mobileImageMediaId: p?.mobileImageUrl || '' };
    } if (kind === 'sections') {
        return { imageMediaId: publicHome.data.sections?.find(x => x.id === item.id)?.imageUrl || '' };
    } return { imageMediaId: publicHome.data.sections?.find(x => x.id === sectionId)?.items?.find(x => x.id === item.id)?.imageUrl || '' }; }
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
    return <><div className={s.panelToolbar}><span>{remote.loading ? '' : `${rows.length} ${kind === 'sliders' ? 'شرائح' : kind === 'sections' ? 'أقسام' : kind === 'items' ? 'عناصر' : 'عناصر مسجلة'}`}</span><button className={s.primary} onClick={() => { setError(''); setEditing(defaults(kind)); }}><Plus size={18}/> إضافة {names[kind]}</button></div>{kind === 'cities' && <div className={s.notice}>ربط المدن بالدول هيظهر هنا بعد إضافة دعم الدول في الباك إند.</div>}<ErrorNotice message={remote.error} retry={remote.reload}/>{success && <div className={s.success} role="status">{success}</div>}{!deleting && <ErrorNotice message={error}/>} {remote.loading ? <Loading /> : !remote.error && rows.length === 0 ? <Empty title={`لا توجد ${kind === 'sliders' ? 'شرائح' : kind === 'sections' ? 'أقسام' : 'عناصر'} بعد`} description="أضف المحتوى بالعربية والإنجليزية، وحدد ترتيب ظهوره."/> : <div className={kind === 'sliders' ? s.contentGrid : s.contentList}>{rows.map(item => { const p = preview(item), image = safeUrl(p.desktopImageMediaId || p.imageMediaId); return <article key={item.id} className={s.contentCard}>{kind === 'sliders' && <div className={s.slideImage}>{image ? <img src={image} alt={String(item.titleAr || 'صورة الشريحة')}/> : <ImageIcon size={38}/>}<span className={s.slideNumber}>#{item.sortOrder}</span></div>}<div className={s.contentBody}><div className={s.cardTop}><h3>{String(item.titleAr || item.nameAr || item.titleEn || `عنصر #${item.id}`)}</h3><ActiveBadge active={!!item.isActive}/></div>{item.sectionKey && <span className={s.keyLabel}>{String(item.sectionKey)}</span>}{item.descriptionAr && <p className={s.excerpt}>{String(item.descriptionAr)}</p>}<div className={s.cardActions}><button className={s.secondary} onClick={() => { setError(''); setEditing(item); }}><Pencil size={15}/> تعديل</button>{onItems && <button className={s.secondary} onClick={() => onItems(item)}><Layers size={15}/> العناصر <ChevronLeft size={14}/></button>}{kind === 'sliders' && <button className={s.iconButton} disabled={busy} onClick={() => toggle(item)} aria-label={item.isActive ? 'إخفاء الشريحة' : 'إظهار الشريحة'}>{item.isActive ? <EyeOff size={17}/> : <Eye size={17}/>}</button>}<button className={`${s.iconButton} ${s.danger}`} onClick={() => { setError(''); setDeleting(item); }} aria-label="حذف"><Trash2 size={17}/></button></div></div></article>; })}</div>}{editing && <ContentEditor kind={kind} item={editing} path={path} onClose={() => setEditing(null)} onSaved={done} preview={preview(editing)}/>} {deleting && <Modal title={`حذف ${names[kind]}`} onClose={() => { if (!busy)
        setDeleting(null); }}><p>هل تريد حذف «{String(deleting.titleAr || deleting.nameAr || `#${deleting.id}`)}»؟{kind === 'sections' ? ' سيتم حذف عناصر القسم أيضًا.' : ''}</p><ErrorNotice message={error}/><div className={s.formActions}><button className={s.dangerButton} disabled={busy} onClick={remove}>{busy ? 'جاري الحذف…' : 'تأكيد الحذف'}</button><button className={s.secondary} disabled={busy} onClick={() => setDeleting(null)}>إلغاء</button></div></Modal>}</>;
}
const settingsFields: Field[] = [{ key: 'siteNameAr', label: 'اسم الموقع بالعربية', required: true }, { key: 'siteNameEn', label: 'اسم الموقع بالإنجليزية' }, { key: 'logoMediaId', label: 'شعار الموقع', type: 'media' }, { key: 'faviconMediaId', label: 'أيقونة المتصفح', type: 'media' }, { key: 'appleAppStoreUrl', label: 'رابط App Store', type: 'url' }, { key: 'googlePlayUrl', label: 'رابط Google Play', type: 'url' }];
export function Settings() {
    const [form, setForm] = useState<RecordData | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false), [success, setSuccess] = useState('');
    const [uploads,setUploads]=useState<Record<string,boolean>>({});
    const uploading=Object.values(uploads).some(Boolean);
    const home = useRemote<HomeContent>('public/website/home?lang=ar', { siteName: '', sliders: [], sections: [] });
    // A missing settings record is the supported first-run state.
    const load = useCallback(() => adminRequest<RecordData>('admin/site-settings').then(setForm).catch(e => { if (e instanceof AdminError && e.status === 404)
        setForm({ siteNameAr: 'All in Map', siteNameEn: 'All in Map' });
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
    return <><ErrorNotice message={error} retry={!form ? () => { setLoading(true); setError(''); void load(); } : undefined}/>{loading ? <Loading /> : form && <form className={s.settingsForm} onSubmit={save}><div className={s.formGrid}>{settingsFields.map(f => <div key={f.key}>{f.type === 'media' ? <MediaPicker label={f.label} value={form[f.key] ? Number(form[f.key]) : null} onChange={id => setForm(previous=>previous?{ ...previous, [f.key]: id }:previous)} onBusyChange={value=>setUploads(previous=>({...previous,[f.key]:value}))} preview={f.key === 'logoMediaId' ? home.data.logoUrl : home.data.faviconUrl}/> : <label>{f.label}{f.required && <b> *</b>}<input type={f.type === 'url' ? 'url' : 'text'} required={f.required} value={String(form[f.key] ?? '')} onChange={e => setForm({ ...form, [f.key]: e.target.value })} dir={f.type === 'url' || f.key.endsWith('En') ? 'ltr' : undefined}/></label>}</div>)}</div>{success && <div className={s.success} role="status">{success}</div>}<div className={s.formActions}><button className={s.primary} disabled={busy||uploading}><Save size={18}/> {busy ? 'جاري الحفظ…' : 'حفظ الإعدادات'}</button></div><div className={s.notice}>أرقام الدول والأنشطة والمستخدمين والطلبات هتكون قابلة للإدارة بعد إضافة حقولها في الباك إند.</div></form>}</>;
}
