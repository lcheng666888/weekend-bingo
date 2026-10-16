const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const ctx={};vm.createContext(ctx);
for(const f of ['icons.js','core.js','model.js'])if(fs.existsSync(__dirname+'/'+f))vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const api=()=>{assert.ok(ctx.Weekend,'upgrade model exists');return ctx.Weekend;};
const old=()=>({card:ctx.Bingo.tasks.slice(0,9).map(t=>({...t,icon:'sun'})),marks:[true,true,true,false,false,false,false,false,false],custom:[{id:'custom-1234',text:'阳台听歌',hint:'听一首',icon:'sun',category:'custom'}],created:1234});
test('30 distinct content icons have stable task mappings and no fabricated creation dates',()=>{
  const W=api(),s=W.fresh(10000);assert.equal(s.tasks.length,30);
  assert.equal(new Set(s.tasks.map(t=>ctx.WBIcons.signature(t.icon))).size,30);
  assert.equal(new Set(s.tasks.map(t=>t.icon.subject)).size,30);
  for(const t of s.tasks){assert.equal(t.createdAt,null);assert.match(t.number,/^WB-\d{3}$/);assert.ok(ctx.WBIcons.svg(t.icon).includes('<path'));}
  assert.equal(W.valid(s),true);
});
test('v1 migration retains card order, marks, date and custom tasks; unknown times remain unknown',()=>{
  const W=api(),v1=old();v1.card[8]={...v1.custom[0]};const s=W.migrate(v1,9999);
  assert.equal(s.current.created,1234);assert.deepEqual(Array.from(s.current.marks),v1.marks);
  assert.deepEqual(Array.from(s.current.card,t=>t.text),Array.from(v1.card,t=>t.text));
  assert.equal(s.current.completedAt[0],null);assert.equal(s.tasks.find(t=>t.text==='阳台听歌').createdAt,null);
  assert.equal(s.history.length,0);assert.equal(W.valid(s),true);
  const s2=W.decode(W.encode(s));assert.equal(JSON.stringify(s2),JSON.stringify(s));
});
test('orphan custom task on v1 card migrates as inactive without losing content',()=>{
  const W=api(),v1=old();v1.custom=[];v1.card[0]={id:'orphan',text:'旧卡自己的任务',hint:'别丢',category:'custom',icon:'sun'};
  const s=W.migrate(v1);assert.equal(s.current.card[0].hint,'别丢');assert.equal(s.tasks.find(t=>t.id==='orphan').active,false);
});
test('create, duplicate icon detection, edit snapshot isolation and disable/reactivate',()=>{
  const W=api(),s=W.fresh(1000);const base={text:'给植物画画',hint:'拿起笔',category:'indoor',icon:{subject:'sketch',decoration:'heart'}};
  const t=W.createTask(s,base,2000);assert.equal(t.number,'CU-0001');assert.equal(t.createdAt,2000);
  assert.throws(()=>W.createTask(s,{...base,text:'别的任务'},2100),/图标/);
  W.replace(s,0,t.id);const snapshot=JSON.stringify(s.current.card[0]);
  W.editTask(s,t.id,{...base,text:'给植物画张像'},3000);assert.equal(JSON.stringify(s.current.card[0]),snapshot);
  W.setActive(s,t.id,false);assert.equal(s.tasks.find(x=>x.id===t.id).active,false);
  for(let i=0;i<30;i++)assert.ok(!W.newCard(s,4000+i).card.some(x=>x.id===t.id));
  W.setActive(s,t.id,true);assert.equal(s.tasks.find(x=>x.id===t.id).active,true);assert.equal(W.valid(s),true);
});
test('completion cancellation clears time and line; regeneration archives immutable full snapshots',()=>{
  const W=api(),s=W.fresh(1000);[0,1,2].forEach(i=>W.toggle(s,i,2000+i));assert.equal(s.current.lines.length,1);
  assert.equal(s.current.completedAt[1],2001);W.toggle(s,1,3000);assert.equal(s.current.completedAt[1],null);assert.equal(s.current.lines.length,0);
  const previous=JSON.stringify(s.current);W.regenerate(s,4000);
  assert.equal(s.history.length,1);assert.equal(s.history[0].archivedAt,4000);
  const {archivedAt,...archived}=s.history[0];assert.equal(JSON.stringify(archived),previous);
  W.toggle(s,0,5000);assert.equal(JSON.stringify(s.history[0]),JSON.stringify({...archived,archivedAt}));
  assert.equal(W.valid(s),true);
});
test('backup roundtrip preserves complete records and rejects corrupt or executable icon content',()=>{
  const W=api(),s=W.migrate(old());W.regenerate(s,9000);const text=W.encode(s);assert.equal(JSON.stringify(W.decode(text)),JSON.stringify(s));
  const bad=JSON.parse(text);bad.state.current.completedAt[0]=123;assert.throws(()=>W.decode(JSON.stringify(bad)));
  bad.state=s;bad.state.tasks[0].icon={subject:'<script>',decoration:'none'};assert.throws(()=>W.decode(JSON.stringify(bad)));
  assert.throws(()=>W.decode('{'));assert.throws(()=>W.decode('{"format":"wrong"}'));
});
test('past icon geometry stays reserved for its task after an icon edit',()=>{
  const W=api(),s=W.fresh(1000),data={text:'图标保留测试',hint:'',category:'free',icon:{subject:'sketch',decoration:'heart'}};
  const t=W.createTask(s,data,2000);W.replace(s,0,t.id);W.regenerate(s,3000);
  W.editTask(s,t.id,{...data,icon:{subject:'sketch',decoration:'star'}},4000);
  assert.throws(()=>W.createTask(s,{...data,text:'另一件事'},5000),/图标/);
  assert.equal(W.valid(s),true);
});
test('all SVG files match the exact task geometry and every composer combination is distinct',()=>{
  const W=api(),catalog=JSON.parse(fs.readFileSync(__dirname+'/icons/catalog.json','utf8'));
  for(const task of W.builtins()){
    const item=catalog.find(t=>t.number===task.number);assert.equal(item.id,task.id);assert.equal(item.name,task.text);
    const svg=fs.readFileSync(__dirname+'/icons/'+item.file,'utf8');assert.equal(svg,ctx.WBIcons.svg(task.icon).replace('currentColor','#53654b'));
  }
  const signatures=[];for(const subject of ctx.WBIcons.subjects)for(const decoration of ctx.WBIcons.decorations)signatures.push(ctx.WBIcons.signature({subject:subject.id,decoration:decoration.id}));
  assert.equal(signatures.length,270);assert.equal(new Set(signatures).size,270);
});
