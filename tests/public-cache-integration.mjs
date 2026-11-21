// Isolated API verifies warm public reads and immediate invalidation after CMS saves.
import {createServer} from 'node:http';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
let reads=0,revision=1,rejectSave=false;
const api=createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');
 if(req.url.startsWith('/api/public/website/home')){
  reads++;
  const lang=new URL(req.url,'http://fixture').searchParams.get('lang');
  return res.end(JSON.stringify({siteName:'LA Construction',sliders:[],sections:[{id:1,sectionKey:'la-about-story',title:`Cache fixture ${lang} revision ${revision}`,description:'Published content',items:[]}]}));
 }
 if(req.url==='/api/admin/site-settings'&&req.method==='PUT'){
  for await(const _ of req){}
  if(rejectSave){res.statusCode=422;return res.end('{}')}
  revision++;return res.end('{}');
 }
 res.statusCode=404;res.end('{}');
});
api.listen(0,'127.0.0.1');await once(api,'listening');
const probe=createServer().listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(r=>probe.close(r));
const origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env:{...process.env,AIM_PUBLIC_CACHE_DISABLED:'0',AIM_API_BASE_URL:`http://127.0.0.1:${api.address().port}`},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
const token=`fixture.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+600})).toString('base64url')}.fixture`;
const save=()=>fetch(origin+'/api/admin-proxy/admin/site-settings',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json',Cookie:`aim_admin_session=${token}`},body:'{}'});
const read=async(lang='en')=>{const r=await fetch(origin+`/about?lang=${lang}`);assert.equal(r.status,200);return r.text()};
try{
 let ready=false;for(let i=0;i<30;i++){try{if((await fetch(origin+'/admin')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}assert.ok(ready,logs);
 assert.match(await read(),/Cache fixture en revision 1/);const coldReads=reads;
 assert.match(await read(),/Cache fixture en revision 1/);assert.equal(reads,coldReads,'warm request must not refetch API');
 assert.match(await read('ar'),/Cache fixture ar revision 1/);assert.equal(reads,coldReads+1,'languages have independent cache entries');
 rejectSave=true;assert.equal((await save()).status,422);await read();assert.equal(reads,coldReads+1,'failed save must not evict cache');
 rejectSave=false;assert.equal((await save()).status,200);
 assert.match(await read(),/Cache fixture en revision 2/);assert.match(await read('ar'),/Cache fixture ar revision 2/);
 assert.equal(reads,coldReads+3,'successful save invalidates both languages immediately');
 const optimized=await fetch(origin+'/_next/image?url=%2Fcompany-work%2Fap-10.webp&w=480&q=75',{headers:{Accept:'image/webp'}});
 assert.equal(optimized.status,200);assert.match(optimized.headers.get('content-type'),/image\/webp/);
 const optimizedBytes=(await optimized.arrayBuffer()).byteLength;
 assert.ok(optimizedBytes<(await stat('public/company-work/ap-10.webp')).size,'mobile image must be smaller than original');
 const font=await fetch(origin+'/fonts/tajawal-c2a1787f1774.woff2');assert.equal(font.status,200);assert.match(font.headers.get('cache-control'),/immutable/);
 console.log('PASS: public content reused across requests, languages isolated, failed saves retain cache, successful CMS saves immediately refresh both languages.');
 console.log(`PASS: responsive mobile WebP (${optimizedBytes} bytes) and immutable font caching.`);
}finally{child.kill('SIGTERM');await new Promise(r=>api.close(r));}
