import fs from 'node:fs';
import {makeScenes,makeDemo,sceneCss} from './scenes.js';
import {webPage} from './web-page.js';
export const durations=[8,8,10,10,12,10,12,12,12,8,10,8];
export const titles=['我们的婚礼邀请函','新人登场','遇见你','我们的故事','甜蜜回忆','因为是你','婚礼日期','婚礼流程','婚礼地点','宾客提示','诚挚邀请','期待您的到来'];
export function build(config,write=true){
 const markup=makeScenes(config),css=sceneCss();
 const scenes=markup.map((body,i)=>{
  const id=`scene-${String(i+1).padStart(2,'0')}`,duration=durations[i];
  const next=markup[i+1];
  const motion=`const tl=gsap.timeline({paused:true});tl.fromTo('#${id}-art',{scale:1},{scale:1.018,duration:${duration-1.25},ease:'none'},0);${next?`tl.fromTo('#${id}-current',{y:0},{y:-1920,duration:1.249,ease:'power2.inOut'},${duration-1.25});tl.fromTo('#${id}-next',{y:1920},{y:0,duration:1.249,ease:'power2.inOut'},${duration-1.25});`:''}window.__timelines=window.__timelines||{};window.__timelines['${id}']=tl;`;
  const frame=`<div class="slide-current" id="${id}-current">${body.replaceAll('SCENEID',id)}</div>${next?`<div class="slide-next" id="${id}-next" data-layout-ignore>${next.replaceAll('SCENEID',id+'-peek')}</div>`:''}`;
  return {id,d:duration,html:`<template><style>#root{position:absolute;inset:0;overflow:hidden;}\n${css}</style><div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-duration="${duration}">${frame}</div><script>${motion}</script></template>`};
 });
 if(write){
  scenes.forEach(s=>fs.writeFileSync(`compositions/${s.id}.html`,s.html));
  let time=0;
  const hosts=scenes.map(s=>{const host=`<div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-width="1080" data-height="1920" data-start="${time}" data-duration="${s.d}" data-track-index="0" data-track-kind="graphics"></div>`;time+=s.d;return host;}).join('\n');
  fs.writeFileSync('index.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><script src="assets/vendor/gsap.min.js"></script><style>html,body{margin:0;width:1080px;height:1920px;overflow:hidden}.clip{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-start="0" data-duration="120" data-fps="30">${hosts}${config.media.musicFile?`<audio id="wedding-music" class="clip" src="${config.media.musicFile}" data-start="0" data-duration="120" data-track-index="1" data-volume="0.7" data-fade-out="4"></audio>`:''}</div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
  fs.writeFileSync('invitation.html',webPage(markup,config,false));
  const demo=makeDemo(config);fs.writeFileSync('invitation-demo.html',webPage(makeScenes(demo),demo,true));
 }
 return scenes;
}
if(process.argv[1]?.endsWith('build.js'))build(JSON.parse(fs.readFileSync('wedding.config.json','utf8')));
