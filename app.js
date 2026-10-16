(() => {
  'use strict';
  const $=id=>document.getElementById(id),W=Weekend,I=WBIcons,R=WeekendRepository;
  const labels={indoor:'室内慢时光',outdoor:'出门透透气',free:'低成本快乐',custom:'我的小灵感'};
  const lineLabels=['横向第 1 行','横向第 2 行','横向第 3 行','纵向第 1 列','纵向第 2 列','纵向第 3 列','左上到右下','右上到左下'];
  let repo=null,toastTimer,view='current';
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const date=(time,short=false)=>time===null?'时间未记录':new Date(time).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',...(short?{}:{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})});
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4500);}
  function notice(message){$('data-notice').hidden=false;$('data-notice').textContent=message;}
  function persist(change){
    if(!repo){toast('存档尚未恢复，请先打开备份与恢复。');return false;}
    try{repo.commit(change);$('save-status').textContent='✓ 任务和记录已保存在此浏览器';return true;}
    catch(error){$('save-status').textContent='⚠ 本次操作未保存，原进度仍保留';toast(error.message.includes('另一个页面')?error.message:'保存失败：'+error.message+' 原进度未改变，可先导出备份。');return false;}
  }
  function showView(next){view=next;for(const name of ['current','library','history'])$(name+'-view').hidden=name!==next;document.querySelectorAll('[data-view]').forEach(button=>{if(button.dataset.view===next)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});if(repo){if(next==='library')U.renderLibrary();if(next==='history')U.renderHistory();}}
  function render(justStamped=-1){
    if(!repo)return;const state=repo.state,c=state.current,wins=c.lines,winningCells=new Set(wins.flatMap(i=>Bingo.lines[i]));
    $('board').replaceChildren();
    c.card.forEach((task,i)=>{
      const button=el('button',`task ${task.category}${c.marks[i]?' done':''}${winningCells.has(i)?' winning':''}${justStamped===i?' just-stamped':''}`);button.type='button';
      const completion=c.marks[i]?`已完成 · ${date(c.completedAt[i])}`:'尚未完成';
      button.setAttribute('aria-pressed',String(c.marks[i]));button.setAttribute('aria-label',`${i+1}. ${task.text}，${task.hint}，${completion}，${c.marks[i]?'点击取消':'点击盖章'}`);button.title=`${task.number} · ${task.hint}\n${completion}`;
      button.innerHTML=`<span class="cell-number">${task.number}</span>${I.svg(task.icon)}<span class="task-title"></span><span class="task-tag"></span>`;
      button.querySelector('.task-title').textContent=task.text;button.querySelector('.task-tag').textContent=c.marks[i]?(c.completedAt[i]===null?'已完成 · 时间未记录':date(c.completedAt[i])):labels[task.category];
      if(c.marks[i]){const stamp=el('span','stamp');stamp.setAttribute('aria-hidden','true');stamp.innerHTML='<small>WEEKEND CLUB</small><b>DONE!</b><span>小事达成</span>';button.append(stamp);}
      button.addEventListener('click',()=>{const previous=repo.state.current.lines;if(!persist(s=>W.toggle(s,i)))return;const now=repo.state.current.lines;render(repo.state.current.marks[i]?i:-1);$('board').children[i].focus({preventScroll:true});if(now.some(n=>!previous.includes(n)))celebrate(now.length);});$('board').append(button);
    });
    $('connections').replaceChildren();wins.forEach(n=>{const line=Bingo.lines[n],a=line[0],b=line[2],node=document.createElementNS('http://www.w3.org/2000/svg','line');Object.entries({x1:(a%3)*100+50,y1:Math.floor(a/3)*100+50,x2:(b%3)*100+50,y2:Math.floor(b/3)*100+50}).forEach(([k,v])=>node.setAttribute(k,v));$('connections').append(node);});
    const count=c.marks.filter(Boolean).length;$('completed-count').textContent=count;$('line-count').textContent=wins.length;$('progress-fill').style.width=`${count/9*100}%`;document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',count);
    $('progress-message').textContent=count===9?'九枚印章，你把小日子过得闪闪发光。':wins.length?'Bingo！快乐已经连成了线，继续慢慢探索。':count?'又收集了一点快乐，按自己的节奏继续。':'第一枚印章，会属于哪件小事呢？';
    $('pool-count').textContent=state.tasks.filter(t=>t.active).length;$('library-total').textContent=state.tasks.length;$('history-total').textContent=state.history.length;
    $('card-date').textContent=date(c.created,true);$('edition').textContent=`VOL. ${String(state.history.length+1).padStart(2,'0')} · WEEKEND`;
    if(view==='library')U.renderLibrary();if(view==='history')U.renderHistory();
  }
  function celebrate(count){toast(`BINGO！已连成 ${count} 条线，小快乐值得大庆祝 ✷`);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<65;i++){const p=el('i','confetti-piece');p.style.cssText=`left:${Math.random()*100}%;background:${['#ca5939','#a3b48c','#e4bd5f','#f7ebca'][i%4]};--drift:${Math.random()*280-140}px;animation-delay:${Math.random()*.5}s;border-radius:${i%3===0?'50%':'1px'}`;$('confetti').append(p);setTimeout(()=>p.remove(),3000);}}
  const U=globalThis.WeekendUI={$,el,date,labels,lineLabels,toast,notice,persist,render,showView,get repo(){return repo;},setRepo(next){repo=next;}};
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('.close-dialog,[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});});
  $('regenerate').addEventListener('click',()=>{if(repo)$('reset-dialog').showModal();});
  $('confirm-reset').addEventListener('click',()=>{if(!persist(s=>W.regenerate(s)))return;render();$('reset-dialog').close();toast('旧卡已存入周末记录，新卡片已就位。');});
  $('help-button').addEventListener('click',()=>{$('howto').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});});
  document.addEventListener('DOMContentLoaded',()=>{try{repo=R.open(localStorage);render();$('save-status').textContent='✓ 任务和记录已保存在此浏览器';if(repo.migrated)notice('旧版存档已迁入：当前任务、盖章和自定义任务都已保留。旧版未记录的创建 / 完成时间如实留空，原 v1 存档也仍然保留。');}catch(error){notice('存档暂不可用：'+error.message+' 请打开“备份与恢复”导出原始存档或选择有效备份。');$('save-status').textContent='⚠ 尚未覆盖任何原始存档';for(const id of ['regenerate','custom-button','library-add']){$(id).disabled=true;$(id).dataset.needsStorage='true';}}});
  window.addEventListener('storage',event=>{if(event.key===R.KEY)notice('另一页面更新了存档。本页不会覆盖它，请刷新后继续操作。');});
})();
