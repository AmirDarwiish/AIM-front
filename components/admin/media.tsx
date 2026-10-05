'use client';
import { useRef, useState } from 'react';
import { Upload, LoaderCircle, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { adminRequest, write, type MediaRecord } from '@/lib/admin-api';
import { safeUrl } from '@/lib/public-api';
import { ErrorNotice, Empty, Modal } from './shared';
import s from './admin.module.css';
export default function Media() {
    const [files, setFiles] = useState<MediaRecord[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(''), [deleting, setDeleting] = useState<MediaRecord | null>(null);
    const input = useRef<HTMLInputElement>(null);
    async function upload(file?: File) { if (!file)
        return; setError(''); setSuccess(''); if (!/\.(png|jpe?g|webp|ico)$/i.test(file.name) || file.size > 3 * 1024 * 1024) {
        setError('اختر صورة PNG أو JPG أو WEBP أو ICO بحجم لا يتجاوز 3 ميجابايت.');
        return;
    } setBusy(true); try {
        const body = new FormData();
        body.append('file', file);
        const data = await adminRequest<MediaRecord>('admin/media', { method: 'POST', body });
        setFiles(f => [data, ...f]);
        setSuccess('تم رفع الصورة. يمكنك استخدامها في السلايدر أو أقسام الموقع.');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
        if (input.current)
            input.current.value = '';
    } }
    async function remove() { if (!deleting)
        return; setBusy(true); setError(''); try {
        await write(`admin/media/${deleting.id}`, 'DELETE');
        setFiles(f => f.filter(x => x.id !== deleting.id));
        setDeleting(null);
        setSuccess('تم حذف الصورة من السجل.');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function copy(file: MediaRecord) { try {
        await navigator.clipboard.writeText(String(file.id));
        setSuccess(`تم نسخ رقم الصورة #${file.id}.`);
    }
    catch {
        setError('تعذر النسخ التلقائي. يمكنك نسخ رقم الصورة من البطاقة.');
    } }
    return <><div className={s.uploadArea}><div className={s.emptyIcon}><Upload size={28}/></div><h3>صور تعكس هوية علامتك</h3><p>ارفع صور الموقع هنا، أو مباشرة داخل نموذج السلايدر والقسم.</p><button className={s.primary} disabled={busy} onClick={() => input.current?.click()}>{busy ? <LoaderCircle size={17} className={s.spin}/> : <Upload size={17}/>} {busy ? 'جاري الرفع…' : 'اختيار صورة'}</button><small>PNG، JPG، WEBP، ICO • حتى 3 MB</small><input ref={input} className={s.hidden} type="file" accept=".png,.jpg,.jpeg,.webp,.ico" onChange={e => upload(e.target.files?.[0])}/></div>{success && <div className={s.success} role="status">{success}</div>}{!deleting && <ErrorNotice message={error}/>}<div className={s.tableHeading}><h3>صور رفعتها في هذه الجلسة</h3><span>{files.length} صور</span></div><p className={s.hint}>الصور تظل محفوظة على السيرفر. عرض جميع الصور السابقة يحتاج إضافة مسار مكتبة الصور في الباك إند.</p>{files.length ? <div className={s.contentGrid}>{files.map(file => <article key={file.id} className={s.contentCard}><div className={s.slideImage}>{safeUrl(file.url) ? <img src={safeUrl(file.url)} alt={`صورة #${file.id}`}/> : <ImageIcon size={30}/>}</div><div className={s.contentBody}><h3>صورة #{file.id}</h3><div className={s.cardActions}><button className={s.secondary} onClick={() => copy(file)}><Copy size={15}/> نسخ الرقم</button><button className={`${s.iconButton} ${s.danger}`} onClick={() => { setError(''); setDeleting(file); }} aria-label={`حذف الصورة ${file.id}`}><Trash2 size={17}/></button></div></div></article>)}</div> : <Empty title="جاهز لأول صورة؟" description="الصور التي ترفعها هنا ستظهر في هذه المساحة."/>}{deleting && <Modal title="حذف الصورة" onClose={() => { if (!busy)
        setDeleting(null); }}><p>هل تريد حذف الصورة #{deleting.id}؟ السيرفر يمنع حذف الصور المستخدمة في محتوى الموقع.</p><ErrorNotice message={error}/><div className={s.formActions}><button className={s.dangerButton} onClick={remove} disabled={busy}>{busy ? 'جاري الحذف…' : 'تأكيد الحذف'}</button><button className={s.secondary} onClick={() => setDeleting(null)} disabled={busy}>إلغاء</button></div></Modal>}</>;
}
