import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
const run=promisify(execFile);

export async function createOriginalSubject(body){
 const metadata=await sharp(body,{limitInputPixels:80_000_000}).metadata();
 const ext={jpeg:'jpg',png:'png',webp:'webp'}[metadata.format];
 if(!ext)throw Error('请选择 JPG、PNG 或 WEBP 原照片');
 fs.mkdirSync('assets/images/uploaded',{recursive:true});
 const file=`assets/images/uploaded/${randomUUID()}-photo.${ext}`;
 // Keep the uploaded bytes intact: no segmentation, alpha trimming or AI editing.
 fs.writeFileSync(file,body);
 return {path:file,sourcePath:file,width:metadata.width,height:metadata.height,mode:'photo'};
}

export async function normalizeSubject(input,output){
 const {data,info}=await sharp(input,{limitInputPixels:80_000_000}).rotate().resize({width:1800,height:2400,fit:'inside',withoutEnlargement:true}).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1,transparent=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const alpha=data[(y*info.width+x)*4+3];
  if(alpha<245)transparent++;
  if(alpha>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 if(right<left||transparent<info.width*info.height*0.01)throw Error('这张图没有有效的透明背景。请使用“上传原照片（不抠图）”，或上传已精修的透明 PNG。');
 await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width:right-left+1,height:bottom-top+1}).png().toFile(output);
 return {width:right-left+1,height:bottom-top+1};
}

function launcher(){
 const candidates=[process.env.WEDDING_HYPERFRAMES_LAUNCHER,path.join(os.homedir(),'.agents/skills/hyperframes/scripts/plugin-cli.mjs'),path.join(os.homedir(),'.codex/skills/hyperframes/scripts/plugin-cli.mjs')].filter(Boolean);
 const found=candidates.find(file=>fs.existsSync(file));
 if(!found)throw Error('未找到本机 HyperFrames 抠图工具。可设置 WEDDING_HYPERFRAMES_LAUNCHER，或先上传已抠好的人物透明 PNG。');
 return found;
}

let removing=false;
export async function createSubject(body,autoRemove){
 const ext=body.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':body[0]===255&&body[1]===216?'jpg':body.toString('ascii',0,4)==='RIFF'&&body.toString('ascii',8,12)==='WEBP'?'webp':'';
 if(!ext)throw Error('人物照片只支持 PNG、JPG 和 WEBP');
 if(removing)throw Error('正在处理另一张人物照片，请完成后再试。');
 removing=true;
 const id=randomUUID(),dir='assets/images/uploaded',work='out/subject-processing';
 fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(work,{recursive:true});
 const source=`${work}/${id}-input.png`,cutout=`${work}/${id}-cutout.png`,result=`${dir}/${id}.png`,original=`${dir}/${id}-original.${ext}`;
 try{
  await sharp(body,{limitInputPixels:80_000_000}).rotate().resize({width:1800,height:2400,fit:'inside',withoutEnlargement:true}).png().toFile(source);
  if(autoRemove){
   try{await run(process.execPath,[launcher(),'--cli-version','0.9.65','remove-background',path.resolve(source),'--output',path.resolve(cutout),'--device','cpu','--json'],{cwd:process.cwd(),windowsHide:true,timeout:180000,maxBuffer:2*1024*1024});}
   catch(error){throw Error('本地自动抠图未完成，请重试或上传透明 PNG。'+(error.killed?'（处理超时）':'（首次使用需要下载模型）'));}
  }
  const dimensions=await normalizeSubject(autoRemove?cutout:source,result);
  fs.writeFileSync(original,body);
  return {path:result,sourcePath:original,...dimensions,cutout:autoRemove};
 }catch(error){fs.rmSync(result,{force:true});fs.rmSync(original,{force:true});throw error;}
 finally{fs.rmSync(source,{force:true});fs.rmSync(cutout,{force:true});removing=false;}
}
