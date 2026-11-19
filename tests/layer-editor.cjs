const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
const base=process.env.WEDDING_TEST_URL||'http://127.0.0.1:3211';
(async()=>{
 const original=await(await fetch(base+'/api/config')).json(),created=[];
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000);await page.setViewport({width:1500,height:1000});
  fs.mkdirSync('out/layer-proof',{recursive:true});
  const fixture=path.resolve('out/layer-proof/transparent-fixture.png');
  await sharp(Buffer.from('<svg width="500" height="700"><circle cx="250" cy="140" r="90" fill="#c28d79"/><path d="M160 230H340L430 650H70Z" fill="#516d78"/></svg>')).png().toFile(fixture);
  await page.goto(base+'/editor.html',{waitUntil:'networkidle0'});
  assert.equal(await page.$$eval('.subject-card',els=>els.length),3);assert.equal(await page.$$eval('.frame-card',els=>els.length),3);
  assert.equal(await page.$eval('#advanced-backgrounds',el=>el.open),false);
  const subject='.subject-card[data-media-key="couplePortrait"]';
  await page.$eval(subject+' input[type=file]',el=>el.dataset.cutout='0');
  await(await page.$(subject+' input[type=file]')).uploadFile(fixture);
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  let c=await(await fetch(base+'/api/config')).json();created.push(c.media.couplePortrait);
  assert.equal(c.media.background3,original.media.background3);
  const html=await(await fetch(base+'/invitation.html')).text();assert.ok(html.includes(c.media.couplePortrait));assert.ok(html.includes(c.media.background3));
  await page.select('.background-card[data-media-key="background3"] select','contain');
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  await page.goto(base+'/invitation.html',{waitUntil:'networkidle0'});await page.evaluate(()=>{invitationPlayer.timeline.pause();invitationPlayer.jump(2);});
  assert.ok(await page.$('#web-scene-3 .subject-layer img'));
  await(await page.$('#viewport')).screenshot({path:'out/layer-proof/subject-replacement.png'});
  await page.goto(base+'/editor.html',{waitUntil:'networkidle0'});
  const frame='.frame-card[data-media-key="memoryPhoto1"]';await(await page.$(frame+' input[type=file]')).uploadFile(fixture);
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  c=await(await fetch(base+'/api/config')).json();created.push(c.media.memoryPhoto1);assert.equal(c.media.background5,original.media.background5);
  await page.goto(base+'/invitation.html',{waitUntil:'networkidle0'});await page.evaluate(()=>{invitationPlayer.timeline.pause();invitationPlayer.jump(4);});
  assert.equal(await page.$$eval('#web-scene-5 .polaroid',els=>els.length),3);assert.equal(await page.$$eval('#web-scene-5 .polaroid>span',els=>els.length),3);
  assert.ok((await page.$eval('#web-scene-5 .memory-1 img',img=>img.getAttribute('src'))).includes(c.media.memoryPhoto1));
  await(await page.$('#viewport')).screenshot({path:'out/layer-proof/frame-replacement.png'});
  const opaque=await sharp({create:{width:100,height:100,channels:3,background:'#ddd'}}).png().toBuffer();
  assert.equal((await fetch(base+'/api/subject?key=couplePortrait&cutout=0',{method:'POST',body:opaque})).status,400);
  console.log('PASS: transparent subject replacement preserves background; framed photo replacement preserves sky, three frames and hearts; opaque subject uploads rejected');
 }finally{
  const current=await(await fetch(base+'/api/config')).json();
  for(const slot of ['couplePortrait','memoryPhoto1']){const p=current.media[slot];if(p&&p!==original.media[slot])created.push(p);}
  await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(original)});
  for(const p of new Set(created))if(/^assets\/images\/uploaded\/[\w-]+\.png$/.test(p)){fs.rmSync(p,{force:true});for(const ext of ['png','jpg','webp'])fs.rmSync(p.replace('.png','-original.'+ext),{force:true});}
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exit(1);});
