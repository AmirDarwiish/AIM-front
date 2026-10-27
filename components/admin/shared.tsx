'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, LoaderCircle, X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { adminRequest, type MediaPage, type MediaRecord } from '@/lib/admin-api';
import { safeUrl } from '@/lib/public-api';
import s from './admin.module.css';
import { useUnsavedChanges } from './editor-tools';
const selectedMediaCache=new Map<number,MediaRecord>();
export function useRemote<T>(path: string, initial: T) {
    const [revision, setRevision] = useState(0);
    const key = `${path}:${revision}`;
    const [result, setResult] = useState<{
        key: string;
        data: T;
        error: string;
    }>({ key: '', data: initial, error: '' });
    const reload = useCallback(() => setRevision(x => x + 1), []);
    useEffect(() => { const controller = new AbortController(); adminRequest<T>(path, { signal: controller.signal }).then(data => { if (!controller.signal.aborted)
        setResult({ key, data, error: '' }); }).catch(e => { if (!controller.signal.aborted)
        setResult(previous => ({ ...previous, key, error: e.message })); }); return () => controller.abort(); }, [path, key]);
    return { data: result.data, loading: result.key !== key, error: result.key === key ? result.error : '', reload };
}
export function ErrorNotice({ message, retry }: {
    message: string;
    retry?: () => void;
}) { return message ? <div className={s.error} role="alert"><AlertCircle size={19}/><span>{message}</span>{retry && <button type="button" onClick={retry}><RefreshCw size={16}/> إعادة المحاولة</button>}</div> : null; }
export function Loading() { return <div className={s.loading} role="status"><LoaderCircle className={s.spin} size={24}/> جاري تحميل البيانات…</div>; }
export function Empty({ title = 'لا توجد بيانات بعد', description = 'ابدأ بإضافة أول عنصر.' }: {
    title?: string;
    description?: string;
}) { return <div className={s.empty}><div className={s.emptyIcon}><ImageIcon size={28}/></div><h3>{title}</h3><p>{description}</p></div>; }
export function Modal({title,children,onClose,dirty=false,busy=false}:{title:string;children:ReactNode;onClose:()=>void;dirty?:boolean;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),[discard,setDiscard]=useState(false);
 useUnsavedChanges(dirty);
 useEffect(()=>{const el=ref.current;el?.showModal();return()=>el?.close();},[]);
 function close(){if(busy)return;if(dirty){setDiscard(true);return;}onClose();}
 return <dialog ref={ref} className={s.modal} onCancel={e=>{e.preventDefault();close();}} aria-labelledby="la-dialog-title"><div className={s.modalHeader}><div><span className={s.eyebrow}>LA CONSTRUCTION / CONTENT STUDIO</span><h2 id="la-dialog-title">{title}</h2></div><button type="button" className={s.iconButton} disabled={busy} onClick={close} aria-label="إغلاق"><X size={21}/></button></div>{discard&&<div className={s.discardBanner} role="alert"><strong>عندك تغييرات لم تُحفظ</strong><p>تقدر ترجع تكمل التعديل أو تتجاهل التغييرات وتغلق المحرر.</p><div><button type="button" className={s.primary} onClick={()=>setDiscard(false)}>متابعة التعديل</button><button type="button" className={s.secondary} onClick={onClose}>تجاهل التغييرات</button></div></div>}<div className={s.modalBody}>{children}</div></dialog>;
}
export function MediaPicker({ label, value, onChange, required = false, preview, onBusyChange, video = false }: {
    label: string;
    video?: boolean;
    value: number | null;
    onChange: (id: number | null) => void;
    required?: boolean;
    preview?: string;
    onBusyChange?: (busy:boolean)=>void;
}) {
    const [upload, setUpload] = useState<MediaRecord | null>(()=>value?selectedMediaCache.get(value)||null:null), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const initialId=useRef(value);
    useEffect(()=>{if(value&&value===initialId.current&&preview)selectedMediaCache.set(value,{id:value,url:preview});},[value,preview]);
    const [librarySearch,setLibrarySearch]=useState('');
    const [library,setLibrary]=useState<MediaPage|null>(null),[libraryPage,setLibraryPage]=useState(1),[libraryBusy,setLibraryBusy]=useState(false);
    async function browse(page=1,search=librarySearch){setLibraryBusy(true);setError('');try{setLibrary(await adminRequest<MediaPage>(`admin/media?type=${video?'video':'image'}&page=${page}&pageSize=12&search=${encodeURIComponent(search)}`));setLibraryPage(page)}catch(e){setError((e as Error).message)}finally{setLibraryBusy(false)}}
    const url = value ? safeUrl(upload?.id === value ? upload.url : selectedMediaCache.get(value)?.url || (value===initialId.current?preview:undefined)) : undefined;
    async function handle(file?: File) { if (!file)
        return; setError(''); if (!(video ? /\.(mp4|webm)$/i : /\.(png|jpe?g|webp|ico)$/i).test(file.name)) {
        setError(video ? 'اختر فيديو MP4 أو WebM.' : 'اختر صورة PNG أو JPG أو WEBP أو ICO.');
        return;
    } if (file.size > 3 * 1024 * 1024) {
        setError('حجم الملف يجب ألا يتجاوز 3 ميجابايت. للفيديو الكبير استخدم رابط YouTube أو Vimeo أو رابط MP4 مباشر.');
        return;
    } setBusy(true); onBusyChange?.(true); try {
        const body = new FormData();
        body.append('file', file);
        const result = await adminRequest<MediaRecord>('admin/media', { method: 'POST', body });
        selectedMediaCache.set(result.id,result);
        setUpload(result);
        onChange(result.id);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
        onBusyChange?.(false);
        if (input.current)
            input.current.value = '';
    } }
    return <div className={s.mediaPicker} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)void handle(e.dataTransfer.files[0]);}}><label>{label}{required && <b> *</b>}</label><div className={s.uploadRow}>{url ? video ? <video className={s.imagePreview} src={url} preload="none" controls playsInline/> : <img className={s.imagePreview} src={url} alt={label}/> : <div className={s.imagePlaceholder}><ImageIcon size={24}/></div>}<div><button type="button" className={s.secondary} onClick={() => input.current?.click()} disabled={busy}>{busy ? <LoaderCircle className={s.spin} size={17}/> : <Upload size={17}/>} {busy ? 'جاري الرفع…' : value ? 'تغيير الملف' : video ? 'رفع فيديو' : 'رفع صورة'}</button><p className={s.hint}>{value ? `ملف محدد من المكتبة #${value}` : video ? 'MP4، WebM • حتى 3 MB' : 'PNG، JPG، WEBP، ICO • حتى 3 MB'}</p></div>{value && !required && <button type="button" className={s.iconButton} onClick={() => { onChange(null); setUpload(null); }} aria-label="إزالة الصورة من المحتوى"><X size={18}/></button>}</div><input className={s.hidden} ref={input} type="file" accept={video ? ".mp4,.webm" : ".png,.jpg,.jpeg,.webp,.ico"} onChange={e => handle(e.target.files?.[0])}/><details className={s.existingMedia} onToggle={e=>{if(e.currentTarget.open&&!library&&!libraryBusy)void browse()}}><summary>اختيار من مكتبة الوسائط</summary><div className={s.libraryPickerSearch}><input aria-label={`بحث في مكتبة ${label}`} value={librarySearch} placeholder="ابحث باسم الملف" onChange={e=>setLibrarySearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void browse(1);}}}/><button type="button" className={s.secondary} disabled={libraryBusy} onClick={()=>browse(1)}>بحث</button></div>{libraryBusy?<Loading/>:library&&<><div className={s.mediaLibraryGrid}>{library.items.map(file=><button key={file.id} type="button" aria-pressed={value===file.id} onClick={()=>{selectedMediaCache.set(file.id,file);setUpload(file);onChange(file.id)}}>{!video&&safeUrl(file.url)?<img src={safeUrl(file.url)} alt={file.originalFileName||`صورة ${file.id}`} loading="lazy"/>:<span>فيديو #{file.id}</span>}<small>{file.originalFileName||`ملف ${file.id}`}</small></button>)}</div>{!library.items.length&&<p className={s.hint}>لا توجد ملفات من هذا النوع. ارفع ملفًا جديدًا.</p>}<div className={s.cardActions}><button type="button" className={s.secondary} disabled={libraryBusy||libraryPage<=1} onClick={()=>browse(libraryPage-1)}>السابق</button><span>{libraryPage} / {Math.max(1,Math.ceil(library.totalCount/12))}</span><button type="button" className={s.secondary} disabled={libraryBusy||libraryPage*12>=library.totalCount} onClick={()=>browse(libraryPage+1)}>التالي</button></div></>}</details><details className={s.existingMedia}><summary>خيارات متقدمة</summary><p className={s.hint}>للاستخدام المتقدم فقط. اختيار الملف من المكتبة يعرض معاينته مباشرة.</p><input aria-label={`رقم ${label}`} type="number" min="1" value={value ?? ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}/></details><ErrorNotice message={error}/></div>;
}
export function ActiveBadge({ active }: {
    active: boolean;
}) { return <span className={`${s.badge} ${active ? s.badgeActive : s.badgeMuted}`}>{active ? 'ظاهر على الموقع' : 'مسودة / مخفي'}</span>; }
