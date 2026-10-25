import { apiBase, sameOrigin, fail } from '@/lib/admin-server';
export async function POST(request:Request){
 if(!sameOrigin(request))return fail('طلب غير مسموح.',403);
 try{
 const body=await request.text();if(body.length>10000)return fail('الطلب أكبر من الحد المسموح.',413);
 const data=JSON.parse(body);if(data.requestType!==2)return fail('نوع الطلب غير صالح.',400);
 const res=await fetch(`${apiBase()}/api/public/leads`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestType:2,fullName:data.fullName,phone:data.phone,email:data.email,message:data.message}),signal:AbortSignal.timeout(15000),redirect:'error'});
 return new Response(await res.text(),{status:res.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':res.headers.get('Retry-After')||'60'}});
 }catch{return fail('تعذر إرسال الرسالة. حاول مرة أخرى.',502)}
}
