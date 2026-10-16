/* Offline hand-drawn vector kit. Geometry is the identity; color never defines uniqueness. */
(function(root){
  'use strict';
  const subjects=[
    ['fizz','水果气泡特调','M15 18l3 24h15l4-24zM27 18 32 5h7M13 18h26M20 27h11M22 33h7M10 13a6 6 0 1 1 12 0M8 13h14M11 9l7 7M19 8l-8 8M37 10h.1M41 24h.1'],
    ['chapter','翻开的一章','M24 13Q13 8 5 12v28q11-4 19 1 8-5 19-1V12q-8-4-19 1v28M10 18l9 1M10 23l9 1M29 18l8-1M29 23l8-1M31 10V4h7v14l-3-3-4 3'],
    ['room','挪灯的小角落','M6 41h37M9 39V23h20v16M7 23h25M13 27h11M17 30v8M26 17l5-12h6l5 12zM34 18v20M29 39h11M4 8l6 3m-6 6 5-2'],
    ['letter','未寄出的信','M6 21h35v22H6zM6 22l17 12 18-12M6 43l12-13m23 13L28 30M13 24V6h22v19M18 12h12m-12 5h9M19 7l2-3 3 2 3-2 3 3'],
    ['daydream','三首歌与云','M12 26c-9 0-9-13 0-13 1-11 16-11 19-3 12-3 17 13 5 16zM10 36l2-2m8 6 2-2m7-8V16l8-2v12m-8-5 8-2m-8 11c-5-3-9 4-4 5 3 1 4-2 4-5m8-4c-5-3-9 4-4 5 3 1 4-2 4-5'],
    ['breakfast','煎蛋与吐司','M4 24q0-6 6-6h6q6 0 6 6v17H4zM7 23h12M28 20c-8 1-9 15-1 17 3 6 15 3 16-3 7-6 0-16-5-16-4-5-9-3-10 2zM37 27a4 4 0 1 1-8 0 4 4 0 0 1 8 0M7 12l1-5m7 6 2-5'],
    ['sketch','窗外天空速写','M6 8h25v31H6zM9 27l7-8 5 5 6-10M10 12h.1M34 36l-4 6 6-2L44 9l-6-2zM38 12l5 2M11 43h15M12 33h12'],
    ['heirloom','旧物的肖像','M8 10h27v32H8zM12 14h19v24H12zM17 25h9v4a4 4 0 0 1-8 0v-4m9 0h2v5h-3M18 19l2-2m4 3 2-2M36 5v6m-3-3h6M39 29l4-3m-4 9 4 2'],
    ['bookmark','纸片书签','M13 4h22v39L24 35l-11 8zM20 4v10m4-10v8M20 20l4-3 4 3-1 5h-6zM6 16l4 2m-5 8 5-2M38 20l5-2'],
    ['playlist','送出的歌单','M9 4h27v39H9zM15 12h15M15 17h7M24 25v-6l8-2v12M24 25c-7-3-8 6-3 5 3 0 3-3 3-5M15 36h13M3 12c-3-4 3-7 4-3 3-4 7 1 3 3l-4 3z'],
    ['path','小路新转弯','M10 44c-4-10 22-9 16-20S15 14 24 4M26 44c-5-9 16-10 13-20S25 12 36 4M5 30h7m-3-3v6M7 12l3-5 3 5zM17 18h3M38 39h5m-2-3v5'],
    ['tree','一棵树与风','M21 29v15m6-15v15M16 42h17M12 30c-10-3-6-14 0-15-1-12 16-15 20-5 12 0 16 17 6 22-4 2-8 0-10-3-5 5-10 4-16 1zM24 30V20m0 5-6-5m6 2 7-6M3 7h8m-7 5h4'],
    ['sky','三个时刻的天','M4 7h12v12H4zM20 7h12v12H20zM36 7h9v12h-9zM7 13h6m-3-3v6M24 10c-5 6 3 9 5 4M39 11l3 4m-3 0 3-4M5 31c-3-6 5-10 8-6 3-9 15-5 13 1 9-4 15 8 5 10H9M17 43h20'],
    ['bench','公园长椅与钟','M6 19h30v6H6zM6 28h32v5H6zM11 33v9m22-9v9M10 12v7m23-7v7M44 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0M36 4v5l4 2M2 8l3 2'],
    ['flower-camera','为小花拍照','M4 24h24v17H4zM8 24l3-4h8l3 4M22 32a6 6 0 1 1-12 0 6 6 0 0 1 12 0M35 42V21m0 13 8-5m-8 8-5-3M38 15c9-6 3-14-3-7-5-9-13-2-6 4-10 2-4 12 2 7 1 9 10 6 7-4zM38 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],
    ['bridge','小桥流水','M4 28q20-27 40 0M4 34q20-26 40 0M8 24v8m8-14v6m8-9v7m8-4v6m8 0v8M3 39q5-4 10 0t10 0 10 0 10 0M7 44q5-3 10 0m8 0q5-3 10 0'],
    ['sunset','水杯与落日','M21 28a10 10 0 0 1 20 0M17 28h28M30 10V5m-13 13-4-4m28 4 4-4M22 34h19M25 39h12M3 23h13l-2 20H5zM5 29h9M7 16l-1-5m6 6 2-5'],
    ['market','菜市场的菜篮','M5 23h38l-5 20H10zM12 23q0-22 12-18 12-4 12 18M16 28l2 10m7-10v10m9-10-2 10M17 23l-3-9 7 1 4 8M28 23c-5-11 5-16 7-7l-3 7M5 17l3-2'],
    ['circles','五种圆形','M15 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0M10 12h.1M42 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0M30 27a9 9 0 1 1-18 0 9 9 0 0 1 18 0M27 27a6 6 0 1 1-12 0 6 6 0 0 1 12 0M12 40a5 5 0 1 1-10 0 5 5 0 0 1 10 0M46 39a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
    ['shop','街边小店','M6 18l4-12h29l5 12M6 18v4q4 6 8 0 4 6 8 0 4 6 8 0 4 6 8 0 4 5 6 0v-4H6M10 26v17h29V26M15 30h9v13m5-13h6v6h-6zM18 6l-4 12m13-12-5 12m13-12-5 12'],
    ['hello','问好的对话泡','M4 6h29v20H14l-8 6v-6H4zM12 14h.1m6 0h.1m6 0h.1M35 18h9v23h-5v5l-7-5H20v-9M26 34q6 6 12 0'],
    ['photos','旧照片小叠','M4 11l27-6 7 31-27 6zM12 11h29v29H12zM16 15h21v18H16zM16 30l7-8 6 5 4-4 4 7M31 19h.1M18 37h12'],
    ['screenshots','手机截图整理','M12 3h24v42H12zM20 7h8M22 41h4M16 13h7v8h-7zM27 13h5v8h-5zM16 25h7v9h-7zM29 29l3 3 9-10M5 13l-3 3 3 3M6 30H2'],
    ['record','一整张唱片','M4 8h39v34H4zM38 25a14 14 0 1 1-28 0 14 14 0 0 1 28 0M28 25a4 4 0 1 1-8 0 4 4 0 0 1 8 0M24 15a10 10 0 0 0-10 10M24 35a10 10 0 0 0 10-10M7 5h18'],
    ['quote','书里的好句子','M6 9h35v34H6zM12 5h25M12 16h7v6q0 5-6 6m-1-12v6h7M27 16h7v6q0 5-6 6m-1-12v6h7M12 33h23m-23 4h16M39 4l4-2m-1 7h4'],
    ['stretch','舒展身体','M28 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M24 15v13M24 18 10 9 5 3M24 18l14-9 5-6M24 28l-9 15M24 28l9 15M5 23q-4 5 0 10m-2-9 2-1 2 2M43 23q4 5 0 10'],
    ['snack','手边小点心','M3 37q21 9 42 0M9 36l3-15h22l5 15zM12 21q7 4 12 0 6 4 10 0M14 27h20M20 18l4-10 6 10M24 8V3M6 13l4-3m28 3-3-3M19 33h.1m7-2h.1m5 3h.1'],
    ['window','窗外的小生活','M6 5h36v38H6zM10 9h28v29H10zM24 9v29M10 24h28M4 43h40M15 14l4 3 3-3m7 2 3 2 3-2M13 35l4-5 5 5M27 35v-6h7v6M5 5l-3 12m40-12 4 12'],
    ['moments','三个开心瞬间','M9 4h31v40H9zM6 11h6m-6 8h6m-6 8h6m-6 8h6M17 13c-4-6 5-9 6-3 4-5 10 0 4 4l-5 4zM17 23h17M17 28h13M17 33h16M17 38h10'],
    ['cinema','客厅电影放映','M5 11h38v23H5zM9 15h30v15H9zM21 18l8 5-8 5zM24 34v7M15 42h18M3 7l6-4m30 4 5-4M3 40l2-3m36 3 3-3']
  ].map(([id,label,path])=>({id,label,path}));
  const decorations=[
    ['none','无装饰',''],['star','小星星','M49 3l2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3 5-1z'],
    ['heart','小爱心','M47 6c-5-7-12 0-5 5l6 5 6-6c5-7-4-10-7-4z'],
    ['sprout','小枝叶','M44 17 54 3M47 12c-8 0-8-7-4-7 5 0 4 7 4 7M50 8c0-7 8-8 7-3 0 4-7 3-7 3'],
    ['rays','闪光线','M48 1v6m8-3-4 5m9 3-7 1'],['dots','三颗圆点','M47 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M56 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0M55 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],
    ['moon','弯弯月亮','M53 2c-12 1-13 16 0 17-7-4-7-12 0-17z'],['ribbon','小蝴蝶结','M48 9c-16-14-11 14 0 0 13-14 16 13 0 0M46 11l-4 9m8-9 4 9'],
    ['halo','小圆环','M57 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0M49 5v8m-4-4h8']
  ].map(([id,label,path])=>({id,label,path}));
  const valid=spec=>!!(spec&&subjects.some(s=>s.id===spec.subject)&&decorations.some(d=>d.id===spec.decoration));
  function signature(spec){if(!valid(spec))return '';return subjects.find(s=>s.id===spec.subject).path+'|'+decorations.find(d=>d.id===spec.decoration).path;}
  function svg(spec,css='task-icon'){if(!valid(spec))return '';const subject=subjects.find(s=>s.id===spec.subject),decoration=decorations.find(d=>d.id===spec.decoration);return `<svg xmlns="http://www.w3.org/2000/svg" class="${css}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="translate(6 9)"><path d="${subject.path}"/></g>${decoration.path?`<path d="${decoration.path}"/>`:''}</svg>`;}
  root.WBIcons={subjects,decorations,valid,signature,svg};
})(globalThis);
