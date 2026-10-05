// Run after `next build --webpack`. Uses an isolated fixture API; never contacts production.
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {once} from 'node:events';
const token=`fixture.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+7200,'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name':'Fixture Admin'})).toString('base64url')}.fixture`;
let last=null;
const upstream=createServer(async(req,res)=>{
 let body='';for await(const chunk of req)body+=chunk;
 last={path:req.url,method:req.method,auth:req.headers.authorization,contentType:req.headers['content-type'],body};
 res.setHeader('Content-Type','application/json');
 if(req.url==='/api/auth/login'){
  const input=JSON.parse(body);if(input.password!=='fixture'){res.statusCode=401;res.end('{}');return}
  res.end(JSON.stringify({token,fullName:'Fixture Admin',roles:['Admin']}));return;
 }
 if(req.headers.authorization!==`Bearer ${token}`){res.statusCode=401;res.end('{}');return}
 if(req.url==='/api/admin/site-settings'){res.statusCode=403;res.end(JSON.stringify({error:'Denied'}));return}
 if(req.url==='/api/admin/leads/401'){res.statusCode=401;res.end('{}');return}
 if(req.url==='/api/admin/leads/1/status'){assert.equal(JSON.parse(body).status,3);res.statusCode=204;res.end();return}
 if(req.url==='/api/admin/media'){res.end(JSON.stringify({id:42,url:'https://fixture.invalid/image.png'}));return}
 res.end(JSON.stringify({items:[],totalCount:0,page:1,pageSize:20}));
});
upstream.listen(Number(process.env.ADMIN_FIXTURE_PORT)||0,'127.0.0.1');await once(upstream,'listening');
const portProbe=createServer();portProbe.listen(0,'127.0.0.1');await once(portProbe,'listening');const port=Number(process.env.ADMIN_TEST_PORT)||portProbe.address().port;await new Promise(r=>portProbe.close(r));
const origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{env:{...process.env,AIM_API_BASE_URL:`http://127.0.0.1:${upstream.address().port}`,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
let serverLogs='';child.stdout.on('data',x=>serverLogs+=x);child.stderr.on('data',x=>serverLogs+=x);
console.log('Fixture API started; waiting for dashboard server.');
let cookie='';
const call=(path,method='GET',body,extra={})=>fetch(`${origin}${path}`,{signal:AbortSignal.timeout(5000),method,headers:{...(method==='GET'?{}:{Origin:origin}),...(cookie?{Cookie:cookie}:{}),...(body&&! (body instanceof FormData)?{'Content-Type':'application/json'}:{}),...extra},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
try{
 let ready=false;for(let i=0;i<20;i++){try{const r=await fetch(`${origin}/admin`,{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}assert.ok(ready,serverLogs);console.log('Dashboard server ready.');
 assert.equal((await call('/api/admin-proxy/admin/leads')).status,401);
 assert.equal((await call('/api/admin-session','POST',{email:'admin@test.invalid',password:'fixture'},{Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await call('/api/admin-session','POST',{email:'admin@test.invalid',password:'wrong'})).status,401);
 const login=await call('/api/admin-session','POST',{email:'admin@test.invalid',password:'fixture'});assert.equal(login.status,200);
 const setCookie=login.headers.get('set-cookie');assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/Secure/i);assert.match(setCookie,/SameSite=Strict/i);cookie=setCookie.split(';')[0];
 const loginBody=await login.json();assert.equal(loginBody.fullName,'Fixture Admin');assert.equal(loginBody.token,undefined);
 const session=await call('/api/admin-session');assert.equal(session.status,200);assert.equal((await session.json()).token,undefined);
 const list=await call('/api/admin-proxy/admin/leads?page=2&status=3');assert.equal(list.status,200);assert.equal(last.auth,`Bearer ${token}`);assert.equal(last.path,'/api/admin/leads?page=2&status=3');assert.equal(list.headers.get('cache-control'),'no-store');
 assert.equal((await call('/api/admin-proxy/admin/leads/1/status','PATCH',{status:3})).status,204);
 assert.equal((await call('/api/admin-proxy/admin/leads/1/status','PATCH',{status:3},{Origin:'https://untrusted.invalid'})).status,403);
 assert.equal((await call('/api/admin-proxy/admin/site-settings')).status,403);
 assert.equal((await call('/api/admin-proxy/auth/login','POST',{email:'x'})).status,404);
 assert.equal((await call('/api/admin-proxy/admin/media','GET')).status,404);
 assert.equal((await call('/api/admin-proxy/admin/leads/1','DELETE')).status,404);
 const form=new FormData();form.append('file',new Blob(['fixture'],{type:'image/png'}),'fixture.png');const upload=await call('/api/admin-proxy/admin/media','POST',form);assert.equal(upload.status,200);assert.equal((await upload.json()).id,42);assert.match(last.contentType,/multipart\/form-data; boundary=/);assert.match(last.body,/name="file"/);
 const expired=await call('/api/admin-proxy/admin/leads/401');assert.equal(expired.status,401);assert.match(expired.headers.get('set-cookie'),/Max-Age=0/i);
 const logout=await call('/api/admin-session','DELETE');assert.equal(logout.status,204);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i);
 cookie='';assert.equal((await call('/api/admin-session')).status,401);
 console.log('PASS: session privacy, CSRF, authenticated proxy, route allowlist, numeric status, multipart upload, 403 handling, expiration and logout.');
}finally{child.kill('SIGTERM');upstream.closeAllConnections();await new Promise(r=>upstream.close(r))}
