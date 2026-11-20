'use client';
import { useState } from 'react';
import { importCompanyContent } from '@/lib/import-company-content';
import s from './admin.module.css';
export default function CompanyImport(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[backup,setBackup]=useState<string|null>(null),[done,setDone]=useState(false);
 async function run(){
  if(busy)return;setBusy(true);setDone(false);setError('');
  try{await importCompanyContent(setMessage,value=>setBackup(JSON.stringify(value,null,2)));setDone(true)}
  catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 function download(){if(!backup)return;const url=URL.createObjectURL(new Blob([backup],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='la-company-content-before-import.json';a.click();URL.revokeObjectURL(url)}
 return <section className={s.settingsGroup} style={{marginTop:32}} aria-labelledby="company-import-title"><h2 id="company-import-title">استيراد محتوى الشركة المعتمد</h2><p>إضافة 61 صورة فعلية للأمير وبيورتي وشقة AP ومبنى M وأعمال MEP، وتحديث المحتوى بالعربية والإنجليزية وبيانات التواصل. تُخفى المشاريع التجريبية الثلاثة وتُحفظ سجلاتها.</p><p className={s.hint}>ينفذ الاستيراد بصلاحيات الحساب الحالي. أبقِ الصفحة مفتوحة حتى الاكتمال. يمكنك استكمال المحاولة بعد أي خطأ دون إعادة رفع الصور المحفوظة.</p><div className={s.rowActions}><button type="button" className={s.primary} disabled={busy} onClick={()=>void run()}>{busy?'جاري الاستيراد…':done?'إعادة مزامنة المحتوى المعتمد':'استيراد المحتوى والصور المعتمدة'}</button>{backup&&<button type="button" className={s.secondary} onClick={download}>تنزيل نسخة المحتوى السابق</button>}</div>{message&&<p role="status" className={s.success}>{message}</p>}{error&&<p role="alert" className={s.error}>{error}</p>}</section>
}
