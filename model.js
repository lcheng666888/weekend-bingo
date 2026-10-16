(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const timestamp=n=>Number.isFinite(n)&&n>=0&&n<=8640000000000000;
  const optionalTime=n=>n===null||timestamp(n);
  const categories=['indoor','outdoor','free','custom'];
  const uid=prefix=>prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
  const builtins=()=>Bingo.tasks.map((t,i)=>({...t,number:'WB-'+String(i+1).padStart(3,'0'),source:'builtin',active:true,createdAt:null,updatedAt:null,icon:{subject:WBIcons.subjects[i].id,decoration:'none'}}));
  function newCard(s,now=Date.now()){
    const card=Bingo.draw(s.tasks.filter(t=>t.active));if(card.length!==9)throw Error('至少需要 9 条不同的启用任务。');
    return {id:uid('card'),created:now,card:clone(card),marks:Array(9).fill(false),completedAt:Array(9).fill(null),lines:[]};
  }
  function fresh(now=Date.now()){const s={version:2,tasks:builtins(),current:null,history:[],nextCustomNumber:1};s.current=newCard(s,now);return s;}
  function allTaskVersions(s){return [...s.tasks,...(s.current?.card||[]),...(s.history||[]).flatMap(c=>c.card)];}
  function conflict(s,icon,excludeId){const sig=WBIcons.signature(icon);return allTaskVersions(s).find(t=>t.id!==excludeId&&WBIcons.signature(t.icon)===sig);}
  function availableIcon(s,preferred='sketch'){
    for(const decoration of WBIcons.decorations)for(const subject of [preferred,...WBIcons.subjects.map(x=>x.id).filter(x=>x!==preferred)]){const icon={subject,decoration:decoration.id};if(WBIcons.valid(icon)&&!conflict(s,icon))return icon;}
    throw Error('所有图标组合已用完，请修改已有任务或扩展本地图标集。');
  }
  function checkFields(s,data,id){
    if(typeof data.text!=='string'||!data.text.trim()||data.text.trim().length>50)throw Error('任务名称需为 1–50 字。');
    if(typeof data.hint!=='string'||data.hint.length>300)throw Error('说明最多 300 字。');
    if(!categories.includes(data.category))throw Error('请选择任务类别。');
    if(s.tasks.some(t=>t.id!==id&&t.text.trim()===data.text.trim()))throw Error('已有同名任务，请换个名称。');
    if(!WBIcons.valid(data.icon))throw Error('请选择有效的本地图标。');
    const duplicate=conflict(s,data.icon,id);if(duplicate)throw Error(`图标与 ${duplicate.number}「${duplicate.text}」重复，请修改主体或装饰。`);
  }
  function createTask(s,data,now=Date.now()){
    checkFields(s,data);const task={id:uid('custom'),number:'CU-'+String(s.nextCustomNumber++).padStart(4,'0'),text:data.text.trim(),hint:data.hint.trim(),category:data.category,source:'custom',icon:clone(data.icon),active:true,createdAt:now,updatedAt:null};s.tasks.push(task);return task;
  }
  function editTask(s,id,data,now=Date.now()){
    const task=s.tasks.find(t=>t.id===id);if(!task||task.source!=='custom')throw Error('仅可编辑自定义任务。');checkFields(s,data,id);Object.assign(task,{text:data.text.trim(),hint:data.hint.trim(),category:data.category,icon:clone(data.icon),updatedAt:now});return task;
  }
  function setActive(s,id,active){const task=s.tasks.find(t=>t.id===id);if(!task||task.source!=='custom')throw Error('仅可停用自定义任务。');task.active=!!active;}
  function toggle(s,i,now=Date.now()){if(!Number.isInteger(i)||i<0||i>8)throw Error('格子无效。');const c=s.current;c.marks[i]=!c.marks[i];c.completedAt[i]=c.marks[i]?now:null;c.lines=Bingo.wins(c.marks);}
  function replace(s,i,id){const task=s.tasks.find(t=>t.id===id);if(!task||!task.active)throw Error('任务未启用。');if(s.current.card.some((t,n)=>n!==i&&(t.id===id||t.text===task.text)))throw Error('当前卡片已有这件小事。');s.current.card[i]=clone(task);s.current.marks[i]=false;s.current.completedAt[i]=null;s.current.lines=Bingo.wins(s.current.marks);}
  function regenerate(s,now=Date.now()){const next=newCard(s,now);s.history.push({...clone(s.current),archivedAt:now});s.current=next;}
  function migrate(v1,now=Date.now()){
    if(!Bingo.valid(v1))throw Error('旧版存档格式无效，原数据已保留，请先导出原始数据。');
    const s=fresh(now);const oldIconMap={sun:'sky',cup:'fizz',book:'chapter',camera:'photos',music:'playlist',mail:'letter',home:'room',walk:'path',leaf:'tree',bag:'market'};
    function register(old,active){
      let known=s.tasks.find(t=>t.id===old.id&&t.text===old.text)||s.tasks.find(t=>t.source==='builtin'&&t.text===old.text);
      if(known)return known;
      known=s.tasks.find(t=>t.source==='custom'&&t.id===old.id&&t.text===old.text);if(known)return known;
      const id=typeof old.id==='string'&&old.id&&!s.tasks.some(t=>t.id===old.id)?old.id:uid('legacy');
      const task={id,number:'CU-'+String(s.nextCustomNumber++).padStart(4,'0'),text:old.text,hint:old.hint,category:old.category,source:'custom',icon:availableIcon(s,oldIconMap[old.icon]||'sketch'),active,createdAt:null,updatedAt:null};s.tasks.push(task);return task;
    }
    v1.custom.forEach(t=>register(t,true));
    s.current={id:uid('legacy-card'),created:v1.created,card:v1.card.map(t=>{const registered=register(t,false);return {...clone(registered),text:t.text,hint:t.hint,category:t.category};}),marks:[...v1.marks],completedAt:Array(9).fill(null),lines:Bingo.wins(v1.marks)};
    if(!valid(s))throw Error('旧版数据需要检查，原数据已保留。');return s;
  }
  function taskValid(t){return !!(t&&typeof t.id==='string'&&t.id.length>0&&t.id.length<=160&&typeof t.number==='string'&&/^(WB-\d{3}|CU-\d{4,})$/.test(t.number)&&typeof t.text==='string'&&t.text.trim().length>0&&t.text.length<=50&&typeof t.hint==='string'&&t.hint.length<=300&&categories.includes(t.category)&&['builtin','custom'].includes(t.source)&&typeof t.active==='boolean'&&WBIcons.valid(t.icon)&&optionalTime(t.createdAt)&&optionalTime(t.updatedAt));}
  function cardValid(c,taskIds){
    return !!(c&&typeof c.id==='string'&&c.id.length>0&&timestamp(c.created)&&Array.isArray(c.card)&&c.card.length===9&&c.card.every(t=>taskValid(t)&&taskIds.has(t.id))&&new Set(c.card.map(t=>t.id)).size===9&&new Set(c.card.map(t=>t.text)).size===9&&Array.isArray(c.marks)&&c.marks.length===9&&c.marks.every(x=>typeof x==='boolean')&&Array.isArray(c.completedAt)&&c.completedAt.length===9&&c.completedAt.every((x,i)=>optionalTime(x)&&(c.marks[i]||x===null)&&(x===null||x>=c.created))&&Array.isArray(c.lines)&&JSON.stringify(c.lines)===JSON.stringify(Bingo.wins(c.marks)));
  }
  function valid(s){
    try{
      if(!s||s.version!==2||!Array.isArray(s.tasks)||s.tasks.length<30||!s.tasks.every(taskValid)||!Array.isArray(s.history)||!Number.isSafeInteger(s.nextCustomNumber)||s.nextCustomNumber<1)return false;
      const ids=new Set(s.tasks.map(t=>t.id));if(ids.size!==s.tasks.length||new Set(s.tasks.map(t=>t.number)).size!==s.tasks.length||new Set(s.tasks.map(t=>WBIcons.signature(t.icon))).size!==s.tasks.length)return false;
      const originals=builtins();if(originals.some(b=>!s.tasks.some(t=>t.id===b.id&&t.number===b.number&&t.source==='builtin'&&t.active&&t.createdAt===null&&t.updatedAt===null&&t.text===b.text&&t.hint===b.hint&&t.category===b.category&&WBIcons.signature(t.icon)===WBIcons.signature(b.icon))))return false;
      if(s.tasks.filter(t=>t.source==='builtin').length!==30)return false;
      if(s.tasks.some(t=>t.source==='custom'&&(!/^CU-\d{4,}$/.test(t.number)||Number(t.number.slice(3))>=s.nextCustomNumber)))return false;
      if(!cardValid(s.current,ids)||!s.history.every(c=>cardValid(c,ids)&&timestamp(c.archivedAt)&&c.archivedAt>=c.created&&c.completedAt.every(t=>t===null||t<=c.archivedAt)))return false;
      const owners=new Map();for(const task of allTaskVersions(s)){const sig=WBIcons.signature(task.icon);if(owners.has(sig)&&owners.get(sig)!==task.id)return false;owners.set(sig,task.id);const master=s.tasks.find(t=>t.id===task.id);if(master.number!==task.number||master.source!==task.source||master.createdAt!==task.createdAt)return false;}
      if(new Set([s.current.id,...s.history.map(c=>c.id)]).size!==s.history.length+1)return false;
      return true;
    }catch{return false;}
  }
  function encode(s){if(!valid(s))throw Error('存档未通过完整性检查，无法导出。');return JSON.stringify({format:'weekend-bingo-backup',version:2,exportedAt:Date.now(),state:s},null,2);}
  function decode(text){let data;try{data=JSON.parse(text);}catch{throw Error('文件不是有效 JSON。');}if(data&&data.format==='weekend-bingo-backup'&&data.version===2&&valid(data.state))return clone(data.state);if(Bingo.valid(data))return migrate(data);throw Error('备份格式或数据校验失败，现有进度未改变。');}
  root.Weekend={clone,fresh,newCard,conflict,availableIcon,createTask,editTask,setActive,toggle,replace,regenerate,migrate,valid,encode,decode,builtins};
})(globalThis);
