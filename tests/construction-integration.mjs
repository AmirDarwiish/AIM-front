import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const project={id:1,slug:'fixture-villa',title:'Fixture Villa <script>unsafe</script>',summary:'A fixture, not a real company project.',description:'First paragraph.\n\nSecond paragraph.',category:'Residential',year:2026,coverUrl:'https://example.invalid/cover.jpg',assets:[{id:1,kind:'image',url:'https://example.invalid/gallery.jpg',caption:'Gallery photo'},{id:2,kind:'video',url:'https://youtu.be/abcdefghijk',caption:'Film'}]};
let submitted=null;
const api=createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');
 if(req.url.startsWith('/api/public/website/home'))return res.end(JSON.stringify({siteName:'LA Construction',sliders:[],sections:[{id:1,sectionKey:'la-about',title:'CMS about title',description:'From the dashboard',items:[]}]}));
 if(req.url.startsWith('/api/public/projects/fixture-villa'))return res.end(JSON.stringify(project));
 if(req.url.startsWith('/api/public/projects/missing')){res.statusCode=404;return res.end('{}')}
 if(req.url.startsWith('/api/public/projects'))return res.end(JSON.stringify({items:[project],totalCount:1,page:1,pageSize:12}));
 if(req.url==='/api/public/leads'){let body='';for await(const part of req)body+=part;submitted=JSON.parse(body);return res.end(JSON.stringify({success:true,leadId:5}))}
 res.statusCode=404;res.end('{}');
});
api.listen(0,'127.0.0.1');await once(api,'listening');
const probe=createServer().listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(r=>probe.close(r));const origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env:{...process.env,AIM_API_BASE_URL:`http://127.0.0.1:${api.address().port}`,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
try{
 let ready=false;for(let i=0;i<30;i++){try{if((await fetch(origin+'/admin',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}assert.ok(ready,logs);
 const home=await (await fetch(origin+'/?lang=en')).text();assert.ok(home.includes('CMS about title'));assert.ok(home.includes('fixture-villa'));assert.ok(!home.includes('A considered approach.'));assert.ok(home.includes('la-site'));assert.ok(home.includes('architecture.svg'));
 const list=await fetch(origin+'/projects?lang=en');assert.equal(list.status,200);assert.match(await list.text(),/fixture-villa/);
 const detail=await fetch(origin+'/projects/fixture-villa?lang=en');assert.equal(detail.status,200);const html=await detail.text();assert.ok(html.includes('First paragraph.'));assert.ok(html.includes('Second paragraph.'));assert.ok(!html.includes('<script>unsafe</script>'));assert.ok(html.includes('loading="lazy"'));assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('autoplay'));assert.ok(html.includes('og:title'));
 assert.equal((await fetch(origin+'/projects/missing')).status,404);
 const inquiry={requestType:2,fullName:'Fixture',phone:'+201000000000',message:'Testing only'};
 assert.equal((await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.invalid'},body:JSON.stringify(inquiry)})).status,403);
 assert.equal((await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({...inquiry,requestType:1})})).status,400);
 const response=await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(inquiry)});assert.equal(response.status,200);assert.equal((await response.json()).success,true);assert.equal(submitted.requestType,2);
 console.log('PASS: server-rendered CMS and projects, hidden sections, escaped content, metadata, lazy media, click-to-play video, 404, contact CSRF/type checks and submission.');
}finally{child.kill('SIGTERM');api.closeAllConnections();await new Promise(r=>api.close(r))}
