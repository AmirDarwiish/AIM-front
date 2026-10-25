import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const project={id:1,slug:'fixture-villa',title:'Fixture Villa <script>unsafe</script>',summary:'A fixture, not a real company project.',description:'First paragraph.\n\nSecond paragraph.',category:'Residential',year:2026,coverUrl:'https://example.invalid/cover.jpg',assets:[{id:1,kind:'image',url:'https://example.invalid/gallery.jpg',caption:'Gallery photo'},{id:2,kind:'video',url:'https://youtu.be/abcdefghijk',caption:'Film'}]};
let submitted=null,unavailable=false,homeOverride=null,featuredRead=false;
const homeContent={siteName:'LA Construction',sliders:[],sections:[
 {id:1,sectionKey:'la-about',title:'CMS about title',description:'From the dashboard',sortOrder:10,items:[]},
 {id:2,sectionKey:'la-services',title:'CMS expertise',description:'Service overview',sortOrder:40,items:[{id:41,title:'Managed construction',subtitle:'CMS service subtitle',description:'A service from CMS.',sortOrder:0}]},
 {id:3,sectionKey:'la-contact',title:'Contact our team',description:'Discuss the next project',showOnHome:false,items:[]},
 {id:4,sectionKey:'la-hero',title:'CMS hero',description:'Managed brand introduction',imageUrl:'/assets/architecture.svg',sortOrder:0,items:[]},
 {id:5,sectionKey:'la-projects',title:'Selected projects',sortOrder:20,items:[]},
 {id:6,sectionKey:'la-before-after',title:'Transformation',sortOrder:30,items:[{id:61,title:'A real transformation fixture',imageUrl:'https://example.invalid/before.jpg',afterImageUrl:'https://example.invalid/after.jpg',projectSlug:'fixture-villa'}]},
 {id:7,sectionKey:'la-testimonials',title:'Client stories',sortOrder:50,items:[{id:71,title:'Fixture reviewer',description:'A review from the CMS.',imageUrl:'https://example.invalid/review.jpg'},{id:72,title:'Video reviewer',videoUrl:'https://youtu.be/abcdefghijk',imageUrl:'https://example.invalid/poster.jpg'}]},
 {id:8,sectionKey:'la-films',title:'On site',sortOrder:60,items:[{id:81,title:'A site film',videoUrl:'https://cdn.example.invalid/video.mp4'}]},
 {id:9,sectionKey:'la-about-story',title:'CMS company story heading',description:'CMS company story body',showOnHome:false,items:[]},
 {id:10,sectionKey:'la-process',title:'CMS working process',showOnHome:false,items:[{id:101,title:'CMS step',description:'Managed process text'}]},
 {id:11,sectionKey:'la-faq',title:'Questions',sortOrder:80,items:[{id:111,title:'CMS question?',description:'CMS answer.'}]},
 {id:12,sectionKey:'la-test-hidden',title:'Never show this section',showOnHome:false,items:[]}
]};
const api=createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');
 if(req.url.startsWith('/api/public/website/home')){if(unavailable){res.statusCode=503;return res.end('{}')}return res.end(JSON.stringify(homeOverride||homeContent))}
 if(req.url.startsWith('/api/public/projects/fixture-villa'))return res.end(JSON.stringify(project));
 if(req.url.startsWith('/api/public/projects/missing')){res.statusCode=404;return res.end('{}')}
 if(req.url.startsWith('/api/public/projects')){if(req.url.includes('featuredOnly=true'))featuredRead=true;return res.end(JSON.stringify({items:[project],totalCount:1,page:1,pageSize:12}));}
 if(req.url==='/api/public/leads'){let body='';for await(const part of req)body+=part;submitted=JSON.parse(body);return res.end(JSON.stringify({success:true,leadId:5}))}
 res.statusCode=404;res.end('{}');
});
api.listen(0,'127.0.0.1');await once(api,'listening');
const probe=createServer().listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(r=>probe.close(r));const origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env:{...process.env,AIM_API_BASE_URL:`http://127.0.0.1:${api.address().port}`,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
try{
 let ready=false;for(let i=0;i<30;i++){try{if((await fetch(origin+'/admin',{signal:AbortSignal.timeout(1000)})).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}assert.ok(ready,logs);
 const home=await (await fetch(origin+'/?lang=en')).text();assert.ok(home.includes('CMS about title'));assert.ok(home.includes('fixture-villa'));assert.ok(!home.includes('A considered approach.'));assert.ok(home.includes('la-site'));assert.ok(home.includes('architecture.svg'));

 const about=await fetch(origin+'/about?lang=en');assert.equal(about.status,200);const aboutHtml=await about.text();assert.ok(aboutHtml.includes('CMS company story heading'));assert.ok(aboutHtml.includes('CMS company story body'));assert.ok(!aboutHtml.includes('Built around'));assert.ok(!aboutHtml.includes('Clarity from the start'));
 const services=await fetch(origin+'/services?lang=en');assert.equal(services.status,200);const serviceHtml=await services.text();assert.ok(serviceHtml.includes('CMS expertise'));assert.ok(serviceHtml.includes('/services/41?lang=en'));
 const service=await fetch(origin+'/services/41?lang=en');assert.equal(service.status,200);const serviceDetail=await service.text();assert.ok(serviceDetail.includes('A service from CMS.'));assert.ok(serviceDetail.includes('CMS service subtitle'));assert.ok(serviceDetail.includes('CMS working process'));assert.ok(!serviceDetail.includes('Understand the brief'));
 assert.equal((await fetch(origin+'/services/999?lang=en')).status,404);
 const contact=await fetch(origin+'/contact?lang=en&service=41');assert.equal(contact.status,200);const contactHtml=await contact.text();assert.ok(contactHtml.includes('Project inquiry'));assert.ok(contactHtml.includes('name="location"'));assert.ok(contactHtml.includes('value="41" selected=""'));assert.ok(!contactHtml.includes('Inquiries will be enabled'));
 assert.ok(home.includes('/about?lang=en'));assert.ok(home.includes('/services?lang=en'));assert.ok(home.includes('/contact?lang=en'));assert.ok(!home.includes('name="message"'));
 const arabic=await (await fetch(origin+'/contact?lang=ar')).text();assert.ok(arabic.includes('dir="rtl"'));assert.ok(arabic.includes('استفسار عن مشروع'));

 assert.ok(featuredRead);assert.ok(home.includes('Client stories'));assert.ok(home.includes('Fixture reviewer'));assert.ok(home.includes('type="range"'));assert.ok(home.includes('A site film'));assert.ok(home.includes('<details'));assert.ok(home.includes('loading="lazy"'));assert.ok(!home.includes('<iframe'));assert.ok(!home.includes('Never show this section'));
 assert.ok(home.indexOf('data-section="la-before-after"')<home.indexOf('data-section="la-services"'));assert.ok(home.indexOf('data-section="la-services"')<home.indexOf('data-section="la-testimonials"'));
 homeOverride={siteName:'LA Construction',sliders:[],sections:[{id:21,sectionKey:'la-testimonials',title:'Empty reviews',items:[]},{id:22,sectionKey:'la-before-after',title:'Missing comparison media',items:[{id:221,title:'Incomplete pair',imageUrl:'https://example.invalid/before.jpg'}]}]};
 const empty=await (await fetch(origin+'/?lang=en')).text();assert.ok(!empty.includes('data-section="la-testimonials"'));assert.ok(!empty.includes('data-section="la-before-after"'));assert.ok(!empty.includes('Built with precision.'));assert.ok(!empty.includes('Clarity from the start'));homeOverride=null;
 unavailable=true;const failed=await (await fetch(origin+'/about?lang=en')).text();assert.ok(failed.includes('Content is temporarily unavailable'));assert.ok(!failed.includes('Good spaces begin'));const failedService=await (await fetch(origin+'/services/1?lang=en')).text();assert.ok(failedService.includes('Content is temporarily unavailable'));assert.ok(!failedService.includes('From structure to the final detail'));unavailable=false;
 const list=await fetch(origin+'/projects?lang=en');assert.equal(list.status,200);assert.match(await list.text(),/fixture-villa/);
 const detail=await fetch(origin+'/projects/fixture-villa?lang=en');assert.equal(detail.status,200);const html=await detail.text();assert.ok(html.includes('First paragraph.'));assert.ok(html.includes('Second paragraph.'));assert.ok(!html.includes('<script>unsafe</script>'));assert.ok(html.includes('loading="lazy"'));assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('autoplay'));assert.ok(html.includes('og:title'));
 assert.equal((await fetch(origin+'/projects/missing')).status,404);
 const inquiry={requestType:2,fullName:'Fixture',phone:'+201000000000',message:'Testing only'};
 assert.equal((await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.invalid'},body:JSON.stringify(inquiry)})).status,403);
 assert.equal((await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({...inquiry,requestType:1})})).status,400);
 const response=await fetch(origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(inquiry)});assert.equal(response.status,200);assert.equal((await response.json()).success,true);assert.equal(submitted.requestType,2);
 console.log('PASS: CMS-only content, featured projects, section ordering and hiding, media stories SSR and lazy players, before/after range, FAQ, empty and failed content states, corporate routes, service detail and 404, dedicated inquiry form, selected service, Arabic RTL, server-rendered CMS and projects, hidden sections, escaped content, metadata, lazy media, click-to-play video, 404, contact CSRF/type checks and submission.');
}finally{child.kill('SIGTERM');api.closeAllConnections();await new Promise(r=>api.close(r))}
