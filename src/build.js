import fs from 'node:fs';
import {makeScenes,sceneCss} from './scenes.js';
import {webPage} from './web-page.js';
import {prepareDisplayImages} from './display-images.js';
export const durations=[8,8,10,10,12,10,12,12,12,8,10,8];
export const titles=['我们的婚礼邀请函','新人登场','遇见你','我们的故事','甜蜜回忆','因为是你','婚礼日期','婚礼流程','婚礼地点','宾客提示','诚挚邀请','期待您的到来'];
export function build(config,write=true){
 const markup=makeScenes(config),css=sceneCss();
 let absoluteStart=0;
 const speed=11*1920/120;
 const scenes=markup.map((body,i)=>{
  const id=`scene-${String(i+1).padStart(2,'0')}`,duration=durations[i];
  const from=speed*absoluteStart,to=speed*(absoluteStart+duration);
  const motion=`const tl=gsap.timeline({paused:true});const frameScale=window.frameElement?window.frameElement.getBoundingClientRect().height/(window.innerHeight||1920):1;const pixelRatio=(window.devicePixelRatio||1)*(frameScale||1);tl.fromTo('#${id}-strip',{y:${-from},force3D:true},{y:${-to},force3D:true,duration:${duration},ease:'none',modifiers:{y:value=>(Math.round(parseFloat(value)*pixelRatio)/pixelRatio)+'px'}},0);window.__timelines=window.__timelines||{};window.__timelines['${id}']=tl;`;
  const panels=markup.map((html,j)=>({html,j})).filter(({j})=>(j+1)*1920>=from&&j*1920<=to+1920).map(({html,j})=>`<div class="continuous-panel" style="top:${j*1920}px">${html.replaceAll('SCENEID',id+'-panel-'+j)}</div>`).join('');
  const frame=`<div class="continuous-strip" id="${id}-strip" data-layout-allow-overflow>${panels}</div>`;
  absoluteStart+=duration;
  return {id,d:duration,html:`<template><style>#root{position:absolute;inset:0;overflow:hidden;}\n${css}</style><div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-duration="${duration}">${frame}</div><script>${motion}</script></template>`};
 });
 if(write){
  scenes.forEach(s=>fs.writeFileSync(`compositions/${s.id}.html`,s.html));
  let time=0;
  const hosts=scenes.map(s=>{const host=`<div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-width="1080" data-height="1920" data-start="${time}" data-duration="${s.d}" data-track-index="0" data-track-kind="graphics"></div>`;time+=s.d;return host;}).join('\n');
  fs.writeFileSync('index.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><script src="assets/vendor/gsap.min.js"></script><style>html,body{margin:0;width:1080px;height:1920px;overflow:hidden}.clip{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="main" data-width="1080" data-height="1920" data-start="0" data-duration="120" data-fps="30">${hosts}${config.media.musicFile?`<audio id="wedding-music" class="clip" src="${config.media.musicFile}" data-start="0" data-duration="120" data-track-index="1" data-volume="0.7" data-fade-out="4"></audio>`:''}</div><script>window.__timelines=window.__timelines||{};window.__timelines.main=gsap.timeline({paused:true});</script></body></html>`);
  fs.writeFileSync('invitation.html',webPage(markup,config,false));
  fs.writeFileSync('invitation-demo.html',webPage(markup,config,false));
 }
 return scenes;
}
if(process.argv[1]?.endsWith('build.js')){const config=JSON.parse(fs.readFileSync('wedding.config.json','utf8'));await prepareDisplayImages(config);build(config);}
