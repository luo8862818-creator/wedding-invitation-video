import fs from 'node:fs';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const sceneCss=()=>fs.readFileSync('src/scene.css','utf8');
const paths={heart:'M32 53S5 37 5 20C5 3 27 1 32 16C38 1 59 3 59 20C59 37 32 53 32 53Z',calendar:'M10 15H54V55H10Z M10 26H54 M20 7V21 M44 7V21 M20 35H25 M37 35H43 M20 45H25 M37 45H43',rings:'M37 34a18 18 0 1 1-23-13 M26 22a18 18 0 1 1 23 24 M19 8l7 6-5 8-9-3Z M40 7l8 5-4 9-9-3Z',dress:'M25 7l7 7 7-7 5 13-7 12 18 24H9l18-24-7-12Z',car:'M10 29l6-18h32l7 18 M7 30h50v22H7Z M16 52v6 M48 52v6 M14 38h8 M42 38h8 M18 22h28',gift:'M8 27h48v29H8Z M5 19h54v12H5Z M32 20v36 M32 19C6 20 11-7 28 8l4 11C57 20 55-7 38 8Z',glass:'M14 6l-3 20c0 11 17 11 17 0L25 6 M20 35v20 M10 56h20 M39 6l-3 20c0 11 17 11 17 0L50 6 M45 35v20 M35 56h20',meal:'M6 48h52 M10 43c0-31 44-31 44 0Z M29 12h6 M32 6v7',music:'M22 48V12l30-6v34 M22 18l30-6 M22 48c-16-10-21 12-8 9 6-1 8-5 8-9Z M52 40c-16-10-21 12-8 9 6-1 8-5 8-9Z',pin:'M32 58S12 35 12 23a20 20 0 0 1 40 0c0 12-20 35-20 35Z M39 23a7 7 0 1 1-14 0 7 7 0 0 1 14 0'};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 64 64" aria-hidden="true"><path d="${paths[name]||paths.heart}"/></svg>`;
const flourish=()=>`<div class="flourish"><span></span>${icon('heart')}<span></span></div>`;
const p=(value,cls='')=>value?`<p class="${cls}">${esc(value)}</p>`:'';
const art=name=>`assets/images/remake/${name}.png`;
function file(path){return path&&fs.existsSync(path)?path:'';}
export function makeScenes(c){
 const m=c.media,w=c.wedding,story=c.story;
 const media=(key,fallback)=>file(m[key])||file(art(fallback));
 const photo=(key,fallback,label,cls='')=>`<figure class="photo ${cls}" data-media-key="${key}">${media(key,fallback)?`<img src="${esc(media(key,fallback))}" alt="${label}">`:`<div class="photo-blank">${icon('heart')}<span>${label}</span></div>`}</figure>`;
 const pair=[c.couple.groomName,c.couple.brideName].filter(Boolean).join(' · ');
 const date=w.dateDisplay||w.date;
 const validDate=/^\d{4}-\d{2}-\d{2}$/.test(w.date)&&!Number.isNaN(Date.parse(w.date));
 const weekday=w.weekdayOverride||(validDate?'星期'+['日','一','二','三','四','五','六'][new Date(w.date+'T00:00:00Z').getUTCDay()]+' · '+['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(w.date+'T00:00:00Z').getUTCDay()]:'');
 const dateParts=validDate?w.date.split('-'):[];
 const schedule=c.schedule.slice(0,8);
 const notes=[['dress','着装建议',w.dressCode],['car','交通出行',w.parkingInfo],['gift','礼物建议',story.guestNotes]];
 const bodies=[
  `<div class="cover-title reveal"><h1>${c.project.title==='我们的婚礼邀请函'?'我们的 ♡<br>婚礼邀请函':esc(c.project.title)}</h1><p class="english">Wedding Invitations</p></div>`,
  `<div class="names-content reveal"><div class="name-group"><p class="role">新郎</p>${p(c.couple.groomName,'person-name')}${p(c.couple.groomEnglishName,'english-name')}</div>${flourish()}<div class="name-group"><p class="role">新娘</p>${p(c.couple.brideName,'person-name')}${p(c.couple.brideEnglishName,'english-name')}</div>${flourish()}<div class="lovebirds">${icon('heart')}<svg viewBox="0 0 180 120" class="birds" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M75 30C51 3 38 23 37 41C16 61 19 94 47 94C77 96 87 66 75 30ZM74 39l15 5-12 6M38 61q-9 24 17 17M39 94l-3 13M57 94l5 13M50 27h1"/><path d="M105 30C129 3 142 23 143 41C164 61 161 94 133 94C103 96 93 66 105 30ZM106 39l-15 5 12 6M142 61q9 24-17 17M141 94l3 13M123 94l-5 13M130 27h-1"/></g></svg></div></div>`,
  `<div class="hero-copy reveal"><h2>遇见你</h2><p>是我最幸运的事</p>${flourish()}</div>`,
  `<div class="story-content"><h2 class="reveal">我们的故事 ♡</h2>${flourish()}${story.shortStory?p(story.shortStory,'story-long reveal'):`<div class="story-stages">${[['calendar','相识','一次偶然的相遇'],['heart','相知','慢慢走进彼此'],['rings','相恋','确认心意 · 携手同行'],['heart','相守','我们决定 · 共度一生']].map(([i,title,copy])=>`<div class="story-row reveal">${icon(i)}<div><h3>${title}</h3><p>${copy}</p></div></div>`).join('')}</div>`}<div class="tiny-hearts">❧ ♡ ❧</div></div>`,
  `<div class="memories"><div class="polaroid memory-1 reveal">${photo('memoryPhoto1','memory1','甜蜜合照')}<span>♥</span></div><div class="polaroid memory-2 reveal">${photo('memoryPhoto2','memory2','夕阳回忆')}<span>♥</span></div><div class="polaroid memory-3 reveal">${photo('memoryPhoto3','memory3','美好瞬间')}<span>♥</span></div><h2 class="memory-title reveal">甜蜜回忆 ♡</h2></div>`,
  `<div class="vow-copy reveal"><h2>因为是你 ♡</h2><p>未来的每一天<br>都充满期待</p>${flourish()}</div>`,
  `<div class="date-content"><h2 class="reveal">婚礼日期</h2><div class="date-digits reveal">${dateParts.length?`<div>${dateParts[0]}</div><strong>${dateParts[1]}.${dateParts[2]}</strong>`:p(w.dateDisplay,'custom-date')}</div>${p(weekday,'weekday reveal')}${p(w.ceremonyTime,'ceremony-time reveal')}</div>`,
  `<div class="schedule-content"><h2 class="reveal">婚礼流程</h2><div class="schedule-list" style="--rows:${Math.max(schedule.length,4)}">${schedule.map((item,i)=>`<div class="schedule-row reveal">${icon(['glass','rings','meal','music'][i%4])}<div class="schedule-spine"><i></i></div><div>${p(item.time,'event-time')}<h3>${esc(item.title)}</h3>${p(item.description,'event-description')}</div></div>`).join('')}</div></div>`,
  `<h2 class="venue-title reveal">婚礼地点 ♡</h2>${m.venuePhoto?photo('venuePhoto','venue','婚礼场地','venue-upload'):''}<div class="venue-info reveal">${w.venueName?`<h3>${icon('pin')}${esc(w.venueName)}</h3>`:''}${p([w.province,w.city,w.district,w.address].filter(Boolean).join(' '),'address')}${m.venueMapImage?photo('venueMapImage','','地图','map-image'):''}</div>`,
  `<div class="notes-content"><h2 class="reveal">♡ 宾客提示 ♡</h2><div class="notes-list">${notes.map(([i,title,copy])=>`<div class="note-row reveal"><div class="note-icon">${icon(i)}</div><div><h3>${title}</h3>${p(copy)}</div></div>`).join('')}</div></div>`,
  `<div class="invitation-content reveal"><h2>诚挚邀请</h2>${p(story.invitationText,'invitation-copy')}${flourish()}<div class="contact">${p(w.contactName)}${p(w.contactPhone)}${p(w.rsvpDeadline?'敬请于 '+w.rsvpDeadline+' 前回复':'')}</div></div>`,
  `<div class="finale-copy reveal"><h2>期待您的到来</h2>${p(story.thankYouText||'与我们共赴这场爱的盛宴 ♡')}${flourish()}</div>`
 ];
 const images=['cover','names','hero','stationery','memory-bg','rings','easel','schedule','venue','stationery','envelope','finale'];
 return bodies.map((body,i)=>{
  const overrides=[m.coverBackground,m.background2,m.couplePortrait,m.background4,m.background5,m.ringPhoto,m.background7,m.background8,m.background9,m.background10,m.background11,m.finalePhoto];
  const background=file(overrides[i])||file(art(images[i]));
  const editKeys=['coverBackground','background2','couplePortrait','background4','background5','ringPhoto','background7','background8','background9','background10','background11','finalePhoto'];
  const seam=position=>`<div class="floral-seam seam-${position}" data-layout-ignore aria-hidden="true"><img src="assets/images/decorations/floral-seam.png" alt=""></div>`;
  return `<div class="scene look-${i+1}"><div class="artwork" data-media-key="${editKeys[i]}" id="SCENEID-art" ${background?`style="background-image:url('${esc(background)}')"`:''}></div><div class="content" id="SCENEID-content">${body}</div>${i>0?seam('top'):''}${i<11?seam('bottom'):''}</div>`;
 });
}
export function makeDemo(config){
 const d=structuredClone(config);
 d.couple.groomName='张云川';d.couple.brideName='林若溪';
 Object.assign(d.wedding,{date:'2026-05-23',dateDisplay:'',weekdayOverride:'星期六 · SAT',venueName:'云栖花园酒店',address:'浙江省杭州市西湖区云栖路88号',dressCode:'建议优雅、正式的服装',parkingInfo:'酒店提供停车位'});
 Object.assign(d.story,{shortStory:'',guestNotes:'您的到来就是\n最好的礼物 ♡',invitationText:'我们诚挚地邀请您\n见证我们的幸福时刻\n与我们一同分享这份喜悦',thankYouText:'与我们共赴这场爱的盛宴 ♡'});
 d.schedule=[['13:30','宾客签到'],['14:00','婚礼仪式'],['18:00','婚宴盛典'],['20:30','宴会结束']].map(([time,title])=>({time,title,description:''}));
 return d;
}
