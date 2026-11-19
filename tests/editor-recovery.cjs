const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
const base=process.env.WEDDING_TEST_URL||'http://127.0.0.1:3211';
(async()=>{
 const original=await(await fetch(base+'/api/config')).json();let browser,uploaded;
 try{
  const c=structuredClone(original);c.media.memoryPhoto3='assets/images/uploaded/missing-editor-regression.png';
  assert.equal((await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(c)})).status,200);
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1500,height:1000});
  await page.goto(base+'/editor.html',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>document.querySelector('#canvas').contentDocument.querySelector('.scene'));
  assert.equal(await page.$eval('#upload-limit',el=>el.textContent),'100 MB');
  await page.waitForFunction(()=>document.querySelector('[data-media-key="memoryPhoto3"] small').textContent.includes('文件已丢失'));
  await page.$eval('#seek',el=>{el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>document.querySelector('#canvas').contentDocument.querySelector('.names-content'));
  await page.waitForFunction(()=>Object.values(document.querySelector('#canvas').contentWindow.__timelines||{}).some(t=>t.time()>1.9));
  const bounds=await page.$eval('#canvas',el=>{const name=el.contentDocument.querySelector('.person-name');const box=name.getBoundingClientRect();return {top:box.top,bottom:box.bottom,text:name.textContent};});assert.ok(bounds.text);assert.ok(bounds.bottom>0&&bounds.top<1920);
  fs.mkdirSync('out/recovery',{recursive:true});await page.screenshot({path:'out/recovery/editor-at-10s.png'});
  await page.$eval('#fields input',el=>{el.value='缺图编辑测试';el.dispatchEvent(new Event('input',{bubbles:true}));});await page.click('#save');
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已保存'));
  assert.equal((await(await fetch(base+'/api/config')).json()).couple.groomName,'缺图编辑测试');
  const fixture=path.resolve('out/recovery/large-photo.png');await sharp({create:{width:3000,height:3000,channels:3,background:'#dcc3ba'}}).png({compressionLevel:0}).toFile(fixture);assert.ok(fs.statSync(fixture).size>20*1024*1024);
  await(await page.$('.frame-card[data-media-key="memoryPhoto3"] input[type=file]')).uploadFile(fixture);
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('素材已保存'));
  uploaded=(await(await fetch(base+'/api/config')).json()).media.memoryPhoto3;assert.ok(fs.existsSync(uploaded));
  await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>document.querySelector('#canvas').contentDocument.querySelector('.scene'));
  assert.ok(!(await page.$eval('#status',el=>el.textContent)).includes('失败'));assert.deepEqual(errors,[]);
  console.log('PASS: missing photo does not blank the editor; text visible at 10s; 25.8 MB real PNG uploaded through browser; reload works');
 }finally{
  await fetch(base+'/api/config',{method:'PUT',body:JSON.stringify(original)});
  if(uploaded)fs.rmSync(uploaded,{force:true});await browser?.close();
 }
})().catch(error=>{console.error(error);process.exit(1);});
