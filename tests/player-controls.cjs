const assert=require('node:assert/strict');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1280,height:960});
  await page.setRequestInterception(true);page.on('request',async req=>{if(req.url().includes('/optimized/'))await new Promise(r=>setTimeout(r,1000));await req.continue();});
  await page.goto('http://127.0.0.1:3210/invitation.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>invitationPlayer.ready),false);await page.click('#play-pause');
  await page.waitForFunction(()=>invitationPlayer.ready);assert.equal(await page.evaluate(()=>invitationPlayer.timeline.time()),0);assert.equal(await page.$eval('#play-pause',el=>el.textContent),'继续');
  await page.click('#play-pause');await page.waitForFunction(()=>invitationPlayer.timeline.time()>.3);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.evaluate(()=>invitationPlayer.timeline.paused()),true);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.evaluate(()=>invitationPlayer.timeline.paused()),false);
  await page.click('#play-pause');const paused=await page.evaluate(()=>invitationPlayer.timeline.time());await new Promise(r=>setTimeout(r,250));assert.equal(await page.evaluate(()=>invitationPlayer.timeline.time()),paused);
  await page.click('#restart');await page.waitForFunction(()=>invitationPlayer.timeline.time()>.1&&!invitationPlayer.timeline.paused());
  await page.click('[data-page="4"]');assert.ok(await page.evaluate(()=>invitationPlayer.timeline.time()>43&&invitationPlayer.timeline.time()<45));
  await page.evaluate(()=>{invitationPlayer.seek(119.99);invitationPlayer.timeline.play();});await page.waitForFunction(()=>document.querySelector('#play-pause').textContent==='重播');await page.click('#play-pause');await page.waitForFunction(()=>invitationPlayer.timeline.time()<1&&!invitationPlayer.timeline.paused());
  assert.deepEqual(errors,[]);console.log('PASS: pause during loading stays paused; resume, pause, restart, navigation, end replay; no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
