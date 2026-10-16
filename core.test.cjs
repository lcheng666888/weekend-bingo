const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={}; vm.createContext(context);
const source=fs.existsSync(__dirname+'/core.js')?fs.readFileSync(__dirname+'/core.js','utf8'):'';
vm.runInContext(source,context);
test('30 original activities, nine unique draws with indoor and outdoor tasks',()=>{
  assert.ok(context.Bingo,'Bingo core is available');
  assert.equal(context.Bingo.tasks.length,30);
  for(let i=0;i<100;i++){
    const card=context.Bingo.draw(context.Bingo.tasks);
    assert.equal(card.length,9);assert.equal(new Set(card.map(t=>t.text)).size,9);
    assert.ok(card.some(t=>t.category==='indoor'));assert.ok(card.some(t=>t.category==='outdoor'));
  }
});
test('all eight winning lines and cancellation',()=>{
  assert.ok(context.Bingo,'Bingo core is available');
  for(const line of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]){
    const marks=Array(9).fill(false);line.forEach(i=>marks[i]=true);
    assert.equal(context.Bingo.wins(marks).length,1);
    marks[line[0]]=false;assert.equal(context.Bingo.wins(marks).length,0);
  }
  assert.equal(context.Bingo.wins(Array(9).fill(true)).length,8);
});
test('saved state validation rejects malformed data',()=>{
  assert.ok(context.Bingo,'Bingo core is available');
  const state={card:context.Bingo.draw(context.Bingo.tasks),marks:Array(9).fill(false),custom:[],created:Date.now()};
  assert.equal(context.Bingo.valid(state),true);
  assert.equal(context.Bingo.valid({...state,marks:[false]}),false);
  assert.equal(context.Bingo.valid({...state,card:Array(9).fill(state.card[0])}),false);
  assert.equal(context.Bingo.valid(null),false);
});
