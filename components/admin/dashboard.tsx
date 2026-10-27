'use client';
import Link from 'next/link';
import { useEffect, useState, useRef, type FormEvent } from 'react';
import { LayoutDashboard, Inbox, Images, Building2, Wrench, FileText, Image as ImageIcon, Settings as SettingsIcon, LogOut, ExternalLink, ChevronLeft, ShieldCheck, ArrowUpLeft, LoaderCircle, Eye, EyeOff, Menu, X, RefreshCw, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { adminRequest, write, type AdminUser, type RecordData } from '@/lib/admin-api';
import { Loading, ErrorNotice } from './shared';
import { ContentWorkspace, Settings } from './content';
import { Leads, Overview } from './leads';
import Media from './media';
import ProjectManager from './projects';
import s from './admin.module.css';
import { useAdminNavigation } from './editor-tools';
import { adminLabels, adminListPath, type AdminRoute } from '@/lib/admin-navigation';
const navigation = [{ id:'overview',label:'نظرة عامة',description:'ملخص استفسارات العملاء وإدارة الموقع.',icon:LayoutDashboard },{id:'projects',label:'المشاريع',description:'وصف المشاريع وصورها وفيديوهاتها وترتيبها ونشرها.',icon:Building2},{id:'services',label:'خدمات الشركة',description:'خدمات المقاولات والتشطيب ووصف كل خدمة باللغتين.',icon:Wrench},{id:'leads',label:'استفسارات المشاريع',description:'رسائل العملاء واستفسارات المشاريع.',icon:Inbox},{id:'sliders',label:'السلايدر الرئيسي',description:'صور ورسائل البداية بالعربية والإنجليزية.',icon:Images},{id:'sections',label:'صفحات الموقع',description:'محتوى الشركة والخدمات وآراء العملاء وقبل وبعد وفيديوهات التنفيذ.',icon:FileText},{id:'media',label:'مكتبة الوسائط',description:'كل الصور والفيديوهات، والبحث وإعادة الاستخدام داخل المحتوى.',icon:ImageIcon},{id:'settings',label:'إعدادات الموقع',description:'الهوية وبيانات التواصل وروابط التواصل الاجتماعي.',icon:SettingsIcon}];
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
export default function Dashboard({route}:{route:AdminRoute}){
 const [user,setUser]=useState<AdminUser|null>(null),[checking,setChecking]=useState(true),[sessionError,setSessionError]=useState(''),[menu,setMenu]=useState(false),[compact,setCompact]=useState(false),[collapsed,setCollapsed]=useState(false),[revision,setRevision]=useState(0),[logoutBusy,setLogoutBusy]=useState(false),[logoutError,setLogoutError]=useState('');
 const dirty=useRef(false),go=useAdminNavigation();
 useEffect(()=>{const query=window.matchMedia('(max-width:900px)'),sync=()=>setCompact(query.matches);sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync);},[]);
 const active=route.resource==='items'?'sections':route.resource;
 const current=navigation.find(n=>n.id===active)||navigation[0];
 const noun=({projects:'مشروع',services:'خدمة',sliders:'شريحة',sections:'قسم',items:'عنصر',leads:'استفسار',media:'ملف'} as Record<string,string>)[route.resource]||current.label;
 const title=route.action==='list'?current.label:`${route.action==='new'?'إضافة':route.action==='edit'?'تعديل':'عرض'} ${noun}`;
 function canLeave(){return !dirty.current||window.confirm('عندك تغييرات لم تُحفظ. هل تريد تجاهلها والانتقال؟');}
 useEffect(()=>{const track=(e:Event)=>{dirty.current=!!(e as CustomEvent<boolean>).detail;};const guard=(e:Event)=>{if(!canLeave())e.preventDefault();};window.addEventListener('la-admin-dirty',track);window.addEventListener('la-admin-before-navigate',guard);return()=>{window.removeEventListener('la-admin-dirty',track);window.removeEventListener('la-admin-before-navigate',guard);};},[]);
 useEffect(()=>{setMenu(false);},[route.resource,route.action,route.id,route.sectionId]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menu]);
 function check(){setSessionError('');return adminRequest<AdminUser>('session').then(setUser).catch(e=>{if(e.status!==401)setSessionError(e.message);}).finally(()=>setChecking(false));}
 useEffect(()=>{document.documentElement.lang='ar';document.documentElement.dir='rtl';void check();const expired=()=>setUser(null);window.addEventListener('aim-session-expired',expired);return()=>window.removeEventListener('aim-session-expired',expired);},[]);
 useEffect(()=>{const id=window.location.hash.slice(1);if(navigation.some(n=>n.id===id)){window.history.replaceState(null,'',window.location.pathname);go(adminListPath(id as AdminRoute['resource']),true);}},[]);
 function navigate(id:string){go(adminListPath(id as AdminRoute['resource']));}
 async function logout(){if(!canLeave())return;setLogoutBusy(true);setLogoutError('');try{await write('session','DELETE');setUser(null);}catch(e){setLogoutError((e as Error).message);}finally{setLogoutBusy(false);}}
 if(checking)return <div className={s.root}><div className={s.sessionLoading}><Loading/></div></div>;
 if(!user)return <div className={s.root}>{sessionError&&<ErrorNotice message={sessionError} retry={check}/>}<Login onLogin={setUser}/></div>;
 return <div className={s.root}><div className={`${s.shell} ${collapsed?s.collapsed:''}`}>
 {menu&&<button className={s.scrim} onClick={()=>setMenu(false)} aria-label="إغلاق القائمة"/>}
 <aside id="admin-sidebar" inert={compact&&!menu} className={`${s.sidebar} ${menu?s.sidebarOpen:''}`}><Link className={s.brand} href="/" aria-label="LA Construction"><img src="/assets/la-mark.svg" alt=""/><div><strong>LA Construction</strong><small>لوحة تحكم الموقع</small></div></Link><button className={s.mobileClose} onClick={()=>setMenu(false)} aria-label="إغلاق القائمة"><X size={22}/></button><span className={s.navCaption}>إدارة موقع الشركة</span><nav aria-label="صفحات لوحة التحكم">{navigation.map(({id,label,icon:Icon})=><Link key={id} href={adminListPath(id as AdminRoute['resource'])} onClick={e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(id);}} aria-label={label} title={label} aria-current={active===id?'page':undefined} className={`${s.navItem} ${active===id?s.navActive:''}`}><Icon size={20}/><span className={s.navText}>{label}</span>{active===id&&<span className={s.navDot}/>}</Link>)}</nav><div className={s.sidebarBottom}><Link className={s.siteLink} href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/><span>معاينة الموقع</span></Link><div className={s.user}><span className={s.smallAvatar}>{user.fullName.slice(0,1)}</span><div className={s.userInfo}><strong>{user.fullName}</strong><small>حساب الإدارة</small></div><button className={s.iconButton} onClick={logout} disabled={logoutBusy} aria-label="تسجيل الخروج"><LogOut size={18}/></button></div></div></aside>
 <div className={s.main} inert={compact&&menu}><header className={s.topbar}><div><button className={s.collapseToggle} onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'فتح السايد بار':'طي السايد بار'} aria-expanded={!collapsed} aria-controls="admin-sidebar">{collapsed?<PanelRightOpen size={22}/>:<PanelRightClose size={22}/>}</button><button className={s.mobileMenu} onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-controls="admin-sidebar" aria-label="القائمة"><Menu size={22}/></button><button type="button" className={s.breadcrumbButton} onClick={()=>navigate('overview')}>مساحة العمل</button><ChevronLeft size={14}/><button type="button" className={`${s.breadcrumbButton} ${s.currentBreadcrumb}`} onClick={()=>navigate(active)}>{current.label}</button>{route.action!=='list'&&<><ChevronLeft size={14}/><strong>{title}</strong></>}</div><Link href="/" target="_blank" rel="noopener noreferrer">عرض الموقع <ExternalLink size={15}/></Link></header>
 <main className={s.workspace}><ErrorNotice message={logoutError}/><div className={s.pageHeading}><div><span className={s.eyebrow}>LA CONSTRUCTION / WORKSPACE</span><h1>{title}</h1><p>{route.action==='list'?current.description:route.action==='view'?'تفاصيل السجل والمحتوى المحفوظ.':route.resource==='media'?'اختر الملف أو رابط الصورة، ثم احفظه في المكتبة.':'أدخل البيانات، راجع حالة الظهور، ثم احفظ التغييرات.'}</p></div>{route.action==='list'&&<button className={s.secondary} onClick={()=>{if(canLeave())setRevision(v=>v+1);}}><RefreshCw size={17}/>تحديث</button>}</div>
 <div key={`${JSON.stringify(route)}-${revision}`} className={active==='overview'?undefined:s.panel}>{active==='overview'?<Overview onNavigate={navigate}/>:active==='projects'?<ProjectManager route={route}/>:active==='leads'?<Leads route={route}/>:active==='settings'?<Settings/>:active==='media'?<Media route={route}/>:<ContentWorkspace route={route}/>}</div><footer className={s.footer}>LA Construction<span>نبني بعناية. لنترك أثرًا يدوم.</span></footer></main></div></div></div>;
}
