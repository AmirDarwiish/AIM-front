'use client';
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import PhoneField from './phone-field';
import { leadSourceSummary } from '@/lib/lead-attribution';
import {normalizeContactPhone} from '@/lib/phone-number';
import type { Lang } from '@/lib/public-api';
type Props={lang:Lang;enabled?:boolean;services?:{id:string;title:string}[];initialService?:string};
export default function Contact({lang,enabled=true,services=[],initialService=''}:Props){
 const en=lang==='en';const [busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy||sent||!enabled)return;const form=new FormData(e.currentTarget);setError('');
 const phone=normalizeContactPhone(String(form.get('phone')||''),String(form.get('phoneCountry')||'eg'));
 if(!phone){setError(en?'Enter a valid phone number for your selected country.':'اكتب رقم هاتف صحيح للدولة اللي اخترتها.');return;}
 if(String(form.get('name')).trim().length<2||!String(form.get('message')).trim()){setError(en?'Please enter your name and project details.':'اكتب اسمك وتفاصيل المشروع.');return;}
 setBusy(true);
 const source=leadSourceSummary();
 const selected=services.find(s=>s.id===form.get('service'))?.title;
 const details=[selected?`${en?'Service':'الخدمة'}: ${selected}`:'',form.get('location')?`${en?'Location':'الموقع'}: ${String(form.get('location')).trim()}`:'',String(form.get('message')).trim(),source?`[${source}]`:''].filter(Boolean).join('\n\n');
 try{
 const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestType:2,fullName:String(form.get('name')).trim(),phone,email:String(form.get('email')||'').trim()||undefined,message:details})});
 const data=await res.json().catch(()=>({})) as {success?:boolean;errors?:Record<string,string[]>;error?:string;message?:string};
 if(res.status===429)throw new Error(en?'Too many inquiries. Please wait a minute before trying again.':'طلبات كتير في وقت قصير. انتظر دقيقة وحاول تاني.');
 if(!res.ok||data.success!==true)throw new Error(Object.values(data.errors||{}).flat().join(' • ')||data.error||data.message||(en?'Unable to send your inquiry. Please try again.':'تعذر إرسال الطلب. حاول مرة أخرى.'));setSent(true);window.dispatchEvent(new CustomEvent('la:inquiry-success',{detail:{service:form.get('service')||'general',language:lang}}));
 }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <form className="la-contact-form" onSubmit={submit} aria-label={en?'Project inquiry':'استفسار عن مشروع'}><p className="la-form-reassurance">{en?'Tell us what you need. Your contact details will be used to follow up on this inquiry.':'قولنا محتاج إيه. بيانات التواصل هتُستخدم لمتابعة استفسارك عن المشروع.'}</p><fieldset disabled={busy||sent||!enabled}><div className="la-fields"><label>{en?'Full name *':'الاسم بالكامل *'}<input name="name" autoComplete="name" placeholder={en?'Your full name':'اكتب اسمك بالكامل'} required minLength={2} maxLength={200}/></label><PhoneField lang={lang}/><label className="la-full">{en?'Email address':'البريد الإلكتروني'}<input name="email" type="email" autoComplete="email" dir="ltr" placeholder="name@example.com" maxLength={254}/></label><label>{en?'Service of interest':'الخدمة المطلوبة'}<select name="service" defaultValue={initialService}><option value="">{en?'General inquiry':'استفسار عام'}</option>{services.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>{en?'Project location':'موقع المشروع'}<input name="location" autoComplete="off" placeholder={en?'City or area':'المدينة أو المنطقة'} maxLength={200}/></label><label className="la-full">{en?'Tell us about your project *':'تفاصيل مشروعك *'}<textarea name="message" placeholder={en?'Describe the space and the work you have in mind…':'احكي لنا عن المكان والأعمال اللي محتاجها…'} required rows={5} maxLength={1200}/><small className="la-form-hint">{en?'Share the space, scope and priorities you have in mind.':'اكتب نوع المكان والأعمال المطلوبة والأولويات اللي في بالك.'}</small></label></div></fieldset><div role="status" aria-live="polite">{sent?<div className="la-success"><strong>{en?'Thank you. Your inquiry has been received.':'شكرًا لك، تم استلام رسالتك.'}</strong><p>{en?'Our team will review the details and contact you using the information you provided.':'فريق الشركة هيراجع التفاصيل ويتواصل معاك على البيانات المسجلة.'}</p></div>:<button className="la-button la-button-dark" disabled={busy||!enabled}>{busy?<LoaderCircle size={19} className="la-loading-icon"/>:<ArrowUpRight size={19}/>} {busy?(en?'Sending…':'جاري الإرسال…'):(en?'Request a quotation':'اطلب عرض سعر')}</button>}</div>{!enabled&&<p className="la-error">{en?'Inquiries will be enabled once company content is connected.':'إرسال الاستفسارات هيتفعّل بعد ربط محتوى الشركة.'}</p>}{error&&<p className="la-error" role="alert">{error}</p>}</form>;
}
