const assert=require('node:assert/strict');
const fs=require('node:fs');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
const base='http://127.0.0.1:3210';
(async()=>{
 const original=await(await fetch(base+'/api/config')).json(),created=[];
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  fs.mkdirSync('out',{recursive:true});
  for(const [name,color]of [['background-test','#9bb9b4'],['background-test-replacement','#d9c4aa']]){
   const data=await page.evaluate(color=>{const canvas=document.createElement('canvas');canvas.width=600;canvas.height=1000;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,600,1000);ctx.fillStyle='#eee7da';ctx.fillRect(80,100,440,800);ctx.fillStyle=color;ctx.beginPath();ctx.arc(300,440,140,0,Math.PI*2);ctx.fill();ctx.fillStyle='#654b41';ctx.fillText('UPLOAD TEST',175,630);return canvas.toDataURL('image/png');},color);
   fs.writeFileSync(`out/${name}.png`,Buffer.from(data.split(',')[1],'base64'));
  }
  await page.setViewport({width:1500,height:1000});await page.goto(base+'/editor.html',{waitUntil:'networkidle0'});
  await page.waitForSelector('.background-card');assert.equal(await page.$$eval('.background-card',els=>els.length),12);
  const key='background3',card=`.background-card[data-media-key="${key}"]`;
  const waitSaved=()=>page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  await(await page.$(card+' input[type=file]')).uploadFile('out/background-test.png');await waitSaved();
  let c=await(await fetch(base+'/api/config')).json();created.push(c.media[key]);assert.ok(c.media[key].startsWith('assets/images/uploaded/'));
  const first=c.media[key];await page.reload({waitUntil:'networkidle0'});
  assert.ok((await page.$eval(card+' img',img=>img.getAttribute('src'))).includes(first));
  await page.select(card+' select','contain');await waitSaved();
  assert.equal((await(await fetch(base+'/api/config')).json()).backgroundFit[key],'contain');
  await(await page.$(card+' input[type=file]')).uploadFile('out/background-test-replacement.png');
  await page.waitForFunction((selector,old)=>{const img=document.querySelector(selector+' img');return img&&img.getAttribute('src')!==old;},{},card,first);await waitSaved();
  c=await(await fetch(base+'/api/config')).json();created.push(c.media[key]);assert.notEqual(c.media[key],first);
  await page.$$eval(card+' button',buttons=>buttons.find(b=>b.textContent==='预览这一页').click());
  await page.waitForFunction(()=>document.querySelector('#sceneLabel').textContent.startsWith('3 ·'));
  await page.waitForFunction(path=>{const frame=document.querySelector('#canvas').contentDocument;return [...frame.querySelectorAll('[data-media-key="background3"]')].some(el=>el.style.backgroundImage.includes(path));},{},c.media[key]);
  await page.screenshot({path:'out/background-editor-custom.png',fullPage:true});
  await page.$$eval(card+' button',buttons=>buttons.find(b=>b.textContent==='移除背景').click());await waitSaved();
  assert.equal((await(await fetch(base+'/api/config')).json()).media[key],'');
  await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$(card+' img'),null);
  await page.$$eval(card+' button',buttons=>buttons.find(b=>b.textContent==='恢复默认样式').click());await waitSaved();
  assert.equal((await(await fetch(base+'/api/config')).json()).media[key],'assets/images/remake/hero.png');
  assert.equal((await(await fetch(base+'/api/config')).json()).backgroundFit[key],'cover');
  assert.deepEqual(errors,[]);
  console.log('PASS browser: 12 independent backgrounds, upload/replace, reload, contain, correct page preview, remove without fallback, restore default');
 }finally{
  await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(original)});
  for(const path of created)if(/^assets\/images\/uploaded\/[\w-]+\.png$/.test(path))fs.rmSync(path,{force:true});
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exit(1);});
