(() => {
  'use strict';
  const U=WeekendUI,{$,el,date,labels,lineLabels}=U;
  U.renderLibrary=function(){
    const query=$('library-search').value.trim().toLocaleLowerCase(),source=$('source-filter').value,category=$('category-filter').value,status=$('active-filter').value;
    const tasks=U.repo.state.tasks.filter(t=>(source==='all'||t.source===source)&&(category==='all'||t.category===category)&&(status==='all'||t.active===(status==='active'))&&`${t.number} ${t.text} ${t.hint}`.toLocaleLowerCase().includes(query));
    $('library-summary').textContent=`找到 ${tasks.length} / ${U.repo.state.tasks.length} 件小事 · 包括停用任务`;$('library-list').replaceChildren();
    if(!tasks.length){$('library-list').append(el('p','empty-state','还没找到这件小事，试试其他关键词或筛选。'));return;}
    tasks.forEach(task=>{
      const card=el('article','library-card'+(task.active?'':' inactive'));card.dataset.taskId=task.id;
      const art=el('div','library-icon');art.innerHTML=WBIcons.svg(task.icon,'library-svg');
      const body=el('div','library-body');body.append(el('p','task-number',`${task.number} · ${task.source==='builtin'?'内置':'我的任务'} · ${labels[task.category]}`),el('h3','',task.text),el('p','task-description',task.hint||'暂无说明'));
      body.append(el('p','task-created',task.createdAt===null?(task.source==='builtin'?'创建时间未记录（内置任务）':'创建时间未记录（旧版迁入）'):'创建于 '+date(task.createdAt)));
      if(task.updatedAt!==null)body.append(el('p','task-created','更新于 '+date(task.updatedAt)));
      const actions=el('div','library-actions');actions.append(el('span','status-badge'+(task.active?'':' off'),task.active?'已启用':'已停用'));
      if(task.source==='custom'){
        const edit=el('button','text-button','编辑');edit.type='button';edit.setAttribute('aria-label','编辑 '+task.number);edit.addEventListener('click',()=>U.openEditor(task.id));
        const toggle=el('button','text-button',task.active?'停用':'重新启用');toggle.type='button';toggle.setAttribute('aria-label',(task.active?'停用 ':'重新启用 ')+task.number);
        toggle.addEventListener('click',()=>{if(U.persist(s=>Weekend.setActive(s,task.id,!task.active))){U.render();U.toast(task.active?'任务已停用，现有卡片和过去记录继续保留。':'任务已启用，下次抽卡就能相遇。');}});actions.append(edit,toggle);
      }else actions.append(el('span','field-note','内置任务保留原稿'));
      card.append(art,body,actions);$('library-list').append(card);
    });
  };
  for(const id of ['library-search','source-filter','category-filter','active-filter'])$(id).addEventListener(id==='library-search'?'input':'change',()=>{if(U.repo)U.renderLibrary();});
  U.renderHistory=function(){
    $('history-list').replaceChildren();const history=[...U.repo.state.history].reverse();
    if(!history.length){$('history-list').append(el('p','empty-state','这里等着你的第一张旧卡。换卡时，它会自动留下来。'));return;}
    history.forEach(record=>{
      const article=el('article','history-card'),thumb=el('div','history-thumb');thumb.setAttribute('aria-hidden','true');record.card.forEach((t,i)=>{const cell=el('span',record.marks[i]?'marked':'');cell.innerHTML=WBIcons.svg(t.icon,'thumb-icon');thumb.append(cell);});
      const body=el('div','history-body');body.append(el('p','eyebrow','WEEKEND MEMORIES'),el('h3','',date(record.created,true)+' 的探索卡'),el('p','',`盖章 ${record.marks.filter(Boolean).length} / 9 · 连线 ${record.lines.length} 条`),el('p','task-created','归档于 '+date(record.archivedAt)));
      const button=el('button','secondary-button','翻开这张卡 ↗');button.type='button';button.addEventListener('click',()=>openRecord(record));article.append(thumb,body,button);$('history-list').append(article);
    });
  };
  function openRecord(record){
    $('record-title').textContent=date(record.created,true)+' 的周末记录';$('record-meta').textContent=`生成于 ${date(record.created)} · 归档于 ${date(record.archivedAt)}`;$('record-board').replaceChildren();
    const winning=new Set(record.lines.flatMap(i=>Bingo.lines[i]));
    record.card.forEach((t,i)=>{const cell=el('article',`record-cell ${t.category}${record.marks[i]?' completed':''}${winning.has(i)?' on-line':''}`),art=el('div','record-icon');art.innerHTML=WBIcons.svg(t.icon,'library-svg');cell.append(el('p','task-number',`${i+1}. ${t.number}`),art,el('h3','',t.text),el('p','task-description',t.hint),el('p','record-completion',record.marks[i]?(record.completedAt[i]===null?'✓ 已完成 · 时间未记录（旧版）':'✓ 完成于 '+date(record.completedAt[i])):'未完成'));
      if(winning.has(i))cell.append(el('span','line-badge','BINGO 连线'));$('record-board').append(cell);});
    $('record-lines').textContent=record.lines.length?`已完成 ${record.lines.length} 条连线：${record.lines.map(i=>lineLabels[i]).join('、')}`:'这张卡没有完成连线，每一枚印章也都算数。';$('record-dialog').showModal();
  }
})();
