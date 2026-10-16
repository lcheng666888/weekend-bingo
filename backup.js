(() => {
  'use strict';
  const U=WeekendUI,{$,el}=U,W=Weekend,R=WeekendRepository;let pendingImport=null,selection=0;
  function download(text,filename){const blob=new Blob([text],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
  const filename=prefix=>prefix+'-'+new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'})+'.json';
  $('backup-button').addEventListener('click',()=>{selection++;pendingImport=null;$('import-file').value='';$('import-preview').hidden=true;$('backup-status').textContent='';$('export-backup').disabled=!U.repo;$('backup-dialog').showModal();});
  $('export-backup').addEventListener('click',()=>{try{download(W.encode(U.repo.state),filename('weekend-bingo'));$('backup-status').textContent='完整备份已生成，请留意浏览器下载。';}catch(error){$('backup-status').textContent=error.message;}});
  $('export-recovery').addEventListener('click',()=>{try{const raw=localStorage.getItem(R.RECOVERY);if(!raw)throw Error('还没有导入前恢复点。');W.decode(raw);download(raw,filename('weekend-bingo-before-import'));$('backup-status').textContent='恢复点已导出，可通过“选择备份文件”恢复。';}catch(error){$('backup-status').textContent=error.message;}});
  $('export-raw').addEventListener('click',()=>{try{const data={format:'weekend-bingo-raw-recovery',exportedAt:Date.now(),v1:localStorage.getItem(R.LEGACY),v2:localStorage.getItem(R.KEY),beforeImport:localStorage.getItem(R.RECOVERY),beforeImportRaw:localStorage.getItem('weekend-bingo-before-import-raw')};download(JSON.stringify(data,null,2),filename('weekend-bingo-raw'));$('backup-status').textContent='原始存档已打包；此诊断文件保留原文，需要人工检查，不作为普通备份导入。';}catch(error){$('backup-status').textContent='浏览器不允许读取本地存档：'+error.message;}});
  $('import-file').addEventListener('change',async()=>{
    const ticket=++selection;pendingImport=null;$('import-preview').hidden=true;const file=$('import-file').files[0];if(!file)return;
    try{if(file.size>10*1024*1024)throw Error('文件超过 10 MB，请选择较小的 JSON 备份。');const text=await file.text();if(ticket!==selection)return;pendingImport=W.decode(text);$('import-summary').textContent=`${pendingImport.tasks.length} 条任务（${pendingImport.tasks.filter(t=>!t.active).length} 条停用）· ${pendingImport.history.length} 张旧卡 · 当前卡已盖 ${pendingImport.current.marks.filter(Boolean).length} 枚章。`;$('import-preview').hidden=false;$('backup-status').textContent='文件校验通过，尚未修改现有数据。';}
    catch(error){if(ticket===selection)$('backup-status').textContent=error.message;}
  });
  $('confirm-import').addEventListener('click',()=>{
    if(!pendingImport)return;
    try{
      if(U.repo)U.repo.restore(pendingImport);
      else{localStorage.setItem('weekend-bingo-before-import-raw',JSON.stringify({v1:localStorage.getItem(R.LEGACY),v2:localStorage.getItem(R.KEY)}));localStorage.setItem(R.KEY,JSON.stringify(pendingImport));U.setRepo(R.open(localStorage));}
      pendingImport=null;$('import-preview').hidden=true;$('backup-status').textContent='恢复成功；导入前的数据已保存为本地恢复点。';$('data-notice').hidden=true;$('export-backup').disabled=false;document.querySelectorAll('[data-needs-storage]').forEach(b=>b.disabled=false);U.showView('current');U.render();U.toast('备份恢复成功，刷新后仍会保留。');
    }catch(error){$('backup-status').textContent='恢复失败，原数据未覆盖：'+error.message;}
  });
})();
