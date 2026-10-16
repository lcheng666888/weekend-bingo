(function(root){
  'use strict';
  const KEY='weekend-bingo-v2',LEGACY='weekend-bingo-v1',RECOVERY='weekend-bingo-before-import-v2';
  function open(storage){
    let raw=storage.getItem(KEY),state,migrated=false;
    if(raw!==null){try{state=JSON.parse(raw);}catch{throw Error('新版存档无法解析。原数据未覆盖，请导出原始存档后再恢复备份。');}if(!Weekend.valid(state))throw Error('新版存档未通过检查。原数据未覆盖，请先导出原始存档。');}
    else{const legacy=storage.getItem(LEGACY);if(legacy!==null){let data;try{data=JSON.parse(legacy);}catch{throw Error('旧版存档无法解析，原数据未覆盖。');}state=Weekend.migrate(data);migrated=true;}else state=Weekend.fresh();raw=JSON.stringify(state);storage.setItem(KEY,raw);}
    function commit(change){
      if(storage.getItem(KEY)!==raw)throw Error('另一个页面更新了存档，请刷新后重试，避免覆盖进度。');
      const next=Weekend.clone(state);change(next);if(!Weekend.valid(next))throw Error('数据完整性检查失败，本次操作未保存。');
      const text=JSON.stringify(next);storage.setItem(KEY,text);raw=text;state=next;return state;
    }
    function restore(candidate){
      if(!Weekend.valid(candidate))throw Error('备份校验失败。');
      storage.setItem(RECOVERY,Weekend.encode(state));
      return commit(next=>{for(const k of Object.keys(next))delete next[k];Object.assign(next,Weekend.clone(candidate));});
    }
    return {get state(){return state;},migrated,commit,restore};
  }
  root.WeekendRepository={open,KEY,LEGACY,RECOVERY};
})(globalThis);
