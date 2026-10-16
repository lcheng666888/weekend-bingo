(function(root){
  const groups={
    indoor:[['给自己做一杯特调','把冰箱里的水果加进气泡水。','cup'],['读完薄薄的一章书','找个舒服的角落，只读一章。','book'],['给房间换个小角落','挪一盏灯，或给桌面留点空白。','home'],['写一封不必寄出的信','写给未来的自己，或想念的人。','mail'],['用三首歌的时间发呆','让脑袋也过一个小周末。','music'],['做一道没试过的早餐','简单一点，也可以很有仪式感。','cup'],['画下窗外的一小块天','不用画得像，记下今天就好。','sun'],['给一件旧物拍张肖像','为陪你很久的东西留个纪念。','camera'],['用手边材料做张书签','一张包装纸，也能有新工作。','book'],['为喜欢的人列一张歌单','选五首歌，藏进一点心意。','music']],
    outdoor:[['走一条没走过的小路','在熟悉的街区，拐一个新的弯。','walk'],['找一棵树，站着看一会儿','看看叶子，听听风。','leaf'],['收集三种颜色的天空','早一点、晚一点，都抬头看看。','sun'],['在公园坐满十五分钟','让路过的云替你安排时间。','leaf'],['给街角的小花拍张照','不摘走，只带回一张照片。','camera'],['走到附近的一座小桥','看看水，也看看来往的人。','walk'],['带一杯水去看日落','今天的落幕，值得亲自到场。','sun'],['逛一逛附近的菜市场','找一种从没留意过的食材。','bag'],['在户外寻找五种圆形','井盖、车轮，还有什么？','camera'],['去一次步行可达的小店','看看橱窗，也可以只逛不买。','bag']],
    free:[['给很久没联系的人问个好','一句“最近怎么样”就够了。','mail'],['翻出十张旧照片','挑一张，说说那天的故事。','camera'],['整理手机里的二十张截图','给小小的数字角落透口气。','home'],['认真听完一张专辑','放下切歌键，跟着它慢慢走。','music'],['找一本书里的好句子','抄下来，当作今天的签语。','book'],['用五分钟伸展身体','抬抬肩膀，给自己一点松弛。','walk'],['用家里食材拼一份小点心','不必采购，看看能变出什么。','cup'],['观察十分钟窗外的生活','记住一个平时错过的细节。','sun'],['记下本周三个开心瞬间','再小的好事也算数。','mail'],['给自己放一场客厅电影','关灯、倒水，今晚正式开场。','home']]
  };
  const tasks=Object.entries(groups).flatMap(([category,items])=>items.map(([text,hint,icon],i)=>({id:category+i,text,hint,icon,category})));
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function draw(pool){const unique=[...new Map(pool.map(t=>[t.text,t])).values()];const chosen=['indoor','outdoor','free'].map(c=>shuffle(unique.filter(t=>t.category===c))[0]).filter(Boolean);return shuffle([...chosen,...shuffle(unique.filter(t=>!chosen.includes(t))).slice(0,9-chosen.length)]);}
  const wins=marks=>lines.map((line,i)=>line.every(n=>marks[n])?i:-1).filter(i=>i>=0);
  const taskValid=t=>t&&typeof t.text==='string'&&t.text.trim().length>0&&t.text.length<=50&&['indoor','outdoor','free','custom'].includes(t.category)&&typeof t.hint==='string';
  const valid=s=>!!(s&&Array.isArray(s.card)&&s.card.length===9&&s.card.every(taskValid)&&new Set(s.card.map(t=>t.text)).size===9&&Array.isArray(s.marks)&&s.marks.length===9&&s.marks.every(v=>typeof v==='boolean')&&Array.isArray(s.custom)&&s.custom.every(taskValid)&&Number.isFinite(s.created));
  root.Bingo={tasks,draw,wins,lines,valid};
})(globalThis);
