const fs=require('node:fs');
const assert=require('node:assert/strict');
const puppeteer=require(process.env.PUPPETEER_PATH||'C:/Users/12293/AppData/Local/npm-cache/_npx/702923228c2ce1e6/node_modules/puppeteer-core');
const label=process.argv[2]||'after';
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 const reports=[];
 try{
  for(const device of [{name:'desktop',width:1280,height:960,deviceScaleFactor:1},{name:'mobile',width:390,height:844,deviceScaleFactor:2}]){
   const page=await browser.newPage();await page.setViewport(device);
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:3210/invitation.html',{waitUntil:'networkidle0'});
   await page.evaluate(async()=>{await document.fonts.ready;window.invitationPlayer.timeline.pause();});
   const dir=`out/text-motion/${label}/${device.name}`;fs.mkdirSync(dir,{recursive:true});
   const frames=[];let cropSize;
   for(let i=0;i<12;i++){
    const t=12.25+i/60;
    const info=await page.evaluate(t=>{
     window.invitationPlayer.seek(t);
     const text=document.querySelector('#web-scene-2 .person-name');
     const rect=text.getBoundingClientRect(),style=getComputedStyle(text);
     const scale=document.querySelector('#canvas').getBoundingClientRect().height/1920;
     return {t,y:gsap.getProperty('#strip','y'),scale,dpr:devicePixelRatio,opacity:style.opacity,visibility:style.visibility,rect:rect.toJSON()};
    },t);
    assert.equal(info.opacity,'1');assert.notEqual(info.visibility,'hidden');
    const dpr=info.dpr,r=info.rect;
    cropSize=cropSize||{width:Math.floor(r.width*dpr)/dpr,height:Math.floor(r.height*dpr)/dpr};
    const clip={x:Math.floor(r.x*dpr)/dpr,y:Math.floor(r.y*dpr)/dpr,...cropSize};
    await page.screenshot({path:`${dir}/frame-${String(i).padStart(2,'0')}.png`,clip});
    if(label!=='before')assert.ok(Math.abs(info.y*info.scale*dpr-Math.round(info.y*info.scale*dpr))<0.01,'scroll lies on physical pixel grid');
    frames.push(info);
   }
   await page.evaluate(()=>{window.invitationPlayer.seek(13);});
   await page.setViewport({...device,height:device.height-71});
   if(label!=='before'){
    const error=await page.evaluate(()=>{const physical=gsap.getProperty('#strip','y')*document.querySelector('#canvas').getBoundingClientRect().height/1920*devicePixelRatio;return Math.abs(physical-Math.round(physical));});
    assert.ok(error<0.01,'resize keeps text on pixel grid');
   }
   assert.deepEqual(errors,[]);reports.push({device:device.name,frames});await page.close();
  }
  fs.writeFileSync(`out/text-motion/${label}/metrics.json`,JSON.stringify(reports,null,2));
  console.log(`PASS ${label}: desktop/mobile moving text remains visible${label==='before'?'':', physical pixel alignment and resize verified'}`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
