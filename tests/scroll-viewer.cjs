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
  const times=[4,12,21,31,42,53,64,76,88,98,107,116];
  for(let i=0;i<times.length;i++){console.log('capture',i+1);
   await page.evaluate(t=>window.invitationPlayer.seek(t),times[i]);
   assert.equal(await page.evaluate(()=>window.invitationPlayer.page),i+1);
   y=await page.$eval('#strip',el=>gsap.getProperty(el,'y'));assert.ok(Math.abs(y+i*1920)<1);
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
  console.log('PASS: automatic continuous vertical slide, intermediate seam, all 12 pages, mobile, empty real configuration, no JavaScript errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
