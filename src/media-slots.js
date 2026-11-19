// Shared by the browser editor and the static video compiler.
const names=['开场封面','新人姓名','新人主视觉','爱情故事','甜蜜回忆','爱的细节','婚礼日期','婚礼流程','婚礼地点','宾客提示','正式邀请','温馨结尾'];
const defaults=['cover','names','hero','stationery','memory-bg','rings','easel','schedule','venue','stationery','envelope','finale'];
export const backgroundSlots=names.map((title,index)=>({
 kind:'background',
 key:index===0?'coverBackground':`background${index+1}`,
 title:`${String(index+1).padStart(2,'0')} · ${title}背景`,
 page:index,
 defaultPath:[0,2,11].includes(index)?`assets/images/layers/${defaults[index]}-background.png`:`assets/images/remake/${defaults[index]}.png`
}));
export const subjectSlots=[
 {kind:'subject',key:'coupleCover',title:'01 · 封面新人（背景保留）',page:0,defaultPath:'assets/images/layers/cover-characters.png'},
 {kind:'subject',key:'couplePortrait',title:'03 · 只换新人（天空和花饰保留）',page:2,defaultPath:'assets/images/layers/hero-characters.png'},
 {kind:'subject',key:'finalePhoto',title:'12 · 结尾新人（烟花背景保留）',page:11,defaultPath:'assets/images/layers/finale-characters.png'}
];
export const photoSlots=[
 {kind:'frame',key:'memoryPhoto1',title:'05 · 左上相框内照片',page:4},
 {kind:'frame',key:'memoryPhoto2',title:'05 · 右侧相框内照片',page:4},
 {kind:'frame',key:'memoryPhoto3',title:'05 · 左下相框内照片',page:4},
 {key:'venuePhoto',title:'场地照片（叠加在地点页）',page:8},
 {key:'venueMapImage',title:'场地地图',page:8},
 {key:'musicFile',title:'背景音乐（MP3 / WAV）'}
];
