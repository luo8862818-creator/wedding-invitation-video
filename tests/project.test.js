import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {server,read} from '../server.js';
import {build,durations} from '../src/build.js';
test('12 gap-free scenes and deterministic static compilation',()=>{const scenes=build(read(),false);assert.equal(scenes.length,12);assert.equal(durations.reduce((a,b)=>a+b),120);for(const s of scenes){assert.ok(s.html.includes(`window.__timelines['${s.id}']`));assert.ok(!/undefined|\[object Object\]/.test(s.html));}});
test('config persistence, upload/delete, validation and traversal',async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,original=read();const request=(p,method,body)=>fetch(base+p,{method,body});try{
 const c=structuredClone(original);c.couple.groomName='测试姓名';c.wedding.date='2026-05-24';c.wedding.weekdayOverride='';c.wedding.venueName='测试场地';assert.equal((await request('/api/config','PUT',JSON.stringify(c))).status,200);assert.equal((await(await fetch(base+'/api/config')).json()).couple.groomName,'测试姓名');
 for(const page of ['/invitation.html','/invitation-demo.html']){const html=await(await fetch(base+page)).text();assert.ok(html.includes('测试姓名'));assert.ok(html.includes('测试场地'));assert.ok(html.includes('星期日 · SUN'));}
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 let r=await request('/api/upload?key=memoryPhoto1','POST',png);assert.equal(r.status,200);const uploaded=(await r.json()).path;assert.ok(fs.existsSync(uploaded));assert.equal(read().media.memoryPhoto1,uploaded);
 assert.equal((await request('/api/upload?key=memoryPhoto2','POST',Buffer.from('fake image file'))).status,400);
 assert.equal((await request('/api/upload?key=../x','POST',png)).status,400);
 assert.equal((await request('/api/upload?key=memoryPhoto1','POST',Buffer.alloc(20*1024*1024+1))).status,413);
 c.media.memoryPhoto1='../secret.png';assert.equal((await request('/api/config','PUT',JSON.stringify(c))).status,400);
 assert.equal((await request('/api/media','DELETE',JSON.stringify({key:'memoryPhoto1'}))).status,200);assert.equal(fs.existsSync(uploaded),false);
 assert.equal((await fetch(base+'/.git/config')).status,403);
 }finally{fs.writeFileSync('wedding.config.json',JSON.stringify(original,null,2));build(original);await new Promise(r=>server.close(r));}});
