(() => {
  'use strict';
  const U=WeekendUI,{$}=U,W=Weekend,I=WBIcons;let editingId=null;
  I.subjects.forEach(s=>$('icon-subject').add(new Option(s.label,s.id)));I.decorations.forEach(d=>$('icon-decoration').add(new Option(d.label,d.id)));
  const selectedIcon=()=>({subject:$('icon-subject').value,decoration:$('icon-decoration').value});
  function previewIcon(){const spec=selectedIcon();$('icon-preview').innerHTML=I.svg(spec,'composer-icon');const duplicate=W.conflict(U.repo.state,spec,editingId);$('icon-collision').textContent=duplicate?`与 ${duplicate.number}「${duplicate.text}」重复，请修改主体或装饰。`:'这个组合尚未被其他任务使用，可以保存。';$('icon-collision').className=duplicate?'collision':'unique-icon';$('save-task').disabled=!!duplicate;}
  function setIcon(spec){$('icon-subject').value=spec.subject;$('icon-decoration').value=spec.decoration;previewIcon();}
  $('icon-subject').addEventListener('change',previewIcon);$('icon-decoration').addEventListener('change',previewIcon);
  $('find-free-icon').addEventListener('click',()=>{try{setIcon(W.availableIcon(U.repo.state,$('icon-subject').value));}catch(error){$('form-error').textContent=error.message;}});
  function updateReplaceNote(){$('replace-note').textContent=$('task-target').value==='pool'?'保存后进入任务库和抽签池。':'会替换所选格子，并清除该格完成状态和时间。已有周末记录不会改变。';}
  $('task-target').addEventListener('change',updateReplaceNote);
  U.openEditor=function(id=null){
    if(!U.repo)return;editingId=id;const task=id?U.repo.state.tasks.find(t=>t.id===id):null;$('custom-form').reset();$('form-error').textContent='';
    $('custom-title').textContent=task?'修改这件小事。':'你的周末，你来出题。';$('editor-note').textContent=task?`${task.number} · 编号和创建时间保留；当前卡和历史卡保留原稿，修改用于未来抽卡。`:'写一件小事，再为它组合一个专属图标。';$('target-field').hidden=!!task;
    if(task){$('task-text').value=task.text;$('task-hint').value=task.hint;$('task-category').value=task.category;setIcon(task.icon);}
    else{const select=$('task-target');select.replaceChildren(new Option('加入抽签池，下次随机相遇','pool'));U.repo.state.current.card.forEach((t,i)=>select.add(new Option(`替换第 ${i+1} 格 · ${t.text}`,String(i))));try{setIcon(W.availableIcon(U.repo.state,'sketch'));}catch(error){$('form-error').textContent=error.message;}updateReplaceNote();}
    $('custom-dialog').showModal();$('task-text').focus();
  };
  $('custom-button').addEventListener('click',()=>U.openEditor());$('library-add').addEventListener('click',()=>U.openEditor());
  $('custom-form').addEventListener('submit',event=>{
    event.preventDefault();const data={text:$('task-text').value.trim(),hint:$('task-hint').value.trim(),category:$('task-category').value,icon:selectedIcon()};
    try{const test=W.clone(U.repo.state);if(editingId)W.editTask(test,editingId,data);else{const task=W.createTask(test,data);if($('task-target').value!=='pool')W.replace(test,Number($('task-target').value),task.id);}}
    catch(error){$('form-error').textContent=error.message;return;}
    if(!U.persist(s=>{if(editingId)W.editTask(s,editingId,data);else{const task=W.createTask(s,data);if($('task-target').value!=='pool')W.replace(s,Number($('task-target').value),task.id);}}))return;
    $('custom-dialog').close();U.render();U.toast(editingId?'任务已更新，当前卡和历史卡保留原稿。':'任务与专属图标已保存。');
  });
})();
