export type Lang = 'ar' | 'en';
export type Item = {id:number;title:string;description?:string;imageUrl?:string;buttonText?:string;buttonUrl?:string;sortOrder:number};
export type Section = Item & {sectionKey:string;subtitle?:string;items:Item[]};
export type Slider = Item & {desktopImageUrl:string;mobileImageUrl?:string};
export type PlatformStatistics = {availableCountries?:number|null;registeredBusinesses?:number|null;users?:number|null;requests?:number|null};
export type HomeContent = {siteName:string;logoUrl?:string;faviconUrl?:string;appleAppStoreUrl?:string;googlePlayUrl?:string;sliders:Slider[];sections:Section[];statistics?:PlatformStatistics|null};
export type Lookup = {id:number;name:string};
export type CityLookup = Lookup & {countryId:number};
export type Lead = {requestType:1|2;fullName:string;phone:string;email?:string;businessName?:string;businessCategoryId?:number;countryId?:number;cityId?:number;message?:string};
export class ApiError extends Error {constructor(public status:number, public fields:Record<string,string[]>, message:string,public retryAfter=60){super(message)}}
export function safeUrl(value?:string){if(!value)return undefined;try{const u=new URL(value,typeof window==='undefined'?'https://localhost':window.location.origin);return ['http:','https:'].includes(u.protocol)?u.href:undefined}catch{return undefined}}
export async function request<T>(base:string,path:string,options:RequestInit={}):Promise<T>{
 const res=await fetch(base.replace(/\/$/,'')+path,{...options,signal:AbortSignal.timeout(15000),headers:{...options.headers,...(options.body?{'Content-Type':'application/json'}:{})}});
 const data=await res.json().catch(()=>({})) as Record<string,any>;
 if(!res.ok)throw new ApiError(res.status,data.errors||{},data.error||data.detail||data.title||'Request failed',Math.max(1,Math.min(600,Number(res.headers.get('Retry-After'))||60)));
 return data as T;
}
export const getHome=(b:string,l:Lang)=>request<HomeContent>(b,`/api/public/website/home?lang=${l}`);
export const getLookups=(b:string,l:Lang)=>Promise.all([request<Lookup[]>(b,`/api/public/lookups/business-categories?lang=${l}`),request<Lookup[]>(b,`/api/public/lookups/countries?lang=${l}`)]);
export const createLead=(b:string,d:Lead)=>request<{success:boolean;leadId:number}>(b,'/api/public/leads',{method:'POST',body:JSON.stringify(d)});

export const getCities=(b:string,l:Lang,countryId:number)=>request<CityLookup[]>(b,`/api/public/lookups/cities?lang=${l}&countryId=${encodeURIComponent(countryId)}`);
