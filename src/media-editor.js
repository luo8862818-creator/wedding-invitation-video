import {backgroundSlots,photoSlots} from './media-slots.js';

export function renderMediaEditor({container,getConfig,api,persist,changed,status,rerender,onPage}){
 container.replaceChildren();
 const intro=document.createElement('p');intro.className='media-help';
 intro.textContent='每页背景都可换成自己的照片。上传后立即保存到项目，并同步网页和视频合成；卡通图片只是可恢复的默认素材。';container.append(intro);
 const backgrounds=document.createElement('section');backgrounds.id='background-panel';
 const heading=document.createElement('h3');heading.textContent='12 页背景图片';backgrounds.append(heading);
 container.append(backgrounds);
 const extras=document.createElement('details');extras.className='extra-media';
 const summary=document.createElement('summary');summary.textContent='回忆照片、场地照片与音乐';extras.append(summary);container.append(extras);

 const perform=async(info,action)=>{
  status('正在保存素材…');info.textContent='正在处理…';
  container.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
  try{await action();await changed();rerender();status('素材已保存 · 网页和视频已同步');}
  catch(error){info.textContent=error.message;info.classList.add('error');status(error.message,true);}
  finally{container.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);}
 };

 for(const slot of [...backgroundSlots,...photoSlots]){
  const background=!!slot.defaultPath,key=slot.key,path=getConfig().media[key]||'';
  const card=document.createElement('div');card.className=`asset ${background?'background-card':''}`;card.dataset.mediaKey=key;if(background)card.dataset.page=slot.page;
  const title=document.createElement('strong');title.textContent=slot.title;card.append(title);
  const thumbnail=document.createElement('div');thumbnail.className='asset-preview';
  const info=document.createElement('small');info.setAttribute('role','status');
  if(path&&key!=='musicFile'){
   const img=document.createElement('img');img.src=path;img.alt=slot.title;
   img.onload=()=>{info.textContent=`${img.naturalWidth} × ${img.naturalHeight} · ${path.split('/').pop()}`;};
   img.onerror=()=>{info.textContent='图片加载失败，请重新上传';};thumbnail.append(img);
  }else thumbnail.textContent=path?'已配置音乐':background?'未设置背景 · 点击上传自己的照片':'点击上传';
  card.append(thumbnail,info);
  const input=document.createElement('input');input.type='file';input.className='media-file-input';
  input.accept=key==='musicFile'?'.mp3,.wav':'.png,.jpg,.jpeg,.webp';input.setAttribute('aria-label',`${slot.title}上传`);
  const upload=document.createElement('button');upload.type='button';upload.className='upload-media primary';
  upload.textContent=path?'替换图片':'上传图片';if(key==='musicFile')upload.textContent=path?'替换音乐':'上传音乐';
  upload.onclick=()=>input.click();thumbnail.onclick=()=>input.click();
  input.onchange=async()=>{
   const file=input.files[0];if(!file)return;
   await perform(info,async()=>{
    if(file.size>20*1024*1024)throw Error('文件上限 20 MB');
    if(key!=='musicFile'){
     if(!/\.(png|jpe?g|webp)$/i.test(file.name))throw Error('请选择 PNG、JPG 或 WEBP 图片');
     const bitmap=await createImageBitmap(file).catch(()=>{throw Error('无法读取图片，请选择有效的图片文件');});bitmap.close();
    }
    info.textContent='正在上传…';await persist();
    const result=await api('/api/upload?key='+key,{method:'POST',body:file});
    getConfig().media[key]=result.path;
    if(slot.page!==undefined)onPage(slot.page);
   });
  };
  const controls=document.createElement('div');controls.className='media-actions';controls.append(upload);
  const remove=document.createElement('button');remove.type='button';remove.textContent=background?'移除背景':'删除素材';remove.disabled=!path;
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
  card.append(input,controls);(background?backgrounds:extras).append(card);
 }
}
