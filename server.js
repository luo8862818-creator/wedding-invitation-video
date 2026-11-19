import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {build} from './src/build.js';
import {backgroundSlots,subjectSlots} from './src/media-slots.js';
import {createSubject} from './src/subject-images.js';
import {MAX_UPLOAD_BYTES,MAX_UPLOAD_MB} from './src/upload-limits.js';
const root=process.cwd(),configFile=path.join(root,'wedding.config.json');
export const read=()=>JSON.parse(fs.readFileSync(configFile,'utf8'));
const mediaKeys=[...new Set([...Object.keys(read().media),...backgroundSlots.map(slot=>slot.key)])];
export function validate(c){
 const base=JSON.parse(fs.readFileSync('wedding.config.example.json','utf8'));
 for(const group of ['couple','wedding','story','media']){if(!c[group]||typeof c[group]!=='object')throw Error('配置缺少 '+group);for(const [key,value] of Object.entries(c[group])){if(!(key in base[group])&&!(group==='media'&&/^background(?:[2-9]|1[0-2])$/.test(key)))throw Error('未知字段');if(typeof value!=='string'||value.length>3000)throw Error('字段过长或格式错误');}}
 if(c.wedding.date&&!/^\d{4}-\d{2}-\d{2}$/.test(c.wedding.date))throw Error('日期格式错误');
 if(c.wedding.mapUrl&&!/^https?:\/\//.test(c.wedding.mapUrl))throw Error('地图链接需使用 http(s)');
 // Missing files render as local placeholders; a stale photo must not block all editing.
 for(const [key,v] of Object.entries(c.media))if(v&&(!/^assets\/[\w./-]+$/.test(v)||v.includes('..')))throw Error(`素材路径无效（${key}）：请选择文件重新上传`);
 if(!Array.isArray(c.schedule)||c.schedule.length>8||c.schedule.some(s=>!s||['time','title','description'].some(k=>typeof s[k]!=='string'||s[k].length>200)))throw Error('流程最多 8 项，每项最多 200 字');
 if(typeof c.project?.title!=='string'||c.project.title.length>30)throw Error('封面标题最多 30 字');
 if(c.backgroundFit!==undefined&&(!c.backgroundFit||typeof c.backgroundFit!=='object'||Array.isArray(c.backgroundFit)||Object.entries(c.backgroundFit).some(([key,value])=>!backgroundSlots.some(slot=>slot.key===key)||!['cover','contain','fill'].includes(value))))throw Error('背景图片显示方式无效');
 if(c.subjectPlacement!==undefined&&(!c.subjectPlacement||typeof c.subjectPlacement!=='object'||Array.isArray(c.subjectPlacement)||Object.entries(c.subjectPlacement).some(([key,value])=>!subjectSlots.some(slot=>slot.key===key)||!value||Object.entries(value).some(([axis,n])=>!['x','y','scale'].includes(axis)||typeof n!=='number'||!Number.isFinite(n)||(axis==='scale'?(n<50||n>180):Math.abs(n)>400)))))throw Error('人物位置设置无效');
 return {...c,project:{...base.project,title:c.project.title},sceneDurations:base.sceneDurations};
}
function save(c){c=validate(c);build(c);fs.writeFileSync(configFile+'.tmp',JSON.stringify(c,null,2));fs.renameSync(configFile+'.tmp',configFile);return c;}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttc':'font/collection','.mp3':'audio/mpeg','.wav':'audio/wav'};
export const server=http.createServer(async(req,res)=>{const reply=(code,obj)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(obj));};try{
 const url=new URL(req.url,'http://localhost');
 const port=server.address()?.port;
 if(req.method!=='GET'&&req.headers.origin&&![`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(req.headers.origin))return reply(403,{error:'不允许跨站写入'});
 let body=Buffer.alloc(0);if(req.method!=='GET'){
  if(Number(req.headers['content-length'])>MAX_UPLOAD_BYTES){req.resume();return reply(413,{error:`文件上限 ${MAX_UPLOAD_MB} MB`});}
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX_UPLOAD_BYTES){req.resume();return reply(413,{error:`文件上限 ${MAX_UPLOAD_MB} MB`});}chunks.push(chunk);}body=Buffer.concat(chunks,size);
 }
 if(url.pathname==='/api/config'){if(req.method==='GET')return reply(200,read());if(req.method==='PUT')return reply(200,save(JSON.parse(body)));}
 if(url.pathname==='/api/subject'&&req.method==='POST'){
  const key=url.searchParams.get('key');if(!subjectSlots.some(slot=>slot.key===key))throw Error('未知人物位置');
  const result=await createSubject(body,url.searchParams.get('cutout')==='1');
  const c=read();c.media[key]=result.path;c.subjectPlacement={...c.subjectPlacement,[key]:{x:0,y:0,scale:100}};
    try{save(c);}catch(error){fs.rmSync(result.path,{force:true});fs.rmSync(result.sourcePath,{force:true});throw error;}return reply(200,result);
 }
 if(url.pathname==='/api/upload'&&req.method==='POST'){
 const key=url.searchParams.get('key');if(!mediaKeys.includes(key))throw Error('未知素材位置');
 if(subjectSlots.some(slot=>slot.key===key))throw Error('人物图片请使用“只换新人”入口，避免把照片背景一起覆盖。');
 let ext='';if(body.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(body[0]===255&&body[1]===216&&body[2]===255)ext='jpg';else if(body.toString('ascii',0,4)==='RIFF'&&body.toString('ascii',8,12)==='WEBP')ext='webp';
 if(key==='musicFile'){ext=body.toString('ascii',0,3)==='ID3'||(body[0]===255&&(body[1]&224)===224)?'mp3':body.toString('ascii',0,4)==='RIFF'&&body.toString('ascii',8,12)==='WAVE'?'wav':'';}
 if(!ext||body.length<24)throw Error('文件内容无效，仅支持 PNG/JPEG/WEBP 或 MP3/WAV 音乐');
 const file=`assets/${key==='musicFile'?'audio':'images/uploaded'}/${randomUUID()}.${ext}`;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);const c=read();c.media[key]=file;try{save(c);}catch(e){fs.unlinkSync(file);throw e;}return reply(200,{path:file,bytes:body.length});
 }
 if(url.pathname==='/api/media'&&req.method==='DELETE'){const {key}=JSON.parse(body);if(!mediaKeys.includes(key))throw Error('未知素材位置');const c=read(),old=c.media[key];c.media[key]='';save(c);if(old&&/^assets\/(images\/uploaded|audio)\/[\w-]+\.(png|jpg|webp|mp3|wav)$/.test(old)&&!Object.values(c.media).includes(old))fs.rmSync(old,{force:true});return reply(200,{ok:true});}
 if(url.pathname==='/api/preview'&&req.method==='POST')return reply(200,build(validate(JSON.parse(body)),false));
 if(req.method!=='GET')return reply(405,{error:'不支持的请求'});
 const rel=decodeURIComponent(url.pathname==='/'?'/invitation.html':url.pathname);if(rel.split('/').some(p=>p.startsWith('.')))return reply(403,{error:'禁止访问'});const file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep))return reply(403,{error:'非法路径'});if(!fs.existsSync(file)||!fs.statSync(file).isFile())return reply(404,{error:'文件不存在'});res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
 }catch(e){reply(400,{error:e.message});}});
if(process.argv[1]?.endsWith('server.js'))server.listen(Number(process.env.WEDDING_EDITOR_PORT)||3210,'127.0.0.1',()=>console.log('婚礼编辑器 http://127.0.0.1:'+server.address().port));
