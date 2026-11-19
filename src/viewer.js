/* Browser presentation controller. Video compositions remain paused and seekable. */
(() => {
 const totalSeconds=120, distance=11*1920;
 let tl,pixelScaleY=1,lastPage=-1,ready=false,wantsPlaying=true;
 const canvas=document.querySelector('#canvas'),viewport=document.querySelector('#viewport');
 const dots=[...document.querySelectorAll('[data-page]')];
 const snapY=value=>Math.round(parseFloat(value)*pixelScaleY)/pixelScaleY;
 function fit(){const scale=Math.min(innerWidth/1080,innerHeight/1920);const mobile=innerWidth<=650;const scaleY=mobile?innerHeight/1920:scale;pixelScaleY=scaleY*(devicePixelRatio||1);canvas.style.transform=mobile?`scale(${innerWidth/1080},${scaleY})`:`scale(${scale})`;viewport.style.width=`${mobile?innerWidth:1080*scale}px`;viewport.style.height=`${mobile?innerHeight:1920*scale}px`;if(tl)gsap.set('#strip',{y:snapY(-distance*tl.time()/totalSeconds),force3D:true});}
 fit();addEventListener('resize',fit);
 tl=gsap.timeline({paused:true,onUpdate:update,onComplete:()=>{wantsPlaying=false;document.querySelector('#play-pause').textContent='重播';}});
 tl.fromTo('#strip',{y:0,force3D:true},{y:-distance,force3D:true,duration:totalSeconds,ease:'none',modifiers:{y:value=>`${snapY(value)}px`}},0);
 function update(){const page=Math.min(11,Math.floor(tl.time()/totalSeconds*11));if(page===lastPage)return;lastPage=page;viewport.dataset.page=String(page+1);dots.forEach((dot,i)=>dot.classList.toggle('active',i===page));}
 function seek(t){tl.time(Math.max(0,Math.min(119.99,t)),false);update();}
 function jump(i){seek(Math.max(0,Math.min(11,i))/11*totalSeconds);}
 dots.forEach((b,i)=>b.onclick=()=>jump(i));
 function playState(){if(ready)tl.paused(!wantsPlaying||document.hidden);document.querySelector('#play-pause').textContent=wantsPlaying?'暂停':'继续';}
 document.querySelector('#play-pause').onclick=()=>{if(tl.time()>=119.9){seek(0);wantsPlaying=true;}else wantsPlaying=!wantsPlaying;playState();};
 document.querySelector('#restart').onclick=()=>{seek(0);wantsPlaying=true;playState();};
 addEventListener('visibilitychange',playState);
 addEventListener('keydown',e=>{const page=Number(viewport.dataset.page)-1;if(e.key==='ArrowDown')jump(page+1);if(e.key==='ArrowUp')jump(page-1);});
 let touchY=0;viewport.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});viewport.addEventListener('touchend',e=>{const delta=touchY-e.changedTouches[0].clientY;if(Math.abs(delta)>50)jump(Number(viewport.dataset.page)-1+(delta>0?1:-1));},{passive:true});
 viewport.setAttribute('aria-busy','true');
 window.invitationPlayer={timeline:tl,seek,jump,get ready(){return ready;},get page(){return Number(viewport.dataset.page);}};
 const fontsReady=Promise.all([document.fonts.load('400 111px WeddingBrush','婚礼邀请函新人'),document.fonts.load('400 190px WeddingSerif','0123456789')]).then(()=>document.fonts.ready);
 // CSS backgrounds are decoded too, before scrolling reaches them for the first
 // time. Otherwise a later scene can stall the animation while its art decodes.
 const backgrounds=[...new Set([...document.querySelectorAll('.artwork')].map(el=>el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]).filter(Boolean))];
 const backgroundReady=backgrounds.map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});});
 Promise.all([fontsReady,...backgroundReady,...[...document.images].map(img=>img.decode().catch(()=>{}))]).then(()=>{ready=true;viewport.setAttribute('aria-busy','false');update();playState();});
})();
