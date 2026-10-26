const KEY='la-inquiry-source-v1';
type Source=Record<string,string>;
/** Keep only campaign labels and the referring hostname; never store form data or full URLs. */
export function captureLeadSource(){
 try{
  if(sessionStorage.getItem(KEY))return;
  const query=new URLSearchParams(window.location.search),source:Source={};
  for(const key of ['utm_source','utm_medium','utm_campaign']){const value=query.get(key);if(value)source[key]=value.replace(/[\r\n]/g,' ').slice(0,80);}
  if(document.referrer){const ref=new URL(document.referrer);if(ref.hostname!==window.location.hostname)source.referrer=ref.hostname.slice(0,120);}
  if(Object.keys(source).length)sessionStorage.setItem(KEY,JSON.stringify(source));
 }catch{/* The form also works when browser storage is unavailable. */}
}
export function leadSourceSummary(){
 captureLeadSource();
 const query=new URLSearchParams(window.location.search),source:Source={};
 try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'{}');for(const key of ['utm_source','utm_medium','utm_campaign','referrer'])if(typeof saved[key]==='string')source[key]=saved[key];}catch{}
 const guide=query.get('guide');if(guide)source.guide=guide;
 return Object.entries(source).map(([key,value])=>`${key}: ${value.replace(/[\r\n]/g,' ').slice(0,120)}`).join(' | ');
}
