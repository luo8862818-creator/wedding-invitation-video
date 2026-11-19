import {backgroundSlots,photoSlots,subjectSlots} from './media-slots.js';
import {MAX_UPLOAD_BYTES,MAX_UPLOAD_MB} from './upload-limits.js';

export function renderMediaEditor({container,getConfig,api,persist,changed,status,rerender,onPage}){
 container.replaceChildren();
 const intro=document.createElement('p');intro.className='media-help';
 intro.textContent='新人照片直接放进原人物区域，不自动抠图。照片自己的背景保留，页面文字、花饰和相框在上层；换相框内照片请使用下方对应入口。';container.append(intro);
 const people=document.createElement('section');people.id='subject-panel';people.innerHTML='<h3>原照片替换人物区域</h3><p class="media-help">直接使用完整原照片，不自动抠图。照片填满原人物区域，原照片背景保留；文字和花饰叠在照片上方。调整大小和裁切位置使人物合适入画。</p>';container.append(people);
 const frames=document.createElement('section');frames.id='frame-panel';frames.innerHTML='<h3>只换相框内照片</h3><p class="media-help">仅替换三个相框内部，相框、爱心、天空和花饰保留。</p>';container.append(frames);
 const advanced=document.createElement('details');advanced.id='advanced-backgrounds';advanced.innerHTML='<summary>高级：替换整页背景（会改变天空或信纸）</summary>';container.append(advanced);
 const backgrounds=document.createElement('section');backgrounds.id='background-panel';
 const heading=document.createElement('h3');heading.textContent='12 页背景图片';backgrounds.append(heading);
 advanced.append(backgrounds);
 const extras=document.createElement('details');extras.className='extra-media';
 const summary=document.createElement('summary');summary.textContent='场地照片、地图与音乐';extras.append(summary);container.append(extras);

 const perform=async(info,action)=>{
  status('正在保存素材…');info.textContent='正在处理…';
  container.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
  try{await action();if(await changed()===false)throw Error('素材已保存，但预览生成失败，请重试。');rerender();status('素材已保存 · 网页和视频已同步');}
  catch(error){info.textContent=error.message;info.classList.add('error');status(error.message,true);}
  finally{container.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);}
 };

 for(const slot of [...subjectSlots,...photoSlots,...backgroundSlots]){
  const background=slot.kind==='background',subject=slot.kind==='subject',frame=slot.kind==='frame',key=slot.key,path=getConfig().media[key]||'';
  const card=document.createElement('div');card.className=`asset ${background?'background-card':subject?'subject-card':frame?'frame-card':''}`;card.dataset.mediaKey=key;if(slot.page!==undefined)card.dataset.page=slot.page;
  const title=document.createElement('strong');title.textContent=slot.title;card.append(title);
  const thumbnail=document.createElement('div');thumbnail.className='asset-preview';
  const info=document.createElement('small');info.setAttribute('role','status');
  if(path&&key!=='musicFile'){
   const img=document.createElement('img');img.src=path;img.alt=slot.title;
   img.onload=()=>{info.textContent=`${img.naturalWidth} × ${img.naturalHeight} · ${path.split('/').pop()}`;};
   img.onerror=()=>{info.textContent='文件已丢失，请重新上传；其它内容可正常编辑。';info.classList.add('error');img.hidden=true;};thumbnail.append(img);
  }else thumbnail.textContent=path?'已配置音乐':background?'未设置背景 · 点击上传自己的照片':'点击上传';
  card.append(thumbnail,info);
  const input=document.createElement('input');input.type='file';input.className='media-file-input';
  input.accept=key==='musicFile'?'.mp3,.wav':'.png,.jpg,.jpeg,.webp';input.setAttribute('aria-label',`${slot.title}上传`);
  const upload=document.createElement('button');upload.type='button';upload.className='upload-media primary';
  upload.textContent=subject?'上传原照片（不抠图）':frame?'替换相框内照片':path?'替换图片':'上传图片';if(key==='musicFile')upload.textContent=path?'替换音乐':'上传音乐';
  const choose=()=>{delete input.dataset.cutout;input.click();};upload.onclick=choose;thumbnail.onclick=choose;
  input.onchange=async()=>{
   const file=input.files[0];if(!file)return;
   await perform(info,async()=>{
    if(file.size>MAX_UPLOAD_BYTES)throw Error(`文件上限 ${MAX_UPLOAD_MB} MB`);
    if(key!=='musicFile'){
     if(!/\.(png|jpe?g|webp)$/i.test(file.name))throw Error('请选择 PNG、JPG 或 WEBP 图片');
     // Subject headers are validated on the server; avoid decoding a camera's
     // full-resolution image once here and again for the actual preview.
     if(!subject){const bitmap=await createImageBitmap(file,{resizeWidth:256,resizeHeight:256}).catch(()=>{throw Error('无法读取图片，请选择有效的图片文件');});bitmap.close();}
    }
    info.textContent=subject?'正在保存原照片…':'正在上传…';await persist();
    const result=await api(subject?'/api/subject?key='+key+(input.dataset.cutout==='0'?'&cutout=0':''):'/api/upload?key='+key,{method:'POST',body:file});
    getConfig().media[key]=result.path;
    if(subject)getConfig().subjectPlacement={...getConfig().subjectPlacement,[key]:{x:0,y:0,scale:100}};
    if(slot.page!==undefined)onPage(slot.page);
   });
   input.value=''; // A failed upload can be retried with the same selected file.
  };
  const controls=document.createElement('div');controls.className='media-actions';controls.append(upload);
  if(subject){const transparent=document.createElement('button');transparent.type='button';transparent.textContent='上传已抠好的透明 PNG';transparent.onclick=()=>{input.dataset.cutout='0';input.click();};controls.append(transparent);}
  const remove=document.createElement('button');remove.type='button';remove.textContent=background?'移除背景':subject?'移除人物':'删除素材';remove.disabled=!path;
  remove.onclick=()=>perform(info,async()=>{await persist();await api('/api/media',{method:'DELETE',body:JSON.stringify({key})});getConfig().media[key]='';if(slot.page!==undefined)onPage(slot.page);});controls.append(remove);
  if(background){
   const restore=document.createElement('button');restore.type='button';restore.textContent='恢复默认样式';restore.className='restore-background';
   restore.onclick=()=>perform(info,async()=>{getConfig().media[key]=slot.defaultPath;getConfig().backgroundFit={...getConfig().backgroundFit,[key]:'cover'};await persist();onPage(slot.page);});controls.append(restore);
   const label=document.createElement('label');label.className='background-fit';label.textContent='图片显示方式';
   const select=document.createElement('select');select.setAttribute('aria-label',`${slot.title}显示方式`);
   for(const [value,text]of [['cover','铺满（可能裁边）'],['contain','完整显示（可能留边）'],['fill','拉伸到画布']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
   select.value=getConfig().backgroundFit?.[key]||'cover';
   select.onchange=()=>perform(info,async()=>{getConfig().backgroundFit={...getConfig().backgroundFit,[key]:select.value};await persist();onPage(slot.page);});
   label.append(select);card.append(label);
   const locate=document.createElement('button');locate.type='button';locate.className='locate-background';locate.textContent='预览这一页';locate.onclick=()=>onPage(slot.page);controls.append(locate);
  }
  if(subject){
   const restore=document.createElement('button');restore.type='button';restore.textContent='恢复卡通新人';restore.onclick=()=>perform(info,async()=>{getConfig().media[key]=slot.defaultPath;getConfig().subjectPlacement={...getConfig().subjectPlacement,[key]:{x:0,y:0,scale:100}};await persist();onPage(slot.page);});controls.append(restore);
   for(const [axis,title,min,max]of [['scale','照片缩放',100,180],['x','左右裁切位置',-400,400],['y','上下裁切位置',-400,400]]){
    const label=document.createElement('label');label.className='subject-adjust';label.textContent=title;
    const range=document.createElement('input');range.type='range';range.min=min;range.max=max;range.step=1;range.value=getConfig().subjectPlacement?.[key]?.[axis]??(axis==='scale'?100:0);range.setAttribute('aria-label',title);
    range.onchange=()=>perform(info,async()=>{const previous=getConfig().subjectPlacement?.[key]||{x:0,y:0,scale:100};getConfig().subjectPlacement={...getConfig().subjectPlacement,[key]:{...previous,[axis]:Number(range.value)}};await persist();onPage(slot.page);});label.append(range);card.append(label);
   }
  }
  if(!background&&slot.page!==undefined){const locate=document.createElement('button');locate.type='button';locate.textContent='预览这一页';locate.onclick=()=>onPage(slot.page);controls.append(locate);}
  card.append(input,controls);(background?backgrounds:subject?people:frame?frames:extras).append(card);
 }
}
