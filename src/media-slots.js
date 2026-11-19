// Shared by the browser editor and the static video compiler.
const names=['开场封面','新人姓名','新人主视觉','爱情故事','甜蜜回忆','爱的细节','婚礼日期','婚礼流程','婚礼地点','宾客提示','正式邀请','温馨结尾'];
const defaults=['cover','names','hero','stationery','memory-bg','rings','easel','schedule','venue','stationery','envelope','finale'];
export const backgroundSlots=names.map((title,index)=>({
 key:index===0?'coverBackground':`background${index+1}`,
 title:`${String(index+1).padStart(2,'0')} · ${title}背景`,
 page:index,
 defaultPath:`assets/images/remake/${defaults[index]}.png`
}));
export const photoSlots=[
 {key:'memoryPhoto1',title:'回忆照片 1',page:4},
 {key:'memoryPhoto2',title:'回忆照片 2',page:4},
 {key:'memoryPhoto3',title:'回忆照片 3',page:4},
 {key:'venuePhoto',title:'场地照片（叠加在地点页）',page:8},
 {key:'venueMapImage',title:'场地地图',page:8},
 {key:'musicFile',title:'背景音乐（MP3 / WAV）'}
];
