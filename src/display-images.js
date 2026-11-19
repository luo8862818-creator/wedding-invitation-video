import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import sharp from 'sharp';

const pending=new Map();
function cachePath(source){
 const stat=fs.statSync(source);
 const hash=createHash('sha256').update(`${source}|${stat.size}|${stat.mtimeMs}|1920x2880-v1`).digest('hex').slice(0,20);
 return `assets/images/optimized/${hash}-${path.parse(source).name}.webp`;
}
export function displayImage(source){
 if(!source||!fs.existsSync(source))return '';
 if(!/\.(png|jpe?g|webp)$/i.test(source))return source;
 const cached=cachePath(source);return fs.existsSync(cached)?cached:source;
}
async function prepareImage(source){
 if(!source||!fs.existsSync(source)||!/\.(png|jpe?g|webp)$/i.test(source))return;
 const target=cachePath(source);if(fs.existsSync(target))return;
 if(pending.has(target))return pending.get(target);
 const task=(async()=>{
  const metadata=await sharp(source,{limitInputPixels:false}).metadata();
  if(metadata.width<=1920&&metadata.height<=2880)return;
  fs.mkdirSync(path.dirname(target),{recursive:true});const temporary=target+'.'+randomUUID()+'.tmp';
  try{
   await sharp(source,{limitInputPixels:false}).rotate().resize({width:1920,height:2880,fit:'inside',withoutEnlargement:true}).webp({quality:92,alphaQuality:100,effort:4}).toFile(temporary);
   fs.renameSync(temporary,target);
  }finally{fs.rmSync(temporary,{force:true});}
 })();pending.set(target,task);
 try{await task;}finally{pending.delete(target);}
}
export async function prepareDisplayImages(config){
 // Bound concurrent decoders, including when several camera photos are uploaded.
 for(const source of new Set(Object.values(config.media||{})))await prepareImage(source);
}
