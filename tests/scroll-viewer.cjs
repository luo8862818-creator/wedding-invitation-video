const assert=require('node:assert/strict');
const fs=require('node:fs');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  fs.mkdirSync('out/remake',{recursive:true});
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(15000);console.log('browser ready');page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1280,height:960});
  await page.goto('http://127.0.0.1:3210/invitation-demo.html',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>window.invitationPlayer?.timeline.time()>0.1);
  console.log('autoplay ready');assert.equal(await page.$$eval('.web-slide',els=>els.length),12);
  assert.ok(await page.evaluate(()=>!window.invitationPlayer.timeline.paused()),'autoplay without clicks');
  await page.evaluate(()=>{window.invitationPlayer.seek(7.8);window.invitationPlayer.timeline.pause();});
  console.log('seam ready');let y=await page.$eval('#strip',el=>gsap.getProperty(el,'y'));
  assert.ok(y<0&&y>-1920,'a vertical transition shows two adjacent pages');
  await page.screenshot({path:'out/remake/sliding-seam.png'});
  await page.evaluate(()=>{window.invitationPlayer.seek(7.3);window.invitationPlayer.timeline.play();});
  console.log('waiting auto second page');await page.waitForFunction(()=>window.invitationPlayer.page>=2,{polling:100});console.log('second page ready');
  await page.evaluate(()=>{window.invitationPlayer.timeline.pause();});
  const positions=[];for(const t of [0,1,2,7,8,9,15,16,17,35,36,37,69,70,71,111,112,113,119]){await page.evaluate(t=>window.invitationPlayer.seek(t),t);const y=await page.$eval('#strip',el=>gsap.getProperty(el,'y'));assert.ok(Math.abs(y+176*t)<0.01,'constant speed at '+t);positions.push({t,y});}console.log('PASS constant 176 px/s across all former page boundaries');const times=Array.from({length:12},(_,i)=>Math.min(119.99,i/11*120));
  for(let i=0;i<times.length;i++){console.log('capture',i+1);
   await page.evaluate(t=>window.invitationPlayer.seek(t),times[i]);
   assert.ok(Math.abs((await page.evaluate(()=>window.invitationPlayer.page))-(i+1))<=1);
   y=await page.$eval('#strip',el=>gsap.getProperty(el,'y'));const grid=await page.evaluate(()=>1920/(document.querySelector('#canvas').getBoundingClientRect().height*devicePixelRatio));assert.ok(Math.abs(y+176*times[i])<=grid/2+0.001,'continuous position stays within half a physical pixel');
   await page.waitForFunction(()=>document.fonts.status==='loaded');
   await page.$eval('#viewport',()=>{});
   await (await page.$('#viewport')).screenshot({path:`out/remake/page-${String(i+1).padStart(2,'0')}.png`});
  }
  await page.setViewport({width:390,height:844});await page.evaluate(()=>window.invitationPlayer.seek(4));
  await page.screenshot({path:'out/remake/mobile.png'});
  await page.goto('http://127.0.0.1:3210/',{waitUntil:'networkidle0'});
  console.log('autoplay ready');assert.equal(await page.$$eval('.web-slide',els=>els.length),12);
  assert.equal(await page.$('.sample-label'),null,'real config has no demo label or invented personal data');
  assert.deepEqual(errors,[]);
  console.log('PASS: uninterrupted slow linear upward scroll, no holds or page transitions, all 12 pages, mobile, real configuration, no JavaScript errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
