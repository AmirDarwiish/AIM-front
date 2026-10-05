'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, LoaderCircle, X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { adminRequest, type MediaRecord } from '@/lib/admin-api';
import { safeUrl } from '@/lib/public-api';
import s from './admin.module.css';
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
export function Modal({ title, children, onClose }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const el = ref.current; el?.showModal(); return () => el?.close(); }, []);
    return <dialog ref={ref} className={s.modal} onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="aim-dialog-title"><div className={s.modalHeader}><h2 id="aim-dialog-title">{title}</h2><button className={s.iconButton} onClick={onClose} aria-label="إغلاق"><X size={21}/></button></div><div className={s.modalBody}>{children}</div></dialog>;
}
export function MediaPicker({ label, value, onChange, required = false, preview, onBusyChange }: {
    label: string;
    value: number | null;
    onChange: (id: number | null) => void;
    required?: boolean;
    preview?: string;
    onBusyChange?: (busy:boolean)=>void;
}) {
    const [upload, setUpload] = useState<MediaRecord | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const initialId=useRef(value);
    const url = value ? safeUrl(upload?.id === value ? upload.url : value===initialId.current?preview:undefined) : undefined;
    async function handle(file?: File) { if (!file)
        return; setError(''); if (!/\.(png|jpe?g|webp|ico)$/i.test(file.name)) {
        setError('اختر صورة PNG أو JPG أو WEBP أو ICO.');
        return;
    } if (file.size > 3 * 1024 * 1024) {
        setError('حجم الصورة يجب ألا يتجاوز 3 ميجابايت.');
        return;
    } setBusy(true); onBusyChange?.(true); try {
        const body = new FormData();
        body.append('file', file);
        const result = await adminRequest<MediaRecord>('admin/media', { method: 'POST', body });
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
    return <div className={s.mediaPicker}><label>{label}{required && <b> *</b>}</label><div className={s.uploadRow}>{url ? <img className={s.imagePreview} src={url} alt={label}/> : <div className={s.imagePlaceholder}><ImageIcon size={24}/></div>}<div><button type="button" className={s.secondary} onClick={() => input.current?.click()} disabled={busy}>{busy ? <LoaderCircle className={s.spin} size={17}/> : <Upload size={17}/>} {busy ? 'جاري الرفع…' : value ? 'تغيير الصورة' : 'رفع صورة'}</button><p className={s.hint}>{value ? `الصورة المحفوظة #${value}` : 'PNG، JPG، WEBP، ICO • حتى 3 MB'}</p></div>{value && !required && <button type="button" className={s.iconButton} onClick={() => { onChange(null); setUpload(null); }} aria-label="إزالة الصورة من المحتوى"><X size={18}/></button>}</div><input className={s.hidden} ref={input} type="file" accept=".png,.jpg,.jpeg,.webp,.ico" onChange={e => handle(e.target.files?.[0])}/><details className={s.existingMedia}><summary>استخدام رقم صورة مرفوعة مسبقًا</summary><input aria-label={`رقم ${label}`} type="number" min="1" value={value ?? ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}/></details><ErrorNotice message={error}/></div>;
}
export function ActiveBadge({ active }: {
    active: boolean;
}) { return <span className={`${s.badge} ${active ? s.badgeActive : s.badgeMuted}`}>{active ? 'ظاهر على الموقع' : 'مخفي'}</span>; }
