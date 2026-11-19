const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
const base=process.env.WEDDING_TEST_URL||'http://127.0.0.1:3211';
(async()=>{
 const original=await(await fetch(base+'/api/config')).json();let browser,uploaded;
 try{
  fs.mkdirSync('out/original-photo',{recursive:true});
  const fixture=path.resolve('out/original-photo/opaque-photo.jpg');await sharp({create:{width:9000,height:9001,channels:3,background:'#a63430'}}).jpeg().toFile(fixture);
  const metadata=await sharp(fixture,{limitInputPixels:false}).metadata();assert.ok(metadata.width*metadata.height>80_000_000);
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000);await page.setViewport({width:1500,height:1000});
  await page.goto(base+'/editor.html',{waitUntil:'networkidle0'});
  const selector='.subject-card[data-media-key="couplePortrait"]';
  assert.ok((await page.$eval(selector+' .upload-media',el=>el.textContent)).includes('不抠图'));
  await(await page.$(selector+' input[type=file]')).uploadFile(fixture);
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  const c=await(await fetch(base+'/api/config')).json();uploaded=c.media.couplePortrait;
  assert.ok(uploaded.includes('-photo.jpg'));assert.deepEqual(fs.readFileSync(uploaded),fs.readFileSync(fixture));assert.equal(c.media.background3,original.media.background3);
  await page.goto(base+'/invitation.html',{waitUntil:'networkidle0'});await page.evaluate(()=>{invitationPlayer.timeline.pause();invitationPlayer.jump(2);});
  const layer=await page.$eval('#web-scene-3 .subject-original',el=>{const img=el.querySelector('img'),text=el.parentElement.querySelector('.hero-copy');return {width:el.offsetWidth,height:el.offsetHeight,fit:getComputedStyle(img).objectFit,photoZ:Number(getComputedStyle(el).zIndex),textZ:Number(getComputedStyle(text).zIndex),count:el.parentElement.querySelectorAll('.subject-layer').length};});
  assert.equal(layer.width,1080);assert.equal(layer.height,1500);assert.equal(layer.fit,'cover');assert.equal(layer.count,1);assert.ok(layer.textZ>layer.photoZ);
  console.log('PASS: 81-million-pixel JPEG uploads through editor; original bytes intact; reserved area filled; no segmentation; text above photo; background unchanged');
 }finally{await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(original)});if(uploaded)fs.rmSync(uploaded,{force:true});await browser?.close();}
})().catch(e=>{console.error(e);process.exit(1);});
