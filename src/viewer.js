/* Browser presentation controller. Video compositions remain paused and seekable. */
(() => {
 const starts=[0,8,16,26,36,48,58,70,82,94,102,112];
 const canvas=document.querySelector('#canvas'),viewport=document.querySelector('#viewport');
 const dots=[...document.querySelectorAll('[data-page]')];
 function fit(){const scale=Math.min(innerWidth/1080,innerHeight/1920);const mobile=innerWidth<=650;canvas.style.transform=mobile?`scale(${innerWidth/1080},${innerHeight/1920})`:`scale(${scale})`;viewport.style.width=`${mobile?innerWidth:1080*scale}px`;viewport.style.height=`${mobile?innerHeight:1920*scale}px`;}
 fit();addEventListener('resize',fit);
 const tl=gsap.timeline({paused:true,onUpdate:update,onComplete:()=>{document.querySelector('#play-pause').textContent='重播';}});
 starts.slice(1).forEach((t,i)=>tl.to('#strip',{y:-(i+1)*1920,duration:1.25,ease:'power2.inOut'},t-1.25));
 tl.to({},{duration:8},112);
 function update(){const t=tl.time();let page=0;for(let i=0;i<starts.length;i++)if(t>=starts[i])page=i;viewport.dataset.page=String(page+1);dots.forEach((dot,i)=>dot.classList.toggle('active',i===page));}
 function seek(t){tl.time(Math.max(0,Math.min(119.99,t)),false);update();}
 function jump(i){seek(starts[Math.max(0,Math.min(11,i))]+1);}
 dots.forEach((b,i)=>b.onclick=()=>jump(i));
 document.querySelector('#play-pause').onclick=()=>{if(tl.time()>=119.9)tl.restart();else tl.paused(!tl.paused());document.querySelector('#play-pause').textContent=tl.paused()?'继续':'暂停';};
 document.querySelector('#restart').onclick=()=>{tl.restart();document.querySelector('#play-pause').textContent='暂停';};
 addEventListener('keydown',e=>{const page=Number(viewport.dataset.page)-1;if(e.key==='ArrowDown')jump(page+1);if(e.key==='ArrowUp')jump(page-1);});
 let touchY=0;viewport.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});viewport.addEventListener('touchend',e=>{const delta=touchY-e.changedTouches[0].clientY;if(Math.abs(delta)>50)jump(Number(viewport.dataset.page)-1+(delta>0?1:-1));},{passive:true});
 window.invitationPlayer={timeline:tl,seek,jump,get page(){return Number(viewport.dataset.page);}};
 Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))).then(()=>{update();tl.play();});
})();
