const fs=require('node:fs');
const assert=require('node:assert/strict');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
 try{
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:1280,height:960});
  await page.goto('http://127.0.0.1:3210/invitation.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.invitationPlayer?.timeline.time()>0.1);
  const results=[];
  for(const time of [0.5,20,41]){
   const sample=await page.evaluate(async time=>{
    invitationPlayer.seek(time);invitationPlayer.timeline.play();
    const intervals=[];let previous,start;await new Promise(resolve=>{function frame(now){if(start===undefined)start=now;if(previous!==undefined)intervals.push(now-previous);previous=now;if(now-start<4000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
    const sorted=[...intervals].sort((a,b)=>a-b),mean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
    return {time,frames:intervals.length,fps:Math.round(10000/mean)/10,p95:Math.round(sorted[Math.floor(sorted.length*.95)]*10)/10,max:Math.round(sorted.at(-1)),over50:intervals.filter(x=>x>50).length};
   },time);results.push(sample);
  }
  assert.deepEqual(errors,[]);
  fs.mkdirSync('out/performance',{recursive:true});const report={samples:results,errors};fs.writeFileSync(`out/performance/${process.env.PERF_LABEL||'latest'}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  if(process.env.PERF_ASSERT==='1')for(const sample of results){assert.ok(sample.fps>=50,JSON.stringify(sample));assert.ok(sample.p95<=34,JSON.stringify(sample));assert.ok(sample.over50<=3,JSON.stringify(sample));}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
