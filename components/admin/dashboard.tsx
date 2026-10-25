'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { LayoutDashboard, Inbox, Images, Layers, Tags, MapPin, Image as ImageIcon, Settings as SettingsIcon, LogOut, ExternalLink, ChevronLeft, ShieldCheck, ArrowUpLeft, LoaderCircle, Eye, EyeOff, Menu, X, RefreshCw, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { adminRequest, write, type AdminUser, type RecordData } from '@/lib/admin-api';
import { Loading, ErrorNotice } from './shared';
import { ContentManager, Settings } from './content';
import { Leads, Overview } from './leads';
import Media from './media';
import ProjectManager from './projects';
import s from './admin.module.css';
const navigation = [{ id:'overview',label:'نظرة عامة',description:'ملخص استفسارات العملاء وإدارة الموقع.',icon:LayoutDashboard },{id:'projects',label:'المشاريع',description:'وصف المشاريع وصورها وفيديوهاتها وترتيبها ونشرها.',icon:Layers},{id:'leads',label:'طلبات التواصل',description:'رسائل العملاء واستفسارات المشاريع.',icon:Inbox},{id:'sliders',label:'واجهة البداية',description:'صور ورسائل البداية بالعربية والإنجليزية.',icon:Images},{id:'sections',label:'أقسام الموقع',description:'محتوى الشركة وخدماتها بالعربية والإنجليزية.',icon:Layers},{id:'media',label:'الميديا',description:'رفع صور الموقع.',icon:ImageIcon},{id:'settings',label:'إعدادات الموقع',description:'الهوية وبيانات التواصل وروابط التواصل الاجتماعي.',icon:SettingsIcon}];
function Login({ onLogin }: {
    onLogin: (user: AdminUser) => void;
}) {
    const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [visible, setVisible] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
    async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try {
        onLogin(await write<AdminUser>('session', 'POST', { email, password }));
        setPassword('');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <div className={s.login}><div className={s.loginStory}><Link href="/" className={s.whiteBrand}><img src="/assets/la-mark.svg" alt=""/><span>LA Construction</span></Link><div><span className={s.eyebrow}>لوحة تحكم الموقع</span><h1>كل مشروع.<br />يحكي عنك.</h1><p>مساحتك لإدارة المحتوى، استقبال العملاء،<br />وصناعة أول انطباع يليق بعلامتك.</p></div><div className={s.loginOrbit} aria-hidden="true"><div /><div /><img src="/assets/la-mark.svg" alt=""/></div><small>LA CONSTRUCTION · WEBSITE ADMIN</small></div><div className={s.loginPanel}><div className={s.loginForm}><span className={s.loginMark}><ShieldCheck size={24}/></span><h2>أهلًا بيك تاني</h2><p>سجّل دخولك وابدأ إدارة موقعك.</p><form onSubmit={submit}><label>البريد الإلكتروني<input type="email" autoComplete="username" required dir="ltr" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"/></label><label>كلمة المرور<div className={s.password}><input type={visible ? 'text' : 'password'} required autoComplete="current-password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label><ErrorNotice message={error}/><button className={s.loginSubmit} disabled={busy}>{busy ? <LoaderCircle className={s.spin} size={19}/> : null}{busy ? 'جاري تسجيل الدخول…' : 'دخول لوحة التحكم'}<ArrowUpLeft size={19}/></button></form><Link className={s.returnLink} href="/">العودة إلى الموقع <ChevronLeft size={16}/></Link></div><small className={s.loginFooter}>إدارة الموقع تبدأ من هنا.</small></div></div>;
}
export default function Dashboard() {
    const [user, setUser] = useState<AdminUser | null>(null), [checking, setChecking] = useState(true), [sessionError, setSessionError] = useState(''), [active, setActive] = useState('overview'), [menu, setMenu] = useState(false), [section, setSection] = useState<RecordData | null>(null), [revision, setRevision] = useState(0), [logoutBusy, setLogoutBusy] = useState(false), [logoutError, setLogoutError] = useState('');
    const [collapsed,setCollapsed]=useState(false);
    useEffect(()=>{if(!menu)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenu(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu]);
    function check() { return adminRequest<AdminUser>('session').then(setUser).catch(e => { if ((e as {
        status?: number;
    }).status !== 401)
        setSessionError((e as Error).message); }).finally(() => setChecking(false)); }
    useEffect(() => { document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl'; void check(); const expired = () => { setUser(null); setSection(null); setActive('overview'); }; window.addEventListener('aim-session-expired', expired); return () => window.removeEventListener('aim-session-expired', expired); }, []);
    useEffect(() => { function readHash() { const id = window.location.hash.slice(1); if (navigation.some(n => n.id === id)) {
        setActive(id);
        setSection(null);
    } } readHash(); window.addEventListener('hashchange', readHash); return () => window.removeEventListener('hashchange', readHash); }, []);
    function navigate(id: string) { setActive(id); setSection(null); setMenu(false); window.history.replaceState(null, '', `#${id}`); }
    async function logout() { setLogoutBusy(true); setLogoutError(''); try {
        await write('session', 'DELETE');
        setUser(null);
        setSection(null);
        setActive('overview');
    }
    catch (e) {
        setLogoutError((e as Error).message);
    }
    finally {
        setLogoutBusy(false);
    } }
    const current = navigation.find(n => n.id === active) || navigation[0];
    if (checking)
        return <div className={s.root}><div className={s.sessionLoading}><Loading /></div></div>;
    if (!user)
        return <div className={s.root}>{sessionError && <ErrorNotice message={sessionError} retry={check}/>}<Login onLogin={setUser}/></div>;
    return <div className={s.root}><div className={`${s.shell} ${collapsed?s.collapsed:''}`}>{menu && <button className={s.scrim} onClick={() => setMenu(false)} aria-label="إغلاق القائمة"/>}<aside id="admin-sidebar" className={`${s.sidebar} ${menu ? s.sidebarOpen : ''}`}><Link className={s.brand} href="/" aria-label="LA Construction"><img src="/assets/la-mark.svg" alt=""/><div><strong>LA Construction</strong><small>لوحة تحكم الموقع</small></div></Link><button className={s.mobileClose} onClick={() => setMenu(false)} aria-label="إغلاق القائمة"><X size={22}/></button><span className={s.navCaption}>مساحة الإدارة</span><nav aria-label="صفحات لوحة التحكم">{navigation.map(({ id, label, icon: Icon }) => <Link key={id} href={`#${id}`} onClick={e => { e.preventDefault(); navigate(id); }} aria-label={label} title={label} aria-current={active === id ? 'page' : undefined} className={`${s.navItem} ${active === id ? s.navActive : ''}`}><Icon size={20}/><span className={s.navText}>{label}</span>{active === id && <span className={s.navDot}/>}</Link>)}</nav><div className={s.sidebarBottom}><Link className={s.siteLink} aria-label="معاينة الموقع" title="معاينة الموقع" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/><span>معاينة الموقع</span></Link><div className={s.user}><span className={s.smallAvatar}>{user.fullName.slice(0, 1)}</span><div className={s.userInfo}><strong>{user.fullName}</strong><small>حساب الإدارة</small></div><button className={s.iconButton} onClick={logout} disabled={logoutBusy} aria-label="تسجيل الخروج"><LogOut size={18}/></button></div></div></aside><div className={s.main}><header className={s.topbar}><div><button className={s.collapseToggle} onClick={()=>setCollapsed(value=>!value)} aria-label={collapsed?'فتح السايد بار':'طي السايد بار'} title={collapsed?'فتح السايد بار':'طي السايد بار'} aria-expanded={!collapsed} aria-controls="admin-sidebar">{collapsed?<PanelRightOpen size={22}/>:<PanelRightClose size={22}/>}</button><button className={s.mobileMenu} onClick={() => setMenu(value=>!value)} aria-expanded={menu} aria-controls="admin-sidebar" aria-label={menu?'إغلاق القائمة':'فتح القائمة'}><Menu size={22}/></button><span>لوحة التحكم</span><ChevronLeft size={14}/><strong>{current.label}</strong></div><Link href="/" target="_blank" rel="noopener noreferrer">عرض الموقع <ExternalLink size={15}/></Link></header><main className={s.workspace}><ErrorNotice message={logoutError}/><div className={s.pageHeading}><div><span className={s.eyebrow}>LA CONSTRUCTION / ADMIN</span><h1>{section ? `عناصر ${String(section.titleAr || section.sectionKey)}` : current.label}</h1><p>{section ? 'إدارة البطاقات والعناصر التي تظهر داخل القسم.' : current.description}</p></div><button className={s.secondary} onClick={() => setRevision(r => r + 1)}><RefreshCw size={17}/> تحديث</button></div>{section && <button className={s.backButton} onClick={() => setSection(null)}>الرجوع للأقسام <ChevronLeft size={16}/></button>}<div key={`${active}-${revision}-${section?.id || ''}`} className={active === 'overview' ? undefined : s.panel}>{active === 'overview' ? <Overview onLeads={() => navigate('leads')} onContent={() => navigate('sliders')}/> : active === 'projects' ? <ProjectManager /> : active === 'leads' ? <Leads /> : active === 'settings' ? <Settings /> : active === 'media' ? <Media /> : active === 'sections' ? <ContentManager kind={section ? 'items' : 'sections'} sectionId={section?.id} onItems={section ? undefined : setSection}/> : <ContentManager kind={active as 'sliders' | 'business-categories' | 'cities'}/>}</div><footer className={s.footer}>LA Construction <span>نبني بعناية. لنترك أثرًا يدوم.</span></footer></main></div></div></div>;
}
