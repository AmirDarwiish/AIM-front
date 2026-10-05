'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Search, ChevronLeft, ChevronRight, MessageSquare, ArrowUpLeft, Save, Send, Phone, Mail, Building2, MapPin, CheckCircle2, Clock3, Users, Inbox } from 'lucide-react';
import { type LeadRecord, type PageResult, type LeadActivity, type RecordData, statuses, statusValue, statusLabel, requestLabel, dateLabel, write } from '@/lib/admin-api';
import { useRemote, Loading, ErrorNotice, Empty, Modal } from './shared';
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
    const lookups = useRemote<RecordData[]>('admin/lookups/business-categories', []), cities = useRemote<RecordData[]>('admin/lookups/cities', []);
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
    const category = lookups.data.find(x => x.id === d.businessCategoryId), city = cities.data.find(x => x.id === d.cityId);
    const phone = /^\+?[\d\s()-]+$/.test(d.phone) ? `tel:${d.phone.replace(/[\s()-]/g, '')}` : undefined;
    return <Modal title={`تفاصيل الطلب #${lead.id}`} onClose={() => { if (!busy)
        onClose(); }}><ErrorNotice message={details.error} retry={details.reload}/><div className={s.leadIdentity}><div className={s.avatar}>{d.fullName?.slice(0, 1)}</div><div><h3>{d.fullName}</h3><p>{requestLabel(d.requestType)} • {dateLabel(d.createdAtUtc)}</p></div><Badge value={d.status}/></div><div className={s.detailGrid}><div><Phone size={17}/><span>رقم الهاتف<strong dir="ltr">{phone ? <a href={phone}>{d.phone}</a> : d.phone}</strong></span></div>{d.email && <div><Mail size={17}/><span>البريد الإلكتروني<strong dir="ltr"><a href={`mailto:${encodeURIComponent(d.email)}`}>{d.email}</a></strong></span></div>}{d.businessName && <div><Building2 size={17}/><span>النشاط<strong>{d.businessName}{d.businessCategoryId && ` • ${String(category?.nameAr || `نوع #${d.businessCategoryId}`)}`}</strong></span></div>}{d.cityId && <div><MapPin size={17}/><span>المدينة<strong>{String(city?.nameAr || `مدينة #${d.cityId}`)}</strong></span></div>}</div>{d.message && <div className={s.messageBox}><span>رسالة العميل</span><p>{d.message}</p></div>}<form className={s.statusForm} onSubmit={changeStatus}><label>حالة الطلب<select value={status} onChange={e => setStatus(Number(e.target.value))}>{statuses.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}</select></label><button className={s.primary} disabled={busy || status === statusValue(d.status)}><Save size={16}/> تحديث الحالة</button></form><ErrorNotice message={error}/>{success && <div className={s.success} role="status">{success}</div>}<div className={s.activityHeading}><MessageSquare size={19}/><h3>الملاحظات وسجل المتابعة</h3></div><form onSubmit={addNote} className={s.noteForm}><label>ملاحظة داخلية<textarea required rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="اكتب ملخص التواصل أو الخطوة القادمة…"/></label><button className={s.secondary} disabled={busy || !note.trim()}><Send size={16}/> إضافة الملاحظة</button></form><ErrorNotice message={activity.error} retry={activity.reload}/>{activity.loading ? <Loading /> : <div className={s.timeline}>{[...(activity.data.notes || []).map(n => ({ id: `n${n.id}`, date: n.createdAtUtc, title: 'ملاحظة داخلية', content: n.content })), ...(activity.data.statusHistory || []).map(h => ({ id: `h${h.id}`, date: h.changedAtUtc, title: 'تغيير الحالة', content: `من ${statusLabel(h.previousStatus)} إلى ${statusLabel(h.newStatus)}` }))].sort((a, b) => b.date.localeCompare(a.date)).map(n => <article key={n.id}><span className={s.timelineDot}/><div><strong>{n.title}</strong><small>{dateLabel(n.date)}</small><p>{n.content}</p></div></article>)}{!activity.data.notes?.length && !activity.data.statusHistory?.length && <p className={s.hint}>لم تتم إضافة ملاحظات أو تغييرات بعد.</p>}</div>}</Modal>;
}
export function Leads() {
    const [search, setSearch] = useState(''), [debounced, setDebounced] = useState(''), [status, setStatus] = useState(''), [type, setType] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState(''), [page, setPage] = useState(1), [selected, setSelected] = useState<LeadRecord | null>(null);
    useEffect(() => { const id = setTimeout(() => { setDebounced(search); setPage(1); }, 350); return () => clearTimeout(id); }, [search]);
    const query = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (debounced)
        query.set('search', debounced);
    if (status)
        query.set('status', status);
    if (type)
        query.set('requestType', type);
    if (from)
        query.set('createdFrom', from);
    if (to)
        query.set('createdTo', to);
    const remote = useRemote<PageResult>(`admin/leads?${query}`, emptyPage), pages = Math.max(1, Math.ceil(remote.data.totalCount / 20));
    return <><div className={s.filters}><label className={s.search}><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم، الهاتف، البريد أو النشاط" aria-label="البحث عن طلب"/></label><label>الحالة<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">كل الحالات</option>{statuses.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}</select></label><label>نوع الطلب<select value={type} onChange={e => { setType(e.target.value); setPage(1); }}><option value="">كل الطلبات</option><option value="1">انضمام نشاط</option><option value="2">استفسار عام</option></select></label><label>من تاريخ<input type="date" value={from} max={to || undefined} onChange={e => { setFrom(e.target.value); setPage(1); }}/></label><label>إلى تاريخ<input type="date" min={from || undefined} value={to} onChange={e => { setTo(e.target.value); setPage(1); }}/></label><button className={s.secondary} onClick={() => { setSearch(''); setDebounced(''); setStatus(''); setType(''); setFrom(''); setTo(''); setPage(1); }}>مسح الفلاتر</button></div><ErrorNotice message={remote.error} retry={remote.reload}/>{remote.loading ? <Loading /> : !remote.error && <><div className={s.tableHeading}><h3>طلبات التواصل</h3><span>{remote.data.totalCount.toLocaleString('en-US')} طلب</span></div>{!remote.data.items?.length ? <Empty title="لا توجد طلبات مطابقة" description="الطلبات المرسلة من الموقع هتظهر هنا. يمكنك تغيير الفلاتر أو إعادة التحميل."/> : <div className={s.tableWrap}><table className={s.table}><thead><tr><th>العميل</th><th>نوع الطلب</th><th>الهاتف</th><th>الحالة</th><th>تاريخ الاستلام</th><th>التفاصيل</th></tr></thead><tbody>{remote.data.items.map(l => <tr key={l.id}><td><div className={s.customer}><span className={s.smallAvatar}>{l.fullName?.slice(0, 1)}</span><div><strong>{l.fullName}</strong><small>{l.businessName || l.email || `طلب #${l.id}`}</small></div></div></td><td>{requestLabel(l.requestType)}</td><td dir="ltr">{l.phone}</td><td><Badge value={l.status}/></td><td>{dateLabel(l.createdAtUtc)}</td><td><button className={s.iconButton} onClick={() => setSelected(l)} aria-label={`عرض طلب ${l.fullName}`}><ArrowUpLeft size={19}/></button></td></tr>)}</tbody></table></div>}<div className={s.pagination}><span>الصفحة {page} من {pages}</span><div><button className={s.secondary} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronRight size={16}/> السابق</button><button className={s.secondary} disabled={page >= pages} onClick={() => setPage(p => p + 1)}>التالي <ChevronLeft size={16}/></button></div></div></>}{selected && <LeadDetail key={selected.id} lead={selected} onClose={() => setSelected(null)} onChanged={remote.reload}/>}</>;
}
export function Overview({ onLeads, onContent }: {
    onLeads: () => void;
    onContent: () => void;
}) {
    const all = useRemote<PageResult>('admin/leads?page=1&pageSize=5', emptyPage), fresh = useRemote<PageResult>('admin/leads?page=1&pageSize=1&status=1', emptyPage), progress = useRemote<PageResult>('admin/leads?page=1&pageSize=1&status=3', emptyPage), closed = useRemote<PageResult>('admin/leads?page=1&pageSize=1&status=4', emptyPage);
    const [selected, setSelected] = useState<LeadRecord | null>(null);
    const cards = [{ label: 'إجمالي الطلبات', remote: all, icon: Users }, { label: 'طلبات جديدة', remote: fresh, icon: Inbox }, { label: 'قيد المتابعة', remote: progress, icon: Clock3 }, { label: 'طلبات مغلقة', remote: closed, icon: CheckCircle2 }];
    return <><div className={s.welcome}><div><span className={s.eyebrow}>كل شيء يبدأ من هنا</span><h2>مكان واحد لإدارة<br />حضورك على الخريطة.</h2><p>حدّث محتوى الموقع وتابع طلبات عملائك أولًا بأول.</p><button className={s.limeButton} onClick={onContent}>إدارة محتوى الموقع <ArrowUpLeft size={18}/></button></div><div className={s.welcomeArt} aria-hidden="true"><div className={s.orbitOne}/><div className={s.orbitTwo}/><img src="/assets/mark-primary.svg" alt=""/><span className={s.orbitPoint}><MapPin size={20}/></span><span className={s.orbitPointTwo}><Building2 size={20}/></span><span className={s.orbitPointThree}><MessageSquare size={19}/></span></div></div><div className={s.kpiGrid}>{cards.map(({ label, remote, icon: Icon }) => <article key={label} className={s.kpi}><div><span>{label}</span><Icon size={20}/></div><strong>{remote.loading ? '…' : remote.error ? 'غير متاح' : remote.data.totalCount.toLocaleString('en-US')}</strong><small>{remote.error ? 'تعذر تحميل العدد' : 'من طلبات الموقع'}</small></article>)}</div><div className={s.tableHeading}><div><h3>آخر الطلبات الواردة</h3><p>تابع أحدث الرسائل وطلبات انضمام الأنشطة.</p></div><button className={s.secondary} onClick={onLeads}>كل الطلبات <ChevronLeft size={16}/></button></div><ErrorNotice message={all.error} retry={() => { all.reload(); fresh.reload(); progress.reload(); closed.reload(); }}/>{all.loading ? <Loading /> : !all.error && (!all.data.items?.length ? <Empty title="لسه مفيش طلبات" description="أول طلب يوصل من الموقع هتلاقيه هنا."/> : <div className={s.recentList}>{all.data.items.map(l => <button key={l.id} className={s.recentLead} onClick={() => setSelected(l)}><div className={s.customer}><span className={s.smallAvatar}>{l.fullName?.slice(0, 1)}</span><div><strong>{l.fullName}</strong><small>{l.businessName || requestLabel(l.requestType)}</small></div></div><Badge value={l.status}/><span className={s.recentDate}>{dateLabel(l.createdAtUtc)}</span><ArrowUpLeft size={18}/></button>)}</div>)}{selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} onChanged={() => { all.reload(); fresh.reload(); progress.reload(); closed.reload(); }}/>}</>;
}
