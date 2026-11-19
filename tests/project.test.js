import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {server,read} from '../server.js';
import {build,durations} from '../src/build.js';
import {makeScenes} from '../src/scenes.js';
import {backgroundSlots} from '../src/media-slots.js';
import sharp from 'sharp';
import http from 'node:http';
import {MAX_UPLOAD_BYTES} from '../src/upload-limits.js';
import {displayImage} from '../src/display-images.js';
test('12 gap-free scenes and deterministic static compilation',()=>{const scenes=build(read(),false);assert.equal(scenes.length,12);assert.equal(durations.reduce((a,b)=>a+b),120);for(const s of scenes){assert.ok(s.html.includes(`window.__timelines['${s.id}']`));assert.ok(!/undefined|\[object Object\]/.test(s.html));}});
test('config persistence, upload/delete, validation and traversal',async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,original=read();const request=(p,method,body)=>fetch(base+p,{method,body});try{
 const c=structuredClone(original);c.couple.groomName='测试姓名';c.wedding.date='2026-05-24';c.wedding.weekdayOverride='';c.wedding.venueName='测试场地';assert.equal((await request('/api/config','PUT',JSON.stringify(c))).status,200);assert.equal((await(await fetch(base+'/api/config')).json()).couple.groomName,'测试姓名');
 for(const page of ['/invitation.html','/invitation-demo.html']){const html=await(await fetch(base+page)).text();assert.ok(html.includes('测试姓名'));assert.ok(html.includes('测试场地'));assert.ok(html.includes('星期日 · SUN'));}
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 let r=await request('/api/upload?key=memoryPhoto1','POST',png);assert.equal(r.status,200,r.status===200?'':await r.text());const uploaded=(await r.json()).path;assert.ok(fs.existsSync(uploaded));assert.equal(read().media.memoryPhoto1,uploaded);
 assert.equal((await request('/api/upload?key=memoryPhoto2','POST',Buffer.from('fake image file'))).status,400);
 assert.equal((await request('/api/upload?key=../x','POST',png)).status,400);
 const overLimitStatus=await new Promise((resolve,reject)=>{const req=http.request(base+'/api/upload?key=memoryPhoto1',{method:'POST',headers:{'Content-Length':MAX_UPLOAD_BYTES+1}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});assert.equal(overLimitStatus,413);
 c.media.memoryPhoto1='../secret.png';assert.equal((await request('/api/config','PUT',JSON.stringify(c))).status,400);
 assert.equal((await request('/api/media','DELETE',JSON.stringify({key:'memoryPhoto1'}))).status,200);assert.equal(fs.existsSync(uploaded),false);
 assert.equal((await fetch(base+'/.git/config')).status,403);
 }finally{fs.writeFileSync('wedding.config.json',JSON.stringify(original,null,2));build(original);await new Promise(r=>server.close(r));}});

test('all twelve background slots upload, persist, compile and remove without cartoon fallback',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`,original=read(),files=[];
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 try{
  for(const slot of backgroundSlots){
   const response=await fetch(base+'/api/upload?key='+slot.key,{method:'POST',body:png});assert.equal(response.status,200,response.status===200?'':await response.text());
   const {path}=await response.json();files.push(path);assert.ok(fs.existsSync(path));assert.equal(read().media[slot.key],path);
   assert.ok(makeScenes(read())[slot.page].includes(path));
   assert.ok(fs.readFileSync('invitation.html','utf8').includes(path));
   assert.ok(fs.readdirSync('compositions').filter(f=>f.startsWith('scene-')).some(f=>fs.readFileSync('compositions/'+f,'utf8').includes(path)));
   const c=read();c.backgroundFit={...c.backgroundFit,[slot.key]:'contain'};
   const fitResponse=await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(c)});assert.equal(fitResponse.status,200,await fitResponse.text());
   assert.ok(makeScenes(read())[slot.page].includes('background-size:contain'));
   assert.equal((await fetch(base+'/api/media',{method:'DELETE',body:JSON.stringify({key:slot.key})})).status,200);
   assert.ok(makeScenes(read())[slot.page].includes('background-image:none'));
   assert.ok(!fs.existsSync(path));
  }
  const invalid=read();invalid.backgroundFit={background3:'url(secret)'};
  assert.equal((await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(invalid)})).status,400);
 }finally{
  fs.writeFileSync('wedding.config.json',JSON.stringify(original,null,2));build(original);
  for(const path of files)if(/^assets\/images\/uploaded\/[\w-]+\.png$/.test(path))fs.rmSync(path,{force:true});
  await new Promise(resolve=>server.close(resolve));
 }
});

test('missing photos do not block preview, saving or uploads above the old 20 MB limit',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`,original=read();let uploaded;
 try{
  const c=structuredClone(original);c.media.memoryPhoto3='assets/images/uploaded/missing-regression-photo.png';
  let r=await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(c)});assert.equal(r.status,200,await r.text());
  r=await fetch(base+'/api/preview',{method:'POST',body:JSON.stringify(c)});assert.equal(r.status,200);const scenes=await r.json();assert.equal(scenes.length,12);assert.ok(scenes[1].html.includes('新郎'));assert.ok(scenes.some(s=>s.html.includes('photo-blank')));
  const large=await sharp({create:{width:3000,height:3000,channels:3,background:'#dcc3ba'}}).png({compressionLevel:0}).toBuffer();assert.ok(large.length>20*1024*1024);
  r=await fetch(base+'/api/upload?key=memoryPhoto3',{method:'POST',body:large});assert.equal(r.status,200, r.status===200?'':await r.text());uploaded=(await r.json()).path;assert.equal(fs.statSync(uploaded).size,large.length);assert.equal(read().media.memoryPhoto3,uploaded);
  const playback=displayImage(uploaded);assert.notEqual(playback,uploaded);assert.ok(fs.existsSync(playback));
  assert.equal((await fetch(base+'/api/media',{method:'DELETE',body:JSON.stringify({key:'memoryPhoto3'})})).status,200);assert.ok(!fs.existsSync(playback));assert.ok(!fs.existsSync(uploaded));
 }finally{fs.writeFileSync('wedding.config.json',JSON.stringify(original,null,2));build(original);if(uploaded)fs.rmSync(uploaded,{force:true});await new Promise(resolve=>server.close(resolve));}
});

test('overlapping saves remain consistent and clean their temporary files',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`,original=read(),before=new Set(fs.readdirSync('.'));
 try{
  const responses=await Promise.all(Array.from({length:6},(_,i)=>{const c=structuredClone(original);c.couple.groomName='保存回归'+i;return fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(c)});}));
  for(const response of responses)assert.equal(response.status,200,response.status===200?'':await response.text());
  assert.ok(fs.readFileSync('invitation.html','utf8').includes(read().couple.groomName));
  assert.deepEqual(fs.readdirSync('.').filter(name=>!before.has(name)&&name.startsWith('wedding.config.json.')&&name.endsWith('.tmp')),[]);
 }finally{fs.writeFileSync('wedding.config.json',JSON.stringify(original,null,2));build(original);await new Promise(resolve=>server.close(resolve));}
});
