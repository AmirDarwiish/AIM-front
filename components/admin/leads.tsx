'use client';
import { AdminSelect, FilterSummary } from './data-controls';
import { useEffect, useState, type FormEvent } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageSquare, ArrowUpLeft, Save, Send, Phone, Mail, Building2, CheckCircle2, Clock3, Users, Inbox } from 'lucide-react';
import { type LeadRecord, type PageResult, type LeadActivity, type RecordData, statuses, statusValue, statusLabel, requestLabel, dateLabel, write } from '@/lib/admin-api';
import { useRemote, Loading, ErrorNotice, Empty, Modal } from './shared';
import { Readiness, EditorPage, TablePagination, useAdminNavigation } from './editor-tools';
import type { AdminRoute } from '@/lib/admin-navigation';
import type { SiteContent } from '@/lib/construction';
import s from './admin.module.css';
const emptyPage: PageResult = { items: [], totalCount: 0, page: 1, pageSize: 20 };
function Badge({ value }: {
    value: string | number;
}) { return <span className={`${s.badge} ${s[`status${statusValue(value)}`]}`}>{statusLabel(value)}</span>; }
function LeadDetail({ lead, onClose, onChanged }: {
    lead: LeadRecord;
    onClose: () => void;
    onChanged: () => void;
}) {
    const details = useRemote<LeadRecord>(`admin/leads/${lead.id}`, lead), activity = useRemote<LeadActivity>(`admin/leads/${lead.id}/notes`, { notes: [], statusHistory: [] });
    const [status, setStatus] = useState(statusValue(lead.status)), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
    async function changeStatus(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); setSuccess(''); try {
        await write(`admin/leads/${lead.id}/status`, 'PATCH', { status });
        details.reload();
        activity.reload();
        onChanged();
        setSuccess('تم تحديث الحالة.');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function addNote(e: FormEvent) { e.preventDefault(); if (!note.trim())
        return; setBusy(true); setError(''); setSuccess(''); try {
        await write(`admin/leads/${lead.id}/notes`, 'POST', { content: note.trim() });
        setNote('');
        activity.reload();
        setSuccess('تمت إضافة الملاحظة.');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    const d = details.data;
    const phone = /^\+?[\d\s()-]+$/.test(d.phone) ? `tel:${d.phone.replace(/[\s()-]/g, '')}` : undefined;
    return <EditorPage title={`استفسار مشروع #${lead.id}`} busy={busy} dirty={!!note.trim()||status!==statusValue(d.status)} onClose={() => { if (!busy)
        onClose(); }}><ErrorNotice message={details.error} retry={details.reload}/><div className={s.leadIdentity}><div className={s.avatar}>{d.fullName?.slice(0, 1)}</div><div><h3>{d.fullName}</h3><p>{requestLabel(d.requestType)} • {dateLabel(d.createdAtUtc)}</p></div><Badge value={d.status}/></div><div className={s.detailGrid}><div><Phone size={17}/><span>رقم الهاتف<strong dir="ltr">{phone ? <a href={phone}>{d.phone}</a> : d.phone}</strong></span></div>{d.email && <div><Mail size={17}/><span>البريد الإلكتروني<strong dir="ltr"><a href={`mailto:${encodeURIComponent(d.email)}`}>{d.email}</a></strong></span></div>}</div>{d.message && <div className={s.messageBox}><span>رسالة العميل</span><p>{d.message}</p></div>}<form className={s.statusForm} onSubmit={changeStatus}><label>حالة الطلب<AdminSelect disabled={busy} aria-label="حالة الطلب" value={status} onValueChange={value => setStatus(Number(value))}>{statuses.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}</AdminSelect></label><button className={s.primary} disabled={busy || status === statusValue(d.status)}><Save size={16}/> تحديث الحالة</button></form><ErrorNotice message={error}/>{success && <div className={s.success} role="status">{success}</div>}<div className={s.activityHeading}><MessageSquare size={19}/><h3>الملاحظات وسجل المتابعة</h3></div><form onSubmit={addNote} className={s.noteForm}><label>ملاحظة داخلية<textarea required rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="اكتب ملخص التواصل أو الخطوة القادمة…"/></label><button className={s.secondary} disabled={busy || !note.trim()}><Send size={16}/> إضافة الملاحظة</button></form><ErrorNotice message={activity.error} retry={activity.reload}/>{activity.loading ? <Loading /> : <div className={s.timeline}>{[...(activity.data.notes || []).map(n => ({ id: `n${n.id}`, date: n.createdAtUtc, title: 'ملاحظة داخلية', content: n.content })), ...(activity.data.statusHistory || []).map(h => ({ id: `h${h.id}`, date: h.changedAtUtc, title: 'تغيير الحالة', content: `من ${statusLabel(h.previousStatus)} إلى ${statusLabel(h.newStatus)}` }))].sort((a, b) => b.date.localeCompare(a.date)).map(n => <article key={n.id}><span className={s.timelineDot}/><div><strong>{n.title}</strong><small>{dateLabel(n.date)}</small><p>{n.content}</p></div></article>)}{!activity.data.notes?.length && !activity.data.statusHistory?.length && <p className={s.hint}>لم تتم إضافة ملاحظات أو تغييرات بعد.</p>}</div>}</EditorPage>;
}
export function Leads({route}:{route:AdminRoute}) {
 if(route.action==='view')return <LeadRecordPage id={route.id!}/>;
 return <LeadTable/>;
}
function LeadRecordPage({id}:{id:number}){const go=useAdminNavigation(),remote=useRemote<LeadRecord>(`admin/leads/${id}`,{id,fullName:'',phone:'',requestType:2,status:1,createdAtUtc:''});if(remote.loading)return <Loading/>;if(remote.error)return <ErrorNotice message={remote.error} retry={remote.reload}/>;return <LeadDetail lead={remote.data} onClose={()=>go('/admin/leads')} onChanged={remote.reload}/>;}
function LeadTable() {
    const go=useAdminNavigation();
    const [search, setSearch] = useState(''), [debounced, setDebounced] = useState(''), [status, setStatus] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState(''), [page, setPage] = useState(1);
    useEffect(() => { const id = setTimeout(() => { setDebounced(search); setPage(1); }, 350); return () => clearTimeout(id); }, [search]);
    const query = new URLSearchParams({ page: String(page), pageSize: '20',requestType:'2' });
    if (debounced)
        query.set('search', debounced);
    if (status)
        query.set('status', status);
    if (from)
        query.set('createdFrom', from);
    if (to)
        query.set('createdTo', to);
    const remote = useRemote<PageResult>(`admin/leads?${query}`, emptyPage), pages = Math.max(1, Math.ceil(remote.data.totalCount / 20));
    return <><div className={s.filters}><label className={s.search}>البحث في الاستفسارات<Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني" aria-label="البحث عن طلب"/></label><label>الحالة<AdminSelect aria-label="تصفية حسب الحالة" value={status} onValueChange={value => { setStatus(value); setPage(1); }}><option value="">كل الحالات</option>{statuses.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}</AdminSelect></label><label>من تاريخ<input type="date" value={from} max={to || undefined} onChange={e => { setFrom(e.target.value); setPage(1); }}/></label><label>إلى تاريخ<input type="date" min={from || undefined} value={to} onChange={e => { setTo(e.target.value); setPage(1); }}/></label></div><FilterSummary total={remote.data.totalCount} active={!!search||!!status||!!from||!!to} onReset={()=>{setSearch('');setDebounced('');setStatus('');setFrom('');setTo('');setPage(1);}}/><ErrorNotice message={remote.error} retry={remote.reload}/>{remote.loading ? <Loading /> : !remote.error && <><div className={s.tableHeading}><h3>طلبات التواصل</h3><span>{remote.data.totalCount.toLocaleString('en-US')} طلب</span></div>{!remote.data.items?.length ? <Empty title="لا توجد طلبات مطابقة" description="الطلبات المرسلة من الموقع هتظهر هنا. يمكنك تغيير الفلاتر أو إعادة التحميل."/> : <div className={s.tableWrap}><table className={s.table}><thead><tr><th>العميل</th><th>الهاتف</th><th>الحالة</th><th>تاريخ الاستلام</th><th>التفاصيل</th></tr></thead><tbody>{remote.data.items.map(l => <tr key={l.id}><td><div className={s.customer}><span className={s.smallAvatar}>{l.fullName?.slice(0, 1)}</span><div><strong>{l.fullName}</strong><small>{l.email || `طلب #${l.id}`}</small></div></div></td><td dir="ltr">{l.phone}</td><td><Badge value={l.status}/></td><td>{dateLabel(l.createdAtUtc)}</td><td><button className={s.iconButton} onClick={() => go(`/admin/leads/${l.id}`)} aria-label={`عرض طلب ${l.fullName}`}><ArrowUpLeft size={19}/></button></td></tr>)}</tbody></table></div>}<TablePagination page={page} pages={pages} total={remote.data.totalCount} disabled={remote.loading} onChange={setPage}/></>}</>;
}
export function Overview({onNavigate}:{onNavigate:(id:string)=>void}){
 const all=useRemote<PageResult>('admin/leads?requestType=2&page=1&pageSize=5',emptyPage),fresh=useRemote<PageResult>('admin/leads?requestType=2&page=1&pageSize=1&status=1',emptyPage),progress=useRemote<PageResult>('admin/leads?requestType=2&page=1&pageSize=1&status=3',emptyPage),closed=useRemote<PageResult>('admin/leads?requestType=2&page=1&pageSize=1&status=4',emptyPage);
 const publicHome=useRemote<SiteContent>('public/website/home?lang=ar',{siteName:'',sliders:[],sections:[]});
 const projects=useRemote<RecordData[]>('admin/projects',[]),sections=useRemote<RecordData[]>('admin/sections',[]),settings=useRemote<RecordData>('admin/site-settings',{});
 const go=useAdminNavigation();
 const rows=Array.isArray(projects.data)?projects.data:[],content=Array.isArray(sections.data)?sections.data:[];
 const ready=[{label:'هوية الشركة والشعار',done:!!settings.data.siteNameAr&&!!settings.data.logoMediaId,target:'settings'},{label:'هاتف أو وسيلة تواصل مباشرة',done:!!(settings.data.contactPhone||settings.data.whatsappUrl||settings.data.contactEmail),target:'settings'},{label:'عنوان الشركة',done:!!settings.data.addressAr,target:'settings'},{label:'خدمات ظاهرة على الموقع',done:publicHome.data.sections.some(c=>c.sectionKey==='la-services'&&c.items.length>0),target:'services'},{label:'مشروع منشور بصورة غلاف',done:rows.some(p=>p.isPublished&&p.coverMediaId),target:'projects'},{label:'محتوى صفحة عن الشركة',done:content.some(c=>c.sectionKey==='la-about-story'&&c.isActive&&c.descriptionAr),target:'sections'}];
 const pending=ready.filter(x=>!x.done),healthLoading=projects.loading||sections.loading||settings.loading||publicHome.loading,healthError=projects.error||sections.error||settings.error||publicHome.error;
 const cards=[{label:'استفسارات المشاريع',remote:all,icon:Users},{label:'طلبات جديدة',remote:fresh,icon:Inbox},{label:'قيد المتابعة',remote:progress,icon:Clock3},{label:'طلبات مغلقة',remote:closed,icon:CheckCircle2}];
 return <><div className={s.welcome}><div><span className={s.eyebrow}>LA CONSTRUCTION / WORKSPACE</span><h2>أعمال تستحق الظهور.<br/>وإدارة تواكب طموحك.</h2><p>انشر مشاريعك، طوّر محتوى شركتك، وتابع كل فرصة جديدة من مكان واحد.</p><div className={s.welcomeActions}><button className={s.limeButton} onClick={()=>onNavigate('projects')}>إدارة المشاريع <ArrowUpLeft size={18}/></button><button className={s.welcomeSecondary} onClick={()=>onNavigate('sections')}>تحرير صفحات الموقع</button></div></div><div className={s.welcomeArt} aria-hidden="true"><div className={s.archGrid}/><img src="/assets/la-mark.svg" alt=""/><span className={s.workspaceSeal}>CONTENT · PROJECTS · CLIENTS</span></div></div><div className={s.kpiGrid}>{cards.map(({label,remote,icon:Icon})=><article key={label} className={s.kpi}><div><span>{label}</span><Icon size={20}/></div><strong>{remote.loading?'…':remote.error?'—':remote.data.totalCount.toLocaleString('ar-EG')}</strong><small>{remote.error?'تعذر تحميل البيانات':'من استفسارات موقع الشركة'}</small></article>)}</div><div className={s.overviewColumns}><section className={s.readinessPanel}><div className={s.tableHeading}><div><span className={s.eyebrow}>WEBSITE CHECKLIST</span><h3>اكتمال محتوى الموقع</h3></div><span>{healthLoading?'…':healthError?'غير متاح':`${ready.filter(x=>x.done).length} / ${ready.length}`}</span></div>{healthLoading?<Loading/>:healthError?<ErrorNotice message={healthError} retry={()=>{projects.reload();sections.reload();settings.reload();publicHome.reload();}}/>:<><Readiness checks={ready}/>{pending.length>0&&<button className={s.secondary} onClick={()=>onNavigate(pending[0].target)}>استكمال {pending[0].label}<ArrowUpLeft size={16}/></button>}</>}</section><section className={s.quickPanel}><span className={s.eyebrow}>QUICK ACCESS</span><h3>ماذا تريد أن تنجز اليوم؟</h3><div className={s.quickActions}>{[{id:'projects',title:'معرض المشاريع',text:projects.error?'تعذر تحميل العدد':`${rows.filter(p=>p.isPublished).length} منشور · ${rows.filter(p=>!p.isPublished).length} مسودة`,icon:Building2},{id:'services',title:'خدمات الشركة',text:'عناوين واضحة ووصف يقنع العميل',icon:CheckCircle2},{id:'media',title:'مكتبة الوسائط',text:'صور وفيديوهات قابلة لإعادة الاستخدام',icon:MessageSquare},{id:'settings',title:'هوية وبيانات الشركة',text:'الاسم والشعار ووسائل التواصل',icon:Users}].map(({id,title,text,icon:Icon})=><button key={id} onClick={()=>onNavigate(id)}><Icon size={21}/><span><strong>{title}</strong><small>{text}</small></span><ChevronLeft size={17}/></button>)}</div></section></div><div className={s.tableHeading}><div><h3>أحدث فرص المشاريع</h3><p>ابدأ بالطلبات الجديدة وسجّل نتيجة كل تواصل.</p></div><button className={s.secondary} onClick={()=>onNavigate('leads')}>كل الاستفسارات <ChevronLeft size={16}/></button></div><ErrorNotice message={all.error} retry={()=>{all.reload();fresh.reload();progress.reload();closed.reload();}}/>{all.loading?<Loading/>:!all.error&&(!all.data.items?.length?<Empty title="لا توجد استفسارات حتى الآن" description="طلبات العملاء من نموذج التواصل ستظهر هنا مع سجل المتابعة."/>:<div className={s.tableWrap}><table className={s.table}><thead><tr><th>العميل</th><th>الحالة</th><th>تاريخ الاستلام</th><th>الإجراء</th></tr></thead><tbody>{all.data.items.map(l=><tr key={l.id}><td><strong className={s.tableTitle}>{l.fullName}</strong><small className={s.tableSubtitle}>{l.email||'استفسار مشروع'}</small></td><td><Badge value={l.status}/></td><td>{dateLabel(l.createdAtUtc)}</td><td><button className={s.secondary} onClick={()=>go(`/admin/leads/${l.id}`)}>عرض التفاصيل<ChevronLeft size={16}/></button></td></tr>)}</tbody></table></div>)}</>;
}
